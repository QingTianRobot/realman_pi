from realman_recording.canonical_features import materialize_canonical_frames
from realman_recording.lerobot_align import AlignedFrame
from realman_recording.lerobot_schema import schema_from_parameters


class _Kinematics:
    def pose(self, positions):
        return (positions[0], 0.0, 0.0, 0.0, 0.0, 0.0, 1.0)


def _schema():
    return schema_from_parameters(
        repo_id="realman/canonical", fps=10.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=[], camera_ids=["front"],
    )


def test_materializes_physical_features_and_derived_velocity():
    schema = _schema()
    values = {}
    source_times = {}
    for arm, offset in zip(("l", "m", "r"), (0.0, 10.0, 20.0), strict=True):
        topic = f"/{arm}/joint_states"
        values[topic] = tuple(offset + index for index in range(6))
        source_times[topic] = 0
        action_topic = f"/{arm}/cartesian_velocity/command"
        values[action_topic] = (1.0, 2.0, 3.0, 4.0, 5.0, 6.0)
        source_times[action_topic] = 0
    for name, position in (("left", 0.1), ("mid", 0.2), ("right", 0.3)):
        topic = f"/gripper_{name}/position"
        values[topic] = position
        source_times[topic] = 0
    next_values = {key: (tuple(value + 1.0 for value in item) if isinstance(item, tuple) else item)
                   for key, item in values.items()}
    frames = [
        AlignedFrame(0, values, source_times),
        AlignedFrame(1_000_000_000, next_values, {key: 1_000_000_000 for key in source_times}),
    ]
    result = materialize_canonical_frames(frames, schema, (_Kinematics(), _Kinematics(), _Kinematics()), {"front": [0, 1_000_000_000]})
    assert result[0].joint_position[:6] == (0.0, 1.0, 2.0, 3.0, 4.0, 5.0)
    assert result[0].joint_velocity == (1.0,) * 18
    assert result[1].ee_pose_base[:7] == (1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0)
    assert result[0].ee_velocity_base[:6] == (1.0, 0.0, 0.0, 0.0, 0.0, 0.0)
    assert result[0].gripper_position == (0.1, 0.2, 0.3)
    assert result[0].command_cartesian_velocity == (1.0, 2.0, 3.0, 4.0, 5.0, 6.0) * 3
    assert result[0].sync_error_ns == (0,) * len(schema.sync_source_ids)


def test_rejects_wrong_joint_width_instead_of_silently_exporting_it():
    schema = _schema()
    frame = AlignedFrame(0, {"/l/joint_states": (0.0,)}, {"/l/joint_states": 0})
    try:
        materialize_canonical_frames([frame, frame], schema, (_Kinematics(),) * 3, {"front": [0, 1]})
    except ValueError as error:
        assert "joint" in str(error)
    else:
        raise AssertionError("wrong JointState width was accepted")
