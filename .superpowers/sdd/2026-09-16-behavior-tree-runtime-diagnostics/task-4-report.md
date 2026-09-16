# Task 4 Report: Tick Outcomes and Diagnostics Monitor

## Commit

- `feat: visualize tick outcomes and diagnostics`

## Files Changed

- `third_party/behavior_tree_cpp/bt_editor/src/App.tsx`
  - Passes the optional schema-v2 tick statistics and diagnostic events from
    each read-only runtime snapshot to the runtime details sidebar.
- `third_party/behavior_tree_cpp/bt_editor/src/components/RuntimeDetails.tsx`
  - Displays cumulative SUCCESS and FAILURE outcome bars, numeric totals, and
    total ticks.
  - Sorts diagnostic events newest-first; renders every validated source,
    including `EXECUTOR`, with source, severity, interface, phase, timestamp,
    and verbatim detail. ERROR records use `role="alert"`.
  - Leaves the selected-node failure reason behavior unchanged.
- `third_party/behavior_tree_cpp/bt_editor/src/index.css`
  - Adds light operator-monitor styling for outcome bars, diagnostic sources,
    error emphasis, overflow-safe detail text, and narrow-view responsiveness.
- `third_party/behavior_tree_cpp/bt_editor/src/RuntimeMonitor.test.tsx`
  - Covers cumulative bar widths/totals, newest-first diagnostics across all
    sources, ERROR alert semantics, the exact ROS result-response detail, and
    the retained selected failure reason.

## Test Evidence

### RED

```text
npm test -- --run src/RuntimeMonitor.test.tsx
# 3 failures before implementation: Tick statistics and diagnostics panels
# were absent, so their aria-labelled sections could not be found.
```

### GREEN

```text
npm test -- --run src/RuntimeMonitor.test.tsx
# 11 tests passed

npm test
# 6 test files and 38 tests passed

npm run build
# tsc --noEmit and Vite production build passed

git diff --check
# exit 0
```

## Concerns

- The diagnostics documentation update belongs to the planned Task 6 manual
  work; this scoped frontend task does not change the Web manual.
- No ROS process, Action request, executor service call, or robot motion was
  started during frontend verification.
