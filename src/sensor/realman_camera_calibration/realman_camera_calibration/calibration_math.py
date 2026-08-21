"""Pure ChArUco, hand-eye and relative-pose calculations.

ROS is deliberately absent from this module.  The service node supplies image,
camera-info and TF samples; tests can exercise the numerical seam with synthetic
matrices without starting DDS.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

import cv2
import numpy as np


def transform_matrix(rotation: Any, translation: Any) -> np.ndarray:
    matrix = np.eye(4, dtype=np.float64)
    matrix[:3, :3] = np.asarray(rotation, dtype=np.float64).reshape(3, 3)
    matrix[:3, 3] = np.asarray(translation, dtype=np.float64).reshape(3)
    return matrix


def rpy_transform(roll: float, pitch: float, yaw: float, translation: Any) -> np.ndarray:
    """Build the ROS static_transform_publisher XYZ/RPY transform."""
    cx, sx = np.cos(roll), np.sin(roll)
    cy, sy = np.cos(pitch), np.sin(pitch)
    cz, sz = np.cos(yaw), np.sin(yaw)
    rotation = np.array(
        [
            [cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx],
            [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx],
            [-sy, cy * sx, cy * cx],
        ],
        dtype=np.float64,
    )
    return transform_matrix(rotation, translation)


def matrix_to_rpy(matrix: np.ndarray) -> tuple[float, float, float]:
    """Convert a homogeneous transform to ROS ZYX Euler fields."""
    rotation = np.asarray(matrix, dtype=np.float64)[:3, :3]
    cy = float(np.hypot(rotation[0, 0], rotation[1, 0]))
    if cy > 1.0e-9:
        roll = float(np.arctan2(rotation[2, 1], rotation[2, 2]))
        pitch = float(np.arctan2(-rotation[2, 0], cy))
        yaw = float(np.arctan2(rotation[1, 0], rotation[0, 0]))
    else:
        # At the singularity choose yaw=0 and retain the observable roll.
        roll = float(np.arctan2(-rotation[0, 1], rotation[1, 1]))
        pitch = float(np.arctan2(-rotation[2, 0], cy))
        yaw = 0.0
    return roll, pitch, yaw


def matrix_json(matrix: np.ndarray) -> list[list[float]]:
    return np.asarray(matrix, dtype=np.float64).round(12).tolist()


def dictionary_from_name(name: str) -> Any:
    if not name.startswith("DICT_") or not hasattr(cv2.aruco, name):
        raise ValueError(f"unsupported ChArUco dictionary: {name}")
    return cv2.aruco.getPredefinedDictionary(getattr(cv2.aruco, name))


def make_charuco_board(config: dict[str, Any]) -> Any:
    dictionary = dictionary_from_name(str(config["dictionary"]))
    size = (int(config["squares_x"]), int(config["squares_y"]))
    square_length = float(config["square_length_m"])
    marker_length = float(config["marker_length_m"])
    # OpenCV 4.7 introduced the CharucoBoard constructor. Ubuntu 22.04's
    # Humble package commonly ships OpenCV 4.5, which exposes the equivalent
    # factory function instead.
    if hasattr(cv2.aruco, "CharucoBoard"):
        return cv2.aruco.CharucoBoard(size, square_length, marker_length, dictionary)
    if hasattr(cv2.aruco, "CharucoBoard_create"):
        return cv2.aruco.CharucoBoard_create(
            size[0], size[1], square_length, marker_length, dictionary
        )
    raise RuntimeError("installed OpenCV does not provide a ChArUco board API")


def decode_image(message: Any) -> np.ndarray:
    """Decode the raw ROS Image encodings used by the Orbbec color stream."""

    encoding = str(message.encoding).lower()
    if encoding not in {"bgr8", "rgb8", "mono8"}:
        raise ValueError(f"unsupported image encoding: {message.encoding}")
    channels = 1 if encoding == "mono8" else 3
    expected = int(message.height) * int(message.step)
    data = np.frombuffer(message.data, dtype=np.uint8)
    if data.size < expected:
        raise ValueError("Image data is shorter than height*step")
    image = data[:expected].reshape(int(message.height), int(message.step))
    image = image[:, : int(message.width) * channels]
    if channels == 1:
        return image.reshape(int(message.height), int(message.width)).copy()
    image = image.reshape(int(message.height), int(message.width), channels).copy()
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR) if encoding == "rgb8" else image


@dataclass(frozen=True)
class BoardObservation:
    corners: np.ndarray
    ids: np.ndarray
    camera_matrix: np.ndarray
    distortion: np.ndarray
    image_size: tuple[int, int]
    target_to_camera: np.ndarray
    reprojection_error_px: float


def annotate_charuco(image: np.ndarray, observation: BoardObservation, axis_length_m: float) -> np.ndarray:
    """Return an operator preview with detected corners, IDs, pose axes and error."""

    preview = np.asarray(image).copy()
    if preview.ndim == 2:
        preview = cv2.cvtColor(preview, cv2.COLOR_GRAY2BGR)
    cv2.aruco.drawDetectedCornersCharuco(
        preview,
        observation.corners,
        observation.ids,
        cornerColor=(0, 220, 120),
    )
    rotation = observation.target_to_camera[:3, :3]
    translation = observation.target_to_camera[:3, 3].reshape(3, 1)
    rvec, _ = cv2.Rodrigues(rotation)
    cv2.drawFrameAxes(
        preview,
        observation.camera_matrix,
        observation.distortion,
        rvec,
        translation,
        float(axis_length_m),
        2,
    )
    label = (
        f"ChArUco OK | corners={len(observation.ids)} | "
        f"reprojection={observation.reprojection_error_px:.2f}px"
    )
    cv2.rectangle(preview, (0, 0), (min(preview.shape[1], 760), 34), (12, 24, 28), -1)
    cv2.putText(
        preview,
        label,
        (10, 23),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.62,
        (224, 245, 238),
        1,
        cv2.LINE_AA,
    )
    return preview


def detect_charuco(
    image: np.ndarray,
    camera_matrix: np.ndarray,
    distortion: np.ndarray,
    board: Any,
    minimum_corners: int,
) -> BoardObservation:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image
    # Humble ships OpenCV 4.5, whose marker detector misses the small, glossy
    # board in the left and middle views at native resolution. Try a compact
    # set of deterministic candidates, then map detected corners back to the
    # original image before PnP. This keeps the saved image and camera model
    # unchanged while making detection robust to scale and green background.
    candidates: list[tuple[np.ndarray, float]] = [(gray, 1.0)]
    if image.ndim == 3:
        green = np.asarray(image[:, :, 1])
        candidates.append((green, 1.0))
    sharpened = cv2.addWeighted(gray, 2.0, cv2.GaussianBlur(gray, (0, 0), 1.0), -1.0, 0.0)
    candidates.append((sharpened, 1.0))
    for source in (gray, image[:, :, 1] if image.ndim == 3 else gray, sharpened):
        candidates.append((cv2.resize(source, None, fx=3.0, fy=3.0, interpolation=cv2.INTER_CUBIC), 3.0))

    dictionary = (
        board.getDictionary()
        if hasattr(board, "getDictionary")
        else board.dictionary
    )
    best_corners = None
    best_ids = None
    best_scale = 1.0
    for candidate, scale in candidates:
        if hasattr(cv2.aruco, "CharucoDetector"):
            detector = cv2.aruco.CharucoDetector(board)
            corners, ids, _marker_corners, _marker_ids = detector.detectBoard(candidate)
        else:  # pragma: no cover - production Humble uses this OpenCV 4.5 path
            marker_corners, marker_ids, _ = cv2.aruco.detectMarkers(candidate, dictionary)
            if marker_ids is None:
                corners, ids = None, None
            else:
                _count, corners, ids = cv2.aruco.interpolateCornersCharuco(
                    marker_corners, marker_ids, candidate, board
                )
        count = 0 if ids is None or corners is None else len(ids)
        if count > (0 if best_ids is None else len(best_ids)):
            best_corners, best_ids, best_scale = corners, ids, scale

    if best_ids is None or best_corners is None or len(best_ids) < minimum_corners:
        raise ValueError(
            f"ChArUco board not visible: found {0 if best_ids is None else len(best_ids)} corners, "
            f"need at least {minimum_corners}"
        )
    ids = np.asarray(best_ids, dtype=np.int32).reshape(-1, 1)
    corners = np.asarray(best_corners, dtype=np.float32).reshape(-1, 1, 2) / best_scale
    # The matching OpenCV 4.5 binding uses a public attribute here too; newer
    # bindings provide the getter.  Keep the legacy detection/PnP path whole.
    chessboard_corners = (
        board.getChessboardCorners()
        if hasattr(board, "getChessboardCorners")
        else board.chessboardCorners
    )
    object_points = np.asarray(chessboard_corners, dtype=np.float64)[ids[:, 0]]
    ok, rvec, tvec = cv2.solvePnP(
        object_points,
        corners.reshape(-1, 2),
        camera_matrix,
        distortion,
        flags=cv2.SOLVEPNP_ITERATIVE,
    )
    if not ok:
        raise ValueError("solvePnP could not estimate the ChArUco board pose")
    rotation, _ = cv2.Rodrigues(rvec)
    projected, _ = cv2.projectPoints(
        object_points, rvec, tvec, camera_matrix, distortion
    )
    error = float(
        np.mean(
            np.linalg.norm(projected.reshape(-1, 2) - corners.reshape(-1, 2), axis=1)
        )
    )
    return BoardObservation(
        corners=corners,
        ids=ids,
        camera_matrix=np.asarray(camera_matrix, dtype=np.float64),
        distortion=np.asarray(distortion, dtype=np.float64),
        image_size=(int(image.shape[1]), int(image.shape[0])),
        target_to_camera=transform_matrix(rotation, tvec.reshape(3)),
        reprojection_error_px=error,
    )


def _method(name: str) -> int:
    methods = {
        "TSAI": cv2.CALIB_HAND_EYE_TSAI,
        "PARK": cv2.CALIB_HAND_EYE_PARK,
        "HORAUD": cv2.CALIB_HAND_EYE_HORAUD,
        "ANDREFF": cv2.CALIB_HAND_EYE_ANDREFF,
        "DANIILIDIS": cv2.CALIB_HAND_EYE_DANIILIDIS,
    }
    try:
        return methods[name.upper()]
    except KeyError as error:
        raise ValueError(f"unsupported hand-eye method: {name}") from error


def solve_hand_eye(samples: list[dict[str, Any]], method: str) -> dict[str, Any]:
    if len(samples) < 3:
        raise ValueError("at least three pose-diverse samples are required")
    rotation_gripper_to_base = []
    translation_gripper_to_base = []
    rotation_target_to_camera = []
    translation_target_to_camera = []
    for sample in samples:
        base_to_tool = np.asarray(sample["base_to_tool"], dtype=np.float64)
        target_to_camera = np.asarray(sample["target_to_camera"], dtype=np.float64)
        rotation_gripper_to_base.append(base_to_tool[:3, :3])
        translation_gripper_to_base.append(base_to_tool[:3, 3])
        rotation_target_to_camera.append(target_to_camera[:3, :3])
        translation_target_to_camera.append(target_to_camera[:3, 3])
    rotation_camera_to_gripper, translation_camera_to_gripper = cv2.calibrateHandEye(
        rotation_gripper_to_base,
        translation_gripper_to_base,
        rotation_target_to_camera,
        translation_target_to_camera,
        method=_method(method),
    )
    tool_to_camera = transform_matrix(
        rotation_camera_to_gripper, translation_camera_to_gripper
    )
    if not np.all(np.isfinite(tool_to_camera)):
        raise ValueError("hand-eye solver returned a non-finite transform")
    predicted_board_poses = [
        (
            np.asarray(sample["base_to_tool"], dtype=np.float64)
            @ tool_to_camera
            @ np.asarray(sample["target_to_camera"], dtype=np.float64)
        )
        for sample in samples
    ]
    mean_translation = np.mean([pose[:3, 3] for pose in predicted_board_poses], axis=0)
    residuals = [
        float(np.linalg.norm(pose[:3, 3] - mean_translation))
        for pose in predicted_board_poses
    ]
    return {
        "tool_to_camera": tool_to_camera,
        "mean_residual_m": float(np.mean(residuals)),
        "sample_count": len(samples),
    }


def mean_transform_and_spread(poses: list[np.ndarray]) -> tuple[np.ndarray, float, float]:
    if not poses:
        raise ValueError("at least one transform is required")
    matrices = [np.asarray(pose, dtype=np.float64) for pose in poses]
    translation = np.mean([pose[:3, 3] for pose in matrices], axis=0)
    rotation_sum = np.sum([pose[:3, :3] for pose in matrices], axis=0)
    left, _singular, right = np.linalg.svd(rotation_sum)
    rotation = left @ right
    if np.linalg.det(rotation) < 0:
        left[:, -1] *= -1
        rotation = left @ right
    mean = transform_matrix(rotation, translation)
    translation_spread = max(float(np.linalg.norm(pose[:3, 3] - translation)) for pose in matrices)
    rotation_spread = 0.0
    for pose in matrices:
        delta = rotation.T @ pose[:3, :3]
        cosine = float(np.clip((np.trace(delta) - 1.0) / 2.0, -1.0, 1.0))
        rotation_spread = max(rotation_spread, float(np.arccos(cosine)))
    return mean, translation_spread, rotation_spread


def relative_pose_from_board_poses(
    base_to_board_by_arm: dict[str, np.ndarray],
) -> dict[str, list[list[float]]]:
    reference = base_to_board_by_arm["l"]
    return {
        arm: matrix_json(np.asarray(reference) @ np.linalg.inv(np.asarray(pose)))
        for arm, pose in base_to_board_by_arm.items()
        if arm != "l"
    }
