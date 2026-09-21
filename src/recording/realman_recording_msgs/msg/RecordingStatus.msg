# Periodic, browser-safe recording health summary. Raw samples remain in the archive.
uint8 IDLE=0
uint8 COUNTDOWN=1
uint8 RECORDING=2
uint8 PAUSED=3
uint8 FINALIZING=4
uint8 EXPORTING=5
uint8 READY=6
uint8 FAILED=7
uint8 PREPARING=8
uint8 ARMED=9
uint8 SCHEDULED=10
uint8 EXPORTED=11

std_msgs/Header header
string session_id
uint8 state
float64 elapsed_sec
float64 remaining_sec
uint64 accepted_samples
uint64 dropped_samples
bool cameras_healthy
string detail
string diagnostics_json
uint64 scheduled_start_walltime_ns
# LeRobot export progress in 0.0..1.0 and the dataset directory once export completes.
float64 export_progress
string export_dir
# Non-empty only when the most recent export failed; the browser surfaces this as
# "conversion failed" instead of leaving the export panel silently idle.
string export_error
