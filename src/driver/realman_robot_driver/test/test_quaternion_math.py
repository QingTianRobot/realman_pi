from __future__ import annotations

import math

import pytest

from realman_robot_driver.quaternion_math import (
    conjugate,
    integrate_body_quaternion,
    integrate_spatial_quaternion,
    multiply,
    normalize,
    quaternion_exp,
    transform_twist,
)


def test_normalize_uses_wxyz_and_rejects_zero_norm():
    assert normalize((2.0, 0.0, 0.0, 0.0)) == pytest.approx((1.0, 0.0, 0.0, 0.0))

    with pytest.raises(ValueError, match="non-zero norm"):
        normalize((0.0, 0.0, 0.0, 0.0))


def test_normalize_rejects_non_finite_values():
    for value in (math.nan, math.inf, -math.inf):
        with pytest.raises(ValueError, match="finite"):
            normalize((1.0, value, 0.0, 0.0))


def test_identity_multiplication_and_conjugate():
    quaternion = normalize((1.0, 2.0, 3.0, 4.0))
    identity = (1.0, 0.0, 0.0, 0.0)

    assert multiply(identity, quaternion) == pytest.approx(quaternion)
    assert multiply(quaternion, identity) == pytest.approx(quaternion)
    assert multiply(quaternion, conjugate(quaternion)) == pytest.approx(identity)


def test_quaternion_exp_integrates_z_rotation_without_euler():
    result = quaternion_exp((0.0, 0.0, math.pi / 2.0), 1.0)

    assert result == pytest.approx((math.sqrt(0.5), 0.0, 0.0, math.sqrt(0.5)), abs=1e-7)


def test_body_and_spatial_integration_have_distinct_multiplication_order():
    current = quaternion_exp((0.0, 0.0, math.pi / 2.0), 1.0)
    angular_velocity = (math.pi / 2.0, 0.0, 0.0)

    body = integrate_body_quaternion(current, angular_velocity, 1.0)
    spatial = integrate_spatial_quaternion(current, angular_velocity, 1.0)
    increment = quaternion_exp(angular_velocity, 1.0)

    assert body == pytest.approx(multiply(current, increment))
    assert spatial == pytest.approx(multiply(increment, current))
    assert body != pytest.approx(spatial)


def test_transform_twist_is_explicit_and_rotates_linear_and_angular_parts():
    quarter_turn = quaternion_exp((0.0, 0.0, math.pi / 2.0), 1.0)

    transformed = transform_twist(quarter_turn, (1.0, 0.0, 0.0, 0.0, 2.0, 0.0))

    assert transformed == pytest.approx((0.0, 1.0, 0.0, -2.0, 0.0, 0.0), abs=1e-7)
