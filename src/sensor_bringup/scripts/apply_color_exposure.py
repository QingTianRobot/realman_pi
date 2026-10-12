#!/usr/bin/env python3
"""Re-apply a fixed color exposure to one Orbbec Gemini 305 once it is streaming.

On the production devices the "color auto exposure OFF" that the driver writes
during startup does not stick: the driver log reports it applied and the exposure
register reads back the requested value, yet the sensor keeps running auto
exposure (the right camera stays ~70% saturated at 30 Hz). The same two service
calls issued after the color stream is up do work, so ``cameras_ros2.launch.py``
runs this script per wrist camera whose config sets ``auto_exposure: false``.

Order matters only in that auto exposure goes off before the exposure is set; the
exposure register reads back its value even while auto exposure is still on, so
the readback logged here confirms the write, not that auto exposure is really off.

Usage: apply_color_exposure.py --side right --exposure 43
"""

import argparse
import sys

SIDES = ("left", "middle", "right")
UNSET = -1  # driver sentinel: "no manual exposure value configured"


def build_steps(exposure):
    """Ordered (service, value) calls: auto exposure off, then the exposure value."""
    if exposure < UNSET:
        raise ValueError(f"exposure must be >= {UNSET} (got {exposure})")
    steps = [("set_color_auto_exposure", False)]
    if exposure != UNSET:
        steps.append(("set_color_exposure", exposure))
    return steps


def run_steps(steps, call, log=print):
    """Run steps in order through ``call(service, value) -> (success, message)``.

    Stops at the first failure: setting the exposure while auto exposure is still
    on would report success without doing what the config asks for.
    """
    for service, value in steps:
        success, message = call(service, value)
        if not success:
            log(f"{service}({value}) failed: {message}")
            return False
        log(f"{service}({value}) ok")
    return True


def parse_args(argv):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--side", required=True, choices=SIDES)
    parser.add_argument("--exposure", type=int, default=UNSET,
                        help="fixed exposure in 0.1 ms units; -1 only turns auto exposure off")
    parser.add_argument("--wait-timeout", type=float, default=180.0,
                        help="seconds to wait for the first color frame")
    parser.add_argument("--settle", type=float, default=3.0,
                        help="seconds to wait after the first frame before applying")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(sys.argv[1:] if argv is None else argv)
    steps = build_steps(args.exposure)

    # rclpy and the message packages are imported here so the logic above stays
    # testable without a ROS environment.
    import time

    import rclpy
    from orbbec_camera_msgs.srv import GetInt32, SetInt32
    from rclpy.qos import qos_profile_sensor_data
    from sensor_msgs.msg import Image
    from std_srvs.srv import SetBool

    rclpy.init()
    node = rclpy.create_node(f"apply_color_exposure_{args.side}")
    logger = node.get_logger()
    prefix = f"/camera_{args.side}"

    got_frame = []
    node.create_subscription(
        Image, f"{prefix}/color/image_raw", lambda _msg: got_frame.append(True),
        qos_profile_sensor_data)
    deadline = time.monotonic() + args.wait_timeout
    while not got_frame and time.monotonic() < deadline:
        rclpy.spin_once(node, timeout_sec=0.2)
    if not got_frame:
        logger.error(f"no color frame on {prefix} after {args.wait_timeout:.0f}s; exposure not applied")
        rclpy.shutdown()
        return 1

    settle_until = time.monotonic() + args.settle
    while time.monotonic() < settle_until:
        rclpy.spin_once(node, timeout_sec=0.1)

    clients = {
        "set_color_auto_exposure": (node.create_client(SetBool, f"{prefix}/set_color_auto_exposure"), SetBool),
        "set_color_exposure": (node.create_client(SetInt32, f"{prefix}/set_color_exposure"), SetInt32),
    }
    getter = node.create_client(GetInt32, f"{prefix}/get_color_exposure")

    def call(service, value):
        client, srv_type = clients[service]
        if not client.wait_for_service(timeout_sec=10.0):
            return False, "service not available"
        request = srv_type.Request()
        request.data = value
        future = client.call_async(request)
        rclpy.spin_until_future_complete(node, future, timeout_sec=10.0)
        if future.result() is None:
            return False, "no response"
        return future.result().success, future.result().message

    ok = run_steps(steps, call, log=logger.info)
    if ok and args.exposure != UNSET and getter.wait_for_service(timeout_sec=5.0):
        future = getter.call_async(GetInt32.Request())
        rclpy.spin_until_future_complete(node, future, timeout_sec=5.0)
        if future.result() is not None and future.result().data != args.exposure:
            logger.warning(f"exposure readback {future.result().data} != requested {args.exposure}")
    if ok:
        logger.info(f"{args.side}: fixed color exposure applied")
    else:
        logger.error(f"{args.side}: fixed color exposure NOT applied; camera may be overexposed")
    rclpy.shutdown()
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
