import unittest

from realman_web_control.protocol import ProtocolError, parse_message, reject_if_read_only


class GripperProtocolTest(unittest.TestCase):
    def test_gripper_percentage_command(self):
        self.assertEqual(
            parse_message(
                '{"type":"gripper_command","request_id":"x",'
                '"name":"gripper_left","command":"percentage","percentage":0.5}'
            ),
            {
                "type": "gripper_command",
                "request_id": "x",
                "name": "gripper_left",
                "command": "percentage",
                "percentage": 0.5,
            },
        )

    def test_gripper_command_rejects_invalid_percentage(self):
        with self.assertRaises(ProtocolError):
            parse_message(
                '{"type":"gripper_command","request_id":"x",'
                '"name":"gripper_left","command":"percentage","percentage":2}'
            )

    def test_set_limits_command(self):
        self.assertEqual(
            parse_message(
                '{"type":"gripper_command","request_id":"x","name":"gripper_right",'
                '"command":"set_limits","open_position":50,"close_position":8500}'
            ),
            {
                "type": "gripper_command",
                "request_id": "x",
                "name": "gripper_right",
                "command": "set_limits",
                "open_position": 50,
                "close_position": 8500,
            },
        )

    def test_set_limits_rejects_bad_fields_and_keeps_the_request_id(self):
        bodies = (
            '"open_position":50.5,"close_position":8500',
            '"open_position":true,"close_position":8500',
            '"open_position":50',
            '"open_position":-1,"close_position":8500',
            '"open_position":50,"close_position":2000000',
        )
        for body in bodies:
            with self.subTest(body=body):
                with self.assertRaises(ProtocolError) as context:
                    parse_message(
                        '{"type":"gripper_command","request_id":"x","name":"gripper_right",'
                        '"command":"set_limits",' + body + "}"
                    )
                self.assertEqual(context.exception.request_id, "x")

    def test_move_raw_command(self):
        self.assertEqual(
            parse_message(
                '{"type":"gripper_command","request_id":"x","name":"gripper_right",'
                '"command":"move_raw","position":3000}'
            )["position"],
            3000,
        )
        with self.assertRaises(ProtocolError) as context:
            parse_message(
                '{"type":"gripper_command","request_id":"x","name":"gripper_right",'
                '"command":"move_raw","position":"3000"}'
            )
        self.assertEqual(context.exception.request_id, "x")

    def test_read_only_rejects_only_the_limit_write_commands(self):
        for command in ("set_limits", "move_raw"):
            with self.subTest(command=command):
                with self.assertRaises(ProtocolError) as context:
                    reject_if_read_only(command, True, "req-1")
                self.assertEqual(context.exception.code, "read_only")
                self.assertEqual(context.exception.request_id, "req-1")
                reject_if_read_only(command, False, "req-1")
        reject_if_read_only("percentage", True, "req-1")


if __name__ == "__main__":
    unittest.main()
