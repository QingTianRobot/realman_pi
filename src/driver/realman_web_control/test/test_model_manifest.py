from pathlib import Path

import pytest

from realman_web_control.model_manifest import build_manifest, resolve_model_asset


ROOT = Path(__file__).parents[4]


def paths():
    return (
        ROOT / "config/ros/three_robots.yaml",
        ROOT / "config/ros/realman_motion.yaml",
        ROOT / "config/ros/realman_coordinates.yaml",
        ROOT / "src/rm65_description",
    )


def test_manifest_reuses_layout_frames_motion_and_urdf_limits():
    manifest = build_manifest(*paths())
    assert manifest["root_frame"] == "world"
    assert [robot["id"] for robot in manifest["robots"]] == ["l", "m", "r"]
    left = manifest["robots"][0]
    assert left["transform"]["x"] == -1.0
    assert left["frames"]["tool"]["name"] == "tcpgrip"
    assert left["motion"]["velocity_control_period_ms"] == 20
    assert left["joints"][0]["lower_rad"] == pytest.approx(-3.106)
    assert left["urdf_url"] == "/models/urdf/RM65-B.urdf"


def test_model_asset_resolution_rejects_path_traversal():
    _, _, _, description = paths()
    assert resolve_model_asset(description, "urdf/RM65-B.urdf").is_file()
    with pytest.raises(ValueError):
        resolve_model_asset(description, "../package.xml")


def test_manifest_accepts_symlink_installed_description_root(tmp_path):
    layout, motion, coordinates, source_description = paths()
    installed_description = tmp_path / "rm65_description_share"
    installed_description.mkdir()
    (installed_description / "urdf").symlink_to(source_description / "urdf", target_is_directory=True)

    manifest = build_manifest(layout, motion, coordinates, installed_description)

    assert manifest["robots"][0]["model"] == "RM65-B"
    assert resolve_model_asset(installed_description, "urdf/RM65-B.urdf").is_file()
