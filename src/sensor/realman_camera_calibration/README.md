# realman_camera_calibration

这是 RealMan 三相机 ChArUco 手眼标定功能包，放在 `src/sensor/` 下，与厂商
Orbbec/RealSense 源码隔离。标定板参数、相机话题、TF 帧和误差门槛统一由
仓库根目录的 `config/ros/camera_calibration.yaml` 管理。

当前提供两个 ROS 2 service，不会发布未经验证的外参 TF：

- `/camera_calibration/capture_sample`：三臂原子检测 ChArUco、读取末端 TF、保存图像和样本 JSON；
- `/camera_calibration/solve`：必须三臂都达到样本数和残差阈值，计算三套手眼结果及相对位姿；
- `/camera_calibration/diagnostics`：发布每路图像和 CameraInfo 输入状态。

采样请求是三臂原子的：三路图像必须在时间偏差、消息新鲜度、ChArUco 角点和
末端 TF 检查中全部通过，才会提交这一批 PNG/JSON 文件。写文件失败时会清理
临时批次目录，不把不完整批次加入求解器。节点重启后可以继续磁盘中已有的
`session-...` 会话，只需在请求中填写该 `session_id`。

默认要求每臂至少 30 张姿态分散的图像，但没有采样上限。求解会使用当前会话
中的全部样本；增加不同平移和旋转姿态比在同一静止姿态重复拍摄更有效。

启动：

```bash
source /opt/ros/humble/setup.bash
source install/setup.bash
export REALMAN_CONFIG_ROOT=$PWD/config
run_dir="$PWD/logs/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$run_dir"
ROS_LOG_DIR="$run_dir" RCUTILS_COLORIZED_OUTPUT=1 \
  ros2 launch realman_camera_calibration camera_calibration.launch.py
```

调用 service：

```bash
ros2 service call /camera_calibration/capture_sample \
  realman_msgs/srv/CaptureCalibrationSample \
  "{session_id: '', start_new_session: true, arm_ids: [l, m, r]}"

ros2 service call /camera_calibration/solve \
  realman_msgs/srv/SolveCalibration "{session_id: 'session-...'}"
```

输出结果写入 `REALMAN_LOG_ROOT/camera_calibration/<session_id>/`，不要写入只读的
`config/` 挂载。目录中包含每个样本的 PNG/JSON 和成功求解后的
`calibration_result.json`。当前不会自动发布静态 TF；应先人工审核残差和相对
位姿，再将结果接入生产 TF 发布流程。

默认情况下求解成功会把中、右臂相对左臂的位姿写回
`config/ros/three_robots.yaml`，左臂保持为布局锚点，并生成 `.bak` 备份。设置
`REALMAN_UPDATE_LAYOUT_AFTER_CALIBRATION=false` 或 launch 参数
`update_layout_after_solve:=false` 可以关闭写回。
