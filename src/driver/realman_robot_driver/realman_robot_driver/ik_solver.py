"""CasADi + IPOPT inverse kinematics for the RealMan RM65.

Adapted from PikaAnyArm's forward_inverse_kinematics.Arm_IK: load the RM65
URDF with Pinocchio, model the pose error symbolically with CasADi, and solve
with IPOPT. A warm-start from the seed (the current joints) plus a small
regularizer toward that seed keeps successive solutions continuous, so intense
teleoperation does not jump between IK branches (the failure mode of the vendor
SDK IK).

The public interface follows the SDK FK/IK convention used by the pose session
and ``get_current_pose``: joints in degrees, positions in metres and
orientations as wxyz quaternions in the arm base frame. Pinocchio works in
radians, so the conversion happens only at this boundary.
"""

from __future__ import annotations

from typing import Sequence

import casadi
import numpy as np
import pinocchio as pin
import pinocchio.casadi as cpin

_EE_FRAME = "ee"
# Orientation is compared as ||R - R_target||_F^2 (about 2 * angle^2), which is
# smooth at zero error; log6 is not, and fails exactly when the target is the
# current TCP. The weight makes 1 rad of orientation cost about 14 cm of position.
_ORIENTATION_WEIGHT = 0.01
# Only breaks ties (wrist singularity, redundant branches) toward the seed; it
# is small enough not to bias reachable solutions measurably.
_SEED_WEIGHT = 1e-6
# Solutions farther than this from the target are reported as failures, so the
# pose session holds the previous joint target like it does for SDK IK errors.
_MAX_POSITION_ERROR_M = 0.002
_MAX_ORIENTATION_ERROR_DEG = 1.0
# A solution that moves any joint farther than this (in degrees) from the seed,
# or from the last accepted solution when unseeded, is a branch flip or a
# singularity, so it is reported as a failure and the session holds.
_MAX_JUMP_DEG = 30.0


def _quaternion(quaternion_wxyz: Sequence[float]) -> pin.Quaternion:
    """Convert a wxyz sequence to a normalized Pinocchio quaternion."""
    w, x, y, z = (float(value) for value in quaternion_wxyz)
    # Pinocchio's four-scalar constructor takes w first (coeffs() are xyzw).
    quaternion = pin.Quaternion(w, x, y, z)
    quaternion.normalize()
    return quaternion


class RealManIK:
    """Warm-started, joint-limit-aware inverse kinematics for one RM65 arm.

    The TCP is ``end_joint`` (the RealMan flange in the RM65 URDFs) followed by
    the tool pose. The tool pose has no default on purpose: it must be the
    controller's active tool frame (``tcpgrip`` in
    ``config/ros/realman_coordinates.yaml``), because the SDK FK behind
    ``get_current_pose`` applies that frame and both must name the same point.
    """

    def __init__(
        self,
        urdf_path: str,
        *,
        tool_position: Sequence[float],
        tool_quaternion_wxyz: Sequence[float],
        end_joint: str = "joint_6",
    ) -> None:
        self.tool_position = tuple(float(value) for value in tool_position)
        self.tool_quaternion_wxyz = tuple(float(value) for value in tool_quaternion_wxyz)
        if len(self.tool_position) != 3 or len(self.tool_quaternion_wxyz) != 4:
            raise ValueError("tool pose must be xyz metres and a wxyz quaternion")
        # Kinematics only: loading the URDF meshes would need package:// lookups
        # that IK never uses.
        self.model = pin.buildModelFromUrdf(urdf_path)

        # Add the tool frame (TCP) relative to the last joint.
        self.model.addFrame(
            pin.Frame(
                _EE_FRAME,
                self.model.getJointId(end_joint),
                pin.SE3(
                    _quaternion(self.tool_quaternion_wxyz).matrix(),
                    np.array(self.tool_position, dtype=float),
                ),
                pin.FrameType.OP_FRAME,
            )
        )
        # Data must be created after the tool frame so FK can place it.
        self._data = self.model.createData()
        self._ee_id = self.model.getFrameId(_EE_FRAME)

        # Symbolic model + forward kinematics.
        self.cmodel = cpin.Model(self.model)
        self.cdata = self.cmodel.createData()
        self.cq = casadi.SX.sym("q", self.model.nq, 1)
        cpin.framesForwardKinematics(self.cmodel, self.cdata, self.cq)
        tcp = self.cdata.oMf[self._ee_id]
        self._tcp = casadi.Function("tcp", [self.cq], [tcp.translation, tcp.rotation])

        # Optimization: position error + weighted orientation error, plus a tiny
        # regularizer toward the seed that only matters near singularities.
        self.opti = casadi.Opti()
        self.var_q = self.opti.variable(self.model.nq)
        self.param_position = self.opti.parameter(3)
        self.param_rotation = self.opti.parameter(3, 3)
        self.param_seed = self.opti.parameter(self.model.nq)
        position, rotation = self._tcp(self.var_q)
        self.opti.minimize(
            casadi.sumsqr(position - self.param_position)
            + _ORIENTATION_WEIGHT * casadi.sumsqr(rotation - self.param_rotation)
            + _SEED_WEIGHT * casadi.sumsqr(self.var_q - self.param_seed)
        )
        self.opti.subject_to(
            self.opti.bounded(
                self.model.lowerPositionLimit,
                self.var_q,
                self.model.upperPositionLimit,
            )
        )
        # The seed is the current joints, already close to the optimum, so a small
        # initial barrier parameter roughly halves the solve time.
        self.opti.solver(
            "ipopt",
            {
                "ipopt": {
                    "print_level": 0,
                    "sb": "yes",
                    "max_iter": 50,
                    "tol": 1e-8,
                    "mu_init": 1e-6,
                    "warm_start_init_point": "yes",
                },
                "print_time": False,
            },
        )

        # Warm start and last accepted solution, both in radians (Pinocchio).
        self._init_data = np.zeros(self.model.nq)
        self._last_solution: np.ndarray | None = None

    def forward_kinematics(
        self, joint_degrees: Sequence[float]
    ) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
        """Return the TCP position (m) and wxyz quaternion for joint degrees."""
        placement = self._placement(joint_degrees)
        quaternion = pin.Quaternion(placement.rotation)
        quaternion.normalize()
        position = tuple(float(value) for value in placement.translation)
        return position, (  # type: ignore[return-value]
            float(quaternion.w),
            float(quaternion.x),
            float(quaternion.y),
            float(quaternion.z),
        )

    def solve(
        self,
        position: Sequence[float],
        quaternion_wxyz: Sequence[float],
        seed_joint_degrees: Sequence[float] | None = None,
    ) -> list[float] | None:
        """Return joint degrees for the target tool pose, or None on failure."""
        nq = self.model.nq
        reference = self._last_solution
        if seed_joint_degrees is not None:
            seed = np.radians(np.asarray(seed_joint_degrees, dtype=float))
            if seed.shape == (nq,) and np.all(np.isfinite(seed)):
                self._init_data = seed
                reference = seed
        target = pin.SE3(
            _quaternion(quaternion_wxyz).matrix(), np.asarray(position, dtype=float)
        )
        self.opti.set_initial(self.var_q, self._init_data)
        self.opti.set_value(self.param_seed, self._init_data)
        self.opti.set_value(self.param_position, target.translation)
        self.opti.set_value(self.param_rotation, target.rotation)
        try:
            self.opti.solve_limited()
            sol_q = np.asarray(self.opti.value(self.var_q), dtype=float).flatten()
        except Exception:
            return None
        if sol_q.shape != (nq,) or not np.all(np.isfinite(sol_q)):
            return None
        sol_degrees = np.degrees(sol_q)
        if not self._reaches(sol_degrees, target):
            # Unreachable target or stalled solve: hold instead of approximating.
            return None
        if reference is not None:
            jump = float(np.max(np.abs(sol_degrees - np.degrees(reference))))
            if jump > _MAX_JUMP_DEG:
                # Hold rather than swing the arm to another branch; keep the warm start.
                return None
        self._last_solution = sol_q
        self._init_data = sol_q
        return [float(value) for value in sol_degrees]

    def _placement(self, joint_degrees: Sequence[float]) -> pin.SE3:
        q = np.radians(np.asarray(joint_degrees, dtype=float))
        if q.shape != (self.model.nq,):
            raise ValueError(f"expected {self.model.nq} joint values")
        pin.framesForwardKinematics(self.model, self._data, q)
        return self._data.oMf[self._ee_id]

    def _reaches(self, joint_degrees: np.ndarray, target: pin.SE3) -> bool:
        placement = self._placement(joint_degrees)
        position_error = float(np.linalg.norm(placement.translation - target.translation))
        rotation_error = float(np.linalg.norm(pin.log3(placement.rotation.T @ target.rotation)))
        return (
            position_error <= _MAX_POSITION_ERROR_M
            and np.degrees(rotation_error) <= _MAX_ORIENTATION_ERROR_DEG
        )
