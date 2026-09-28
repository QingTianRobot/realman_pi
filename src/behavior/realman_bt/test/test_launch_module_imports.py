from pathlib import Path


ROOT = Path(__file__).parents[4]
LAUNCH = ROOT / "src/behavior/realman_bt/launch"


def test_launch_files_resolve_their_installed_sibling_registry():
    for filename in ("arm_move.launch.py", "control_router.launch.py"):
        source = (LAUNCH / filename).read_text(encoding="utf-8")
        assert 'sys.path.insert(0, str(Path(__file__).resolve().parent))' in source
        assert (
            "from coordinate_reference_registry import load_runtime_registries"
            in source
        )


def test_control_router_launches_keyboard_and_pika_routers():
    source = (LAUNCH / "control_router.launch.py").read_text(encoding="utf-8")
    assert 'executable="keyboard_control_router"' in source
    assert '"input_timeout_ms": keyboard_input_timeout_ms' in source
    assert '"input_lost_ms": keyboard_input_lost_ms' in source
    assert "keyboard_router" in source


def _load_launch_module():
    import importlib.util
    import sys

    sys.path.insert(0, str(LAUNCH))
    spec = importlib.util.spec_from_file_location(
        "control_router_launch", LAUNCH / "control_router.launch.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_keyboard_timing_loader_reads_config_and_rejects_a_short_loss_window(tmp_path):
    import pytest

    module = _load_launch_module()
    input_timeout, input_lost = module._load_keyboard_timing(
        ROOT / "config/ros/keyboard_control.yaml"
    )
    assert input_lost > input_timeout

    short = tmp_path / "keyboard_control.yaml"
    short.write_text("input_timeout_ms: 150\ninput_lost_ms: 100\n", encoding="utf-8")
    with pytest.raises(ValueError, match="input_lost_ms must exceed"):
        module._load_keyboard_timing(short)
    missing = tmp_path / "missing.yaml"
    missing.write_text("input_timeout_ms: 150\n", encoding="utf-8")
    with pytest.raises(ValueError, match="input_lost_ms"):
        module._load_keyboard_timing(missing)
