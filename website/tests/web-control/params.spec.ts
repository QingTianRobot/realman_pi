import { expect, test } from "@playwright/test";

const SHA = { "ros/policy_task.yaml": "sha-policy", "ros/realman_motion.yaml": "sha-motion" };

function row(fields: Record<string, unknown>) {
  return { element: null, special: [], unit: "", max_ref: null, min_ref: null, readback: null, ...fields };
}

const EXECUTOR = "/realman_bt_executor";
const SNAPSHOT = {
  applies: { bt_start: "下次启动行为树生效", bringup_restart: "重启 bringup 后生效（行为树随之停止，需要重新启动）" },
  groups: [
    {
      id: "policy_safety", title: "策略任务 · 安全监督", file: "ros/policy_task.yaml", applies: "bt_start",
      rows: [
        row({ id: "policy_safety/joint_envelope_deg.lo[4]", key: "joint_envelope_deg.lo", element: 4,
          label: "joint_envelope_deg.lo · J5", kind: "float", min: -180, max: 180, unit: "deg",
          note: "策略运行时各关节下限", applies: "bt_start", file: "ros/policy_task.yaml", value: 3.5, baseline: 3.5,
          readback: { node: EXECUTOR, param: "policy_task.joint_envelope_deg.lo", element: 4 },
          max_ref: { key: "joint_envelope_deg.hi", id: "policy_safety/joint_envelope_deg.hi[4]", value: 108.2, strict: false } }),
        row({ id: "policy_safety/joint_envelope_deg.hi[4]", key: "joint_envelope_deg.hi", element: 4,
          label: "joint_envelope_deg.hi · J5", kind: "float", min: -180, max: 180, unit: "deg",
          note: "策略运行时各关节上限", applies: "bt_start", file: "ros/policy_task.yaml", value: 108.2, baseline: 108.2,
          readback: { node: EXECUTOR, param: "policy_task.joint_envelope_deg.hi", element: 4 },
          min_ref: { key: "joint_envelope_deg.lo", id: "policy_safety/joint_envelope_deg.lo[4]", value: 3.5, strict: false } }),
        row({ id: "policy_safety/stall.sec", key: "stall.sec", label: "stall.sec", kind: "float", min: 1, max: 60,
          unit: "s", note: "停滞持续这么久即停下重试。", applies: "bt_start", file: "ros/policy_task.yaml", value: 8,
          baseline: 10, readback: { node: EXECUTOR, param: "policy_task.stall.sec", element: null } }),
        row({ id: "policy_safety/current_guard.enabled", key: "current_guard.enabled", label: "current_guard.enabled",
          kind: "bool", min: null, max: null, note: "关节电流保护开关", applies: "bt_start", file: "ros/policy_task.yaml",
          value: true, baseline: true, readback: { node: EXECUTOR, param: "policy_task.current_guard.enabled", element: null } }),
        row({ id: "policy_safety/attempts", key: "attempts", label: "attempts", kind: "int", min: 1, max: 20,
          special: [-1], unit: "次", note: "允许失败的尝试次数；-1 = 不限。", applies: "bt_start",
          file: "ros/policy_task.yaml", value: 3, baseline: 3,
          readback: { node: EXECUTOR, param: "policy_task.attempts", element: null } }),
      ],
    },
    {
      id: "motion@r", title: "运动限速 · 驱动（r）", file: "ros/realman_motion.yaml", applies: "bringup_restart",
      rows: [
        row({ id: "motion@r/max_linear_speed_mps", key: "max_linear_speed_mps", label: "max_linear_speed_mps",
          kind: "float", min: 0.005, max: 0.25, unit: "m/s", note: "笛卡尔平移速度上限", applies: "bringup_restart",
          file: "ros/realman_motion.yaml", value: 0.15, baseline: 0.15,
          max_ref: { key: "hard_max_linear_speed_mps", id: null, value: 0.2, strict: false } }),
      ],
    },
  ],
  files: {
    "ros/policy_task.yaml": { sha: "sha-policy", baseline: true, external_change: false },
    "ros/realman_motion.yaml": { sha: "sha-motion", baseline: false, external_change: false },
  },
  writable: true, writable_error: "", errors: [], pending_restart: [] as string[],
};

const READBACK = {
  "policy_safety/joint_envelope_deg.lo[4]": { state: "applied", value: 3.5 },
  "policy_safety/joint_envelope_deg.hi[4]": { state: "applied", value: 108.2 },
  "policy_safety/stall.sec": { state: "pending", value: 10 },
  "policy_safety/current_guard.enabled": { state: "offline", value: null },
  "policy_safety/attempts": { state: "undeclared", value: null },
};

type Api = {
  snapshot: any; readback: any; history: any[]; launcher: any; snapshotHits: number;
  posts: { url: string; body: any }[]; reply: (url: string, body: any) => { status: number; json: any };
};

async function mockApi(page: any, setup: (api: Api) => void = () => {}): Promise<Api> {
  const api: Api = {
    snapshot: structuredClone(SNAPSHOT), readback: structuredClone(READBACK), history: [], launcher: { running: false },
    snapshotHits: 0, posts: [],
    reply: (_url, body) => ({ status: 200, json: { id: "e2", changes: (body.changes ?? []).map((change: any) => ({
      ...change, label: change.id, file: "ros/policy_task.yaml", applies: "bt_start", before: 0, after: change.value })),
      diff: "--- a/config/ros/policy_task.yaml\n+++ b/config/ros/policy_task.yaml\n@@ -1 +1 @@\n-x\n+y\n",
      applies: ["bt_start"] } }),
  };
  setup(api);
  await page.route("**/api/params", (route: any) => {
    api.snapshotHits += 1;
    return route.fulfill({ json: api.snapshot });
  });
  await page.route("**/api/params/readback", (route: any) => route.fulfill({ json: { nodes: {}, rows: api.readback } }));
  await page.route("**/api/params/history", (route: any) => route.fulfill({ json: { entries: api.history } }));
  await page.route("**/api/params/pending/clear", (route: any) => {
    api.posts.push({ url: "pending/clear", body: route.request().postDataJSON() });
    const cleared = api.snapshot.pending_restart;
    api.snapshot.pending_restart = [];
    return route.fulfill({ json: { cleared } });
  });
  for (const path of ["apply", "revert", "baseline/reset"]) {
    await page.route(`**/api/params/${path}`, (route: any) => {
      const body = route.request().postDataJSON();
      api.posts.push({ url: path, body });
      const { status, json } = api.reply(path, body);
      return route.fulfill({ status, json });
    });
  }
  await page.route("**/api/bt/trees", (route: any) => route.fulfill({ json: { available: true, launcher: api.launcher, trees: [] } }));
  await page.route("**/api/docker/restart", (route: any) => {
    if (route.request().method() === "POST") {
      api.posts.push({ url: "docker/restart", body: route.request().postDataJSON() });
      api.snapshot.pending_restart = [];  // the server clears the list after a restart it accepted
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ json: { available: true, service: "realman_bringup_remote", helper: { restarting: false } } });
  });
  return api;
}

const rowOf = (page: any, id: string) => page.locator(`tr[data-id="${id}"]`);
const cell = (page: any, id: string, column: number) => rowOf(page, id).locator("td").nth(column);

test("renders the catalog as a sheet with file, baseline and runtime values", async ({ page }) => {
  await mockApi(page);
  await page.goto("params.html");
  await expect(page.locator(".sheet th")).toHaveText(["#", "参数", "备注", "文件", "基线值", "文件值", "运行值", "暂存", "新值", "最小", "最大", "单位", "生效"]);
  await expect(page.locator("tr.group-band")).toHaveText(["策略任务 · 安全监督（5）", "运动限速 · 驱动（r）（1）"]);
  await expect(page.locator("#param-count")).toHaveText("共 6 项");
  const stall = "policy_safety/stall.sec";
  await expect(cell(page, stall, 4)).toHaveText("10.0");
  await expect(cell(page, stall, 5)).toHaveText("8.0");
  await expect(cell(page, stall, 5)).toHaveClass(/differs/);
  await expect(cell(page, stall, 6)).toHaveText("10.0");
  await expect(cell(page, stall, 12)).toContainText("待生效");
  await expect(cell(page, "policy_safety/joint_envelope_deg.lo[4]", 12)).toContainText("已生效");
  await expect(cell(page, "policy_safety/current_guard.enabled", 6)).toHaveText("未运行");
  await expect(cell(page, "policy_safety/attempts", 6)).toHaveText("未声明");
  await expect(cell(page, "policy_safety/attempts", 12)).toContainText("未声明");
  const speed = "motion@r/max_linear_speed_mps";
  await expect(cell(page, speed, 6)).toHaveText("—");
  await expect(cell(page, speed, 10)).toHaveText("0.2");
  await expect(cell(page, speed, 10)).toHaveAttribute("title", /hard_max_linear_speed_mps/);
  await expect(cell(page, speed, 12)).toHaveText("重启 bringup");
  await page.locator("#param-filter").fill("停滞");
  await expect(page.locator("#param-count")).toHaveText("1 / 6 项");
  await expect(page.locator("tr.group-band").nth(1)).toBeHidden();
});

test("keyboard staging: Enter stages and moves on, bad values stay out, Delete unstages", async ({ page }) => {
  await mockApi(page);
  await page.goto("params.html");
  const lo = rowOf(page, "policy_safety/joint_envelope_deg.lo[4]").locator("input");
  const hi = rowOf(page, "policy_safety/joint_envelope_deg.hi[4]").locator("input");
  await lo.fill("4");
  await lo.press("Enter");
  await expect(cell(page, "policy_safety/joint_envelope_deg.lo[4]", 7)).toContainText("4.0");
  await expect(hi).toBeFocused();
  await expect(page.locator("#staged-count")).toHaveText("暂存 1 项");
  await hi.fill("200");
  await hi.press("Enter");
  await expect(hi).toHaveClass(/invalid/);
  await expect(hi).toHaveAttribute("title", "高于最大值 180.0");
  await hi.fill("2");
  await expect(hi).toHaveAttribute("title", "必须 ≥ joint_envelope_deg.lo（4.0）");
  await hi.press("Escape");
  await expect(hi).toHaveValue("");
  const attempts = rowOf(page, "policy_safety/attempts").locator("input");
  await attempts.fill("-1");
  await attempts.press("Enter");
  await expect(page.locator("#staged-count")).toHaveText("暂存 2 项");
  await rowOf(page, "policy_safety/current_guard.enabled").locator("select").selectOption("false");
  await expect(cell(page, "policy_safety/current_guard.enabled", 7)).toContainText("false");
  await lo.focus();
  await lo.press("Delete");
  await expect(page.locator("#staged-count")).toHaveText("暂存 2 项");
  await page.reload();
  await expect(page.locator("#staged-count")).toHaveText("暂存 2 项");
  await page.locator("#clear-staged").click();
  await expect(page.locator("#staged-count")).toHaveText("暂存 0 项");
  await expect(page.locator("#write-config")).toBeDisabled();
});

test("writing shows the dry-run diff, then sends the staged values with the file hashes", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("params.html");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  const speed = rowOf(page, "motion@r/max_linear_speed_mps").locator("input");
  await speed.fill("0.18");
  await speed.press("Enter");
  api.reply = (_url, body) => ({ status: 200, json: {
    id: body.dry_run ? undefined : "20261026T010203Z-1",
    changes: [
      { id: "policy_safety/stall.sec", label: "stall.sec", file: "ros/policy_task.yaml", applies: "bt_start", before: 8, after: 9 },
      { id: "motion@r/max_linear_speed_mps", label: "max_linear_speed_mps", file: "ros/realman_motion.yaml",
        applies: "bringup_restart", before: 0.15, after: 0.18 },
    ],
    diff: "--- a/config/ros/policy_task.yaml\n+++ b/config/ros/policy_task.yaml\n@@ -1 +1 @@\n-        sec: 8.0\n+        sec: 9.0\n",
    applies: ["bringup_restart", "bt_start"],
  } });
  await page.locator("#write-config").click();
  const dialog = page.locator("#confirm-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".confirm-changes tr").nth(1).locator("td")).toHaveText(["stall.sec", "policy_task.yaml", "8.0", "9.0", "下次启动行为树"]);
  await expect(dialog.locator(".diff .add")).toHaveText("+        sec: 9.0\n");
  await expect(dialog.locator(".confirm-summary")).toContainText("重启 bringup 才生效的有 1 项");
  expect(api.posts[0]).toEqual({ url: "apply", body: {
    changes: [{ id: "policy_safety/stall.sec", value: 9 }, { id: "motion@r/max_linear_speed_mps", value: 0.18 }],
    expected_sha: SHA, dry_run: true,
  } });
  api.snapshot.groups[0].rows[2].value = 9;
  api.snapshot.groups[1].rows[0].value = 0.18;
  api.snapshot.pending_restart = ["motion@r/max_linear_speed_mps"];
  await dialog.locator("#confirm-ok").click();
  await expect(page.locator("#param-message")).toHaveText("已写入 2 项（记录 20261026T010203Z-1）。");
  expect(api.posts[1].body.dry_run).toBe(false);
  await expect(page.locator("#staged-count")).toHaveText("暂存 0 项");
  await expect(cell(page, "policy_safety/stall.sec", 5)).toHaveText("9.0");
  await expect(page.locator(".notice")).toContainText("有 1 项改动需要重启 bringup 才生效：max_linear_speed_mps");
  await expect(cell(page, "motion@r/max_linear_speed_mps", 12)).toContainText("待重启");
});

test("a typed value is staged when the cell loses focus, so 写入配置 works without Enter", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("params.html");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  // A valid value still in the cell already counts: the button must not look disabled while typing.
  await expect(page.locator("#write-config")).toBeEnabled();
  await stall.fill("-5");
  await expect(page.locator("#write-config")).toBeDisabled();
  await stall.fill("9");
  await stall.press("Escape");
  await expect(page.locator("#write-config")).toBeDisabled();
  await stall.fill("9");
  await stall.blur();
  await expect(page.locator("#staged-count")).toHaveText("暂存 1 项");
  await expect(stall).toHaveValue("");
  const hi = rowOf(page, "policy_safety/joint_envelope_deg.hi[4]").locator("input");
  await hi.fill("200");
  await hi.blur();
  await expect(hi).toHaveClass(/invalid/);
  await expect(page.locator("#staged-count")).toHaveText("暂存 1 项");
  await hi.press("Escape");
  const speed = rowOf(page, "motion@r/max_linear_speed_mps").locator("input");
  await speed.fill("0.18");
  api.reply = (_url, body) => ({ status: 200, json: { changes: [], diff: "", applies: [], id: body.dry_run ? undefined : "x" } });
  await page.locator("#write-config").click();
  await expect(page.locator("#confirm-dialog")).toBeVisible();
  expect(api.posts[0].body.changes).toEqual([
    { id: "policy_safety/stall.sec", value: 9 }, { id: "motion@r/max_linear_speed_mps", value: 0.18 },
  ]);
});

test("cancelling the dialog writes nothing", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("params.html");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  await page.locator("#write-config").click();
  await page.locator("#confirm-dialog button[value=cancel]").click();
  await expect(page.locator("#confirm-dialog")).toBeHidden();
  expect(api.posts.map((post) => post.body.dry_run)).toEqual([true]);
  await expect(page.locator("#staged-count")).toHaveText("暂存 1 项");
});

test("a conflict reloads the files and keeps the staged values; refused values mark their rows", async ({ page }) => {
  const api = await mockApi(page, (setup) => {
    setup.reply = () => ({ status: 409, json: { error: "files changed since the page read them; reload", files: ["ros/policy_task.yaml"] } });
  });
  await page.goto("params.html");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  const hitsBefore = api.snapshotHits;
  await page.locator("#write-config").click();
  await expect(page.locator("#param-error")).toContainText("写入没有执行：files changed since the page read them");
  await expect.poll(() => api.snapshotHits).toBeGreaterThan(hitsBefore);
  await expect(page.locator("#staged-count")).toHaveText("暂存 1 项");
  api.reply = () => ({ status: 400, json: { error: "some values are not acceptable",
    errors: [{ id: "policy_safety/stall.sec", error: "above the maximum 60" }] } });
  await page.locator("#write-config").click();
  await expect(page.locator("#param-error")).toContainText("stall.sec：above the maximum 60");
  await expect(rowOf(page, "policy_safety/stall.sec")).toHaveClass(/row-error/);
});

test("notices: running tree, pending restart with restart and dismiss", async ({ page }) => {
  const api = await mockApi(page, (setup) => {
    setup.snapshot.pending_restart = ["motion@r/max_linear_speed_mps"];
    setup.launcher = { running: true, tree: "control_pick.xml" };
  });
  await page.goto("params.html");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  await expect(page.locator(".notice").filter({ hasText: "control_pick.xml" })).toContainText("不会使用新写入的值");
  const pending = page.locator(".notice").filter({ hasText: "需要重启 bringup" });
  await pending.getByRole("button", { name: "重启 bringup" }).click();
  await pending.getByRole("button", { name: "确认重启？" }).click();
  await expect.poll(() => api.posts.map((post) => post.url)).toContain("docker/restart");
  await expect(page.locator("#param-message")).toContainText("已请求重启 bringup");
  await expect(page.locator(".notice").filter({ hasText: "需要重启 bringup" })).toHaveCount(0);
  api.snapshot.pending_restart = ["motion@r/max_linear_speed_mps"];
  await page.reload();
  await page.locator(".notice").filter({ hasText: "需要重启 bringup" }).getByRole("button", { name: "知道了" }).click();
  await expect.poll(() => api.posts.map((post) => post.url)).toContain("pending/clear");
  await expect(page.locator(".notice").filter({ hasText: "需要重启 bringup" })).toHaveCount(0);
});

test("read-only containers and a disabled page", async ({ page }) => {
  await mockApi(page, (setup) => {
    setup.snapshot.writable = false;
    setup.snapshot.writable_error = "/opt/rm65_ws/config/ros is read-only here";
  });
  await page.goto("params.html");
  await expect(page.locator(".notice.danger")).toContainText("只读：/opt/rm65_ws/config/ros is read-only here");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  await expect(page.locator("#write-config")).toBeDisabled();
  await page.route("**/api/params", (route: any) => route.fulfill({ status: 404, body: "parameter tuning is disabled" }));
  await page.reload();
  await expect(page.locator("#sheet")).toContainText("参数调试已关闭");
});

test("history lists writes and reverts through the same dry-run dialog", async ({ page }) => {
  const api = await mockApi(page, (setup) => {
    setup.history = [{ id: "20261026T000000Z-1", time: "2026-10-26T00:00:00+00:00", reverts: null,
      changes: [{ id: "policy_safety/stall.sec", label: "stall.sec", file: "ros/policy_task.yaml", applies: "bt_start", before: 10, after: 8 }],
      diff: "--- a/config/ros/policy_task.yaml\n+++ b/config/ros/policy_task.yaml\n" }];
    setup.reply = (_url, body) => ({ status: 200, json: { id: body.dry_run ? undefined : "e3", reverts: "20261026T000000Z-1",
      changes: [{ id: "policy_safety/stall.sec", label: "stall.sec", file: "ros/policy_task.yaml", applies: "bt_start", before: 8, after: 10 }],
      diff: "", changed_since: body.dry_run ? ["policy_safety/stall.sec"] : [] } });
  });
  await page.goto("params.html");
  await expect(page.locator("#history-count")).toHaveText("1 条");
  await page.locator(".history-entry").getByRole("button", { name: "撤回" }).click();
  await expect(page.locator("#confirm-title")).toHaveText("撤回这次修改");
  await expect(page.locator(".confirm-summary")).toContainText("之后又被改过，也会被改回：stall.sec");
  await page.locator("#confirm-ok").click();
  await expect(page.locator("#param-message")).toHaveText("已撤回 20261026T000000Z-1（新记录 e3）。");
  expect(api.posts.map((post) => [post.url, post.body.entry, post.body.dry_run])).toEqual([
    ["revert", "20261026T000000Z-1", true], ["revert", "20261026T000000Z-1", false],
  ]);
});

test("the page never scrolls sideways; the sheet scrolls inside its frame", async ({ page }) => {
  await mockApi(page);
  await page.goto("params.html");
  await expect(page.locator(".sheet")).toBeVisible();
  const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, view: window.innerWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.view + 1);
});

test("the control page links to the parameter page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.topbar a[href="/params.html"]')).toHaveText("参数调试");
});

test("every page shows the robot-arm mark and the favicon", async ({ page }) => {
  await mockApi(page);
  for (const path of ["/", "calibration.html", "params.html"]) {
    await page.goto(path);
    await expect(page.locator('link[rel="icon"]'), path).toHaveAttribute("href", "/favicon.svg");
    await expect(page.locator(".topbar .brand-mark svg.arm-icon"), path).toBeVisible();
  }
  expect((await page.request.get("/favicon.svg")).ok()).toBe(true);
});
