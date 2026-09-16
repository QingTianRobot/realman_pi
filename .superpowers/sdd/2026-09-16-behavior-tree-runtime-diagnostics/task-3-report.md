# Task 3 Report: Extended Runtime DTO Validation

## Commit

- Pending: `feat: extend runtime monitor diagnostics types`

## Files Changed

- `third_party/behavior_tree_cpp/bt_editor/src/types.ts`
  - Added schema-v2 `TickStats` and `RuntimeEvent` DTOs.
  - Added optional `RuntimeSnapshot.tick_stats` and `RuntimeSnapshot.events`.
- `third_party/behavior_tree_cpp/bt_editor/src/api/client.ts`
  - Validates optional diagnostic fields when present, including finite numeric
    counters/timestamps and the stable severity/source enum strings.
  - Retains legacy snapshots that omit diagnostics and leaves the ETag/304
    response branch unchanged.
- `third_party/behavior_tree_cpp/bt_editor/src/api/client.test.ts`
  - Covers a complete v2 diagnostic payload, invalid statistics, invalid event
    severity/source, and a legacy snapshot.

## Test Evidence

### RED

```text
npm test -- --run src/api/client.test.ts
# 3 failures: non-numeric tick statistics, unknown event severity, and
# unknown event source were accepted instead of rejected.
```

### GREEN

```text
npm test -- --run src/api/client.test.ts
# 10 tests passed

npm test
# 6 test files and 31 tests passed

npm run build
# tsc --noEmit and Vite production build passed

git diff --check
# exit 0
```

## Concerns

- Documentation for the user-facing schema-v2 diagnostics belongs to the
  planned Task 6 manual update. This scoped task did not modify documentation.
- No ROS process, Action request, or robot motion was started.

## Fix Round 1: Executor Source and Integer Boundaries

### Changes

- Added `EXECUTOR` to the runtime-event source union and client validator so
  exception diagnostics emitted by `realman_bt_executor` are accepted.
- Tightened tick counters and event timestamps to non-negative safe integers,
  matching the C++ `uint64_t` JSON contract.
- Added valid `EXECUTOR` coverage and rejection coverage for negative and
  fractional counters/timestamps; `UNKNOWN` remains rejected.

### Test Evidence

```text
RED: npm test -- --run src/api/client.test.ts
# Before the source fix: valid EXECUTOR rejected; negative/fractional counters
# accepted. After admitting EXECUTOR: the four negative/fractional cases failed
# independently as intended.

GREEN: npm test -- --run src/api/client.test.ts
# 14 tests passed

npm test
# 6 test files and 35 tests passed

npm run build
# tsc --noEmit and Vite production build passed

git diff --check
# exit 0
```
