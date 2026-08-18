import json

import pytest

from realman_web_control.protocol import ProtocolError, parse_message, require_control


def valid_motion():
    return {
        "type": "execute_motion",
        "request_id": "move-1",
        "arm": "l",
        "goal": {
            "command": 0,
            "reference_type": 0,
            "reference_name": "base",
            "joint_degrees": [0, 1, 2, 3, 4, 5],
            "pose_position_m": [0, 0, 0],
            "pose_quaternion_wxyz": [1, 0, 0, 0],
            "velocity_percent": 20,
            "blend_radius_percent": 0,
            "timeout_sec": 5,
        },
    }


def test_motion_message_is_normalized_and_finite():
    parsed = parse_message(json.dumps(valid_motion()))
    assert parsed["arm"] == "l"
    assert parsed["goal"]["joint_degrees"] == [0.0, 1.0, 2.0, 3.0, 4.0, 5.0]


def test_nan_and_wrong_arm_are_rejected():
    message = valid_motion()
    message["goal"]["joint_degrees"][0] = float("nan")
    with pytest.raises(ProtocolError, match="finite"):
        parse_message(json.dumps(message, allow_nan=True))
    message = valid_motion()
    message["arm"] = "center"
    with pytest.raises(ProtocolError, match="arm"):
        parse_message(json.dumps(message))


def test_control_requires_authentication_and_can_be_read_only():
    with pytest.raises(ProtocolError, match="authenticate"):
        require_control(valid_motion(), authenticated=False, enabled=True)
    with pytest.raises(ProtocolError, match="read-only"):
        require_control(valid_motion(), authenticated=True, enabled=False)
    require_control({"type": "ping"}, authenticated=False, enabled=False)


def test_unknown_messages_and_oversized_payloads_are_rejected():
    with pytest.raises(ProtocolError, match="unsupported"):
        parse_message('{"type":"launch_missiles","arm":"l"}')
    with pytest.raises(ProtocolError, match="exceeds"):
        parse_message("x" * 32, max_bytes=16)

