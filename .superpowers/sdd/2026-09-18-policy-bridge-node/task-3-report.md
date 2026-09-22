# Task 3 Report: Action Validators and Chunk Buffer

## Commit

- Pending: `feat: add policy_bridge action validators and chunk buffer`

## Files Changed

- `src/policy_bridge/policy_bridge/inference/validators.py` (+ `__init__.py`)
  - `check(chunk, action_cfg) -> np.ndarray | None`: requires exact
    `(action_horizon, 7)` shape and all-finite values; clips into `action_clip`;
    anything malformed returns `None` (rejected wholesale, never reaches robot).
- `src/policy_bridge/policy_bridge/action/chunk_buffer.py` (+ `__init__.py`)
  - `ActionChunkBuffer(maxlen)` bounded `deque`: `extend`, `popleft`,
    `clear(reason)`, `remaining`, `last_clear_reason`. Caller slices the first
    `steps_per_inference` rows before enqueue.
- `src/policy_bridge/test/test_validators.py`, `test_chunk_buffer.py` (10 tests)

## Test Evidence

```text
python3 -m pytest test/test_validators.py test/test_chunk_buffer.py -q  # 10 passed
```

## Concerns

- None. Buffer is not internally locked; the node guards mutations with a lock.
