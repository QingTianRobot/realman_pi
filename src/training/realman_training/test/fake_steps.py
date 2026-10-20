"""Job targets for test_jobs.py (imported by the job child through PYTHONPATH)."""

from __future__ import annotations

import time
from pathlib import Path

from realman_training.jobs import StepFailed


def ok(params, log):
    log("hello")
    log.progress(1, 2, "half way")
    return {"echo": params}


def fail(params, log):
    raise StepFailed("nope, and here is why")


def crash(params, log):
    raise ZeroDivisionError("boom")


def sleep(params, log):
    log("sleeping")
    Path(params["flag"]).write_text("started")
    time.sleep(params.get("seconds", 30))
    return {}
