from pathlib import Path

import pytest

from realman_camera_calibration.config import load_config


CONFIG = Path(__file__).parents[4] / "config" / "ros" / "camera_calibration.yaml"


def test_project_calibration_config_has_three_named_inputs():
    config = load_config(CONFIG)
    assert list(config["cameras"]) == ["left", "middle", "right"]
    assert config["board"]["square_length_m"] > 0
    assert config["board"]["type"] == "charuco"
    assert config["board"]["dictionary"] == "DICT_5X5_100"
    assert config["board"]["squares_x"] == 12
    assert config["board"]["squares_y"] == 9
    assert config["board"]["square_length_m"] == 0.015
    assert config["board"]["marker_length_m"] == 0.01125
    assert config["sampling"]["minimum_samples_per_arm"] == 30


def test_invalid_calibration_config_is_rejected(tmp_path):
    path = tmp_path / "invalid.yaml"
    path.write_text("cameras: {left: {image_topic: /image}}\n", encoding="utf-8")
    with pytest.raises(ValueError, match="camera_info_topic"):
        load_config(path)


def test_camera_arm_mapping_must_cover_all_three_arms(tmp_path):
    source = CONFIG.read_text(encoding="utf-8")
    path = tmp_path / "invalid-arms.yaml"
    path.write_text(source.replace("arm_id: m", "arm_id: l", 1), encoding="utf-8")
    with pytest.raises(ValueError, match="exactly one input"):
        load_config(path)
