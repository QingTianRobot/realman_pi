from setuptools import setup

package_name = 'realman_bt_mock'
setup(name=package_name, version='0.1.0', packages=[package_name],
      data_files=[('share/ament_index/resource_index/packages', ['resource/' + package_name]),
                  ('share/' + package_name, ['package.xml'])],
      entry_points={'console_scripts': [
          'mock_control_mode_source = realman_bt_mock.mock_control_mode_source_node:main',
          'mock_control_backend = realman_bt_mock.mock_control_backend_node:main',
          'motion_command_recorder = realman_bt_mock.motion_command_recorder_node:main',
      ]})
