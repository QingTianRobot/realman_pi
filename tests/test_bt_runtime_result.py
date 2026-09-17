import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
MODULE_PATH = ROOT / "docker" / "bt_runtime_result.py"
SPEC = importlib.util.spec_from_file_location("bt_runtime_result", MODULE_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"cannot load {MODULE_PATH}")
bt_runtime_result = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(bt_runtime_result)


class RuntimeResultTest(unittest.TestCase):
    def write_snapshot(self, tick_stats):
        temporary = tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", delete=False)
        with temporary:
            json.dump({"schema_version": 2, "tick_stats": tick_stats}, temporary)
        self.addCleanup(Path(temporary.name).unlink, missing_ok=True)
        return Path(temporary.name)

    def test_reports_success_from_the_unique_terminal_tick(self):
        snapshot = self.write_snapshot(
            {"running": 3, "success": 1, "failure": 0, "total": 4}
        )
        self.assertEqual(bt_runtime_result.read_terminal_result(snapshot), "SUCCESS")

    def test_reports_failure_from_the_unique_terminal_tick(self):
        snapshot = self.write_snapshot(
            {"running": 2, "success": 0, "failure": 1, "total": 3}
        )
        self.assertEqual(bt_runtime_result.read_terminal_result(snapshot), "FAILURE")

    def test_rejects_snapshot_without_exactly_one_terminal_tick(self):
        for success, failure in ((0, 0), (1, 1), (2, 0)):
            with self.subTest(success=success, failure=failure):
                snapshot = self.write_snapshot(
                    {
                        "running": 0,
                        "success": success,
                        "failure": failure,
                        "total": success + failure,
                    }
                )
                with self.assertRaisesRegex(ValueError, "exactly one terminal tick"):
                    bt_runtime_result.read_terminal_result(snapshot)


if __name__ == "__main__":
    unittest.main()
