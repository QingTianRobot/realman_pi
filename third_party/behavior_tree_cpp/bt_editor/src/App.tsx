import { useEffect, useState } from 'react';
import { fetchRuntimeResponse } from './api/client';
import { RuntimeTree } from './components/RuntimeTree';
import { RuntimeDetails } from './components/RuntimeDetails';
import type { RuntimeSnapshot } from './types';

export default function App() {
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot | null>(null);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedAt, setReceivedAt] = useState<number | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (paused) return;
    let active = true;
    let pending = false;
    let controller: AbortController | undefined;
    let etag: string | undefined;
    async function poll() {
      if (pending) return;
      pending = true;
      controller = new AbortController();
      // Bound an unreachable request; the next interval can recover automatically.
      const timeout = window.setTimeout(() => controller?.abort(), 5000);
      try {
        const result = await fetchRuntimeResponse(controller.signal, etag);
        if (active) {
          if (result.snapshot) {
            setSnapshot(result.snapshot);
            setReceivedAt(Date.now());
          }
          etag = result.etag ?? etag;
          setError(null);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        window.clearTimeout(timeout);
        pending = false;
      }
    }
    void poll();
    const interval = window.setInterval(() => void poll(), 500);
    return () => {
      active = false;
      window.clearInterval(interval);
      controller?.abort();
    };
  }, [paused]);

  const nodes = snapshot?.nodes ?? [];
  const selected = nodes.find((node) => node.key === selectedKey);
  const rootStatus = snapshot?.root_status ?? 'IDLE';
  const updatedAt = snapshot?.timestamp_ms ?? receivedAt;
  const connection = error ? '连接中断' : paused ? '刷新已暂停' : snapshot ? '已连接' : '连接中…';

  return <div className="runtime-monitor">
    <header className="monitor-header">
      <div className="brand"><span className="brand-mark" aria-hidden="true">⌘</span><div>
        <span className="eyebrow">REALMAN · BEHAVIOR TREE</span><h1>行为树运行监视器</h1>
      </div></div>
      <div className="monitor-controls">
        <span className={`connection-state ${error ? 'disconnected' : paused ? 'paused' : 'connected'}`} role="status"><span />{connection}</span>
        <button className="poll-toggle" onClick={() => setPaused((value) => !value)}>{paused ? '恢复刷新' : '暂停刷新'}</button>
      </div>
    </header>
    <main>
      <section className="runtime-overview" aria-label="运行概况">
        <div><span className="eyebrow">CURRENT TREE</span><h2>{snapshot?.tree_id || '等待执行器'}</h2><p>实时运行状态 · 只读监视</p></div>
        <dl className="runtime-metrics">
          <div><dt>序号</dt><dd>{snapshot?.sequence ?? '—'}</dd></div>
          <div><dt>根节点状态</dt><dd><span className="status-badge" data-status={rootStatus}>{rootStatus}</span></dd></div>
          <div><dt>最后更新</dt><dd className="update-time">{updatedAt ? <time dateTime={new Date(updatedAt).toISOString()}>{new Date(updatedAt).toLocaleString('zh-CN', { hour12: false })}</time> : '尚无快照'}</dd></div>
        </dl>
      </section>
      {error && <div className="connection-alert" role="alert"><strong>连接中断 · 当前数据可能已过期</strong><span>{error}</span><span>保留最后一次有效快照，刷新期间将自动重试。</span></div>}
      {paused && <p className="pause-notice">页面刷新已暂停，执行器继续运行。</p>}
      <div className="monitor-workspace">
        <RuntimeTree key={snapshot?.tree_id ?? 'waiting'} nodes={nodes} selectedKey={selectedKey} onSelect={setSelectedKey} />
        <RuntimeDetails node={selected} nodes={nodes} />
      </div>
    </main>
    <footer><span>REALMAN RUNTIME MONITOR</span><span>{paused ? '页面刷新已暂停' : '每 500 ms 自动刷新'}</span></footer>
  </div>;
}
