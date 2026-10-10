# Compose defaults this to a DaoCloud Docker Hub proxy for faster pulls in
# mainland China. Override ROS_BASE_IMAGE=ros:humble-ros-base to use Docker Hub.
ARG ROS_BASE_IMAGE=docker.m.daocloud.io/library/ros:humble-ros-base

# Node is confined to this stage. The runtime image receives only the static
# editor files, keeping the driver container free of npm and dev-server state.
FROM node:22-bookworm AS bt_editor_build
# Replaceable like the other mirrors; registry.npmjs.org times out from the
# production robot network. Must not end with a slash.
ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV npm_config_registry=${NPM_REGISTRY}
WORKDIR /opt/bt_editor
COPY third_party/behavior_tree_cpp/bt_editor/package.json third_party/behavior_tree_cpp/bt_editor/package-lock.json ./
RUN npm ci
COPY third_party/behavior_tree_cpp/bt_editor ./
# vite.config.ts imports this shared repository-root setting. The Node build
# stage has its own filesystem, so provide the exact /config path resolved by
# ../../../config/behavior-tree/frontend from /opt/bt_editor.
COPY config/behavior-tree /config/behavior-tree
RUN npm run build

FROM ${ROS_BASE_IMAGE}

# These build arguments intentionally remain replaceable for private mirrors or
# official upstreams. Mirror URLs must not end with a slash.
ARG UBUNTU_APT_MIRROR=https://mirrors.aliyun.com/ubuntu
ARG UBUNTU_PORTS_APT_MIRROR=https://mirrors.aliyun.com/ubuntu-ports
ARG ROS2_APT_MIRROR=https://mirrors.tuna.tsinghua.edu.cn/ros2/ubuntu
ARG PYPI_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple

# Optional HTTP(S) proxy for pip during the image build. Robot networks often
# cannot reach files.pythonhosted.org directly (read timeouts); a local proxy
# (e.g. Clash on 127.0.0.1) routes those downloads reliably. Empty by default.
ARG HTTP_PROXY
ARG HTTPS_PROXY
ENV HTTP_PROXY=${HTTP_PROXY} HTTPS_PROXY=${HTTPS_PROXY}

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
        ffmpeg \
        cmake \
        curl \
        ros-humble-ament-cmake-gtest \
        ros-humble-ament-cmake-pytest \
        ros-humble-rosbag2-storage-mcap \
        ros-humble-diagnostic-msgs \
        ros-humble-joint-state-publisher \
        ros-humble-joint-state-publisher-gui \
        ros-humble-joy \
        ros-humble-robot-state-publisher \
        ros-humble-rviz2 \
        ros-humble-tf2-ros \
    && rm -rf /var/lib/apt/lists/*

# Prefer IPv4 for DNS resolution.  Robot LANs frequently have no public IPv6
# route, yet some resolvers return AAAA-first for pypi.org/files.pythonhosted.org;
# the default getaddrinfo sort then hangs pip on an unreachable IPv6 address.
RUN echo "precedence ::ffff:0:0/96  100" >> /etc/gai.conf

WORKDIR /opt/rm65_ws

# CMake installs the repository-root configuration into the package share
# directory. Keep this path aligned with ROOT_CONFIG_DIR in CMakeLists.txt.
# Config is copied before the pip layers because they read requirements files
# from it; the source copy is deferred until after pip so a source-only change
# does not invalidate the (large) torch/Robotic_Arm/etc. downloads.
COPY config /opt/rm65_ws/config

# Install CPU-only PyTorch for the recording/export runtime. The recording image
# does not need CUDA; training images may install their own GPU build separately.
RUN python3 -m pip install --no-cache-dir \
        --index-url "https://download.pytorch.org/whl/cpu" \
        --retries 5 \
        --timeout 300 \
        torch==2.6.0+cpu torchvision==0.21.0+cpu

# Recording deps (lerobot/pyarrow/Pillow/setuptools) resolve entirely from
# PYPI_INDEX_URL. Keep the pypi.org --extra-index-url off this step so pip never
# round-trips to files.pythonhosted.org for them and stalls the image build.
RUN python3 -m pip install --no-cache-dir \
        --index-url "${PYPI_INDEX_URL}" \
        --retries 5 \
        --timeout 300 \
        --requirement /opt/rm65_ws/config/python/recording-requirements.txt

# Install the pinned vendor API used by the real driver. Mock tests still avoid
# importing it, while production launches can read real controller state.
# Chinese PyPI mirrors (Tsinghua/Aliyun/USTC/Tencent/Huawei/NJU) currently only
# carry Robotic_Arm up to 1.0.6, but this project is aligned with vendor API
# V1.7.13 and requires 1.1.6. Fall back to official pypi.org for this single
# pure-Python wheel.
RUN python3 -m pip install --no-cache-dir \
        --index-url "${PYPI_INDEX_URL}" \
        --extra-index-url "https://pypi.org/simple" \
        --retries 5 \
        --timeout 300 \
        --requirement /opt/rm65_ws/config/python/realman-sdk-requirements.txt

# Custom CasADi + IPOPT inverse kinematics (Pinocchio for FK). Large wheels;
# give the download the same long timeout as the other pip layers.
RUN python3 -m pip install --no-cache-dir --index-url "${PYPI_INDEX_URL}" --extra-index-url "https://pypi.org/simple" --retries 5 --timeout 300 --requirement /opt/rm65_ws/config/python/ik-requirements.txt

RUN python3 -m pip install --no-cache-dir \
        --index-url "${PYPI_INDEX_URL}" \
        --retries 5 \
        --timeout 300 \
        --requirement /opt/rm65_ws/config/python/gripper-requirements.txt

# Transport deps (msgpack + websockets) for the vendored OpenPI policy client
# used by policy_bridge.
RUN python3 -m pip install --no-cache-dir \
        --index-url "${PYPI_INDEX_URL}" \
        --retries 5 \
        --timeout 300 \
        --requirement /opt/rm65_ws/config/python/policy-bridge-requirements.txt

# Source and the behavior-tree runtime land after the pip layers so a source-only
# change invalidates only the colcon build while the pip downloads stay cached.
COPY src /opt/rm65_ws/src
COPY third_party/behavior_tree_cpp /opt/rm65_ws/src/behavior_tree_cpp
RUN mkdir -p /opt/rm65_ws/third_party && ln -s /opt/rm65_ws/src/behavior_tree_cpp /opt/rm65_ws/third_party/behavior_tree_cpp

# Build the preview-only HTTP server independently of ROS packages. Its editor
# files are copied from the Node build stage and served from one origin.
RUN cmake -S /opt/rm65_ws/src/behavior_tree_cpp -B /opt/rm65_ws/behavior_tree/build \
        -DBT_BUILD_NODES=OFF \
        -DBT_BUILD_SERVER=ON \
        -DBT_BUILD_TESTS=OFF \
        -DBT_BUILD_EXAMPLES=OFF \
    && cmake --build /opt/rm65_ws/behavior_tree/build --target bt_server \
    && install -D -m 0755 /opt/rm65_ws/behavior_tree/build/bin/bt_server /opt/rm65_ws/behavior_tree/bin/bt_server

RUN . /opt/ros/humble/setup.sh \
    && colcon build --symlink-install \
        --packages-up-to realman_bringup realman_robot_driver realman_msgs realman_web_control realman_camera_calibration gripper_ros2 gripper_ros2_msgs realman_bt realman_bt_mock realman_recording realman_recording_msgs policy_bridge \
    && colcon test --packages-select xbox_controller_driver realman_robot_driver realman_bringup realman_msgs realman_web_control realman_camera_calibration gripper_ros2 gripper_ros2_msgs realman_bt realman_bt_mock realman_recording realman_recording_msgs policy_bridge \
    && colcon test-result --verbose

COPY --from=bt_editor_build /opt/bt_editor/dist /opt/rm65_ws/behavior_tree/editor-dist
COPY docker/ros_entrypoint.sh /ros_entrypoint.sh
COPY docker/bt_container_entrypoint.sh /usr/local/bin/bt-start
COPY docker/bt_runtime_result.py /usr/local/libexec/bt-runtime-result
RUN chmod +x /ros_entrypoint.sh /usr/local/bin/bt-start /usr/local/libexec/bt-runtime-result

ENTRYPOINT ["/ros_entrypoint.sh"]
CMD ["ros2", "launch", "rm65_description", "display.launch.py"]
