from glob import glob
from pathlib import Path
from setuptools import find_packages, setup


package_name = "realman_web_control"
static_files = [
    path
    for path in glob("realman_web_control/static/*")
    if Path(path).is_file()
]
static_asset_files = glob("realman_web_control/static/assets/*")

setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    data_files=[
        ("share/ament_index/resource_index/packages", [f"resource/{package_name}"]),
        (f"share/{package_name}", ["package.xml"]),
        (f"share/{package_name}/launch", glob("launch/*.launch.py")),
        (
            f"share/{package_name}/config/ros",
            [
                "../../../config/ros/realman_web_control.yaml",
                "../../../config/ros/three_robots.yaml",
                "../../../config/ros/realman_motion.yaml",
                "../../../config/ros/realman_coordinates.yaml",
            ],
        ),
        (f"share/{package_name}/static", static_files),
        (f"share/{package_name}/static/assets", static_asset_files),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="RealMan maintainers",
    maintainer_email="maintainer@example.com",
    description="Authenticated WebSocket and browser UI bridge for RealMan ROS actions.",
    license="BSD-3-Clause",
    tests_require=["pytest"],
    entry_points={
        "console_scripts": [
            "web_control_node = realman_web_control.web_control_node:main",
        ],
    },
)
