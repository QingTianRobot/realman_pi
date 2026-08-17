#!/usr/bin/env python3
"""
夹爪 Modbus 诊断工具
--------------------
扫描指定串口上可能的从站地址和波特率组合，找出能正常应答的配置。

用法:
    python diagnose_gripper.py /dev/ttyUSB0
    python diagnose_gripper.py /dev/ttyUSB0 --slave_ids 0 1 2 3 4 5
    python diagnose_gripper.py /dev/ttyUSB1 --baudrates 9600 115200
"""

import argparse
import sys

import minimalmodbus
import serial


def try_read(port, slave_id, baudrate):
    """尝试用 (slave_id, baudrate) 组合读一个寄存器，返回 True/False 和值。"""
    inst = minimalmodbus.Instrument(port, slave_id)
    inst.serial.baudrate = baudrate
    inst.serial.bytesize = 8
    inst.serial.parity = serial.PARITY_NONE
    inst.serial.stopbits = 1
    inst.serial.timeout = 0.5
    inst.mode = minimalmodbus.MODE_RTU
    inst.clear_buffers_before_each_transaction = True

    try:
        # REG_READY = 0x0604（就绪标志），能读到说明通信正常
        val = inst.read_register(0x0604, functioncode=3)
        return True, val
    except Exception:
        return False, None
    finally:
        try:
            inst.serial.close()
        except Exception:
            pass


def main():
    parser = argparse.ArgumentParser(description='夹爪 Modbus 诊断')
    parser.add_argument('port', help='串口，例如 /dev/ttyUSB0')
    parser.add_argument('--slave_ids', nargs='+', type=int,
                        default=[0, 1, 2, 3, 4, 5],
                        help='要扫描的从站地址 (默认 0-5)')
    parser.add_argument('--baudrates', nargs='+', type=int,
                        default=[9600, 19200, 38400, 57600, 115200],
                        help='要扫描的波特率 (默认 5 种常见值)')
    args = parser.parse_args()

    print(f'扫描串口: {args.port}')
    print(f'从站地址: {args.slave_ids}')
    print(f'波特率:   {args.baudrates}')
    print('=' * 60)

    found = False
    for baud in args.baudrates:
        for sid in args.slave_ids:
            ok, val = try_read(args.port, sid, baud)
            status = f'✓ 有应答, REG_READY(0x0604)={val}' if ok else '✗ 无应答'
            print(f'  slave_id={sid:<3} baud={baud:<7} -> {status}')
            if ok:
                found = True

    print('=' * 60)
    if found:
        print('结论: 找到可通信配置，请把对应 slave_id/baudrate 填入 launch 参数。')
    else:
        print('结论: 所有组合均无应答。')
        print('请检查: 1) 夹爪 24V 供电  2) RS-485 A/B 接线  3) 该串口是否接对了设备')


if __name__ == '__main__':
    main()
