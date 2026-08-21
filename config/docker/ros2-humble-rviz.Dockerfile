# Compose defaults this to a DaoCloud Docker Hub proxy for faster pulls in
# mainland China. Override ROS_BASE_IMAGE=ros:humble-ros-base to use Docker Hub.
ARG ROS_BASE_IMAGE=docker.m.daocloud.io/library/ros:humble-ros-base
FROM ${ROS_BASE_IMAGE}

# These build arguments intentionally remain replaceable for private mirrors or
# official upstreams. Mirror URLs must not end with a slash.
ARG UBUNTU_APT_MIRROR=https://mirrors.aliyun.com/ubuntu
ARG UBUNTU_PORTS_APT_MIRROR=https://mirrors.aliyun.com/ubuntu-ports
ARG ROS2_APT_MIRROR=https://mirrors.tuna.tsinghua.edu.cn/ros2/ubuntu
ARG PYPI_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple

# Avoid interactive package prompts during the reproducible image build.
ENV DEBIAN_FRONTEND=noninteractive

# Rewrite both classic .list and deb822 .sources files so amd64 and arm64
# builders use the selected Ubuntu/ROS mirrors. Retries tolerate transient
# mirror resets without hiding a persistent package or signature error.
RUN find -L /etc/apt -type f \( -name '*.list' -o -name '*.sources' \) \
        -exec sed -i --follow-symlinks -E \
          -e "s#https?://(archive|security).ubuntu.com/ubuntu#${UBUNTU_APT_MIRROR}#g" \
          -e "s#https?://ports.ubuntu.com/ubuntu-ports#${UBUNTU_PORTS_APT_MIRROR}#g" \
          -e "s#https?://packages.ros.org/ros2/ubuntu#${ROS2_APT_MIRROR}#g" \
          -e 's#^Types: deb deb-src$#Types: deb#g' \
          {} + \
    && apt-get -o Acquire::Retries=5 -o Acquire::https::Timeout=30 update \
    && apt-get -o Acquire::Retries=5 -o Acquire::https::Timeout=30 \
        install -y --no-install-recommends \
        python3-colcon-common-extensions \
        python3-pip \
        python3-pytest \
        python3-aiohttp \
        python3-numpy \
        python3-opencv \
        python3-yaml \
        ros-humble-ament-cmake-gtest \
        ros-humble-ament-cmake-pytest \
        ros-humble-diagnostic-msgs \
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

# Install the pinned vendor API used by the real driver. Mock tests still avoid
# importing it, while production launches can read real controller state.
RUN python3 -m pip install --no-cache-dir \
        --index-url "${PYPI_INDEX_URL}" \
        --retries 5 \
        --timeout 60 \
        --requirement /opt/rm65_ws/config/python/realman-sdk-requirements.txt

RUN . /opt/ros/humble/setup.sh \
    && colcon build --symlink-install \
        --packages-up-to realman_bringup realman_robot_driver realman_msgs realman_web_control realman_camera_calibration \
    && colcon test --packages-select xbox_controller_driver realman_robot_driver realman_bringup realman_msgs realman_web_control realman_camera_calibration \
    && colcon test-result --verbose

COPY docker/ros_entrypoint.sh /ros_entrypoint.sh

ENTRYPOINT ["/ros_entrypoint.sh"]
CMD ["ros2", "launch", "rm65_description", "display.launch.py"]
