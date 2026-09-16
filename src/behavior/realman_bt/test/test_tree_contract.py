from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parents[4]
LAUNCH = ROOT / 'src/behavior/realman_bt/launch/arm_move.launch.py'
EXECUTOR = ROOT / 'src/behavior/realman_bt/src/realman_bt_executor_node.cpp'
EXECUTOR_HEADER = ROOT / 'src/behavior/realman_bt/include/realman_bt/realman_bt_executor_node.hpp'
CMAKE = ROOT / 'src/behavior/realman_bt/CMakeLists.txt'


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
    # Snapshot publishing must happen before terminal handling, so all three
    # possible tick results (SUCCESS/FAILURE/RUNNING) are persisted.
    assert 'if (stop_on_terminal_ && bt_core::isStatusCompleted(status))' in tick_body
    assert tick_body.index('if (stop_on_terminal_ && bt_core::isStatusCompleted(status))') > flush_index


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
