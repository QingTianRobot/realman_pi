from realman_recording.adapters.pi05 import Pi05Adapter, Pi05AdapterConfig
from realman_recording.canonical_features import CanonicalFrame


def _frame():
    return CanonicalFrame(
        joint_position=(0.0,) * 18, joint_velocity=(0.0,) * 18,
        ee_pose_base=(1.0, 2.0, 3.0, 0.0, 0.0, 0.0, 1.0) * 3,
        ee_velocity_base=(0.0,) * 18, gripper_position=(0.1, 0.2, 0.3),
        command_cartesian_velocity=tuple(float(index) for index in range(18)),
        command_gripper=None, valid=True, sync_error_ns=(0,),
    )


def test_pi05_adapter_builds_explicit_quaternion_state_and_command_action():
    sample = Pi05Adapter(Pi05AdapterConfig(rotation_representation="quaternion_xyzw", expected_state_dim=24, expected_action_dim=18)).adapt(_frame())
    assert sample["observation.state"] == (1.0, 2.0, 3.0, 0.0, 0.0, 0.0, 1.0) * 3 + (0.1, 0.2, 0.3)
    assert sample["action"] == tuple(float(index) for index in range(18))


def test_pi05_adapter_rot6d_and_dimension_contract_are_explicit():
    sample = Pi05Adapter(Pi05AdapterConfig(rotation_representation="rot6d", expected_state_dim=30, expected_action_dim=18)).adapt(_frame())
    assert sample["observation.state"][:9] == (1.0, 2.0, 3.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0)
    try:
        Pi05Adapter(Pi05AdapterConfig(expected_state_dim=1, expected_action_dim=18)).adapt(_frame())
    except ValueError as error:
        assert "state dimension" in str(error)
    else:
        raise AssertionError("adapter accepted a checkpoint-incompatible state dimension")


def test_pi05_adapter_accepts_lerobot_feature_mapping():
    frame = _frame()
    sample = Pi05Adapter(Pi05AdapterConfig()).adapt({
        "observation.ee_pose_base": frame.ee_pose_base,
        "observation.gripper_position": frame.gripper_position,
        "action.command.cartesian_velocity": frame.command_cartesian_velocity,
        "quality.valid": (True,),
    })
    assert sample["action"] == frame.command_cartesian_velocity
