/**
 * @author lovelyyoshino
 * @date 2026-06-30
 * @version v1.2.0
 * @last_modified 2026-07-13
 * @changelog
 *   - v1.2.0 (2026-07-13): 覆盖离线恢复、节点面板重试和编辑生命周期
 *   - v1.1.0 (2026-07-13): 对齐真实 manifest 类型并覆盖后端错误提示
 */
import { expect, type Page, test } from '@playwright/test';

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

test.beforeEach(async ({ page }) => {
  await page.route('**/api/health', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, version: '0.1.0-test' }),
    });
  });

  await page.route('**/api/nodes', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(manifests),
    });
  });

  await page.route('**/api/tree/load', async (route) => {
    expect(route.request().method()).toBe('POST');
    const body = route.request().postDataJSON() as { xml: string };
    expect(body.xml).toContain('<root main_tree_to_execute="MainTree">');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, node_count: 8 }),
    });
  });

  await page.route('**/api/tree/tick', async (route) => {
    expect(route.request().method()).toBe('POST');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'SUCCESS',
        nodes: [
          { id: '1', status: 'SUCCESS' },
          { id: '2', status: 'SUCCESS' },
          { id: '3', status: 'SUCCESS' },
          { id: '4', status: 'SUCCESS' },
          { id: '5', status: 'SUCCESS' },
          { id: '6', status: 'SUCCESS' },
        ],
      }),
    });
  });

  await page.route('**/api/tree/run', async (route) => {
    expect(route.request().method()).toBe('POST');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        final_status: 'SUCCESS',
        transitions: [
          { node_id: 1, from: 'IDLE', to: 'RUNNING', seq: 0 },
          { node_id: 1, from: 'RUNNING', to: 'SUCCESS', seq: 1 },
          { node_id: 2, from: 'IDLE', to: 'SUCCESS', seq: 2 },
        ],
      }),
    });
  });

  await page.route('**/api/tree/validate', async (route) => {
    expect(route.request().method()).toBe('POST');
    const body = route.request().postDataJSON() as { xml: string };
    expect(body.xml).toContain('<root main_tree_to_execute="MainTree">');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, node_count: 8 }),
    });
  });

  await page.route('**/api/tree/format', async (route) => {
    expect(route.request().method()).toBe('POST');
    const body = route.request().postDataJSON() as { xml: string };
    expect(body.xml).toContain('<root main_tree_to_execute="MainTree">');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        node_count: 8,
        xml: '<root main_tree_to_execute="MainTree"><BehaviorTree ID="MainTree"><AlwaysSuccess/></BehaviorTree></root>',
      }),
    });
  });
});

const xmlPreview = (page: Page) => page.locator('textarea');

const btNode = (page: Page, registrationName: string) =>
  page.locator(`[data-testid="bt-node"][data-registration="${registrationName}"]`);

async function dragPaletteNode(
  page: Page,
  registrationName: string,
  offset = { x: 360, y: 180 },
) {
  const source = page.locator('[draggable="true"]').filter({ hasText: registrationName }).first();
  const canvas = page.getByTestId('bt-canvas').locator('.react-flow');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('BT canvas is not visible');

  const target = {
    x: box.x + Math.min(offset.x, box.width - 40),
    y: box.y + Math.min(offset.y, box.height - 40),
  };
  const dataTransfer = await page.evaluateHandle((name) => {
    const transfer = new DataTransfer();
    transfer.setData('application/bt-node', name);
    return transfer;
  }, registrationName);
  await source.dispatchEvent('dragstart', { dataTransfer });
  await canvas.dispatchEvent('dragover', { dataTransfer, clientX: target.x, clientY: target.y });
  await canvas.dispatchEvent('drop', { dataTransfer, clientX: target.x, clientY: target.y });
}

async function loadSample(page: Page) {
  await page.goto('/');
  await expect(page.getByText('后端：')).toContainText('已连接 v0.1.0-test');
  await page.getByRole('button', { name: '载入示例' }).first().click();
  await expect(page.getByText('巡逻序列').first()).toBeVisible();
}

test('loads editor, imports sample tree, and talks to mocked backend', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByText('BT Editor')).toBeVisible();
  await expect(page.getByText('节点面板', { exact: true })).toBeVisible();
  await expect(page.getByText('Sequence').first()).toBeVisible();
  await expect(page.getByText('后端：')).toContainText('已连接 v0.1.0-test');

  await page.getByRole('button', { name: '载入示例' }).first().click();
  await expect(page.getByText('巡逻序列').first()).toBeVisible();
  await expect(page.getByText('选择分支').first()).toBeVisible();

  await page.getByRole('button', { name: '载入到服务器' }).click();
  await expect(page.getByText('载入成功，节点数：8')).toBeVisible();

  await page.getByRole('button', { name: /Tick/ }).click();
  await expect(page.getByText('Tick 完成，根状态：SUCCESS')).toBeVisible();

  await expect(page.getByText('XML 脚本预览')).toBeVisible();
  await expect(page.locator('textarea')).toContainText('<Sequence name="巡逻序列">');

  await page.getByRole('button', { name: '后端校验' }).click();
  await expect(page.getByText('XML 校验通过，节点数：8')).toBeVisible();

  await page.getByRole('button', { name: '后端格式化' }).click();
  await expect(page.locator('textarea')).toContainText('<AlwaysSuccess/>');

  await page.getByRole('button', { name: /Run/ }).click();
  await expect(page.getByText('Run 完成：SUCCESS，状态变化 3 次').first()).toBeVisible();

  await page.getByRole('button', { name: '整理布局' }).click();
  await expect(page.getByText('布局已整理')).toBeVisible();
});

test('adds a palette node and edits instance and port properties in XML preview', async ({
  page,
}) => {
  await page.goto('/');

  await dragPaletteNode(page, 'PrintMessage');
  await expect(btNode(page, 'PrintMessage')).toBeVisible();
  await expect(xmlPreview(page)).toContainText('<PrintMessage message="hello bt"/>');

  await btNode(page, 'PrintMessage').click();
  await page.getByPlaceholder('可选，XML name 属性').fill('announce');
  await page.getByPlaceholder('默认: hello bt').fill('Watch mode armed');

  await expect(xmlPreview(page)).toContainText(
    '<PrintMessage name="announce" message="Watch mode armed"/>',
  );
});

test('connects a parent and child node into a valid exported structure', async ({
  page,
}) => {
  await page.goto('/');

  await dragPaletteNode(page, 'Sequence', { x: 320, y: 120 });
  await dragPaletteNode(page, 'AlwaysSuccess', { x: 460, y: 300 });

  const sequence = btNode(page, 'Sequence');
  const success = btNode(page, 'AlwaysSuccess');
  await expect(sequence).toBeVisible();
  await expect(success).toBeVisible();

  const source = sequence.locator('.react-flow__handle-bottom');
  const target = success.locator('.react-flow__handle-top');
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) throw new Error('Connection handles are not visible');

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
  await page.mouse.up();

  await expect(xmlPreview(page)).toContainText('<Sequence>');
  await expect(xmlPreview(page)).toContainText('  <AlwaysSuccess/>');
  await expect(xmlPreview(page)).toContainText('</Sequence>');
});

test('tick feedback updates node status and success coloring by preorder', async ({
  page,
}) => {
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

  await loadSample(page);
  await page.getByRole('button', { name: /Tick/ }).click();

  await expect(page.getByText('Tick 完成，根状态：SUCCESS')).toBeVisible();
  await expect(btNode(page, 'Sequence').first()).toHaveAttribute('data-status', 'SUCCESS');
  await expect(btNode(page, 'PrintMessage').first()).toHaveAttribute('data-status', 'RUNNING');
  await expect(btNode(page, 'Fallback').first()).toHaveAttribute('data-status', 'FAILURE');
  await expect(btNode(page, 'AlwaysSuccess').first()).toHaveAttribute('data-status', 'FAILURE');
  await expect(btNode(page, 'Sequence').first()).toHaveCSS('background-color', 'rgb(187, 247, 208)');
});

test('imports exported server XML into the editor with structural consistency', async ({
  page,
}) => {
  await page.route('**/api/tree/export', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        xml: [
          '<root main_tree_to_execute="MainTree">',
          '  <BehaviorTree ID="MainTree">',
          '    <Sequence name="server_root">',
          '      <Retry num_attempts="3">',
          '        <PrintMessage message="{status_message}"/>',
          '      </Retry>',
          '      <AlwaysSuccess/>',
          '    </Sequence>',
          '  </BehaviorTree>',
          '</root>',
        ].join('\n'),
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: '从服务器导入' }).click();

  await expect(page.getByText('已从服务器导入 4 个节点')).toBeVisible();
  await expect(btNode(page, 'Sequence')).toBeVisible();
  await expect(btNode(page, 'Retry')).toBeVisible();
  await expect(btNode(page, 'PrintMessage')).toBeVisible();
  await expect(btNode(page, 'AlwaysSuccess')).toBeVisible();
  await expect(xmlPreview(page)).toContainText('<Sequence name="server_root">');
  await expect(xmlPreview(page)).toContainText('<Retry num_attempts="3">');
  await expect(xmlPreview(page)).toContainText(
    '<PrintMessage message="{status_message}"/>',
  );
});

test('surfaces a backend tick error as an accessible alert', async ({ page }) => {
  await page.route('**/api/tree/tick', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'tick failed' }),
    });
  });

  await loadSample(page);
  await page.getByRole('button', { name: '载入到服务器' }).click();
  await expect(page.getByText('载入成功，节点数：8')).toBeVisible();
  await page.getByRole('button', { name: /Tick/ }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Tick 失败：HTTP 500' }),
  ).toContainText('Tick 失败：HTTP 500 Internal Server Error @ /api/tree/tick');
});

test('keeps local editing available offline and restores backend controls after reconnect', async ({
  page,
}) => {
  let backendOnline = false;
  await page.route('**/api/health', async (route) => {
    if (!backendOnline) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'offline' }),
      });
      return;
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, version: '0.1.0-recovered' }),
    });
  });

  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('后端未连接');
  await expect(page.getByRole('button', { name: '载入到服务器' })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Tick/ })).toBeDisabled();

  await page.getByRole('button', { name: '载入示例' }).first().click();
  await expect(page.getByText('巡逻序列').first()).toBeVisible();

  backendOnline = true;
  await page.getByRole('button', { name: '重新检测' }).click();
  await expect(page.getByText('后端：')).toContainText('已连接 v0.1.0-recovered');
  await expect(page.getByRole('button', { name: '载入到服务器' })).toBeEnabled();
  await expect(page.getByRole('button', { name: /Tick/ })).toBeEnabled();
});

test('recovers the palette after a failed manifest request', async ({ page }) => {
  let manifestsAvailable = false;
  await page.route('**/api/nodes', async (route) => {
    if (!manifestsAvailable) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'manifest unavailable' }),
      });
      return;
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(manifests),
    });
  });

  await page.goto('/');
  await expect(page.getByText(/加载失败：HTTP 503/)).toBeVisible();
  await expect(page.locator('[draggable="true"]')).toHaveCount(0);

  manifestsAvailable = true;
  await page.getByRole('button', { name: '刷新' }).click();
  await expect(page.locator('[draggable="true"]')).toHaveCount(manifests.length);
  await expect(page.getByText('PrintMessage').first()).toBeVisible();
});

test('resets status, deletes a connected node, and clears the editor lifecycle', async ({
  page,
}) => {
  await loadSample(page);
  await page.getByRole('button', { name: /Tick/ }).click();
  await expect(page.locator('[data-testid="bt-node"][data-status="SUCCESS"]')).not.toHaveCount(0);

  await page.getByRole('button', { name: '重置运行态' }).click();
  await expect(page.locator('[data-testid="bt-node"][data-status="IDLE"]')).toHaveCount(8);

  await btNode(page, 'PrintMessage').first().click();
  await page.getByRole('button', { name: '删除该节点' }).click();
  await expect(btNode(page, 'PrintMessage')).toHaveCount(1);
  await expect(xmlPreview(page)).not.toContainText('message="开始巡逻"');

  await page.getByRole('button', { name: '清空' }).click();
  await expect(page.getByTestId('bt-node')).toHaveCount(0);
  await expect(page.getByText('画布还是空的')).toBeVisible();
  await expect(page.getByText('在画布上选中一个节点以编辑其属性。')).toBeVisible();
  await expect(page.getByRole('button', { name: '复制' })).toBeDisabled();
});
