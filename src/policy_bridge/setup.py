from glob import glob
from setuptools import find_packages, setup


package_name = "policy_bridge"

setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    data_files=[
        ("share/ament_index/resource_index/packages", [f"resource/{package_name}"]),
        (f"share/{package_name}", ["package.xml"]),
        (f"share/{package_name}/launch", glob("launch/*.launch.py")),
    ],
    install_requires=["setuptools"],
    # colcon selects its pytest runner from setuptools' required test adapter.
    tests_require=["pytest"],
    zip_safe=True,
    maintainer="RealMan maintainers",
    maintainer_email="maintainer@example.com",
    description="Pure protocol bridge between a VLA policy WebSocket service and ROS 2.",
    license="BSD-3-Clause",
    entry_points={
        "console_scripts": [
            "policy_bridge_node = policy_bridge.policy_bridge_node:main",
            "mock_policy_server = policy_bridge.tools.mock_policy_server:main",
        ],
    },
)
