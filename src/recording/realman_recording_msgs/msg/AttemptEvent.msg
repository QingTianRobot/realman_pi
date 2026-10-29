# One policy attempt's lifecycle, published by realman_bt PolicyRun on /recording/attempt.
# The recorder opens a session on START and closes it on RESULT (auto_record_* parameters).
uint8 START=0
uint8 RESULT=1

uint8 kind
# Publisher SYSTEM_TIME.
builtin_interfaces/Time stamp
# The attempt's policy trace CSV name without .csv: policy_attempt_<UTC>_<arm>[_n].
string attempt_id
# policy_task.tasks entry, the arm it drives and the prompt the bridge was switched to.
string task
string arm
string prompt
# START only: the longest the attempt can last from START (activation + run + stop). The
# recorder adds a margin and stops the session itself if no RESULT arrives by then.
uint32 max_duration_sec
# RESULT only: PolicyRun's outcome name (lifted_held, dropped, timeout, ...) or "halted".
string outcome
bool succeeded
# RESULT only: the human-readable reason PolicyRun reported (empty on success).
string reason
