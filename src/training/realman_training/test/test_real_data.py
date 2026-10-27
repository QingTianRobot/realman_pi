"""Opt-in: the rules must reproduce the 2026-10-16 manual cleaning on the real raw copy (server5090).

REALMAN_TRAINING_RAW_20261016=~/data/realman/raw_realman_ts_20261016/realman__pi05-three-arm
"""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from realman_training.config import QualityConfig
from realman_training.datasets import summarize
from realman_training.quality import inspect_dataset, suggested_drops

RAW = os.environ.get("REALMAN_TRAINING_RAW_20261016")
MANUAL_DROPS_20261016 = [13, 28, 44, 61, 69, 78, 120, 121, 130, 181, 189, 209, 216]
# #216 was dropped by hand as "never fully closed (max 3931)"; its wrist camera (checked 2026-10-27) shows it lifting
# the adapter held across its body, so the wide-grasp rule keeps it.
WIDE_GRASPS_20261016 = [216]

pytestmark = pytest.mark.skipif(not RAW, reason="set REALMAN_TRAINING_RAW_20261016 to the 10-16 raw copy")


def test_the_summary_matches_the_copy():
    summary = summarize(Path(RAW).expanduser())
    assert (summary.episodes, summary.frames) == (230, 105439)
    assert summary.tasks == {"pick_and_place": 122, "pick_only": 108}


def test_the_rules_suggest_exactly_the_manual_drops_except_the_wide_grasp():
    results = inspect_dataset(Path(RAW).expanduser(), QualityConfig())
    assert suggested_drops(results) == [e for e in MANUAL_DROPS_20261016 if e not in WIDE_GRASPS_20261016]
