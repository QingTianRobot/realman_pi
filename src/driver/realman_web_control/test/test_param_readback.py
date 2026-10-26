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


class FakeGetClient:
    """GetParameters like rclcpp/rclpy: any undeclared name drops the whole answer (empty values)."""

    def __init__(self, declared=None, ready=True, future=None):
        self.declared, self.ready, self.future = declared or {}, ready, future
        self.requests, self.removed = [], []

    def service_is_ready(self):
        return self.ready

    def call_async(self, request):
        self.requests.append(list(request.names))
        if self.future is not None:
            return self.future
        if any(name not in self.declared for name in request.names):
            return FakeFuture(SimpleNamespace(values=[]))
        return FakeFuture(SimpleNamespace(values=[self.declared[name] for name in request.names]))

    def remove_pending_request(self, future):
        self.removed.append(future)


class FakeListClient:
    def __init__(self, get_client, ready=True):
        self.get_client, self.ready, self.calls = get_client, ready, 0

    def service_is_ready(self):
        return self.ready

    def call_async(self, request):
        assert request.prefixes == [] and request.depth == 0
        self.calls += 1
        return FakeFuture(SimpleNamespace(result=SimpleNamespace(names=sorted(self.get_client.declared))))


def value(kind, **fields):
    defaults = dict(bool_value=False, integer_value=0, double_value=0.0,
                    bool_array_value=[], integer_array_value=[], double_array_value=[])
    return SimpleNamespace(type=kind, **(defaults | fields))


def get_request():
    return SimpleNamespace(names=[])


def list_request():
    return SimpleNamespace(prefixes=None, depth=None)


def reader_for(get_clients, list_clients=None, timeout=0.2):
    return ParameterReadback(get_clients, get_request, list_clients or {}, list_request, timeout)


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
    ready = FakeGetClient({"x": value(3, double_value=0.1), "y": value(8, double_array_value=[1.0, 2.0])})
    reader = reader_for({"/a": ready, "/b": FakeGetClient(ready=False)})
    result = reader.read({"/a": ["x", "y"], "/b": ["z"], "/c": ["w"]})
    assert result["/a"] == {"available": True, "values": {"x": 0.1, "y": [1.0, 2.0]}}
    assert result["/b"] == {"available": False, "values": {}}
    assert result["/c"] == {"available": False, "values": {}}
    assert ready.requests == [["x", "y"]]


def test_an_undeclared_name_lists_the_node_once_and_asks_only_declared_names():
    get = FakeGetClient({"x": value(3, double_value=0.1)})
    listing = FakeListClient(get)
    reader = reader_for({"/a": get}, {"/a": listing})
    first = reader.read({"/a": ["x", "new_param"]})
    assert first == {"/a": {"available": True, "values": {"x": 0.1, "new_param": None}}}
    assert get.requests == [["x", "new_param"], ["x"]]
    second = reader.read({"/a": ["x", "new_param"]})
    assert second == first
    assert get.requests[-1] == ["x"] and listing.calls == 1   # cached: no repeated listing or warnings
    get.ready = False
    assert reader.read({"/a": ["x"]})["/a"]["available"] is False
    get.ready = True
    get.declared["new_param"] = value(2, integer_value=5)   # a newer node build came up
    assert reader.read({"/a": ["x", "new_param"]})["/a"]["values"] == {"x": 0.1, "new_param": 5}


def test_without_a_list_client_undeclared_answers_read_as_unknown_values():
    get = FakeGetClient({"x": value(3, double_value=0.1)})
    result = reader_for({"/a": get}).read({"/a": ["x", "new_param"]})
    assert result == {"/a": {"available": True, "values": {"x": None, "new_param": None}}}


def test_timeouts_and_failed_calls_read_as_unavailable():
    slow = FakeGetClient(future=FakeFuture(complete=False))
    broken = FakeGetClient(future=FakeFuture(error=RuntimeError("gone")))
    reader = reader_for({"/slow": slow, "/broken": broken}, timeout=0.05)
    result = reader.read({"/slow": ["x"], "/broken": ["y"]})
    assert result == {"/slow": {"available": False, "values": {}}, "/broken": {"available": False, "values": {}}}
    assert slow.removed == [slow.future]
