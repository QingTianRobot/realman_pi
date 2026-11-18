from realman_pika_session.episode_machine import Action, EpisodeMachine, MachineConfig, State

CONFIG = MachineConfig(required_mode="pikavelocity", keyboard_stale_sec=3.0, home_arms=("l", "r"))
START = [Action("start")]
STOP = [Action("stop")]
RESTART = [Action("restart", ("l", "r"))]
STOP_AND_RESTART = STOP + RESTART


def ready(now: float = 0.0) -> EpisodeMachine:
    machine = EpisodeMachine(CONFIG)
    machine.on_mode("pikavelocity", now)
    assert machine.on_keyboard(False, now) == []  # baseline
    return machine


def recording(now: float = 1.0) -> EpisodeMachine:
    machine = ready()
    assert machine.on_keyboard(True, now) == START
    assert machine.on_start_result(True, "s1", "", now) == []
    assert machine.state is State.RECORDING
    return machine


def test_first_keyboard_message_is_only_a_baseline():
    machine = EpisodeMachine(CONFIG)
    machine.on_mode("pikavelocity", 0.0)
    assert machine.on_keyboard(True, 0.0) == []
    assert machine.state is State.IDLE


def test_stop_press_stops_the_recording_and_restarts_the_branch_at_once():
    machine = recording()
    # No waiting for the velocity sessions: leaving the mode makes the router cancel them.
    assert machine.on_keyboard(False, 10.0) == STOP_AND_RESTART
    assert machine.state is State.STOPPING
    assert machine.on_mode("none", 10.1) == []  # our own restart, not an abnormal mode change
    assert machine.on_stop_result(True, "", 10.2) == []
    assert machine.state is State.HOMING
    assert machine.on_mode("pikavelocity", 12.0) == []
    assert machine.on_restart_result(True, "pikavelocity restarted", 12.0) == []
    assert machine.state is State.IDLE
    assert machine.snapshot() == {"state": "idle", "session_id": "s1", "detail": ""}


def test_restart_may_finish_before_the_stop_reply():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    assert machine.on_restart_result(True, "", 6.0) == []
    assert machine.state is State.STOPPING
    assert machine.on_stop_result(True, "", 6.1) == []
    assert machine.state is State.IDLE


def test_stop_failure_still_restarts_but_ends_failed():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    assert machine.on_stop_result(False, "writer error", 5.1) == []
    assert machine.state is State.HOMING
    machine.on_restart_result(True, "", 9.0)
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "stop failed: writer error"


def test_restart_failure_fails():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    machine.on_stop_result(True, "", 5.1)
    assert machine.on_restart_result(False, "pikavelocity not active after 150 s", 160.0) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "restart failed: pikavelocity not active after 150 s"


def test_both_failures_are_reported():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    machine.on_restart_result(False, "none refused: busy", 5.1)
    machine.on_stop_result(False, "writer error", 5.2)
    assert machine.snapshot()["detail"] == "restart failed: none refused: busy; stop failed: writer error"


def test_key_on_again_during_the_restart_records_the_next_episode_after_it():
    """The double press seen on SJD 11-18: STOP, then START 170 ms later. The arms still home first."""
    machine = recording()
    assert machine.on_keyboard(False, 5.0) == STOP_AND_RESTART
    assert machine.on_keyboard(True, 5.17) == []
    assert machine.snapshot()["detail"] == "ignored: busy (stopping)"
    machine.on_stop_result(True, "", 5.3)
    machine.on_mode("none", 5.3)
    machine.on_mode("pikavelocity", 7.0)
    machine.on_keyboard(True, 7.0)  # the keyboard state keeps arriving while the key is on
    assert machine.on_restart_result(True, "", 7.1) == START
    assert machine.state is State.STARTING


def test_key_on_again_but_stale_after_the_restart_starts_nothing():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    machine.on_keyboard(True, 5.2)
    machine.on_stop_result(True, "", 5.3)
    assert machine.on_restart_result(True, "", 9.0) == []  # last keyboard message 3.8 s ago
    assert machine.state is State.IDLE


def test_key_on_again_then_off_during_the_restart_starts_nothing():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    machine.on_keyboard(True, 5.2)
    assert machine.on_keyboard(False, 5.5) == []  # still busy: no second restart
    machine.on_stop_result(True, "", 5.6)
    assert machine.on_restart_result(True, "", 6.0) == []
    assert machine.state is State.IDLE


def test_stop_press_without_a_recording_still_restarts():
    machine = ready()
    machine.on_keyboard(True, 1.0)
    machine.on_start_result(False, "", "preflight failed", 1.1)
    assert machine.on_keyboard(False, 5.0) == RESTART
    assert machine.state is State.HOMING
    assert machine.on_restart_result(True, "", 7.0) == []
    assert machine.state is State.IDLE


def test_stop_press_outside_the_mode_does_nothing():
    machine = ready()
    machine.on_mode("none", 0.5)
    machine.on_keyboard(True, 1.0)
    assert machine.on_keyboard(False, 2.0) == []
    assert machine.state is State.IDLE


def test_unrelated_results_are_ignored():
    machine = recording()
    assert machine.on_restart_result(True, "", 2.0) == []
    assert machine.on_stop_result(True, "", 2.0) == []
    assert machine.state is State.RECORDING


def test_keys_ignored_outside_required_mode():
    machine = ready()
    machine.on_mode("none", 0.5)
    assert machine.on_keyboard(True, 1.0) == []
    assert machine.state is State.IDLE
    assert machine.snapshot()["detail"] == "ignored: mode is none"


def test_keys_ignored_while_someone_else_records():
    machine = ready()
    machine.on_recording_status(True, "policy-7")
    assert machine.on_keyboard(True, 1.0) == []
    assert machine.snapshot()["detail"] == "ignored: recording busy (policy-7)"


def test_start_failure_returns_to_idle():
    machine = ready()
    machine.on_keyboard(True, 1.0)
    assert machine.on_start_result(False, "", "topic_stale:/l/joint_states", 1.2) == []
    assert machine.state is State.IDLE
    assert machine.snapshot()["detail"] == "start failed: topic_stale:/l/joint_states"


def test_release_during_starting_stops_right_after_start():
    machine = ready()
    machine.on_keyboard(True, 1.0)
    assert machine.on_keyboard(False, 1.1) == []
    assert machine.on_start_result(True, "s2", "", 1.3) == STOP_AND_RESTART
    assert machine.state is State.STOPPING


def test_keyboard_stale_is_abnormal_and_never_homes():
    machine = recording(now=1.0)
    assert machine.tick(3.9) == []
    assert machine.tick(4.1) == STOP
    assert machine.on_stop_result(True, "", 4.2) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "abnormal stop: keyboard state stale"


def test_mode_leaving_is_abnormal():
    machine = recording()
    assert machine.on_mode("policy", 2.0) == STOP
    machine.on_stop_result(True, "", 2.1)
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "abnormal stop: mode changed to policy"


def test_keys_ignored_while_homing():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    machine.on_stop_result(True, "", 5.1)
    assert machine.on_keyboard(True, 6.0) == []
    assert machine.state is State.HOMING
    assert machine.snapshot()["detail"] == "ignored: busy (homing)"


def test_press_clears_failed_without_starting():
    machine = recording(now=1.0)
    machine.tick(5.0)
    machine.on_stop_result(True, "", 5.0)
    assert machine.state is State.FAILED
    machine.on_keyboard(False, 6.0)  # keyboard state refreshes; falling edge ignored in FAILED
    assert machine.on_keyboard(True, 7.0) == []
    assert machine.state is State.IDLE
    assert machine.on_keyboard(False, 8.0) == RESTART  # a stop press in the mode always homes
    machine.on_restart_result(True, "", 9.0)
    assert machine.on_keyboard(True, 9.5) == START


def test_mode_change_during_starting_is_abnormal():
    machine = ready()
    assert machine.on_keyboard(True, 1.0) == START
    assert machine.on_mode("policy", 1.1) == []
    assert machine.on_start_result(True, "s3", "", 1.2) == STOP
    assert machine.state is State.STOPPING
    assert machine.on_stop_result(True, "", 1.3) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "abnormal stop: mode changed to policy"


def test_abnormal_stop_with_failed_stop_keeps_both_reasons():
    machine = recording()
    assert machine.on_mode("policy", 2.0) == STOP
    assert machine.on_stop_result(False, "no active recording session to stop", 2.1) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == (
        "abnormal stop: mode changed to policy; stop failed: no active recording session to stop")


def test_mode_lost_while_recording_is_abnormal_and_names_unknown():
    machine = recording()
    assert machine.on_mode("", 2.0) == STOP
    assert machine.on_stop_result(True, "", 2.1) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "abnormal stop: mode changed to unknown"


# ---- a press while the :8765 switch is still entering pikavelocity ------------

def waiting_for_mode(now: float = 0.0) -> EpisodeMachine:
    machine = EpisodeMachine(CONFIG)
    machine.on_mode("none", now)
    assert machine.on_keyboard(False, now) == []
    assert machine.on_keyboard(True, now + 0.1) == []
    assert machine.snapshot()["detail"] == "ignored: mode is none"
    return machine


def test_press_before_the_mode_starts_once_the_mode_arrives():
    machine = waiting_for_mode()
    machine.on_keyboard(True, 0.5)
    assert machine.on_mode("pikavelocity", 0.6) == START
    assert machine.state is State.STARTING
    assert machine.snapshot()["detail"] == ""
    assert machine.on_mode("pikavelocity", 0.7) == []  # repeated mode messages start nothing more


def test_press_released_before_the_mode_starts_nothing():
    machine = waiting_for_mode()
    machine.on_keyboard(False, 0.5)
    assert machine.on_mode("pikavelocity", 0.6) == []
    assert machine.state is State.IDLE


def test_stale_keyboard_when_the_mode_arrives_starts_nothing():
    machine = waiting_for_mode()
    assert machine.on_mode("pikavelocity", 5.0) == []  # last keyboard message 4.9 s ago > 3 s
    assert machine.state is State.IDLE


def test_mode_without_an_ignored_press_starts_nothing():
    machine = EpisodeMachine(CONFIG)
    machine.on_mode("none", 0.0)
    machine.on_keyboard(True, 0.0)  # baseline: teleop was already on when the node started
    machine.on_keyboard(True, 0.5)
    assert machine.on_mode("pikavelocity", 0.6) == []


def test_press_ignored_for_a_busy_recorder_does_not_start_later():
    machine = EpisodeMachine(CONFIG)
    machine.on_mode("pikavelocity", 0.0)
    machine.on_keyboard(False, 0.0)
    machine.on_recording_status(True, "policy-7")
    machine.on_keyboard(True, 0.1)
    machine.on_mode("none", 0.2)
    machine.on_recording_status(False, "")
    assert machine.on_mode("pikavelocity", 0.3) == []


def test_pending_press_waits_for_another_recorder_to_finish():
    machine = waiting_for_mode()
    machine.on_recording_status(True, "policy-7")
    machine.on_keyboard(True, 0.5)
    assert machine.on_mode("pikavelocity", 0.6) == []
    assert machine.snapshot()["detail"] == "ignored: recording busy (policy-7)"
