# Fast source refresh for the dedicated Humble recording-test host.
# This is intentionally not a standalone/reproducible production build: its
# base must already contain the ROS, MCAP, LeRobot, PyTorch, Pillow, and PyArrow
# runtime installed by recording-test.Dockerfile.
ARG RECORDING_TEST_BASE=rm65-recording:test
FROM ${RECORDING_TEST_BASE}

WORKDIR /opt/rm65_ws

# Copy only recording sources/config so a test iteration does not redownload
# the large ML wheels from the full recording-test.Dockerfile. realman_msgs and
# realman_robot_driver are copied too so the Cartesian velocity telemetry (the
# driver's measured end-effector velocity) is rebuilt here rather than relying
# on the base image's possibly-stale message set.
COPY src/recording /opt/rm65_ws/src/recording
COPY src/driver/realman_msgs /opt/rm65_ws/src/driver/realman_msgs
COPY src/driver/realman_robot_driver /opt/rm65_ws/src/driver/realman_robot_driver
COPY config/ros/recording.yaml /opt/rm65_ws/config/ros/recording.yaml

RUN . /opt/ros/humble/setup.sh \
    && cd /opt/rm65_ws \
    && rm -rf build/realman_robot_driver install/realman_robot_driver \
    && colcon build --symlink-install \
        --packages-select realman_msgs realman_robot_driver realman_recording_msgs realman_recording
