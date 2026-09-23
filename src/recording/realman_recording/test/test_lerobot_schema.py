from realman_recording.lerobot_schema import schema_from_parameters


def _schema():
    return schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        cartesian_command_frames=["l/work/cell", "m/work/cell", "r/work/cell"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=["/gripper_left/command", "/gripper_mid/command", "/gripper_right/command"],
        camera_ids=["orbbec-left", "orbbec-middle", "orbbec-right", "d435"],
    )


def test_schema_keeps_declared_arm_and_gripper_order():
    schema = _schema()
    assert schema.joint_dim == 18
    assert schema.ee_pose_dim == 21
    assert schema.ee_velocity_dim == 18
    assert schema.command_dim == 18
    assert schema.arm_joint_topics == ("/l/joint_states", "/m/joint_states", "/r/joint_states")


def test_schema_features_are_v3_writer_features():
    features = _schema().features({camera: (240, 320, 3) for camera in _schema().camera_ids})
    assert features["observation.joint_position"]["shape"] == (18,)
    assert features["observation.joint_velocity"]["shape"] == (18,)
    assert features["observation.ee_pose_base"]["shape"] == (21,)
    assert features["observation.ee_velocity_base"]["shape"] == (18,)
    assert features["observation.gripper_position"]["shape"] == (3,)
    assert features["action.command.cartesian_velocity"]["shape"] == (18,)
    assert features["action.command.gripper"]["shape"] == (3,)
    assert features["quality.valid"]["shape"] == (1,)
    assert features["quality.sync_error_ns"]["shape"] == (16,)
    assert features["observation.joint_position"]["names"] == [
        f"{arm}.joint_{joint}" for arm in ("l", "m", "r") for joint in range(1, 7)
    ]
    assert features["observation.ee_pose_base"]["names"] == [
        f"{arm}.{axis}" for arm in ("l", "m", "r")
        for axis in ("x", "y", "z", "qx", "qy", "qz", "qw")
    ]
    assert features["observation.ee_velocity_base"]["names"] == [
        f"{arm}.{axis}" for arm in ("l", "m", "r")
        for axis in ("vx", "vy", "vz", "wx", "wy", "wz")
    ]
    assert features["action.command.cartesian_velocity"]["names"] == [
        f"{arm}.{axis}" for arm in ("l", "m", "r")
        for axis in ("vx", "vy", "vz", "wx", "wy", "wz")
    ]
    assert features["observation.gripper_position"]["names"] == [
        "gripper_left", "gripper_mid", "gripper_right"
    ]
    assert features["action.command.gripper"]["names"] == [
        "gripper_left", "gripper_mid", "gripper_right"
    ]
    assert features["quality.sync_error_ns"]["names"] == list(_schema().sync_source_ids)
    assert features["quality.valid"]["names"] == ["valid"]
    assert features["observation.images.d435"]["dtype"] == "video"
    assert "observation.state" not in features
    assert "action" not in features


def test_schema_does_not_fabricate_gripper_actions_when_unavailable():
    schema = schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=[], camera_ids=["left"],
    )
    assert schema.gripper_command_dim == 0
    assert "action.command.gripper" not in schema.features({"left": (240, 320, 3)})
