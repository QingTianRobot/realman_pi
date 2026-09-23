import math

import pytest

from realman_robot_driver.cartesian_velocity_telemetry import PoseVelocityEstimator


def test_first_pose_is_invalid_until_a_pair_is_available():
    estimator = PoseVelocityEstimator(max_sample_gap_sec=0.2)

    sample = estimator.update(1_000_000_000, [0.0, 0.0, 0.0, 0.0, 0.0, 0.0])

    assert sample.valid is False
    assert sample.linear_mps == (0.0, 0.0, 0.0)
    assert sample.angular_radps == (0.0, 0.0, 0.0)


def test_pose_difference_returns_linear_and_angular_velocity():
    estimator = PoseVelocityEstimator(max_sample_gap_sec=0.2)
    estimator.update(1_000_000_000, [0.0, 0.0, 0.0, 0.0, 0.0, 0.0])

    sample = estimator.update(
        1_100_000_000,
        [0.1, -0.2, 0.3, 0.1, -0.2, 0.3],
    )

    assert sample.valid is True
    assert sample.linear_mps == pytest.approx((1.0, -2.0, 3.0))
    assert sample.angular_radps == pytest.approx((1.0, -2.0, 3.0))
    assert sample.age_ms == 0


def test_angular_difference_wraps_across_pi():
    estimator = PoseVelocityEstimator(max_sample_gap_sec=0.2)
    estimator.update(1_000_000_000, [0.0, 0.0, 0.0, math.pi - 0.01, 0.0, 0.0])

    sample = estimator.update(
        1_100_000_000,
        [0.0, 0.0, 0.0, -math.pi + 0.01, 0.0, 0.0],
    )

    assert sample.valid is True
    assert sample.angular_radps[0] == pytest.approx(0.2)


@pytest.mark.parametrize(
    "stamp_ns, pose",
    [
        (0, [0.0] * 6),
        (1_000_000_000, [0.0, 0.0, 0.0, 0.0, 0.0, float("nan")]),
    ],
)
def test_invalid_sample_does_not_produce_valid_velocity(stamp_ns, pose):
    estimator = PoseVelocityEstimator(max_sample_gap_sec=0.2)

    sample = estimator.update(stamp_ns, pose)

    assert sample.valid is False
    assert estimator.latest_age_ms(stamp_ns) is None


def test_gap_resets_reference_and_reports_invalid_sample():
    estimator = PoseVelocityEstimator(max_sample_gap_sec=0.2)
    estimator.update(1_000_000_000, [0.0] * 6)

    sample = estimator.update(1_500_000_000, [0.5] + [0.0] * 5)

    assert sample.valid is False
    assert estimator.latest_age_ms(1_500_000_000) == 0

    recovered = estimator.update(1_600_000_000, [0.6] + [0.0] * 5)
    assert recovered.valid is True
    assert recovered.linear_mps[0] == pytest.approx(1.0)


def test_latest_age_marks_a_valid_sample_stale_after_max_gap():
    estimator = PoseVelocityEstimator(max_sample_gap_sec=0.2)
    estimator.update(1_000_000_000, [0.0] * 6)
    estimator.update(1_100_000_000, [0.1] + [0.0] * 5)

    assert estimator.latest_age_ms(1_250_000_000) == 150
    assert estimator.latest_age_ms(1_350_000_000) is None
