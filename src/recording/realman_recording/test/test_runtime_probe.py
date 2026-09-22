from realman_recording.runtime_probe import RateCounter, _unique


def test_rate_counter_uses_inter_sample_elapsed_time():
    counter = RateCounter()
    counter.add(1_000_000_000)
    counter.add(1_100_000_000)
    counter.add(1_200_000_000)
    assert counter.count == 3
    assert counter.rate_hz == 10.0


def test_runtime_probe_topic_deduplication_preserves_order():
    assert _unique(("/a", "", "/b", "/a")) == ("/a", "/b")
