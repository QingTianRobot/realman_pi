/**
 * 全局类型定义
 *
 * 这里集中定义编辑器内部使用的领域类型，以及与后端 HTTP 协议对应的 DTO 类型，
 * 避免各处散落 any，保证 TypeScript 严格模式下的类型安全。
 */

import type { Node, Edge } from 'reactflow';

// ---------------------------------------------------------------------------
// 后端协议 DTO（与 bt_server 约定，务必与 API_CONTRACT 一致）
// ---------------------------------------------------------------------------

/** 端口方向，对应 bt_core PortDirection 的字符串序列化值 */
export type PortDirection = 'input' | 'output' | 'inout';

/** 节点大类，对应 bt_core NodeType::toStr() 的输出 */
export type NodeKind = 'Control' | 'Decorator' | 'Action' | 'Condition';

/** GET /api/nodes 中单个端口的描述 */
export interface PortManifest {
  name: string;
  direction: PortDirection;
  type_name: string;
  default_value: string;
  description: string;
  /** 枚举可选值——非空时属性面板渲染下拉框，强制取值在该集合内。 */
  enum_values?: string[];
}

/** GET /api/nodes 返回数组的单项：一种已注册节点的 manifest */
export interface NodeManifest {
  registration_name: string;
  type: NodeKind;
  ports: PortManifest[];
}

/** POST /api/tree/load 的响应 */
export interface LoadResult {
  ok: boolean;
  node_count?: number;
  error?: string;
}

/** GET /api/tree/export 的响应 */
export interface ExportResult {
  xml: string;
}

/** 单个节点的运行态状态 */
export type RunStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILURE';

/** POST /api/tree/tick 返回的单节点状态 */
export interface TickNodeStatus {
  id: string;
  status: RunStatus;
}

/** POST /api/tree/tick 的响应 */
export interface TickResult {
  status: RunStatus;
  nodes: TickNodeStatus[];
}

export interface RunTransition {
  node_id: number;
  from: RunStatus;
  to: RunStatus;
  seq: number;
}

export interface RunResult {
  final_status: RunStatus;
  transitions: RunTransition[];
}

export interface ValidateResult {
  ok: boolean;
  node_count?: number;
  error?: string;
}

export interface FormatResult extends ValidateResult {
  xml?: string;
}

/** GET /api/health 的响应 */
export interface HealthResult {
  ok: boolean;
  version: string;
}

// ---------------------------------------------------------------------------
// 画布内部数据模型
// ---------------------------------------------------------------------------

/**
 * 挂在每个 React Flow Node 上的自定义数据。
 * - registrationName：节点注册名（XML 标签名，用于实例化）
 * - kind：节点大类，决定连线约束与图标
 * - instanceName：实例名（XML name 属性），可由用户编辑
 * - portValues：端口名 → 当前值（字面量或 "{key}" 重映射）
 * - portManifests：该节点声明的端口列表（来自 manifest，用于属性面板渲染）
 * - runStatus：最近一次 tick 的运行态，用于上色
 */
export interface BtNodeData {
  registrationName: string;
  kind: NodeKind;
  instanceName: string;
  portValues: Record<string, string>;
  portManifests: PortManifest[];
  runStatus: RunStatus;
}

/** 画布节点类型别名 */
export type BtNode = Node<BtNodeData>;
/** 画布连线类型别名 */
export type BtEdge = Edge;

/** 判断某个节点大类是否为叶子（不可有子节点） */
export function isLeafKind(kind: NodeKind): boolean {
  return kind === 'Action' || kind === 'Condition';
}

/** 判断某个节点大类是否为装饰（最多一个子节点） */
export function isDecoratorKind(kind: NodeKind): boolean {
  return kind === 'Decorator';
}

/** 判断某个节点大类是否为控制（可多个子节点） */
export function isControlKind(kind: NodeKind): boolean {
  return kind === 'Control';
}
