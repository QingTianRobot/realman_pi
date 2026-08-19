# Waypoint command constants
uint8 MOVEJ=0
uint8 MOVEL=1
uint8 MOVEJ_P=2

uint8 command
float64[6] joint_degrees
float64[3] pose_position_m
float64[4] pose_quaternion_wxyz
uint32 velocity_percent
uint32 blend_radius_percent
