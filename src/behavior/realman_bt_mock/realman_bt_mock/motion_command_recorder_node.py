import json
from pathlib import Path
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
class MotionCommandRecorderNode(Node):
    def __init__(self):
        super().__init__('motion_command_recorder'); self.declare_parameter('record_file',''); self.sub=self.create_subscription(String,'/realman/mock/motion_command',self.record,10)
    def record(self,msg):
        path=str(self.get_parameter('record_file').value)
        if path:
            with Path(path).open('a',encoding='utf-8') as stream: stream.write(json.dumps({'data':msg.data})+'\n')
def main(args=None):
    rclpy.init(args=args); node=MotionCommandRecorderNode()
    try:rclpy.spin(node)
    finally:node.destroy_node(); rclpy.shutdown()
