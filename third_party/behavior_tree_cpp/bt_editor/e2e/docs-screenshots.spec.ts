/**
 * @author lovelyyoshino
 * @date 2026-06-30
 * @version v1.3.0
 * @last_modified 2026-07-13
 * @changelog
 *   - v1.3.0 (2026-07-13): 文档视口断言辅助浮层不再遮挡节点
 *   - v1.1.0 (2026-07-13): 第四张截图改为真实属性/XML 编辑状态
 *   - v1.1.1 (2026-07-13): 首图聚焦空画布工作区，避免把无树导出提示当成功状态
 *   - v1.1.2 (2026-07-13): 收紧首图裁剪范围，完整排除空树 XML 提示区
 *   - v1.2.0 (2026-07-13): 支持临时输出目录，供发布 gate 无损验证截图
 */
import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const screenshotDir = path.resolve(
  process.cwd(),
  process.env.BT_SCREENSHOT_DIR ?? '../docs/blog/screenshots',
);

const manifests = [
  { registration_name: 'Sequence', type: 'Control', ports: [] },
  { registration_name: 'Fallback', type: 'Control', ports: [] },
  { registration_name: 'Inverter', type: 'Decorator', ports: [] },
  {
    registration_name: 'Retry',
    type: 'Decorator',
    ports: [
      {
        name: 'num_attempts',
        direction: 'input',
        type_name: 'int',
        default_value: '1',
        description: '最大尝试次数',
        enum_values: [],
      },
    ],
  },
  { registration_name: 'AlwaysSuccess', type: 'Condition', ports: [] },
  { registration_name: 'AlwaysFailure', type: 'Condition', ports: [] },
  {
    registration_name: 'PrintMessage',
    type: 'Action',
    ports: [
      {
        name: 'message',
        direction: 'input',
        type_name: 'string',
        default_value: 'hello bt',
        description: '消息',
        enum_values: [],
      },
    ],
  },
];

test.use({
  viewport: { width: 1200, height: 664 },
  deviceScaleFactor: 2,
});

async function mockBackend(page: Page) {
  await page.route('**/api/health', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, version: '0.1.0-docs' }),
    });
  });

  await page.route('**/api/nodes', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(manifests),
    });
  });

  await page.route('**/api/tree/load', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, node_count: 8 }),
    });
  });

  await page.route('**/api/tree/tick', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'SUCCESS',
        nodes: [
          { id: '1', status: 'SUCCESS' },
          { id: '2', status: 'RUNNING' },
          { id: '3', status: 'FAILURE' },
          { id: '4', status: 'SUCCESS' },
          { id: '5', status: 'FAILURE' },
          { id: '6', status: 'SUCCESS' },
          { id: '7', status: 'RUNNING' },
          { id: '8', status: 'SUCCESS' },
        ],
      }),
    });
  });
}

test('capture documentation screenshots', async ({ page }) => {
  await mkdir(screenshotDir, { recursive: true });
  await mockBackend(page);

  await page.goto('/');
  await expect(page.getByText('BT Editor')).toBeVisible();
  await expect(page.getByText('后端：')).toContainText('已连接 v0.1.0-docs');
  await page.screenshot({
    path: path.join(screenshotDir, '01_editor_loaded.png'),
    clip: { x: 0, y: 0, width: 1200, height: 370 },
  });

  await page.getByRole('button', { name: '载入示例' }).first().click();
  await expect(page.getByText('巡逻序列').first()).toBeVisible();
  await expect(page.locator('.react-flow__minimap')).toBeHidden();
  await expect(page.locator('.bt-canvas-legend')).toBeHidden();
  await page.screenshot({
    path: path.join(screenshotDir, '02_sample_tree.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: /Tick/ }).click();
  await expect(page.getByText('Tick 完成，根状态：SUCCESS')).toBeVisible();
  await expect(page.locator('[data-testid="bt-node"][data-status="SUCCESS"]').first()).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, '03_tick_colored.png'),
    fullPage: true,
  });

  const printNode = page
    .locator('[data-testid="bt-node"][data-registration="PrintMessage"]')
    .first();
  await printNode.click();
  await page.getByPlaceholder('可选，XML name 属性').fill('recharge_notice');
  await page.getByPlaceholder('默认: hello bt').fill('Docking workflow complete');
  await expect(page.locator('textarea')).toContainText(
    '<PrintMessage name="recharge_notice" message="Docking workflow complete"/>',
  );
  await page.screenshot({
    path: path.join(screenshotDir, '04_tick_highlight_fixed.png'),
    fullPage: true,
  });
});
