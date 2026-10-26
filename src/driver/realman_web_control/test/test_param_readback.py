from types import SimpleNamespace

from realman_web_control.param_readback import ParameterReadback, parameter_value


class FakeFuture:
    def __init__(self, response=None, error=None, complete=True):
        self.response, self.error, self.complete, self.callbacks = response, error, complete, []

    def add_done_callback(self, callback):
        if self.complete:
            callback(self)
        else:
            self.callbacks.append(callback)

    def done(self):
        return self.complete

    def result(self):
        if self.error:
            raise self.error
        return self.response


class FakeClient:
    def __init__(self, ready=True, future=None):
        self.ready, self.future, self.requests, self.removed = ready, future, [], []

    def service_is_ready(self):
        return self.ready

    def call_async(self, request):
        self.requests.append(list(request.names))
        return self.future

    def remove_pending_request(self, future):
        self.removed.append(future)


def value(kind, **fields):
    defaults = dict(bool_value=False, integer_value=0, double_value=0.0,
                    bool_array_value=[], integer_array_value=[], double_array_value=[])
    return SimpleNamespace(type=kind, **(defaults | fields))


def request():
    return SimpleNamespace(names=[])


def test_parameter_values_convert_by_type():
    assert parameter_value(value(1, bool_value=True)) is True
    assert parameter_value(value(2, integer_value=7)) == 7
    assert parameter_value(value(3, double_value=0.5)) == 0.5
    assert parameter_value(value(7, integer_array_value=[1, 2])) == [1, 2]
    assert parameter_value(value(8, double_array_value=[1.5])) == [1.5]
    assert parameter_value(value(6, bool_array_value=[True])) == [True]
    assert parameter_value(value(0)) is None
    assert parameter_value(value(4)) is None  # strings are not tunable


def test_read_returns_values_per_node_and_unavailable_nodes():
    response = SimpleNamespace(values=[value(3, double_value=0.1), value(8, double_array_value=[1.0, 2.0])])
    ready = FakeClient(future=FakeFuture(response))
    reader = ParameterReadback({"/a": ready, "/b": FakeClient(ready=False)}, request, 0.2)
    result = reader.read({"/a": ["x", "y"], "/b": ["z"], "/c": ["w"]})
    assert result["/a"] == {"available": True, "values": {"x": 0.1, "y": [1.0, 2.0]}}
    assert result["/b"] == {"available": False, "values": {}}
    assert result["/c"] == {"available": False, "values": {}}
    assert ready.requests == [["x", "y"]]


def test_timeouts_and_failed_calls_read_as_unavailable():
    slow = FakeClient(future=FakeFuture(complete=False))
    broken = FakeClient(future=FakeFuture(error=RuntimeError("gone")))
    reader = ParameterReadback({"/slow": slow, "/broken": broken}, request, 0.05)
    result = reader.read({"/slow": ["x"], "/broken": ["y"]})
    assert result == {"/slow": {"available": False, "values": {}}, "/broken": {"available": False, "values": {}}}
    assert slow.removed == [slow.future]
