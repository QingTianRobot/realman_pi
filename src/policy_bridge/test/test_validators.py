"""Unit tests for policy_bridge.inference.validators."""

from __future__ import annotations

import numpy as np

from policy_bridge.config_loader import ActionConfig
from policy_bridge.inference.validators import check


def _cfg(horizon=4, dim=7, clip=(-1.0, 1.0)) -> ActionConfig:
    return ActionConfig(
        action_horizon=horizon,
        action_dim=dim,
        steps_per_inference=2,
        inference_lead_steps=1,
        action_clip=clip,
    )


def test_valid_chunk_passes():
    chunk = np.zeros((4, 7), dtype=np.float32)
    out = check(chunk, _cfg())
    assert out is not None
    assert out.shape == (4, 7)
    assert out.dtype == np.float32


def test_wrong_shape_rejected():
    assert check(np.zeros((4, 6)), _cfg()) is None
    assert check(np.zeros((5, 7)), _cfg()) is None
    assert check(np.zeros((4,)), _cfg()) is None


def test_nan_and_inf_rejected():
    bad_nan = np.zeros((4, 7), dtype=np.float32)
    bad_nan[1, 2] = np.nan
    assert check(bad_nan, _cfg()) is None

    bad_inf = np.zeros((4, 7), dtype=np.float32)
    bad_inf[0, 0] = np.inf
    assert check(bad_inf, _cfg()) is None


def test_values_clipped_to_range():
    chunk = np.full((4, 7), 5.0, dtype=np.float32)
    out = check(chunk, _cfg(clip=(-1.0, 1.0)))
    assert out is not None
    assert float(out.max()) == 1.0

    chunk_neg = np.full((4, 7), -9.0, dtype=np.float32)
    out_neg = check(chunk_neg, _cfg(clip=(-1.0, 1.0)))
    assert float(out_neg.min()) == -1.0


def test_non_numeric_rejected():
    assert check("not-an-array", _cfg()) is None
    assert check(None, _cfg()) is None
