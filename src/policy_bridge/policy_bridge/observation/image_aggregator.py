"""Multi-camera image aggregation for the uplink observation.

Phase 1 keeps the latest converted frame per configured image name; when more
than one enabled source is present and ``image_sync.mode == approximate`` an
``ApproximateTimeSynchronizer`` aligns them within ``slop_s``. Conversion is done
manually for the common 8-bit encodings so the package does not depend on
``cv_bridge``.
"""

from __future__ import annotations

import numpy as np
from PIL import Image as PilImage

from ..config_loader import ImageTopic, ObservationConfig


_CHANNELS = {"rgb8": 3, "bgr8": 3, "mono8": 1}


def image_msg_to_array(msg, encoding: str) -> np.ndarray | None:
    """Convert a ``sensor_msgs/Image`` to ``uint8[H, W, C]`` (or ``None``)."""
    channels = _CHANNELS.get(encoding)
    if channels is None:
        return None
    height = int(msg.height)
    width = int(msg.width)
    data = np.frombuffer(bytes(msg.data), dtype=np.uint8)
    expected = height * width * channels
    if data.size < expected:
        return None
    return data[:expected].reshape(height, width, channels)


def resize_with_pad(image: np.ndarray, height: int, width: int) -> np.ndarray:
    """Fit ``uint8[H, W, C]`` into ``[height, width]`` without distortion, centred, padded with black.

    Same algorithm as openpi's ``image_tools.resize_with_pad`` (PIL bilinear, zero padding), which the policy server
    applies to every image (``ResizeImages(224, 224)``) before the model sees it, in training and at serving time. A
    frame that already has the target size is returned untouched, so doing the resize here makes the server-side one a
    no-op: the model input is identical, only the uplink is smaller (224x224 instead of 480x640 is ~6x fewer bytes).
    """
    current_height, current_width = image.shape[:2]
    if (current_height, current_width) == (height, width):
        return image
    ratio = max(current_width / width, current_height / height)
    resized_height = int(current_height / ratio)
    resized_width = int(current_width / ratio)
    single_channel = image.ndim == 3 and image.shape[2] == 1
    source = PilImage.fromarray(image[..., 0] if single_channel else image)
    resized = source.resize((resized_width, resized_height), resample=PilImage.BILINEAR)
    canvas = PilImage.new(resized.mode, (width, height), 0)
    canvas.paste(resized, (max(0, int((width - resized_width) / 2)), max(0, int((height - resized_height) / 2))))
    out = np.asarray(canvas)
    return out[..., None] if single_channel else out


class ImageAggregator:
    def __init__(self, node, obs_cfg: ObservationConfig) -> None:
        self._cfg = obs_cfg
        self._node = node
        self._enabled = [img for img in obs_cfg.image_topics if img.enabled]
        self._encoding = {img.name: img.encoding for img in self._enabled}
        self._latest: dict[str, np.ndarray] = {}
        self._subscriptions = []
        self._sync = None
        if node is not None and self._enabled:
            self._wire(node)

    def _wire(self, node) -> None:
        from sensor_msgs.msg import Image

        if self._cfg.image_sync.mode == "approximate" and len(self._enabled) > 1:
            try:
                import message_filters
            except ImportError:  # pragma: no cover - message_filters always present on ROS
                message_filters = None
            if message_filters is not None:
                subs = [
                    message_filters.Subscriber(node, Image, img.topic) for img in self._enabled
                ]
                self._sync = message_filters.ApproximateTimeSynchronizer(
                    subs, queue_size=4, slop=self._cfg.image_sync.slop_s
                )
                self._sync.registerCallback(self._on_synced)
                return
        for img in self._enabled:
            self._subscriptions.append(
                node.create_subscription(
                    Image, img.topic, lambda m, n=img.name: self._store(n, m), 10
                )
            )

    def _on_synced(self, *msgs) -> None:
        for img, msg in zip(self._enabled, msgs):
            self._store(img.name, msg)

    def _store(self, name: str, msg) -> None:
        array = image_msg_to_array(msg, self._encoding.get(name, "rgb8"))
        if array is not None:
            self._latest[name] = array

    def set_latest(self, name: str, array: np.ndarray) -> None:
        """Direct injection (tests / pre-converted sources)."""
        self._latest[name] = array

    def ready(self) -> bool:
        return all(img.name in self._latest for img in self._enabled)

    @staticmethod
    def _prepare(img: ImageTopic, array: np.ndarray) -> np.ndarray:
        """Apply the source's configured ``resize`` ([H, W], letterboxed); no ``resize`` means send as received."""
        if img.resize is None:
            return array
        return resize_with_pad(array, img.resize[0], img.resize[1])

    def snapshot(self) -> dict[str, np.ndarray] | None:
        """Return ``{name: array}`` for all enabled sources, or ``None`` if incomplete."""
        if not self.ready():
            return None
        return {img.name: self._prepare(img, self._latest[img.name]) for img in self._enabled}
