import { useMemo, useState, type CSSProperties } from 'react';
import type { RuntimeNode } from '../types';

interface Props {
  nodes: RuntimeNode[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

function ancestors(path: string): string[] {
  const parts = path.split('/');
  return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('/'));
}

const icons: Record<string, string> = { Control: '≡', Decorator: '◇', Action: '↗', Condition: '?' };

export function RuntimeTree({ nodes, selectedKey, onSelect }: Props) {
  const [filter, setFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const query = filter.trim().toLocaleLowerCase();
  const parents = useMemo(() => new Set(nodes.flatMap((node) => ancestors(node.path))), [nodes]);
  const visible = useMemo(() => {
    if (query) {
      const matched = new Set(nodes.filter((node) =>
        `${node.name} ${node.registration_name} ${node.kind} ${node.path} ${node.status}`.toLocaleLowerCase().includes(query),
      ).flatMap((node) => [node.path, ...ancestors(node.path)]));
      return nodes.filter((node) => matched.has(node.path));
    }
    return nodes.filter((node) => !ancestors(node.path).some((path) => collapsed.has(path)));
  }, [nodes, query, collapsed]);

  function toggle(path: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }

  return <section className="runtime-tree-panel" aria-label="运行树">
    <div className="panel-heading">
      <div><span className="eyebrow">BEHAVIOR TREE</span><h2>运行树 <span className="muted">{nodes.length}</span></h2></div>
      <span className="read-only">只读</span>
    </div>
    <div className="tree-filter">
      <label htmlFor="node-search">搜索节点</label>
      <input id="node-search" type="search" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="名称、类型或状态…" />
      {query && <span className="muted">显示 {visible.length} / {nodes.length} 个节点（含父节点）</span>}
    </div>
    {nodes.length === 0 ? <div className="empty-runtime"><span aria-hidden="true">⌁</span><h3>等待执行器发布运行树</h3><p>执行开始后，节点与状态将在这里自动显示。</p></div> :
      <div className="tree-scroll"><div role="tree" aria-label="行为树节点">
        {visible.map((node) => {
          const branch = parents.has(node.path);
          const expanded = query.length > 0 || !collapsed.has(node.path);
          return <div key={node.key} role="treeitem" aria-level={node.path.split('/').length}
            aria-selected={selectedKey === node.key} aria-expanded={branch ? expanded : undefined}
            data-status={node.status} className={`runtime-node ${selectedKey === node.key ? 'selected' : ''}`}
            style={{ '--depth': node.path.split('/').length - 1 } as CSSProperties}>
            {branch ? <button className="branch-toggle" aria-label={`${expanded ? '折叠' : '展开'} ${node.name || node.registration_name}`}
              disabled={!!query} onClick={() => toggle(node.path)}>{expanded ? '▾' : '▸'}</button> : <span className="branch-spacer" />}
            <button className="node-select" onClick={() => onSelect(node.key)}>
              <span className="node-kind" aria-hidden="true">{icons[node.kind] ?? '○'}</span>
              <span className="node-label"><strong>{node.name || node.registration_name}</strong><small>{node.registration_name}</small></span>
              <span className="status-badge" data-status={node.status}>{node.status}</span>
            </button>
          </div>;
        })}
      </div>{visible.length === 0 && <p className="no-matches">没有匹配的节点</p>}</div>}
  </section>;
}
