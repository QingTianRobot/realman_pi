import unittest

from realman_web_control.protocol import ProtocolError, parse_message


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


if __name__ == "__main__":
    unittest.main()
