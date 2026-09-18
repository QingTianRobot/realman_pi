"""Assemble the observation dict sent to the policy service.

Field names are fixed by contract: ``state``, ``wrist_image``, ``global_image``,
``prompt`` (image keys follow the configured ``image_topics[].name``). Any
missing required part makes ``build`` return ``None`` so the scheduler skips the
cycle rather than sending a partial observation.
"""

from __future__ import annotations

import numpy as np

from .image_aggregator import ImageAggregator
from .state_composer import StateComposer
from ..prompt_provider import PromptProvider


class ObservationBuilder:
    def __init__(
        self,
        images: ImageAggregator,
        state: StateComposer,
        prompt: PromptProvider,
    ) -> None:
        self._images = images
        self._state = state
        self._prompt = prompt

    def build(self, side: str) -> dict | None:
        state = self._state.compose(side)
        if state is None:
            return None
        images = self._images.snapshot()
        if images is None:
            return None
        observation: dict = {
            "state": np.asarray(state, dtype=np.float32),
            "prompt": self._prompt.current(),
        }
        observation.update(images)
        return observation
