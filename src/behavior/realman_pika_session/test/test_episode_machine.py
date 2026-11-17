from realman_pika_session.episode_machine import Action, EpisodeMachine, MachineConfig, State

CONFIG = MachineConfig(required_mode="pikavelocity", keyboard_stale_sec=3.0, release_timeout_sec=8.0, home_arms=("l", "r"))
START = [Action("start")]
STOP = [Action("stop")]
HOME = [Action("home", ("l", "r"))]


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


def test_full_episode_happy_path():
    machine = recording()
    machine.on_velocity_session("l", True, 1.5)
    machine.on_velocity_session("r", True, 1.5)
    assert machine.on_keyboard(False, 10.0) == STOP
    assert machine.state is State.STOPPING
    assert machine.on_stop_result(True, "", 10.1) == []
    assert machine.state is State.RELEASING
    assert machine.on_velocity_session("l", False, 13.0) == []
    assert machine.on_velocity_session("r", False, 13.1) == HOME
    assert machine.state is State.HOMING
    assert machine.on_home_result("l", True, "", 20.0) == []
    assert machine.on_home_result("r", True, "", 21.0) == []
    assert machine.state is State.IDLE
    assert machine.snapshot()["session_id"] == "s1"


def test_release_without_velocity_state_homes_immediately():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    assert machine.on_stop_result(True, "", 5.1) == HOME


def test_release_timeout_homes_anyway():
    machine = recording()
    machine.on_velocity_session("l", True, 1.5)
    machine.on_keyboard(False, 5.0)
    machine.on_stop_result(True, "", 5.0)
    assert machine.tick(12.9) == []
    assert machine.tick(13.1) == HOME
    assert machine.snapshot()["detail"] == "release timeout"


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
    assert machine.on_start_result(True, "s2", "", 1.3) == STOP
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


def test_stop_failure_still_homes_but_ends_failed():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    assert machine.on_stop_result(False, "writer error", 5.1) == HOME
    machine.on_home_result("l", True, "", 9.0)
    machine.on_home_result("r", True, "", 9.0)
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "stop failed: writer error"


def test_home_failure_fails_and_ignores_the_other_result():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    machine.on_stop_result(True, "", 5.1)
    assert machine.on_home_result("l", False, "arm is busy", 6.0) == []
    assert machine.state is State.FAILED
    machine.on_home_result("r", True, "", 7.0)
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "home l failed: arm is busy"


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
    assert machine.on_keyboard(False, 8.0) == []
    assert machine.on_keyboard(True, 9.0) == START


def test_mode_change_during_starting_is_abnormal():
    machine = ready()
    assert machine.on_keyboard(True, 1.0) == START
    assert machine.on_mode("policy", 1.1) == []
    assert machine.on_start_result(True, "s3", "", 1.2) == STOP
    assert machine.state is State.STOPPING
    assert machine.on_stop_result(True, "", 1.3) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "abnormal stop: mode changed to policy"


def test_mode_change_while_releasing_skips_home():
    machine = recording()
    machine.on_velocity_session("l", True, 1.5)
    assert machine.on_keyboard(False, 5.0) == STOP
    assert machine.on_stop_result(True, "", 5.1) == []
    assert machine.state is State.RELEASING
    assert machine.on_mode("policy", 6.0) == []
    assert machine.on_velocity_session("l", False, 7.0) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "home skipped: mode changed to policy"


def test_mode_change_before_stop_result_skips_home():
    machine = recording()
    assert machine.on_keyboard(False, 5.0) == STOP
    assert machine.on_mode("none", 5.05) == []
    assert machine.on_stop_result(True, "", 5.1) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "home skipped: mode changed to none"


def test_release_timeout_with_mode_changed_keeps_failed_detail():
    machine = recording()
    machine.on_velocity_session("l", True, 1.5)
    machine.on_keyboard(False, 5.0)
    machine.on_stop_result(True, "", 5.0)
    machine.on_mode("policy", 6.0)
    assert machine.tick(13.1) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "home skipped: mode changed to policy"


def test_key_pressed_again_during_releasing_skips_home():
    machine = recording()
    machine.on_velocity_session("l", True, 1.5)
    assert machine.on_keyboard(False, 5.0) == STOP
    assert machine.on_stop_result(True, "", 5.1) == []
    assert machine.state is State.RELEASING
    assert machine.on_keyboard(True, 6.0) == []  # teleop back on before the arms were homed
    assert machine.on_velocity_session("l", False, 7.0) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "home skipped: teleop re-enabled"


def test_key_pressed_again_during_stopping_skips_home():
    machine = recording()
    assert machine.on_keyboard(False, 5.0) == STOP
    assert machine.on_keyboard(True, 5.05) == []
    assert machine.on_stop_result(True, "", 5.1) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "home skipped: teleop re-enabled"


def test_key_pressed_again_then_release_timeout_skips_home():
    machine = recording()
    machine.on_velocity_session("l", True, 1.5)
    machine.on_keyboard(False, 5.0)
    machine.on_stop_result(True, "", 5.0)
    machine.on_keyboard(True, 6.0)
    assert machine.tick(13.1) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "home skipped: teleop re-enabled"


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
