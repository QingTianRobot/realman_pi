from pathlib import Path
import sys

import pytest


ROOT = Path(__file__).parents[4]
sys.path.insert(0, str(ROOT / "src/behavior/realman_bt/launch"))

from coordinate_reference_registry import load_runtime_registries  # noqa: E402


def test_runtime_registry_maps_one_reference_name_to_driver_fields():
    references, profiles = load_runtime_registries(
        ROOT / "config/ros/realman_coordinates.yaml",
        ROOT / "config/ros/realman_motion.yaml",
    )

    assert "l|default_tool|2|tcpgrip|l/tool/tcpgrip" in references
    assert "l|tool/tcpgrip|2|tcpgrip|l/tool/tcpgrip" in references
    assert "l|default_work|1|cell|l/work/cell" in references
    assert "l|work/pikabase|1|pikabase|l/work/pikabase" in references
    assert "r|work/pikabase|1|pikabase|r/work/pikabase" in references
    assert "l|base|0|base|l/base_link" in references
    assert "l|20|100|0.05|0.25|0.1|0.5|10|2" in profiles


def test_runtime_registry_rejects_delimiter_in_reference_fields(tmp_path):
    coordinates = tmp_path / "coordinates.yaml"
    coordinates.write_text(
        """
robots:
  l:
    default_tool: tcpgrip
    default_work: cell
    tools:
      tcpgrip:
        controller_name: tcpgrip
        ros_frame_id: l/tool/tcpgrip
    work_frames:
      cell:
        controller_name: cell
        ros_frame_id: l/work/cell
""",
        encoding="utf-8",
    )
    motion = tmp_path / "motion.yaml"
    motion.write_text(
        """
robots:
  l:
    velocity_control_period_ms: 20
    velocity_watchdog_ms: 100
    max_linear_accel_mps2: 0.1
    max_angular_accel_radps2: 0.5
    default_timeout_sec: 10
    stop_timeout_sec: 2
""",
        encoding="utf-8",
    )

    # A controller-visible name may contain neither the registry delimiter nor
    # an empty value; otherwise the C++ side could resolve a different tuple.
    text = coordinates.read_text(encoding="utf-8").replace("tcpgrip\n", "tcp|grip\n", 1)
    coordinates.write_text(text, encoding="utf-8")
    with pytest.raises(ValueError, match="delimiter"):
        load_runtime_registries(coordinates, motion)
