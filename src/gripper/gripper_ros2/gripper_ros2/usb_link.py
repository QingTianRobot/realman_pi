"""Which USB adapter a gripper serial port sits on, read from sysfs (no ROS, no serial I/O).

The port is the character device the bus opens (``/dev/realman/gripper_left`` or a plain
``/dev/ttyUSB0``). Its major:minor leads to ``/sys/dev/char/<M>:<m>``, whose real path runs
through the USB device that carries the tty (``.../usb5/5-1/5-1.2/5-1.2:1.0/ttyUSB0``). The
first ancestor with an ``idVendor`` file is that USB device. This works inside a container
that only has the device node mapped, because sysfs shows the host's tree.
"""

from __future__ import annotations

import os
import stat
from pathlib import Path
from typing import Any


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace").strip()
    except OSError:
        return ""


def _float(text: str) -> float | None:
    try:
        return float(text)
    except ValueError:
        return None


def usb_device_info(device_dir: Path, sys_root: Path) -> dict[str, Any]:
    """Descriptor fields of one ``/sys/bus/usb/devices/<path>`` directory."""
    busnum = _read(device_dir / "busnum")
    return {
        "usb_path": device_dir.name,
        "busnum": int(busnum) if busnum.isdigit() else None,
        "speed_mbps": _float(_read(device_dir / "speed")),
        "usb_version": _read(device_dir / "version"),
        "vendor_id": _read(device_dir / "idVendor"),
        "product_id": _read(device_dir / "idProduct"),
        "product": _read(device_dir / "product"),
        "manufacturer": _read(device_dir / "manufacturer"),
        "serial": _read(device_dir / "serial"),
        # The root hub's serial is the host controller's PCI address (0000:00:14.0).
        "controller": _read(sys_root / "bus" / "usb" / "devices" / f"usb{busnum}" / "serial") if busnum else "",
    }


def char_device_number(port: str) -> tuple[int, int] | None:
    """``(major, minor)`` of a character device, ``None`` for anything else; raises OSError."""
    info = os.stat(port)
    if not stat.S_ISCHR(info.st_mode):
        return None
    return os.major(info.st_rdev), os.minor(info.st_rdev)


def serial_port_link(port: str, sys_root: str | Path = "/sys") -> dict[str, Any]:
    """``{"port", "tty", "usb": {...} | None, "error"}`` for one serial device path."""
    root = Path(sys_root)
    result: dict[str, Any] = {"port": port, "tty": "", "usb": None, "error": ""}
    try:
        major_minor = char_device_number(port)
    except OSError as error:
        result["error"] = f"{port}: {error.strerror or error}"
        return result
    if major_minor is None:
        result["error"] = f"{port} is not a character device"
        return result
    char_dir = root / "dev" / "char" / f"{major_minor[0]}:{major_minor[1]}"
    try:
        real = char_dir.resolve(strict=True)
    except OSError:
        result["error"] = f"no sysfs entry for {port}"
        return result
    result["tty"] = real.name
    for parent in real.parents:
        if parent == parent.parent:
            break
        if (parent / "idVendor").is_file():
            result["usb"] = usb_device_info(parent, root)
            return result
    result["error"] = f"{real.name} is not a USB serial device"
    return result
