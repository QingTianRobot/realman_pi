/**
 * Canvas.tsx — React Flow 行为树画布
 *
 * @author pony
 * @date 2026-06-30
 * @version v1.1.0
 * @last_modified 2026-07-13
 * @changelog
 *   - v1.1.0 (2026-07-13): 标记响应式画布和可折叠浮层
 *
 * 基于 React Flow，负责：
 * - 渲染节点与连线
 * - 接收节点面板拖拽放置（onDrop 创建节点）
 * - 连线时校验父子约束：
 *     · 叶子(Action/Condition)不能有子节点 → 禁止从其底部连出（已无源桩）
 *     · 装饰(Decorator)最多一个子节点 → 已有一条出边时拒绝再连
 *     · 控制(Control)可多子 → 放行
 *     · 单个子节点只能有一个父节点 → 目标已有入边时拒绝
 *     · 禁止自环
 * - 选中节点 / 删除节点与连线（交由上层状态管理）
 *
 * 本组件不持有节点状态，全部通过 props 受控，便于 App 统一管理与导入导出。
 */

import { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { BtNodeView } from './BtNodeView';
import { Legend } from './Legend';
import { EmptyState } from './EmptyState';
import { DND_MIME } from './NodePalette';
import type { BtNode, BtEdge, NodeManifest, BtNodeData } from '../types';
import { checkConnection } from '../utils/connection';

interface Props {
  nodes: BtNode[];
  edges: BtEdge[];
  manifests: NodeManifest[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (edge: Edge) => void;
  onSelectNode: (id: string | null) => void;
  onCreateNode: (manifest: NodeManifest, position: { x: number; y: number }) => void;
  /** 非法连线时回调，携带中文原因，供上层弹 toast 提示 */
  onInvalidConnection: (reason: string) => void;
  /** 空状态点击"载入示例"回调 */
  onLoadSample: () => void;
}

/** 内部画布（需要被 ReactFlowProvider 包裹才能用 useReactFlow） */
function CanvasInner({
  nodes,
  edges,
  manifests,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
  onCreateNode,
  onInvalidConnection,
  onLoadSample,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // 注册自定义节点类型（memo 防止每次渲染都新建对象，避免 React Flow 警告）
  const nodeTypes = useMemo<NodeTypes>(() => ({ btNode: BtNodeView }), []);

  const manifestByName = useMemo(
    () => new Map(manifests.map((m) => [m.registration_name, m])),
    [manifests],
  );

  /** 连线校验 + 提交：非法连线给出明确中文原因 */
  const handleConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target) return;
      const check = checkConnection(conn.source, conn.target, nodes, edges);
      if (!check.ok) {
        onInvalidConnection(check.reason);
        return;
      }
      const newEdge = addEdge(conn, [])[0] as Edge;
      onConnect(newEdge);
    },
    [nodes, edges, onConnect, onInvalidConnection],
  );

  /** 允许拖放 */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  /** 拖放：读取注册名 → 计算落点 → 通知上层创建节点 */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const regName = e.dataTransfer.getData(DND_MIME);
      if (!regName) return;
      const manifest = manifestByName.get(regName);
      if (!manifest) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      onCreateNode(manifest, position);
    },
    [manifestByName, screenToFlowPosition, onCreateNode],
  );

  return (
    <div
      ref={wrapperRef}
      data-testid="bt-canvas"
      className="bt-editor-canvas"
      style={{ position: 'relative' }}
    >
      <ReactFlow
        nodes={nodes as Node<BtNodeData>[]}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onNodeClick={(_, n) => onSelectNode(n.id)}
        onPaneClick={() => onSelectNode(null)}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
        {/* 运行态图例固定在右上角 */}
        <Panel className="bt-canvas-legend" position="top-right">
          <Legend />
        </Panel>
      </ReactFlow>
      {/* 画布为空时叠加引导层（覆盖在 ReactFlow 之上，不拦截拖放） */}
      {nodes.length === 0 && <EmptyState onLoadSample={onLoadSample} />}
    </div>
  );
}

/** 对外导出：包一层 Provider */
export function Canvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
