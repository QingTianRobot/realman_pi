import pytest
from realman_recording.joint_state import ordered_joint_position

def test_reorders_joint_state_by_configured_names():
    assert ordered_joint_position(("joint_2", "joint_1"), (2, 1), ("joint_1", "joint_2")) == (1.0, 2.0)

def test_rejects_missing_joint_name():
    with pytest.raises(ValueError, match="do not match"):
        ordered_joint_position(("joint_1",), (1,), ("joint_1", "joint_2"))
