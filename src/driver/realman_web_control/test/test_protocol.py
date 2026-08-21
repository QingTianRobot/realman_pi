import json

import pytest

from realman_web_control.protocol import ProtocolError, parse_message


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


def test_unknown_messages_and_oversized_payloads_are_rejected():
    with pytest.raises(ProtocolError, match="unsupported"):
        parse_message('{"type":"launch_missiles","arm":"l"}')
    with pytest.raises(ProtocolError, match="exceeds"):
        parse_message("x" * 32, max_bytes=16)


def test_calibration_messages_require_all_three_arms():
    capture = parse_message(
        '{"type":"capture_calibration_sample","request_id":"cap-1",'
        '"session_id":"","start_new_session":true,"arm_ids":["l","m","r"]}'
    )
    assert capture["arm_ids"] == ["l", "m", "r"]
    solved = parse_message(
        '{"type":"solve_calibration","request_id":"solve-1","session_id":"session-1"}'
    )
    assert solved == {
        "type": "solve_calibration",
        "request_id": "solve-1",
        "session_id": "session-1",
    }
    with pytest.raises(ProtocolError, match="arm_ids"):
        parse_message(
            '{"type":"capture_calibration_sample","request_id":"cap-2",'
            '"arm_ids":["l"]}'
        )


def test_kinematics_messages_are_normalized():
    current = parse_message(
        '{"type":"get_current_pose","request_id":"pose-1","arm":"m"}'
    )
    assert current == {
        "type": "get_current_pose",
        "request_id": "pose-1",
        "arm": "m",
    }
    solved = parse_message(
        json.dumps(
            {
                "type": "solve_ik",
                "request_id": "ik-1",
                "arm": "m",
                "goal": {
                    "reference_type": 1,
                    "reference_name": "cell",
                    "seed_joint_degrees": [0, 1, 2, 3, 4, 5],
                    "pose_position_m": [0.1, 0.2, 0.3],
                    "pose_quaternion_wxyz": [1, 0, 0, 0],
                },
            }
        )
    )
    assert solved["goal"]["seed_joint_degrees"] == [0.0, 1.0, 2.0, 3.0, 4.0, 5.0]


def test_joint_record_messages_are_normalized():
    listed = parse_message(
        '{"type":"list_joint_records","request_id":"list-1","arm":"l"}'
    )
    saved = parse_message(
        '{"type":"save_joint_record","request_id":"save-1","arm":"m","label":"ready pose"}'
    )
    applied = parse_message(
        '{"type":"apply_joint_record","request_id":"apply-1","arm":"r","record_id":"ready-pose","command":2}'
    )

    assert listed == {
        "type": "list_joint_records",
        "request_id": "list-1",
        "arm": "l",
    }
    assert saved == {
        "type": "save_joint_record",
        "request_id": "save-1",
        "arm": "m",
        "label": "ready pose",
    }
    assert applied == {
        "type": "apply_joint_record",
        "request_id": "apply-1",
        "arm": "r",
        "record_id": "ready-pose",
        "command": 2,
    }


def test_joint_record_messages_reject_missing_fields():
    with pytest.raises(ProtocolError, match="label"):
        parse_message('{"type":"save_joint_record","request_id":"save-1","arm":"l"}')
    with pytest.raises(ProtocolError, match="command"):
        parse_message(
            '{"type":"apply_joint_record","request_id":"apply-1","arm":"l","record_id":"ready","command":4}'
        )


def test_kinematics_messages_require_complete_vectors():
    with pytest.raises(ProtocolError, match="seed_joint_degrees"):
        parse_message(
            json.dumps(
                {
                    "type": "solve_ik",
                    "request_id": "ik-1",
                    "arm": "l",
                    "goal": {
                        "reference_type": 0,
                        "reference_name": "base",
                        "seed_joint_degrees": [0, 1],
                        "pose_position_m": [0, 0, 0],
                        "pose_quaternion_wxyz": [1, 0, 0, 0],
                    },
                }
            )
        )


def test_connected_trajectory_and_recovery_messages_are_normalized():
    motion = valid_motion()["goal"]
    parsed = parse_message(
        json.dumps(
            {
                "type": "execute_trajectory",
                "request_id": "trajectory-1",
                "arm": "r",
                "goal": {
                    "reference_type": 0,
                    "reference_name": "base",
                    "waypoints": [motion, motion],
                    "timeout_sec": 12,
                },
            }
        )
    )
    recovery = parse_message(
        '{"type":"recover_motion","request_id":"recover-1","arm":"r"}'
    )

    assert parsed["goal"]["timeout_sec"] == 12.0
    assert len(parsed["goal"]["waypoints"]) == 2
    assert parsed["goal"]["waypoints"][0]["joint_degrees"][1] == 1.0
    assert recovery == {
        "type": "recover_motion",
        "request_id": "recover-1",
        "arm": "r",
    }


def test_connected_trajectory_rejects_short_or_invalid_waypoint_lists():
    message = {
        "type": "execute_trajectory",
        "request_id": "trajectory-1",
        "arm": "l",
        "goal": {
            "reference_type": 0,
            "reference_name": "base",
            "waypoints": [valid_motion()["goal"]],
            "timeout_sec": 5,
        },
    }
    with pytest.raises(ProtocolError, match="2 through 256"):
        parse_message(json.dumps(message))

    message["goal"]["waypoints"] = [
        valid_motion()["goal"],
        {**valid_motion()["goal"], "velocity_percent": 0},
    ]
    with pytest.raises(ProtocolError, match="velocity_percent"):
        parse_message(json.dumps(message))
