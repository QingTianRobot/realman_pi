import os
from glob import glob
from setuptools import setup

package_name = 'gripper_ros2'

setup(
    name=package_name,
    version='1.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
         ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('share', package_name, 'launch'),
         glob('launch/*.launch.py')),
        (os.path.join('share', package_name, 'config'),
         glob('config/*.yaml')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='gripper_maintainer',
    maintainer_email='maintainer@example.com',
    description='ROS 2 wrapper for Changingtek gripper (Modbus RTU).',
    license='BSD-3-Clause',
    entry_points={
        'console_scripts': [
            'gripper_node = gripper_ros2.gripper_node:main',
        ],
    },
)
