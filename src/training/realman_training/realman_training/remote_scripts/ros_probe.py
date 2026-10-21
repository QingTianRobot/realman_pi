"""ros_probe: run inside a ROS container on realman_ts; print one JSON line with the requested answers.

usage: python3 - REQUEST... < ros_probe.py
  nodes          node names on the graph (after 2 s of discovery)
  mode=SEC       current /realman_bt_executor/input_mode_state (null = no executor on the graph;
                 {"unknown": true} = the executor runs but sent nothing within SEC)
  stats=SEC      last /policy/stats values of the policy_bridge status within SEC (null = none)
  prompt=TEXT    publish TEXT on /policy/prompt until /policy/stats reports it (10 s at most)
"""

import json
import os
import sys
import time

import rclpy
from rclpy.node import Node

MODE_TOPIC = "/realman_bt_executor/input_mode_state"
STATS_TOPIC = "/policy/stats"
PROMPT_TOPIC = "/policy/prompt"


def spin_until(node, done, seconds):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline and not done():
        rclpy.spin_once(node, timeout_sec=0.1)


def nodes(node):
    spin_until(node, lambda: False, 2.0)
    return sorted(f"{ns.rstrip('/')}/{name}" for name, ns in node.get_node_names_and_namespaces())


def mode(node, seconds):
    from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy
    from realman_msgs.msg import InputModeState

    # The executor publishes transient-local depth 1, only on change: a transient-local subscription gets the
    # current state at once.
    qos = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
    box = []
    sub = node.create_subscription(InputModeState, MODE_TOPIC, box.append, qos)
    spin_until(node, lambda: box, seconds)
    node.destroy_subscription(sub)
    if not box:
        names = [name for name, _ in node.get_node_names_and_namespaces()]
        if "realman_bt_executor" in names:
            return {"unknown": True, "detail": "realman_bt_executor is running but sent no input_mode_state"}
        return None
    m = box[-1]
    return {"requested_mode": m.requested_mode, "selected_mode": m.selected_mode, "active_mode": m.active_mode,
            "phase": int(m.phase), "detail": m.detail}


def _values(msg):
    for status in msg.status:
        if status.name == "policy_bridge":
            return {kv.key: kv.value for kv in status.values}
    return None


def _stats_box(node):
    from diagnostic_msgs.msg import DiagnosticArray

    box = []

    def on_msg(msg):
        values = _values(msg)
        if values is not None:
            box.append(values)

    return box, node.create_subscription(DiagnosticArray, STATS_TOPIC, on_msg, 10)


def stats(node, seconds):
    box, sub = _stats_box(node)
    spin_until(node, lambda: box, seconds)
    node.destroy_subscription(sub)
    return box[-1] if box else None


def prompt(node, text):
    from std_msgs.msg import String

    pub = node.create_publisher(String, PROMPT_TOPIC, 10)
    box, sub = _stats_box(node)
    spin_until(node, lambda: pub.get_subscription_count() > 0, 5.0)
    published = pub.get_subscription_count() > 0
    deadline = time.monotonic() + 10.0
    confirmed = False
    while published and time.monotonic() < deadline and not confirmed:
        pub.publish(String(data=text))
        spin_until(node, lambda: box and box[-1].get("prompt") == text, 1.0)
        confirmed = bool(box) and box[-1].get("prompt") == text
    node.destroy_subscription(sub)
    return {"published": published, "confirmed": confirmed, "stats": box[-1] if box else None}


def main():
    rclpy.init()
    node = Node(f"realman_training_probe_{os.getpid()}")
    result = {}
    try:
        for request in sys.argv[1:]:
            key, _, value = request.partition("=")
            if key == "nodes":
                result["nodes"] = nodes(node)
            elif key == "mode":
                result["mode"] = mode(node, float(value or 10))
            elif key == "stats":
                result["stats"] = stats(node, float(value or 5))
            elif key == "prompt":
                result["prompt"] = prompt(node, value)
            else:
                raise SystemExit(f"unknown request {request!r}")
    finally:
        node.destroy_node()
        rclpy.shutdown()
    print(json.dumps(result))


main()
