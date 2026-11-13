from realman_web_control.pika_switch import ModeView, PikaSwitch, PikaSwitchConfig

CONFIG = PikaSwitchConfig(input_fresh_ms=500, input_wait_timeout_sec=30, status_poll_sec=2,
                          mode_switch_timeout_sec=150, mode="pikavelocity", off_mode="none")


class Clock:
    def __init__(self):
        self.now = 100.0

    def __call__(self):
        return self.now


def mode(active="none", phase="ACTIVE", requested=None, selectable=True, available=True, detail=""):
    return ModeView(available, selectable, phase, requested or active, active, detail)


def kinds(effects):
    return [(e.kind, e.payload.get("action") or e.payload.get("mode_id") or e.payload.get("code") or e.payload.get("phase"))
            for e in effects]


def make(running=False):
    clock = Clock()
    switch = PikaSwitch(CONFIG, enabled=True, clock=clock)
    switch.helper_result("status", True, {"running": running})
    return switch, clock


def feed(switch, clock, arms=("l", "r")):
    for arm in arms:
        switch.input_received(arm)


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
    select = [e for e in effects if e.kind == "select_mode"]
    assert select[0].payload["mode_id"] == "pikavelocity" and select[0].client_id == "c1"
    assert switch.state_event()["phase"] == "selecting"
    switch.tick(mode(active="none", phase="SWITCHING", requested="pikavelocity"))
    assert switch.state_event()["phase"] == "selecting"
    switch.tick(mode(active="pikavelocity"))
    assert switch.state_event()["phase"] == "on"


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
    assert not [e for e in switch.tick(mode()) if e.kind == "select_mode"]


def test_start_failure_reports_output():
    switch, _ = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", False, {"error": "start failed with exit 1", "output_tail": ["no server"]})
    state = switch.state_event()
    assert state["phase"] == "failed" and "no server" in state["detail"]


def test_mode_failure_and_timeout():
    for final, advance in ((mode(active="none", phase="FAILED", requested="pikavelocity", detail="MoveJ failed"), 0),
                           (mode(active="none", phase="SWITCHING", requested="pikavelocity"), 151)):
        switch, clock = make()
        switch.command("c1", "p1", True, mode())
        switch.helper_result("start", True, {})
        feed(switch, clock)
        switch.tick(mode())
        clock.now += advance
        switch.tick(final)
        assert switch.state_event()["phase"] == "failed"


def test_busy_during_transition():
    switch, _ = make()
    switch.command("c1", "p1", True, mode())
    assert kinds(switch.command("c2", "p2", False, mode())) == [("reply_error", "pika_switch_busy")]


def _turn_on(switch, clock):
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", True, {})
    feed(switch, clock)
    switch.tick(mode())
    switch.tick(mode(active="pikavelocity"))
    assert switch.state_event()["phase"] == "on"


def test_off_selects_none_then_stops_stack():
    switch, clock = make()
    _turn_on(switch, clock)
    effects = switch.command("c1", "p9", False, mode(active="pikavelocity"))
    assert [e.payload["mode_id"] for e in effects if e.kind == "select_mode"] == ["none"]
    assert ("helper", "stop") not in kinds(effects)
    effects = switch.tick(mode(active="none"))
    assert ("helper", "stop") in kinds(effects)
    assert switch.state_event()["phase"] == "stopping"
    switch.helper_result("stop", True, {})
    assert switch.state_event()["phase"] == "off"
    assert switch.state_event()["stack_running"] is False


def test_off_stops_stack_even_if_none_is_refused_or_router_gone():
    for final in (mode(active="pikavelocity", phase="FAILED", requested="none", detail="busy"),
                  mode(available=False, phase=None, active="")):
        switch, clock = make()
        _turn_on(switch, clock)
        switch.command("c1", "p9", False, mode(active="pikavelocity"))
        effects = switch.tick(final)
        assert ("helper", "stop") in kinds(effects)


def test_off_skips_mode_when_not_in_pika_mode():
    switch, _ = make(running=True)
    effects = switch.command("c1", "p1", False, mode(active="keyboard"))
    assert ("helper", "stop") in kinds(effects)
    assert not [e for e in effects if e.kind == "select_mode"]


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


def test_mode_lost_is_shown_while_on():
    switch, clock = make()
    _turn_on(switch, clock)
    switch.tick(mode(active="keyboard"))
    state = switch.state_event()
    assert state["phase"] == "on" and state["mode_lost"] is True


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
