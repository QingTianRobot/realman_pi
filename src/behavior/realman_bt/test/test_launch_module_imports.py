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
    assert "keyboard_router" in source
