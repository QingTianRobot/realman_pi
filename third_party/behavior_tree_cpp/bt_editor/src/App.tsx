/**
 * App.tsx — 编辑器顶层状态与交互编排
 *
 * @author pony
 * @date 2026-06-30
 * @version v1.1.0
 * @last_modified 2026-07-13
 * @changelog
 *   - v1.1.0 (2026-07-13): 增加窄屏布局入口和无需拖拽的节点创建路径
 *
 * 统一持有画布状态(nodes/edges)、节点 manifest、选中节点、后端健康状态，
 * 并把导入/导出/Tick/载入示例等动作串起来。子组件全部受控。
 *
 * 健壮性设计：
 * - 所有后端请求统一 try/catch，失败通过全局 Toast 给出明确中文提示，绝不静默吞掉。
 * - 后端健康状态可手动「重新检测」，连接后自动恢复相关操作。
 * - 非法连线由 Canvas 上报原因，这里转成 toast 告知用户。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';

import { Toolbar } from './components/Toolbar';
import { NodePalette } from './components/NodePalette';
import { Canvas } from './components/Canvas';
import { PropertyPanel } from './components/PropertyPanel';
import { ToastStack, type ToastItem, type ToastKind } from './components/Toast';
import {
  fetchNodes,
  loadTree,
  validateTree,
  formatTree,
  exportTree,
  tickTree,
  runTree,
  checkHealth,
} from './api/client';
import { exportToXml, importFromXml, dfsPreorderIds } from './utils/xml';
import { layoutTree } from './utils/layout';
import { SAMPLE_TREE_XML } from './utils/sampleTree';
import { XmlPreviewPanel } from './components/XmlPreviewPanel';
import type {
  BtNode,
  BtEdge,
  BtNodeData,
  NodeManifest,
  RunStatus,
} from './types';

let nodeIdSeq = 0;
/** 生成画布内唯一节点 id */
function nextNodeId(): string {
  return `node_${nodeIdSeq++}`;
}

let toastIdSeq = 0;

/** 按 manifest 构造节点，点击添加与画布拖放必须共享同一端口默认值契约。 */
function createNodeFromManifest(
  manifest: NodeManifest,
  position: { x: number; y: number },
): BtNode {
  const portValues: Record<string, string> = {};
  for (const port of manifest.ports) {
    portValues[port.name] = port.default_value ?? '';
  }
  return {
    id: nextNodeId(),
    type: 'btNode',
    position,
    data: {
      registrationName: manifest.registration_name,
      kind: manifest.type,
      instanceName: '',
      portValues,
      portManifests: manifest.ports,
      runStatus: 'IDLE',
    },
  };
}

export default function App() {
  // 画布数据
  const [nodes, setNodes] = useState<BtNode[]>([]);
  const [edges, setEdges] = useState<BtEdge[]>([]);
  // 节点 manifest（来自 /api/nodes）
  const [manifests, setManifests] = useState<NodeManifest[]>([]);
  const [paletteLoading, setPaletteLoading] = useState(false);
  const [paletteError, setPaletteError] = useState<string | null>(null);
  // 选中节点 id
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 后端版本（null = 未连接） / 健康检测中 / 忙碌锁
  const [health, setHealth] = useState<string | null>(null);
  const [healthChecking, setHealthChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverFormattedXml, setServerFormattedXml] = useState<string | null>(null);
  const [lastRunSummary, setLastRunSummary] = useState<string | null>(null);
  // 全局 toast 列表
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // 记录每条 toast 的定时器，便于卸载时清理
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // -------------------------------------------------------------------------
  // Toast 管理
  // -------------------------------------------------------------------------
  const dismissToast = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  /** 弹出一条 toast，error 停留更久，其余自动消失 */
  const pushToast = useCallback(
    (kind: ToastKind, text: string) => {
      const id = toastIdSeq++;
      setToasts((ts) => [...ts, { id, kind, text }]);
      const ttl = kind === 'error' ? 6000 : 3000;
      const timer = setTimeout(() => dismissToast(id), ttl);
      timersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  // 卸载时清理所有定时器
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, []);

  // -------------------------------------------------------------------------
  // 启动：拉节点 + 健康检查
  // -------------------------------------------------------------------------
  const reloadNodes = useCallback(async () => {
    setPaletteLoading(true);
    setPaletteError(null);
    try {
      const list = await fetchNodes();
      setManifests(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setPaletteError(msg);
      pushToast('error', `拉取节点列表失败：${msg}`);
    } finally {
      setPaletteLoading(false);
    }
  }, [pushToast]);

  /** 检测后端健康；toastOnResult 为 true 时把结果以 toast 告知（手动重检用） */
  const recheckHealth = useCallback(
    async (toastOnResult: boolean) => {
      setHealthChecking(true);
      try {
        const h = await checkHealth();
        setHealth(h.version);
        if (toastOnResult) pushToast('success', `后端已连接 v${h.version}`);
      } catch {
        setHealth(null);
        if (toastOnResult) pushToast('error', '后端仍不可达，请确认 bt_server 已启动');
      } finally {
        setHealthChecking(false);
      }
    },
    [pushToast],
  );

  useEffect(() => {
    void reloadNodes();
    // 首次健康检查静默（不弹 toast，未连接由顶部提示条体现）
    void recheckHealth(false);
  }, [reloadNodes, recheckHealth]);

  // -------------------------------------------------------------------------
  // React Flow 变更处理
  // -------------------------------------------------------------------------
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as BtNode[]);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((edge: Edge) => {
    setEdges((eds) => [...eds, edge]);
  }, []);

  /** 非法连线：把 Canvas 上报的原因转成 toast */
  const onInvalidConnection = useCallback(
    (reason: string) => pushToast('error', `连线被拒绝：${reason}`),
    [pushToast],
  );

  // -------------------------------------------------------------------------
  // 从面板拖拽创建节点
  // -------------------------------------------------------------------------
  const onCreateNode = useCallback(
    (manifest: NodeManifest, position: { x: number; y: number }) => {
      setNodes((current) => [...current, createNodeFromManifest(manifest, position)]);
    },
    [],
  );

  /** 触控设备无法可靠使用 HTML5 drag，点击时把节点放到可预测的网格位置。 */
  const onAddNode = useCallback((manifest: NodeManifest) => {
    setNodes((current) => {
      const index = current.length;
      const position = {
        x: 80 + (index % 3) * 200,
        y: 80 + Math.floor(index / 3) * 130,
      };
      return [...current, createNodeFromManifest(manifest, position)];
    });
  }, []);

  useEffect(() => {
    setServerFormattedXml(null);
  }, [nodes, edges]);

  // -------------------------------------------------------------------------
  // 属性面板编辑
  // -------------------------------------------------------------------------
  const updateNodeData = useCallback(
    (id: string, patch: Partial<BtNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      );
    },
    [],
  );

  const onChangeInstanceName = useCallback(
    (id: string, name: string) => updateNodeData(id, { instanceName: name }),
    [updateNodeData],
  );

  const onChangePortValue = useCallback(
    (id: string, port: string, value: string) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== id) return n;
          return {
            ...n,
            data: {
              ...n.data,
              portValues: { ...n.data.portValues, [port]: value },
            },
          };
        }),
      );
    },
    [],
  );

  const onDeleteNode = useCallback((id: string) => {
    // 删除节点同时删掉相关连线
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  // -------------------------------------------------------------------------
  // 工具栏动作
  // -------------------------------------------------------------------------
  /** 载入内置示例树到画布（纯前端，无需后端） */
  const onLoadSample = useCallback(() => {
    try {
      const { nodes: newNodes, edges: newEdges } = importFromXml(
        SAMPLE_TREE_XML,
        manifests,
      );
      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedId(null);
      nodeIdSeq += newNodes.length;
      pushToast('success', `已载入示例树（${newNodes.length} 个节点）`);
    } catch (err) {
      pushToast(
        'error',
        `载入示例失败：${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }, [manifests, pushToast]);

  /** 把画布序列化为 XML 并 POST /api/tree/load */
  const onLoad = useCallback(async () => {
    // 先在前端做一次序列化，提前暴露"无唯一根节点"等结构问题
    let xml: string;
    try {
      xml = exportToXml(nodes, edges);
    } catch (err) {
      pushToast(
        'error',
        err instanceof Error ? err.message : String(err),
      );
      return;
    }
    setBusy(true);
    try {
      const res = await loadTree(xml);
      if (res.ok) {
        pushToast('success', `载入成功，节点数：${res.node_count ?? '?'}`);
      } else {
        pushToast('error', `载入失败：${res.error ?? '未知错误'}`);
      }
    } catch (err) {
      pushToast('error', `载入请求失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }, [nodes, edges, pushToast]);

  /** GET /api/tree/export 取 XML 并还原画布 */
  const onExport = useCallback(async () => {
    setBusy(true);
    try {
      const { xml } = await exportTree();
      const { nodes: newNodes, edges: newEdges } = importFromXml(xml, manifests);
      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedId(null);
      // 同步 id 序列，避免后续新建节点 id 与导入的冲突
      nodeIdSeq += newNodes.length;
      pushToast('success', `已从服务器导入 ${newNodes.length} 个节点`);
    } catch (err) {
      pushToast('error', `导入失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }, [manifests, pushToast]);

  /** POST /api/tree/tick 执行一拍，按返回状态给节点上色 */
  const onTick = useCallback(async () => {
    setBusy(true);
    try {
      const res = await tickTree();
      // 关键：编辑器节点 id(nX) 与后端节点 id(数字) 是两套独立空间，不能直接比较。
      // 唯一稳定的对应是「DFS 前序位置」——编辑器导出 XML 与后端构树/遍历都用同一
      // 前序。因此把编辑器节点按前序排好，与后端有序返回的 nodes 按位置 zip 匹配。
      const preorder = dfsPreorderIds(nodes, edges); // 前序 id 序列
      const statusByEditorId = new Map<string, RunStatus>();
      preorder.forEach((editorId, i) => {
        const backend = res.nodes[i];
        if (backend) statusByEditorId.set(editorId, backend.status);
      });
      setNodes((nds) =>
        nds.map((n) => {
          const s = statusByEditorId.get(n.id) ?? n.data.runStatus;
          return { ...n, data: { ...n.data, runStatus: s } };
        }),
      );
      pushToast('info', `Tick 完成，根状态：${res.status}`);
    } catch (err) {
      pushToast('error', `Tick 失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }, [nodes, edges, pushToast]);

  const onRun = useCallback(async () => {
    setBusy(true);
    try {
      const res = await runTree();
      const preorder = dfsPreorderIds(nodes, edges);
      const finalByBackendId = new Map<number, RunStatus>();
      for (const transition of res.transitions) {
        finalByBackendId.set(transition.node_id, transition.to);
      }
      const sortedBackendIds = [...finalByBackendId.keys()].sort((a, b) => a - b);
      const statusByEditorId = new Map<string, RunStatus>();
      sortedBackendIds.forEach((backendId, i) => {
        const editorId = preorder[i];
        const status = finalByBackendId.get(backendId);
        if (editorId && status) statusByEditorId.set(editorId, status);
      });
      setNodes((nds) =>
        nds.map((n) => {
          const s = statusByEditorId.get(n.id) ?? n.data.runStatus;
          return { ...n, data: { ...n.data, runStatus: s } };
        }),
      );
      const summary = `Run 完成：${res.final_status}，状态变化 ${res.transitions.length} 次`;
      setLastRunSummary(summary);
      pushToast('info', summary);
    } catch (err) {
      pushToast('error', `Run 失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }, [nodes, edges, pushToast]);

  const onLayout = useCallback(() => {
    try {
      setNodes((nds) => layoutTree(nds, edges));
      pushToast('success', '布局已整理');
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : String(err));
    }
  }, [edges, pushToast]);

  /** 把所有节点运行态重置为 IDLE（清除上色，不改结构） */
  const onResetStatus = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.data.runStatus === 'IDLE'
          ? n
          : { ...n, data: { ...n.data, runStatus: 'IDLE' } },
      ),
    );
  }, []);

  /** 清空画布 */
  const onClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const preview = useMemo(() => {
    try {
      return { xml: serverFormattedXml ?? exportToXml(nodes, edges), error: null };
    } catch (err) {
      return {
        xml: '',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }, [nodes, edges, serverFormattedXml]);

  const onCopyXml = useCallback(() => {
    if (preview.error) return;
    void navigator.clipboard.writeText(preview.xml);
    pushToast('success', 'XML 已复制到剪贴板');
  }, [preview, pushToast]);

  const onValidateXml = useCallback(async () => {
    if (preview.error) {
      pushToast('error', preview.error);
      return;
    }
    setBusy(true);
    try {
      const result = await validateTree(preview.xml);
      if (result.ok) {
        pushToast('success', `XML 校验通过，节点数：${result.node_count ?? '?'}`);
      } else {
        pushToast('error', `XML 校验失败：${result.error ?? '未知错误'}`);
      }
    } catch (err) {
      pushToast('error', `XML 校验请求失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }, [preview, pushToast]);

  const onFormatXml = useCallback(async () => {
    if (preview.error) {
      pushToast('error', preview.error);
      return;
    }
    setBusy(true);
    try {
      const result = await formatTree(preview.xml);
      if (result.ok && result.xml) {
        setServerFormattedXml(result.xml);
        pushToast('success', `XML 已格式化，节点数：${result.node_count ?? '?'}`);
      } else {
        pushToast('error', `XML 格式化失败：${result.error ?? '未知错误'}`);
      }
    } catch (err) {
      pushToast('error', `XML 格式化请求失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }, [preview, pushToast]);

  return (
    <div className="bt-editor-app">
      <Toolbar
        health={health}
        healthChecking={healthChecking}
        busy={busy}
        onLoadSample={onLoadSample}
        onLoad={onLoad}
        onExport={onExport}
        onTick={onTick}
        onRun={onRun}
        onLayout={onLayout}
        onResetStatus={onResetStatus}
        onClear={onClear}
        onRecheckHealth={() => void recheckHealth(true)}
      />
      <div className="bt-editor-workspace">
        <NodePalette
          manifests={manifests}
          loading={paletteLoading}
          error={paletteError}
          onReload={() => void reloadNodes()}
          onAdd={onAddNode}
        />
        <Canvas
          nodes={nodes}
          edges={edges}
          manifests={manifests}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectNode={setSelectedId}
          onCreateNode={onCreateNode}
          onInvalidConnection={onInvalidConnection}
          onLoadSample={onLoadSample}
        />
        <PropertyPanel
          node={selectedNode}
          onChangeInstanceName={onChangeInstanceName}
          onChangePortValue={onChangePortValue}
          onDelete={onDeleteNode}
        />
      </div>
      <XmlPreviewPanel
        xml={preview.xml}
        error={preview.error}
        busy={busy}
        connected={health !== null}
        lastRunSummary={lastRunSummary}
        onCopy={onCopyXml}
        onValidate={onValidateXml}
        onFormat={onFormatXml}
      />
      {/* 全局通知浮层 */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
