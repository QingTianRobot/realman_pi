# Behavior Tree Runtime Monitor Design

## Goal

将当前可编辑的 React Flow 行为树页面改成类似 `golf-course-robot/gcr_behavior/web`
的只读运行态监视器。网页只展示生产行为树的结构和状态，不允许编辑、保存、载入、Tick、Run
或直接发送运动命令。

## Reference style

参考 `gcr_behavior/web/index.html` 和 `app.js` 的运行态布局：

- 顶部产品标识和连接状态；
- 状态条显示树名、Tick 序号、根状态和最近更新时间；
- 主区域左侧显示可折叠的行为树层级；
- 右侧显示选中节点详情和状态统计；
- 支持节点搜索、折叠/展开和暂停页面刷新；
- 使用 `IDLE`、`RUNNING`、`SUCCESS`、`FAILURE` 状态颜色。

不复制 Golf Course Robot 的测试 override、服务调用注入或行为树控制按钮。

## Runtime boundaries

- `realman_bt_executor` 仍是唯一拥有并 tick 生产行为树的进程。
- `REALMAN_BT_DRY_RUN=true` 仍为默认；只有 CLI 显式设置 `false` 才能发送真实
  `/<arm_id>/execute_motion` goal。
- 网页只读取快照，不连接 ROS Action，不改变树，不触发机械臂运动。
- `./rm65 up` 只启动驱动；`./rm65 bt [arm_id]` 负责在驱动容器中启动行为树和监视器。
- 监视器继续通过宿主网络监听 `0.0.0.0:8080`，访问地址为
  `http://<host>:8080/`。

## Data flow

```text
realman_bt_executor
  └─ 每次 tick 生成运行态快照
       └─ 原子写入 /tmp/realman-bt-workspace/runtime.json
            └─ bt_server GET /api/runtime
                 └─ runtime-monitor 前端定时读取并渲染
```

快照至少包含：协议版本、树名、单调递增序号、时间戳、根状态，以及按稳定树节点 key
索引的节点名称、注册名、类别、路径和状态。写文件使用临时文件加 rename，避免网页读到
半写入 JSON。执行器未开始或快照暂不可用时，API 返回明确的 `IDLE`/等待状态，而不是
让页面空白。

## HTTP contract

生产只读模式保留：

```text
GET /api/health
GET /api/tree/open?name=arm_move.xml
GET /api/tree/structure
GET /api/runtime
```

编辑器专用的 `POST /api/tree/load`、`/api/tree/validate`、`/api/tree/format`、
`POST /api/tree/tick`、`POST /api/tree/run`、`POST /api/tree/save` 不在生产只读模式中
暴露；后端收到这些请求返回 `405` 和只读错误信息。

## Frontend boundaries

保留现有静态资源托管和 `/api` 相对路径，替换页面组件为 Runtime Monitor：

- 删除节点面板、React Flow 拖拽/连线、属性面板、XML 预览和所有修改树的按钮；
- 页面只显示服务端提供的结构和运行态，不能从 XML 反向生成可编辑模型；
- 轮询失败显示连接错误和最后更新时间，保留最近一次有效快照；
- 页面暂停只暂停浏览器刷新，不暂停 ROS 执行器；
- 节点详情只读显示，不提供端口输入控件。

## Startup and safety

```bash
./rm65 up
REALMAN_BT_DRY_RUN=true ./rm65 bt r
```

真实动作仍需显式开启：

```bash
REALMAN_BT_DRY_RUN=false ./rm65 bt r
```

启动器在执行器启动前等待 Action Server；网页本身永远不是动作启动入口。页面的
`Ctrl-C`/浏览器关闭不停止驱动，终止行为树仍使用启动终端的 `Ctrl-C`。

## Verification

- 前端测试确认编辑器入口、拖拽、属性编辑和修改按钮不再渲染；监视器能渲染空闲、运行中、
  成功和失败快照。
- `bt_server` 测试确认 `/api/runtime` JSON 契约、原子快照读取和生产只读接口的 `405` 响应。
- ROS 执行器测试确认每次 tick 写出稳定 key、状态和序号递增，dry-run 不发送 Action。
- 运行 `npm run build`、编辑器单测、`bash -n`、`docker compose config` 和 ROS/容器构建。
- 生产冒烟：`./rm65 up` 后运行 `REALMAN_BT_DRY_RUN=true ./rm65 bt r`，浏览器只能观察，
  不会改变树或驱动机械臂。
