"""Read-only access to a LeRobot v3 dataset directory (meta/, data/, videos/) with pyarrow only."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
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


def read_episode_columns(episode: EpisodeRow, columns: list[str]) -> dict[str, np.ndarray]:
    table = pq.read_table(episode.data_file, columns=[*columns, "episode_index"])
    table = table.filter(pc.equal(table["episode_index"], episode.index))
    if table.num_rows != episode.length:
        raise NotALeRobotDataset(
            f"{episode.data_file}: episode {episode.index} has {table.num_rows} rows, metadata says {episode.length}"
        )
    return {name: np.asarray(table.column(name).to_pylist(), dtype=np.float64) for name in columns}
