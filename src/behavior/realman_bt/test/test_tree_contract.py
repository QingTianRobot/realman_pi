from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parents[4]
LAUNCH = ROOT / 'src/behavior/realman_bt/launch/arm_move.launch.py'
EXECUTOR = ROOT / 'src/behavior/realman_bt/src/realman_bt_executor_node.cpp'
EXECUTOR_HEADER = ROOT / 'src/behavior/realman_bt/include/realman_bt/realman_bt_executor_node.hpp'
CMAKE = ROOT / 'src/behavior/realman_bt/CMakeLists.txt'
THREE_ARM = ROOT / 'src/behavior/realman_bt/src/three_arm_move_j_node.cpp'


def test_control_mode_tree_has_supervised_sequence():
    root = ET.parse(ROOT / 'config/behavior-trees/control_mode.xml').getroot()
    assert root.attrib['main_tree_to_execute'] == 'MainTree'
    tags = [node.tag for node in root.iter()]
    assert tags.count('SelectControlMode') == 1
    assert tags.count('SwitchControlMode') == 1
    assert tags.count('ControlLeaseGuard') == 1


def test_pick_tree_uses_bounded_retry_and_strategy_fallback():
    root = ET.parse(ROOT / 'config/behavior-trees/pick_task.xml').getroot()
    retry = next(node for node in root.iter('Retry'))
    assert retry.attrib['num_attempts'] == '3'
    assert {node.attrib['name'] for node in root.iter('Sequence') if 'name' in node.attrib} >= {'top_view', 'side_view'}


def test_arm_move_launch_exposes_runtime_snapshot_file_with_workspace_default():
    source = LAUNCH.read_text()
    assert 'def _default_runtime_snapshot_file()' in source
    assert 'os.environ.get("BT_TREE_WORKSPACE", "/tmp/realman-bt-workspace") + "/runtime.json"' in source
    assert 'DeclareLaunchArgument(\n        "runtime_snapshot_file"' in source
    assert '"runtime_snapshot_file": LaunchConfiguration("runtime_snapshot_file")' in source


def test_arm_move_launch_defaults_to_twenty_hz_ticks():
    source = LAUNCH.read_text()
    assert 'default_value="20.0"' in source
    executor = EXECUTOR.read_text()
    assert '"tick_rate_hz", 20.0' in executor


def test_arm_move_launch_exposes_one_shot_terminal_exit():
    source = LAUNCH.read_text()
    assert 'DeclareLaunchArgument(\n        "exit_on_terminal"' in source
    assert 'default_value="true"' in source
    assert '"exit_on_terminal": LaunchConfiguration("exit_on_terminal")' in source


def test_executor_writes_idle_snapshot_after_loading_tree():
    source = EXECUTOR.read_text()
    header = EXECUTOR_HEADER.read_text()
    assert '#include "realman_bt/runtime_snapshot.hpp"' in header
    assert 'RuntimeSnapshotWriter' in header
    assert 'snapshot_writer_->writeIdle(tree_id_, &diagnostics_);' in source


def test_executor_increments_sequence_and_writes_snapshot_for_every_tick_status():
    source = EXECUTOR.read_text()
    assert 'status = tree_->tickOnce();' in source
    assert 'void RealmanBtExecutorNode::flushSnapshot()' in source
    assert '++snapshot_sequence_;' in source
    assert 'snapshot_writer_->write(*tree_, tree_id_, snapshot_sequence_, &diagnostics_);' in source
    tick_body = source[source.index('void RealmanBtExecutorNode::onTick()'):]
    flush_index = tick_body.index('flushSnapshot();')
    terminal_index = tick_body.index('if (bt_core::isStatusCompleted(status)')
    # Snapshot publishing must happen before terminal handling, so all three
    # possible tick results (SUCCESS/FAILURE/RUNNING) are persisted.
    assert terminal_index > flush_index


def test_runtime_snapshot_export_declares_bt_core_dependency():
    source = CMAKE.read_text()
    assert 'install(TARGETS control_mode_state_machine runtime_snapshot' in source
    assert 'target_link_libraries(runtime_snapshot PUBLIC bt::core)' in source
    # The installed realman_bt target has a public bt::core link interface;
    # make sure consumers load the vendored bt_core package before resolving it.
    assert 'ament_export_dependencies(bt_core)' in source


def test_runtime_snapshot_export_does_not_leak_vendor_source_include_path():
    source = CMAKE.read_text()
    target_block = source.split('add_library(runtime_snapshot', 1)[1].split(
        'add_executable(realman_bt_executor', 1
    )[0]
    assert '"${BT_VENDOR_ROOT}"' not in target_block


def test_runtime_snapshot_and_movej_expose_failure_reason_contract():
    snapshot = (ROOT / 'src/behavior/realman_bt/src/runtime_snapshot.cpp').read_text()
    movej = (ROOT / 'src/behavior/realman_bt/src/move_j_node.cpp').read_text()
    node = (ROOT / 'third_party/behavior_tree_cpp/bt_core/include/bt_core/tree_node.hpp').read_text()
    assert 'failure_reason' in snapshot
    assert 'setFailureReason' in movej
    assert 'failureReason()' in node


def test_executor_declares_runtime_diagnostics_rosout_and_event_contract():
    source = EXECUTOR.read_text()
    header = EXECUTOR_HEADER.read_text()
    cmake = CMAKE.read_text()
    package = (ROOT / 'src/behavior/realman_bt/package.xml').read_text()
    movej = (ROOT / 'src/behavior/realman_bt/src/move_j_node.cpp').read_text()

    assert 'RuntimeDiagnostics diagnostics_' in header
    assert 'rcl_interfaces/msg/log.hpp' in header
    assert 'create_subscription<rcl_interfaces::msg::Log>' in source
    assert '"/rosout"' in source
    assert 'ROS_LOG' in source
    assert 'rcl_interfaces' in cmake
    assert '<depend>rcl_interfaces</depend>' in package
    assert 'source = "SERVICE"' in source or '"SERVICE"' in source
    assert '"ACTION"' in movej
    assert '"/realman_bt_executor/start"' in source
    assert '"/realman_bt_executor/stop"' in source
    assert 'wait_server' in movej
    assert 'send_goal' in movej
    assert 'goal_accepted' in movej
    assert 'goal_rejected' in movej
    assert '"result"' in movej
    assert '"timeout"' in movej
    assert '"cancel"' in movej
    assert 'recordTick(status)' in source
    assert 'recordEvent' in source
    assert 'catch (const std::exception& error)' in source


def test_movej_timeout_waits_for_pending_goal_response_and_cancels_once():
    header = (ROOT / 'src/behavior/realman_bt/include/realman_bt/move_j_node.hpp').read_text()
    source = (ROOT / 'src/behavior/realman_bt/src/move_j_node.cpp').read_text()

    assert 'enum class TimeoutState' in header
    assert 'kAwaitingGoalResponse' in header
    assert 'kCancelPending' in header
    assert 'timeout_state_ = TimeoutState::kAwaitingGoalResponse' in source
    assert 'timeout_state_ = TimeoutState::kCancelPending' in source
    assert 'if (cancel_requested_) return;' in source
    cancel_body = source[
        source.index('void MoveJNode::requestCancel'):
        source.index('bt_core::NodeStatus MoveJNode::tick')
    ]
    assert 'result_future_.wait_for(std::chrono::milliseconds(0))' in cancel_body
    assert 'std::future_status::ready' in cancel_body
    halt_body = source[source.index('void MoveJNode::onHalted()'):]
    assert 'if (hasInFlightGoal())' in halt_body


def test_executor_flushes_diagnostics_for_service_events_and_terminal_halts():
    source = EXECUTOR.read_text()

    assert 'void flushSnapshot();' in EXECUTOR_HEADER.read_text()
    assert 'void RealmanBtExecutorNode::flushSnapshot()' in source
    assert source.count('flushSnapshot();') >= 5
    start_body = source[
        source.index('void RealmanBtExecutorNode::handleStart'):
        source.index('void RealmanBtExecutorNode::handleStop')
    ]
    stop_body = source[
        source.index('void RealmanBtExecutorNode::handleStop'):
        source.index('void RealmanBtExecutorNode::flushSnapshot')
    ]
    assert start_body.index('flushSnapshot();') < start_body.index('const bool running')
    assert 'response->message = running ? "already running" : "started";' in start_body
    assert start_body.rindex('flushSnapshot();') > start_body.index('response->message')
    assert stop_body.index('flushSnapshot();') < stop_body.index('const bool running')
    assert stop_body.rindex('flushSnapshot();') > stop_body.index('response->message')


def test_executor_flushes_rosout_diagnostics_for_terminal_or_late_action_errors():
    source = EXECUTOR.read_text()
    rosout_body = source[
        source.index('void RealmanBtExecutorNode::handleRosout'):
        source.index('\n}  // namespace realman_bt', source.index('void RealmanBtExecutorNode::handleRosout'))
    ]
    assert 'recordEvent(' in rosout_body
    assert 'flushSnapshot();' in rosout_body


def test_halted_pending_goal_is_drained_by_executor_owned_async_state():
    header = (ROOT / 'src/behavior/realman_bt/include/realman_bt/move_j_node.hpp').read_text()
    movej = (ROOT / 'src/behavior/realman_bt/src/move_j_node.cpp').read_text()
    executor_header = EXECUTOR_HEADER.read_text()
    executor = EXECUTOR.read_text()

    assert 'class MoveJCancellationDrain' in header
    assert 'kMoveJCancellationDrainSinkBlackboardKey' in header
    assert 'handoffPendingGoalResponse' in movej
    assert 'handoffInFlightGoal' in movej
    assert 'std::move(client_)' in movej
    assert 'std::move(goal_future_)' in movej
    assert 'enqueueCancellationDrain' in executor_header
    assert 'drainCancellationQueue' in executor_header
    assert 'cancellation_drains_' in executor_header
    assert 'create_wall_timer' in executor
    assert 'drainCancellationQueue' in executor
    assert 'if (remaining != current)' in executor


def test_three_arm_movej_is_registered_and_failure_handoffs_other_goals():
    executor = EXECUTOR.read_text()
    source = THREE_ARM.read_text()
    assert 'registerNodeType<ThreeArmMoveJNode>("ThreeArmMoveJ")' in executor
    assert 'if (!handoff(arm) && arm.goal_handle)' in source
    assert 'bool handed_off{false};' in (ROOT / 'src/behavior/realman_bt/include/realman_bt/three_arm_move_j_node.hpp').read_text()


def test_movej_marks_cancellation_only_after_request_succeeds_and_retries_errors():
    source = (ROOT / 'src/behavior/realman_bt/src/move_j_node.cpp').read_text()
    request_cancel = source[
        source.index('void MoveJNode::requestCancel'):
        source.index('bt_core::NodeStatus MoveJNode::tick')
    ]

    assert request_cancel.index('(void)client_->async_cancel_goal(goal_handle_);') < \
        request_cancel.index('cancel_requested_ = true;')
    assert 'timeout_state_ = TimeoutState::kCancelPending;' in request_cancel
    assert 'catch (const std::exception& error)' in request_cancel
    assert 'kCancellationRetry' in source


def test_async_get_result_failure_hands_accepted_goal_to_halt_drain():
    source = (ROOT / 'src/behavior/realman_bt/src/move_j_node.cpp').read_text()

    result_request = source[
        source.index('result_future_ = client_->async_get_result(goal_handle_);'):
        source.index('if (timeout_state_ == TimeoutState::kAwaitingGoalResponse)')
    ]
    assert 'catch (const std::exception& error)' in result_request
    assert 'failed_ = true;' in result_request
    assert 'return bt_core::NodeStatus::FAILURE;' in result_request
    in_flight = source[
        source.index('bool MoveJNode::hasInFlightGoal()'):
        source.index('void MoveJNode::requestCancel')
    ]
    assert 'if (!result_future_.valid()) return true;' in in_flight
    assert '!failed_' not in in_flight
    halt_body = source[source.index('void MoveJNode::onHalted()'):]
    assert 'if (hasInFlightGoal())' in halt_body
    assert 'handoffInFlightGoal()' in halt_body
