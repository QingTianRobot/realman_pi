import { describe, expect, it } from 'vitest';

import type { BtEdge, BtNode, NodeKind } from '../types';
import { layoutTree } from './layout';

function node(id: string, kind: NodeKind, x: number): BtNode {
  return {
    id,
    type: 'btNode',
    position: { x, y: 99 },
    data: {
      registrationName: kind,
      kind,
      instanceName: id,
      portValues: {},
      portManifests: [],
      runStatus: 'IDLE',
    },
  };
}

describe('layoutTree', () => {
  it('centers parents over visually ordered children', () => {
    const nodes = [
      node('root', 'Control', 500),
      node('right', 'Action', 500),
      node('left', 'Action', 0),
    ];
    const edges: BtEdge[] = [
      { id: 'e1', source: 'root', target: 'right' },
      { id: 'e2', source: 'root', target: 'left' },
    ];

    const laidOut = layoutTree(nodes, edges);
    const byId = new Map(laidOut.map((item) => [item.id, item.position]));

    expect(byId.get('left')).toEqual({ x: 0, y: 140 });
    expect(byId.get('right')).toEqual({ x: 220, y: 140 });
    expect(byId.get('root')).toEqual({ x: 110, y: 0 });
  });

  it('rejects disconnected graphs', () => {
    const nodes = [node('a', 'Control', 0), node('b', 'Action', 0)];

    expect(() => layoutTree(nodes, [])).toThrow(/有且仅有一个根节点/);
  });
});
