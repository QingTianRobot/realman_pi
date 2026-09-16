import type { RunStatus, RuntimeNode } from '../types';

const statuses: RunStatus[] = ['RUNNING', 'SUCCESS', 'FAILURE', 'IDLE'];
const labels: Record<RunStatus, string> = { RUNNING: '运行中', SUCCESS: '成功', FAILURE: '失败', IDLE: '未执行' };

export function RuntimeDetails({ node, nodes }: { node: RuntimeNode | undefined; nodes: RuntimeNode[] }) {
  return <aside className="runtime-sidebar">
    <section className="detail-panel" aria-label="节点详情">
      <div className="panel-heading"><div><span className="eyebrow">INSPECTOR</span><h2>节点详情</h2></div></div>
      {node ? <div className="detail-body">
        <h3>{node.name || node.registration_name}</h3>
        <span className="status-badge" data-status={node.status}>{node.status}</span>
        {node.status === 'FAILURE' && <div className="failure-reason" role="alert">
          <strong>失败原因</strong>
          <p>{node.failure_reason || '未提供失败原因'}</p>
        </div>}
        <dl>
          <dt>节点 Key</dt><dd>{node.key}</dd>
          <dt>注册名称</dt><dd>{node.registration_name}</dd>
          <dt>节点类型</dt><dd>{node.kind}</dd>
          <dt>树路径</dt><dd>{node.path}</dd>
        </dl>
      </div> : <p className="detail-placeholder">选择一个节点查看运行状态与详情。</p>}
    </section>
    <section className="detail-panel status-summary" aria-label="状态统计">
      <div className="panel-heading"><div><span className="eyebrow">OVERVIEW</span><h2>状态统计</h2></div><span className="muted">{nodes.length} 个节点</span></div>
      {statuses.map((status) => <div className="status-count" key={status} data-status={status}>
        <span className="status-dot" /><span>{status}<small>{labels[status]}</small></span>
        <strong>{nodes.filter((item) => item.status === status).length}</strong>
      </div>)}
    </section>
    <p className="observer-note">此页面仅观察运行状态。执行由终端启动的行为树执行器负责。</p>
  </aside>;
}
