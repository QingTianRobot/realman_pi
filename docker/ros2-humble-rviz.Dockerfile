FROM ros:humble-ros-base

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3-colcon-common-extensions \
        ros-humble-joint-state-publisher-gui \
        ros-humble-robot-state-publisher \
        ros-humble-rviz2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/rm65_ws
COPY src/rm65_description /opt/rm65_ws/src/rm65_description

RUN . /opt/ros/humble/setup.sh \
    && colcon build --symlink-install --packages-select rm65_description

COPY docker/ros_entrypoint.sh /ros_entrypoint.sh

ENTRYPOINT ["/ros_entrypoint.sh"]
CMD ["ros2", "launch", "rm65_description", "display.launch.py"]
