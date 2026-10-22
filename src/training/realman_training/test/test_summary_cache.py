from __future__ import annotations

import json
import os

from lerobot_fixture import Episode, build_dataset, build_view, gripper

from realman_training import summary_cache
from realman_training.config import QualityConfig

Q = QualityConfig()


def _raw(tmp_path):
    return build_dataset(tmp_path / "raw", [
        Episode("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))),
        Episode("pick_only", gripper((50, 60), (8450, 100))),
    ])


def test_build_has_summary_quality_drops_and_traces(tmp_path):
    data = summary_cache.build(_raw(tmp_path), Q)
    assert data["version"] == summary_cache.CACHE_VERSION
    assert data["summary"]["episodes"] == 2
    assert [q["verdict"] for q in data["quality"]] == ["ok", "suggest_drop"]
    assert data["suggested_drops"] == [1]
    assert data["quality_counts"] == {"ok": 1, "suggest_drop": 1, "warn": 0}
    trace = data["traces"]["0"]
    assert len(trace) == summary_cache.TRACE_POINTS
    assert trace[0] == 0.0 and max(trace) > 0.6 and all(0.0 <= v <= 1.0 for v in trace)


def test_a_view_has_no_quality_but_a_reason(tmp_path):
    view = build_view(tmp_path / "v", source="x", prompts={"a": "do a"}, lengths=[10])
    data = summary_cache.build(view, Q)
    assert data["quality"] is None and data["quality_counts"] is None and data["traces"] == {}
    assert "training view" in data["quality_unavailable"]


def test_the_cache_file_is_reused_until_a_data_file_changes(tmp_path, monkeypatch):
    raw = _raw(tmp_path)
    calls = []
    real = summary_cache.build
    monkeypatch.setattr(summary_cache, "build", lambda root, q: calls.append(root) or real(root, q))
    cache = summary_cache.SummaryCache(Q)
    first = cache.get(raw)
    assert (raw / ".console" / "summary.json").is_file()
    assert summary_cache.SummaryCache(Q).get(raw)["fingerprint"] == first["fingerprint"]  # new process: from file
    assert len(calls) == 1
    data_file = next((raw / "data").rglob("*.parquet"))
    stat = data_file.stat()
    os.utime(data_file, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1_000_000_000))
    assert cache.get(raw)["fingerprint"] != first["fingerprint"]
    assert len(calls) == 2


def test_changed_quality_thresholds_rebuild(tmp_path):
    raw = _raw(tmp_path)
    assert summary_cache.fingerprint(raw, Q) != summary_cache.fingerprint(raw, QualityConfig(empty_position_min=8400))


def test_a_stale_or_broken_file_is_rebuilt(tmp_path):
    raw = _raw(tmp_path)
    (raw / ".console").mkdir()
    (raw / ".console" / "summary.json").write_text("{not json")
    data = summary_cache.SummaryCache(Q).get(raw)
    assert data["summary"]["episodes"] == 2
    assert json.loads((raw / ".console" / "summary.json").read_text())["fingerprint"] == data["fingerprint"]


def test_a_read_only_dataset_is_cached_in_memory(tmp_path, monkeypatch):
    raw = _raw(tmp_path)

    def refuse(path, data):
        raise PermissionError("read-only")

    monkeypatch.setattr(summary_cache, "write_json", refuse)
    cache = summary_cache.SummaryCache(Q)
    assert cache.get(raw)["summary"]["episodes"] == 2
    assert not (raw / ".console" / "summary.json").exists()
    calls = []
    monkeypatch.setattr(summary_cache, "build", lambda root, q: calls.append(root))
    assert cache.get(raw)["summary"]["episodes"] == 2 and calls == []
