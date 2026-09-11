import json
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from .scenario import normalize_mode_request

class MockControlModeSourceNode(Node):
    def __init__(self):
        super().__init__('mock_control_mode_source'); self.declare_parameter('mode','web'); self.declare_parameter('owner_id','mock-web'); self.pub=self.create_publisher(String,'/realman/mock/control_mode_request',10); self.timer=self.create_timer(0.1,self.publish_request)
    def publish_request(self):
        try: payload=normalize_mode_request(str(self.get_parameter('mode').value),str(self.get_parameter('owner_id').value))
        except ValueError as error: self.get_logger().warning(str(error)); payload={'mode':'none','owner_id':''}
        msg=String(); msg.data=json.dumps(payload); self.pub.publish(msg)
def main(args=None):
    rclpy.init(args=args); node=MockControlModeSourceNode()
    try:rclpy.spin(node)
    finally:node.destroy_node(); rclpy.shutdown()
