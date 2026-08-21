"""ROS services for ChArUco capture, hand-eye solve and arm registration."""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
import threading
import time
from typing import Any

import cv2
from diagnostic_msgs.msg import DiagnosticArray, DiagnosticStatus, KeyValue
import numpy as np
import rclpy
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.duration import Duration
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from rclpy.time import Time
from rclpy.qos import qos_profile_sensor_data
from realman_msgs.srv import CaptureCalibrationSample, SolveCalibration
from sensor_msgs.msg import CameraInfo, Image
from std_msgs.msg import String
import tf2_ros

from .calibration_math import (
    decode_image,
    detect_charuco,
    make_charuco_board,
    matrix_json,
    annotate_charuco,
    mean_transform_and_spread,
    relative_pose_from_board_poses,
    solve_hand_eye,
    transform_matrix,
)
from .config import load_config
from .layout_update import update_layout_file
from .input_health import classify_camera_input


ARMS = ("l", "m", "r")


@dataclass
class LatestFrame:
    image_message: Image | None = None
    image: np.ndarray | None = None
    image_received_monotonic: float = 0.0
    camera_info: CameraInfo | None = None
    camera_info_received_monotonic: float = 0.0


def _quaternion_rotation(w: float, x: float, y: float, z: float) -> np.ndarray:
    norm = float(np.sqrt(w * w + x * x + y * y + z * z))
    if norm < 1.0e-12:
        raise ValueError("TF quaternion has zero magnitude")
    w, x, y, z = (value / norm for value in (w, x, y, z))
    return np.array(
        [
            [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
        ],
        dtype=np.float64,
    )


def _transform_message_matrix(transform: Any) -> np.ndarray:
    rotation = transform.transform.rotation
    translation = transform.transform.translation
    return transform_matrix(
        _quaternion_rotation(rotation.w, rotation.x, rotation.y, rotation.z),
        [translation.x, translation.y, translation.z],
    )


def _json_safe(value: Any) -> Any:
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    return value


class CameraCalibrationNode(Node):
    """A deep service interface over the ChArUco/TF calibration implementation."""

    def __init__(self) -> None:
        super().__init__("camera_calibration")
        self._callback_group = ReentrantCallbackGroup()
        self._lock = threading.RLock()
        self.declare_parameter("config_file", self._default_config_file())
        self.declare_parameter("layout_config_file", self._default_layout_config_file())
        self.declare_parameter("update_layout_after_solve", True)
        config_file = str(self.get_parameter("config_file").value)
        self._layout_config_file = Path(str(self.get_parameter("layout_config_file").value))
        update_layout_value = self.get_parameter("update_layout_after_solve").value
        if isinstance(update_layout_value, str):
            self._update_layout_after_solve = update_layout_value.strip().lower() in {"1", "true", "yes", "on"}
        else:
            self._update_layout_after_solve = bool(update_layout_value)
        self._config = load_config(config_file)
        self._board = make_charuco_board(self._config["board"])
        self._frames = {
            camera_id: LatestFrame() for camera_id in self._config["cameras"]
        }
        self._samples: dict[str, dict[str, list[dict[str, Any]]]] = {}
        self._session_id = ""
        self._subscriptions: list[Any] = []
        self._tf_buffer = tf2_ros.Buffer()
        self._tf_listener = tf2_ros.TransformListener(self._tf_buffer, self)

        for camera_id, camera in self._config["cameras"].items():
            self._subscriptions.append(
                self.create_subscription(
                    Image,
                    camera["image_topic"],
                    lambda message, key=camera_id: self._on_image(key, message),
                    qos_profile_sensor_data,
                    callback_group=self._callback_group,
                )
            )
            self._subscriptions.append(
                self.create_subscription(
                    CameraInfo,
                    camera["camera_info_topic"],
                    lambda message, key=camera_id: self._on_camera_info(key, message),
                    qos_profile_sensor_data,
                    callback_group=self._callback_group,
                )
            )

        services = self._config.get("services", {})
        self._capture_service = self.create_service(
            CaptureCalibrationSample,
            str(services.get("capture", "/camera_calibration/capture_sample")),
            self._capture,
            callback_group=self._callback_group,
        )
        self._solve_service = self.create_service(
            SolveCalibration,
            str(services.get("solve", "/camera_calibration/solve")),
            self._solve,
            callback_group=self._callback_group,
        )
        self._diagnostics = self.create_publisher(
            DiagnosticArray,
            str(self._config.get("diagnostics_topic", "/camera_calibration/diagnostics")),
            10,
        )
        self._camera_health = self.create_publisher(
            String,
            str(self._config.get("camera_health_topic", "/camera_calibration/camera_health")),
            10,
        )
        self._diagnostic_timer = self.create_timer(
            1.0, self._publish_diagnostics, callback_group=self._callback_group
        )
        self.get_logger().info(
            f"ChArUco calibration services ready for arms {list(self._required_arms())}; "
            "capture is atomic and solve requires all three arms"
        )

    def _default_config_file(self) -> str:
        override = os.environ.get("REALMAN_CAMERA_CALIBRATION_CONFIG_FILE", "")
        if override:
            return override
        root = os.environ.get("REALMAN_CONFIG_ROOT", str(Path.cwd() / "config"))
        return str(Path(root) / "ros" / "camera_calibration.yaml")

    def _default_layout_config_file(self) -> str:
        override = os.environ.get("REALMAN_LAYOUT_CONFIG_FILE", "")
        if override:
            return override
        root = os.environ.get("REALMAN_CONFIG_ROOT", str(Path.cwd() / "config"))
        return str(Path(root) / "ros" / "three_robots.yaml")

    def _required_arms(self) -> tuple[str, ...]:
        configured = self._config.get("sampling", {}).get("required_arms", ARMS)
        arms = tuple(str(arm) for arm in configured)
        if set(arms) != set(ARMS):
            raise ValueError("sampling.required_arms must contain exactly l, m and r")
        return arms

    def _on_image(self, camera_id: str, message: Image) -> None:
        try:
            image = decode_image(message)
        except ValueError as error:
            self.get_logger().warn(f"Ignoring {camera_id} image: {error}")
            return
        with self._lock:
            frame = self._frames[camera_id]
            frame.image_message = message
            frame.image = image
            frame.image_received_monotonic = time.monotonic()

    def _on_camera_info(self, camera_id: str, message: CameraInfo) -> None:
        with self._lock:
            frame = self._frames[camera_id]
            frame.camera_info = message
            frame.camera_info_received_monotonic = time.monotonic()

    @staticmethod
    def _set_capture_diagnostics(
        response: CaptureCalibrationSample.Response,
        latest_image_paths: list[str],
        detection_statuses: list[str],
        detection_messages: list[str],
    ) -> None:
        response.latest_image_paths = list(latest_image_paths)
        response.detection_statuses = list(detection_statuses)
        response.detection_messages = list(detection_messages)

    def _capture(self, request: CaptureCalibrationSample.Request, response: CaptureCalibrationSample.Response) -> CaptureCalibrationSample.Response:
        requested = tuple(request.arm_ids) if request.arm_ids else self._required_arms()
        if len(requested) != 3 or set(requested) != set(self._required_arms()):
            response.message = "capture requires arm_ids l, m and r together"
            return response
        if request.start_new_session or not self._session_id:
            self._start_session()
        elif request.session_id and request.session_id != self._session_id:
            if not self._load_session(request.session_id):
                response.message = f"unknown calibration session: {request.session_id}"
                return response
        session_id = self._session_id
        observations: dict[str, dict[str, Any]] = {}
        latest_image_paths: list[str] = []
        detection_statuses: list[str] = []
        detection_messages: list[str] = []
        attempt_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
        attempt_dir = self._session_directory(session_id) / "attempts" / attempt_id
        attempt_dir.mkdir(parents=True, exist_ok=True)
        max_age = float(self._config["sampling"]["maximum_message_age_sec"])
        try:
            for arm in self._required_arms():
                camera_id = self._camera_for_arm(arm)
                best_error = ""
                observation = None
                for _ in range(8):
                    now = time.monotonic()
                    with self._lock:
                        frame = self._frames[camera_id]
                        if frame.image is None or frame.camera_info is None:
                            image = None
                            image_message = None
                            info = None
                        elif now - frame.image_received_monotonic > max_age:
                            image = None
                            image_message = None
                            info = None
                            best_error = f"{arm}: image is older than {max_age:.2f}s"
                        elif now - frame.camera_info_received_monotonic > max_age:
                            image = None
                            image_message = None
                            info = None
                            best_error = f"{arm}: CameraInfo is older than {max_age:.2f}s"
                        else:
                            image = frame.image.copy()
                            image_message = frame.image_message
                            info = frame.camera_info
                    if image is None:
                        time.sleep(0.06)
                        continue
                    try:
                        candidate = detect_charuco(
                            image,
                            np.asarray(info.k, dtype=np.float64).reshape(3, 3),
                            np.asarray(info.d, dtype=np.float64),
                            self._board,
                            int(self._config["board"]["minimum_corners"]),
                        )
                    except Exception as error:
                        best_error = str(error)
                        time.sleep(0.06)
                        continue
                    observation = candidate
                    break
                if image is None or image_message is None or info is None:
                    status = "missing_input" if not best_error else "stale"
                    detection_statuses.append(status)
                    detection_messages.append(best_error or f"{arm}: image or CameraInfo has not arrived")
                    latest_image_paths.append("")
                    continue
                latest_path = attempt_dir / f"{camera_id}.png"
                latest_image_paths.append(str(latest_path) if cv2.imwrite(str(latest_path), image) else "")
                if observation is None:
                    detection_statuses.append("not_detected")
                    detection_messages.append(best_error or f"{arm}: ChArUco board not visible")
                    continue
                tf_config = self._config["robots"][arm]
                try:
                    transform = self._tf_buffer.lookup_transform(
                        tf_config["base_frame"],
                        tf_config["end_effector_frame"],
                        Time.from_msg(image_message.header.stamp),
                        timeout=Duration(
                            seconds=float(self._config["sampling"]["tf_timeout_sec"])
                        ),
                    )
                except Exception as error:
                    detection_statuses.append("tf_unavailable")
                    detection_messages.append(f"{arm}: {error}")
                    continue
                base_to_tool = _transform_message_matrix(transform)
                detection_statuses.append("detected")
                detection_messages.append(f"{arm}: detected {len(observation.ids)} ChArUco corners")
                observations[arm] = {
                    "camera_id": camera_id,
                    "image": image,
                    "observation": observation,
                    "base_to_tool": base_to_tool,
                    "captured_at": datetime.now(timezone.utc).isoformat(),
                    "stamp_ns": int(image_message.header.stamp.sec) * 1_000_000_000
                    + int(image_message.header.stamp.nanosec),
                }
            if len(observations) != len(self._required_arms()):
                raise ValueError(
                    "; ".join(
                        f"{arm}: {message}"
                        for arm, message in zip(self._required_arms(), detection_messages)
                        if message and not message.startswith(f"{arm}: detected")
                    )
                    or "one or more cameras failed"
                )
            stamps = [item["stamp_ns"] for item in observations.values()]
            if any(stamp <= 0 for stamp in stamps):
                raise ValueError("camera images must carry non-zero ROS timestamps")
            skew_sec = (max(stamps) - min(stamps)) / 1_000_000_000.0
            maximum_skew = float(
                self._config["sampling"]["maximum_inter_camera_skew_sec"]
            )
            if skew_sec > maximum_skew:
                raise ValueError(
                    f"inter-camera image skew {skew_sec:.3f}s exceeds {maximum_skew:.3f}s"
                )
        except Exception as error:
            response.session_id = session_id
            self._set_capture_diagnostics(
                response, latest_image_paths, detection_statuses, detection_messages
            )
            response.message = f"capture rejected atomically: {error}"
            self.get_logger().warn(response.message)
            return response

        batch_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
        output_dir = self._session_directory(session_id)
        output_dir.mkdir(parents=True, exist_ok=True)
        batch_root = output_dir / "batches"
        batch_root.mkdir(parents=True, exist_ok=True)
        final_batch_dir = batch_root / batch_id
        staging_dir = batch_root / f".{batch_id}.tmp"
        staging_dir.mkdir(parents=False, exist_ok=False)
        sample_ids: list[str] = []
        image_paths: list[str] = []
        preview_image_paths: list[str] = []
        counts: list[int] = []
        pending: list[tuple[str, dict[str, Any]]] = []
        try:
            for arm in self._required_arms():
                item = observations[arm]
                observation = item["observation"]
                sample_index = len(self._samples.setdefault(session_id, {}).setdefault(arm, []))
                sample_id = f"{arm}-{sample_index:04d}-{batch_id}"
                staged_image = staging_dir / f"{sample_id}.png"
                staged_preview = staging_dir / f"{sample_id}-preview.png"
                staged_metadata = staging_dir / f"{sample_id}.json"
                image_path = final_batch_dir / staged_image.name
                preview_image_path = final_batch_dir / staged_preview.name
                if not cv2.imwrite(str(staged_image), item["image"]):
                    raise OSError(f"failed to write {staged_image}")
                preview = annotate_charuco(
                    item["image"],
                    observation,
                    float(self._config["board"]["square_length_m"]) * 2.0,
                )
                if not cv2.imwrite(str(staged_preview), preview):
                    raise OSError(f"failed to write {staged_preview}")
                sample = {
                    "sample_id": sample_id,
                    "image_path": str(image_path),
                    "preview_image_path": str(preview_image_path),
                    "base_to_tool": item["base_to_tool"].tolist(),
                    "target_to_camera": observation.target_to_camera.tolist(),
                    "reprojection_error_px": observation.reprojection_error_px,
                    "charuco_ids": observation.ids.reshape(-1).tolist(),
                    "captured_at": item["captured_at"],
                }
                staged_metadata.write_text(json.dumps(sample, indent=2), encoding="utf-8")
                pending.append((arm, sample))
            staging_dir.replace(final_batch_dir)
            for arm, sample in pending:
                self._samples[session_id][arm].append(sample)
                sample_ids.append(sample["sample_id"])
                image_paths.append(sample["image_path"])
                preview_image_paths.append(sample["preview_image_path"])
                counts.append(len(self._samples[session_id][arm]))
        except Exception as error:
            response.session_id = session_id
            response.message = f"capture rejected atomically while writing files: {error}"
            self.get_logger().error(response.message)
            if staging_dir.is_dir():
                for path in staging_dir.glob("*"):
                    path.unlink(missing_ok=True)
                staging_dir.rmdir()
            return response

        response.success = True
        response.session_id = session_id
        response.batch_id = batch_id
        response.captured_arm_ids = list(self._required_arms())
        response.sample_counts = counts
        response.sample_ids = sample_ids
        response.image_paths = image_paths
        response.preview_image_paths = preview_image_paths
        self._set_capture_diagnostics(
            response, latest_image_paths, detection_statuses, detection_messages
        )
        response.message = "captured ChArUco image, board pose and end-effector TF for all three arms"
        self.get_logger().info(f"Captured calibration batch {batch_id} for session {session_id}")
        return response

    def _solve(self, request: SolveCalibration.Request, response: SolveCalibration.Response) -> SolveCalibration.Response:
        session_id = request.session_id or self._session_id
        response.session_id = session_id
        if session_id and session_id not in self._samples:
            self._load_session(session_id)
        if not session_id or session_id not in self._samples:
            response.message = "no active calibration session"
            return response
        required = self._required_arms()
        samples_by_arm = self._samples[session_id]
        minimum = int(self._config["sampling"]["minimum_samples_per_arm"])
        response.sample_counts = [len(samples_by_arm.get(arm, [])) for arm in required]
        if any(count < minimum for count in response.sample_counts):
            response.message = f"each arm needs at least {minimum} atomic samples"
            return response
        results: dict[str, Any] = {}
        base_to_board: dict[str, np.ndarray] = {}
        residual_limit = float(self._config["solver"]["maximum_hand_eye_residual"])
        try:
            for arm in required:
                solved = solve_hand_eye(
                    samples_by_arm[arm],
                    str(self._config["solver"]["hand_eye_method"]),
                )
                if solved["mean_residual_m"] > residual_limit:
                    raise ValueError(
                        f"{arm} hand-eye residual {solved['mean_residual_m']:.4f}m exceeds {residual_limit:.4f}m"
                    )
                tool_to_camera = solved["tool_to_camera"]
                board_poses = [
                    np.asarray(sample["base_to_tool"]) @ tool_to_camera @ np.asarray(sample["target_to_camera"])
                    for sample in samples_by_arm[arm]
                ]
                mean_board_pose, translation_spread, rotation_spread = mean_transform_and_spread(board_poses)
                translation_limit = float(self._config["solver"]["maximum_relative_translation_spread_m"])
                rotation_limit = float(self._config["solver"]["maximum_relative_rotation_spread_rad"])
                if translation_spread > translation_limit or rotation_spread > rotation_limit:
                    raise ValueError(
                        f"{arm} board-pose spread is {translation_spread:.4f}m/"
                        f"{rotation_spread:.4f}rad; limits are {translation_limit:.4f}m/"
                        f"{rotation_limit:.4f}rad"
                    )
                base_to_board[arm] = mean_board_pose
                results[arm] = {
                    "sample_count": solved["sample_count"],
                    "mean_hand_eye_residual_m": solved["mean_residual_m"],
                    "tool_to_camera": matrix_json(tool_to_camera),
                    "base_to_board": matrix_json(mean_board_pose),
                    "translation_spread_m": translation_spread,
                    "rotation_spread_rad": rotation_spread,
                }
        except Exception as error:
            response.message = f"calibration solve rejected: {error}"
            self.get_logger().error(response.message)
            return response

        result: dict[str, Any] = {
            "session_id": session_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "board": self._config["board"],
            "hand_eye": results,
            "relative_base_poses": relative_pose_from_board_poses(base_to_board),
        }
        backup_path: Path | None = None
        if self._update_layout_after_solve:
            try:
                backup_path = update_layout_file(
                    self._layout_config_file,
                    result["relative_base_poses"],
                )
            except Exception as error:
                response.message = f"calibration solved but layout update failed; no success reported: {error}"
                self.get_logger().error(response.message)
                return response
        result["layout_update"] = {
            "enabled": self._update_layout_after_solve,
            "updated": self._update_layout_after_solve,
            "layout_file": str(self._layout_config_file),
            "backup_file": str(backup_path) if backup_path else "",
        }
        result_path = self._session_directory(session_id) / "calibration_result.json"
        result_path.parent.mkdir(parents=True, exist_ok=True)
        result_path.write_text(json.dumps(_json_safe(result), indent=2), encoding="utf-8")
        result_json = json.dumps(_json_safe(result), separators=(",", ":"))
        response.success = True
        response.all_arms_solved = True
        response.result_file = str(result_path)
        response.result_json = result_json
        response.mean_reprojection_error_px = float(
            np.mean(
                [sample["reprojection_error_px"] for arm in required for sample in samples_by_arm[arm]]
            )
        )
        if self._update_layout_after_solve:
            response.layout_updated = True
            response.layout_backup_file = str(backup_path) if backup_path else ""
            response.message = (
                "hand-eye calibration succeeded for l/m/r; relative base poses were computed "
                f"and written to {self._layout_config_file}"
            )
        else:
            response.layout_updated = False
            response.layout_backup_file = ""
            response.message = "hand-eye calibration succeeded for l/m/r; layout write-back is disabled"
        self.get_logger().info(response.message)
        return response

    def _start_session(self) -> None:
        self._session_id = datetime.now(timezone.utc).strftime("session-%Y%m%dT%H%M%S.%fZ")
        self._samples[self._session_id] = {arm: [] for arm in self._required_arms()}
        self._session_directory(self._session_id).mkdir(parents=True, exist_ok=True)

    def _load_session(self, session_id: str) -> bool:
        """Restore sample metadata so a service client can continue after restart."""
        if not re.fullmatch(r"session-[0-9TZ.\-]+", session_id):
            return False
        directory = self._session_directory(session_id)
        if not directory.is_dir():
            return False
        restored = {arm: [] for arm in self._required_arms()}
        try:
            for metadata_path in sorted(directory.rglob("*.json")):
                if metadata_path.name == "calibration_result.json":
                    continue
                relative_metadata = metadata_path.relative_to(directory)
                if any(part.startswith(".") for part in relative_metadata.parts):
                    continue
                sample = json.loads(metadata_path.read_text(encoding="utf-8"))
                sample_id = str(sample["sample_id"])
                arm = sample_id.split("-", 1)[0]
                if arm not in restored or not isinstance(sample["base_to_tool"], list):
                    continue
                restored[arm].append(sample)
        except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError):
            return False
        if not any(restored.values()):
            return False
        self._session_id = session_id
        self._samples[session_id] = restored
        return True

    def _camera_for_arm(self, arm: str) -> str:
        for camera_id, camera in self._config["cameras"].items():
            if str(camera["arm_id"]) == arm:
                return camera_id
        raise ValueError(f"no camera configured for arm {arm}")

    def _session_directory(self, session_id: str) -> Path:
        if not re.fullmatch(r"session-[0-9TZ.\-]+", session_id):
            raise ValueError("invalid calibration session id")
        root = Path(os.environ.get("REALMAN_LOG_ROOT", str(Path.cwd() / "logs")))
        subdirectory = str(self._config.get("storage", {}).get("output_subdirectory", "camera_calibration"))
        return root / subdirectory / session_id

    def _publish_diagnostics(self) -> None:
        array = DiagnosticArray()
        array.header.stamp = self.get_clock().now().to_msg()
        now_monotonic = time.monotonic()
        now_ns = self.get_clock().now().nanoseconds
        health_inputs: list[dict[str, Any]] = []
        with self._lock:
            for camera_id, frame in self._frames.items():
                health = self._camera_health_state(camera_id, frame, now_monotonic, now_ns)
                health_inputs.append(health)
                status = DiagnosticStatus()
                status.name = f"camera_calibration/{camera_id}"
                status.hardware_id = camera_id
                status.level = DiagnosticStatus.OK if health["status"] == "healthy" else DiagnosticStatus.WARN
                status.message = str(health["message"])
                status.values = [
                    KeyValue(key=key, value=self._health_value(value))
                    for key, value in health.items()
                    if key not in {"camera_id", "arm_id", "status", "message"}
                ] + [
                    KeyValue(key="session_id", value=self._session_id),
                ]
                array.status.append(status)
        self._diagnostics.publish(array)
        self._camera_health.publish(
            String(data=json.dumps({"type": "camera_health", "inputs": health_inputs}))
        )

    def _camera_health_state(
        self,
        camera_id: str,
        frame: LatestFrame,
        now_monotonic: float,
        now_ns: int,
    ) -> dict[str, Any]:
        camera = self._config["cameras"][camera_id]
        image_age = now_monotonic - frame.image_received_monotonic if frame.image_received_monotonic else None
        info_age = now_monotonic - frame.camera_info_received_monotonic if frame.camera_info_received_monotonic else None
        image_stamp_ns = self._message_stamp_ns(frame.image_message)
        info_stamp_ns = self._message_stamp_ns(frame.camera_info)
        return classify_camera_input(
            camera_id=camera_id,
            arm_id=str(camera["arm_id"]),
            image_age_sec=image_age,
            camera_info_age_sec=info_age,
            image_timestamp_delay_sec=self._timestamp_delay_sec(now_ns, image_stamp_ns),
            camera_info_timestamp_delay_sec=self._timestamp_delay_sec(now_ns, info_stamp_ns),
            image_camera_info_skew_sec=(abs(image_stamp_ns - info_stamp_ns) / 1_000_000_000.0)
            if image_stamp_ns and info_stamp_ns
            else None,
            maximum_message_age_sec=float(self._config["sampling"]["maximum_message_age_sec"]),
            maximum_timestamp_delay_sec=float(self._config["sampling"]["maximum_timestamp_delay_sec"]),
            maximum_inter_camera_skew_sec=float(self._config["sampling"]["maximum_inter_camera_skew_sec"]),
            image_width=int(frame.image.shape[1]) if frame.image is not None else 0,
            image_height=int(frame.image.shape[0]) if frame.image is not None else 0,
        )

    @staticmethod
    def _message_stamp_ns(message: Any) -> int:
        if message is None:
            return 0
        stamp = message.header.stamp
        return int(stamp.sec) * 1_000_000_000 + int(stamp.nanosec)

    @staticmethod
    def _timestamp_delay_sec(now_ns: int, stamp_ns: int) -> float | None:
        if stamp_ns <= 0:
            return None
        return (now_ns - stamp_ns) / 1_000_000_000.0

    @staticmethod
    def _health_value(value: Any) -> str:
        return f"{value:.3f}" if isinstance(value, float) else str(value)


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = CameraCalibrationNode()
    executor = MultiThreadedExecutor(num_threads=4)
    executor.add_node(node)
    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        executor.shutdown()
        node.destroy_node()
        rclpy.shutdown()
