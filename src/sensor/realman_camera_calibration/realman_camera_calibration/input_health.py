"""Pure health classification for the image inputs used by calibration."""

from __future__ import annotations

from typing import Any


def classify_camera_input(
    *,
    camera_id: str,
    arm_id: str,
    image_age_sec: float | None,
    camera_info_age_sec: float | None,
    image_timestamp_delay_sec: float | None,
    camera_info_timestamp_delay_sec: float | None,
    image_camera_info_skew_sec: float | None,
    maximum_message_age_sec: float,
    maximum_timestamp_delay_sec: float,
    maximum_inter_camera_skew_sec: float,
    image_width: int = 0,
    image_height: int = 0,
) -> dict[str, Any]:
    """Classify one camera without depending on ROS message classes."""

    image_received = image_age_sec is not None
    camera_info_received = camera_info_age_sec is not None
    if not image_received or not camera_info_received:
        status, message = "missing", "waiting for Image and CameraInfo"
    elif image_age_sec > maximum_message_age_sec or camera_info_age_sec > maximum_message_age_sec:
        status, message = "stale", "Image or CameraInfo is older than the configured freshness limit"
    elif (
        image_timestamp_delay_sec is not None
        and abs(image_timestamp_delay_sec) > maximum_timestamp_delay_sec
    ):
        status, message = "delayed", "Image timestamp delay exceeds the configured limit"
    elif (
        image_camera_info_skew_sec is not None
        and image_camera_info_skew_sec > maximum_inter_camera_skew_sec
    ):
        status, message = "unsynchronized", "Image and CameraInfo timestamps are too far apart"
    else:
        status, message = "healthy", "Image and CameraInfo are current"
    return {
        "camera_id": camera_id,
        "arm_id": arm_id,
        "status": status,
        "message": message,
        "image_received": image_received,
        "camera_info_received": camera_info_received,
        "image_age_sec": image_age_sec,
        "camera_info_age_sec": camera_info_age_sec,
        "image_timestamp_delay_sec": image_timestamp_delay_sec,
        "camera_info_timestamp_delay_sec": camera_info_timestamp_delay_sec,
        "image_camera_info_skew_sec": image_camera_info_skew_sec,
        "image_width": image_width,
        "image_height": image_height,
    }
