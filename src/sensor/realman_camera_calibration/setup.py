from glob import glob

from setuptools import find_packages, setup


package_name = "realman_camera_calibration"

setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    data_files=[
        ("share/ament_index/resource_index/packages", [f"resource/{package_name}"]),
        (f"share/{package_name}", ["package.xml", "README.md"]),
        (f"share/{package_name}/launch", glob("launch/*.launch.py")),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="RealMan maintainers",
    maintainer_email="maintainer@example.com",
    description="ROS 2 scaffold for multi-camera calibration sessions.",
    license="BSD-3-Clause",
    entry_points={
        "console_scripts": [
            "camera_calibration_node = realman_camera_calibration.camera_calibration_node:main",
        ],
    },
)
