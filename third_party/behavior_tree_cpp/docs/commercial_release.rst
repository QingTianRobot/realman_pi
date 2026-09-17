商用发布边界
============

工程验证与法律授权是两个独立 gate。``./scripts/test.sh`` 全绿可以证明当前源码达到
工程发布条件，但不能替产品 owner 选择许可证、声明 copyright holder 或批准分发。

当前阻塞项
----------

* 仓库没有 owner 批准的根 ``LICENSE`` 文件。
* ``bt_ros2/package.xml`` 声明 ``Apache-2.0``，但 maintainer 仍是 placeholder。
* 第三方 notice inventory 已建立，但目标 source/binary 包的 notice bundle 尚未获得 owner/法务批准。

在这些事项关闭前，只能表述为 **engineering release-ready**，不能声称已经获得公开或
商业分发授权。

权威检查表与清单
----------------

* ``docs/COMMERCIAL_RELEASE_CHECKLIST.md``：工程 gate、owner/legal gate 和发布边界。
* ``THIRD_PARTY_NOTICES.md``：vendored C++、直接前端依赖和外部 ROS2 依赖清单。

边界声明
--------

Engineering can make the repository release-ready, but project licensing is a
legal/product-owner decision. The package currently claims Apache-2.0 without a
root license file. A commercial-release claim remains conditional on the owner
supplying the approved root license and maintainer identity.
