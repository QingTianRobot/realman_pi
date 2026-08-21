cmake_minimum_required(VERSION 3.10)
project(realman_msgs)

find_package(ament_cmake REQUIRED)
find_package(action_msgs REQUIRED)
find_package(rosidl_default_generators REQUIRED)

rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/MotionWaypoint.msg"
  "action/CartesianVelocity.action"
  "action/ExecuteMotion.action"
  "action/ExecuteTrajectory.action"
  "srv/SelectFrame.srv"
  "srv/VerifyCoordinates.srv"
  "srv/GetCurrentPose.srv"
  "srv/ForwardKinematics.srv"
  "srv/SolveIk.srv"
  "srv/RecoverMotion.srv"
  "srv/CaptureCalibrationSample.srv"
  "srv/SolveCalibration.srv"
  DEPENDENCIES action_msgs
)

install(DIRECTORY action msg srv
  DESTINATION share/${PROJECT_NAME}
)

install(FILES resource/${PROJECT_NAME}
  DESTINATION share/ament_index/resource_index/packages
)

ament_export_dependencies(rosidl_default_runtime)

if(BUILD_TESTING)
  find_package(ament_cmake_pytest REQUIRED)
  ament_add_pytest_test(test_interface_files test/test_interface_files.py)
endif()

ament_package()
