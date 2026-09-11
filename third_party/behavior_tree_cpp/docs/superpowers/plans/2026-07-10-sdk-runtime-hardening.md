# SDK Runtime Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the singleton/function-node workflow work through the real dynamic plugin and ship `bt_nodes` as an installable same-toolchain SDK.

**Architecture:** `libbt_nodes` becomes both the standard-node plugin and the unique shared home of `FunctionRegistry`. `NodeFactory` makes registration atomic and keeps plugin handles alive through created nodes. A real DSO regression test and external install-consumer smoke prove the supported boundary.

**Tech Stack:** C++17, CMake 3.16+, GoogleTest, POSIX `dlopen`/Windows `LoadLibrary`, CTest.

---

### Task 1: Add The Plugin-Boundary Regression Test

**Files:**
- Create: `tests/test_plugin_runtime.cpp`
- Modify: `tests/CMakeLists.txt`

- [x] **Step 1: Write the failing DSO singleton test**

Create a GoogleTest that links `bt::nodes`, registers `dso.probe` in the host,
calls `NodeFactory::loadPlugin(BT_NODES_PLUGIN_PATH)`, loads this XML, and expects
`SUCCESS`:

```cpp
TEST(PluginRuntime, HostFunctionIsVisibleToPluginFunctionAction) {
  auto& registry = bt_nodes::FunctionRegistry::instance();
  registry.clear();
  registry.registerAction(
      "dso.probe", [](const bt_nodes::FunctionContext&) {
        return bt_core::NodeStatus::SUCCESS;
      });

  bt_core::NodeFactory factory;
  factory.loadPlugin(BT_NODES_PLUGIN_PATH);
  bt_core::XmlParser parser(factory);
  auto tree = parser.loadFromText(
      R"(<root main_tree_to_execute="Main"><BehaviorTree ID="Main"><FunctionAction function="dso.probe"/></BehaviorTree></root>)",
      bt_core::Blackboard::create());
  EXPECT_EQ(tree.tickOnce(), bt_core::NodeStatus::SUCCESS);
}
```

- [x] **Step 2: Register the test target**

Link `test_plugin_runtime` to `bt::core`, `bt::nodes`, and `GTest::gtest_main`.
Define `BT_NODES_PLUGIN_PATH="$<TARGET_FILE:bt_nodes>"` and use
`gtest_discover_tests`.

- [x] **Step 3: Run the test and verify RED**

Run:

```bash
cmake -S . -B build -DBT_BUILD_NODES=ON -DBT_BUILD_TESTS=ON
cmake --build build --target test_plugin_runtime bt_nodes
ctest --test-dir build -R PluginRuntime.HostFunctionIsVisibleToPluginFunctionAction --output-on-failure
```

Expected: `FAIL`; the host registry contains `dso.probe`, while the plugin node
returns `FAILURE` because it resolves a different singleton.

### Task 2: Move FunctionRegistry Into The Shared SDK

**Files:**
- Create: `bt_nodes/include/bt_nodes/export.hpp`
- Create: `bt_nodes/function/function_registry.cpp`
- Modify: `bt_nodes/function/function_registry.hpp`
- Modify: `bt_nodes/CMakeLists.txt`
- Modify: `examples/CMakeLists.txt`
- Modify: `tests/CMakeLists.txt`

- [x] **Step 1: Add an export macro**

Define `BT_NODES_EXPORT` as `__declspec(dllexport/dllimport)` on Windows and
`__attribute__((visibility("default")))` for GCC/Clang builds of `bt_nodes`.

- [x] **Step 2: Make registry methods out-of-line**

Keep public types and node templates in the header, but declare
`BT_NODES_EXPORT class FunctionRegistry`. Implement `instance`, registration,
lookup, invocation, sorted-name enumeration, unregister, and clear in
`function_registry.cpp`. Do not keep a header-defined singleton body.

- [x] **Step 3: Build one shared implementation**

Add `function/function_registry.cpp` to `bt_nodes`, define
`BT_NODES_BUILDING_LIBRARY`, add alias `bt::nodes`, make the repository parent
and `bt_nodes/include` public build include paths, and link `bt::core` publicly.
Update the example and registry tests to link `bt::nodes`.

- [x] **Step 4: Verify GREEN and deterministic names**

Run:

```bash
cmake --build build --target test_plugin_runtime test_data_nodes example_function_recharge
ctest --test-dir build -R 'PluginRuntime|FunctionRegistry' --output-on-failure
./build/bin/example_function_recharge
```

Expected: the plugin-boundary test passes and the example still reports both
high- and low-battery scenarios.

### Task 3: Make Factory Registration And Plugin Lifetime Atomic

**Files:**
- Modify: `bt_core/include/bt_core/node_factory.hpp`
- Modify: `bt_core/src/node_factory.cpp`
- Modify: `bt_core/src/plugin_loader.cpp`
- Modify: `tests/test_plugin_runtime.cpp`
- Create: `tests/plugins/throwing_plugin.cpp`

- [x] **Step 1: Add failing registration rollback tests**

Add a node whose `providedPorts()` throws. Assert that `registerNodeType` throws,
`isRegistered(name)` is false, and no manifest remains. Add a plugin that
registers one node and throws; assert `loadPlugin` leaves factory size and
manifests unchanged.

- [x] **Step 2: Add a failing lifetime test**

Load the standard plugin in a nested factory scope, create a tree, destroy the
factory, then tick and destroy the tree. Run under ASan; the test must not call
code from an unloaded DSO.

- [x] **Step 3: Implement transactional registration**

Build `NodeBuilder` and `NodeManifest` locally. Insert both only after the probe
and manifest construction succeed. Reject duplicate names before mutation.

- [x] **Step 4: Implement RAII loading and node-owned handles**

Wrap native handles immediately after open. Snapshot builders/manifests before
plugin registration and restore on exceptions. Wrap new plugin builders so the
returned aliasing `shared_ptr<TreeNode>` owns `{node, plugin_handle}`.

- [x] **Step 5: Verify targeted and ASan tests**

Run:

```bash
cmake -S . -B /tmp/btx-asan -DCMAKE_BUILD_TYPE=Debug \
  -DCMAKE_CXX_FLAGS='-fsanitize=address,undefined -fno-omit-frame-pointer' \
  -DCMAKE_EXE_LINKER_FLAGS='-fsanitize=address,undefined' \
  -DCMAKE_SHARED_LINKER_FLAGS='-fsanitize=address,undefined'
cmake --build /tmp/btx-asan --parallel
ctest --test-dir /tmp/btx-asan -R PluginRuntime --output-on-failure
```

Expected: rollback, lifetime, and DSO singleton tests all pass without sanitizer
diagnostics.

### Task 4: Install And Consume bt::nodes

**Files:**
- Create: `cmake/bt_nodesConfig.cmake.in`
- Modify: `bt_nodes/CMakeLists.txt`
- Create: `tests/install_consumer/CMakeLists.txt`
- Create: `tests/install_consumer/main.cpp`
- Create: `scripts/smoke_install.sh`
- Modify: `scripts/test.sh`

- [x] **Step 1: Write the external consumer before install rules**

The consumer uses:

```cmake
find_package(bt_core CONFIG REQUIRED)
find_package(bt_nodes CONFIG REQUIRED)
add_executable(bt_install_consumer main.cpp)
target_link_libraries(bt_install_consumer PRIVATE bt::core bt::nodes)
```

Its `main.cpp` includes `<bt_nodes/function/function_registry.hpp>`, registers
an action, dynamically loads the installed plugin path passed in `argv[1]`, and
expects the XML `FunctionAction` to return `SUCCESS`.

- [x] **Step 2: Run the install smoke and verify RED**

Run `./scripts/smoke_install.sh`. Expected: failure because `bt_nodes` currently
has no install/export package.

- [x] **Step 3: Add install/export rules**

Install the target, public header directories, export set, version/config files,
and CMake namespace `bt::`. `bt_nodesConfig.cmake` calls
`find_dependency(bt_core CONFIG REQUIRED)` before importing its targets.

- [x] **Step 4: Verify GREEN and add the smoke to the unified gate**

Run:

```bash
./scripts/smoke_install.sh
./scripts/test.sh
```

Expected: external configure/build/run succeeds, then the existing complete
non-ROS gate remains green.

### Task 5: Update The Public Contract

**Files:**
- Modify: `README.md`
- Modify: `docs/function_manual.rst`
- Modify: `docs/api_reference.rst`
- Modify: `docs/testing_matrix.rst`
- Modify: `PROJECT_PLAN.md`

- [ ] **Step 1: Document the supported boundary**

State that `bt::nodes` is source-compatible for the same release/toolchain, not
a compiler-independent ABI. Show installed CMake consumption and the real
host-register/plugin-invoke flow.

- [ ] **Step 2: Remove stale claims and add exact verification commands**

Update counts from actual CTest output, remove contradictory plan gaps, and add
`smoke_install.sh` plus the plugin-boundary test to the testing matrix.

- [ ] **Step 3: Build docs with warnings as errors**

Run:

```bash
./scripts/build_docs.sh
sphinx-build -W --keep-going -b linkcheck docs /tmp/btx-doc-linkcheck
```

Expected: both builders exit zero.
