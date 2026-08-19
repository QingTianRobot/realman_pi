import math

import pytest

from realman_robot_driver.pose_math import (
    euler_to_quaternion,
    pose_from_reference,
    pose_to_reference,
    quaternion_to_euler,
)


def test_euler_quaternion_round_trip():
    euler = (0.2, -0.3, 1.1)
    assert quaternion_to_euler(euler_to_quaternion(*euler)) == pytest.approx(euler)


def test_fixed_work_frame_conversion_round_trips_position_and_orientation():
    frame_position = (0.4, -0.2, 0.1)
    frame_quaternion = euler_to_quaternion(0.0, 0.0, math.pi / 2.0)
    base_position = (0.6, 0.1, 0.4)
    base_quaternion = euler_to_quaternion(0.1, -0.2, 0.3)

    reference_position, reference_quaternion = pose_to_reference(
        base_position, base_quaternion, frame_position, frame_quaternion
    )
    recovered_position, recovered_quaternion = pose_from_reference(
        frame_position, frame_quaternion, reference_position, reference_quaternion
    )

    assert recovered_position == pytest.approx(base_position)
    assert recovered_quaternion == pytest.approx(base_quaternion)
