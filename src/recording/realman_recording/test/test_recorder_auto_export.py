# test_recorder_auto_export.py
from realman_recording.export_queue import should_auto_export


def test_auto_export_only_for_clean_ready_sessions():
    assert should_auto_export(auto_export_on_stop=True, final_success=True) is True
    assert should_auto_export(auto_export_on_stop=True, final_success=False) is False
    assert should_auto_export(auto_export_on_stop=False, final_success=True) is False
