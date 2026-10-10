import asyncio
import threading

from realman_recording.web_server import RecordingWebServer


class _BlockedSocket:
    def __init__(self):
        self.messages = []
        self.release = None

    async def send_str(self, payload):
        self.messages.append(payload)
        await self.release.wait()


class _FastSocket:
    def __init__(self):
        self.messages = []

    async def send_str(self, payload):
        self.messages.append(payload)


def test_slow_websocket_does_not_block_snapshot_producer_and_only_latest_is_queued(monkeypatch):
    loop = asyncio.new_event_loop()
    loop_ready = threading.Event()

    def run_loop():
        asyncio.set_event_loop(loop)
        loop_ready.set()
        loop.run_forever()

    loop_thread = threading.Thread(target=run_loop, daemon=True)
    loop_thread.start()
    assert loop_ready.wait(timeout=1.0)

    server = object.__new__(RecordingWebServer)
    server._loop = loop
    server._snapshot_lock = threading.Lock()
    server._pending_snapshot = None
    server._snapshot_flush_scheduled = False

    slow_socket = _BlockedSocket()
    fast_socket = _FastSocket()
    server._clients = {slow_socket, fast_socket}
    scheduled_futures = []
    schedule_coroutine = asyncio.run_coroutine_threadsafe

    def track_scheduled_coroutine(coroutine, target_loop):
        future = schedule_coroutine(coroutine, target_loop)
        scheduled_futures.append(future)
        return future

    monkeypatch.setattr(asyncio, "run_coroutine_threadsafe", track_scheduled_coroutine)

    def create_release_event():
        slow_socket.release = asyncio.Event()

    loop.call_soon_threadsafe(create_release_event)

    producer = threading.Thread(
        target=lambda: [server.send_snapshot({"index": index}) for index in range(100)]
    )
    try:
        producer.start()
        producer.join(timeout=0.25)
        assert not producer.is_alive(), "ROS-side snapshot producer waited for a slow browser"

        async def wait_for_flush_to_finish():
            deadline = loop.time() + 2.0
            while server._snapshot_flush_scheduled:
                if loop.time() >= deadline:
                    failures = [
                        repr(future.exception()) if future.done() else "pending"
                        for future in scheduled_futures
                    ]
                    raise AssertionError(
                        f"snapshot flush stayed blocked after slow-client timeout; futures={failures}; "
                        f"messages={slow_socket.messages!r}"
                    )
                await asyncio.sleep(0.01)

        schedule_coroutine(wait_for_flush_to_finish(), loop).result(timeout=3.0)
        exceptions = [repr(future.exception()) for future in scheduled_futures if future.exception() is not None]
        assert not exceptions, f"snapshot flush raised unexpectedly: {exceptions}"
        assert fast_socket.messages and fast_socket.messages[-1] == '{"index":99}'
        assert server._pending_snapshot is None
        assert server._clients == {fast_socket}
    finally:
        loop.call_soon_threadsafe(loop.stop)
        loop_thread.join(timeout=1.0)
        loop.close()
