"""Unit tests for policy_bridge.observation.image_aggregator (the uplink image resize)."""

from __future__ import annotations

from types import SimpleNamespace

import numpy as np
import pytest
from PIL import Image

from policy_bridge.config_loader import ImageTopic
from policy_bridge.observation.image_aggregator import ImageAggregator, resize_with_pad


def _openpi_resize_with_pad(image: np.ndarray, height: int, width: int) -> np.ndarray:
    """Oracle: openpi's `image_tools.resize_with_pad` for one image (packages/openpi-client), copied verbatim.

    The policy server runs this on every image (`ResizeImages(224, 224)`) in training and at serving time, so the
    bridge's resize has to reproduce it exactly or the model would see different pixels than it was trained on.
    """
    if image.shape[-3:-1] == (height, width):
        return image
    pil = Image.fromarray(image)
    cur_width, cur_height = pil.size
    ratio = max(cur_width / width, cur_height / height)
    resized_height = int(cur_height / ratio)
    resized_width = int(cur_width / ratio)
    resized_image = pil.resize((resized_width, resized_height), resample=Image.BILINEAR)
    zero_image = Image.new(resized_image.mode, (width, height), 0)
    pad_height = max(0, int((height - resized_height) / 2))
    pad_width = max(0, int((width - resized_width) / 2))
    zero_image.paste(resized_image, (pad_width, pad_height))
    return np.asarray(zero_image)


def _random_image(height: int, width: int, seed: int = 0) -> np.ndarray:
    return np.random.default_rng(seed).integers(0, 256, (height, width, 3), dtype=np.uint8)


@pytest.mark.parametrize("shape", [(480, 640), (720, 1280), (640, 480), (100, 100), (224, 300), (300, 224)])
def test_resize_matches_openpi_bit_for_bit(shape):
    image = _random_image(*shape)
    ours = resize_with_pad(image, 224, 224)
    assert ours.shape == (224, 224, 3) and ours.dtype == np.uint8
    np.testing.assert_array_equal(ours, _openpi_resize_with_pad(image, 224, 224))


def test_landscape_frame_is_letterboxed_not_stretched():
    out = resize_with_pad(np.full((480, 640, 3), 255, dtype=np.uint8), 224, 224)
    # 640x480 -> 224x168 centred: 28 black rows above and below, picture in between, nothing at the sides.
    assert not out[:28].any() and not out[196:].any()
    assert (out[28:196] == 255).all()


def test_frame_of_target_size_is_returned_untouched():
    image = _random_image(224, 224)
    assert resize_with_pad(image, 224, 224) is image


def test_single_channel_frame_keeps_its_channel_axis():
    image = np.random.default_rng(1).integers(0, 256, (480, 640, 1), dtype=np.uint8)
    out = resize_with_pad(image, 224, 224)
    assert out.shape == (224, 224, 1)
    np.testing.assert_array_equal(out[..., 0], _openpi_resize_with_pad(image[..., 0], 224, 224))


def _aggregator(resize) -> ImageAggregator:
    topics = [ImageTopic(name="wrist_image", topic="/cam", encoding="rgb8", resize=resize, enabled=True)]
    return ImageAggregator(None, SimpleNamespace(image_topics=topics))


def test_snapshot_applies_the_configured_resize():
    frame = _random_image(480, 640)
    aggregator = _aggregator((224, 224))
    aggregator.set_latest("wrist_image", frame)
    snap = aggregator.snapshot()
    np.testing.assert_array_equal(snap["wrist_image"], _openpi_resize_with_pad(frame, 224, 224))


def test_snapshot_without_resize_sends_the_frame_as_received():
    frame = _random_image(480, 640)
    aggregator = _aggregator(None)
    aggregator.set_latest("wrist_image", frame)
    assert aggregator.snapshot()["wrist_image"] is frame


def test_snapshot_is_none_until_every_enabled_source_has_a_frame():
    assert _aggregator((224, 224)).snapshot() is None
