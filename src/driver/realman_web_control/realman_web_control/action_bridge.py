"""Small ROS-message adapters used by the Web control node."""

from __future__ import annotations

from dataclasses import dataclass
from collections.abc import Iterable
from typing import Any


def assign_fields(message: Any, values: dict[str, Any]) -> Any:
    """Assign validated protocol fields to a generated ROS message."""

    for name, value in values.items():
        if not hasattr(message, name):
            raise ValueError(f"ROS message has no field {name}")
        setattr(message, name, value)
    return message


def message_to_json(message: Any) -> Any:
    """Convert generated ROS feedback/results into JSON-compatible values."""

    if message is None or isinstance(message, (str, int, float, bool)):
        return message
    if isinstance(message, (list, tuple)):
        return [message_to_json(value) for value in message]
    if isinstance(message, dict):
        return {str(key): message_to_json(value) for key, value in message.items()}
    # rosidl fixed arrays are commonly exposed as array.array rather than list.
    if isinstance(message, Iterable) and not isinstance(message, (str, bytes)):
        return [message_to_json(value) for value in message]
    fields = getattr(message, "get_fields_and_field_types", None)
    if callable(fields):
        return {
            name: message_to_json(getattr(message, name))
            for name in fields()
        }
    raise TypeError(f"value of type {type(message).__name__} is not JSON serializable")


@dataclass
class ActionRecord:
    arm: str
    action: str
    owner: str
    request_id: str
    frame_id: str = ""
    goal_handle: Any = None
    cancel_requested: bool = False


def action_event(record: ActionRecord, state: str, **values: Any) -> dict[str, Any]:
    event = {
        "type": "action_state",
        "arm": record.arm,
        "action": record.action,
        "request_id": record.request_id,
        "state": state,
    }
    event.update(values)
    return event
