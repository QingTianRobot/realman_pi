# BehaviorTree.CPP-X Commercial SDK And Recharge Design

**Date:** 2026-07-10

**Decision:** Build a source-compatible, same-toolchain commercial SDK while
preserving the requested singleton, factory, and named function-reference
workflow. The project does not promise a stable ABI across compilers, C++
standard libraries, build modes, or incompatible project versions.

## 1. Outcome

The deliverable is a reusable behavior-tree SDK rather than a collection of
unconnected headers. A user must be able to:

1. install and consume `bt::core` and `bt::nodes` from another CMake project;
2. register an action or condition once through `FunctionRegistry::instance()`;
3. load `libbt_nodes` dynamically and invoke that registered function from XML;
4. receive `sensor_msgs/msg/BatteryState`, write it to the blackboard, request
   recharge once, wait without blocking for docking, and publish completion;
5. learn the whole workflow from the Sphinx function manual and reproducible
   Playwright screenshots; and
6. run one release gate that proves core, plugin, install-consumer, ROS2,
   backend, frontend, browser, and documentation behavior where the required
   environment is available.

## 2. Compatibility Boundary

`BT_RegisterNodes` remains the plugin entry point and XML registration names
remain stable. Existing node headers remain available from the source tree,
but the supported installed include form becomes `<bt_nodes/...>`.

The plugin contract is source compatible within one release and toolchain.
Passing `NodeFactory`, STL containers, and `std::function` across a DSO boundary
is not advertised as a compiler-independent ABI. A future binary plugin market
would require a separate versioned C ABI and is outside this design.

Because `FunctionAction` and `FunctionCondition` call the shared registry,
building the node-dependent examples, node tests, or ROS2 default registration
requires `bt_nodes`. A core-only build remains supported when those consumers
are disabled or conditionally omitted.

## 3. SDK Runtime Architecture

### 3.1 Function registry

`FunctionRegistry` remains a process-wide singleton. Its storage and public
methods move out of the header into `libbt_nodes`, and the class receives an
export annotation. Hosts link `bt::nodes`; the dynamically loaded plugin is the
same shared object. Both sides therefore resolve `FunctionRegistry::instance()`
to one exported implementation.

Names are returned in sorted order for deterministic diagnostics. Empty names
and empty callbacks remain errors. Existing replacement behavior remains
compatible, while explicit `unregisterAction` and `unregisterCondition` APIs
support test and application lifecycle cleanup without clearing unrelated
registrations.

### 3.2 Factory and plugin ownership

`NodeFactory::registerNodeType` first constructs the builder and manifest in
local variables. It mutates the maps only after all validation succeeds, so a
throw cannot leave a half-registered node.

`NodeFactory::loadPlugin` snapshots factory registration state. Plugin-loading
failures restore that snapshot. The native library handle is wrapped in RAII as
soon as `dlopen`/`LoadLibrary` succeeds.

Builders added by a plugin are wrapped with an aliasing `shared_ptr` owner that
holds both the node and the plugin handle. A tree can therefore outlive the
factory without leaving a node vtable pointing into an unloaded library.

### 3.3 Installation

The build exports `bt::nodes`, installs the standard-node headers below
`include/bt_nodes`, installs the shared plugin/runtime, and generates
`bt_nodesConfig.cmake`. That package config resolves `bt_core` before importing
the target. An external consumer smoke project proves `find_package(bt_nodes)`.

## 4. Complete ROS2 Recharge Feature

The existing `ReadBattery` remains the external-message adapter. The current
Cooldown-based sequence is replaced by a stateful `RechargeTask` action:

1. first tick creates ROS interfaces, publishes `start_recharge:<target>`, and
   returns `RUNNING`;
2. subsequent ticks retain state and observe `/dock/is_docked`;
3. docking returns `SUCCESS`; timeout returns `FAILURE`;
4. halt resets the state and releases the in-flight attempt; and
5. `TaskDoneNotifier` runs once after `RechargeTask` succeeds.

The demo string command remains intentionally simple. Production documentation
must state that a safety-critical robot should replace it with a typed ROS2
Action or an idempotent command/ack protocol.

Subscriber QoS exposes a documented sensor-data option. The standalone
executor either provides callable start/stop services for `autostart=false` or
does not expose an unusable launch option. Required launch runtime dependencies
are declared in `package.xml`.

The ROS smoke uses an isolated `ROS_DOMAIN_ID`, waits on observable graph/topic
conditions, captures root status, sends a single dock event after interfaces
are ready, and avoids fixed five-second choreography.

## 5. Documentation And Browser Evidence

Sphinx is the authoritative published manual. Markdown documents that remain
in the repository must agree with it and are checked for stale counts, paths,
topic names, and API routes.

The function manual contains all 25 built-in node contracts: type, ports,
defaults, state transitions, failure behavior, and a runnable XML fragment.
The ROS2 tutorial uses commands that can actually be executed, with separate
terminal blocks or background `echo --once` before `pub --once`.

Playwright uses the real manifest contract. `AlwaysSuccess` and
`AlwaysFailure` are classified as conditions. Documentation screenshots show
four distinct states: empty editor, loaded tree, tick coloring, and property/XML
editing. A duplicate-image check is part of the screenshot gate. A live-backend
browser test complements stable mocked UI tests.

## 6. Error And Safety Semantics

- Missing named functions remain tree-level `FAILURE`; registration misuse
  throws before tree execution.
- Plugin load is atomic from the caller's perspective.
- Invalid XML structure and invalid ports are rejected with node context rather
  than silently ignored.
- ROS2 waiting is represented by `RUNNING`, not terminal `FAILURE`.
- A publish call is not documented as execution acknowledgement.
- No test is skipped silently. ROS2/Jazzy absence is reported as an environment
  gap, while every non-ROS gate remains mandatory.

## 7. Verification Strategy

The acceptance ladder is:

1. a plugin-boundary regression test fails on the old header-only singleton and
   passes after the shared implementation;
2. registration rollback and tree-outlives-factory tests pass under ASan;
3. a clean install is consumed by an external CMake project;
4. mock ROS2 tests cover message input, `RUNNING`, dock success, timeout, halt,
   and one command per attempt;
5. Humble `colcon build` and isolated topic smoke pass when Humble is present;
6. Vitest, frontend production build, live/mock Playwright, and four distinct
   screenshots pass;
7. Sphinx HTML and linkcheck pass with warnings treated as errors; and
8. the unified release script exits zero and the final diff review has no
   Critical or High findings.

## 8. Commercial Release Boundary

Engineering can make the repository release-ready, but project licensing is a
legal/product-owner decision. The package currently claims Apache-2.0 without a
root license file. The implementation will add a licensing checklist and third-
party notice inventory, but it will not invent copyright ownership or select a
license on the user's behalf. A commercial-release claim remains conditional on
the owner supplying the approved root license and maintainer identity.
