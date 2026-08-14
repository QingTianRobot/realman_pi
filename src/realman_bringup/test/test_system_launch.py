from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from launch import LaunchDescription, LaunchService
from launch.actions import SetLaunchConfiguration


def test_disabled_system_launch_expands_without_starting_processes(tmp_path, monkeypatch):
    monkeypatch.setenv("REALMAN_LOG_ROOT", str(tmp_path / "logs"))
    launch_path = Path(__file__).parents[1] / "launch" / "system.launch.py"
    spec = spec_from_file_location("realman_system_launch", launch_path)
    assert spec is not None and spec.loader is not None
    module = module_from_spec(spec)
    spec.loader.exec_module(module)

    launch_description = module.generate_launch_description()
    disabled_config = [
        SetLaunchConfiguration(name, "false")
        for name in (
            "start_robots",
            "start_driver",
            "start_joy_driver",
            "start_controller",
            "use_gui",
            "use_rviz",
        )
    ]
    service = LaunchService()
    service.include_launch_description(
        LaunchDescription([*disabled_config, *launch_description.entities])
    )

    assert service.run() == 0
