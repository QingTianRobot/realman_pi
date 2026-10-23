"""Remove episodes from a LeRobot v3 recording into a NEW, renumbered dataset (the source is never touched).

Port of server5090 ~/data/realman/drop_episodes.py (2026-10-13/16 cleanings): one parquet per episode is rewritten
with new episode_index/index, videos are hard-linked, per-episode stats are re-aggregated the way LeRobot does,
and <dst>.clean_manifest.json records what was removed, why, and the old -> new numbering.
"""

from __future__ import annotations

import datetime
import errno
import json
import os
import shutil
from pathlib import Path

import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq

from .. import episode_tags
from ..config import load_config
from ..jobs import StepFailed
from ..lerobot_io import NotALeRobotDataset, read_info
from ..quality import QualityUnavailable, inspect_dataset

QUANTILES = ("q01", "q10", "q50", "q90", "q99")


def default_dst(data_root: str | Path, src: str | Path) -> Path:
    return Path(data_root).expanduser() / f"{Path(src).name}_clean_{datetime.datetime.now():%Y%m%d_%H%M%S}"


def _rows(root: Path) -> list[tuple[pa.Schema, dict]]:
    rows = []
    for path in sorted((root / "meta" / "episodes").glob("chunk-*/file-*.parquet")):
        table = pq.read_table(path)
        if table.num_rows != 1:
            raise NotALeRobotDataset(f"{path}: expected one episode per metadata file, found {table.num_rows}")
        rows.append((table.schema, table.to_pylist()[0]))
    rows.sort(key=lambda item: item[1]["episode_index"])
    return rows


def episode_stats(row: dict) -> dict[str, dict[str, np.ndarray]]:
    out: dict[str, dict[str, np.ndarray]] = {}
    for key, value in row.items():
        if key.startswith("stats/"):
            _, feature, stat = key.split("/")
            out.setdefault(feature, {})[stat] = np.asarray(value, dtype=np.float64)
    return out


def aggregate(per_episode: list[dict]) -> dict[str, dict[str, np.ndarray]]:
    """LeRobot aggregate_stats: exact min/max/mean/std/count, count-weighted quantiles."""
    out = {}
    for feature in per_episode[0]:
        count = np.stack([e[feature]["count"] for e in per_episode])
        mean = np.stack([e[feature]["mean"] for e in per_episode])
        std = np.stack([e[feature]["std"] for e in per_episode])
        weight = count.reshape((len(per_episode),) + (1,) * (mean.ndim - 1))
        total = count.sum()
        grand = (mean * weight).sum(0) / total
        variance = (weight * (std**2 + (mean - grand) ** 2)).sum(0) / total
        stats = {
            "min": np.stack([e[feature]["min"] for e in per_episode]).min(0),
            "max": np.stack([e[feature]["max"] for e in per_episode]).max(0),
            "mean": grand,
            "std": np.sqrt(variance),
            "count": np.array([total]),
        }
        for q in QUANTILES:
            if q in per_episode[0][feature]:
                stats[q] = (np.stack([e[feature][q] for e in per_episode]) * weight).sum(0) / total
        out[feature] = stats
    return out


def _to_json(stats: dict, like: dict | None) -> dict:
    result = {}
    for feature, block in stats.items():
        result[feature] = {}
        for stat, value in block.items():
            ref = (like or {}).get(feature, {}).get(stat)
            integer = ref is not None and np.asarray(ref).dtype.kind in "iu"
            result[feature][stat] = (np.rint(value).astype(np.int64) if integer else value).tolist()
    return result


def verify_stats(src: str | Path) -> dict[str, float]:
    """Worst relative difference per statistic between re-aggregated per-episode stats and meta/stats.json."""
    src = Path(src)
    old = json.loads((src / "meta" / "stats.json").read_text(encoding="utf-8"))
    worst: dict[str, float] = {}
    for feature, block in aggregate([episode_stats(row) for _, row in _rows(src)]).items():
        for stat, value in block.items():
            ref = np.asarray(old[feature][stat], dtype=np.float64)
            diff = float(np.max(np.abs(value - ref) / (np.abs(ref) + 1e-9))) if ref.size else 0.0
            worst[stat] = max(worst.get(stat, 0.0), diff)
    return worst


def _selection(params: dict, indices: list[int], tag_drops: set[int] = frozenset()) -> set[int]:
    if "drop" in params and "keep" in params:
        raise StepFailed("pass either drop or keep, not both")
    if "keep" in params and params.get("where"):
        raise StepFailed("pass either keep or where, not both")
    known = set(indices)
    if "keep" in params:
        keep = {int(e) for e in params["keep"]}
        if not keep:
            raise StepFailed("keep at least one episode")
        unknown = keep - known
        if unknown:
            raise StepFailed(f"episodes {sorted(unknown)} are not in the dataset")
        return known - keep
    drop = {int(e) for e in params.get("drop") or []}
    unknown = drop - known
    if unknown:
        raise StepFailed(f"episodes {sorted(unknown)} are not in the dataset (0..{max(known)})")
    drop |= set(tag_drops)
    if not drop:
        raise StepFailed("nothing to drop: pass drop (or keep) episodes, or a where filter that some episode fails")
    if drop == known:
        raise StepFailed("that drops every episode")
    return drop


def _reasons(params: dict, src: Path, drop: set[int], log) -> dict[int, str]:
    given = {int(k): str(v) for k, v in (params.get("reasons") or {}).items()}
    missing = drop - set(given)
    if missing:
        try:
            quality = {q.episode: q for q in inspect_dataset(src, load_config(params.get("config")).quality)}
        except QualityUnavailable as error:
            log(f"no quality reasons: {error}")
            quality = {}
        for episode in missing:
            q = quality.get(episode)
            found = [f.message for f in q.findings if f.severity == "drop"] if q else []
            given[episode] = "; ".join(found) or "dropped by hand"
    return {e: given[e] for e in sorted(drop)}


def _tag_drops(params: dict, src: Path, log) -> tuple[dict | None, dict[int, str]]:
    """The source's tags (None when it has none or they are stale and no where was asked) and the where drops."""
    items = list(params.get("where") or [])
    if not items:
        try:
            return episode_tags.load(src), {}
        except episode_tags.TagsMismatch as error:
            log(f"tags not copied: {error}")
            return None, {}
    if "keep" in params:
        raise StepFailed("pass either keep or where, not both")
    try:
        doc = episode_tags.load(src)
    except episode_tags.TagsMismatch as error:
        raise StepFailed(str(error)) from None
    if doc is None:
        raise StepFailed(f"{src} has no {episode_tags.FILE_NAME}: run realman-train tags refresh {src} first")
    try:
        where = episode_tags.parse_where(items, doc)
    except ValueError as error:
        raise StepFailed(f"where: {error}") from None
    for item in episode_tags.unseen(doc, where):
        log(f"warning: no episode has {item}")
    drops = episode_tags.select(doc, where)
    log(f"where {' '.join(items)}: drops {sorted(drops)}")
    return doc, drops


def run(params: dict, log, runner=None) -> dict:
    src = Path(params["src"]).expanduser().resolve()
    dst = Path(params["dst"]).expanduser().absolute()
    manifest_path = Path(f"{dst}.clean_manifest.json")
    partial = dst.with_name(dst.name + ".partial")
    for path in (dst, manifest_path, partial):
        if path.exists():
            raise StepFailed(f"refusing: {path} exists (clean never overwrites)")
    info = read_info(src)
    rows = _rows(src)
    indices = [row["episode_index"] for _, row in rows]
    if indices != list(range(info["total_episodes"])):
        raise StepFailed("episode indices must be 0..total_episodes-1")
    tags_doc, tag_drops = _tag_drops(params, src, log)
    drop = _selection(params, indices, set(tag_drops))
    explicit = drop if "keep" in params else {int(e) for e in params.get("drop") or []}
    reasons = _reasons(params, src, explicit, log)
    for episode, why in tag_drops.items():
        reasons[episode] = f"{reasons[episode]}; {why}" if episode in reasons else why
    reasons = dict(sorted(reasons.items()))
    cameras = [k for k, f in info["features"].items() if f.get("dtype") == "video"]
    chunk_size = int(info.get("chunks_size", 1000))
    data_tpl, video_tpl = info["data_path"], info.get("video_path")
    log(f"{src.name}: keeping {len(rows) - len(drop)} of {len(rows)} episodes, dropping {sorted(drop)}")

    partial.mkdir(parents=True)
    try:
        mapping, new_rows, position = {}, [], 0
        kept = [(schema, row) for schema, row in rows if row["episode_index"] not in drop]
        for new_index, (schema, row) in enumerate(kept):
            old_index, length = row["episode_index"], row["length"]
            mapping[old_index] = new_index
            chunk, file = divmod(new_index, chunk_size)
            source = src / data_tpl.format(chunk_index=row["data/chunk_index"], file_index=row["data/file_index"])
            table = pq.read_table(source)
            if table.num_rows != length or set(table.column("episode_index").to_pylist()) != {old_index}:
                raise StepFailed(f"{source}: expected one data file per episode ({old_index}, {length} rows)")
            for name, values in (
                ("episode_index", np.full(length, new_index, np.int64)),
                ("index", np.arange(position, position + length, dtype=np.int64)),
            ):
                i = table.schema.get_field_index(name)
                table = table.set_column(i, table.schema.field(i), pa.array(values))
            target = partial / data_tpl.format(chunk_index=chunk, file_index=file)
            target.parent.mkdir(parents=True, exist_ok=True)
            pq.write_table(table, target, compression="snappy")
            for key in cameras:
                old_video = src / video_tpl.format(
                    video_key=key, chunk_index=row[f"videos/{key}/chunk_index"], file_index=row[f"videos/{key}/file_index"]
                )
                new_video = partial / video_tpl.format(video_key=key, chunk_index=chunk, file_index=file)
                new_video.parent.mkdir(parents=True, exist_ok=True)
                try:
                    os.link(old_video, new_video)
                except OSError as error:
                    if error.errno == errno.EXDEV:
                        raise StepFailed(f"videos are hard-linked: {dst} must be on the same filesystem as {src}") from None
                    raise
            new = dict(row)
            delta = position - row["dataset_from_index"]
            new.update(
                {
                    "episode_index": new_index,
                    "dataset_from_index": position,
                    "dataset_to_index": position + length,
                    "data/chunk_index": chunk,
                    "data/file_index": file,
                }
            )
            if "meta/episodes/chunk_index" in new:
                new.update({"meta/episodes/chunk_index": chunk, "meta/episodes/file_index": file})
            for key in cameras:
                new[f"videos/{key}/chunk_index"], new[f"videos/{key}/file_index"] = chunk, file
            for stat in ("min", "max", "mean", *QUANTILES):  # translation is exact for the index stats
                if f"stats/index/{stat}" in row:
                    new[f"stats/index/{stat}"] = [type(v)(v + delta) for v in row[f"stats/index/{stat}"]]
                if f"stats/episode_index/{stat}" in row:
                    new[f"stats/episode_index/{stat}"] = [type(v)(new_index) for v in row[f"stats/episode_index/{stat}"]]
            meta = partial / "meta" / "episodes" / f"chunk-{chunk:03d}" / f"file-{file:03d}.parquet"
            meta.parent.mkdir(parents=True, exist_ok=True)
            pq.write_table(pa.Table.from_pylist([new], schema=schema), meta, compression="snappy")
            new_rows.append(new)
            position += length
            log.progress(new_index + 1, len(kept), f"episode {old_index} -> {new_index}")

        new_info = {**info, "total_episodes": len(kept), "total_frames": position, "splits": {"train": f"0:{len(kept)}"}}
        (partial / "meta" / "info.json").write_text(json.dumps(new_info, indent=4), encoding="utf-8")
        shutil.copy2(src / "meta" / "tasks.parquet", partial / "meta" / "tasks.parquet")
        old_stats_path = src / "meta" / "stats.json"
        per_episode = [episode_stats(row) for row in new_rows]
        if old_stats_path.is_file() and per_episode and per_episode[0]:
            old_stats = json.loads(old_stats_path.read_text(encoding="utf-8"))
            (partial / "meta" / "stats.json").write_text(
                json.dumps(_to_json(aggregate(per_episode), old_stats), indent=4), encoding="utf-8"
            )
        os.replace(partial, dst)
    except BaseException:
        shutil.rmtree(partial, ignore_errors=True)
        raise

    pull = src.parent / "pull.json"
    lengths = {row["episode_index"]: row["length"] for _, row in rows}
    manifest = {
        "created": datetime.datetime.now().isoformat(timespec="seconds"),
        "source": str(src),
        "origin": json.loads(pull.read_text(encoding="utf-8")).get("origin") if pull.is_file() else None,
        "source_episodes_at_copy": info["total_episodes"],
        "source_frames_at_copy": info["total_frames"],
        "kept_episodes": len(mapping),
        "kept_frames": position,
        "removed": {str(e): {"frames": lengths[e], "reason": r} for e, r in reasons.items()},
        "old_to_new": {str(k): v for k, v in mapping.items()},
        "where": list(params.get("where") or []),
        "tags_snapshot_at": tags_doc.get("snapshot_at") if tags_doc else None,
        "note": "Episode indices were renumbered. Do not rsync from the source into this directory.",
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    if tags_doc is not None:
        episode_tags.write(dst, episode_tags.derive(tags_doc, dst, mapping, source=src, via=str(manifest_path)))
    log(f"built {dst}: {len(mapping)} episodes, {position} frames (removed {len(drop)})")
    return {
        "dst": str(dst),
        "manifest": str(manifest_path),
        "kept_episodes": len(mapping),
        "kept_frames": position,
        "removed": {str(e): r for e, r in reasons.items()},
        "where": list(params.get("where") or []),
        "tags": tags_doc is not None,
    }
