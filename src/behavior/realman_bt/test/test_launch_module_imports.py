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
