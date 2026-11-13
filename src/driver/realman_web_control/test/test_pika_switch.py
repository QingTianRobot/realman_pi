from realman_web_control.pika_switch import PIKA_CLIENT_ID, ModeView, PikaSwitch, PikaSwitchConfig

CONFIG = PikaSwitchConfig(input_fresh_ms=500, input_wait_timeout_sec=30, status_poll_sec=2,
                          mode_switch_timeout_sec=150, mode="pikavelocity", off_mode="none")


class Clock:
    def __init__(self):
        self.now = 100.0

    def __call__(self):
        return self.now


def mode(active="none", phase="ACTIVE", requested=None, selectable=True, available=True, detail="", request_id=0):
    return ModeView(available, selectable, phase, requested or active, active, detail, request_id)


def kinds(effects):
    return [(e.kind, e.payload.get("action") or e.payload.get("mode_id") or e.payload.get("code") or e.payload.get("phase"))
            for e in effects]


def selects(effects):
    return [e for e in effects if e.kind == "select_mode"]


def accept(switch, effects, executor_request_id, accepted=True, message=""):
    """Feed the bridge's input_mode_result for the select_mode effect in `effects`."""
    [select] = selects(effects)
    return switch.mode_request_result(select.payload["request_id"], accepted, executor_request_id, message)


def make(running=False):
    clock = Clock()
    switch = PikaSwitch(CONFIG, enabled=True, clock=clock)
    switch.helper_result("status", True, {"running": running})
    return switch, clock


def feed(switch, clock, arms=("l", "r")):
    for arm in arms:
        switch.input_received(arm)


def _to_selecting(switch, clock, request_id="p1"):
    switch.command("c1", request_id, True, mode())
    switch.helper_result("start", True, {})
    feed(switch, clock)
    effects = switch.tick(mode())
    assert switch.state_event()["phase"] == "selecting"
    return effects


def test_disabled_switch_is_unavailable_and_refuses():
    switch = PikaSwitch(CONFIG, enabled=False, clock=Clock())
    assert switch.state_event()["available"] is False
    assert kinds(switch.command("c1", "p1", True, mode())) == [("reply_error", "pika_switch_unavailable")]


def test_unreachable_helper_is_unavailable():
    switch, _ = make()
    switch.helper_result("status", False, {"error": "down"})
    assert switch.state_event()["available"] is False


def test_on_refused_when_mode_not_selectable_and_stack_not_started():
    switch, _ = make()
    effects = switch.command("c1", "p1", True, mode(selectable=False))
    assert kinds(effects) == [("reply_error", "pika_mode_unavailable")]
    assert switch.state_event()["phase"] == "off"


def test_full_on_sequence():
    switch, clock = make()
    effects = switch.command("c1", "p1", True, mode())
    assert ("helper", "start") in kinds(effects)
    assert switch.state_event()["phase"] == "starting"
    switch.helper_result("start", True, {"ok": True})
    assert switch.state_event()["phase"] == "waiting_input"
    assert kinds(switch.tick(mode())) == []  # no input yet, nothing new
    feed(switch, clock, ("l",))
    switch.tick(mode())
    assert switch.state_event()["input_age_ms"]["r"] is None
    feed(switch, clock)
    effects = switch.tick(mode())
    select = selects(effects)
    assert select[0].payload == {"mode_id": "pikavelocity", "request_id": "pika-1"}
    assert switch.state_event()["phase"] == "selecting"
    assert accept(switch, effects, 7) == []
    switch.tick(mode(active="none", phase="SWITCHING", requested="pikavelocity", request_id=7))
    assert switch.state_event()["phase"] == "selecting"
    switch.tick(mode(active="pikavelocity", request_id=7))
    assert switch.state_event()["phase"] == "on"


def test_select_mode_uses_own_client_id():
    switch, clock = make()
    select = selects(_to_selecting(switch, clock))
    assert select[0].client_id == PIKA_CLIENT_ID == "pika_switch"


def test_waiting_input_broadcasts_rising_input_ages():
    switch, clock = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", True, {})
    switch.input_received("l")
    ages = []
    for _ in range(3):
        clock.now += 0.1
        events = [e for e in switch.tick(mode()) if e.kind == "send_event"]
        assert len(events) == 1 and events[0].client_id is None
        ages.append(events[0].payload["input_age_ms"]["l"])
    assert ages == [100, 200, 300]


def test_waiting_input_times_out_naming_missing_arm_and_leaves_stack():
    switch, clock = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", True, {})
    for _ in range(31):
        clock.now += 1
        switch.input_received("l")
        effects = switch.tick(mode())
    state = switch.state_event()
    assert state["phase"] == "failed"
    assert "/pika/r" in state["detail"] and "/pika/l" not in state["detail"]
    assert ("helper", "stop") not in kinds(effects)


def test_stale_input_does_not_count():
    switch, clock = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", True, {})
    feed(switch, clock)
    clock.now += 1.0  # older than 500 ms
    assert not selects(switch.tick(mode()))


def test_start_failure_reports_output():
    switch, _ = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", False, {"error": "start failed with exit 1", "output_tail": ["no server"]})
    state = switch.state_event()
    assert state["phase"] == "failed" and "no server" in state["detail"]


def test_mode_failure_and_timeout():
    for final, advance in ((mode(active="none", phase="FAILED", requested="pikavelocity", detail="MoveJ failed",
                                 request_id=7), 0),
                           (mode(active="none", phase="SWITCHING", requested="pikavelocity", request_id=7), 151)):
        switch, clock = make()
        accept(switch, _to_selecting(switch, clock), 7)
        clock.now += advance
        switch.tick(final)
        assert switch.state_event()["phase"] == "failed"


def test_mode_failure_detail_comes_from_snapshot():
    switch, clock = make()
    accept(switch, _to_selecting(switch, clock), 7)
    switch.tick(mode(active="none", phase="FAILED", requested="pikavelocity", detail="MoveJ failed", request_id=7))
    assert switch.state_event()["detail"] == "MoveJ failed"


def test_refused_pikavelocity_fails_immediately():
    switch, clock = make()
    effects = accept(switch, _to_selecting(switch, clock), 7, accepted=False, message="executor busy")
    state = switch.state_event()
    assert state["phase"] == "failed" and state["detail"] == "pikavelocity refused: executor busy"
    assert any(e.kind == "send_event" for e in effects)


def test_result_for_other_request_is_ignored():
    switch, clock = make()
    _to_selecting(switch, clock)
    assert switch.mode_request_result("pika-99", False, 7, "x") == []
    assert switch.state_event()["phase"] == "selecting"


def test_stale_failed_snapshot_from_older_request_does_not_fail_retry():
    switch, clock = make()
    stale = mode(active="none", phase="FAILED", requested="pikavelocity", detail="old failure", request_id=3)
    effects = _to_selecting(switch, clock)
    switch.tick(stale)  # executor id not known yet
    assert switch.state_event()["phase"] == "selecting"
    accept(switch, effects, 4)
    switch.tick(stale)  # older request id
    assert switch.state_event()["phase"] == "selecting"
    switch.tick(mode(active="pikavelocity", request_id=4))
    assert switch.state_event()["phase"] == "on"


def test_superseded_while_selecting_fails():
    switch, clock = make()
    accept(switch, _to_selecting(switch, clock), 7)
    switch.tick(mode(active="keyboard", request_id=8))
    state = switch.state_event()
    assert state["phase"] == "failed" and "superseded" in state["detail"]


def test_already_active_reply_turns_on():
    switch, clock = make()
    switch.command("c1", "p1", True, mode(active="pikavelocity", request_id=5))
    switch.helper_result("start", True, {})
    feed(switch, clock)
    effects = switch.tick(mode(active="pikavelocity", request_id=5))
    assert switch.state_event()["phase"] == "selecting"
    accept(switch, effects, 5)
    switch.tick(mode(active="pikavelocity", request_id=5))
    assert switch.state_event()["phase"] == "on"


def test_selecting_with_router_gone_fails():
    switch, clock = make()
    _to_selecting(switch, clock)
    switch.tick(mode(available=False, phase=None, active=""))
    assert switch.state_event()["phase"] == "failed"


def test_busy_during_transition():
    switch, _ = make()
    switch.command("c1", "p1", True, mode())
    assert kinds(switch.command("c2", "p2", False, mode())) == [("reply_error", "pika_switch_busy")]


def _turn_on(switch, clock, executor_request_id=7):
    accept(switch, _to_selecting(switch, clock), executor_request_id)
    switch.tick(mode(active="pikavelocity", request_id=executor_request_id))
    assert switch.state_event()["phase"] == "on"


def _turn_off(switch, clock):
    _turn_on(switch, clock)
    effects = switch.command("c1", "p9", False, mode(active="pikavelocity", request_id=7))
    assert [e.payload["mode_id"] for e in selects(effects)] == ["none"]
    assert ("helper", "stop") not in kinds(effects)
    return effects


def test_on_while_on_is_noop_but_answers_requester():
    switch, clock = make()
    _turn_on(switch, clock)
    effects = switch.command("c2", "p2", True, mode(active="pikavelocity", request_id=7))
    assert [(e.kind, e.client_id) for e in effects] == [("send_event", "c2")]
    assert effects[0].payload == switch.state_event()
    assert switch.state_event()["phase"] == "on"


def test_off_selects_none_then_stops_stack():
    switch, clock = make()
    effects = _turn_off(switch, clock)
    assert selects(effects)[0].client_id == PIKA_CLIENT_ID
    accept(switch, effects, 8)
    effects = switch.tick(mode(active="none", request_id=8))
    assert ("helper", "stop") in kinds(effects)
    assert switch.state_event()["phase"] == "stopping"
    switch.helper_result("stop", True, {})
    assert switch.state_event()["phase"] == "off"
    assert switch.state_event()["stack_running"] is False


def test_off_does_not_stop_on_stale_none_snapshot():
    switch, clock = make()
    effects = _turn_off(switch, clock)
    # An ACTIVE none snapshot from an older request must not count as reached.
    assert ("helper", "stop") not in kinds(switch.tick(mode(active="none", request_id=6)))
    accept(switch, effects, 8)
    assert ("helper", "stop") not in kinds(switch.tick(mode(active="none", request_id=6)))


def test_off_stops_stack_even_if_none_is_refused_or_router_gone():
    for final in (mode(active="pikavelocity", phase="FAILED", requested="none", detail="busy", request_id=8),
                  mode(available=False, phase=None, active="")):
        switch, clock = make()
        accept(switch, _turn_off(switch, clock), 8)
        effects = switch.tick(final)
        assert ("helper", "stop") in kinds(effects)


def test_refused_none_stops_at_once_and_reports_after_off():
    switch, clock = make()
    effects = accept(switch, _turn_off(switch, clock), 8, accepted=False, message="session busy")
    assert ("helper", "stop") in kinds(effects)
    switch.helper_result("stop", True, {})
    state = switch.state_event()
    assert state["phase"] == "off" and state["detail"] == "none refused: session busy"


def test_off_superseded_stops_stack():
    switch, clock = make()
    accept(switch, _turn_off(switch, clock), 8)
    effects = switch.tick(mode(active="keyboard", request_id=9))
    assert ("helper", "stop") in kinds(effects)
    assert "superseded" in switch.state_event()["detail"]


def test_stopping_timeout_issues_stop():
    switch, clock = make()
    accept(switch, _turn_off(switch, clock), 8)
    assert ("helper", "stop") not in kinds(switch.tick(mode(active="pikavelocity", phase="SWITCHING",
                                                             requested="none", request_id=8)))
    clock.now += 151
    effects = switch.tick(mode(active="pikavelocity", phase="SWITCHING", requested="none", request_id=8))
    assert ("helper", "stop") in kinds(effects)
    assert switch.state_event()["detail"] == "none not active after 150 s"


def test_helper_stop_failure_fails():
    switch, _ = make(running=True)
    switch.command("c1", "p1", False, mode(active="keyboard"))
    switch.helper_result("stop", False, {"error": "stop failed"})
    state = switch.state_event()
    assert state["phase"] == "failed" and "stop failed" in state["detail"]


def test_off_skips_mode_when_not_in_pika_mode():
    switch, _ = make(running=True)
    effects = switch.command("c1", "p1", False, mode(active="keyboard"))
    assert ("helper", "stop") in kinds(effects)
    assert not selects(effects)


def test_off_selects_none_while_pika_mode_is_requested():
    switch, _ = make(running=True)
    effects = switch.command("c1", "p1", False, mode(active="none", phase="SWITCHING", requested="pikavelocity"))
    assert [e.payload["mode_id"] for e in selects(effects)] == ["none"]


def test_running_with_other_mode_is_off_and_off_only_stops():
    switch, _ = make(running=True)
    switch.tick(mode(active="keyboard"))
    state = switch.state_event()
    assert state["phase"] == "off" and state["stack_running"] is True
    effects = switch.command("c1", "p1", False, mode(active="keyboard"))
    assert ("helper", "stop") in kinds(effects) and not selects(effects)


def test_status_poll_and_external_changes():
    switch, clock = make()
    assert kinds(switch.tick(mode())) == []
    clock.now += 2.1
    assert ("helper", "status") in kinds(switch.tick(mode()))
    switch.helper_result("status", True, {"running": True})
    switch.tick(mode(active="pikavelocity"))
    assert switch.state_event()["phase"] == "on"  # started elsewhere and already in Pika mode
    switch.helper_result("status", True, {"running": False})
    switch.tick(mode(active="pikavelocity"))
    assert switch.state_event()["phase"] == "off"


def test_stale_status_result_after_start_is_ignored():
    switch, clock = make()
    clock.now += 2.1
    [status] = [e for e in switch.tick(mode()) if e.kind == "helper"]
    assert status.payload["action"] == "status" and "epoch" in status.payload
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", True, {})
    assert switch.helper_result("status", True, {"running": False}, epoch=status.payload["epoch"]) == []
    assert switch.state_event()["stack_running"] is True
    feed(switch, clock)
    accept(switch, switch.tick(mode()), 7)
    switch.tick(mode(active="pikavelocity", request_id=7))
    switch.tick(mode(active="pikavelocity", request_id=7))
    assert switch.state_event()["phase"] == "on"


def test_current_status_result_applies():
    switch, clock = make()
    clock.now += 2.1
    [status] = [e for e in switch.tick(mode()) if e.kind == "helper"]
    switch.helper_result("status", False, {"error": "down"}, epoch=status.payload["epoch"])
    assert switch.state_event()["available"] is False


def test_mode_lost_is_shown_while_on():
    switch, clock = make()
    _turn_on(switch, clock)
    switch.tick(mode(active="keyboard"))
    state = switch.state_event()
    assert state["phase"] == "on" and state["mode_lost"] is True


def test_mode_lost_updates_while_status_in_flight():
    switch, clock = make()
    _turn_on(switch, clock)
    clock.now += 2.1
    assert ("helper", "status") in kinds(switch.tick(mode(active="pikavelocity", request_id=7)))
    switch.tick(mode(active="keyboard", request_id=9))
    assert switch.state_event()["mode_lost"] is True


def test_failed_retry_on_and_off():
    switch, _ = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", False, {"error": "x"})
    assert ("helper", "start") in kinds(switch.command("c1", "p2", True, mode()))
    switch.helper_result("start", False, {"error": "x"})
    switch.helper_result("status", True, {"running": True})
    assert ("helper", "stop") in kinds(switch.command("c1", "p3", False, mode()))


def test_every_phase_change_broadcasts_state():
    switch, _ = make()
    effects = switch.command("c1", "p1", True, mode())
    assert any(e.kind == "send_event" and e.client_id is None and e.payload["type"] == "pika_switch_state"
               for e in effects)


def _request_id(effects):
    [select] = selects(effects)
    return select.payload["request_id"]


def test_bridge_error_before_acceptance_fails_at_once():
    switch, clock = make()
    request_id = _request_id(_to_selecting(switch, clock))
    effects = switch.mode_request_error(request_id, "input_mode_not_selectable",
                                        "input mode is not selectable: pikavelocity")
    state = switch.state_event()
    assert state["phase"] == "failed"
    assert state["detail"] == "pikavelocity refused: input mode is not selectable: pikavelocity"
    assert any(e.kind == "send_event" for e in effects)


def test_bridge_pending_timeout_is_ignored():
    switch, clock = make()
    effects = _to_selecting(switch, clock)
    accept(switch, effects, 7)
    assert switch.mode_request_error(_request_id(effects), "input_mode_timeout", "timed out") == []
    assert switch.state_event()["phase"] == "selecting"
    switch.tick(mode(active="pikavelocity", request_id=7))
    assert switch.state_event()["phase"] == "on"


def test_bridge_error_for_other_request_is_ignored():
    switch, clock = make()
    _to_selecting(switch, clock)
    assert switch.mode_request_error("p1", "input_mode_unavailable", "x") == []
    assert switch.state_event()["phase"] == "selecting"


def test_refusal_then_error_and_snapshot_stop_only_once():
    switch, clock = make()
    effects = _turn_off(switch, clock)
    request_id = _request_id(effects)
    stops = kinds(accept(switch, effects, 8, accepted=False, message="busy"))
    # The bridge follows a refusal with an input_mode_rejected error, and a FAILED snapshot may arrive too.
    stops += kinds(switch.mode_request_error(request_id, "input_mode_rejected", "busy"))
    stops += kinds(switch.tick(mode(active="pikavelocity", phase="FAILED", requested="none", detail="busy",
                                    request_id=8)))
    assert stops.count(("helper", "stop")) == 1


def test_error_after_snapshot_failure_does_not_stop_twice():
    switch, clock = make()
    effects = _turn_off(switch, clock)
    accept(switch, effects, 8)
    stops = kinds(switch.tick(mode(active="pikavelocity", phase="FAILED", requested="none", detail="busy",
                                   request_id=8)))
    stops += kinds(switch.mode_request_error(_request_id(effects), "input_mode_failed", "busy"))
    assert stops.count(("helper", "stop")) == 1


def test_executor_fallback_after_failed_switch_fails_selecting():
    # After a failed switch the executor falls back to `none` under the same request id;
    # FAILED is visible for one executor tick only and is usually missed.
    fallback = mode(active="none", phase="SWITCHING", requested="none",
                    detail="pikavelocity failed: MoveJ timeout", request_id=7)
    for snapshots in ((fallback,), (fallback, mode(active="none", request_id=7)), (mode(active="none", request_id=7),)):
        switch, clock = make()
        accept(switch, _to_selecting(switch, clock), 7)
        for snapshot in snapshots:
            switch.tick(snapshot)
        state = switch.state_event()
        assert state["phase"] == "failed"
        assert state["detail"] == (snapshots[0].detail or "pikavelocity failed")


def test_off_step_executor_back_on_pika_mode_stops_stack():
    switch, clock = make()
    accept(switch, _turn_off(switch, clock), 8)
    effects = switch.tick(mode(active="pikavelocity", phase="SWITCHING", requested="pikavelocity",
                               detail="none failed: busy", request_id=8))
    assert ("helper", "stop") in kinds(effects)
    assert switch.state_event()["detail"] == "none failed: busy"


def test_off_step_router_gone_records_detail():
    switch, clock = make()
    accept(switch, _turn_off(switch, clock), 8)
    effects = switch.tick(mode(available=False, phase=None, active=""))
    assert ("helper", "stop") in kinds(effects)
    assert switch.state_event()["detail"] == "input mode router is unavailable"
