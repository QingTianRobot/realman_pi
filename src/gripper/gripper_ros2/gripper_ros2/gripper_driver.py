"""Reusable multi-bus Changingtek gripper driver.

The implementation follows the reference repository's concurrency model:
one SDK instance per physical serial bus, an RLock around address switching
and transactions, and independent polling/reconnect threads per bus.
"""

from __future__ import annotations

import threading
import time

from .changingtek import Changingtek_rtu_psdk
from .changingtek.rtu_psdk import (
    REG_ALARM, REG_CURRENT_FB, REG_POS_FB_H, REG_SPEED_FB,
    REG_TORQUE_REACHED,
)

DEVICE_FIELDS = (
    "speed_pct", "force_pct", "accel", "decel", "min_position",
    "max_position", "pos_unit_scale", "open_position", "close_position",
)


def _empty_feedback():
    return {
        "position": 0, "position_mm": 0.0, "speed": 0, "current": 0,
        "torque_reached": False, "position_reached": False,
        "speed_max_reached": False, "ready": False, "alarm": 0, "ts": 0.0,
    }


class GripperDevice:
    def __init__(self, bus, slave_id: int, name: str | None = None,
                 speed_pct: int = 50, force_pct: int = 60, accel: int = 2000,
                 decel: int = 2000, min_position: int = 0,
                 max_position: int = 9000, pos_unit_scale: float = 100.0,
                 open_position: int | None = None, close_position: int | None = None):
        self.bus = bus
        self.slave_id = int(slave_id)
        self.name = name or f"gripper_{self.slave_id}"
        self.speed_pct, self.force_pct = int(speed_pct), int(force_pct)
        self.accel, self.decel = int(accel), int(decel)
        self.min_position, self.max_position = int(min_position), int(max_position)
        self.pos_unit_scale = float(pos_unit_scale)
        self.open_position = self.min_position if open_position is None else int(open_position)
        self.close_position = self.max_position if close_position is None else int(close_position)
        self._last_params = None
        self._enabled = False
        self.feedback = _empty_feedback()

    def enable(self, on: bool = True):
        result = self.bus.transaction(self.slave_id, lambda sdk: sdk.enable(on))
        self._enabled = bool(on)
        return result

    def disable(self):
        return self.enable(False)

    def move_to(self, position: int, speed_pct: int | None = None,
                force_pct: int | None = None):
        position = int(max(self.min_position, min(self.max_position, position)))
        speed = self.speed_pct if speed_pct is None else int(speed_pct)
        force = self.force_pct if force_pct is None else int(force_pct)
        if speed_pct is not None:
            self.speed_pct = speed
        if force_pct is not None:
            self.force_pct = force
        params = (speed, force, self.accel, self.decel)

        def _write(sdk):
            if params != self._last_params:
                sdk.temp_move(position_mm=position, speed_pct=speed, force_pct=force,
                              accel=self.accel, decel=self.decel)
            else:
                sdk.set_temp_position_mm(position)
                sdk.trigger_temp_move()
            self._last_params = params

        return self.bus.transaction(self.slave_id, _write)

    def set_params(self, speed_pct: int | None = None, force_pct: int | None = None):
        if speed_pct is not None:
            self.speed_pct = int(speed_pct)
        if force_pct is not None:
            self.force_pct = int(force_pct)
        self._last_params = None

    def read_feedback(self) -> dict:
        def _read(sdk):
            values = sdk._r(REG_SPEED_FB, 4)
            status = sdk._r(REG_TORQUE_REACHED, 4)
            position = ((values[2] & 0xFFFF) << 16) | (values[3] & 0xFFFF)
            scale = self.pos_unit_scale
            return {
                "position": position,
                "position_mm": round(position / scale, 2) if scale else 0.0,
                "speed": values[0], "current": values[1],
                "torque_reached": bool(status[0]),
                "position_reached": bool(status[1]),
                "speed_max_reached": bool(status[2]), "ready": bool(status[3]),
                "alarm": sdk._r(REG_ALARM, 1)[0], "ts": time.time(),
            }

        self.feedback = self.bus.transaction(self.slave_id, _read)
        return self.feedback

    def snapshot(self) -> dict:
        result = {
            "name": self.name, "slave_id": self.slave_id, "port": self.bus.port,
            "enabled": self._enabled, "min_position": self.min_position,
            "max_position": self.max_position,
        }
        result.update(self.feedback)
        return result


class GripperBus:
    def __init__(self, port: str, baudrate: int = 115200, timeout: float = 0.3,
                 poll_hz: float = 25.0, auto_reconnect: bool = True,
                 reconnect_interval: float = 5.0, command_quiet_s: float = 0.2,
                 streaming_poll_interval: float = 0.5,
                 min_command_interval_s: float = 0.25,
                 command_deadband: float = 0.01):
        self.port, self.baudrate, self.timeout = port, int(baudrate), float(timeout)
        self.poll_hz, self.auto_reconnect = float(poll_hz), bool(auto_reconnect)
        self.reconnect_interval = float(reconnect_interval)
        self._sdk = None
        self._lock = threading.RLock()
        self._connected = False
        self.devices = {}
        self.active_slave_id = None
        self.polling_enabled = True
        self._pending, self._cmd_lock = {}, threading.Lock()
        self._running, self._thread, self._hz = False, None, 0.0
        self._last_error = None
        # Streaming targets have bus priority over feedback reads: while
        # commands keep arriving, feedback is refreshed only every
        # ``streaming_poll_interval`` seconds (also keeps ``connected`` fresh).
        self.command_quiet_s = float(command_quiet_s)
        self.streaming_poll_interval = float(streaming_poll_interval)
        # Streaming targets are re-triggered at most every ``min_command_interval_s``
        # (a trigger restarts the gripper's motion profile, so a 20 Hz stream never
        # lets it move) and skipped when within ``command_deadband`` (fraction of
        # the open..close span) of the last sent target. The newest target is kept
        # until it is due, so the final position is always sent.
        self.min_command_interval_s = float(min_command_interval_s)
        self.command_deadband = float(command_deadband)
        self._last_sent = {}
        self._wake = threading.Event()
        self._last_command = self._last_poll = 0.0

    def add_gripper(self, slave_id: int, **kwargs):
        device = GripperDevice(self, slave_id, **kwargs)
        self.devices[int(slave_id)] = device
        return device

    def get(self, slave_id: int):
        return self.devices[int(slave_id)]

    def _ensure_sdk(self):
        if self._sdk is None:
            self._sdk = Changingtek_rtu_psdk(self.port, slave_id=1,
                                             baudrate=self.baudrate, timeout=self.timeout)
        return self._sdk

    def connect(self) -> bool:
        with self._lock:
            try:
                self._connected = bool(self._ensure_sdk().connect())
            except Exception as error:
                self._connected, self._last_error, self._sdk = False, str(error), None
            return self._connected

    def disconnect(self):
        with self._lock:
            try:
                if self._sdk is not None:
                    self._sdk.disconnect()
            finally:
                self._connected = False

    @property
    def connected(self):
        return self._connected

    def transaction(self, slave_id: int, fn):
        with self._lock:
            sdk = self._ensure_sdk()
            sdk.instrument.address = int(slave_id)
            return fn(sdk)

    def request_move(self, slave_id: int, position: int):
        with self._cmd_lock:
            self._pending[int(slave_id)] = int(position)
        self._wake.set()

    def set_active(self, slave_id):
        self.active_slave_id = None if slave_id is None else int(slave_id)

    def start(self):
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._run, name=f"bus-{self.port}", daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=1.0)
            self._thread = None

    def _run(self):
        period = 1.0 / max(1.0, self.poll_hz)
        next_retry, previous = 0.0, time.time()
        while self._running:
            started = time.time()
            try:
                self._cycle(started)
                self._connected, self._last_error = True, None
            except Exception as error:
                self._connected, self._last_error = False, str(error)
                if self.auto_reconnect and time.time() >= next_retry:
                    next_retry = time.time() + self.reconnect_interval
                    self._try_reconnect()
            if self._connected and self.polling_enabled:
                dt = started - previous
                self._hz = round(1.0 / dt, 1) if dt > 1e-6 else 0.0
            else:
                self._hz = 0.0
            previous = started
            # A new target wakes the loop immediately instead of waiting out the period.
            due = self._next_due(time.time())
            wait = period - (time.time() - started)
            self._wake.wait(max(0.0, wait if due is None else min(wait, due)))
            self._wake.clear()

    def _cycle(self, now: float):
        if self._process_pending(now):
            self._last_command = now
        streaming = now - self._last_command < self.command_quiet_s
        if streaming and now - self._last_poll < self.streaming_poll_interval:
            return
        self._last_poll = now
        self._poll_devices()

    def _process_pending(self, now: float | None = None) -> bool:
        now = time.time() if now is None else now
        sent = False
        with self._cmd_lock:
            pending = dict(self._pending)
        for slave_id, position in pending.items():
            device = self.devices.get(slave_id)
            last = self._last_sent.get(slave_id)
            if device is None:
                self._drop_pending(slave_id, position)
                continue
            if last is not None:
                if now - last[0] < self.min_command_interval_s:
                    continue  # keep the newest target until it is due
                span = abs(device.close_position - device.open_position)
                at_end = position in (device.open_position, device.close_position)
                if position == last[1] or (
                        not at_end and abs(position - last[1]) < self.command_deadband * span):
                    self._drop_pending(slave_id, position)
                    continue
            self._drop_pending(slave_id, position)
            device.move_to(position)
            self._last_sent[slave_id] = (now, position)
            sent = True
        return sent

    def _drop_pending(self, slave_id: int, position: int):
        with self._cmd_lock:
            if self._pending.get(slave_id) == position:
                del self._pending[slave_id]

    def _next_due(self, now: float) -> float | None:
        """Seconds until the earliest held target may be sent, or None."""
        with self._cmd_lock:
            held = list(self._pending)
        waits = [max(0.0, self._last_sent[i][0] + self.min_command_interval_s - now)
                 for i in held if i in self._last_sent]
        return min(waits) if waits else None

    def _poll_devices(self):
        if not self.polling_enabled:
            return
        targets = ([self.devices[self.active_slave_id]] if self.active_slave_id in self.devices
                   else list(self.devices.values())) if self.active_slave_id is not None else list(self.devices.values())
        for device in targets:
            device.read_feedback()

    def _try_reconnect(self):
        try:
            self.disconnect()
        finally:
            with self._lock:
                self._sdk = None
        if self.connect():
            self._last_sent.clear()
            for device in self.devices.values():
                device._last_params = None
                if device._enabled:
                    try:
                        device.enable(True)
                        device.bus.transaction(device.slave_id, lambda sdk: sdk.set_cmd_update_mode(0))
                    except Exception:
                        pass

    def snapshot(self):
        return {
            "port": self.port, "connected": self._connected, "hz": self._hz,
            "error": self._last_error, "active_slave_id": self.active_slave_id,
            "devices": [device.snapshot() for device in self.devices.values()],
        }


class GripperManager:
    def __init__(self):
        self.buses, self._devices, self._active_name = {}, {}, None

    def add_bus(self, port: str, **kwargs):
        if port not in self.buses:
            self.buses[port] = GripperBus(port, **kwargs)
        return self.buses[port]

    def get_bus(self, port: str):
        return self.buses[port]

    def add_gripper(self, port: str, slave_id: int, name: str | None = None, **kwargs):
        bus = self.buses[port] if port in self.buses else self.add_bus(port)
        device = bus.add_gripper(slave_id, name=name, **kwargs)
        if device.name in self._devices:
            raise ValueError(f"gripper name must be globally unique: {device.name}")
        self._devices[device.name] = device
        return device

    def get(self, name: str):
        return self._devices[name]

    @property
    def device_names(self):
        return list(self._devices)

    def connect_all(self):
        return {port: bus.connect() for port, bus in self.buses.items()}

    def disconnect_all(self):
        for bus in self.buses.values():
            bus.disconnect()

    def start_all(self):
        for bus in self.buses.values():
            bus.start()

    def stop_all(self):
        for bus in self.buses.values():
            bus.stop()

    def set_active(self, name: str):
        device = self.get(name)
        self._active_name = name
        for bus in self.buses.values():
            bus.polling_enabled = bus is device.bus
            bus.set_active(device.slave_id if bus is device.bus else None)

    def poll_all_devices(self):
        self._active_name = None
        for bus in self.buses.values():
            bus.polling_enabled, bus.active_slave_id = True, None

    def request_move(self, name: str, position: int):
        device = self.get(name)
        device.bus.request_move(device.slave_id, position)

    def snapshot(self):
        return {"active": self._active_name, "buses": [bus.snapshot() for bus in self.buses.values()]}

    @classmethod
    def from_config(cls, config: dict):
        manager = cls()
        defaults = config.get("defaults", {})
        for bus_config in config.get("buses", []):
            port = bus_config["port"]
            manager.add_bus(port, baudrate=bus_config.get("baudrate", 115200),
                            timeout=bus_config.get("timeout", 0.3),
                            poll_hz=bus_config.get("poll_hz", 25.0),
                            auto_reconnect=bus_config.get("auto_reconnect", True),
                            reconnect_interval=bus_config.get("reconnect_interval", 5.0),
                            command_quiet_s=bus_config.get("command_quiet_s", 0.2),
                            streaming_poll_interval=bus_config.get("streaming_poll_interval", 0.5),
                            min_command_interval_s=bus_config.get("min_command_interval_s", 0.25),
                            command_deadband=bus_config.get("command_deadband", 0.01))
            for item in bus_config.get("grippers", []):
                values = {key: value for key, value in defaults.items() if key in DEVICE_FIELDS}
                values.update({key: value for key, value in item.items() if key in DEVICE_FIELDS})
                manager.add_gripper(port, int(item["slave_id"]), name=item.get("name"), **values)
        return manager
