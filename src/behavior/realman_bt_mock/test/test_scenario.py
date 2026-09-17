import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))
from realman_bt_mock.scenario import normalize_mode_request, recorder_entry


def test_mode_request_accepts_only_known_modes():
    assert normalize_mode_request('policy', 'policy-a') == {'mode': 'policy', 'owner_id': 'policy-a'}
    try:
        normalize_mode_request('joystick', 'device-a')
        assert False
    except ValueError as error:
        assert 'unknown control mode' in str(error)


def test_recorder_entry_has_stable_schema():
    entry = recorder_entry('web', 'browser-1', 7, 'ExecuteMotion', 3, 'accepted', '')
    assert list(entry) == ['mode', 'owner_id', 'epoch', 'action', 'sequence', 'result', 'failure_code']
    assert json.loads(json.dumps(entry))['epoch'] == 7
