import type * as ThreeNS from "three";

// A small damped-least-squares inverse kinematics solver on top of the URDF the page already loads. It exists so
// the explainer's camera poses are real forward-kinematics results: every transform shown by the animation comes
// from the same URDF the robot uses, not from hand-placed shapes.

type Three = typeof ThreeNS;

export type ArmRig = {
  root: any; // urdf-loader robot, owns setJointValue
  link: any; // end link (link_6)
  joints: string[];
  lower: number[];
  upper: number[];
};

export type IkResult = { q: number[]; ok: boolean; positionError: number; rotationError: number };

const solveLinear = (matrix: number[][], rhs: number[]): number[] => {
  const n = rhs.length;
  const a = matrix.map((row, i) => [...row, rhs[i]]);
  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < n; row += 1) if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    [a[column], a[pivot]] = [a[pivot], a[column]];
    const divisor = a[column][column] || 1e-12;
    for (let row = column + 1; row < n; row += 1) {
      const factor = a[row][column] / divisor;
      for (let k = column; k <= n; k += 1) a[row][k] -= factor * a[column][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row -= 1) {
    let sum = a[row][n];
    for (let k = row + 1; k < n; k += 1) sum -= a[row][k] * x[k];
    x[row] = sum / (a[row][row] || 1e-12);
  }
  return x;
};

export function createKinematics(THREE: Three) {
  const current = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  const setPose = (rig: ArmRig, q: number[]) => {
    rig.joints.forEach((name, index) => rig.root.setJointValue(name, q[index]));
    rig.root.updateMatrixWorld(true);
  };

  /** World matrix of the end link for joint vector q. The rig is left in that pose. */
  const forward = (rig: ArmRig, q: number[], out = new THREE.Matrix4()) => {
    setPose(rig, q);
    return out.copy(rig.link.matrixWorld);
  };

  const error = (rig: ArmRig, q: number[], targetPosition: ThreeNS.Vector3, targetQuaternion: ThreeNS.Quaternion) => {
    forward(rig, q, current);
    current.decompose(position, quaternion, scale);
    const delta = targetQuaternion.clone().multiply(quaternion.clone().invert());
    if (delta.w < 0) {
      delta.x *= -1; delta.y *= -1; delta.z *= -1; delta.w *= -1;
    }
    const sine = Math.hypot(delta.x, delta.y, delta.z);
    const angle = 2 * Math.atan2(sine, delta.w);
    const factor = sine < 1e-9 ? 2 : angle / sine;
    return [
      targetPosition.x - position.x,
      targetPosition.y - position.y,
      targetPosition.z - position.z,
      delta.x * factor,
      delta.y * factor,
      delta.z * factor,
    ];
  };

  /** Solve for the end-link pose `target` (world), starting from `seed`. */
  const solve = (rig: ArmRig, target: ThreeNS.Matrix4, seed: number[], iterations = 90): IkResult => {
    const targetPosition = new THREE.Vector3();
    const targetQuaternion = new THREE.Quaternion();
    target.decompose(targetPosition, targetQuaternion, new THREE.Vector3());
    const q = [...seed];
    const lambda2 = 0.0036;
    let e = error(rig, q, targetPosition, targetQuaternion);
    for (let step = 0; step < iterations; step += 1) {
      if (Math.hypot(e[0], e[1], e[2]) < 0.0015 && Math.hypot(e[3], e[4], e[5]) < 0.01) break;
      const jacobian: number[][] = Array.from({ length: 6 }, () => new Array(6).fill(0));
      for (let column = 0; column < 6; column += 1) {
        const probe = [...q];
        probe[column] += 1e-4;
        const shifted = error(rig, probe, targetPosition, targetQuaternion);
        for (let row = 0; row < 6; row += 1) jacobian[row][column] = (e[row] - shifted[row]) / 1e-4;
      }
      const normal = jacobian.map((rowA, i) => jacobian.map((rowB, j) => rowA.reduce((sum, value, k) => sum + value * rowB[k], 0) + (i === j ? lambda2 : 0)));
      const y = solveLinear(normal, e);
      for (let column = 0; column < 6; column += 1) {
        const dq = jacobian.reduce((sum, row, k) => sum + row[column] * y[k], 0);
        q[column] = Math.min(rig.upper[column], Math.max(rig.lower[column], q[column] + Math.max(-0.35, Math.min(0.35, dq))));
      }
      e = error(rig, q, targetPosition, targetQuaternion);
    }
    const positionError = Math.hypot(e[0], e[1], e[2]);
    const rotationError = Math.hypot(e[3], e[4], e[5]);
    return { q, ok: positionError < 0.003 && rotationError < 0.02, positionError, rotationError };
  };

  return { forward, setPose, solve };
}
