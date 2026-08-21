"""Configuration loading kept independent from ROS for easy unit testing."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


def load_config(path: str | Path) -> dict[str, Any]:
    """Load and validate the small, project-owned calibration YAML contract."""

    config_path = Path(path)
    with config_path.open(encoding="utf-8") as stream:
        config = yaml.safe_load(stream) or {}
    if not isinstance(config, dict):
        raise ValueError("camera calibration config must contain a YAML mapping")

    cameras = config.get("cameras")
    if not isinstance(cameras, dict) or not cameras:
        raise ValueError("camera calibration config must define at least one camera")
    camera_arm_ids: list[str] = []
    for camera_id, camera in cameras.items():
        if not isinstance(camera, dict):
            raise ValueError(f"camera '{camera_id}' must be a mapping")
        for key in ("image_topic", "camera_info_topic"):
            if not isinstance(camera.get(key), str) or not camera[key].strip():
                raise ValueError(f"camera '{camera_id}' requires a non-empty {key}")
        arm_id = camera.get("arm_id")
        if arm_id not in ("l", "m", "r"):
            raise ValueError(f"camera '{camera_id}' arm_id must be l, m or r")
        camera_arm_ids.append(arm_id)
    if len(cameras) != 3 or set(camera_arm_ids) != {"l", "m", "r"}:
        raise ValueError("cameras must map exactly one input to each of l, m and r")

    board = config.get("board", {})
    if not isinstance(board, dict):
        raise ValueError("board must be a mapping")
    if board.get("type") != "charuco":
        raise ValueError("board.type must be charuco")
    if not isinstance(board.get("dictionary"), str):
        raise ValueError("board.dictionary must be a string")
    for key in ("squares_x", "squares_y"):
        if int(board.get(key, 0)) < 2:
            raise ValueError(f"board.{key} must be at least 2")
    for key in ("square_length_m", "marker_length_m"):
        if float(board.get(key, 0.0)) <= 0.0:
            raise ValueError(f"board.{key} must be positive")
    if float(board["marker_length_m"]) >= float(board["square_length_m"]):
        raise ValueError("board.marker_length_m must be smaller than square_length_m")

    robots = config.get("robots")
    if not isinstance(robots, dict) or set(robots) != {"l", "m", "r"}:
        raise ValueError("robots must define exactly l, m and r")
    for arm, robot in robots.items():
        if not isinstance(robot, dict):
            raise ValueError(f"robots.{arm} must be a mapping")
        for key in ("camera_id", "base_frame", "end_effector_frame"):
            if not isinstance(robot.get(key), str) or not robot[key].strip():
                raise ValueError(f"robots.{arm} requires a non-empty {key}")
        if robot["camera_id"] not in cameras:
            raise ValueError(f"robots.{arm}.camera_id must name a configured camera")

    sampling = config.get("sampling", {})
    if not isinstance(sampling, dict):
        raise ValueError("sampling must be a mapping")
    required_arms = sampling.get("required_arms", ["l", "m", "r"])
    if required_arms != ["l", "m", "r"]:
        raise ValueError("sampling.required_arms must be exactly [l, m, r]")
    for key in (
        "maximum_message_age_sec",
        "maximum_inter_camera_skew_sec",
        "maximum_timestamp_delay_sec",
        "tf_timeout_sec",
    ):
        if float(sampling.get(key, 0.0)) <= 0.0:
            raise ValueError(f"sampling.{key} must be positive")
    if int(sampling.get("minimum_samples_per_arm", 0)) < 3:
        raise ValueError("sampling.minimum_samples_per_arm must be at least 3")

    solver = config.get("solver", {})
    if not isinstance(solver, dict):
        raise ValueError("solver must be a mapping")
    if not isinstance(solver.get("hand_eye_method"), str) or not solver["hand_eye_method"]:
        raise ValueError("solver.hand_eye_method must be a non-empty string")
    for key in ("maximum_hand_eye_residual", "maximum_relative_translation_spread_m", "maximum_relative_rotation_spread_rad"):
        if float(solver.get(key, 0.0)) <= 0.0:
            raise ValueError(f"solver.{key} must be positive")

    return config
