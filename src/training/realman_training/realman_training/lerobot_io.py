"""Read-only access to a LeRobot v3 dataset directory (meta/, data/, videos/) with pyarrow only."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pyarrow as pa
import pyarrow.compute as pc
import pyarrow.parquet as pq

_EPISODE_COLUMNS = [
    "episode_index",
    "tasks",
    "length",
    "data/chunk_index",
    "data/file_index",
    "dataset_from_index",
    "dataset_to_index",
]


class NotALeRobotDataset(ValueError):
    """The directory is not a LeRobot v3 dataset, or its files contradict each other."""


@dataclass(frozen=True)
class EpisodeRow:
    index: int
    task: str
    length: int
    data_file: Path
    from_index: int
    to_index: int


def is_dataset(path: str | Path) -> bool:
    return (Path(path) / "meta" / "info.json").is_file()


def read_info(root: str | Path) -> dict:
    path = Path(root) / "meta" / "info.json"
    if not path.is_file():
        raise NotALeRobotDataset(f"{root}: no meta/info.json")
    info = json.loads(path.read_text(encoding="utf-8"))
    if info.get("codebase_version") != "v3.0":
        raise NotALeRobotDataset(f"{root}: codebase_version {info.get('codebase_version')!r}, expected 'v3.0'")
    return info


def read_task_names(root: str | Path) -> dict[int, str]:
    table = pq.read_table(Path(root) / "meta" / "tasks.parquet")
    # make_realman_view.py writes a task column; the recorder stores the name as the pandas index.
    column = "task" if "task" in table.column_names else "__index_level_0__"
    if column not in table.column_names:
        raise NotALeRobotDataset(f"{root}: meta/tasks.parquet has no task names ({table.column_names})")
    return dict(zip(table.column("task_index").to_pylist(), map(str, table.column(column).to_pylist())))


def read_episodes(root: str | Path) -> list[EpisodeRow]:
    root = Path(root)
    data_path = read_info(root)["data_path"]
    rows: list[EpisodeRow] = []
    for path in sorted((root / "meta" / "episodes").glob("chunk-*/file-*.parquet")):
        for row in pq.read_table(path, columns=_EPISODE_COLUMNS).to_pylist():
            tasks = row["tasks"] or [""]
            rows.append(
                EpisodeRow(
                    index=int(row["episode_index"]),
                    task=str(tasks[0]),
                    length=int(row["length"]),
                    data_file=root
                    / data_path.format(chunk_index=row["data/chunk_index"], file_index=row["data/file_index"]),
                    from_index=int(row["dataset_from_index"]),
                    to_index=int(row["dataset_to_index"]),
                )
            )
    rows.sort(key=lambda row: row.index)
    return rows


def _matrix(column: pa.ChunkedArray, path: Path, name: str) -> np.ndarray:
    array = column.combine_chunks()
    rows = len(array)
    if pa.types.is_list(array.type) or pa.types.is_large_list(array.type) or pa.types.is_fixed_size_list(array.type):
        values = array.flatten().to_numpy(zero_copy_only=False).astype(np.float64)
        if rows == 0:
            return values.reshape(0, 0)
        if values.size % rows:
            raise NotALeRobotDataset(f"{path}: column {name} has rows of different lengths")
        return values.reshape(rows, -1)
    return array.to_numpy(zero_copy_only=False).astype(np.float64).reshape(rows, 1)


def read_columns(root: str | Path, columns: list[str]) -> dict[int, dict[str, np.ndarray]]:
    """Episode index -> column -> (frames, width) array. Every data file is read once."""
    episodes = read_episodes(root)
    by_file: dict[Path, list[EpisodeRow]] = {}
    for episode in episodes:
        by_file.setdefault(episode.data_file, []).append(episode)
    found: dict[int, dict[str, np.ndarray]] = {}
    for path, rows in by_file.items():
        try:
            table = pq.read_table(path, columns=[*columns, "episode_index"])
        except (KeyError, OSError) as error:
            raise NotALeRobotDataset(f"{path}: {error}") from None
        except pa.ArrowInvalid as error:
            schema_names = set(pq.read_schema(path).names)
            missing = [c for c in columns if c not in schema_names]
            if missing:
                raise NotALeRobotDataset(f"{path}: {', '.join(missing)}") from None
            raise NotALeRobotDataset(f"{path}: {error}") from None
        index = table.column("episode_index").to_numpy()
        matrices = {name: _matrix(table.column(name), path, name) for name in columns}
        for episode in rows:
            mask = index == episode.index
            if int(mask.sum()) != episode.length:
                raise NotALeRobotDataset(
                    f"{path}: episode {episode.index} has {int(mask.sum())} rows, metadata says {episode.length}"
                )
            found[episode.index] = {name: matrix[mask] for name, matrix in matrices.items()}
    return {episode.index: found[episode.index] for episode in episodes}


def read_episode_columns(episode: EpisodeRow, columns: list[str]) -> dict[str, np.ndarray]:
    try:
        table = pq.read_table(episode.data_file, columns=[*columns, "episode_index"])
    except (KeyError, OSError, pa.ArrowInvalid) as error:
        raise NotALeRobotDataset(f"{episode.data_file}: {error}") from None
    table = table.filter(pc.equal(table["episode_index"], episode.index))
    if table.num_rows != episode.length:
        raise NotALeRobotDataset(
            f"{episode.data_file}: episode {episode.index} has {table.num_rows} rows, metadata says {episode.length}"
        )
    return {name: _matrix(table.column(name), episode.data_file, name) for name in columns}


def video_files(root: str | Path) -> dict[int, list[Path]]:
    """Episode index -> its video files (one per camera), from the episode metadata and info.json video_path."""
    root = Path(root)
    info = read_info(root)
    template = info.get("video_path")
    keys = [name for name, feature in info.get("features", {}).items() if feature.get("dtype") == "video"]
    files: dict[int, list[Path]] = {}
    for path in sorted((root / "meta" / "episodes").glob("chunk-*/file-*.parquet")):
        for row in pq.read_table(path).to_pylist():
            files[int(row["episode_index"])] = [
                root
                / template.format(
                    video_key=key,
                    chunk_index=row[f"videos/{key}/chunk_index"],
                    file_index=row[f"videos/{key}/file_index"],
                )
                for key in keys
            ]
    return dict(sorted(files.items()))
