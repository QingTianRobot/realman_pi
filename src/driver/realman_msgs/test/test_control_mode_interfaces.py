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


def test_input_mode_interfaces_are_exact():
    assert sections(ROOT / "msg/InputModeState.msg") == [[
        "uint8 ACTIVE=0", "uint8 SWITCHING=1", "uint8 FAILED=2",
        "string requested_mode", "string selected_mode", "string active_mode",
        "uint8 phase", "uint64 request_id", "uint64 epoch", "string detail",
    ]]
    assert sections(ROOT / "srv/ListInputModes.srv") == [[], [
        "bool success", "string message", "string[] mode_ids",
        "string[] labels", "bool[] selectable",
    ]]
    assert sections(ROOT / "srv/SelectInputMode.srv") == [
        ["string mode_id", "string requester_id"],
        ["bool accepted", "uint64 request_id", "string message"],
    ]
