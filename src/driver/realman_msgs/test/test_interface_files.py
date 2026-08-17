from pathlib import Path


ROOT = Path(__file__).parents[1]


def test_motion_actions_are_typed_and_present():
    motion = (ROOT / "action/ExecuteMotion.action").read_text()
    velocity = (ROOT / "action/CartesianVelocity.action").read_text()

    assert "float64[6] joint_degrees" in motion
    assert "float64[4] pose_quaternion_wxyz" in motion
    assert "uint8 MOVEJ=0" in motion
    assert "float64[3] commanded_linear_velocity_mps" in velocity
    assert "uint32 watchdog_ms" in velocity
    assert "float64[3] commanded_angular_velocity_radps" in velocity
    assert "float64[3] limited_linear_velocity_mps" in velocity
    assert "float64[3] limited_angular_velocity_radps" in velocity
    assert "uint8 WATCHDOG_STOP=3" in velocity
    assert "{" not in motion
    assert "{" not in velocity


def test_coordinate_services_are_explicit():
    select = (ROOT / "srv/SelectFrame.srv").read_text()
    verify = (ROOT / "srv/VerifyCoordinates.srv").read_text()

    assert "string name" in select
    assert verify.startswith("---")
    assert "int32 api2_status" in verify
    assert "{" not in select
    assert "{" not in verify
