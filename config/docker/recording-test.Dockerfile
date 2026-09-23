# Reproducible overlay for the standalone recording-test workspace.
# Production Compose uses the full ros2-humble-rviz.Dockerfile; this smaller
# overlay starts from that ROS/driver image and adds the recorder runtime so the
# test deployment cannot silently miss MCAP or LeRobot dependencies.
ARG RECORDING_BASE_IMAGE=rm65-humble-rviz:local
FROM ${RECORDING_BASE_IMAGE}

ARG PYPI_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
# Large CPU-only ML wheels may pause while mirrors redirect to upstream; allow
# a longer per-connection read timeout, overridable for restricted networks.
ARG PIP_NETWORK_TIMEOUT=300

WORKDIR /opt/rm65_ws

# Keep the test image source and runtime config aligned with the checked-in
# workspace rather than relying on packages copied into an older base image.
COPY src/recording /opt/rm65_ws/src/recording
COPY src/driver/realman_msgs /opt/rm65_ws/src/driver/realman_msgs
COPY src/driver/realman_robot_driver /opt/rm65_ws/src/driver/realman_robot_driver
COPY config/ros/recording.yaml /opt/rm65_ws/config/ros/recording.yaml

# MCAP is the recorder's only durable state archive backend. LeRobot's PyTorch
# runtime is CPU-only here; training hosts can use their own GPU environment.
RUN apt-get -o Acquire::Retries=5 -o Acquire::https::Timeout=30 update \
    && apt-get -o Acquire::Retries=5 -o Acquire::https::Timeout=30 \
        install -y --no-install-recommends \
        ffmpeg \
        ros-humble-rosbag2-storage-mcap \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install --no-cache-dir \
        --index-url https://download.pytorch.org/whl/cpu \
        --retries 5 \
        --timeout "${PIP_NETWORK_TIMEOUT}" \
        torch==2.6.0+cpu torchvision==0.21.0+cpu

# Keep this COPY after OS/PyTorch setup: editing Python package constraints
# should not force Docker to redownload the large base tooling layers.
COPY config/python/recording-requirements.txt /opt/rm65_ws/config/python/recording-requirements.txt

RUN python3 -m pip install --no-cache-dir \
        --index-url "${PYPI_INDEX_URL}" \
        --extra-index-url https://pypi.org/simple \
        --retries 5 \
        --timeout "${PIP_NETWORK_TIMEOUT}" \
        --requirement /opt/rm65_ws/config/python/recording-requirements.txt \
        pyarrow

RUN . /opt/ros/humble/setup.sh \
    && cd /opt/rm65_ws \
    && rm -rf build/realman_robot_driver install/realman_robot_driver \
    && colcon build --symlink-install \
        --packages-select realman_msgs realman_robot_driver realman_recording_msgs realman_recording
