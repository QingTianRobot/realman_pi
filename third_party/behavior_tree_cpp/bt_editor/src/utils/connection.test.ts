import { describe, expect, it } from 'vitest';

import type { BtEdge, BtNode, NodeKind } from '../types';
import { checkConnection } from './connection';

function node(id: string, kind: NodeKind, registrationName: string = kind): BtNode {
  return {
    id,
    type: 'btNode',
    position: { x: 0, y: 0 },
    data: {
      registrationName,
      kind,
      instanceName: id,
      portValues: {},
      portManifests: [],
      runStatus: 'IDLE',
    },
  };
}

describe('connection rules', () => {
  it('allows control nodes to connect to an unparented child', () => {
    const nodes = [node('root', 'Control', 'Sequence'), node('child', 'Action')];

    expect(checkConnection('root', 'child', nodes, [])).toEqual({ ok: true });
  });

  it('rejects self loops and leaf parents', () => {
    const nodes = [node('leaf', 'Action', 'PrintMessage')];

    expect(checkConnection('leaf', 'leaf', nodes, [])).toMatchObject({
      ok: false,
    });
    expect(checkConnection('leaf', 'other', nodes, [])).toMatchObject({
      ok: false,
      reason: expect.stringContaining('叶子节点'),
    });
  });

  it('limits decorators to one child and prevents duplicate parents', () => {
    const nodes = [
      node('decorator', 'Decorator', 'Inverter'),
      node('parent', 'Control', 'Sequence'),
      node('child', 'Condition', 'AlwaysSuccess'),
      node('other', 'Condition', 'AlwaysFailure'),
    ];
    const edges: BtEdge[] = [{ id: 'e1', source: 'decorator', target: 'child' }];

    expect(checkConnection('decorator', 'other', nodes, edges)).toMatchObject({
      ok: false,
      reason: expect.stringContaining('只能有一个子节点'),
    });
    expect(checkConnection('parent', 'child', nodes, edges)).toMatchObject({
      ok: false,
      reason: expect.stringContaining('已有父节点'),
    });
  });

  it('rejects edges that would create a cycle', () => {
    const nodes = [
      node('root', 'Control', 'Sequence'),
      node('middle', 'Control', 'Fallback'),
      node('leaf', 'Action', 'PrintMessage'),
    ];
    const edges: BtEdge[] = [
      { id: 'e1', source: 'root', target: 'middle' },
      { id: 'e2', source: 'middle', target: 'leaf' },
    ];

    expect(checkConnection('middle', 'root', nodes, edges)).toMatchObject({
      ok: false,
      reason: expect.stringContaining('形成环'),
    });
  });
});
