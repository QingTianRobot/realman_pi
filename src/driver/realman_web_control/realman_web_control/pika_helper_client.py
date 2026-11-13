"""Blocking JSON call to the host pika_process_helper; run it off the control thread."""

from __future__ import annotations

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

_METHODS = {"status": "GET", "start": "POST", "stop": "POST"}


def call_helper(base_url: str, action: str, timeout_sec: float) -> tuple[bool, dict[str, Any]]:
    method = _METHODS.get(action)
    if method is None:
        raise ValueError(f"unknown Pika helper action: {action}")
    request = Request(f"{base_url}/{action}", data=b"{}" if method == "POST" else None, method=method,
                      headers={"Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=timeout_sec) as response:  # noqa: S310 - configured localhost URL
            return True, _payload(response.read())
    except HTTPError as error:
        return False, _payload(error.read())
    except (URLError, OSError, TimeoutError, ValueError):
        return False, {"ok": False, "error": "Pika helper is not reachable (./rm65 pika-helper install)"}
    except Exception as error:  # noqa: BLE001 - e.g. http.client.HTTPException; the caller must get an answer
        return False, {"ok": False, "error": f"Pika helper call failed: {type(error).__name__}: {error}"}


def _payload(body: bytes) -> dict[str, Any]:
    try:
        payload = json.loads(body or b"{}")
    except ValueError:
        return {"ok": False, "error": "Pika helper returned invalid JSON"}
    return payload if isinstance(payload, dict) else {}
