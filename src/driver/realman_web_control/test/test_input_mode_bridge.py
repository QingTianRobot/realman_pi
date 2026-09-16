"""Literal state traces proving that mode selection cannot release stale motion."""

from dataclasses import FrozenInstanceError

import pytest

from realman_web_control.input_mode_bridge import (
    InputModeBridge, InputModeEffect, InputModeOption, InputModeSnapshot,
)


CATALOG = (
    InputModeOption("web", "Web", False),
    InputModeOption("policy", "Policy", True),
    InputModeOption("pika", "Pika", True),
    InputModeOption("none", "None", True),
    InputModeOption("maintenance", "Maintenance", False),
)


class Clock:
    now = 10.0

    def __call__(self):
        return self.now


@pytest.fixture
def bridge():
    clock = Clock()
    return InputModeBridge(web_override_timeout_sec=5.0, clock=clock), clock


def motion(request="move-1", kind="execute_motion", arm="l"):
    return {"type": kind, "request_id": request, "arm": arm, "goal": {"target": [1, 2, 3]}}


def state(request_id=41, mode="web", phase="ACTIVE", epoch=2, detail=""):
    return InputModeSnapshot(mode, mode if phase == "ACTIVE" else "none",
                             mode if phase == "ACTIVE" else "none", phase,
                             request_id, epoch, detail)


def kinds(effects):
    return [effect.kind for effect in effects]


def forwarded(effects):
    return [effect for effect in effects if effect.kind == "forward_motion"]


def errors(effects):
    return [effect for effect in effects
            if effect.kind == "send_event" and effect.payload["type"] == "error"]


def start(bridge, message=None, owner="browser-a"):
    bridge.update_catalog(CATALOG)
    effects = bridge.intercept_motion(owner, message or motion())
    assert kinds(effects) == ["request_mode"]
    assert effects[0].payload == {"mode_id": "web", "request_id": (message or motion())["request_id"]}
    assert effects[0].client_id == owner
    return effects[0].token


def test_absent_catalog_preserves_direct_motion(bridge):
    controller, _ = bridge
    effects = controller.intercept_motion("browser-a", motion())
    assert effects == [InputModeEffect("forward_motion", "browser-a", motion())]


def test_catalog_and_snapshot_preserve_executor_labels_order_and_fields(bridge):
    controller, _ = bridge
    effects = controller.update_catalog((InputModeOption("futuremode", "Future label", True),))
    assert effects[0].payload == {"type": "input_mode_list", "available": True,
                                  "modes": [{"id": "futuremode", "label": "Future label", "selectable": True}]}
    snapshot = state(7, "futuremode", epoch=3, detail="placeholder")
    assert controller.update_state(snapshot)[0].payload == {
        "type": "input_mode_state", "requested_mode": "futuremode", "selected_mode": "futuremode",
        "active_mode": "futuremode", "phase": "ACTIVE", "request_id": 7, "epoch": 3, "detail": "placeholder",
    }
    assert [effect.client_id for effect in controller.cached_events("new-client")] == ["new-client", "new-client"]
    with pytest.raises(FrozenInstanceError):
        snapshot.active_mode = "web"


@pytest.mark.parametrize("kind", ["execute_motion", "execute_trajectory", "start_cartesian_velocity"])
@pytest.mark.parametrize("state_first", [False, True])
def test_motion_waits_for_accepted_request_and_matching_active_state_once(bridge, kind, state_first):
    controller, _ = bridge
    message = motion(kind=kind)
    token = start(controller, message)
    first = (controller.update_state(state()) if state_first else
             controller.selection_response(token, True, 41, "accepted"))
    assert not forwarded(first)
    second = (controller.selection_response(token, True, 41, "accepted") if state_first else
              controller.update_state(state()))
    assert forwarded(second) == [InputModeEffect("forward_motion", "browser-a", message)]
    assert not forwarded(controller.update_state(state()))
    assert controller.selection_response(token, True, 41, "duplicate") == []
    # Completion and later expiry have no path that restores Policy/Pika.
    assert controller.expire() == []
    assert all(effect.kind != "request_mode" for effect in second)


def test_stale_request_state_and_pre_request_cache_cannot_release_motion(bridge):
    controller, _ = bridge
    controller.update_catalog(CATALOG)
    controller.update_state(state())
    token = controller.intercept_motion("browser-a", motion())[0].token
    assert not forwarded(controller.selection_response(token + 1, True, 41, "stale callback"))
    assert not forwarded(controller.selection_response(token, True, 41, "already active"))
    assert not forwarded(controller.update_state(state(40)))
    assert not forwarded(controller.update_state(state(41, phase="SWITCHING", epoch=1)))
    assert len(forwarded(controller.update_state(state()))) == 1


@pytest.mark.parametrize("failure", ["timeout", "failed", "unavailable", "rejected", "superseded_state"])
def test_override_failure_discards_command_without_later_fallback(bridge, failure):
    controller, clock = bridge
    token = start(controller)
    if failure != "rejected":
        controller.selection_response(token, True, 41, "accepted")
    if failure == "timeout":
        clock.now = 15.0
        effects = controller.expire()
    elif failure == "failed":
        effects = controller.update_state(state(41, phase="FAILED", detail="branch failed"))
    elif failure == "unavailable":
        effects = controller.update_catalog(None)
        assert effects[0] in errors(effects)
        assert effects[-1].payload == {"type": "input_mode_list", "available": False, "modes": []}
    elif failure == "rejected":
        effects = controller.selection_response(token, False, 0, "router refused")
    else:
        effects = controller.update_state(state(42, "pika"))
    assert errors(effects)[0].payload["request_id"] == "move-1"
    assert not forwarded(effects)
    assert not forwarded(controller.update_state(state()))
    assert not forwarded(controller.selection_response(token, True, 41, "late"))


@pytest.mark.parametrize("late_event", ["state", "response"])
def test_deadline_is_checked_at_release_even_before_expiry_timer_runs(bridge, late_event):
    controller, clock = bridge
    token = start(controller)
    if late_event == "state":
        controller.selection_response(token, True, 41, "accepted")
    else:
        controller.update_state(state())
    clock.now = 15.01
    effects = (controller.update_state(state()) if late_event == "state" else
               controller.selection_response(token, True, 41, "accepted"))
    assert errors(effects)
    assert not forwarded(effects)


def test_new_browser_request_supersedes_globally_even_when_browser_ids_match(bridge):
    controller, _ = bridge
    old_token = start(controller)
    effects = controller.intercept_motion("browser-b", motion(arm="r"))
    assert kinds(effects) == ["send_event", "request_mode"]
    assert errors(effects)[0].client_id == "browser-a"
    new_token = effects[-1].token
    assert new_token != old_token
    assert controller.selection_response(old_token, True, 41, "old") == []
    controller.update_state(state())
    assert not forwarded(controller.selection_response(new_token, True, 42, "new"))
    assert forwarded(controller.update_state(state(42))) == [
        InputModeEffect("forward_motion", "browser-b", motion(arm="r")),
    ]


def test_new_user_selection_discards_pending_override(bridge):
    controller, _ = bridge
    token = start(controller)
    effects = controller.select_mode("browser-b", {"request_id": "pick-1", "mode_id": "pika"})
    assert errors(effects)[0].payload["request_id"] == "move-1"
    assert effects[-1].payload["mode_id"] == "pika"
    assert controller.selection_response(token, True, 41, "old") == []
    assert not forwarded(controller.update_state(state()))


def test_leaving_active_web_cancels_before_requesting_mode(bridge):
    controller, _ = bridge
    controller.update_catalog(CATALOG)
    controller.update_state(state())
    effects = controller.select_mode("browser-b", {"request_id": "pick-1", "mode_id": "policy"})
    assert kinds(effects) == ["cancel_web_actions", "request_mode"]
    response = controller.selection_response(effects[-1].token, True, 42, "accepted")
    assert response[0].payload == {"type": "input_mode_result", "request_id": "pick-1",
                                   "executor_request_id": 42, "accepted": True, "message": "accepted"}
    assert not forwarded(controller.update_state(state(42, "policy")))


@pytest.mark.parametrize("mode,available,code", [
    ("web", True, "input_mode_not_selectable"),
    ("unknown", True, "input_mode_unknown"),
    ("maintenance", True, "input_mode_not_selectable"),
    ("policy", False, "input_mode_unavailable"),
])
def test_invalid_dropdown_choice_never_requests_mode(bridge, mode, available, code):
    controller, _ = bridge
    if available:
        controller.update_catalog(CATALOG)
    effects = controller.select_mode("browser-a", {"request_id": "pick-1", "mode_id": mode})
    assert kinds(effects) == ["send_event"]
    assert errors(effects)[0].payload["code"] == code


@pytest.mark.parametrize("kind", ["software_stop", "gripper_command", "recover_motion", "velocity_command", "cancel_action"])
def test_mode_neutral_messages_are_not_accepted_by_motion_gate(bridge, kind):
    controller, _ = bridge
    with pytest.raises(ValueError, match="motion"):
        controller.intercept_motion("browser-a", {"type": kind})


def test_disconnected_client_pending_motion_is_discarded(bridge):
    controller, _ = bridge
    token = start(controller)
    assert controller.client_disconnected("browser-b") == []
    assert errors(controller.client_disconnected("browser-a"))
    assert controller.selection_response(token, True, 41, "late") == []
    assert not forwarded(controller.update_state(state()))


def test_next_separate_command_is_direct_after_confirmed_disappearance(bridge):
    controller, _ = bridge
    start(controller)
    assert not forwarded(controller.update_catalog(None))
    assert len(forwarded(controller.intercept_motion("browser-b", motion("move-2")))) == 1
