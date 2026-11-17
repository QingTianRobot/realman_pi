"""The episode launch must never raise into the bringup: config errors become a LogInfo."""
import importlib.util
from pathlib import Path

import pytest

pytest.importorskip("launch_ros")

from launch.actions import LogInfo  # noqa: E402
from launch_ros.actions import Node  # noqa: E402

LAUNCH_FILE = Path(__file__).resolve().parents[1] / "launch" / "pika_episode.launch.py"
REPO_CONFIG = Path(__file__).resolve().parents[4] / "config" / "ros"


def _generate(monkeypatch, root: Path):
    monkeypatch.setenv("REALMAN_CONFIG_ROOT", str(root))
    spec = importlib.util.spec_from_file_location("pika_episode_launch", LAUNCH_FILE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.generate_launch_description().entities


def _config_root(tmp_path: Path, enabled: bool, pika_text: str | None = None) -> Path:
    ros = tmp_path / "ros"
    ros.mkdir()
    episode = (REPO_CONFIG / "pika_episode.yaml").read_text(encoding="utf-8")
    (ros / "pika_episode.yaml").write_text(
        episode.replace("enabled: false", f"enabled: {'true' if enabled else 'false'}"), encoding="utf-8")
    (ros / "pika_config.yaml").write_text(
        pika_text if pika_text is not None else (REPO_CONFIG / "pika_config.yaml").read_text(encoding="utf-8"),
        encoding="utf-8")
    return tmp_path


def _only_log(entities) -> str:
    assert len(entities) == 1 and isinstance(entities[0], LogInfo)
    return "".join(getattr(part, "text", str(part)) for part in entities[0].msg)


def test_missing_config_logs_instead_of_raising(monkeypatch, tmp_path):
    message = _only_log(_generate(monkeypatch, tmp_path))
    assert message.startswith("pika_episode_trigger NOT started: ")
    assert "pika_episode.yaml" in message


def test_disabled_config_logs(monkeypatch, tmp_path):
    message = _only_log(_generate(monkeypatch, _config_root(tmp_path, enabled=False)))
    assert "disabled" in message


def test_bad_home_pose_logs_instead_of_raising(monkeypatch, tmp_path):
    root = _config_root(tmp_path, enabled=True, pika_text="pika_default_pose: {}\n")
    message = _only_log(_generate(monkeypatch, root))
    assert message.startswith("pika_episode_trigger NOT started: ")


def test_enabled_config_starts_the_node(monkeypatch, tmp_path):
    entities = _generate(monkeypatch, _config_root(tmp_path, enabled=True))
    assert len(entities) == 1 and isinstance(entities[0], Node)
