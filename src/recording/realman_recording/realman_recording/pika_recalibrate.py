"""Guarded one-click Pika lighthouse recalibration through the host pika_process_helper.

The helper (scripts/pika_process_helper.py) runs on the Pika host and is reached
through a loopback tunnel. This module is ROS-neutral: the bridge passes in the
latest recorder state and Pika snapshot, so the guard is unit-testable.
"""

from __future__ import annotations

import json
from typing import Any, Callable, Mapping
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

# RecordingStatus states in which restarting Pika would cut a take: COUNTDOWN, RECORDING, FINALIZING.
BUSY_RECORDING_STATES = frozenset({1, 2, 4})
LOOPBACK_HOSTS = frozenset({"127.0.0.1", "localhost", "::1"})
_METHODS = {"status": "GET", "recalibrate": "POST"}

HelperCall = Callable[[str, str, float], tuple[int, dict[str, Any]]]


def validate_helper_url(value: str) -> str:
    url = str(value).strip().rstrip("/")
    if not url:
        return ""
    parts = urlsplit(url)
    if parts.scheme != "http" or parts.hostname not in LOOPBACK_HOSTS:
        raise ValueError("pika_helper_url must be empty or an http:// URL on 127.0.0.1, localhost or ::1")
    return url


def call_helper(base_url: str, action: str, timeout_sec: float) -> tuple[int, dict[str, Any]]:
    method = _METHODS.get(action)
    if method is None:
        raise ValueError(f"unknown Pika helper action: {action}")
    request = Request(f"{base_url}/{action}", data=b"{}" if method == "POST" else None, method=method,
                      headers={"Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=timeout_sec) as response:  # noqa: S310 - validated loopback URL
            return response.status, _payload(response.read())
    except HTTPError as error:
        return error.code, _payload(error.read())
    except (URLError, OSError, TimeoutError, ValueError):
        return 0, {"ok": False, "error": "Pika helper is not reachable"}
    except Exception as error:  # noqa: BLE001 - e.g. http.client.HTTPException; the page must get an answer
        return 0, {"ok": False, "error": f"Pika helper call failed: {type(error).__name__}: {error}"}


def _payload(body: bytes) -> dict[str, Any]:
    try:
        payload = json.loads(body or b"{}")
    except ValueError:
        return {"ok": False, "error": "Pika helper returned invalid JSON"}
    return payload if isinstance(payload, dict) else {}


def recalibrate(helper_url: str, timeout_sec: float, recording_state: Any,
                pika_snapshot: Mapping[str, Any] | None, call: HelperCall = call_helper) -> tuple[int, dict[str, Any]]:
    """Return (HTTP status, JSON body) for POST /api/pika/recalibrate."""
    if recording_state in BUSY_RECORDING_STATES:
        return 409, {"ok": False, "error": "录制进行中，不能重标定"}
    sides = (pika_snapshot or {}).get("sides") or {}
    active = sorted(side for side, data in sides.items() if isinstance(data, Mapping) and data.get("command_active"))
    if active:
        return 409, {"ok": False, "error": f"Pika 速度指令进行中（{'、'.join(active)}），不能重标定"}
    status, payload = call(helper_url, "recalibrate", timeout_sec)
    if status == 200 and payload.get("ok"):
        return 200, payload
    body = {"ok": False, "error": payload.get("error") or f"Pika helper answered HTTP {status}",
            "output_tail": payload.get("output_tail", [])}
    return (409 if status == 409 else 502), body
