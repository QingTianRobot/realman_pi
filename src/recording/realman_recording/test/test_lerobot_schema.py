from realman_recording.lerobot_schema import schema_from_parameters


def _schema():
    return schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=["/gripper_left/command", "/gripper_mid/command", "/gripper_right/command"],
        camera_ids=["orbbec-left", "orbbec-middle", "orbbec-right", "d435"],
    )


def test_schema_keeps_declared_arm_and_gripper_order():
    schema = _schema()
    assert schema.state_dim == 21
    assert schema.action_dim == 21
    assert schema.arm_joint_topics == ("/l/joint_states", "/m/joint_states", "/r/joint_states")


def test_schema_features_are_v3_writer_features():
    features = _schema().features({camera: (240, 320, 3) for camera in _schema().camera_ids})
    assert features["observation.state"]["shape"] == (21,)
    assert features["action"]["shape"] == (21,)
    assert features["observation.images.d435"]["dtype"] == "video"


def test_schema_does_not_fabricate_gripper_actions_when_unavailable():
    schema = schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=[], camera_ids=["left"],
    )
    assert schema.state_dim == 21
    assert schema.action_dim == 18
