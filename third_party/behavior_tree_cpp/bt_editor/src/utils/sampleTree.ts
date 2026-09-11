/**
 * 内置示例行为树
 *
 * 提供一棵开箱即用的示例树，用户点击"载入示例"即可填充画布。
 * 标签名严格使用 bt_nodes 插件**真实注册**的节点（Sequence/Fallback/Inverter/
 * Retry/PrintMessage/AlwaysSuccess/AlwaysFailure），保证"载入到服务器"能成功
 * 构建并 Tick 运行——而不仅是前端能画出来。
 *
 * 语义：
 *   Sequence(根)
 *   ├── PrintMessage "开始巡逻"          → 打印并成功
 *   ├── Fallback                          先试失败分支，再走兜底
 *   │   ├── Inverter > AlwaysSuccess      AlwaysSuccess 取反 = FAILURE
 *   │   └── PrintMessage "走兜底分支"     兜底成功
 *   └── Retry(num_attempts=2) > AlwaysSuccess  重试包裹，立即成功
 */

export const SAMPLE_TREE_XML = `<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Sequence name="巡逻序列">
      <PrintMessage message="开始巡逻"/>
      <Fallback name="选择分支">
        <Inverter>
          <AlwaysSuccess/>
        </Inverter>
        <PrintMessage message="走兜底分支"/>
      </Fallback>
      <Retry num_attempts="2">
        <AlwaysSuccess/>
      </Retry>
    </Sequence>
  </BehaviorTree>
</root>`;
