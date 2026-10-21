"""The realman_training compose service: server5090-only, same-path mounts, nvidia runtime without gpus:."""

from __future__ import annotations

from pathlib import Path

import re

import yaml

REPO = Path(__file__).resolve().parents[4]
COMPOSE = REPO / "config" / "docker" / "compose.yaml"
DOCKERFILE = REPO / "config" / "docker" / "training-console.Dockerfile"


def _service() -> dict:
    return yaml.safe_load(COMPOSE.read_text(encoding="utf-8"))["services"]["realman_training"]


def test_the_service_is_opt_in_and_uses_the_nvidia_runtime():
    service = _service()
    assert service["profiles"] == ["training"]
    assert service["runtime"] == "nvidia" and "gpus" not in service and "deploy" not in service
    assert service["pid"] == "host"
    assert service["environment"]["NVIDIA_DRIVER_CAPABILITIES"] == "utility"
    assert service["build"]["dockerfile"] == "config/docker/training-console.Dockerfile"
    assert any(str(port).endswith(":8780:8780") for port in service["ports"])


def test_host_paths_are_mounted_at_the_same_path():
    volumes = _service()["volumes"]
    assert "/var/run/docker.sock:/var/run/docker.sock" in volumes
    same = [v for v in volumes if "${TRAINING_HOME" in v or "${TRAINING_REPO" in v]
    assert len(same) >= 5
    for volume in same:
        parts = re.findall(r"\$\{[^}]*\}[^:]*|[^:]+", volume)  # ${VAR:-default} holds a colon
        assert parts[0] == parts[1], volume


def test_the_token_comes_from_the_environment_only():
    env = _service()["environment"]
    assert env["REALMAN_TRAINING_TOKEN"] == "${REALMAN_TRAINING_TOKEN:-}"
    assert env["REALMAN_TRAINING_CONFIG"].endswith("/config/training/training_console.yaml")
    assert env["DOCKER_CONFIG"] == "/tmp/.docker"


def test_the_image_keeps_the_repo_layout_for_config_lookup():
    text = DOCKERFILE.read_text(encoding="utf-8")
    assert "COPY src/training/realman_training /opt/realman_pi/src/training/realman_training" in text
    assert 'CMD ["python", "-m", "realman_training", "web"]' in text
