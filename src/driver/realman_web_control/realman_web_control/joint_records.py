"""Persistent joint target records stored under the repository config tree."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
import re
import tempfile
from typing import Any

import yaml


ARMS = frozenset({"l", "m", "r"})
SCHEMA = "realman_joint_record.v1"


@dataclass(frozen=True)
class JointRecord:
    arm: str
    record_id: str
    label: str
    joint_degrees: tuple[float, float, float, float, float, float]
    created_at: str
    updated_at: str

    def event(self) -> dict[str, Any]:
        return {
            "id": self.record_id,
            "label": self.label,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "joint_degrees": list(self.joint_degrees),
        }


class JointRecordStore:
    """Read and write one YAML record file per named joint target."""

    def __init__(self, root: str | Path) -> None:
        self.root = Path(root)
        self.ensure_layout()

    def ensure_layout(self) -> None:
        for arm in sorted(ARMS):
            (self.root / arm).mkdir(parents=True, exist_ok=True)

    def list(self, arm: str) -> list[JointRecord]:
        self._validate_arm(arm)
        records: list[JointRecord] = []
        for path in sorted((self.root / arm).glob("*.yaml")):
            try:
                records.append(self._read(path, arm))
            except ValueError:
                continue
        return sorted(records, key=lambda item: (item.label.lower(), item.record_id))

    def get(self, arm: str, record_id: str) -> JointRecord:
        self._validate_arm(arm)
        normalized_id = self._validate_record_id(record_id)
        path = self.root / arm / f"{normalized_id}.yaml"
        if not path.is_file():
            raise ValueError(f"{arm} joint record '{normalized_id}' does not exist")
        return self._read(path, arm)

    def save(self, arm: str, label: str, joint_degrees: list[float]) -> JointRecord:
        self._validate_arm(arm)
        clean_label = self._clean_label(label)
        joints = self._joint_degrees(joint_degrees)
        record_id = self._unique_record_id(arm, clean_label)
        timestamp = self._timestamp()
        record = JointRecord(
            arm=arm,
            record_id=record_id,
            label=clean_label,
            joint_degrees=joints,
            created_at=timestamp,
            updated_at=timestamp,
        )
        self._write(record)
        return record

    def _read(self, path: Path, expected_arm: str) -> JointRecord:
        with path.open("r", encoding="utf-8") as stream:
            document = yaml.safe_load(stream)
        if not isinstance(document, dict):
            raise ValueError(f"{path} must contain a YAML mapping")
        if document.get("schema") != SCHEMA:
            raise ValueError(f"{path} is not a {SCHEMA} file")
        arm = document.get("arm")
        if arm != expected_arm:
            raise ValueError(f"{path} arm does not match its directory")
        record_id = self._validate_record_id(document.get("id"))
        label = self._clean_label(document.get("label"))
        joints = self._joint_degrees(document.get("joint_degrees"))
        created_at = self._clean_timestamp(document.get("created_at"))
        updated_at = self._clean_timestamp(document.get("updated_at"))
        return JointRecord(arm, record_id, label, joints, created_at, updated_at)

    def _write(self, record: JointRecord) -> None:
        directory = self.root / record.arm
        directory.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema": SCHEMA,
            "arm": record.arm,
            "id": record.record_id,
            "label": record.label,
            "created_at": record.created_at,
            "updated_at": record.updated_at,
            "joint_degrees": [round(value, 6) for value in record.joint_degrees],
        }
        destination = directory / f"{record.record_id}.yaml"
        with tempfile.NamedTemporaryFile(
            "w",
            encoding="utf-8",
            dir=directory,
            prefix=f".{record.record_id}.",
            suffix=".tmp",
            delete=False,
        ) as stream:
            temporary = Path(stream.name)
            yaml.safe_dump(payload, stream, allow_unicode=True, sort_keys=False)
        temporary.replace(destination)

    def _unique_record_id(self, arm: str, label: str) -> str:
        stem = _slug(label)
        candidate = stem
        suffix = 2
        while (self.root / arm / f"{candidate}.yaml").exists():
            candidate = f"{stem}-{suffix}"
            suffix += 1
        return candidate

    @staticmethod
    def _validate_arm(arm: Any) -> None:
        if arm not in ARMS:
            raise ValueError("arm must be one of l, m, or r")

    @staticmethod
    def _validate_record_id(value: Any) -> str:
        if not isinstance(value, str) or not re.fullmatch(r"[a-z0-9][a-z0-9_-]{0,63}", value):
            raise ValueError("record id must use lowercase letters, digits, '_' or '-'")
        return value

    @staticmethod
    def _clean_label(value: Any) -> str:
        if not isinstance(value, str):
            raise ValueError("record label must be a string")
        clean = " ".join(value.split())
        if not clean or len(clean) > 64:
            raise ValueError("record label must contain from 1 through 64 characters")
        return clean

    @staticmethod
    def _joint_degrees(value: Any) -> tuple[float, float, float, float, float, float]:
        if not isinstance(value, list) or len(value) != 6:
            raise ValueError("joint_degrees must contain six values")
        joints = tuple(float(item) for item in value)
        if not all(-360.0 <= item <= 360.0 for item in joints):
            raise ValueError("joint_degrees values must be finite degrees within +/-360")
        return joints  # type: ignore[return-value]

    @staticmethod
    def _clean_timestamp(value: Any) -> str:
        if not isinstance(value, str) or not value:
            raise ValueError("record timestamp must be a non-empty string")
        return value

    @staticmethod
    def _timestamp() -> str:
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _slug(label: str) -> str:
    slug = re.sub(r"[^a-z0-9_-]+", "-", label.lower()).strip("-_")
    if not slug:
        slug = f"record-{JointRecordStore._timestamp().replace(':', '').replace('-', '').lower()}"
    return slug[:64].rstrip("-_") or "record"
