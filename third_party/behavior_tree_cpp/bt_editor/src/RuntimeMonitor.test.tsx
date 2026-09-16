import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const snapshot = {
  schema_version: 1, tree_id: 'ArmMove', sequence: 42, timestamp_ms: 1789459200000,
  root_status: 'RUNNING',
  tick_stats: { running: 1, success: 7, failure: 2, total: 10 },
  events: [
    {
      timestamp_ms: 1789459201000,
      severity: 'WARN',
      source: 'ROS_LOG',
      interface_name: '/rosout',
      phase: 'result',
      detail: 'unknown result response, ignoring...',
    },
    {
      timestamp_ms: 1789459202000,
      severity: 'ERROR',
      source: 'ACTION',
      interface_name: '/rm_driver/execute_motion',
      phase: 'result',
      detail: 'MoveJ goal rejected',
    },
    {
      timestamp_ms: 1789459203000,
      severity: 'INFO',
      source: 'SERVICE',
      interface_name: '/realman_bt_executor/start',
      phase: 'request',
      detail: 'Executor start accepted',
    },
    {
      timestamp_ms: 1789459204000,
      severity: 'INFO',
      source: 'EXECUTOR',
      interface_name: 'ArmMove',
      phase: 'tick',
      detail: 'Tick 42 completed',
    },
  ],
  nodes: [
    { key: 'n0', name: 'Main sequence', registration_name: 'Sequence', kind: 'Control', path: '0', status: 'RUNNING' },
    { key: 'n1', name: 'Ready', registration_name: 'CheckReady', kind: 'Condition', path: '0/0', status: 'SUCCESS' },
    { key: 'n2', name: 'Move arm', registration_name: 'MoveJ', kind: 'Action', path: '0/1', status: 'FAILURE', failure_reason: 'MoveJ timed out after 120 seconds' },
    { key: 'n3', name: 'Wait', registration_name: 'Delay', kind: 'Decorator', path: '0/2', status: 'IDLE' },
  ],
};

let container: HTMLDivElement;
let root: Root;
let response: unknown;
let failure = false;
let runtimeRequests: number;
let requests: Array<{ url: string; method: string }>;

beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  response = snapshot;
  failure = false;
  runtimeRequests = 0;
  requests = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input);
    requests.push({ url, method: init?.method ?? 'GET' });
    if (url === '/api/runtime') {
      runtimeRequests++;
      if (failure) throw new Error('Network unavailable');
      return new Response(JSON.stringify(response));
    }
    if (url === '/api/health') return new Response('{"ok":true,"version":"test"}');
    return new Response('[]');
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function render() { await act(async () => root.render(<App />)); }
async function advance(ms = 500) { await act(async () => vi.advanceTimersByTimeAsync(ms)); }
async function click(label: string) {
  const button = [...container.querySelectorAll('button')].find((item) => item.textContent?.includes(label) || item.getAttribute('aria-label') === label);
  expect(button, `button ${label}`).toBeTruthy();
  await act(async () => button!.click());
}

describe('read-only runtime monitor', () => {
  it('renders a waiting IDLE state before the executor publishes a tree', async () => {
    response = { state: 'IDLE', root_status: 'IDLE', nodes: [] };
    await render();
    expect(container.textContent).toContain('等待执行器');
    expect(container.textContent).toContain('IDLE');
    expect(container.textContent).toContain('已连接');
  });

  it('shows runtime metadata and all four node states without editor controls or mutations', async () => {
    await render();
    expect(container.textContent).toContain('ArmMove');
    expect(container.textContent).toContain('42');
    for (const status of ['RUNNING', 'SUCCESS', 'FAILURE', 'IDLE']) {
      expect(container.querySelector(`[role="treeitem"][data-status="${status}"]`)).not.toBeNull();
    }
    expect(container.querySelector('textarea, [contenteditable="true"], [draggable="true"], .react-flow')).toBeNull();
    expect(container.textContent).not.toMatch(/节点面板|属性编辑|XML|载入示例|导出|保存|单步|运行到/);
    expect([...container.querySelectorAll('button')].map((item) => item.textContent).join(' ')).not.toMatch(/Load|Save|Tick|Run|加载|运行/);
    expect(requests.every((item) => item.method === 'GET')).toBe(true);
    expect(requests.map((item) => item.url)).toContain('/api/runtime');
  });

  it('preserves the last snapshot and shows stale connection details until recovery', async () => {
    await render();
    failure = true;
    await advance();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('连接中断');
    expect(container.textContent).toContain('最后更新');
    expect(container.textContent).toContain('ArmMove');
    expect(container.textContent).toContain('Move arm');
    failure = false;
    response = { ...snapshot, sequence: 43, root_status: 'SUCCESS' };
    await advance();
    expect(container.querySelector('.connection-alert[role="alert"]')).toBeNull();
    expect(container.textContent).toContain('43');
  });

  it('pauses browser polling and resumes immediately without changing the executor', async () => {
    await render();
    await click('暂停刷新');
    const count = runtimeRequests;
    response = { ...snapshot, sequence: 99 };
    await advance(2000);
    expect(runtimeRequests).toBe(count);
    expect(container.textContent).toContain('执行器继续运行');
    expect(container.textContent).not.toContain('99');
    await click('恢复刷新');
    expect(container.textContent).toContain('99');
    expect(requests.every((item) => item.method === 'GET')).toBe(true);
  });

  it('collapses branches and reveals matching descendants with their ancestors when filtered', async () => {
    await render();
    await click('折叠 Main sequence');
    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(1);
    const input = container.querySelector('input[type="search"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'movej');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(2);
    expect(container.textContent).toContain('Move arm');
    expect(container.querySelector('[role="tree"]')?.textContent).not.toContain('Ready');
    await click('Move arm');
    expect(container.querySelector('[aria-label="节点详情"]')?.textContent).toContain('0/1');
    expect(container.querySelector('[aria-label="节点详情"] input')).toBeNull();
  });

  it('shows the selected node failure reason in the inspector', async () => {
    await render();
    await click('Move arm');
    expect(container.querySelector('[aria-label="节点详情"]')?.textContent).toContain('MoveJ timed out after 120 seconds');
  });

  it('shows cumulative tick outcome totals with success and failure bar widths', async () => {
    await render();
    const chart = container.querySelector('[aria-label="Tick 统计"]');
    expect(chart?.textContent).toContain('SUCCESS');
    expect(chart?.textContent).toContain('7');
    expect(chart?.textContent).toContain('FAILURE');
    expect(chart?.textContent).toContain('2');
    expect(chart?.textContent).toContain('总 Tick 10');
    expect(chart?.querySelector<HTMLElement>('[data-outcome="SUCCESS"]')?.style.width).toBe('70%');
    expect(chart?.querySelector<HTMLElement>('[data-outcome="FAILURE"]')?.style.width).toBe('20%');
  });

  it('renders diagnostic records newest first with all source labels and error emphasis', async () => {
    await render();
    const diagnostics = container.querySelector('[aria-label="诊断日志"]');
    const records = [...diagnostics!.querySelectorAll('[data-diagnostic-event]')];
    expect(records.map((record) => record.getAttribute('data-source'))).toEqual(['EXECUTOR', 'SERVICE', 'ACTION', 'ROS_LOG']);
    expect(records[0].textContent).toContain('EXECUTOR');
    expect(records[1].textContent).toContain('SERVICE');
    expect(records[2].textContent).toContain('ACTION');
    expect(records[3].textContent).toContain('ROS_LOG');
    expect(records[2].getAttribute('role')).toBe('alert');
  });

  it('renders ROS diagnostic detail verbatim without changing the selected failure reason', async () => {
    await render();
    await click('Move arm');
    const diagnostics = container.querySelector('[aria-label="诊断日志"]');
    expect(diagnostics?.textContent).toContain('unknown result response, ignoring...');
    expect(container.querySelector('[aria-label="节点详情"]')?.textContent).toContain('MoveJ timed out after 120 seconds');
  });

  it('uses the reference monitor palette and panel layout markers', async () => {
    await render();
    expect(container.querySelector('.monitor-header')).not.toBeNull();
    expect(container.querySelector('.runtime-tree-panel')).not.toBeNull();
    expect(container.querySelector('.detail-panel')).not.toBeNull();
  });

  it('rejects malformed successful responses without discarding the last snapshot', async () => {
    await render();
    response = { root_status: 'BOGUS', nodes: null };
    await advance();
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.textContent).toContain('Move arm');
  });
});
