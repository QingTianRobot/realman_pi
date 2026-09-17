/**
 * XML 转换工具
 *
 * 负责画布模型（React Flow 节点 + 连线）与项目 XML 格式之间的双向转换。
 *
 * XML 格式（兼容 BehaviorTree.CPP / Groot，见 API_CONTRACT）：
 *   <root main_tree_to_execute="MainTree">
 *     <BehaviorTree ID="MainTree">
 *       <Sequence name="root">
 *         <MyAction msg="hello"/>        字面量端口值
 *         <MoveTo target="{goal}"/>      {k} = 重映射到黑板 key
 *       </Sequence>
 *     </BehaviorTree>
 *   </root>
 *
 * 约定：
 * - 标签名 = 节点注册名（registration_name）
 * - name 属性 = 实例名（保留属性，非端口）
 * - 其余属性 = 端口值（"{k}" 为黑板重映射，否则字面量）
 */

import type {
  BtNode,
  BtEdge,
  BtNodeData,
  NodeKind,
  NodeManifest,
} from '../types';

// ---------------------------------------------------------------------------
// 内部：树结构辅助
// ---------------------------------------------------------------------------

/** 由画布的 nodes/edges 构建 "父 → 子 id 列表" 的邻接表，子按 x 坐标排序（左→右） */
function buildChildrenMap(
  nodes: BtNode[],
  edges: BtEdge[],
): Map<string, string[]> {
  const posById = new Map(nodes.map((n) => [n.id, n.position.x]));
  const childrenMap = new Map<string, string[]>();
  for (const e of edges) {
    const list = childrenMap.get(e.source) ?? [];
    list.push(e.target);
    childrenMap.set(e.source, list);
  }
  // 同一父节点下的多个子节点，按 x 坐标从左到右排序，保证 XML 顺序符合视觉顺序
  for (const list of childrenMap.values()) {
    list.sort((a, b) => (posById.get(a) ?? 0) - (posById.get(b) ?? 0));
  }
  return childrenMap;
}

/** 找出根节点 id（没有任何入边的节点）。多个/零个时返回 null 表示树不合法。 */
export function findRootId(nodes: BtNode[], edges: BtEdge[]): string | null {
  if (nodes.length === 0) return null;
  const hasParent = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !hasParent.has(n.id));
  return roots.length === 1 ? roots[0].id : null;
}

/**
 * 计算画布树的 DFS 前序节点 id 序列。
 *
 * 顺序与 exportToXml 完全一致（同一 buildChildrenMap：子节点按 x 坐标左→右），
 * 也与后端 XmlParser 构树 + Tree::visitNodes 的前序遍历一致。因此该序列的第 i 个
 * id，恰好对应后端 tick 返回的第 i 个节点（后端按其内部 id 升序即前序返回）。
 * 这是「编辑器 nX 」与「后端数字 id」之间唯一稳定的对应关系——用它做运行态匹配，
 * 避免两套 id 空间直接比较导致上色失效。
 *
 * @returns 前序 id 数组；树不合法（无唯一根）时返回空数组。
 */
export function dfsPreorderIds(nodes: BtNode[], edges: BtEdge[]): string[] {
  const rootId = findRootId(nodes, edges);
  if (rootId === null) return [];
  const childrenMap = buildChildrenMap(nodes, edges);
  const order: string[] = [];
  const visited = new Set<string>();
  function visit(id: string): void {
    if (visited.has(id)) return; // 防御环（正常树不会有）
    visited.add(id);
    order.push(id);
    for (const cid of childrenMap.get(id) ?? []) visit(cid);
  }
  visit(rootId);
  return order;
}

/** XML 属性值转义（处理 & < > " 等特殊字符） */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// 导出：画布模型 → XML 文本
// ---------------------------------------------------------------------------

/**
 * 把画布序列化为项目 XML。
 * @throws 当不存在唯一根节点时抛错，提示用户先整理树结构。
 */
export function exportToXml(
  nodes: BtNode[],
  edges: BtEdge[],
  treeId = 'MainTree',
): string {
  const rootId = findRootId(nodes, edges);
  if (rootId === null) {
    throw new Error('导出失败：树必须有且仅有一个根节点（无入边的节点）');
  }
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const childrenMap = buildChildrenMap(nodes, edges);

  // 递归把单个节点渲染为带缩进的 XML 片段
  function renderNode(id: string, indent: string): string {
    const node = nodeById.get(id);
    if (!node) return '';
    const data = node.data;
    const tag = data.registrationName;

    // 组装属性：实例名 + 各端口值（空值不输出）
    const attrs: string[] = [];
    if (data.instanceName) {
      attrs.push(`name="${escapeAttr(data.instanceName)}"`);
    }
    for (const [portName, portValue] of Object.entries(data.portValues)) {
      if (portValue !== '') {
        attrs.push(`${portName}="${escapeAttr(portValue)}"`);
      }
    }
    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    const children = childrenMap.get(id) ?? [];
    if (children.length === 0) {
      // 叶子或暂无子节点：自闭合标签
      return `${indent}<${tag}${attrStr}/>`;
    }
    // 有子节点：展开
    const childXml = children
      .map((cid) => renderNode(cid, indent + '  '))
      .join('\n');
    return `${indent}<${tag}${attrStr}>\n${childXml}\n${indent}</${tag}>`;
  }

  const body = renderNode(rootId, '    ');
  return [
    `<root main_tree_to_execute="${escapeAttr(treeId)}">`,
    `  <BehaviorTree ID="${escapeAttr(treeId)}">`,
    body,
    `  </BehaviorTree>`,
    `</root>`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// 导入：XML 文本 → 画布模型
// ---------------------------------------------------------------------------

/** 自动布局参数 */
const NODE_X_GAP = 220; // 兄弟节点水平间距
const NODE_Y_GAP = 140; // 层级垂直间距

/**
 * 解析 XML 并生成画布的 nodes/edges。
 *
 * @param xml      项目 XML 文本
 * @param manifests 节点 manifest 列表，用于查询节点 kind 与端口声明
 * @returns        画布节点与连线；解析失败时抛错
 */
export function importFromXml(
  xml: string,
  manifests: NodeManifest[],
): { nodes: BtNode[]; edges: BtEdge[] } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  // DOMParser 出错时会塞一个 <parsererror> 节点
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('XML 解析失败：' + parseError.textContent);
  }

  // 定位 <BehaviorTree> 下的第一个真实节点元素作为树根
  const btElem = doc.querySelector('BehaviorTree');
  if (!btElem) {
    throw new Error('XML 缺少 <BehaviorTree> 节点');
  }
  const rootElem = Array.from(btElem.children).find(
    (c) => c.nodeType === 1,
  );
  if (!rootElem) {
    throw new Error('<BehaviorTree> 内没有任何节点');
  }

  // manifest 快查表：注册名 → manifest
  const manifestByName = new Map(
    manifests.map((m) => [m.registration_name, m]),
  );

  const nodes: BtNode[] = [];
  const edges: BtEdge[] = [];
  let idSeq = 0;
  // 记录每一层当前已使用的水平偏移，避免兄弟节点重叠
  const xCursorByDepth = new Map<number, number>();

  /** 根据注册名推断节点大类：优先用 manifest，未知时回退到结构推断 */
  function resolveKind(regName: string, childCount: number): NodeKind {
    const m = manifestByName.get(regName);
    if (m) return m.type;
    if (childCount === 0) return 'Action';
    if (childCount === 1) return 'Decorator';
    return 'Control';
  }

  // 深度优先遍历 XML 元素，构建节点与父子连线
  function walk(elem: Element, depth: number, parentId: string | null): void {
    const regName = elem.tagName;
    const childElems = Array.from(elem.children).filter(
      (c) => c.nodeType === 1,
    );
    const kind = resolveKind(regName, childElems.length);
    const manifest = manifestByName.get(regName);

    // 拆分属性：name 为实例名，其余为端口值
    const portValues: Record<string, string> = {};
    let instanceName = '';
    for (const attr of Array.from(elem.attributes)) {
      if (attr.name === 'name') {
        instanceName = attr.value;
      } else {
        portValues[attr.name] = attr.value;
      }
    }

    // 水平布局：每层用游标累加，保证不重叠
    const x = xCursorByDepth.get(depth) ?? 0;
    xCursorByDepth.set(depth, x + NODE_X_GAP);

    const id = `n${idSeq++}`;
    const data: BtNodeData = {
      registrationName: regName,
      kind,
      instanceName,
      portValues,
      portManifests: manifest ? manifest.ports : [],
      runStatus: 'IDLE',
    };
    nodes.push({
      id,
      type: 'btNode',
      position: { x, y: depth * NODE_Y_GAP },
      data,
    });

    if (parentId !== null) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
      });
    }

    for (const child of childElems) {
      walk(child, depth + 1, id);
    }
  }

  walk(rootElem, 0, null);
  return { nodes, edges };
}
