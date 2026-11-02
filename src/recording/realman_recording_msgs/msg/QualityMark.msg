# One live deviation mark from the :8765 operator, published by realman_web_control on
# /recording/quality_mark. Annotation data only: it never starts or stops a recording.
uint8 DEVIATE_START=0
uint8 RECOVER=1
# Set the reason of the deviation that has not recovered yet.
uint8 REASON=2

uint8 kind
# SYSTEM_TIME when web_control received the operator's key press.
builtin_interfaces/Time stamp
# An id from config/recording/quality_reasons.yaml, or empty.
string reason
