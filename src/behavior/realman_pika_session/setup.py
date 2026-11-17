"""Package metadata for the Pika keyboard episode trigger."""
from glob import glob

from setuptools import find_packages, setup

package_name = "realman_pika_session"

setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    data_files=[
        ("share/ament_index/resource_index/packages", [f"resource/{package_name}"]),
        (f"share/{package_name}", ["package.xml"]),
        (f"share/{package_name}/launch", glob("launch/*.launch.py")),
        (f"share/{package_name}/config/ros", glob("../../../config/ros/pika_episode.yaml")),
        (f"share/{package_name}/config/ros", glob("../../../config/ros/pika_config.yaml")),
    ],
    install_requires=["setuptools"],
    tests_require=["pytest"],
    zip_safe=True,
    maintainer="RealMan maintainers",
    maintainer_email="maintainer@example.com",
    description="Starts and stops one recording per Pika keyboard teleop session and homes the arms.",
    license="BSD-3-Clause",
    entry_points={
        "console_scripts": [
            "pika_episode_trigger = realman_pika_session.trigger_node:main",
        ],
    },
)
