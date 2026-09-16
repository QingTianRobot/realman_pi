# Node Authoring and Motion Safety

## MoveJ Port Contract

Declare every public input in `providedPorts()` with a type, safe default, and description. `MoveJ` accepts:

| Port | Rule |
| --- | --- |
| `arm_id` | Exactly `l`, `m`, or `r`. |
| `dry_run` | Defaults to `true`; only `false` may permit a goal. |
| `joint_degrees` | Exactly six comma-separated, finite doubles. |
| `velocity_percent` | Integer in `[1, 100]`. |
| `blend_radius_percent` | Integer in `[0, 100]`. |
| `timeout_sec` | Finite and strictly positive. |

Validate before creating an Action client or sending a goal. Do not clamp invalid input, silently use a fallback after a malformed value, or confuse blend with velocity: blend may be zero, velocity may not. Construct the goal with `MOVEJ`, `BASE`, `reference_name="base"`, `connect=false`, and the validated values.

## Failure and Async Rules

Catch malformed input, client creation, send-goal, goal-response, result-listener, and result-future failures. Call `setFailureReason()` with the original useful message before returning `FAILURE`; emit the same diagnostic detail where applicable. For a non-success Action result, prefer `wrapped.result->message`; otherwise preserve the ROS Action result code. Do not replace an unknown result response with a generic success or omit it from the monitor.

Use an Action for long-running or cancellable motion. `~/start` and `~/stop` are `std_srvs/srv/Trigger` Services for short executor control only; they must not become substitutes for a motion Action.

After `async_send_goal`, keep the client and pending response alive. A deadline while awaiting the response stays `RUNNING`; a delayed accepted goal is cancelled once cancellation submission succeeds. A halt transfers pending responses and accepted nonterminal handles to the executor-owned `MoveJCancellationDrain`, driven separately from tree ticks. This also applies when `async_get_result()` setup throws after acceptance. The drain retains pending responses until rejection and accepted handles until `async_cancel_goal()` successfully submits; retain and retry on a submission exception. It releases tracking immediately after successful submission and does not wait for cancel acknowledgement or a terminal result. Never cancel a goal with a ready terminal result. Process shutdown still stops the drain timer; robot safety after process exit depends on the driver software stop and an accessible emergency stop.

## ThreeArmMoveJ and Stage Barriers

Read `src/behavior/realman_bt/{include/realman_bt,src}/three_arm_move_j_node.*` and its focused test before changing this leaf. It has no `arm_id` port: it always targets `/l/execute_motion`, `/m/execute_motion`, and `/r/execute_motion`.

| Port | Default and constraint |
| --- | --- |
| `l_joint_degrees`, `m_joint_degrees`, `r_joint_degrees` | Each defaults to `0,0,0,0,0,0`; six finite joint angles in degrees per arm. |
| `dry_run` | `true`; no Action client or goal in this mode. |
| `velocity_percent` | `10`; integer `[1, 100]`. |
| `blend_radius_percent` | `0`; integer `[0, 100]`. |
| `timeout_sec` | `120`; finite positive seconds, including server discovery and result waiting. |

Validate all three goals before client creation. Wait for all three servers, then submit l/m/r goals asynchronously in the same tick. Success requires all three wrapped result codes to be `SUCCEEDED` and every result payload's `success` to be true. A failed arm must preserve its cause and transfer unfinished siblings to the executor drain; completed terminal goals need no cancellation.

Unlike single-arm MoveJ's pending-response timeout path above, ThreeArmMoveJ can return `FAILURE` immediately after handing pending work to the executor drain. Process exit still waits for drain completion. Do not document these two leaf timing behaviors as identical.

Reuse `config/behavior-trees/three_arm_staged_move.xml`: its stateful `Sequence` contains `all_zero` followed by `requested_pose`. Each child is one ThreeArmMoveJ leaf, so no arm starts stage two before all stage-one results succeed. Avoid three sequential MoveJ leaves for a concurrent stage; no additional generic Parallel node is registered by this executor.

When changing this behavior, exercise all-server readiness, same-tick submissions, the all-success barrier, rejection/result failure, sibling cancellation, timeout handoff, dry-run, and exact XML target values in `test_three_arm_move_j_node.cpp` and `test_tree_contract.py`.

## Dry-Run and Tests

`dry_run=true` validates the goal and records a validation-complete `result` event, but creates no Action client and sends no goal. Keep it the default.

For an authoring change, add or update focused coverage for the port bounds and malformed joints, failure reason, dry-run no-goal boundary, result message/code, timeout while response is pending, delayed acceptance cancellation, halt/drain ownership, cancellation retry, and `async_get_result()` setup failure. Keep `test_tree_contract.py` and XML tests aligned with registration and port changes. Run focused tests before ROS integration; then run `./rm65 bt-test build` and `./rm65 bt-test mock` where ROS tooling is available. Real motion requires an explicit decision after dry-run, a cleared workspace, low speed, and accessible emergency stop.

## Pressure Checklist

- Does every failed send, response, result, or exception retain the original detail, including `unknown result response, ignoring...`?
- Does `failureReason()` exist before every terminal `FAILURE` path that has a cause?
- Are malformed, non-finite, short, and long joint lists rejected before client creation?
- Are velocity `[1, 100]`, blend `[0, 100]`, and positive finite timeout each tested independently?
- Does timeout retain pending-response ownership and cancel delayed acceptance once after successful submission, without claiming to await acknowledgement or terminal completion?
- Does halt preserve ownership when the response is pending, result setup failed, or cancel submission throws?
- Does dry-run prove that no Action client or goal exists?
