"""Regression test for ik_solver.py with the heavy numerical stack replaced by stubs.

The module once shipped with unquoted string literals (``end_joint: str = joint_6``,
``solver(ipopt, ...)``), so importing it raised ``NameError`` and the driver silently fell
back to the SDK IK. CasADi / Pinocchio are not installed in the unit-test environment, so
they are stubbed: the test only proves the module imports, constructs, and solves without
undefined names, not that the optimization is numerically correct.
"""

from __future__ import annotations

import importlib
import sys
from types import ModuleType
from unittest import mock

import numpy as np
import pytest


@pytest.fixture
def ik_module():
    stubs = {
        "casadi": mock.MagicMock(name="casadi"),
        "pinocchio": mock.MagicMock(name="pinocchio"),
        "pinocchio.casadi": mock.MagicMock(name="pinocchio.casadi"),
    }
    stubs["pinocchio"].casadi = stubs["pinocchio.casadi"]
    # The solver reads the model dimension to size warm-start vectors; use the RM65's 6 joints.
    model = stubs["pinocchio"].RobotWrapper.BuildFromURDF.return_value.model
    model.nq = 6
    with mock.patch.dict(sys.modules, stubs):
        sys.modules.pop("realman_robot_driver.ik_solver", None)
        module = importlib.import_module("realman_robot_driver.ik_solver")
        yield module
    sys.modules.pop("realman_robot_driver.ik_solver", None)


def test_module_imports_and_names_the_tool_frame_and_solver_as_strings(ik_module):
    assert isinstance(ik_module, ModuleType)
    ik = ik_module.RealManIK("/opt/urdf/RM65-B.urdf")

    casadi = sys.modules["casadi"]
    # The end joint defaults to the RM65 wrist joint and the optimizer to IPOPT, both as strings.
    ik.robot.model.getJointId.assert_called_with("joint_6")
    assert casadi.Opti.return_value.solver.call_args.args[0] == "ipopt"
    assert casadi.Opti.return_value.solver.call_args.args[1]["ipopt"]["max_iter"] == 50


def test_solve_returns_joint_degrees_or_none_without_raising(ik_module, monkeypatch):
    ik = ik_module.RealManIK("/opt/urdf/RM65-B.urdf")
    ik.opti.value.return_value = np.zeros(6)
    monkeypatch.setattr(
        ik_module.pin, "SE3", mock.MagicMock(return_value=mock.MagicMock(homogeneous=np.eye(4)))
    )

    solved = ik.solve([0.3, 0.0, 0.3], [1.0, 0.0, 0.0, 0.0], seed_joint_degrees=[0.0] * 6)
    assert solved == [0.0] * 6

    ik.opti.solve_limited.side_effect = RuntimeError("infeasible")
    assert ik.solve([0.3, 0.0, 0.3], [1.0, 0.0, 0.0, 0.0]) is None
