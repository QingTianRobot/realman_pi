#!/usr/bin/env python3
import json
import sys
from pathlib import Path


def read_terminal_result(snapshot_path: Path) -> str:
    with snapshot_path.open(encoding="utf-8") as snapshot_file:
        snapshot = json.load(snapshot_file)
    tick_stats = snapshot.get("tick_stats")
    if not isinstance(tick_stats, dict):
        raise ValueError("runtime snapshot has no tick_stats object")
    success = tick_stats.get("success")
    failure = tick_stats.get("failure")
    if (
        not isinstance(success, int)
        or isinstance(success, bool)
        or not isinstance(failure, int)
        or isinstance(failure, bool)
        or success < 0
        or failure < 0
        or success + failure != 1
    ):
        raise ValueError("runtime snapshot must contain exactly one terminal tick")
    return "SUCCESS" if success == 1 else "FAILURE"


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: bt-runtime-result <runtime.json>", file=sys.stderr)
        return 2
    try:
        print(read_terminal_result(Path(argv[1])))
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"cannot determine behavior-tree result: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
