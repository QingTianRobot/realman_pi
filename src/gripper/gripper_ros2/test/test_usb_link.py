"""serial_port_link: char device -> /sys/dev/char -> owning USB device."""

import os
from pathlib import Path
import unittest
from unittest import mock

from gripper_ros2.usb_link import serial_port_link


class SerialPortLinkTest(unittest.TestCase):
    def setUp(self):
        import tempfile

        self._tmp = tempfile.TemporaryDirectory()
        self.sys = Path(self._tmp.name)
        usb = self.sys / "devices" / "pci0000:00" / "usb5" / "5-1" / "5-1.2"
        tty = usb / "5-1.2:1.0" / "ttyUSB0" / "tty" / "ttyUSB0"
        tty.mkdir(parents=True)
        for key, value in {"idVendor": "1a86", "idProduct": "7523", "speed": "12", "busnum": "5",
                           "product": "USB Serial", "version": " 1.10"}.items():
            (usb / key).write_text(value + "\n")
        root_hub = self.sys / "bus" / "usb" / "devices" / "usb5"
        root_hub.mkdir(parents=True)
        (root_hub / "serial").write_text("0000:06:00.0\n")
        (self.sys / "dev" / "char").mkdir(parents=True)
        os.symlink(tty, self.sys / "dev" / "char" / "188:0")

    def tearDown(self):
        self._tmp.cleanup()

    def test_resolves_usb_adapter(self):
        with mock.patch("gripper_ros2.usb_link.char_device_number", return_value=(188, 0)):
            link = serial_port_link("/dev/realman/gripper_left", self.sys)
        self.assertEqual(link["tty"], "ttyUSB0")
        self.assertEqual(link["error"], "")
        self.assertEqual(link["usb"]["usb_path"], "5-1.2")
        self.assertEqual(link["usb"]["speed_mbps"], 12.0)
        self.assertEqual(link["usb"]["controller"], "0000:06:00.0")

    def test_missing_port_reports_error(self):
        link = serial_port_link(str(self.sys / "nope"), self.sys)
        self.assertIsNone(link["usb"])
        self.assertIn("nope", link["error"])

    def test_regular_file_is_not_a_serial_port(self):
        path = self.sys / "plain"
        path.write_text("x")
        self.assertIn("not a character device", serial_port_link(str(path), self.sys)["error"])


if __name__ == "__main__":
    unittest.main()
