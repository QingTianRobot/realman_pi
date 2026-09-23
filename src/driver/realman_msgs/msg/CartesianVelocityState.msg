# Reference type constants share the CartesianVelocity action vocabulary.
uint8 BASE=0
uint8 WORK=1
uint8 TOOL=2

std_msgs/Header header
bool session_active
uint8 reference_type
string reference_name
string command_frame_id
float64[3] commanded_linear_velocity_mps
float64[3] commanded_angular_velocity_radps
float64[3] limited_linear_velocity_mps
float64[3] limited_angular_velocity_radps
string measured_frame_id
float64[3] measured_linear_velocity_mps
float64[3] measured_angular_velocity_radps
bool measured_valid
uint32 command_age_ms
uint32 measured_age_ms
