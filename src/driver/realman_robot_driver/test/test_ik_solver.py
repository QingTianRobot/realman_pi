"""Tests for the custom CasADi IK.

The static checks always run. The solver checks need ``casadi`` and
``pinocchio.casadi``, which the production image does not ship, so they skip
there and run wherever both are installed.
"""

import ast
import builtins
import math
from pathlib import Path

import pytest

from realman_robot_driver.coordinate_manager import CoordinateManager
from realman_robot_driver.pose_math import euler_to_quaternion, quaternion_to_euler

PACKAGE_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = PACKAGE_DIR.parents[2]
IK_SOURCE = PACKAGE_DIR / "realman_robot_driver" / "ik_solver.py"
URDF_PATH = REPO_ROOT / "src" / "rm65_description" / "urdf" / "RM65-B.urdf"
COORDINATES_PATH = REPO_ROOT / "config" / "ros" / "realman_coordinates.yaml"

# RM65-B DH: d1 + a2 + d4 + d6 puts the flange 0.8505 m above the base at zero
# joints, yawed by pi ([0, 0, 0.8505, 0, 0, pi] in SDK m/rad Euler form). These
# are the published DH values, not a recorded SDK sample; on the robot the pose
# session compares the custom FK with the real SDK FK before using this IK.
RM65_B_FLANGE_HEIGHT_M = 0.2405 + 0.256 + 0.210 + 0.144


def _defined_names(tree):
    names = set(dir(builtins))
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            names.add(node.name)
        elif isinstance(node, ast.arg):
            names.add(node.arg)
        elif isinstance(node, ast.alias):
            names.add((node.asname or node.name).split(".")[0])
        elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
            names.add(node.id)
    return names


def test_ik_solver_source_has_no_undefined_names():
    # Regression: string literals such as "ee", "ipopt" and "joint_6" once lost
    # their quotes, which only an import with casadi installed would reveal.
    tree = ast.parse(IK_SOURCE.read_text(encoding="utf-8"))
    defined = _defined_names(tree)
    undefined = sorted(
        {
            node.id
            for node in ast.walk(tree)
            if isinstance(node, ast.Name)
            and isinstance(node.ctx, ast.Load)
            and node.id not in defined
        }
    )
    assert undefined == []


def test_ik_solver_requires_the_configured_tool_pose():
    tree = ast.parse(IK_SOURCE.read_text(encoding="utf-8"))
    init = next(
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.FunctionDef) and node.name == "__init__"
    )
    required = {
        argument.arg
        for argument, default in zip(init.args.kwonlyargs, init.args.kw_defaults)
        if default is None
    }
    assert {"tool_position", "tool_quaternion_wxyz"} <= required


def _tcpgrip(arm="l"):
    profile = CoordinateManager.from_yaml(str(COORDINATES_PATH)).profiles[arm]
    return profile.tools[profile.tool_default]


def _angle_deg(first, second):
    dot = abs(sum(a * b for a, b in zip(first, second)))
    return math.degrees(2.0 * math.acos(min(1.0, dot)))


@pytest.fixture(scope="module")
def ik_module():
    pytest.importorskip("casadi")
    pytest.importorskip("pinocchio.casadi")
    from realman_robot_driver import ik_solver

    return ik_solver


@pytest.fixture
def ik(ik_module):
    tool = _tcpgrip()
    return ik_module.RealManIK(
        str(URDF_PATH),
        tool_position=tool.xyz_m,
        tool_quaternion_wxyz=tool.quaternion_wxyz,
    )


def test_tool_frame_comes_from_the_coordinates_yaml(ik):
    tool = _tcpgrip()
    assert tool.controller_name == "tcpgrip"
    assert ik.tool_position == pytest.approx(tool.xyz_m)
    assert ik.tool_quaternion_wxyz == pytest.approx(tool.quaternion_wxyz)


def test_forward_kinematics_matches_the_sdk_zero_pose(ik):
    position, quaternion = ik.forward_kinematics([0.0] * 6)
    tool_z = _tcpgrip().xyz_m[2]

    assert position == pytest.approx((0.0, 0.0, RM65_B_FLANGE_HEIGHT_M + tool_z), abs=1e-5)
    # Euler [0, 0, pi] is a 180 degree yaw.
    assert _angle_deg(quaternion, euler_to_quaternion(0.0, 0.0, math.pi)) < 0.01


@pytest.mark.parametrize(
    "joints",
    [
        [0.0, 30.0, 60.0, 0.0, 60.0, 0.0],
        [10.0, 20.0, 30.0, 40.0, 50.0, 60.0],
        [-45.0, 40.0, 70.0, -30.0, 60.0, 90.0],
        [90.0, -20.0, 100.0, 10.0, -50.0, -120.0],
        [37.7, -17.8, -58.4, 44.3, 4.1, -38.0],
    ],
)
def test_ik_round_trips_sdk_style_poses_in_degrees(ik, joints):
    position, quaternion = ik.forward_kinematics(joints)
    # Pass the target through the SDK's m/rad Euler form, as get_current_pose does.
    sdk_pose = [*position, *quaternion_to_euler(quaternion)]
    target_quaternion = euler_to_quaternion(*sdk_pose[3:])
    seed = [value + offset for value, offset in zip(joints, (5, -5, 4, -4, 3, -3))]

    solution = ik.solve(sdk_pose[:3], target_quaternion, seed_joint_degrees=seed)

    assert solution is not None
    # Degrees in, degrees out: a radian result would sit far from these joints.
    assert max(abs(a - b) for a, b in zip(solution, joints)) < 10.0
    solved_position, solved_quaternion = ik.forward_kinematics(solution)
    assert math.dist(solved_position, sdk_pose[:3]) < 5e-4
    assert _angle_deg(solved_quaternion, target_quaternion) < 0.1


def test_holding_the_current_tcp_keeps_the_current_joints(ik):
    # Pika Mixed opens a session with the current TCP as its first target.
    current = [12.0, -25.0, 80.0, 15.0, 45.0, -30.0]
    position, quaternion = ik.forward_kinematics(current)

    solution = ik.solve(position, quaternion, seed_joint_degrees=current)

    assert solution == pytest.approx(current, abs=0.5)


def test_unreachable_target_returns_none(ik):
    assert ik.solve((2.0, 0.0, 0.5), (1.0, 0.0, 0.0, 0.0), [0.0] * 6) is None


def test_jump_over_30_degrees_from_the_seed_holds(ik):
    current = [0.0, 10.0, 70.0, 0.0, 40.0, 0.0]
    # Joint 1 would swing 45 degrees: hold instead of sending the solution.
    position, quaternion = ik.forward_kinematics([45.0, 10.0, 70.0, 0.0, 40.0, 0.0])
    assert ik.solve(position, quaternion, seed_joint_degrees=current) is None

    # 25 degrees is within the limit, so the solution is returned.
    near = [25.0, 10.0, 70.0, 0.0, 40.0, 0.0]
    position, quaternion = ik.forward_kinematics(near)
    assert ik.solve(position, quaternion, seed_joint_degrees=current) == pytest.approx(near, abs=0.5)


def test_unseeded_jump_is_measured_from_the_last_solution(ik):
    first = [20.0, 10.0, 70.0, 0.0, 40.0, 0.0]
    position, quaternion = ik.forward_kinematics(first)
    accepted = ik.solve(position, quaternion, seed_joint_degrees=first)
    assert accepted == pytest.approx(first, abs=0.5)

    position, quaternion = ik.forward_kinematics([60.0, 10.0, 70.0, 0.0, 40.0, 0.0])
    assert ik.solve(position, quaternion) is None
    # A held jump keeps the warm start at the last accepted solution.
    assert ik._init_data == pytest.approx([math.radians(value) for value in accepted])

    step = [25.0, 12.0, 70.0, 0.0, 40.0, 0.0]
    position, quaternion = ik.forward_kinematics(step)
    assert ik.solve(position, quaternion) == pytest.approx(step, abs=0.5)
