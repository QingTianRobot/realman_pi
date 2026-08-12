FROM ros:humble-ros-base

# Avoid interactive package prompts during the reproducible image build.
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3-colcon-common-extensions \
        python3-yaml \
        ros-humble-ament-cmake-gtest \
        ros-humble-joint-state-publisher \
        ros-humble-joint-state-publisher-gui \
        ros-humble-joy \
        ros-humble-robot-state-publisher \
        ros-humble-rviz2 \
        ros-humble-tf2-ros \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/rm65_ws

# CMake installs the repository-root configuration into the package share
# directory. Keep this path aligned with ROOT_CONFIG_DIR in CMakeLists.txt.
COPY config /opt/rm65_ws/config
COPY src /opt/rm65_ws/src

RUN . /opt/ros/humble/setup.sh \
    && colcon build --symlink-install --packages-up-to realman_bringup \
    && colcon test --packages-select xbox_controller_driver \
    && colcon test-result --verbose

COPY docker/ros_entrypoint.sh /ros_entrypoint.sh

ENTRYPOINT ["/ros_entrypoint.sh"]
CMD ["ros2", "launch", "rm65_description", "display.launch.py"]
