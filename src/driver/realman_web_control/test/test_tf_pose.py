from types import SimpleNamespace

import pytest

from realman_web_control.tf_pose import compose_pose, transform_stamped_pose


def test_compose_pose_applies_translation_and_rotation():
    position, quaternion = compose_pose(
        (1.0, 2.0, 0.0),
        (2**0.5 / 2, 0.0, 0.0, 2**0.5 / 2),
        (1.0, 0.0, 0.0),
        (1.0, 0.0, 0.0, 0.0),
    )

    assert position == pytest.approx((1.0, 3.0, 0.0))
    assert quaternion == pytest.approx((2**0.5 / 2, 0.0, 0.0, 2**0.5 / 2))


def test_transform_stamped_pose_reads_geometry_message_shape():
    transform = SimpleNamespace(
        transform=SimpleNamespace(
            translation=SimpleNamespace(x=0.1, y=0.2, z=0.3),
            rotation=SimpleNamespace(w=1.0, x=0.0, y=0.0, z=0.0),
        )
    )

    position, quaternion = transform_stamped_pose(
        transform, [0.4, 0.5, 0.6], [1.0, 0.0, 0.0, 0.0]
    )

    assert position == pytest.approx((0.5, 0.7, 0.9))
    assert quaternion == pytest.approx((1.0, 0.0, 0.0, 0.0))
