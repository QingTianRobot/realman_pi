/**
 * 连线约束校验
 *
 * 把"是否允许从 source 连到 target"的判定从 Canvas 组件里抽出来，集中维护，
 * 并且返回**带原因**的结果，方便 UI 给出明确提示（而不是静默拒绝）。
 *
 * 行为树连线规则：
 * - 禁止自环（source === target）
 * - 叶子(Action/Condition)不能有子节点
 * - 装饰(Decorator)最多一个子节点
 * - 一个子节点只能有一个父节点（target 已有入边 → 拒绝）
 * - 禁止成环（target 是 source 的祖先 → 拒绝，否则会形成循环依赖）
 */

import type { BtNode, BtEdge } from '../types';
import { isLeafKind, isDecoratorKind } from '../types';

/** 校验结果：ok 为 true 时允许连线；否则 reason 给出中文原因 */
export type ConnectCheck =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * 判断 target 是否为 source 的祖先（即从 target 沿子边能到达 source）。
 * 若是，则新增 source→target 边会形成环。
 */
function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: BtEdge[],
): boolean {
  // 从 target 出发做 BFS，看能否到达 source
  const childrenOf = new Map<string, string[]>();
  for (const e of edges) {
    const list = childrenOf.get(e.source) ?? [];
    list.push(e.target);
    childrenOf.set(e.source, list);
  }
  const visited = new Set<string>();
  const queue = [targetId];
  while (queue.length > 0) {
    const cur = queue.shift() as string;
    if (cur === sourceId) return true; // target 可达 source → 成环
    if (visited.has(cur)) continue;
    visited.add(cur);
    for (const next of childrenOf.get(cur) ?? []) {
      queue.push(next);
    }
  }
  return false;
}

/**
 * 校验一条拟新增的连线是否合法。
 *
 * @param sourceId 起点节点 id（父）
 * @param targetId 终点节点 id（子）
 * @param nodes    当前画布节点
 * @param edges    当前画布连线
 * @returns        合法返回 { ok: true }，否则返回带 reason 的失败结果
 */
export function checkConnection(
  sourceId: string,
  targetId: string,
  nodes: BtNode[],
  edges: BtEdge[],
): ConnectCheck {
  // 自环
  if (sourceId === targetId) {
    return { ok: false, reason: '不能把节点连到它自己' };
  }

  const sourceNode = nodes.find((n) => n.id === sourceId);
  if (!sourceNode) {
    return { ok: false, reason: '起点节点不存在' };
  }
  const kind = sourceNode.data.kind;
  const sourceLabel = sourceNode.data.registrationName;

  // 叶子不能有子节点
  if (isLeafKind(kind)) {
    return {
      ok: false,
      reason: `「${sourceLabel}」是${kind}（叶子节点），不能添加子节点`,
    };
  }

  // 装饰节点最多一个子节点
  if (isDecoratorKind(kind)) {
    const existing = edges.filter((e) => e.source === sourceId).length;
    if (existing >= 1) {
      return {
        ok: false,
        reason: `「${sourceLabel}」是装饰节点，只能有一个子节点`,
      };
    }
  }

  // 一个子节点只能有一个父节点
  if (edges.some((e) => e.target === targetId)) {
    return { ok: false, reason: '该节点已有父节点，不能重复连接' };
  }

  // 成环检测
  if (wouldCreateCycle(sourceId, targetId, edges)) {
    return { ok: false, reason: '这条连线会形成环，行为树必须是树状结构' };
  }

  return { ok: true };
}
