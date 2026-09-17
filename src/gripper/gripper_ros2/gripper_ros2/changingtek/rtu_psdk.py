"""Changingtek Modbus RTU SDK used by the ROS gripper driver.

This module intentionally contains only the reusable SDK class.  The example
programs from the vendor repository are not imported, so importing ROS nodes
never opens a serial port or starts motion.
"""

from __future__ import annotations

import threading
import time

try:  # Keep fake-SDK/unit-test imports usable without hardware dependencies.
    import minimalmodbus
    import serial
except ImportError:  # pragma: no cover - exercised only in dependency-free dev shells
    minimalmodbus = None
    serial = None


REG_ENABLE = 0x0100
REG_TMP_POS_H = 0x0102
REG_TMP_POS_L = 0x0103
REG_TMP_SPEED = 0x0104
REG_TMP_FORCE = 0x0105
REG_TMP_ACCEL = 0x0106
REG_TMP_DECEL = 0x0107
REG_TMP_TRIGGER = 0x0108
REG_CMD_UPDATE_MODE = 0x010F
REG_MULTI_MODE = 0x0110
REG_MULTI_START_SEG = 0x0111
REG_MULTI_END_SEG = 0x0112
REG_MULTI_RESUME_POLICY = 0x0113
REG_MULTI_LOOP_COUNT = 0x0114
REG_MULTI_SELECT_SEG = 0x0116
REG_MULTI_TRIGGER = 0x0117
REG_MULTI_PAUSE = 0x0118
REG_TORQUE_REACHED = 0x0601
REG_POS_REACHED = 0x0602
REG_SPEED_MAX_REACHED = 0x0603
REG_READY = 0x0604
REG_CURR_LOOP_COUNT = 0x0606
REG_CURR_SEG = 0x0607
REG_SPEED_FB = 0x060B
REG_CURRENT_FB = 0x060C
REG_POS_FB_H = 0x060D
REG_POS_FB_L = 0x060E
REG_ALARM = 0x0612
REG_PARAM_CHANGED = 0x0614


class Changingtek_rtu_psdk:
    """Thread-safe wrapper around one Modbus RTU instrument."""

    def __init__(self, port: str, slave_id: int = 1, baudrate: int = 115200,
                 timeout: float = 0.3):
        if minimalmodbus is None or serial is None:
            raise RuntimeError("minimalmodbus and pyserial are required for hardware access")
        self.instrument = minimalmodbus.Instrument(port, slave_id)
        self.instrument.serial.baudrate = baudrate
        self.instrument.serial.bytesize = 8
        self.instrument.serial.parity = serial.PARITY_NONE
        self.instrument.serial.stopbits = 1
        self.instrument.serial.timeout = timeout
        self.instrument.mode = minimalmodbus.MODE_RTU
        self.instrument.clear_buffers_before_each_transaction = False
        self._lock = threading.Lock()

    def connect(self) -> bool:
        try:
            if not self.instrument.serial.is_open:
                self.instrument.serial.open()
            return True
        except Exception:
            return False

    def disconnect(self):
        if self.instrument.serial.is_open:
            self.instrument.serial.close()

    def _w1(self, addr: int, value: int):
        with self._lock:
            return self.instrument.write_register(addr, value, functioncode=6)

    def _wn(self, addr: int, values):
        with self._lock:
            return self.instrument.write_registers(addr, list(values))

    def _r(self, addr: int, count: int = 1):
        with self._lock:
            return self.instrument.read_registers(addr, count, functioncode=3)

    def enable(self, enable: bool = True):
        return self._w1(REG_ENABLE, 1 if enable else 0)

    def set_temp_position_mm(self, position_mm: int):
        if not 0 <= position_mm <= 0xFFFFFFFF:
            raise ValueError("position_mm must be in 0..0xFFFFFFFF")
        return self._wn(REG_TMP_POS_H, [(position_mm >> 16) & 0xFFFF, position_mm & 0xFFFF])

    def set_temp_speed_pct(self, speed_pct: int):
        if not 0 <= speed_pct <= 100:
            raise ValueError("speed_pct must be in 0..100")
        return self._w1(REG_TMP_SPEED, speed_pct)

    def set_temp_force_pct(self, force_pct: int):
        if not 0 <= force_pct <= 100:
            raise ValueError("force_pct must be in 0..100")
        return self._w1(REG_TMP_FORCE, force_pct)

    def set_temp_accel(self, accel: int):
        return self._w1(REG_TMP_ACCEL, accel)

    def set_temp_decel(self, decel: int):
        return self._w1(REG_TMP_DECEL, decel)

    def trigger_temp_move(self):
        return self._w1(REG_TMP_TRIGGER, 1)

    def temp_move(self, position_mm: int, speed_pct: int = 100, force_pct: int = 60,
                  accel: int = 2000, decel: int = 2000, trigger: bool = True):
        self.set_temp_position_mm(position_mm)
        self.set_temp_speed_pct(speed_pct)
        self.set_temp_force_pct(force_pct)
        self.set_temp_accel(accel)
        self.set_temp_decel(decel)
        if trigger:
            self.trigger_temp_move()

    def griger_reset(self):
        return self._w1(0x0403, 1)

    def set_cmd_update_mode(self, mode: int):
        if mode not in (0, 1):
            raise ValueError("mode must be 0 or 1")
        return self._w1(REG_CMD_UPDATE_MODE, mode)

    def _read_bool(self, addr: int) -> bool:
        return bool(self._r(addr, 1)[0])

    def torque_reached(self) -> bool:
        return self._read_bool(REG_TORQUE_REACHED)

    def position_reached(self) -> bool:
        return self._read_bool(REG_POS_REACHED)

    def speed_max_reached(self) -> bool:
        return self._read_bool(REG_SPEED_MAX_REACHED)

    def ready(self) -> bool:
        return self._read_bool(REG_READY)

    def feedback_position(self) -> int:
        hi, lo = self._r(REG_POS_FB_H, 2)
        return ((hi & 0xFFFF) << 16) | (lo & 0xFFFF)

    def feedback_speed(self) -> int:
        return self._r(REG_SPEED_FB, 1)[0]

    def feedback_current(self) -> int:
        return self._r(REG_CURRENT_FB, 1)[0]

    def read_alarm(self) -> int:
        return self._r(REG_ALARM, 1)[0]

    def wait_until_pos_or_torque(self, timeout: float = 5.0, poll: float = 0.02) -> str:
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                torque, position = self._r(REG_TORQUE_REACHED, 2)
                if bool(position):
                    return "position"
                if bool(torque):
                    return "torque"
            except Exception:
                pass
            time.sleep(poll)
        return "timeout"
