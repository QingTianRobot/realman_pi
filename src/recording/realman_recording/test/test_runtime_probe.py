from realman_recording.runtime_probe import RateCounter, _device_status_snapshot, _unique


def test_rate_counter_uses_inter_sample_elapsed_time():
    counter = RateCounter()
    counter.add(1_000_000_000)
    counter.add(1_100_000_000)
    counter.add(1_200_000_000)
    assert counter.count == 3
    assert counter.rate_hz == 10.0


def test_runtime_probe_topic_deduplication_preserves_order():
    assert _unique(("/a", "", "/b", "/a")) == ("/a", "/b")


def test_device_status_snapshot_keeps_driver_health_fields():
    class Status:
        device_online = True
        connection_type = "USB2.1"
        color_frame_rate_cur = 0.0

    assert _device_status_snapshot(Status()) == {
        "device_online": True,
        "connection_type": "USB2.1",
        "color_frame_rate_cur": 0.0,
    }
