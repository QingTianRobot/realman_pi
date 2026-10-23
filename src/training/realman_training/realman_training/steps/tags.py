"""Episode tags from realman_ts: refresh a dataset's episode_tags.json, or check whether the recording's tags moved on.

A raw copy reads the recording platform's tag index (episode_meta.json, under a shared flock on its
.episode_tags.lock) and the recording's own episode list (meta/ only, under the recorder's append lock) to prove the
copy still lines up. A cleaned set or a view is re-derived from its source without the robot.
"""

from __future__ import annotations

import base64
import binascii
import io
import json
import re
import shlex
import subprocess
import tarfile
import tempfile
from pathlib import Path, PurePosixPath

from .. import episode_tags
from ..config import ConsoleConfig, RemoteConfig, load_config
from ..datasets import clean_manifest_path, read_clean_manifest
from ..jobs import StepFailed
from ..lerobot_io import is_dataset, read_episodes
from ..runner import CommandFailed, Runner
from .pull import remote


def dataset_path(config: RemoteConfig, dataset: str) -> str:
    try:
        return str(PurePosixPath(config.recording_root).relative_to(config.tags_root) / dataset)
    except ValueError:
        raise StepFailed(f"remote.recording_root {config.recording_root} is not under remote.tags_root {config.tags_root}") from None


def _remote_source(source: str | None) -> bool:
    """True if source looks like host:/path (a recording path on the robot, not a local dataset)."""
    return bool(source and re.match(r'^[A-Za-z0-9_.-]+:/', source))


def read_index(config: RemoteConfig, runner: Runner, *, timeout: float | None = None) -> dict:
    lock = f"{config.tags_root}/.episode_tags.lock"
    wait = min(config.lock_wait_sec, int(timeout)) if timeout is not None else config.lock_wait_sec
    argv = remote(config, ["flock", "-s", "-w", str(wait), lock, "cat", f"{config.tags_root}/episode_meta.json"])
    try:
        return json.loads(runner.check(argv, timeout=timeout or config.lock_wait_sec + 60))
    except (CommandFailed, ValueError, subprocess.TimeoutExpired) as error:
        raise StepFailed(f"cannot read the tag index from {config.ssh_host}: {error}") from None


def read_remote_episodes(config: RemoteConfig, dataset: str, runner: Runner, *, timeout: float | None = None) -> dict[int, tuple[int, str]]:
    source = f"{config.recording_root}/{dataset}"
    lock = f"{config.recording_root}/.{dataset}.lock"
    wait = min(config.lock_wait_sec, int(timeout)) if timeout is not None else config.lock_wait_sec
    inner_cmd = shlex.join(["flock", "-s", "-w", str(wait), lock,
                            "tar", "-C", source, "-cf", "-", "meta/info.json", "meta/tasks.parquet", "meta/episodes"])
    argv = remote(config, ["sh", "-c", inner_cmd + " | base64"])
    with tempfile.TemporaryDirectory(prefix="realman-tags-") as tmp:
        try:
            encoded = runner.check(argv, timeout=timeout or config.lock_wait_sec + 60)
            data = base64.b64decode(encoded)
        except CommandFailed as error:
            raise StepFailed(f"cannot read the episode list of {source} on {config.ssh_host}: {error}") from None
        except subprocess.TimeoutExpired as error:
            raise StepFailed(f"cannot read the episode list of {source} on {config.ssh_host}: {error}") from None
        except binascii.Error as error:
            raise StepFailed(f"invalid base64 from {config.ssh_host} for {source}: {error}") from None
        try:
            with tarfile.open(fileobj=io.BytesIO(data)) as tf:
                for member in tf.getmembers():
                    name = member.name
                    # Accept only meta/ entries with no .. or absolute paths
                    if ".." in name or name.startswith("/"):
                        raise tarfile.TarError(f"unexpected path in tar: {name!r}")
                    if not (name == "meta" or name.startswith("meta/")):
                        raise tarfile.TarError(f"unexpected path in tar: {name!r}")
                    if member.isreg():
                        dest = Path(tmp) / name
                        dest.parent.mkdir(parents=True, exist_ok=True)
                        with tf.extractfile(member) as f, open(dest, "wb") as out:
                            out.write(f.read())
                    elif member.isdir():
                        (Path(tmp) / name).mkdir(parents=True, exist_ok=True)
        except tarfile.TarError as error:
            raise StepFailed(f"cannot extract episode list from {config.ssh_host} for {source}: {error}") from None
        return {e.index: (e.length, e.task) for e in read_episodes(tmp)}


def remote_doc(config: RemoteConfig, root: Path, runner: Runner, *, remote_episodes: dict | None = None,
               timeout: float | None = None) -> dict:
    """Fresh rows for a raw copy at root (its directory name is the recording's dataset name)."""
    dataset = Path(root).name
    meta = read_index(config, runner, timeout=timeout)
    if remote_episodes is None:
        remote_episodes = read_remote_episodes(config, dataset, runner, timeout=timeout)
    origin = f"{config.ssh_host}:{config.recording_container}:{config.tags_root}/episode_meta.json"
    try:
        return episode_tags.from_remote(meta, dataset_path(config, dataset), episode_tags.local_episodes(root),
                                        remote_episodes, origin=origin)
    except episode_tags.TagsMismatch as error:
        raise StepFailed(str(error)) from None


def kind_of(root: Path) -> tuple[str, Path | None, dict | None]:
    contract = Path(root) / "contract.json"
    if contract.is_file():
        source = json.loads(contract.read_text(encoding="utf-8")).get("source")
        return "view", Path(source) if source else None, None
    manifest = read_clean_manifest(Path(root))
    if manifest is not None:
        return "clean", Path(manifest["source"]) if manifest.get("source") else None, manifest
    return "raw", None, None


def derived_doc(root: Path) -> dict:
    kind, source, manifest = kind_of(root)
    # Get the raw source string to check for robot-path sources
    if kind == "view":
        raw_source_str = json.loads((Path(root) / "contract.json").read_text(encoding="utf-8")).get("source")
    else:
        raw_source_str = manifest.get("source") if manifest else None
    if _remote_source(raw_source_str):
        raise StepFailed(f"{root}: its source {raw_source_str} is on the robot, not a local dataset; "
                         f"its tags cannot be derived (hand-made tag files are kept)")
    if source is None:
        raise StepFailed(f"{root}: its {'contract.json' if kind == 'view' else 'clean manifest'} names no source")
    if not episode_tags.tags_path(source).is_file():
        raise StepFailed(f"{source} has no {episode_tags.FILE_NAME}: run realman-train tags refresh {source} first")
    try:
        source_doc = episode_tags.load(source)
        if kind == "view":
            mapping, via = {i: i for i in episode_tags.local_episodes(root)}, str(Path(root) / "contract.json")
        else:
            if "old_to_new" not in manifest:
                raise StepFailed(f"{root}: the clean manifest has no old_to_new numbering")
            mapping = {int(k): int(v) for k, v in manifest["old_to_new"].items()}
            via = str(clean_manifest_path(Path(root)))
        return episode_tags.derive(source_doc, root, mapping, source=source, via=via)
    except episode_tags.TagsMismatch as error:
        raise StepFailed(str(error)) from None


def _refuse_if_handmade(root: Path, loaded: dict | None) -> None:
    """Raise StepFailed if the existing tag file is hand-made and force was not requested."""
    if loaded is not None:
        doc = loaded
    else:
        path = episode_tags.tags_path(root)
        if not path.is_file():
            return
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return  # malformed file, not determinably hand-made
    if not isinstance(doc, dict):
        return
    derived = doc.get("derived_from") or {}
    origin = str(doc.get("origin") or "")
    if (isinstance(derived, dict) and derived.get("via") == "manual") or origin.startswith("manual"):
        raise StepFailed(f"{root}: episode_tags.json is hand-made; pass force to replace it")


def refresh(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    root = Path(params["path"]).expanduser().resolve()
    kind, source, _ = kind_of(root)
    try:
        old = episode_tags.load(root)
    except episode_tags.TagsMismatch as error:
        log(f"replacing tags that no longer match: {error}")
        old = None
    if kind == "raw":
        # For raw datasets: check hand-made before any remote call
        if not params.get("force"):
            _refuse_if_handmade(root, old)
        log(f"{root.name}: reading the tag index from {config.remote.ssh_host}")
        doc = remote_doc(config.remote, root, runner)
    else:
        log(f"{root.name}: deriving the tags of this {kind} set from {source}")
        doc = derived_doc(root)  # raises StepFailed for robot-path sources
    path = episode_tags.write(root, doc)
    changed = episode_tags.changes(old, doc)
    log(f"wrote {path}: {len(doc['episodes'])} episodes, snapshot {doc['snapshot_at']}"
        + (f", {changed['episodes']} changed {changed['keys']}" if old is not None else ""))
    for key, values in episode_tags.summary(doc).items():
        if key != episode_tags.TASK_KEY:
            log(f"  {key}: " + ", ".join(f"{v['text']} {v['count']}" for v in values))
    return {"path": str(root), "kind": kind, "episodes": len(doc["episodes"]), "snapshot_at": doc["snapshot_at"],
            "changed": changed, "previous": old is not None}


def raw_root(root: Path) -> Path:
    seen: set[Path] = set()
    root = Path(root).resolve()
    while True:
        kind, source, manifest = kind_of(root)
        if kind == "raw":
            return root
        # Get raw source string for validation
        if kind == "view":
            raw_source_str = json.loads((root / "contract.json").read_text(encoding="utf-8")).get("source")
        else:
            raw_source_str = manifest.get("source") if manifest else None
        if source is None or root in seen:
            raise StepFailed(f"{root}: no raw source to compare with")
        if _remote_source(raw_source_str):
            raise StepFailed(f"{root}: source {raw_source_str} is on the robot, not a local dataset")
        source_resolved = source.resolve()
        if not is_dataset(source_resolved):
            raise StepFailed(f"source {source} is not a local dataset")
        seen.add(root)
        root = source_resolved


def status(config: ConsoleConfig, root, runner: Runner, *, timeout: float | None = None) -> dict:
    """Read-only: have the recording's tags changed since the snapshot of root's raw ancestor?"""
    try:
        raw = raw_root(Path(root).expanduser())
        local = episode_tags.load(raw)
    except (StepFailed, episode_tags.TagsMismatch) as error:
        return {"state": "error", "error": str(error)}
    if local is None:
        return {"state": "no_tags", "raw": str(raw)}
    try:
        fresh = remote_doc(config.remote, raw, runner, timeout=timeout)
    except StepFailed as error:
        return {"state": "unknown", "raw": str(raw), "snapshot_at": local.get("snapshot_at"), "error": str(error)}
    changed = episode_tags.changes(local, fresh)
    return {"state": "changed" if changed["episodes"] else "current", "raw": str(raw),
            "snapshot_at": local.get("snapshot_at"), "episodes_changed": changed["episodes"], "keys": changed["keys"]}
