from pathlib import Path
import tempfile
import unittest
from unittest import mock

from gripper_ros2.gripper_limits import (
    apply_overrides,
    check_raw_position,
    load_overrides,
    overrides_path,
    position_ranges,
    save_overrides,
    validate_limits,
)


RANGES = {"gripper_right": (0, 8500), "gripper_left": (0, 900)}
RIGHT = {"gripper_right": {"open_position": 50, "close_position": 8500}}


class ValidateLimitsTest(unittest.TestCase):
    def test_accepts_values_inside_the_travel(self):
        self.assertIsNone(validate_limits(50, 8500, 0, 8500))

    def test_rejects_non_integers(self):
        for bad in (True, 50.0, "50", None):
            with self.subTest(bad=bad):
                self.assertIn("integers", validate_limits(bad, 8500, 0, 8500))
                self.assertIn("integers", validate_limits(50, bad, 0, 8500))

    def test_rejects_values_outside_min_max(self):
        self.assertIn("open_position -1", validate_limits(-1, 8500, 0, 8500))
        self.assertIn("close_position 8501", validate_limits(50, 8501, 0, 8500))

    def test_requires_open_below_close(self):
        self.assertIn("smaller", validate_limits(8500, 50, 0, 8500))
        self.assertIn("smaller", validate_limits(100, 100, 0, 8500))

    def test_requires_five_percent_span(self):
        self.assertIn("at least 425", validate_limits(0, 424, 0, 8500))
        self.assertIsNone(validate_limits(0, 425, 0, 8500))


class CheckRawPositionTest(unittest.TestCase):
    def test_accepts_inclusive_bounds(self):
        self.assertIsNone(check_raw_position(0, 0, 8500))
        self.assertIsNone(check_raw_position(8500, 0, 8500))

    def test_rejects_out_of_range_and_non_integers(self):
        self.assertIn("outside 0..8500", check_raw_position(8501, 0, 8500))
        self.assertIn("outside 0..8500", check_raw_position(-1, 0, 8500))
        for bad in (True, 1.5, "7", None):
            with self.subTest(bad=bad):
                self.assertIn("integer", check_raw_position(bad, 0, 8500))


class ConfigHelpersTest(unittest.TestCase):
    CONFIG = {
        "buses": [
            {"port": "/a", "grippers": [
                {"name": "gripper_right", "min_position": 0, "max_position": 8500,
                 "open_position": 4000, "close_position": 8500},
            ]},
            {"port": "/b", "grippers": [
                {"name": "gripper_left", "min_position": 0, "max_position": 900,
                 "open_position": 400, "close_position": 900},
            ]},
        ]
    }

    def test_position_ranges(self):
        self.assertEqual(position_ranges(self.CONFIG), RANGES)

    def test_apply_overrides_changes_only_listed_grippers(self):
        import copy
        config = copy.deepcopy(self.CONFIG)
        apply_overrides(config, RIGHT)
        right = config["buses"][0]["grippers"][0]
        left = config["buses"][1]["grippers"][0]
        self.assertEqual((right["open_position"], right["close_position"]), (50, 8500))
        self.assertEqual((left["open_position"], left["close_position"]), (400, 900))

    def test_overrides_path_defaults_next_to_the_config(self):
        self.assertEqual(
            overrides_path("/opt/rm65_ws/config/ros/gripper.yaml"),
            Path("/opt/rm65_ws/config/ros/gripper_overrides.yaml"),
        )
        self.assertEqual(overrides_path("/x/gripper.yaml", "/y/custom.yaml"), Path("/y/custom.yaml"))


class OverridesFileTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "gripper_overrides.yaml"

    def test_missing_file_is_not_an_error(self):
        self.assertEqual(load_overrides(self.path, RANGES), ({}, []))

    def test_empty_file_is_not_an_error(self):
        self.path.write_text("", encoding="utf-8")
        self.assertEqual(load_overrides(self.path, RANGES), ({}, []))

    def test_round_trip_and_permissions(self):
        save_overrides(self.path, RIGHT)
        accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(accepted, RIGHT)
        self.assertEqual(errors, [])
        self.assertEqual(self.path.stat().st_mode & 0o777, 0o644)

    def test_invalid_entries_are_ignored_with_errors(self):
        self.path.write_text(
            "grippers:\n"
            "  gripper_right: {open_position: 9000, close_position: 8500}\n"
            "  gripper_left: {open_position: 20, close_position: 900}\n"
            "  gripper_gone: {open_position: 1, close_position: 99}\n",
            encoding="utf-8",
        )
        accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(accepted, {"gripper_left": {"open_position": 20, "close_position": 900}})
        self.assertEqual(len(errors), 2)
        self.assertTrue(any("gripper_right" in error for error in errors))
        self.assertTrue(any("gripper_gone" in error for error in errors))

    def test_corrupt_or_misshapen_file_is_ignored(self):
        for text in ("grippers: [unclosed", "- a\n- b\n", "grippers: 3\n"):
            with self.subTest(text=text):
                self.path.write_text(text, encoding="utf-8")
                accepted, errors = load_overrides(self.path, RANGES)
                self.assertEqual(accepted, {})
                self.assertEqual(len(errors), 1)

    def test_non_utf8_file_is_ignored(self):
        self.path.write_bytes(b"\xff\xfe\x00garbage\x80\x81")
        accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(accepted, {})
        self.assertEqual(len(errors), 1)

    def test_yaml_value_error_is_reported_not_raised(self):
        # PyYAML 6 raises ValueError (not YAMLError) for an impossible date.
        self.path.write_text("a: 2001-13-45\n", encoding="utf-8")
        accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(accepted, {})
        self.assertEqual(len(errors), 1)
        self.assertIn("cannot read overrides", errors[0])

    def test_yaml_recursion_error_is_reported_not_raised(self):
        self.path.write_text("grippers: {}\n", encoding="utf-8")
        with mock.patch(
            "gripper_ros2.gripper_limits.yaml.safe_load",
            side_effect=RecursionError("deep"),
        ):
            accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(accepted, {})
        self.assertEqual(len(errors), 1)
        self.assertIn("deep", errors[0])

    def test_unreadable_path_is_reported_not_raised(self):
        self.path.write_text("grippers: {}\n", encoding="utf-8")
        with mock.patch(
            "gripper_ros2.gripper_limits.Path.read_text",
            side_effect=PermissionError("denied"),
        ):
            accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(accepted, {})
        self.assertEqual(len(errors), 1)
        self.assertIn("denied", errors[0])

    def test_untraversable_parent_does_not_raise_from_exists(self):
        self.path.write_text("grippers: {}\n", encoding="utf-8")
        with mock.patch(
            "gripper_ros2.gripper_limits.Path.exists",
            side_effect=PermissionError("not traversable"),
        ):
            self.assertEqual(load_overrides(self.path, RANGES), ({}, []))

    def test_failed_replace_keeps_original_and_leaves_no_temp_files(self):
        save_overrides(self.path, RIGHT)
        original = self.path.read_text(encoding="utf-8")
        with mock.patch("gripper_ros2.gripper_limits.os.replace", side_effect=OSError("boom")):
            with self.assertRaises(OSError):
                save_overrides(self.path, {"gripper_left": {"open_position": 20, "close_position": 900}})
        self.assertEqual(self.path.read_text(encoding="utf-8"), original)
        self.assertEqual([item.name for item in Path(self.tmp.name).iterdir()], ["gripper_overrides.yaml"])

    def test_unwritable_directory_raises_oserror(self):
        with self.assertRaises(OSError):
            save_overrides(Path(self.tmp.name) / "missing" / "o.yaml", RIGHT)


if __name__ == "__main__":
    unittest.main()
