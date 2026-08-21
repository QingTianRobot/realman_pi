from pathlib import Path


ROOT = Path(__file__).parents[1]
DOCKERFILE = ROOT.parents[2] / "config/docker/ros2-humble-rviz.Dockerfile"


def _interface_sections(path: Path) -> list[list[str]]:
    sections = [[]]

    for source_line in path.read_text().splitlines():
        line = source_line.split("#", maxsplit=1)[0].strip()
        if not line:
            continue
        if line == "---":
            sections.append([])
        else:
            sections[-1].append(line)

    return sections


def _assert_interface_contract(path: Path, expected_sections: list[list[str]]) -> None:
    source = path.read_text()

    assert "{" not in source
    assert "}" not in source
    assert _interface_sections(path) == expected_sections


def test_motion_action_contracts_are_exact():
    _assert_interface_contract(
        ROOT / "action/ExecuteTrajectory.action",
        [
            [
                "uint8 MOVEJ=0",
                "uint8 MOVEL=1",
                "uint8 MOVEJ_P=2",
                "uint8 BASE=0",
                "uint8 WORK=1",
                "uint8 TOOL=2",
                "uint8 reference_type",
                "string reference_name",
                "realman_msgs/MotionWaypoint[] waypoints",
                "float32 timeout_sec",
            ],
            [
                "uint8 SUCCEEDED=0",
                "uint8 CANCELED=1",
                "uint8 ABORTED=2",
                "uint8 TIMEOUT=3",
                "bool success",
                "uint8 terminal_state",
                "int32 api2_status",
                "uint32 completed_waypoints",
                "float64[6] final_joint_degrees",
                "string message",
            ],
            [
                "uint8 VALIDATING=0",
                "uint8 SUBMITTING=1",
                "uint8 EXECUTING=2",
                "uint8 STOPPING=3",
                "uint8 phase",
                "float32 progress",
                "uint32 submitted_waypoints",
                "uint32 waypoint_count",
                "float64[6] current_joint_degrees",
                "uint8 active_reference_type",
                "string active_reference_name",
                "int32 api2_status",
                "string detail",
            ],
        ],
    )

    _assert_interface_contract(
        ROOT / "msg/MotionWaypoint.msg",
        [
            [
                "uint8 MOVEJ=0",
                "uint8 MOVEL=1",
                "uint8 MOVEJ_P=2",
                "uint8 command",
                "float64[6] joint_degrees",
                "float64[3] pose_position_m",
                "float64[4] pose_quaternion_wxyz",
                "uint32 velocity_percent",
                "uint32 blend_radius_percent",
            ]
        ],
    )

    _assert_interface_contract(
        ROOT / "action/ExecuteMotion.action",
        [
            [
                "uint8 MOVEJ=0",
                "uint8 MOVEL=1",
                "uint8 MOVEJ_P=2",
                "uint8 BASE=0",
                "uint8 WORK=1",
                "uint8 TOOL=2",
                "uint8 command",
                "uint8 reference_type",
                "string reference_name",
                "float64[6] joint_degrees",
                "float64[3] pose_position_m",
                "float64[4] pose_quaternion_wxyz",
                "uint32 velocity_percent",
                "uint32 blend_radius_percent",
                "bool connect",
                "float32 timeout_sec",
            ],
            [
                "uint8 SUCCEEDED=0",
                "uint8 CANCELED=1",
                "uint8 ABORTED=2",
                "uint8 TIMEOUT=3",
                "bool success",
                "uint8 terminal_state",
                "int32 api2_status",
                "float64[6] final_joint_degrees",
                "string message",
            ],
            [
                "uint8 VALIDATING=0",
                "uint8 SUBMITTING=1",
                "uint8 EXECUTING=2",
                "uint8 STOPPING=3",
                "uint8 phase",
                "float32 progress",
                "float64[6] current_joint_degrees",
                "uint8 active_reference_type",
                "string active_reference_name",
                "int32 api2_status",
                "string detail",
            ],
        ],
    )

    _assert_interface_contract(
        ROOT / "action/CartesianVelocity.action",
        [
            [
                "uint8 BASE=0",
                "uint8 WORK=1",
                "uint8 TOOL=2",
                "uint8 reference_type",
                "string reference_name",
                "uint32 control_period_ms",
                "uint32 watchdog_ms",
                "float64 max_linear_accel_mps2",
                "float64 max_angular_accel_radps2",
                "bool follow",
                "uint8 trajectory_mode",
                "uint16 radio",
            ],
            [
                "uint8 SUCCEEDED=0",
                "uint8 CANCELED=1",
                "uint8 ABORTED=2",
                "uint8 WATCHDOG_STOP=3",
                "bool success",
                "uint8 terminal_state",
                "int32 api2_status",
                "string message",
            ],
            [
                "uint8 VALIDATING=0",
                "uint8 EXECUTING=1",
                "uint8 STOPPING=2",
                "float64[3] commanded_linear_velocity_mps",
                "float64[3] commanded_angular_velocity_radps",
                "float64[3] limited_linear_velocity_mps",
                "float64[3] limited_angular_velocity_radps",
                "uint8 phase",
                "uint8 active_reference_type",
                "string active_reference_name",
                "uint32 command_age_ms",
                "int32 api2_status",
                "string detail",
            ],
        ],
    )


def test_coordinate_service_contracts_are_exact():
    _assert_interface_contract(
        ROOT / "srv/CaptureCalibrationSample.srv",
        [
            ["string session_id", "bool start_new_session", "string[] arm_ids"],
            [
                "bool success",
                "string session_id",
                "string batch_id",
                "string[] captured_arm_ids",
                "uint32[] sample_counts",
                "string[] sample_ids",
                "string[] image_paths",
                "string[] preview_image_paths",
                "string[] latest_image_paths",
                "string[] detection_statuses",
                "string[] detection_messages",
                "string message",
            ],
        ],
    )

    _assert_interface_contract(
        ROOT / "srv/SolveCalibration.srv",
        [
            ["string session_id"],
            [
                "bool success",
                "bool all_arms_solved",
                "string session_id",
                "string result_file",
                "string result_json",
                "float64 mean_reprojection_error_px",
                "uint32[] sample_counts",
                "bool layout_updated",
                "string layout_backup_file",
                "string message",
            ],
        ],
    )

    _assert_interface_contract(
        ROOT / "srv/RecoverMotion.srv",
        [
            [],
            [
                "bool success",
                "bool recovered",
                "int32 api2_status",
                "string message",
            ],
        ],
    )

    _assert_interface_contract(
        ROOT / "srv/SelectFrame.srv",
        [
            ["string name"],
            [
                "bool success",
                "int32 api2_status",
                "string active_name",
                "string message",
            ],
        ],
    )

    _assert_interface_contract(
        ROOT / "srv/VerifyCoordinates.srv",
        [
            [],
            [
                "bool success",
                "bool matched",
                "int32 api2_status",
                "string message",
            ],
        ],
    )

    _assert_interface_contract(
        ROOT / "srv/GetCurrentPose.srv",
        [
            [
                "uint8 BASE=0",
                "uint8 WORK=1",
                "uint8 TOOL=2",
                "uint8 reference_type",
                "string reference_name",
            ],
            [
                "bool success",
                "int32 api2_status",
                "float64[6] current_joint_degrees",
                "float64[3] pose_position_m",
                "float64[4] pose_quaternion_wxyz",
                "string message",
            ],
        ],
    )

    _assert_interface_contract(
        ROOT / "srv/ForwardKinematics.srv",
        [
            [
                "uint8 BASE=0",
                "uint8 WORK=1",
                "uint8 TOOL=2",
                "uint8 reference_type",
                "string reference_name",
                "float64[6] joint_degrees",
            ],
            [
                "bool success",
                "int32 api2_status",
                "float64[3] pose_position_m",
                "float64[4] pose_quaternion_wxyz",
                "string message",
            ],
        ],
    )

    _assert_interface_contract(
        ROOT / "srv/SolveIk.srv",
        [
            [
                "uint8 BASE=0",
                "uint8 WORK=1",
                "uint8 TOOL=2",
                "uint8 reference_type",
                "string reference_name",
                "float64[6] seed_joint_degrees",
                "float64[3] pose_position_m",
                "float64[4] pose_quaternion_wxyz",
            ],
            [
                "bool success",
                "int32 api2_status",
                "float64[6] joint_degrees",
                "string message",
            ],
        ],
    )


def test_interface_contract_tests_are_registered_and_built():
    cmake = (ROOT / "CMakeLists.txt").read_text()
    package = (ROOT / "package.xml").read_text()
    dockerfile = DOCKERFILE.read_text()

    assert "find_package(ament_cmake_pytest REQUIRED)" in cmake
    assert "ament_add_pytest_test(test_interface_files test/test_interface_files.py)" in cmake
    assert "find_package(action_msgs REQUIRED)" in cmake
    assert "DEPENDENCIES action_msgs" in cmake
    assert "<depend>action_msgs</depend>" in package
    assert "<test_depend>ament_cmake_pytest</test_depend>" in package
    assert "<test_depend>python3-pytest</test_depend>" in package
    assert "colcon test --packages-select" in dockerfile
    assert "realman_msgs" in dockerfile
