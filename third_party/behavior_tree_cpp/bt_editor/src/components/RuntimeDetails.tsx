import type { RunStatus, RuntimeEvent, RuntimeNode, TickStats } from '../types';

const statuses: RunStatus[] = ['RUNNING', 'SUCCESS', 'FAILURE', 'IDLE'];
const labels: Record<RunStatus, string> = { RUNNING: '运行中', SUCCESS: '成功', FAILURE: '失败', IDLE: '未执行' };

function outcomeWidth(count: number, total: number) {
  return total > 0 ? `${Math.min(100, Math.round((count / total) * 100))}%` : '0%';
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false });
}

export function RuntimeDetails({
  node,
  nodes,
  tickStats,
  events,
}: {
  node: RuntimeNode | undefined;
  nodes: RuntimeNode[];
  tickStats?: TickStats;
  events: RuntimeEvent[];
}) {
  const stats = tickStats ?? { running: 0, success: 0, failure: 0, total: 0 };
  const diagnostics = [...events].sort((left, right) => right.timestamp_ms - left.timestamp_ms);

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
    <section className="detail-panel tick-summary" aria-label="Tick 统计">
      <div className="panel-heading"><div><span className="eyebrow">CUMULATIVE</span><h2>Tick 统计</h2></div><div className="tick-metrics"><span className="muted" data-tick-running>运行中 {stats.running}</span><span className="muted">总 Tick {stats.total}</span></div></div>
      <div className="tick-outcomes">
        {([
          ['SUCCESS', stats.success],
          ['FAILURE', stats.failure],
        ] as const).map(([outcome, count]) => <div className="tick-outcome" key={outcome} data-status={outcome}>
          <div className="tick-outcome-label"><span>{outcome}</span><strong>{count}</strong></div>
          <div className="tick-bar" aria-label={`${outcome} ${count} / ${stats.total}`}>
            <span className="tick-bar-fill" data-outcome={outcome} style={{ width: outcomeWidth(count, stats.total) }} />
          </div>
        </div>)}
      </div>
    </section>
    <section className="detail-panel diagnostic-panel" aria-label="诊断日志">
      <div className="panel-heading"><div><span className="eyebrow">DIAGNOSTICS</span><h2>诊断日志</h2></div><span className="muted">{diagnostics.length} 条</span></div>
      {diagnostics.length ? <div className="diagnostic-list">
        {diagnostics.map((event) => <article
          className="diagnostic-event"
          data-diagnostic-event
          data-source={event.source}
          key={`${event.timestamp_ms}-${event.source}-${event.interface_name}-${event.phase}-${event.detail}`}
          role={event.severity === 'ERROR' ? 'alert' : undefined}
        >
          <div className="diagnostic-event-meta">
            <span className="diagnostic-source">{event.source}</span>
            <span className={`diagnostic-severity severity-${event.severity}`}>{event.severity}</span>
            <time dateTime={new Date(event.timestamp_ms).toISOString()}>{formatTimestamp(event.timestamp_ms)}</time>
          </div>
          <div className="diagnostic-context"><span>{event.interface_name}</span><span>{event.phase}</span></div>
          <p>{event.detail}</p>
        </article>)}
      </div> : <p className="diagnostic-empty">尚无执行器诊断日志。</p>}
    </section>
    <p className="observer-note">此页面仅观察运行状态。执行由终端启动的行为树执行器负责。</p>
  </aside>;
}
