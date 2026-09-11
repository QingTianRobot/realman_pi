import { describe, expect, it } from 'vitest';

import type { BtEdge, BtNode, NodeManifest } from '../types';
import { dfsPreorderIds, exportToXml, findRootId, importFromXml } from './xml';

const manifests: NodeManifest[] = [
  { registration_name: 'Sequence', type: 'Control', ports: [] },
  {
    registration_name: 'PrintMessage',
    type: 'Action',
    ports: [
      {
        name: 'message',
        direction: 'input',
        type_name: 'string',
        default_value: '',
        description: 'message',
        enum_values: [],
      },
    ],
  },
  { registration_name: 'AlwaysSuccess', type: 'Condition', ports: [] },
];

function node(
  id: string,
  registrationName: string,
  kind: BtNode['data']['kind'],
  x: number,
  portValues: Record<string, string> = {},
): BtNode {
  return {
    id,
    type: 'btNode',
    position: { x, y: 0 },
    data: {
      registrationName,
      kind,
      instanceName: id,
      portValues,
      portManifests: [],
      runStatus: 'IDLE',
    },
  };
}

describe('xml utilities', () => {
  it('finds the single root and rejects multiple roots', () => {
    const nodes = [
      node('root', 'Sequence', 'Control', 0),
      node('child', 'AlwaysSuccess', 'Condition', 0),
    ];

    expect(findRootId(nodes, [{ id: 'e', source: 'root', target: 'child' }])).toBe(
      'root',
    );
    expect(findRootId(nodes, [])).toBeNull();
  });

  it('exports XML using visual left-to-right child order', () => {
    const nodes = [
      node('root', 'Sequence', 'Control', 100),
      node('right', 'PrintMessage', 'Action', 300, { message: 'right' }),
      node('left', 'PrintMessage', 'Action', 0, { message: 'left & <safe>' }),
    ];
    const edges: BtEdge[] = [
      { id: 'e1', source: 'root', target: 'right' },
      { id: 'e2', source: 'root', target: 'left' },
    ];

    const xml = exportToXml(nodes, edges, 'DemoTree');

    expect(xml).toContain('<root main_tree_to_execute="DemoTree">');
    expect(xml.indexOf('message="left &amp; &lt;safe&gt;"')).toBeLessThan(
      xml.indexOf('message="right"'),
    );
  });

  it('imports XML, keeps DFS ids stable, and assigns non-overlapping layout', () => {
    const xml = `<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Sequence name="root">
      <PrintMessage message="hello"/>
      <AlwaysSuccess/>
    </Sequence>
  </BehaviorTree>
</root>`;

    const result = importFromXml(xml, manifests);

    expect(result.nodes.map((item) => item.data.registrationName)).toEqual([
      'Sequence',
      'PrintMessage',
      'AlwaysSuccess',
    ]);
    expect(result.edges).toHaveLength(2);
    expect(dfsPreorderIds(result.nodes, result.edges)).toEqual([
      'n0',
      'n1',
      'n2',
    ]);
    expect(result.nodes[1].position).toEqual({ x: 0, y: 140 });
    expect(result.nodes[2].position).toEqual({ x: 220, y: 140 });
  });

  it('round-trips imported trees back to compatible XML', () => {
    const input = `<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Sequence name="root">
      <PrintMessage message="{greeting}"/>
    </Sequence>
  </BehaviorTree>
</root>`;

    const { nodes, edges } = importFromXml(input, manifests);
    const output = exportToXml(nodes, edges);

    expect(output).toContain('<Sequence name="root">');
    expect(output).toContain('<PrintMessage message="{greeting}"/>');
  });
});
