"""CasADi + IPOPT inverse kinematics for the RealMan RM65.

Adapted from PikaAnyArm's forward_inverse_kinematics.Arm_IK: load the RM65
URDF with Pinocchio, model the pose error symbolically with CasADi, and solve
with IPOPT. A warm-start from the previous solution plus a joint-magnitude
regularizer keeps successive solutions continuous, so intense teleoperation
does not jump between IK branches (the failure mode of the vendor SDK IK).
"""

from __future__ import annotations

import os
from typing import Sequence

import casadi
import numpy as np
import pinocchio as pin
import pinocchio.casadi as cpin


def _quaternion_xyzw(quaternion_wxyz: Sequence[float]) -> pin.Quaternion:
    """Convert a wxyz quaternion to a Pinocchio xyzw quaternion."""
    w, x, y, z = quaternion_wxyz
    return pin.Quaternion(x, y, z, w)


class RealManIK:
    """Warm-started, joint-limit-aware inverse kinematics for one RM65 arm."""

    def __init__(
        self,
        urdf_path: str,
        tool_position: Sequence[float] = (0.0, 0.0, 0.120),
        tool_quaternion_wxyz: Sequence[float] = (1.0, 0.0, 0.0, 0.0),
        end_joint: str = "joint_6",
    ) -> None:
        np.set_printoptions(precision=5, suppress=True, linewidth=200)
        package_dir = os.path.dirname(os.path.dirname(urdf_path))
        self.robot = pin.RobotWrapper.BuildFromURDF(urdf_path, package_dirs=package_dir)

        # Add the tool frame (TCP) relative to the last joint.
        quat = _quaternion_xyzw(tool_quaternion_wxyz)
        self.robot.model.addFrame(
            pin.Frame(
                "ee",
                self.robot.model.getJointId(end_joint),
                pin.SE3(quat, np.array(tool_position, dtype=float)),
                pin.FrameType.OP_FRAME,
            )
        )

        # Symbolic model + forward kinematics.
        self.cmodel = cpin.Model(self.robot.model)
        self.cdata = self.cmodel.createData()
        self.cq = casadi.SX.sym("q", self.robot.model.nq, 1)
        self.cTf = casadi.SX.sym("tf", 4, 4)
        cpin.framesForwardKinematics(self.cmodel, self.cdata, self.cq)

        ee_id = self.robot.model.getFrameId("ee")
        self._error = casadi.Function(
            "error",
            [self.cq, self.cTf],
            [
                casadi.vertcat(
                    cpin.log6(self.cdata.oMf[ee_id].inverse() * cpin.SE3(self.cTf)).vector
                )
            ],
        )

        # Optimization: position error + 0.1 * orientation error, plus a small
        # joint-magnitude regularizer that keeps the solution near the home pose.
        self.opti = casadi.Opti()
        self.var_q = self.opti.variable(self.robot.model.nq)
        self.param_tf = self.opti.parameter(4, 4)
        error_vec = self._error(self.var_q, self.param_tf)
        pos_error = error_vec[:3]
        ori_error = error_vec[3:]
        totalcost = casadi.sumsqr(pos_error) + casadi.sumsqr(0.1 * ori_error)
        regularization = casadi.sumsqr(self.var_q)
        self.opti.subject_to(
            self.opti.bounded(
                self.robot.model.lowerPositionLimit,
                self.var_q,
                self.robot.model.upperPositionLimit,
            )
        )
        self.opti.minimize(20.0 * totalcost + 0.01 * regularization)
        self.opti.solver(
            "ipopt",
            {
                "ipopt": {"print_level": 0, "max_iter": 50, "tol": 1e-4},
                "print_time": False,
            },
        )

        self._init_data = np.zeros(self.robot.model.nq)
        self._history = np.zeros(self.robot.model.nq)

    def solve(
        self,
        position: Sequence[float],
        quaternion_wxyz: Sequence[float],
        seed_joint_degrees: Sequence[float] | None = None,
    ) -> list[float] | None:
        """Return joint degrees for the target tool pose, or None on failure."""
        if seed_joint_degrees is not None:
            seed = np.asarray(seed_joint_degrees, dtype=float)
            if seed.shape == (self.robot.model.nq,):
                self._init_data = seed
        target = pin.SE3(
            _quaternion_xyzw(quaternion_wxyz), np.asarray(position, dtype=float)
        ).homogeneous
        self.opti.set_initial(self.var_q, self._init_data)
        self.opti.set_value(self.param_tf, target)
        try:
            self.opti.solve_limited()
            sol_q = np.asarray(self.opti.value(self.var_q)).flatten()
        except Exception:
            return None
        if sol_q.shape != (self.robot.model.nq,):
            return None
        max_diff = float(np.max(np.abs(self._history - sol_q)))
        self._history = sol_q
        self._init_data = sol_q
        if max_diff > 30.0 / 180.0 * np.pi:
            # A sudden jump likely means a bad warm-start; reset toward home.
            self._init_data = np.zeros(self.robot.model.nq)
        return [float(value) for value in sol_q]
