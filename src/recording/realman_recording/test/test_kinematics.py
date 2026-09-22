from pathlib import Path

from realman_recording.kinematics import UrdfKinematics, ee_velocity, finite_difference


def test_urdf_fk_resolves_revolute_chain_and_returns_xyzw(tmp_path: Path):
    urdf = tmp_path / "one_joint.urdf"
    urdf.write_text('''<robot name="test"><link name="base"/><link name="tip"/>
    <joint name="joint_1" type="revolute"><parent link="base"/><child link="tip"/>
    <origin xyz="1 0 0" rpy="0 0 0"/><axis xyz="0 0 1"/></joint></robot>''')
    pose = UrdfKinematics(urdf, "base", "tip", ("joint_1",)).pose((0.0,))
    assert pose == (1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0)


def test_ee_velocity_uses_shortest_quaternion_arc():
    previous = (0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0)
    current = (1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)
    assert ee_velocity(previous, current, 1.0) == (1.0, 0.0, 0.0, 0.0, 0.0, 3.141592653589793)


def test_ee_velocity_rejects_non_unit_quaternions():
    try:
        ee_velocity((0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0), (0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0), 1.0)
    except ValueError as error:
        assert "unit quaternion" in str(error)
    else:
        raise AssertionError("non-unit quaternion was accepted")


def test_finite_difference_uses_center_and_one_sided_boundaries():
    assert finite_difference([(0, (0.0,)), (1_000_000_000, (1.0,)), (2_000_000_000, (2.0,))]) == [
        (1.0,), (1.0,), (1.0,)
    ]
