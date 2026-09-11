from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parents[4]


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
