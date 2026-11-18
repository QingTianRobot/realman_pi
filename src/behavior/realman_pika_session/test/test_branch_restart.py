from realman_pika_session.branch_restart import BranchRestart, Effect, ModeView


def restart() -> BranchRestart:
    return BranchRestart("pikavelocity", "none", off_timeout_sec=10.0, on_timeout_sec=150.0)


def view(requested, active, phase, request_id, detail=""):
    return ModeView(requested_mode=requested, active_mode=active, phase=phase, request_id=request_id, detail=detail)


def select(mode):
    return [Effect("select", mode_id=mode)]


def test_restart_selects_off_then_the_mode_again():
    r = restart()
    assert r.start(0.0) == select("none")
    assert r.on_select_response("none", True, 7, "accepted", 0.01) == []
    assert r.on_mode_state(view("none", "none", "ACTIVE", 7), 0.1) == select("pikavelocity")
    assert r.on_select_response("pikavelocity", True, 8, "accepted", 0.11) == []
    assert r.on_mode_state(view("pikavelocity", "none", "SWITCHING", 8), 0.2) == []  # entry MoveJ running
    assert r.on_mode_state(view("pikavelocity", "pikavelocity", "ACTIVE", 8), 2.0) == [
        Effect("done", success=True, message="pikavelocity restarted")]
    assert not r.running


def test_state_before_the_response_is_used_once_the_id_is_known():
    r = restart()
    r.start(0.0)
    assert r.on_mode_state(view("none", "none", "ACTIVE", 7), 0.05) == []  # id unknown yet
    assert r.on_select_response("none", True, 7, "", 0.06) == select("pikavelocity")


def test_older_state_is_waited_out():
    r = restart()
    r.start(0.0)
    r.on_select_response("none", True, 7, "", 0.01)
    assert r.on_mode_state(view("pikavelocity", "pikavelocity", "ACTIVE", 6), 0.02) == []
    assert r.running


def test_refused_selection_fails():
    r = restart()
    r.start(0.0)
    assert r.on_select_response("none", False, 0, "unknown mode", 0.01) == [
        Effect("done", success=False, message="none refused: unknown mode")]


def test_failed_entry_fails_with_the_executor_detail():
    r = restart()
    r.start(0.0)
    r.on_select_response("none", True, 7, "", 0.0)
    r.on_mode_state(view("none", "none", "ACTIVE", 7), 0.1)
    r.on_select_response("pikavelocity", True, 8, "", 0.1)
    assert r.on_mode_state(view("pikavelocity", "none", "FAILED", 8, "switch timed out"), 5.0) == [
        Effect("done", success=False, message="switch timed out")]


def test_fallback_under_the_same_id_fails():
    r = restart()
    r.start(0.0)
    r.on_select_response("none", True, 7, "", 0.0)
    r.on_mode_state(view("none", "none", "ACTIVE", 7), 0.1)
    r.on_select_response("pikavelocity", True, 8, "", 0.1)
    effects = r.on_mode_state(view("none", "none", "ACTIVE", 8), 5.0)
    assert effects == [Effect("done", success=False, message="pikavelocity failed")]


def test_newer_request_from_someone_else_supersedes():
    r = restart()
    r.start(0.0)
    r.on_select_response("none", True, 7, "", 0.0)
    effects = r.on_mode_state(view("policy", "none", "SWITCHING", 9), 0.1)
    assert effects == [Effect("done", success=False, message="none superseded by another input mode request")]


def test_each_step_has_its_own_timeout():
    r = restart()
    r.start(0.0)
    r.on_select_response("none", True, 7, "", 0.0)
    assert r.tick(9.9) == []
    assert r.tick(10.1) == [Effect("done", success=False, message="none not active after 10 s")]
    r.start(20.0)
    r.on_select_response("none", True, 9, "", 20.0)
    r.on_mode_state(view("none", "none", "ACTIVE", 9), 21.0)  # pikavelocity deadline = 21 + 150
    assert r.tick(170.0) == []
    assert r.tick(171.1) == [Effect("done", success=False, message="pikavelocity not active after 150 s")]


def test_start_while_running_is_ignored_and_late_answers_are_dropped():
    r = restart()
    r.start(0.0)
    assert r.start(0.1) == []
    r.on_select_response("none", True, 7, "", 0.1)
    r.on_mode_state(view("none", "none", "ACTIVE", 7), 0.2)
    assert r.on_select_response("none", True, 7, "", 0.3) == []  # a duplicate answer for the first step
    assert r.target == "pikavelocity"
