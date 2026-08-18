from array import array

from realman_web_control.action_bridge import ActionRecord, action_event, assign_fields, message_to_json


class FakeMessage:
    def __init__(self):
        self.value = 0
        self.items = []

    def get_fields_and_field_types(self):
        return {"value": "int32", "items": "int32[]"}


def test_message_conversion_and_owner_event():
    message = FakeMessage()
    assign_fields(message, {"value": 4, "items": array("d", [1, 2])})
    assert message_to_json(message) == {"value": 4, "items": [1, 2]}
    record = ActionRecord("l", "execute_motion", "client", "request")
    assert action_event(record, "accepted")["request_id"] == "request"
