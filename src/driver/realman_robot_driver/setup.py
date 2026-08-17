from glob import glob
from setuptools import find_packages, setup


package_name = "realman_robot_driver"

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
                *glob("../../../config/ros/realman_driver*.yaml"),
                "../../../config/ros/realman_coordinates.yaml",
                "../../../config/ros/realman_motion.yaml",
            ],
        ),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="RealMan maintainers",
    maintainer_email="maintainer@example.com",
    description="ROS 2 Humble joint-state driver for the RealMan Python robot API.",
    license="BSD-3-Clause",
    tests_require=["pytest"],
    entry_points={
        "console_scripts": [
            "realman_driver_node = realman_robot_driver.realman_driver_node:main",
        ],
    },
)
