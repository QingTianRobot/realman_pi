"""Package metadata for the recording-first recorder and its helper workers."""
from glob import glob
from pathlib import Path

from setuptools import find_packages, setup


package_name = "realman_recording"

# The dashboard UI is a Vite build (config/recording/vite.config.mjs) checked into
# static/ alongside its hashed assets/ bundle, exactly like realman_web_control.
static_files = [path for path in glob("realman_recording/static/*") if Path(path).is_file()]
static_asset_files = glob("realman_recording/static/assets/*")

setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    data_files=[
        ("share/ament_index/resource_index/packages", [f"resource/{package_name}"]),
        (f"share/{package_name}", ["package.xml"]),
        (f"share/{package_name}/launch", glob("launch/*.launch.py")),
        (f"share/{package_name}/config/ros", glob("../../../config/ros/recording.yaml")),
        (f"share/{package_name}/static", static_files),
        (f"share/{package_name}/static/assets", static_asset_files),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="RealMan maintainers",
    maintainer_email="maintainer@example.com",
    description="Isolated, recording-first ROS 2 data recorder for the RealMan platform.",
    license="BSD-3-Clause",
    entry_points={
        "console_scripts": [
            "recorder_node = realman_recording.recorder_node:main",
            "web_bridge_node = realman_recording.web_bridge_node:main",
            "lerobot_exporter = realman_recording.lerobot_exporter:main",
            "recording_runtime_probe = realman_recording.runtime_probe:main",
        ],
    },
)
