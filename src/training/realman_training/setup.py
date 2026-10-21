from setuptools import find_packages, setup

# Not a ROS package: src/training/COLCON_IGNORE keeps colcon from building it.
setup(
    name="realman_training",
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    python_requires=">=3.10",
    install_requires=["aiohttp>=3.9", "numpy", "pyarrow", "pyyaml"],
    entry_points={"console_scripts": ["realman-train = realman_training.cli:main"]},
    package_data={"realman_training": ["openpi_scripts/*.py", "remote_scripts/*.py", "static/*", "static/assets/*"]},
)
