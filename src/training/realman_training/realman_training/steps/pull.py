"""Copy the LeRobot recording from realman_ts into a new raw_realman_ts_<datetime>/<dataset> directory.

The recording files are root 600 on the host, so the copy runs `tar` inside the recording container over
`ssh <alias>`. meta/ and data/ are copied under a shared flock on the recorder's append lock; the videos follow
without it (finished episodes' videos are never rewritten). An existing target is refused: re-pulling into a
cleaned directory corrupted the numbering once (README of 2026-10-13).
"""

from __future__ import annotations

import datetime
import json
import shlex
import shutil
from pathlib import Path

from ..config import RemoteConfig, load_config
from ..datasets import summarize
from ..jobs import StepFailed
from ..lerobot_io import NotALeRobotDataset, video_files
from ..runner import CommandFailed, Runner


def default_target(data_root: str | Path) -> Path:
    return Path(data_root).expanduser() / f"raw_realman_ts_{datetime.datetime.now():%Y%m%d_%H%M%S}"


def remote(config: RemoteConfig, argv: list[str]) -> list[str]:
    return [
        "ssh",
        "-o",
        "BatchMode=yes",
        "-o",
        f"ConnectTimeout={config.connect_timeout_sec}",
        config.ssh_host,
        shlex.join(["docker", "exec", config.recording_container, *argv]),
    ]


def run(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config")).remote
    dataset = params.get("dataset") or config.dataset
    target = Path(params["target"]).expanduser().absolute()
    partial = target.with_name(target.name + ".partial")
    if target.exists():
        raise StepFailed(f"refusing: {target} exists (pull never overwrites)")
    if partial.exists():
        raise StepFailed(f"{partial} exists: an earlier pull did not finish; look at it and remove it by hand")
    source = f"{config.recording_root}/{dataset}"
    lock = f"{config.recording_root}/.{dataset}.lock"
    origin = f"{config.ssh_host}:{config.recording_container}:{source}"
    try:
        size = int(runner.check(remote(config, ["du", "-sb", source])).split()[0])
        info = json.loads(runner.check(remote(config, ["cat", f"{source}/meta/info.json"])))
    except (CommandFailed, ValueError, IndexError) as error:
        raise StepFailed(f"cannot read {origin}: {error}") from None
    log(f"{origin}: {info.get('total_episodes')} episodes, {info.get('total_frames')} frames, {size / 2**30:.2f} GiB")

    dest = partial / dataset
    dest.mkdir(parents=True)
    try:
        copied = 0

        def progress(base: int):
            return lambda n: log.progress(base + n, size, f"{(base + n) / 2**20:.0f} / {size / 2**20:.0f} MiB")

        log(f"meta + data under a shared lock on {lock}")
        flock = ["flock", "-s", "-w", str(config.lock_wait_sec), lock]
        extract = ["tar", "-C", str(dest), "-xf", "-"]
        copied += runner.pipe(remote(config, [*flock, "tar", "-C", source, "-cf", "-", "meta", "data"]), extract, progress(0))
        log("videos and the rest")
        rest = ["tar", "-C", source, "-cf", "-", "--exclude=./meta", "--exclude=./data", "."]
        copied += runner.pipe(remote(config, rest), extract, progress(copied))

        try:
            summary = summarize(dest)
            missing = [str(p.relative_to(dest)) for files in video_files(dest).values() for p in files if not p.is_file()]
        except NotALeRobotDataset as error:
            raise StepFailed(f"the copy is not a valid dataset: {error}") from None
        if missing:
            raise StepFailed(f"{len(missing)} missing video file(s) after the copy, e.g. {missing[:3]}")
        record = {
            "origin": origin,
            "pulled_at": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
            "episodes": summary.episodes,
            "frames": summary.frames,
            "bytes": copied,
        }
        (partial / "pull.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
        partial.rename(target)
    except CommandFailed as error:
        shutil.rmtree(partial, ignore_errors=True)
        raise StepFailed(f"copy from {origin} failed: {error}") from None
    except BaseException:
        shutil.rmtree(partial, ignore_errors=True)
        raise
    log(f"pulled {summary.episodes} episodes ({copied / 2**20:.0f} MiB) into {target / dataset}")
    return {
        "target": str(target),
        "dataset_dir": str(target / dataset),
        "episodes": summary.episodes,
        "frames": summary.frames,
        "bytes": copied,
        "origin": origin,
    }
