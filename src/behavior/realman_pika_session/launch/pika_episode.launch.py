#!/usr/bin/env python3
"""Start the Pika keyboard episode trigger when config/ros/pika_episode.yaml enables it."""
import os
from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import LogInfo
from launch_ros.actions import Node

from realman_pika_session.config_loader import load_episode_config, load_home_pose


def _config_root() -> Path:
    fallback = Path(get_package_share_directory("realman_pika_session")) / "config"
    return Path(os.environ.get("REALMAN_CONFIG_ROOT", fallback))


def generate_launch_description():
    root = _config_root()
    episode_file = root / "ros" / "pika_episode.yaml"
    pika_file = root / "ros" / "pika_config.yaml"
    config = load_episode_config(episode_file)
    if not config.enabled:
        return LaunchDescription([LogInfo(msg=f"pika_episode_trigger disabled ({episode_file})")])
    load_home_pose(pika_file)  # fail the launch early on a bad home pose
    return LaunchDescription([
        Node(
            package="realman_pika_session",
            executable="pika_episode_trigger",
            name="pika_episode_trigger",
            output="screen",
            arguments=[
                "--ros-args",
                "-p", f"episode_config_file:={episode_file}",
                "-p", f"pika_config_file:={pika_file}",
            ],
        ),
    ])
