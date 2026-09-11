# Third-Party Dependency Inventory

This file is an engineering inventory, not a legal opinion or a substitute for the full license texts required by a particular distribution.

## Vendored C++ Sources

| Component | Version | License | Repository evidence | Use |
|---|---:|---|---|---|
| tinyxml2 | 10.0.0 | zlib | License notice at the top of `third_party/tinyxml2.h`; version constants in the same file | Compiled into `bt_core` for XML parsing/serialization |
| cpp-httplib | 0.15.3 | MIT | Copyright/license identifier and version at the top of `third_party/httplib.h` | Header-only HTTP server used by `bt_server` |
| GoogleTest/GoogleMock | 1.15.2 | BSD-3-Clause | `third_party/googletest/LICENSE` and version in its root `CMakeLists.txt` | Test-only; excluded from installed project targets |

The tinyxml2 and cpp-httplib notices embedded in source files must remain intact. Before binary or source distribution, the owner/legal reviewer must decide how their complete license texts and notices are bundled with artifacts.

## Direct Frontend Dependencies

Versions and license identifiers below come from `bt_editor/package-lock.json`:

| Component | Version | License | Scope |
|---|---:|---|---|
| React | 18.3.1 | MIT | Runtime |
| React DOM | 18.3.1 | MIT | Runtime |
| React Flow | 11.11.4 | MIT | Runtime |
| Playwright Test | 1.61.1 | Apache-2.0 | Development/test |
| React type definitions | 18.3.31 | MIT | Development/type checking |
| React DOM type definitions | 18.3.7 | MIT | Development/type checking |
| Vite React plugin | 4.7.0 | MIT | Development/build |
| jsdom | 25.0.1 | MIT | Development/test |
| TypeScript | 5.9.3 | Apache-2.0 | Development/type checking |
| Vite | 5.4.21 | MIT | Development/build |
| Vitest | 3.2.4 | MIT | Development/test |

The lockfile is the authoritative full npm dependency graph and includes license identifiers for transitive packages. A release process must generate and review a complete notice bundle from the exact locked graph; this summary alone is not that bundle.

## Documentation Dependency

| Component | Declared version | License | Repository evidence | Scope |
|---|---:|---|---|---|
| Sphinx | `>=7.4,<8` | BSD-2-Clause | Version constraint in `docs/requirements.txt`; upstream distribution license must be included when redistributed | Documentation build |

## External ROS2 Dependencies

`bt_ros2/package.xml` declares ROS2 packages such as `rclcpp`, `rclcpp_action`, `std_msgs`, `sensor_msgs`, `std_srvs`, launch packages, and ament test tools. They are not vendored here. A downstream ROS2 distribution must comply with the licenses of the exact ROS distribution and packages it ships.

## Project License Gap

There is currently no owner-approved root `LICENSE`. `bt_ros2/package.xml` contains an Apache-2.0 identifier and placeholder maintainer metadata, but those fields do not create or prove authority to license the repository. See `docs/COMMERCIAL_RELEASE_CHECKLIST.md` before any public or commercial distribution.
