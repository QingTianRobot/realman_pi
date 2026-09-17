"""Tests for the display-only layout manifest built from three_robots.yaml."""
from __future__ import annotations

import yaml

import pytest

from realman_recording.layout_manifest import build_recording_manifest


def _arm(model="RM65-B", **overrides):
    item = {
        "model": model,
        "namespace": "l",
        "parent_frame": "world",
        "x": -1.0, "y": 0.0, "z": 0.0,
        "roll": 0.0, "pitch": 0.0, "yaw": 0.0,
    }
    item.update(overrides)
    return item


def test_build_recording_manifest_reads_transforms_and_urdf(tmp_path):
    layout = tmp_path / "three_robots.yaml"
    layout.write_text(yaml.safe_dump({"robots": {arm: _arm() for arm in ("l", "m", "r")},
                                      "settings": {"default_joint_position": 0.1}}))
    manifest = build_recording_manifest(layout)
    assert [robot["id"] for robot in manifest["robots"]] == ["l", "m", "r"]
    assert manifest["robots"][0]["urdf_url"] == "/models/urdf/RM65-B.urdf"
    assert manifest["robots"][0]["package_root_url"] == "/models"
    assert manifest["default_joint_position_rad"] == 0.1


def test_build_recording_manifest_rejects_missing_arm(tmp_path):
    layout = tmp_path / "three_robots.yaml"
    layout.write_text(yaml.safe_dump({"robots": {"l": _arm()}}))
    with pytest.raises(ValueError):
        build_recording_manifest(layout)


def test_build_recording_manifest_rejects_non_numeric_transform(tmp_path):
    layout = tmp_path / "three_robots.yaml"
    layout.write_text(yaml.safe_dump({"robots": {arm: _arm(x="nan") for arm in ("l", "m", "r")}}))
    with pytest.raises(ValueError):
        build_recording_manifest(layout)
