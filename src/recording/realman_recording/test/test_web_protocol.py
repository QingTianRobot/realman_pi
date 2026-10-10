from realman_recording.web_protocol import safe_coordinate_subset


def test_coordinate_subset_keeps_bounded_numeric_fields_only():
    result = safe_coordinate_subset(
        '{"x": 1, "position": [1, 2, 3], "private": "secret", "nan": 1e309}'
    )
    assert result == {"valid": True, "x": 1.0, "position": [1.0, 2.0, 3.0]}


def test_coordinate_subset_rejects_malformed_or_non_object_payloads():
    assert safe_coordinate_subset("not-json") == {"valid": False, "error": "invalid_json"}
    assert safe_coordinate_subset("[1, 2, 3]") == {"valid": False, "error": "object_required"}
