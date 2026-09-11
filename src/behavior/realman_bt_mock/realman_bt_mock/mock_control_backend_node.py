import rclpy
from rclpy.node import Node
from std_msgs.msg import String
class MockControlBackendNode(Node):
    def __init__(self):
        super().__init__('mock_control_backend'); self.declare_parameter('healthy',True); self.pub=self.create_publisher(String,'/realman/mock/backend_state',10); self.timer=self.create_timer(0.2,self.publish_state)
    def publish_state(self):
        msg=String(); msg.data='healthy' if bool(self.get_parameter('healthy').value) else 'unhealthy'; self.pub.publish(msg)
def main(args=None):
    rclpy.init(args=args); node=MockControlBackendNode()
    try:rclpy.spin(node)
    finally:node.destroy_node(); rclpy.shutdown()
