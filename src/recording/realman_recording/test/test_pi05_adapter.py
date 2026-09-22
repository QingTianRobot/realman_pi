import pytest

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


def _config(**overrides):
    values = {
        "expected_state_dim": 24,
        "expected_action_dim": 18,
        "normalizer_asset_version": "openpi-normalizer-sha256:test",
    }
    values.update(overrides)
    return Pi05AdapterConfig(**values)


def test_pi05_adapter_builds_explicit_quaternion_state_and_command_action():
    sample = Pi05Adapter(_config(rotation_representation="quaternion_xyzw")).adapt(_frame())
    assert sample["observation.state"] == (1.0, 2.0, 3.0, 0.0, 0.0, 0.0, 1.0) * 3 + (0.1, 0.2, 0.3)
    assert sample["action"] == tuple(float(index) for index in range(18))


def test_pi05_adapter_rot6d_and_dimension_contract_are_explicit():
    sample = Pi05Adapter(_config(rotation_representation="rot6d", expected_state_dim=30)).adapt(_frame())
    assert sample["observation.state"][:9] == (1.0, 2.0, 3.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0)
    try:
        Pi05Adapter(_config(expected_state_dim=1)).adapt(_frame())
    except ValueError as error:
        assert "state dimension" in str(error)
    else:
        raise AssertionError("adapter accepted a checkpoint-incompatible state dimension")


def test_pi05_adapter_accepts_lerobot_feature_mapping():
    frame = _frame()
    sample = Pi05Adapter(_config()).adapt({
        "observation.ee_pose_base": frame.ee_pose_base,
        "observation.gripper_position": frame.gripper_position,
        "action.command.cartesian_velocity": frame.command_cartesian_velocity,
        "quality.valid": (True,),
    })
    assert sample["action"] == frame.command_cartesian_velocity


def test_pi05_adapter_requires_explicit_checkpoint_dimensions():
    try:
        Pi05AdapterConfig(normalizer_asset_version="openpi-normalizer-sha256:test")
    except ValueError as error:
        assert "explicit" in str(error)
    else:
        raise AssertionError("adapter guessed checkpoint dimensions")


def test_pi05_adapter_can_explicitly_include_recorded_gripper_command():
    frame = _frame()
    frame = frame.__class__(**{**frame.__dict__, "command_gripper": (0.4, 0.5, 0.6)})
    sample = Pi05Adapter(_config(expected_action_dim=21, include_gripper_command=True)).adapt(frame)
    assert sample["action"][-3:] == (0.4, 0.5, 0.6)


def test_pi05_adapter_converts_velocity_to_explicit_policy_step_delta():
    sample = Pi05Adapter(_config(
        action_representation="cartesian_delta", dataset_fps=10,
    )).adapt(_frame())
    assert sample["action"][:3] == (0.0, 0.1, 0.2)


def test_pi05_adapter_requires_a_versioned_normalizer_asset():
    with pytest.raises(ValueError, match="normalizer_asset_version"):
        Pi05AdapterConfig(expected_state_dim=24, expected_action_dim=18)


def test_pi05_adapter_exposes_the_reproducible_adapter_contract():
    contract = Pi05Adapter(_config(action_representation="cartesian_delta", dataset_fps=10)).contract()
    assert contract["normalizer_asset_version"] == "openpi-normalizer-sha256:test"
    assert contract["action_representation"] == "cartesian_delta"
    assert contract["dataset_fps"] == 10
