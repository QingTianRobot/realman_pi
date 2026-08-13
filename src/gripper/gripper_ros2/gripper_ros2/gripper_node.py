"""
gripper_ros2 — ROS 2 node for Changingtek gripper control via Modbus RTU.

Provides:
  Services:
    ~/open      (std_srvs/Trigger)  — open the gripper
    ~/close     (std_srvs/Trigger)  — close the gripper
    ~/reset     (std_srvs/Trigger)  — reset the gripper
    ~/enable    (std_srvs/SetBool)  — enable/disable the actuator
    ~/grasp_check (std_srvs/Trigger) — check if grasping is successful

  Topics:
    ~/status    (gripper_ros2/GripperStatus) — feedback at 10 Hz

  Parameters:
    port         — serial port (e.g. /dev/ttyUSB0)
    slave_id     — Modbus slave address (default 1)
    baudrate     — serial baudrate (default 115200)
    timeout      — read/write timeout in seconds (default 0.3)
    open_pos     — open position in device units (default 400)
    close_pos    — close position in device units (default 12000)
    speed        — speed percentage 0–100 (default 100)
    force        — force/torque percentage 0–100 (default 60)
    status_rate  — status publish rate in Hz (default 10.0)
"""

import sys
import os
import math
import threading

import rclpy
from rclpy.node import Node
from rclpy.parameter import Parameter
from rclpy.callback_groups import MutuallyExclusiveCallbackGroup, ReentrantCallbackGroup

from std_msgs.msg import Float64, Int32, Bool
from std_srvs.srv import Trigger, SetBool
from gripper_ros2_msgs.srv import GripperPercentage


def _import_sdk():
    """Lazy import: load only the Changingtek_rtu_psdk class from griger.py.

    griger.py is a hybrid file: the top half defines the reusable SDK class,
    the bottom half (marked by a ``控制部分`` banner) is script-level demo code
    that instantiates two SDK objects and would try to open *both* serial ports
    at import time.  We exec only the portion up to that banner so the node
    opens exactly one port — its own — via connect().

    The SDK's module-level code calls _find_backend_root() which walks up from
    SCRIPT_DIR looking for a directory named 'backend'.  We set __file__ to a
    path inside a synthetic backend/ so the search succeeds immediately,
    regardless of whether we are running from the source tree or the colcon
    install space.
    """
    import types

    _pkg_dir = os.path.dirname(os.path.abspath(__file__))
    _sdk_path = os.path.join(_pkg_dir, 'griger.py')

    # Place a backend/ sibling so the SDK's logger init succeeds
    _backend_dir = os.path.join(_pkg_dir, 'backend')
    os.makedirs(os.path.join(_backend_dir, 'logs'), exist_ok=True)

    with open(_sdk_path) as fh:
        source = fh.read()

    # Trim everything from the script-level control section onward
    _marker = '控制部分'
    _cut = source.find(_marker)
    if _cut != -1:
        source = source[:_cut]

    mod = types.ModuleType('griger_sdk')
    # Fake __file__ so SCRIPT_DIR (line 42 of griger.py) resolves to backend/
    mod.__file__ = os.path.join(_backend_dir, 'griger.py')

    exec(source, mod.__dict__)

    return mod.Changingtek_rtu_psdk


class GripperNode(Node):
    """ROS 2 node wrapping a single Changingtek gripper over Modbus RTU."""

    def __init__(self):
        super().__init__('gripper_node')

        # --------------- Parameters ---------------
        self.declare_parameter('port', '/dev/ttyUSB0')
        self.declare_parameter('slave_id', 1)
        self.declare_parameter('baudrate', 115200)
        self.declare_parameter('timeout', 0.3)
        self.declare_parameter('open_pos', 400)
        self.declare_parameter('close_pos', 12000)
        self.declare_parameter('speed', 100)
        self.declare_parameter('force', 60)
        self.declare_parameter('accel', 100)
        self.declare_parameter('decel', 100)
        self.declare_parameter('status_rate', 10.0)
        self.declare_parameter('auto_enable', True)
        self.declare_parameter('auto_calibrate', True)
        self.declare_parameter('calibrate_close_target', 100000)

        # Read all params
        self._port = self.get_parameter('port').value
        self._slave_id = self.get_parameter('slave_id').value
        self._baudrate = self.get_parameter('baudrate').value
        self._timeout = self.get_parameter('timeout').value
        self._open_pos = self.get_parameter('open_pos').value
        self._close_pos = self.get_parameter('close_pos').value
        self._speed = self.get_parameter('speed').value
        self._force = self.get_parameter('force').value
        self._accel = self.get_parameter('accel').value
        self._decel = self.get_parameter('decel').value
        self._status_rate = self.get_parameter('status_rate').value
        self._auto_enable = self.get_parameter('auto_enable').value
        self._auto_calibrate = self.get_parameter('auto_calibrate').value
        self._cal_close_target = self.get_parameter('calibrate_close_target').value

        # --------------- State ---------------
        self._sdk = None
        self._connected = False
        self._enabled = False
        self._is_moving = False
        # 标定结果：open_pos(百分比1) / close_pos(百分比0)
        self._cal_open_pos = None
        self._cal_close_pos = None
        self._calibrated = False
        self._calibrating = False
        # 标定/运动锁：串口操作需互斥
        self._motion_lock = threading.Lock()

        # --------------- Callback groups ---------------
        # Service calls are mutually exclusive (one motion at a time)
        self._srv_cb = MutuallyExclusiveCallbackGroup()
        # Status publishing is reentrant
        self._pub_cb = ReentrantCallbackGroup()

        # --------------- Services ---------------
        self._srv_open = self.create_service(
            Trigger, '~/open', self._handle_open, callback_group=self._srv_cb
        )
        self._srv_close = self.create_service(
            Trigger, '~/close', self._handle_close, callback_group=self._srv_cb
        )
        self._srv_reset = self.create_service(
            Trigger, '~/reset', self._handle_reset, callback_group=self._srv_cb
        )
        self._srv_enable = self.create_service(
            SetBool, '~/enable', self._handle_enable, callback_group=self._srv_cb
        )
        self._srv_grasp_check = self.create_service(
            Trigger, '~/grasp_check', self._handle_grasp_check, callback_group=self._srv_cb
        )
        self._srv_percentage = self.create_service(
            GripperPercentage, '~/percentage', self._handle_percentage, callback_group=self._srv_cb
        )
        self._srv_calibrate = self.create_service(
            Trigger, '~/calibrate', self._handle_calibrate, callback_group=self._srv_cb
        )

        # --------------- Publishers ---------------
        self._pub_status = self.create_publisher(
            Float64, '~/position', 10
        )
        self._pub_torque = self.create_publisher(
            Bool, '~/torque_reached', 10
        )
        self._pub_alarm = self.create_publisher(
            Int32, '~/alarm', 10
        )

        # --------------- Timer for status feedback ---------------
        period = 1.0 / max(self._status_rate, 0.5)
        self._status_timer = self.create_timer(
            period, self._publish_status, callback_group=self._pub_cb
        )

        # --------------- Init SDK ---------------
        self._init_sdk()

        # --------------- Auto calibration (background) ---------------
        if self._auto_calibrate and self._connected:
            threading.Thread(target=self._calibrate, daemon=True).start()

        self.get_logger().info(f'GripperNode started on {self._port}')

    # ===================== SDK Init =====================
    def _init_sdk(self):
        """Lazy-import and instantiate the Changingtek SDK, then connect.

        Never raises: hardware communication errors are logged and the node
        stays alive, so the services can report a useful error instead of
        crashing the whole process.
        """
        try:
            Changingtek_rtu_psdk = _import_sdk()
        except Exception as e:
            self.get_logger().error(f'Failed to import griger SDK: {e}')
            return

        try:
            self._sdk = Changingtek_rtu_psdk(
                self._port, self._slave_id, self._baudrate, self._timeout
            )
        except Exception as e:
            self.get_logger().error(f'Failed to create SDK on {self._port}: {e}')
            return

        try:
            if self._sdk.connect():
                self._connected = True
                self.get_logger().info(f'Connected to {self._port}')
            else:
                self.get_logger().error(f'Failed to connect to {self._port}')
                return
        except Exception as e:
            self.get_logger().error(f'Failed to connect to {self._port}: {e}')
            return

        if self._auto_enable:
            try:
                self._sdk.enable(True)
                self._enabled = True
                self.get_logger().info('Actuator enabled')
            except Exception as e:
                self.get_logger().error(f'Failed to enable actuator on {self._port}: {e}')

    def _ensure_ready(self) -> str:
        """Ensure SDK is connected and enabled. Returns 'ok' or error string."""
        if self._sdk is None or not self._connected:
            self._init_sdk()
            if not self._connected:
                return 'Not connected to gripper'
        if not self._enabled:
            try:
                self._sdk.enable(True)
                self._enabled = True
            except Exception as e:
                return f'Enable failed: {e}'
        return 'ok'

    # ===================== Calibration =====================
    def _calibrate(self) -> bool:
        """自动标定行程：检测张开极限(百分比1)和闭合极限(百分比0)。

        流程：
          1. 张开到位置 0（机械限位），记录 open_pos
          2. 闭合到 0xFFFFFFFF（力矩到位 = 夹紧到极限），记录 close_pos
          3. 回到张开位置（安全状态）

        全程持有 motion_lock，期间其它运动服务会被阻塞。
        标定时夹爪应空载（中间无物体），否则闭合极限会因夹到物体而提前触发。
        """
        if self._sdk is None or not self._connected:
            self.get_logger().error('[标定] 失败: 夹爪未连接')
            return False

        if not self._motion_lock.acquire(blocking=False):
            self.get_logger().warn('[标定] 跳过: 已有运动在进行')
            return False

        self._calibrating = True
        self._calibrated = False
        try:
            self._sdk.enable(True)
            self._enabled = True

            # 1. 张开到极限
            self.get_logger().info('[标定] 张开到极限 (目标 0)...')
            self._sdk.temp_move(0, self._speed, self._force,
                                self._accel, self._decel, True)
            self._sdk.wait_until_pos_or_torque(15.0)
            open_pos = self._sdk.feedback_position()
            self.get_logger().info(f'[标定] 张开极限 open_pos = {open_pos}')

            # 2. 闭合到极限（力矩到位）
            # 注意：目标用一个「足够大但合理」的正值（默认 100000），
            # 远超过夹爪行程（右侧~12000、左侧~949），夹爪会一直闭合到
            # 力矩到位。不能用 0xFFFFFFFF，设备会把它当作无效/负值而忽略。
            self.get_logger().info(f'[标定] 闭合到极限 (目标 {self._cal_close_target})...')
            self._sdk.temp_move(self._cal_close_target, self._speed, self._force,
                                self._accel, self._decel, True)
            self._sdk.wait_until_pos_or_torque(15.0)
            close_pos = self._sdk.feedback_position()
            self.get_logger().info(f'[标定] 闭合极限 close_pos = {close_pos}')

            # 合理性检查：闭合位置应大于张开位置（数值大=闭合）
            if close_pos <= open_pos:
                self.get_logger().error(
                    f'[标定] 行程异常: close_pos={close_pos} <= open_pos={open_pos}')
                return False

            self._cal_open_pos = open_pos
            self._cal_close_pos = close_pos
            self._calibrated = True

            # 3. 回到张开（安全状态）
            self._sdk.temp_move(open_pos, self._speed, self._force,
                                self._accel, self._decel, True)
            self._sdk.wait_until_pos_or_torque(15.0)

            self.get_logger().info(
                f'[标定] 完成: open(1)={open_pos}, close(0)={close_pos}')
            return True
        except Exception as e:
            self.get_logger().error(f'[标定] 失败: {e}')
            return False
        finally:
            self._calibrating = False
            self._motion_lock.release()

    def _percentage_to_position(self, percentage: float) -> int:
        """百分比(0=闭合, 1=张开) → 目标位置值。"""
        pct = max(0.0, min(1.0, percentage))
        open_pos = self._cal_open_pos
        close_pos = self._cal_close_pos
        # pct=0 → close_pos(闭合), pct=1 → open_pos(张开)
        return int(round(close_pos + pct * (open_pos - close_pos)))

    def _move_to(self, target: int, timeout: float = 20.0):
        """在 motion_lock 保护下运动到目标位置，返回 (result, pos_fb)。

        result 为 'position' / 'torque' / 'timeout'（来自 wait_until_pos_or_torque）。
        与标定线程通过 motion_lock 互斥，避免串口并发访问。
        """
        with self._motion_lock:
            self._is_moving = True
            try:
                self._sdk.temp_move(target, self._speed, self._force,
                                    self._accel, self._decel, True)
                res = self._sdk.wait_until_pos_or_torque(timeout)
                fb = self._sdk.feedback_position()
                return res, fb
            finally:
                self._is_moving = False

    # ===================== Status Publishing =====================
    def _publish_status(self):
        """Timer callback: publish current feedback values."""
        if self._sdk is None or not self._connected:
            return
        try:
            pos = self._sdk.feedback_position()
            torque = self._sdk.torque_reached()
            alarm = self._sdk.read_alarm()

            self._pub_status.publish(Float64(data=float(pos)))
            self._pub_torque.publish(Bool(data=torque))
            self._pub_alarm.publish(Int32(data=alarm))
        except Exception as e:
            self.get_logger().debug(f'Status read error: {e}')

    # ===================== Service Handlers =====================
    def _handle_open(self, request, response):
        """Service: open gripper to the configured open position."""
        ready = self._ensure_ready()
        if ready != 'ok':
            response.success = False
            response.message = ready
            return response

        try:
            self.get_logger().info(f'Opening to {self._open_pos}')
            res, fb = self._move_to(self._open_pos)
            response.success = True
            response.message = f'Opened: {res} (pos_fb={fb})'
            self.get_logger().info(response.message)
        except Exception as e:
            response.success = False
            response.message = f'Open error: {e}'
            self.get_logger().error(response.message)

        return response

    def _handle_close(self, request, response):
        """Service: close gripper to the configured close position."""
        ready = self._ensure_ready()
        if ready != 'ok':
            response.success = False
            response.message = ready
            return response

        try:
            self.get_logger().info(f'Closing to {self._close_pos}')
            res, fb = self._move_to(self._close_pos)
            torque_reached = self._sdk.torque_reached()
            response.success = True
            response.message = (
                f'Closed: {res} (pos_fb={fb}, torque_reached={torque_reached})'
            )
            self.get_logger().info(response.message)
        except Exception as e:
            response.success = False
            response.message = f'Close error: {e}'
            self.get_logger().error(response.message)

        return response

    def _handle_reset(self, request, response):
        """Service: reset the gripper actuator."""
        ready = self._ensure_ready()
        if ready != 'ok':
            response.success = False
            response.message = ready
            return response

        try:
            self._sdk.griger_reset()
            response.success = True
            response.message = 'Gripper reset OK'
            self.get_logger().info(response.message)
        except Exception as e:
            response.success = False
            response.message = f'Reset error: {e}'
            self.get_logger().error(response.message)

        return response

    def _handle_enable(self, request, response):
        """Service: enable or disable the actuator."""
        if self._sdk is None or not self._connected:
            response.success = False
            response.message = 'Not connected'
            return response

        try:
            self._sdk.enable(request.data)
            self._enabled = request.data
            response.success = True
            response.message = f'Enable set to {request.data}'
            self.get_logger().info(response.message)
        except Exception as e:
            response.success = False
            response.message = f'Enable error: {e}'
            self.get_logger().error(response.message)

        return response

    def _handle_grasp_check(self, request, response):
        """Service: check if an object is currently grasped.

        Returns success=True if torque has been reached (object in grasp),
        meaning the gripper did not reach the full close position and instead
        stopped due to force limit — which indicates an object is present.
        """
        if self._sdk is None or not self._connected:
            response.success = False
            response.message = 'Not connected'
            return response

        try:
            torque_reached = self._sdk.torque_reached()
            pos_fb = self._sdk.feedback_position()

            if torque_reached:
                response.success = True
                response.message = (
                    f'Grasped (torque reached, pos={pos_fb})'
                )
            else:
                response.success = False
                response.message = (
                    f'Not grasped (no torque, pos={pos_fb})'
                )
            self.get_logger().info(response.message)
        except Exception as e:
            response.success = False
            response.message = f'Grasp check error: {e}'
            self.get_logger().error(response.message)

        return response

    def _handle_percentage(self, request, response):
        """Service: 设置夹爪开合度 (0.0=闭合, 1.0=张开)。

        需要先完成自动标定；标定未完成时返回失败。
        调用本服务不会触发标定（标定只在启动时自动执行一次）。
        """
        if self._sdk is None or not self._connected:
            response.success = False
            response.message = 'Not connected'
            return response
        if self._calibrating:
            response.success = False
            response.message = 'Calibrating, please wait'
            return response
        if not self._calibrated:
            response.success = False
            response.message = 'Not calibrated yet'
            return response

        pct = max(0.0, min(1.0, float(request.percentage)))
        target = self._percentage_to_position(pct)

        try:
            self.get_logger().info(
                f'Percentage move: pct={pct:.3f} -> pos={target}')
            res, fb = self._move_to(target)
            response.success = True
            response.message = (
                f'pct={pct:.3f} -> pos={target} ({res}, pos_fb={fb})'
            )
            self.get_logger().info(response.message)
        except Exception as e:
            response.success = False
            response.message = f'Percentage error: {e}'
            self.get_logger().error(response.message)

        return response

    def _handle_calibrate(self, request, response):
        """Service: 手动触发一次行程标定（重标定）。"""
        if self._sdk is None or not self._connected:
            response.success = False
            response.message = 'Not connected'
            return response
        if self._calibrating:
            response.success = False
            response.message = 'Already calibrating'
            return response

        # 在后台线程执行，避免长时间阻塞服务回调
        threading.Thread(target=self._calibrate, daemon=True).start()
        response.success = True
        response.message = 'Calibration started in background'
        self.get_logger().info(response.message)
        return response

    # ===================== Lifecycle =====================
    def destroy_node(self):
        if self._sdk is not None:
            try:
                self._sdk.enable(False)
                self._sdk.griger_reset()
                self._sdk.disconnect()
            except Exception:
                pass
        super().destroy_node()


def main(args=None):
    rclpy.init(args=args)
    node = GripperNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        # rclpy.spin()'s SIGINT handler already calls shutdown;
        # guard against double-shutdown when launched from a launch file.
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == '__main__':
    main()
