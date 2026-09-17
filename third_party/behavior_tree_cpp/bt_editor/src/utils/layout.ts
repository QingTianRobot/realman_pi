import type { BtEdge, BtNode } from '../types';
import { findRootId } from './xml';

const NODE_X_GAP = 220;
const NODE_Y_GAP = 140;

function childrenMap(nodes: BtNode[], edges: BtEdge[]): Map<string, string[]> {
  const xById = new Map(nodes.map((node) => [node.id, node.position.x]));
  const map = new Map<string, string[]>();
  for (const edge of edges) {
    const list = map.get(edge.source) ?? [];
    list.push(edge.target);
    map.set(edge.source, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => (xById.get(a) ?? 0) - (xById.get(b) ?? 0));
  }
  return map;
}

export function layoutTree(nodes: BtNode[], edges: BtEdge[]): BtNode[] {
  const rootId = findRootId(nodes, edges);
  if (rootId === null) {
    throw new Error('整理布局失败：树必须有且仅有一个根节点');
  }

  const map = childrenMap(nodes, edges);
  const positions = new Map<string, { x: number; y: number }>();
  const visiting = new Set<string>();
  const visited = new Set<string>();
  let leafCursor = 0;

  function place(id: string, depth: number): number {
    if (visiting.has(id)) {
      throw new Error('整理布局失败：检测到环，行为树必须是树状结构');
    }
    if (visited.has(id)) {
      return positions.get(id)?.x ?? 0;
    }

    visiting.add(id);
    const children = map.get(id) ?? [];
    let x: number;
    if (children.length === 0) {
      x = leafCursor * NODE_X_GAP;
      leafCursor += 1;
    } else {
      const childXs = children.map((childId) => place(childId, depth + 1));
      x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    }
    positions.set(id, { x, y: depth * NODE_Y_GAP });
    visiting.delete(id);
    visited.add(id);
    return x;
  }

  place(rootId, 0);
  if (visited.size !== nodes.length) {
    throw new Error('整理布局失败：存在未连接到根节点的孤立节点');
  }

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? node.position,
  }));
}
