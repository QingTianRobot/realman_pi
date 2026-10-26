"""Catalog-driven tuning of root config YAML values for the :8765 parameter page.

Only values listed in ``config/web-control/param_catalog.yaml`` are shown or written. A write
replaces exactly the characters of the target scalar (located with ``yaml.compose`` marks), so
comments, key order and formatting stay as the operator wrote them, and is rejected unless a
re-parse differs from the old document in the target values only. Every write keeps a backup and
a history line under ``<log_root>/param-tuning``; the first write to a file snapshots it as the
baseline the export patch is made against.
"""

from __future__ import annotations

import contextlib
import copy
import difflib
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import stat
import tempfile
import threading
from typing import Any

import yaml

CATALOG_SCHEMA = 1
KINDS = ("int", "float", "bool", "int[]", "float[]")
APPLIES = ("bt_start", "bringup_restart")
HISTORY_LIMIT = 100
_SEGMENT = re.compile(r"^([A-Za-z0-9_]+)((?:\[[^\[\].]+\])*)$")
_SELECTOR = re.compile(r"\[([^\[\].]+)\]")
_FIELD = re.compile(r"^([A-Za-z0-9_]+)=(.+)$")


class CatalogError(ValueError):
    """The catalog file itself is unusable."""


class ChangeError(ValueError):
    """One or more requested values are not acceptable; ``errors`` lists them per row."""

    def __init__(self, message: str, errors: list[dict[str, str]] | None = None) -> None:
        super().__init__(message)
        self.errors = errors or []


class ConflictError(RuntimeError):
    """The files changed since the page read them, or they cannot be written here."""

    def __init__(self, message: str, files: list[str] | None = None) -> None:
        super().__init__(message)
        self.files = files or []


class ParamWriteError(RuntimeError):
    """A file could not be written; every file of the request was restored."""


# --------------------------------------------------------------------------- paths


def parse_path(text: str) -> tuple[tuple, ...]:
    """``a.b[2].c[name=x]`` -> (("key","a"), ("key","b"), ("index",2), ("key","c"), ("match","name","x"))."""
    if not isinstance(text, str) or not text:
        raise CatalogError("path must be a non-empty string")
    segments: list[tuple] = []
    for part in text.split("."):
        match = _SEGMENT.match(part)
        if not match:
            raise CatalogError(f"invalid path segment {part!r} in {text!r}")
        segments.append(("key", match.group(1)))
        for selector in _SELECTOR.findall(match.group(2)):
            if selector.isdigit():
                segments.append(("index", int(selector)))
                continue
            field = _FIELD.match(selector)
            if not field:
                raise CatalogError(f"invalid selector [{selector}] in {text!r}")
            segments.append(("match", field.group(1), field.group(2)))
    return tuple(segments)


def _node_child(node: yaml.Node, segment: tuple, where: str) -> yaml.Node:
    kind = segment[0]
    if kind == "key":
        if not isinstance(node, yaml.MappingNode):
            raise KeyError(f"{where}: {segment[1]!r} is not inside a mapping")
        found = [value for key, value in node.value if isinstance(key, yaml.ScalarNode) and key.value == segment[1]]
    elif kind == "index":
        if not isinstance(node, yaml.SequenceNode) or segment[1] >= len(node.value):
            raise KeyError(f"{where}: no list item [{segment[1]}]")
        return node.value[segment[1]]
    else:
        if not isinstance(node, yaml.SequenceNode):
            raise KeyError(f"{where}: [{segment[1]}={segment[2]}] is not applied to a list")
        found = []
        for item in node.value:
            if not isinstance(item, yaml.MappingNode):
                continue
            for key, value in item.value:
                if (isinstance(key, yaml.ScalarNode) and key.value == segment[1]
                        and isinstance(value, yaml.ScalarNode) and value.value == segment[2]):
                    found.append(item)
    if len(found) != 1:
        label = segment[1] if kind == "key" else f"[{segment[1]}={segment[2]}]"
        raise KeyError(f"{where}: {label} matches {len(found)} entries, expected exactly one")
    return found[0]


def locate_node(root: yaml.Node, segments: tuple[tuple, ...], where: str = "path") -> yaml.Node:
    node = root
    for segment in segments:
        node = _node_child(node, segment, where)
    return node


def _data_child(data: Any, segment: tuple) -> Any:
    if segment[0] == "key":
        return data[segment[1]]
    if segment[0] == "index":
        return data[segment[1]]
    matches = [item for item in data if isinstance(item, dict) and str(item.get(segment[1])) == segment[2]]
    return matches[0]


def get_value(data: Any, segments: tuple[tuple, ...]) -> Any:
    for segment in segments:
        data = _data_child(data, segment)
    return data


def set_value(data: Any, segments: tuple[tuple, ...], value: Any) -> None:
    parent = get_value(data, segments[:-1])
    last = segments[-1]
    if last[0] in ("key", "index"):
        parent[last[1]] = value
    else:
        raise KeyError("a path cannot end with a [field=value] selector")


# --------------------------------------------------------------------------- values


def format_scalar(value: Any, kind: str) -> str:
    """YAML text that parses back to ``value`` with the catalog type (floats always carry a dot)."""
    if kind == "bool":
        return "true" if value else "false"
    if kind == "int":
        return str(int(value))
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("value must be finite")
    text = repr(number)
    if "e" in text:
        mantissa, exponent = text.split("e")
        if "." not in mantissa:
            mantissa += ".0"
        if exponent[0] not in "+-":
            exponent = "+" + exponent
        text = f"{mantissa}e{exponent}"
    elif "." not in text:
        text += ".0"
    return text


def coerce_value(value: Any, kind: str) -> Any:
    """Typed value for ``kind`` or ``ValueError`` (JSON numbers arrive as int or float)."""
    if kind == "bool":
        if not isinstance(value, bool):
            raise ValueError("must be true or false")
        return value
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("must be a number")
    if not math.isfinite(float(value)):
        raise ValueError("must be finite")
    if kind == "int":
        if isinstance(value, float) and not value.is_integer():
            raise ValueError("must be an integer")
        return int(value)
    return float(value)


def same_value(left: Any, right: Any) -> bool:
    if isinstance(left, bool) or isinstance(right, bool):
        return left is right
    if isinstance(left, (int, float)) and isinstance(right, (int, float)):
        return math.isclose(float(left), float(right), rel_tol=1e-9, abs_tol=1e-12)
    return left == right


def _file_kind_ok(value: Any, kind: str) -> bool:
    if kind == "bool":
        return isinstance(value, bool)
    if isinstance(value, bool):
        return False
    if kind == "int":
        return isinstance(value, int)
    return isinstance(value, (int, float))


# --------------------------------------------------------------------------- text edits


def edit_text(text: str, edits: list[tuple[tuple[tuple, ...], Any, str]]) -> str:
    """Replace each target scalar's characters; ``edits`` are (segments, value, kind)."""
    root = yaml.compose(text)
    spans = []
    for segments, value, kind in edits:
        node = locate_node(root, segments)
        if not isinstance(node, yaml.ScalarNode):
            raise ValueError("target is not a scalar")
        spans.append((node.start_mark.index, node.end_mark.index, format_scalar(value, kind)))
    spans.sort()
    for (_, end, _), (start, _, _) in zip(spans, spans[1:]):
        if start < end:
            raise ValueError("two edits overlap")
    result = text
    for start, end, replacement in reversed(spans):
        result = result[:start] + replacement + result[end:]
    expected = copy.deepcopy(yaml.safe_load(text))
    for segments, value, kind in edits:
        set_value(expected, segments, coerce_value(value, kind))
    reparsed = yaml.safe_load(result)
    if reparsed != expected:
        raise ValueError("the edited file does not parse to the requested values only")
    for segments, _value, kind in edits:
        if not _file_kind_ok(get_value(reparsed, segments), kind.rstrip("[]")):
            raise ValueError("the edited value changed type")
    return result


def unified_diff(before: str, after: str, file: str) -> str:
    """Diff with ``a/config/<file>`` headers so ``git apply`` works from the repository root."""
    lines = difflib.unified_diff(
        before.splitlines(True), after.splitlines(True), f"a/config/{file}", f"b/config/{file}",
    )
    out = []
    for line in lines:
        out.append(line if line.endswith("\n") else line + "\n\\ No newline at end of file\n")
    return "".join(out)


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def write_preserving(path: Path, text: str) -> None:
    """Atomic replace that keeps the original owner and mode (the host user owns config/ros)."""
    info = path.stat()
    fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            stream.write(text)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, stat.S_IMODE(info.st_mode))
        with contextlib.suppress(PermissionError):
            os.chown(temporary, info.st_uid, info.st_gid)
        os.replace(temporary, path)
    except BaseException:
        with contextlib.suppress(FileNotFoundError):
            os.unlink(temporary)
        raise


# --------------------------------------------------------------------------- catalog


def _number_or_none(value: Any, where: str) -> float | int | None:
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)):
        raise CatalogError(f"{where} must be a finite number")
    return value


def _ref(value: Any, where: str, instance: str) -> dict[str, Any] | None:
    if value is None:
        return None
    if isinstance(value, str):
        value = {"key": value}
    if isinstance(value, dict) and isinstance(value.get("key"), str) and isinstance(value.get("strict", False), bool):
        key = value["key"].replace("{i}", instance)
        parse_path(key)
        return {"key": key, "strict": value.get("strict", False)}
    raise CatalogError(f"{where} must be a key or {{key, strict}}")


def load_catalog(path: str | Path) -> dict[str, Any]:
    """Parse and expand the catalog; returns {applies, groups: [{id, title, file, applies, rows}]}."""
    try:
        document = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as error:
        raise CatalogError(f"cannot read parameter catalog {path}: {error}") from error
    if not isinstance(document, dict) or document.get("schema_version") != CATALOG_SCHEMA:
        raise CatalogError(f"parameter catalog must have schema_version: {CATALOG_SCHEMA}")
    applies = document.get("applies")
    if not isinstance(applies, dict) or set(applies) != set(APPLIES):
        raise CatalogError(f"applies must label exactly {', '.join(APPLIES)}")
    groups_in = document.get("groups")
    if not isinstance(groups_in, list) or not groups_in:
        raise CatalogError("groups must be a non-empty list")
    groups, seen = [], set()
    for group in groups_in:
        groups.extend(_expand_group(group, seen))
    return {"applies": {key: str(applies[key]) for key in APPLIES}, "groups": groups}


def _expand_group(group: Any, seen: set[str]) -> list[dict[str, Any]]:
    if not isinstance(group, dict):
        raise CatalogError("every group must be a mapping")
    group_id = group.get("id")
    where = f"group {group_id!r}"
    if not isinstance(group_id, str) or not re.match(r"^[a-z0-9_]+$", group_id):
        raise CatalogError(f"{where}: id must be lowercase letters, digits and _")
    file = group.get("file")
    if not isinstance(file, str) or not file.startswith("ros/") or ".." in Path(file).parts or not file.endswith(".yaml"):
        raise CatalogError(f"{where}: file must be a ros/*.yaml path under the config root")
    if group.get("applies") not in APPLIES:
        raise CatalogError(f"{where}: applies must be one of {', '.join(APPLIES)}")
    title, prefix = group.get("title"), group.get("prefix", "")
    if not isinstance(title, str) or not title or not isinstance(prefix, str):
        raise CatalogError(f"{where}: title and prefix must be strings")
    instances = group.get("instances")
    if instances is not None and (not isinstance(instances, list) or not instances
                                  or not all(isinstance(i, str) and re.match(r"^[a-z0-9_]+$", i) for i in instances)):
        raise CatalogError(f"{where}: instances must be a list of short names")
    readback = group.get("readback")
    if readback is not None and not (isinstance(readback, dict) and isinstance(readback.get("node"), str)
                                     and readback["node"].startswith("/") and isinstance(readback.get("param"), str)):
        raise CatalogError(f"{where}: readback must be {{node: /name, param: template}}")
    params = group.get("params")
    if not isinstance(params, list) or not params:
        raise CatalogError(f"{where}: params must be a non-empty list")
    expanded = []
    for instance in instances or [None]:
        rows = []
        for param in params:
            rows.extend(_expand_param(param, group, instance, readback, seen))
        expanded.append({
            "id": group_id if instance is None else f"{group_id}@{instance}",
            "group": group_id,
            "instance": instance,
            "title": group["title"] if instance is None else f"{group['title']}（{instance}）",
            "file": file,
            "applies": group["applies"],
            "rows": rows,
        })
    return expanded


def _expand_param(param: Any, group: dict, instance: str | None, readback: dict | None, seen: set[str]) -> list[dict]:
    if not isinstance(param, dict) or not isinstance(param.get("key"), str):
        raise CatalogError(f"group {group['id']!r}: every param needs a key")
    key = param["key"]
    where = f"{group['id']}/{key}"
    kind = param.get("type")
    if kind not in KINDS:
        raise CatalogError(f"{where}: type must be one of {', '.join(KINDS)}")
    note = param.get("note")
    if not isinstance(note, str) or not note.strip():
        raise CatalogError(f"{where}: note is required")
    labels = param.get("labels")
    is_array = kind.endswith("[]")
    if is_array != isinstance(labels, list) or (is_array and (not labels or not all(isinstance(x, str) for x in labels))):
        raise CatalogError(f"{where}: array types need labels, scalars must not have them")
    count = len(labels) if is_array else 1

    def per_element(name: str) -> list:
        value = param.get(name)
        if isinstance(value, list):
            if not is_array or len(value) != count:
                raise CatalogError(f"{where}: {name} list must match labels")
            return [_number_or_none(item, f"{where}.{name}") for item in value]
        return [_number_or_none(value, f"{where}.{name}")] * count

    minimum, maximum = per_element("min"), per_element("max")
    special = param.get("special", [])
    if not isinstance(special, list):
        raise CatalogError(f"{where}: special must be a list")
    special = [_number_or_none(item, f"{where}.special") for item in special]
    instance_text = instance or ""
    prefix = group.get("prefix", "").replace("{i}", instance_text)
    full_key = key.replace("{i}", instance_text)
    prefix_segments = parse_path(prefix) if prefix else ()
    base_segments = prefix_segments + parse_path(full_key)
    template = param.get("readback", readback)
    group_id = group["id"] if instance is None else f"{group['id']}@{instance}"
    rows = []
    for element in range(count) if is_array else [None]:
        row_id = f"{group_id}/{full_key}" + ("" if element is None else f"[{element}]")
        if row_id in seen:
            raise CatalogError(f"duplicate parameter {row_id}")
        seen.add(row_id)
        label = param.get("label", key).replace("{i}", instance_text)
        if element is not None:
            label = f"{label} · {labels[element]}"
        index = 0 if element is None else element
        rows.append({
            "id": row_id,
            "key": full_key,
            "instance": instance,
            "element": element,
            "label": label,
            "kind": kind.rstrip("[]"),
            "prefix_segments": prefix_segments,
            "segments": base_segments + ((("index", element),) if element is not None else ()),
            "min": minimum[index],
            "max": maximum[index],
            "special": special,
            "max_ref": _ref(param.get("max_ref"), f"{where}.max_ref", instance_text),
            "min_ref": _ref(param.get("min_ref"), f"{where}.min_ref", instance_text),
            "unit": str(param.get("unit", "")),
            "note": note.strip(),
            "applies": group["applies"],
            "file": group["file"],
            "readback": None if template is None else {
                "node": template["node"],
                "param": template["param"].replace("{key}", full_key),
                "element": element,
            },
        })
    return rows


# --------------------------------------------------------------------------- store


def _now() -> datetime:
    return datetime.now(timezone.utc)


class ParamStore:
    """Read, validate and write catalog values; all public methods are thread-safe."""

    def __init__(self, catalog_path: str | Path, config_root: str | Path, state_root: str | Path) -> None:
        self.catalog = load_catalog(catalog_path)
        self.config_root = Path(config_root).resolve()
        self.state_root = Path(state_root)
        self._lock = threading.Lock()
        self._sequence = 0

    # -- reading ------------------------------------------------------------

    def _path(self, file: str) -> Path:
        return self.config_root / file

    def _read_files(self) -> dict[str, dict[str, Any]]:
        files: dict[str, dict[str, Any]] = {}
        for group in self.catalog["groups"]:
            file = group["file"]
            if file in files:
                continue
            try:
                text = self._path(file).read_text(encoding="utf-8")
                files[file] = {"text": text, "sha": sha256_text(text), "data": yaml.safe_load(text),
                               "root": yaml.compose(text), "error": ""}
            except (OSError, yaml.YAMLError) as error:
                files[file] = {"text": "", "sha": "", "data": None, "root": None, "error": str(error)}
        return files

    def _resolve_rows(self, files: dict) -> tuple[dict[str, dict], list[dict], list[str]]:
        """Rows that exist in their file with the catalog type, plus per-row errors."""
        rows, groups, errors = {}, [], []
        for group in self.catalog["groups"]:
            loaded = files[group["file"]]
            kept = []
            for row in group["rows"]:
                if loaded["error"]:
                    errors.append(f"{row['id']}: {group['file']} unreadable: {loaded['error']}")
                    continue
                try:
                    node = locate_node(loaded["root"], row["segments"], row["id"])
                    value = get_value(loaded["data"], row["segments"])
                except (KeyError, IndexError, TypeError) as error:
                    errors.append(f"{row['id']}: {error}")
                    continue
                if not isinstance(node, yaml.ScalarNode) or not _file_kind_ok(value, row["kind"]):
                    errors.append(f"{row['id']}: {group['file']} has {value!r}, expected {row['kind']}")
                    continue
                resolved = dict(row, value=value)
                rows[row["id"]] = resolved
                kept.append(resolved)
            groups.append({key: group[key] for key in ("id", "title", "file", "applies")} | {"rows": kept})
        return rows, groups, errors

    def _ref_info(self, row: dict, ref: dict | None, rows: dict, files: dict) -> dict | None:
        """Where a max_ref/min_ref points: a catalog row (its staged value counts) or a plain file value."""
        if ref is None:
            return None
        prefix = row["id"].split("/", 1)[0]
        suffix = "" if row["element"] is None else f"[{row['element']}]"
        target_id = f"{prefix}/{ref['key']}{suffix}"
        if target_id in rows:
            return {"key": ref["key"], "id": target_id, "value": rows[target_id]["value"], "strict": ref["strict"]}
        segments = row["prefix_segments"] + parse_path(ref["key"]) + (
            (("index", row["element"]),) if row["element"] is not None else ()
        )
        try:
            value = get_value(files[row["file"]]["data"], segments)
        except (KeyError, IndexError, TypeError):
            return None  # e.g. arm m has no hard_max_linear_accel_mps2: no constraint there
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            return None
        return {"key": ref["key"], "id": None, "value": value, "strict": ref["strict"]}

    def _state(self) -> dict[str, Any]:
        try:
            state = json.loads((self.state_root / "state.json").read_text(encoding="utf-8"))
        except (OSError, ValueError):
            state = {}
        state.setdefault("written", {})
        state.setdefault("pending_restart", [])
        return state

    def _save_state(self, state: dict[str, Any]) -> None:
        self.state_root.mkdir(parents=True, exist_ok=True)
        (self.state_root / "state.json").write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")

    def _baselines(self) -> dict[str, Any]:
        try:
            return json.loads((self.state_root / "baseline.json").read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return {}

    def _baseline_data(self, file: str) -> Any:
        try:
            return yaml.safe_load((self.state_root / "baseline" / file).read_text(encoding="utf-8"))
        except (OSError, yaml.YAMLError):
            return None

    def writable(self) -> tuple[bool, str]:
        directory = self.config_root / "ros"
        if not os.access(directory, os.W_OK):
            return False, f"{directory} is read-only here (mount ./config/ros read-write into this container)"
        for file in {group["file"] for group in self.catalog["groups"]}:
            if not os.access(self._path(file), os.W_OK):
                return False, f"{self._path(file)} is not writable"
        return True, ""

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            files = self._read_files()
            rows, groups, errors = self._resolve_rows(files)
            state, baselines = self._state(), self._baselines()
            baseline_data = {file: self._baseline_data(file) for file in baselines}
            for group in groups:
                public = []
                for row in group["rows"]:
                    data = baseline_data.get(row["file"])
                    baseline = row["value"]
                    if data is not None:
                        with contextlib.suppress(KeyError, IndexError, TypeError):
                            baseline = get_value(data, row["segments"])
                    public.append({
                        key: row[key] for key in (
                            "id", "key", "element", "label", "kind", "min", "max", "special",
                            "unit", "note", "applies", "file", "value", "readback",
                        )
                    } | {
                        "baseline": baseline,
                        "max_ref": self._ref_info(row, row["max_ref"], rows, files),
                        "min_ref": self._ref_info(row, row["min_ref"], rows, files),
                    })
                group["rows"] = public
            writable, reason = self.writable()
            return {
                "applies": self.catalog["applies"],
                "groups": [group for group in groups if group["rows"]],
                "files": {
                    file: {
                        "sha": loaded["sha"],
                        "baseline": file in baselines,
                        "external_change": file in state["written"] and state["written"][file] != loaded["sha"],
                    }
                    for file, loaded in files.items()
                },
                "writable": writable,
                "writable_error": reason,
                "errors": errors,
                "pending_restart": [row_id for row_id in state["pending_restart"] if row_id in rows],
            }

    # -- validation ---------------------------------------------------------

    def _validate(self, changes: Any, rows: dict, files: dict) -> dict[str, Any]:
        if not isinstance(changes, list) or not changes:
            raise ChangeError("changes must be a non-empty list")
        values, errors = {}, []
        for change in changes:
            row_id = change.get("id") if isinstance(change, dict) else None
            if row_id not in rows:
                errors.append({"id": str(row_id), "error": "not in the parameter catalog"})
                continue
            if row_id in values:
                errors.append({"id": row_id, "error": "listed twice"})
                continue
            row = rows[row_id]
            try:
                value = coerce_value(change.get("value"), row["kind"])
            except ValueError as error:
                errors.append({"id": row_id, "error": str(error)})
                continue
            if row["kind"] != "bool" and not any(same_value(value, item) for item in row["special"]):
                if row["min"] is not None and value < row["min"]:
                    errors.append({"id": row_id, "error": f"below the minimum {row['min']}"})
                    continue
                if row["max"] is not None and value > row["max"]:
                    errors.append({"id": row_id, "error": f"above the maximum {row['max']}"})
                    continue
            values[row_id] = value
        for row_id, row in rows.items():
            for name in ("max_ref", "min_ref"):
                info = self._ref_info(row, row[name], rows, files)
                if info is None:
                    continue
                if row_id not in values and info["id"] not in values:
                    continue
                own = values.get(row_id, row["value"])
                other = values.get(info["id"], info["value"]) if info["id"] else info["value"]
                if any(same_value(own, item) for item in row["special"]):
                    continue
                if name == "max_ref":
                    bad = own >= other if info["strict"] else own > other
                    sign = "<" if info["strict"] else "≤"
                else:
                    bad = own <= other if info["strict"] else own < other
                    sign = ">" if info["strict"] else "≥"
                if bad:
                    errors.append({"id": row_id, "error": f"must be {sign} {info['key']} ({other})"})
        if errors:
            raise ChangeError("some values are not acceptable", errors)
        return values

    # -- writing ------------------------------------------------------------

    def _entry_id(self) -> str:
        self._sequence += 1
        return _now().strftime("%Y%m%dT%H%M%S%fZ") + f"-{self._sequence}"

    def _write(self, values: dict, rows: dict, files: dict, expected_sha: Any, dry_run: bool,
               reverts: str | None) -> dict[str, Any]:
        by_file: dict[str, list] = {}
        for row_id, value in values.items():
            row = rows[row_id]
            by_file.setdefault(row["file"], []).append((row["segments"], value, row["kind"]))
        if not isinstance(expected_sha, dict):
            expected_sha = {}
        stale = sorted(file for file in by_file if expected_sha.get(file) != files[file]["sha"])
        if stale:
            raise ConflictError("files changed since the page read them; reload", stale)
        new_texts, diffs = {}, []
        for file, edits in sorted(by_file.items()):
            try:
                new_texts[file] = edit_text(files[file]["text"], edits)
            except (ValueError, KeyError) as error:
                raise ChangeError(f"{file}: {error}") from error
            diffs.append(unified_diff(files[file]["text"], new_texts[file], file))
        changes = [{
            "id": row_id,
            "label": rows[row_id]["label"],
            "file": rows[row_id]["file"],
            "applies": rows[row_id]["applies"],
            "before": rows[row_id]["value"],
            "after": value,
        } for row_id, value in values.items()]
        result = {"changes": changes, "diff": "".join(diffs),
                  "applies": sorted({change["applies"] for change in changes})}
        if dry_run:
            return result
        writable, reason = self.writable()
        if not writable:
            raise ConflictError(reason)
        entry_id = self._entry_id()
        backups = self.state_root / "backups" / entry_id
        baselines = self._baselines()
        for file in new_texts:
            (backups / file).parent.mkdir(parents=True, exist_ok=True)
            (backups / file).write_text(files[file]["text"], encoding="utf-8")
            if file not in baselines:
                (self.state_root / "baseline" / file).parent.mkdir(parents=True, exist_ok=True)
                (self.state_root / "baseline" / file).write_text(files[file]["text"], encoding="utf-8")
                baselines[file] = {"sha": files[file]["sha"], "saved_at": _now().isoformat()}
        (self.state_root / "baseline.json").write_text(json.dumps(baselines, indent=2), encoding="utf-8")
        written = []
        try:
            for file, text in new_texts.items():
                write_preserving(self._path(file), text)
                written.append(file)
        except OSError as error:
            for file in written:
                with contextlib.suppress(OSError):
                    write_preserving(self._path(file), files[file]["text"])
            raise ParamWriteError(f"could not write {self._path(file)}: {error}; nothing was changed") from error
        entry = {
            "id": entry_id,
            "time": _now().isoformat(),
            "reverts": reverts,
            "changes": changes,
            "files": {file: {"before_sha": files[file]["sha"], "after_sha": sha256_text(text)}
                      for file, text in new_texts.items()},
            "diff": result["diff"],
        }
        with (self.state_root / "history.jsonl").open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(entry, ensure_ascii=False) + "\n")
        state = self._state()
        for file, info in entry["files"].items():
            state["written"][file] = info["after_sha"]
        for change in changes:
            if change["applies"] == "bringup_restart" and change["id"] not in state["pending_restart"]:
                state["pending_restart"].append(change["id"])
        self._save_state(state)
        return entry

    def apply(self, changes: Any, expected_sha: Any, dry_run: bool = False) -> dict[str, Any]:
        with self._lock:
            files = self._read_files()
            rows, _, _ = self._resolve_rows(files)
            values = self._validate(changes, rows, files)
            return self._write(values, rows, files, expected_sha, dry_run, None)

    def revert(self, entry_id: Any, expected_sha: Any, dry_run: bool = False) -> dict[str, Any]:
        with self._lock:
            entry = next((item for item in self._history() if item["id"] == entry_id), None)
            if entry is None:
                raise ChangeError(f"no history entry {entry_id!r}")
            files = self._read_files()
            rows, _, _ = self._resolve_rows(files)
            changes = [{"id": change["id"], "value": change["before"]} for change in entry["changes"]]
            values = self._validate(changes, rows, files)
            result = self._write(values, rows, files, expected_sha, dry_run, entry["id"])
            result["changed_since"] = [
                change["id"] for change in entry["changes"]
                if change["id"] in rows and not same_value(rows[change["id"]]["value"], change["after"])
            ]
            return result

    # -- history, baseline, pending ------------------------------------------

    def _history(self) -> list[dict[str, Any]]:
        try:
            lines = (self.state_root / "history.jsonl").read_text(encoding="utf-8").splitlines()
        except OSError:
            return []
        entries = []
        for line in lines:
            with contextlib.suppress(ValueError):
                entries.append(json.loads(line))
        return entries

    def history(self, limit: int = HISTORY_LIMIT) -> list[dict[str, Any]]:
        with self._lock:
            return list(reversed(self._history()))[:limit]

    def export_patch(self) -> str:
        with self._lock:
            patches = []
            for file in sorted(self._baselines()):
                try:
                    before = (self.state_root / "baseline" / file).read_text(encoding="utf-8")
                    after = self._path(file).read_text(encoding="utf-8")
                except OSError:
                    continue
                patches.append(unified_diff(before, after, file))
            return "".join(patches)

    def reset_baseline(self) -> dict[str, Any]:
        with self._lock:
            baselines = self._baselines()
            if not baselines:
                return {"archived": None, "files": []}
            archive = self.state_root / "baseline-archive" / _now().strftime("%Y%m%dT%H%M%SZ")
            archive.mkdir(parents=True, exist_ok=True)
            if (self.state_root / "baseline").exists():
                shutil.move(str(self.state_root / "baseline"), str(archive / "baseline"))
            shutil.move(str(self.state_root / "baseline.json"), str(archive / "baseline.json"))
            return {"archived": str(archive), "files": sorted(baselines)}

    def clear_pending(self) -> dict[str, Any]:
        with self._lock:
            state = self._state()
            cleared = state["pending_restart"]
            state["pending_restart"] = []
            self._save_state(state)
            return {"cleared": cleared}

    # -- readback -------------------------------------------------------------

    def readback_requests(self) -> dict[str, list[str]]:
        requests: dict[str, set[str]] = {}
        for group in self.catalog["groups"]:
            for row in group["rows"]:
                if row["readback"]:
                    requests.setdefault(row["readback"]["node"], set()).add(row["readback"]["param"])
        return {node: sorted(names) for node, names in sorted(requests.items())}

    def readback(self, reader: Any) -> dict[str, Any]:
        """Run ``reader(requests)`` and compare every read-back row with its file value."""
        requests = self.readback_requests()
        nodes = reader(requests) if (reader is not None and requests) else {}
        with self._lock:
            rows, _, _ = self._resolve_rows(self._read_files())
        states = {}
        for row_id, row in rows.items():
            target = row["readback"]
            if not target:
                continue
            node = nodes.get(target["node"]) or {"available": False, "values": {}}
            value = node.get("values", {}).get(target["param"]) if node.get("available") else None
            if target["element"] is not None and isinstance(value, list):
                value = value[target["element"]] if target["element"] < len(value) else None
            if not node.get("available"):
                states[row_id] = {"state": "offline", "value": None}
            elif value is None:
                # The node runs but has no such parameter (an older build, or a renamed key).
                states[row_id] = {"state": "undeclared", "value": None}
            else:
                states[row_id] = {"state": "applied" if same_value(value, row["value"]) else "pending", "value": value}
        return {"nodes": {node: {"available": bool(info.get("available"))} for node, info in nodes.items()},
                "rows": states}
