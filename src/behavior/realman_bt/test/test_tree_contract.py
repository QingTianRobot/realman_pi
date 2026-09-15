from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parents[4]
LAUNCH = ROOT / 'src/behavior/realman_bt/launch/arm_move.launch.py'
EXECUTOR = ROOT / 'src/behavior/realman_bt/src/realman_bt_executor_node.cpp'
EXECUTOR_HEADER = ROOT / 'src/behavior/realman_bt/include/realman_bt/realman_bt_executor_node.hpp'


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


def test_executor_writes_idle_snapshot_after_loading_tree():
    source = EXECUTOR.read_text()
    header = EXECUTOR_HEADER.read_text()
    assert '#include "realman_bt/runtime_snapshot.hpp"' in header
    assert 'RuntimeSnapshotWriter' in header
    assert 'snapshot_writer_->writeIdle(tree_id_);' in source


def test_executor_increments_sequence_and_writes_snapshot_for_every_tick_status():
    source = EXECUTOR.read_text()
    assert 'status = tree_->tickOnce();' in source
    assert '++snapshot_sequence_;' in source
    assert 'snapshot_writer_->write(*tree_, tree_id_, snapshot_sequence_);' in source
    tick_body = source[source.index('void RealmanBtExecutorNode::onTick()'):]
    write_index = tick_body.index('snapshot_writer_->write(*tree_, tree_id_, snapshot_sequence_);')
    # Snapshot publishing must happen before terminal handling, so all three
    # possible tick results (SUCCESS/FAILURE/RUNNING) are persisted.
    assert 'if (stop_on_terminal_ && bt_core::isStatusCompleted(status))' in tick_body
    assert tick_body.index('if (stop_on_terminal_ && bt_core::isStatusCompleted(status))') > write_index
