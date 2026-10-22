"""Filesystem contracts for episode-level tags and the unified index."""
import json
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from realman_recording import episode_tags
from realman_recording.episode_tags import EpisodeTagStore, TagConflict, derived_date, validate_tags


class EpisodeTagsTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.store = EpisodeTagStore(self.root)

    def session(self, session_id="s1", *, success=None, exported=False):
        directory = self.root / session_id
        (directory / "export").mkdir(parents=True)
        manifest = {"session_id": session_id, "state": "READY", "decision": "ADOPTED" if exported else "PENDING",
                    "started_realtime_ns": 1_790_091_000_000_000_000,
                    "annotations": {"success": success}, "metadata": {"task": "unchanged"},
                    "export": {"state": "SUCCEEDED"} if exported else {"state": "PENDING"}}
        (directory / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        if exported:
            dataset = self.root / "lerobot" / "set-a"
            dataset.mkdir(parents=True, exist_ok=True)
            (directory / "export" / "lerobot-v3.json").write_text(json.dumps({"dataset_root": str(dataset), "episode_index": 7}), encoding="utf-8")
        return directory

    def test_schema_and_date(self):
        for value in (None, 1, "true"):
            with self.assertRaises(ValueError):
                validate_tags({"success": value})
        for value in (True, "2", 0, 4):
            with self.assertRaises(ValueError):
                validate_tags({"lighting_level": value})
        for key in ("", "dataset_path", "../bad", "A" * 65):
            with self.assertRaises(ValueError):
                validate_tags({key: "x"})
        self.assertEqual(derived_date({"started_realtime_ns": 1_790_091_000_000_000_000}), "2026-09-22")
        midnight_ns = int(datetime(2026, 10, 21, 16, 0, tzinfo=timezone.utc).timestamp()) * 1_000_000_000
        self.assertEqual(derived_date({"started_realtime_ns": midnight_ns - 1}), "2026-10-21")
        self.assertEqual(derived_date({"started_realtime_ns": midnight_ns}), "2026-10-22")
        self.assertIsNone(derived_date({"started_realtime_ns": "bad"}))

    def test_snapshot_manual_reset_and_cas(self):
        directory = self.session()
        self.store.save_defaults({"success": True, "arm": "left", "lighting_level": 2, "object_type": "cup"})
        self.store.snapshot("s1")
        initial = self.store.get("s1")
        self.assertEqual(initial["tags"]["arm"], "left")
        changed = self.store.update("s1", 0, {"success": False, "arm": None, "object_type": "bottle"}, [])
        self.assertTrue(changed["meta_synced"])
        self.assertFalse(changed["tags"]["success"])
        self.assertEqual(changed["tag_sources"]["arm"], "manual")
        with self.assertRaises(TagConflict):
            self.store.update("s1", 0, {"success": True}, [])
        self.store.save_defaults({"success": True, "arm": "right", "lighting_level": 3})
        self.assertIsNone(self.store.get("s1")["tags"]["arm"])
        preview = self.store.backfill(dry_run=True)
        self.assertEqual(preview["affected"], 1)
        self.assertEqual(preview["changes"][0]["fields"]["lighting_level"]["to"], 3)
        self.store.backfill(dry_run=False)
        self.assertFalse(self.store.get("s1")["tags"]["success"])
        self.assertIsNone(self.store.get("s1")["tags"]["arm"])
        revision = self.store.get("s1")["revision"]
        restored = self.store.update("s1", revision, {}, ["arm"], ["object_type"])
        self.assertEqual(restored["tags"]["arm"], "left")
        self.assertNotIn("object_type", restored["tags"])
        self.assertIn("object_type", self.store.get("s1")["removed"])
        manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
        self.assertFalse(manifest["annotations"]["success"])
        self.assertEqual(manifest["metadata"]["task"], "unchanged")

    def test_exported_index_and_error_reporting(self):
        self.session(exported=True)
        self.session("pending", exported=False)
        index = self.store.rebuild()
        rows = {item["session_id"]: item for item in index["episodes"]}
        self.assertEqual(rows["s1"]["dataset_path"], "lerobot/set-a")
        self.assertEqual(rows["s1"]["episode_index"], 7)
        self.assertIsNone(rows["pending"]["episode_index"])
        self.assertTrue(all(type(item["tags"]["success"]) is bool for item in rows.values()))
        self.assertEqual(index, self.store.rebuild())
        (self.root / "s1" / "export" / "lerobot-v3.json").write_text("{broken", encoding="utf-8")
        broken = self.store.rebuild()
        self.assertEqual(len(broken["episodes"]), 1)
        self.assertEqual(broken["errors"][0]["session_id"], "s1")

    def test_explicit_legacy_migration_preserves_success_and_media(self):
        false_dir = self.session("failed-task", success=False)
        unknown_dir = self.session("old-null", success=None)
        media = false_dir / "state.mcap"
        media.write_bytes(b"unchanged raw recording")
        result = self.store.migrate_missing()
        self.assertEqual(result["migrated"], 2)
        self.assertEqual(self.store.migrate_missing()["migrated"], 0)
        self.assertFalse(self.store.get("failed-task")["tags"]["success"])
        self.assertEqual(self.store.get("failed-task")["tag_sources"]["success"], "manual")
        self.assertTrue(self.store.get("old-null")["tags"]["success"])
        self.assertEqual(self.store.get("old-null")["tag_sources"]["success"], "default")
        self.assertEqual(media.read_bytes(), b"unchanged raw recording")
        self.assertTrue(json.loads((unknown_dir / "manifest.json").read_text())["annotations"]["success"])

    def test_concurrent_revision_allows_one_writer(self):
        self.session()
        self.store.snapshot("s1")
        def change(value):
            try:
                self.store.update("s1", 0, {"arm": value}, [])
                return "saved"
            except TagConflict:
                return "conflict"
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(change, ("left", "right")))
        self.assertCountEqual(results, ["saved", "conflict"])

    def test_duplicate_dataset_mapping_excludes_both_records(self):
        self.session("first", exported=True)
        self.session("second", exported=True)
        index = self.store.rebuild()
        self.assertEqual(index["episodes"], [])
        self.assertCountEqual([item["session_id"] for item in index["errors"]], ["first", "second"])

    def test_declared_float_keeps_json_number_type(self):
        self.session()
        saved = self.store.update("s1", 0, {"gain": 2}, [], types={"gain": "float"})
        self.assertIs(type(saved["tags"]["gain"]), float)
        self.assertEqual(self.store.get("s1")["tag_types"]["gain"], "float")
        self.assertIn('"gain": 2.0', (self.root / "episode_meta.json").read_text(encoding="utf-8"))

    def test_index_write_failure_reports_partial_success_and_rebuild_repairs(self):
        self.session()
        original_write = episode_tags.atomic_json_write

        def fail_index(path, payload):
            if Path(path).name == "episode_meta.json":
                raise OSError("disk full")
            return original_write(path, payload)

        with patch.object(episode_tags, "atomic_json_write", side_effect=fail_index):
            result = self.store.update("s1", 0, {"success": False}, [])
        self.assertFalse(result["meta_synced"])
        self.assertIn("disk full", result["meta_error"])
        self.assertFalse(self.store.get("s1")["tags"]["success"])
        self.assertFalse(json.loads((self.root / "s1" / "manifest.json").read_text())["annotations"]["success"])
        rebuilt = self.store.rebuild()
        self.assertFalse(rebuilt["episodes"][0]["tags"]["success"])
        self.assertEqual(rebuilt, self.store.rebuild())


if __name__ == "__main__":
    unittest.main()
