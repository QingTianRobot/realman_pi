from pathlib import Path
import sys

import pytest


ROOT = Path(__file__).parents[4]
sys.path.insert(0, str(ROOT / "src/behavior/realman_bt/scripts"))
from tree_metadata import read_metadata  # noqa: E402


def test_canonical_tree_metadata_declares_its_runtime_contract():
    assert read_metadata(ROOT / "config/behavior-trees/move.xml") == (
        "r", "r", "arm_move.launch.py", "true", "true"
    )
    assert read_metadata(ROOT / "config/behavior-trees/three.xml") == (
        "r", "l,m,r", "arm_move.launch.py", "true", "true"
    )
    assert read_metadata(ROOT / "config/behavior-trees/control.xml") == (
        "r", "l,m,r", "control_router.launch.py", "false", "false"
    )


def test_tree_metadata_defaults_to_safe_single_arm_one_shot(tmp_path):
    tree = tmp_path / "custom.xml"
    tree.write_text('<root main_tree_to_execute="MainTree"/>', encoding="utf-8")

    assert read_metadata(tree) == ("r", "r", "arm_move.launch.py", "true", "true")


@pytest.mark.parametrize(
    "attribute, value",
    [
        ("realman_arm_id", "x"),
        ("realman_required_arms", "l,r,l"),
        ("realman_launch", "shell"),
        ("realman_stop_on_terminal", "yes"),
        ("realman_exit_on_terminal", "no"),
    ],
)
def test_tree_metadata_rejects_unsafe_or_unknown_runtime_values(tmp_path, attribute, value):
    tree = tmp_path / "invalid.xml"
    tree.write_text(
        f'<root main_tree_to_execute="MainTree" {attribute}="{value}"/>',
        encoding="utf-8",
    )

    with pytest.raises(ValueError):
        read_metadata(tree)
