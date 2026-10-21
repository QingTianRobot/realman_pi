"""Job targets for the e2e backend (web_fake.py): a few log lines and a progress bar, no side effects."""

from __future__ import annotations

import time


def _fake(kind: str, params: dict, log) -> dict:
    log(f"fake {kind} started")
    for i in range(1, 5):
        time.sleep(0.25)
        log.progress(i, 4, f"{kind} {i}/4")
        log(f"fake {kind} step {i}/4")
    log(f"fake {kind} done")
    return {"fake": True, "kind": kind}


def pull(params, log):
    return _fake("pull", params, log)


def clean(params, log):
    return _fake("clean", params, log)


def view(params, log):
    return _fake("view", params, log)


def norm(params, log):
    return _fake("norm", params, log)


def train(params, log):
    return _fake("train", params, log)


def eval(params, log):  # noqa: A001 - named after the job kind
    return _fake("eval", params, log)


def register(params, log):
    return _fake("register", params, log)


def serve(params, log):
    return _fake("serve", params, log)


def linkcheck(params, log):
    return _fake("linkcheck", params, log)
