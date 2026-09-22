from pathlib import Path

from realman_recording.provenance import snapshot_optional_file


def test_snapshots_configured_calibration_with_sha256(tmp_path: Path):
    source = tmp_path / "calibration.yaml"
    source.write_text("version: 7\n", encoding="utf-8")
    result = snapshot_optional_file(source, tmp_path / "session" / "metadata", "camera_calibration.yaml", version="7")
    assert result["state"] == "SNAPSHOT"
    assert result["path"] == "metadata/camera_calibration.yaml"
    assert len(result["sha256"]) == 64
    assert (tmp_path / "session" / "metadata" / "camera_calibration.yaml").read_text(encoding="utf-8") == "version: 7\n"


def test_marks_absent_optional_calibration_without_fabricating_a_hash(tmp_path: Path):
    result = snapshot_optional_file("", tmp_path / "session" / "metadata", "camera_calibration.yaml")
    assert result == {"state": "UNAVAILABLE", "version": ""}


def test_rejects_configured_missing_calibration(tmp_path: Path):
    try:
        snapshot_optional_file(tmp_path / "missing.yaml", tmp_path / "session" / "metadata", "camera_calibration.yaml")
    except ValueError as error:
        assert "does not exist" in str(error)
    else:
        raise AssertionError("missing configured calibration was accepted")
