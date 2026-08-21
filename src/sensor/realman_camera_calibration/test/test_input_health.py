from realman_camera_calibration.input_health import classify_camera_input


BASE = {
    "camera_id": "left",
    "arm_id": "l",
    "maximum_message_age_sec": 0.75,
    "maximum_timestamp_delay_sec": 1.0,
    "maximum_inter_camera_skew_sec": 0.15,
}


def test_missing_image_or_info_is_unhealthy():
    health = classify_camera_input(
        **BASE,
        image_age_sec=None,
        camera_info_age_sec=None,
        image_timestamp_delay_sec=None,
        camera_info_timestamp_delay_sec=None,
        image_camera_info_skew_sec=None,
    )
    assert health["status"] == "missing"


def test_current_input_is_healthy_and_keeps_metrics():
    health = classify_camera_input(
        **BASE,
        image_age_sec=0.1,
        camera_info_age_sec=0.2,
        image_timestamp_delay_sec=0.3,
        camera_info_timestamp_delay_sec=0.3,
        image_camera_info_skew_sec=0.02,
        image_width=640,
        image_height=480,
    )
    assert health["status"] == "healthy"
    assert health["image_width"] == 640


def test_old_or_delayed_input_has_specific_status():
    stale = classify_camera_input(
        **BASE,
        image_age_sec=1.0,
        camera_info_age_sec=0.1,
        image_timestamp_delay_sec=0.1,
        camera_info_timestamp_delay_sec=0.1,
        image_camera_info_skew_sec=0.01,
    )
    delayed = classify_camera_input(
        **BASE,
        image_age_sec=0.1,
        camera_info_age_sec=0.1,
        image_timestamp_delay_sec=1.2,
        camera_info_timestamp_delay_sec=0.1,
        image_camera_info_skew_sec=0.01,
    )
    assert stale["status"] == "stale"
    assert delayed["status"] == "delayed"
