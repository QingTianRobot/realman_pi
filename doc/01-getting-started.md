# Python API 快速开始

## 1. 运行环境

官方快速开始页列出 Windows 32/64 位以及 Linux x86/arm 架构，Python 要求为 3.9 及以上。本项目使用 ROS 2 Humble Docker 时，建议在独立的 Python 环境中安装 SDK，避免把 Python SDK 依赖与 ROS 2 包依赖混在同一个工作空间里。

## 2. 安装

从 PyPI 安装：

```bash
python3 -m pip install Robotic_Arm
```

也可以获取官方二次开发包：

```bash
git clone https://github.com/RealManRobot/RM_API2.git
```

安装后按官方模块导入：

```python
from Robotic_Arm.rm_robot_interface import *
```

## 3. 建立连接

官方示例使用三线程模式、机械臂 IP `192.168.1.18` 和端口 `8080`：

```python
from Robotic_Arm.rm_robot_interface import *

robot = RoboticArm(rm_thread_mode_e.RM_TRIPLE_MODE_E)
handle = robot.rm_create_robot_arm("192.168.1.18", 8080)
print("机械臂 ID:", handle.id)
```

线程模式的选择：

| 枚举 | 适用含义 |
| --- | --- |
| `RM_SINGLE_MODE_E` | 单线程，非阻塞等待数据返回。 |
| `RM_DUAL_MODE_E` | 增加接收线程监测数据队列。 |
| `RM_TRIPLE_MODE_E` | 在双线程基础上增加 UDP 接收线程，适合同时使用实时状态推送。 |

连接真实设备前确认主机与控制器在同一网络，IP、端口和防火墙策略正确。示例中的 IP 只是官方示例，不是本项目 RM65 的固定地址。

## 4. 查询软件版本

```python
software_info = robot.rm_get_arm_software_info()
if software_info[0] == 0:
    info = software_info[1]
    print("Arm Model:", info["product_version"])
    print("Algorithm Library Version:", info["algorithm_info"]["version"])
    print("Control Layer Software Version:", info["ctrl_info"]["version"])
    print("Dynamics Version:", info["dynamic_info"]["model_version"])
    print("Planning Layer Software Version:", info["plan_info"]["version"])
else:
    print("Failed to get arm software information, error:", software_info[0])
```

Python 接口通常以 `(返回码, 数据)` 或整数返回。必须先判断返回码，再读取数据；不要把非零错误码当成有效的状态对象。通用返回码见[官方示例、错误码与版本](11-examples-errors-and-versions.md)。

## 5. 资源释放与错误处理

完成一次测试后删除对应句柄；程序退出时关闭全部连接：

```python
robot.rm_delete_robot_arm(handle.id)
robot.rm_destroy()
```

建议将创建句柄、业务调用和释放动作放入 `try/finally`，并为真实机械臂增加急停、轨迹停止和异常恢复策略。Python SDK 的错误结构体为 `rm_err_t`，包含错误数量和错误码数组；具体错误码应以[官方 API2 错误码表](https://develop.realman-robotics.com/robot/apierrorList2/)为准。

## 6. 仿真和日志

`ArmRobotic` 提供真实/仿真运行模式查询与设置，以及日志保存接口。开发阶段可以先验证调用流程，再在低速、清空工作区且有急停条件的情况下连接真实设备。日志应与测试时间、IP、机械臂型号和调用返回码一起记录。

## 7. 最小测试清单

1. 确认 Python 版本、SDK 安装和模块导入成功。
2. 确认 IP/端口可达，创建句柄返回成功。
3. 查询型号和软件版本，确认与目标机械臂匹配。
4. 先只读状态，再在仿真或安全低速条件下发送运动命令。
5. 无论成功或异常都释放句柄并销毁连接。

官方来源：[快速开始](https://develop.realman-robotics.com/robot/apipython/getStarted/)、[机械臂连接控制](https://develop.realman-robotics.com/robot/apipython/classes/roboticArm/)。
