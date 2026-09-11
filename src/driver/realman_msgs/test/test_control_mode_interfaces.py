from pathlib import Path

ROOT = Path(__file__).parents[1]


def sections(path):
    out = [[]]
    for raw in path.read_text().splitlines():
        line = raw.split('#', 1)[0].strip()
        if not line:
            continue
        if line == '---':
            out.append([])
        else:
            out[-1].append(line)
    return out


def test_control_mode_interfaces_are_exact():
    assert sections(ROOT / 'msg/ControlMode.msg') == [[
        'uint8 NONE=0', 'uint8 WEB=1', 'uint8 POLICY=2', 'uint8 TELEOP=3',
        'uint8 mode', 'string owner_id', 'uint64 epoch', 'builtin_interfaces/Time stamp',
    ]]
    assert sections(ROOT / 'msg/ControlModeRequest.msg') == [[
        'uint8 requested_mode', 'string owner_id', 'string reason',
        'uint32 lease_timeout_ms', 'uint64 request_id',
    ]]
    assert sections(ROOT / 'msg/ControlModeState.msg') == [[
        'uint8 IDLE=0', 'uint8 REQUESTED=1', 'uint8 STOPPING_CURRENT=2',
        'uint8 CANCELING_MOTION=3', 'uint8 VERIFYING_SAFE=4',
        'uint8 ACTIVATING_BACKEND=5', 'uint8 CONFIRMING_LEASE=6',
        'uint8 ACTIVE=7', 'uint8 FAILED=8', 'uint8 current_mode',
        'uint8 requested_mode', 'uint8 phase', 'string owner_id', 'uint64 epoch',
        'uint32 lease_remaining_ms', 'bool healthy', 'string failure_code', 'string detail',
    ]]
    assert sections(ROOT / 'action/SwitchControlMode.action') == [
        ['uint8 requested_mode', 'string owner_id', 'string reason', 'uint32 timeout_ms', 'uint32 lease_timeout_ms'],
        ['bool success', 'uint8 terminal_state', 'uint64 epoch', 'string message'],
        ['uint8 phase', 'uint8 current_mode', 'uint8 requested_mode', 'uint64 epoch', 'float32 progress', 'string detail'],
    ]
    assert sections(ROOT / 'srv/RequestControlMode.srv') == [
        ['uint8 requested_mode', 'string owner_id', 'string reason', 'uint32 lease_timeout_ms'],
        ['bool accepted', 'uint64 request_id', 'string message'],
    ]
