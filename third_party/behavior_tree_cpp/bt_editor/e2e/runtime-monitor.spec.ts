import { expect, test, type Page } from '@playwright/test';

const snapshot = {
  schema_version: 1, tree_id: 'ArmMove', sequence: 42, timestamp_ms: 1789459200000,
  root_status: 'RUNNING',
  nodes: [
    { key: 'n0', name: 'Main sequence', registration_name: 'Sequence', kind: 'Control', path: '0', status: 'RUNNING' },
    { key: 'n1', name: 'Ready', registration_name: 'CheckReady', kind: 'Condition', path: '0/0', status: 'SUCCESS' },
    { key: 'n2', name: 'Move arm', registration_name: 'MoveJ', kind: 'Action', path: '0/1', status: 'FAILURE' },
    { key: 'n3', name: 'Wait', registration_name: 'Delay', kind: 'Decorator', path: '0/2', status: 'IDLE' },
  ],
};

async function mockRuntime(page: Page, initial: unknown = snapshot) {
  const state = { snapshot: initial, failed: false, requests: 0, mutations: [] as string[] };
  await page.route('**/api/**', async (route) => {
    if (route.request().method() !== 'GET') state.mutations.push(route.request().url());
    if (new URL(route.request().url()).pathname === '/api/runtime') {
      state.requests++;
      await route.fulfill({ status: state.failed ? 503 : 200, json: state.failed ? { error: 'Unavailable' } : state.snapshot });
    } else await route.fulfill({ status: 404, json: { error: 'No server-owned tree' } });
  });
  return state;
}

test('waits in IDLE until executor data arrives, without an editing surface', async ({ page }) => {
  const state = await mockRuntime(page, { state: 'IDLE', root_status: 'IDLE', nodes: [] });
  await page.goto('/?tree=arm_move.xml');
  await expect(page.getByText('等待执行器发布运行树')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('已连接');
  await expect(page.getByRole('region', { name: '运行概况' }).getByText('IDLE')).toBeVisible();
  state.snapshot = snapshot;
  await expect(page.getByRole('heading', { name: 'ArmMove' })).toBeVisible();
  await expect(page.getByRole('treeitem')).toHaveCount(4);
  await expect(page.locator('textarea, [draggable="true"], [contenteditable="true"], .react-flow')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /XML|载入|导出|保存|清空|Tick|Run|单步|运行/ })).toHaveCount(0);
  await page.getByRole('treeitem').filter({ hasText: 'Move arm' }).getByRole('button').click();
  await expect(page.getByRole('region', { name: '节点详情' })).toContainText('MoveJ');
  await expect(page.getByRole('region', { name: '节点详情' }).locator('input, select, textarea')).toHaveCount(0);
  expect(state.mutations).toEqual([]);
});

test('collapses branches, searches descendants, and exposes distinguishable status colors', async ({ page }) => {
  await mockRuntime(page);
  await page.goto('/');
  await expect(page.getByRole('treeitem')).toHaveCount(4);
  const colors = await page.getByRole('treeitem').locator('.status-badge').evaluateAll((badges) =>
    badges.map((badge) => getComputedStyle(badge).color));
  expect(new Set(colors).size).toBe(4);
  await page.getByRole('button', { name: '折叠 Main sequence' }).click();
  await expect(page.getByRole('treeitem')).toHaveCount(1);
  await page.getByRole('searchbox', { name: '搜索节点' }).fill('movej');
  await expect(page.getByRole('treeitem')).toHaveCount(2);
  await expect(page.getByRole('treeitem').filter({ hasText: 'Main sequence' })).toBeVisible();
  await expect(page.getByRole('treeitem').filter({ hasText: 'Move arm' })).toBeVisible();
  await page.getByRole('searchbox', { name: '搜索节点' }).fill('unmatched');
  await expect(page.getByText('没有匹配的节点')).toBeVisible();
  await page.getByRole('searchbox', { name: '搜索节点' }).clear();
  await expect(page.getByRole('treeitem')).toHaveCount(1);
  await page.getByRole('button', { name: '展开 Main sequence' }).click();
  await expect(page.getByRole('treeitem')).toHaveCount(4);
});

test('pauses requests, resumes live data, and preserves stale data on an outage', async ({ page }) => {
  const state = await mockRuntime(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ArmMove' })).toBeVisible();
  await page.getByRole('button', { name: '暂停刷新' }).click();
  const count = state.requests;
  state.snapshot = { ...snapshot, sequence: 99 };
  await page.waitForTimeout(1100);
  expect(state.requests).toBe(count);
  await expect(page.getByText('页面刷新已暂停，执行器继续运行。')).toBeVisible();
  await page.getByRole('button', { name: '恢复刷新' }).click();
  await expect(page.getByRole('region', { name: '运行概况' })).toContainText('99');
  state.failed = true;
  await expect(page.getByRole('alert')).toContainText('连接中断');
  await expect(page.getByRole('treeitem')).toHaveCount(4);
  await expect(page.getByRole('region', { name: '运行概况' })).toContainText('最后更新');
  state.failed = false;
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(state.mutations).toEqual([]);
});

test('keeps the tree and read-only details reachable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRuntime(page);
  await page.goto('/');
  await page.getByRole('treeitem').filter({ hasText: 'Move arm' }).getByRole('button').click();
  await expect(page.getByRole('region', { name: '节点详情' })).toContainText('0/1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/runtime-monitor-phone.png', fullPage: true });
});
