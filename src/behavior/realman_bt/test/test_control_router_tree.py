from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).parents[4]
ROUTER = ROOT / "config/behavior-trees/control_router.xml"
CMAKE = ROOT / "src/behavior/realman_bt/CMakeLists.txt"


def test_control_router_is_the_literal_authoritative_mode_catalog():
    document = ET.parse(ROUTER).getroot()
    assert document.attrib == {"main_tree_to_execute": "InputControl"}
    behavior_tree = document.find("BehaviorTree")
    assert behavior_tree is not None
    assert behavior_tree.attrib == {"ID": "InputControl"}

    root_children = list(behavior_tree)
    assert len(root_children) == 1
    root = root_children[0]
    assert root.tag == "ReactiveSequence"
    assert root.attrib == {"name": "input_control"}
    selector, router = list(root)
    assert selector.tag == "SelectInputMode"
    assert selector.attrib == {"selected_mode": "{selected_mode}"}
    assert router.tag == "ReactiveFallback"
    assert router.attrib == {"name": "input_router"}
    assert len(document.findall(".//ReactiveFallback")) == 1

    expected = [
        ("web", "Web", "false", "WebInputStub"),
        ("policy", "Policy", "true", "PolicyInputStub"),
        ("pika", "Pika", "true", "PikaInputStub"),
        ("none", "无输入", "true", "IdleInput"),
    ]
    assert len(list(router)) == len(expected)
    for branch, (mode, label, selectable, leaf_tag) in zip(router, expected):
        assert branch.tag == "ReactiveSequence"
        assert branch.attrib == {"name": f"{mode}_branch"}
        guard, activation, leaf = list(branch)
        assert guard.tag == "InputModeGuard"
        assert guard.attrib == {
            "mode": mode,
            "label": label,
            "selectable": selectable,
            "selected_mode": "{selected_mode}",
        }
        assert activation.tag == "ActivateInputMode"
        assert activation.attrib == {"mode": mode}
        assert leaf.tag == leaf_tag
        assert leaf.attrib == {}

    registration_nodes = [selector, *document.findall(".//InputModeGuard")]
    remapped = [
        (attribute, value)
        for node in registration_nodes
        for attribute, value in node.attrib.items()
        if value.startswith("{") or value.endswith("}")
    ]
    assert remapped == [("selected_mode", "{selected_mode}")] * 5


def test_control_router_is_installed_with_the_package():
    source = CMAKE.read_text()
    assert 'config/behavior-trees/control_router.xml"' in source
    assert "DESTINATION share/${PROJECT_NAME}/behavior-trees" in source
