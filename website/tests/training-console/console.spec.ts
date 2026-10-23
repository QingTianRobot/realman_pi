import { expect, test, type Page } from "@playwright/test";

export const TOKEN = "e2e-token";
const PAGES = ["overview", "data", "train", "models", "serve"];

async function noHorizontalScroll(page: Page) {
  const [scroll, inner] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scroll).toBeLessThanOrEqual(inner);
}

test("the shell shows five tabs and the chain pills @mobile", async ({ page }) => {
  await page.goto("/");
  // 总览, then the pipeline in working order; each step carries a live status line.
  await expect(page.locator("nav.tabs a .tab-label")).toHaveText(["总览", "数据", "训练", "模型", "服务"]);
  await expect(page.locator("#meta-serve")).toHaveText("运行中");
  await expect(page.locator("#meta-models")).toContainText("已登记");
  await expect(page.locator("main#page")).toHaveAttribute("data-page", "overview");
  await expect(page.locator("#pill-serve")).toHaveText("推理 ● 运行中");
  await expect(page.locator("#pill-bridge")).toHaveText("桥接 ● 空闲");
  await page.locator("nav.tabs a[data-page=data]").click();
  await expect(page.locator("main#page")).toHaveAttribute("data-page", "data");
  await expect(page.locator("nav.tabs a[data-page=data]")).toHaveClass(/selected/);
});

test("no page scrolls sideways @mobile", async ({ page }) => {
  for (const id of PAGES) {
    await page.goto(`/#/${id}`);
    await expect(page.locator("main#page")).toHaveAttribute("data-page", id);
    await expect(page.locator("main#page .loading")).toHaveCount(0);
    await noHorizontalScroll(page);
  }
});

test("the jobs button opens the drawer with live logs", async ({ page, request }) => {
  const created = await request.post("/api/jobs", {
    headers: { "X-Training-Token": TOKEN },
    data: { kind: "linkcheck", params: { only: ["link"] }, confirm: true },
  });
  expect(created.status()).toBe(201);
  const { job } = await created.json();
  await page.goto("/");
  await page.locator("#jobs-button").click();
  await expect(page.locator("#drawer")).toBeVisible();
  await page.locator(`#drawer-jobs .item[data-job="${job.id}"]`).click();
  await expect(page.locator("#drawer-log")).toContainText("fake linkcheck done");
  await expect(page.locator("#drawer-job-head")).toContainText("成功");
  await expect(page.locator("#drawer-job-head")).not.toContainText("null");
  await page.locator("#drawer-close").click();
  await expect(page.locator("#drawer")).toBeHidden();
});

test("overview: three status cards and the recent lists @mobile", async ({ page }) => {
  await page.goto("/#/overview");
  await expect(page.locator("#card-serve")).toContainText("m_multitask_b16_2gpu @ 29999");
  await expect(page.locator("#card-serve")).toContainText("pi05_realman_multitask_action_only");
  await expect(page.locator("#card-serve")).toContainText("29999");
  await expect(page.locator("#card-link")).toContainText("未通过");
  await expect(page.locator("#card-link")).toContainText("bulk_throughput");
  await expect(page.locator("#card-gpus .gpu-row")).toHaveCount(4);
  await expect(page.locator("#card-gpus")).toContainText("openpi-serve-openpi-1");
  await expect(page.locator("#card-train")).toContainText("a_new_run");
  await expect(page.locator("#card-train")).toContainText("1.30 步/s");
  await expect(page.locator("#card-train")).toContainText("46 min");
  await expect(page.locator("#card-train")).toContainText("预计完成");
  await expect(page.locator("#recent-datasets tbody tr")).toHaveCount(3);
  await expect(page.locator("#latest-models")).toContainText("m_multitask_b16_2gpu");
  await page.locator("#recent-datasets tbody tr", { hasText: "realman__multitask_clean" }).click();
  await expect(page).toHaveURL(/#\/data\?path=realman__multitask_clean/);
});

const RAW = "raw_realman_ts_20261016/realman__pi05-three-arm";

test("data: suggested drops are pre-checked and a cleaned set is requested", async ({ page, request }) => {
  await page.goto(`/#/data?path=${encodeURIComponent(RAW)}`);
  await expect(page.locator("#dataset-list .item.selected")).toContainText("realman__pi05-three-arm");
  await expect(page.locator("#dataset-stats")).toContainText("5");
  await expect(page.locator("#dataset-stats")).toContainText("LeRobot v3.0");
  await expect(page.locator("#task-bars")).toContainText("pick_only");
  await expect(page.locator("#features")).toContainText("observation.gripper_position");
  const rows = page.locator("#quality-table tbody tr");
  await expect(rows).toHaveCount(5);
  const box = (ep: number) => page.locator(`#quality-table tr[data-episode="${ep}"] input.drop`);
  await expect(box(1)).toBeChecked();
  await expect(box(2)).toBeChecked();
  await expect(box(0)).not.toBeChecked();
  await expect(box(4)).not.toBeChecked();
  await expect(page.locator(`#quality-table tr[data-episode="4"]`)).toContainText("提示");
  await expect(page.locator("#quality-table svg.spark").first()).toBeVisible();
  await box(2).uncheck();
  await box(4).check();
  await expect(page.locator("#make-clean")).toHaveText("生成清洗版（剔除 2 条）");
  await page.locator("#make-clean").click();
  const dialog = page.locator("#confirm-dialog");
  await expect(dialog).toContainText("剔除 2 条：1, 4");
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator("#drawer")).toBeVisible();
  await expect(page.locator("#drawer")).toHaveAttribute("data-size", "large");
  await expect(page.locator("#drawer-log")).toContainText("fake clean done");
  const jobs = await (await request.get("/api/jobs?kind=clean")).json();
  expect(jobs.jobs[0].params.drop).toEqual([1, 4]);
  expect(jobs.jobs[0].params.reasons["1"]).toContain("closed plateau");
  expect(jobs.jobs[0].params.reasons["4"]).toBe("人工剔除");
});

test("data: a training view request carries the task prompts", async ({ page, request }) => {
  await page.goto("/#/data?path=realman__multitask_clean");
  await page.locator("#make-view").click();
  await expect(page.locator("#view-form")).toBeVisible();
  await expect(page.locator('#view-form input[data-task="pick_only"]')).toHaveValue("pick up the power adapter");
  await page.locator('#view-form input[name="dst"]').fill("e2e_view");
  await page.locator('#view-form input[name="dry_run"]').check();
  await page.locator("#view-start").click();
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake view done");
  const jobs = await (await request.get("/api/jobs?kind=view")).json();
  expect(jobs.jobs[0].params.task_prompts.pick_only).toBe("pick up the power adapter");
  expect(jobs.jobs[0].params.dry_run).toBe(true);
  expect(jobs.jobs[0].params.dst).toMatch(/e2e_view$/);
});

test("data: a training view says why it has no quality table", async ({ page }) => {
  await page.goto("/#/data?path=realman_right_arm_multitask_view");
  await expect(page.locator(".quality-unavailable")).toContainText("training view");
  await expect(page.locator("#make-clean")).toHaveCount(0);
  await expect(page.locator("#dataset-detail")).toContainText("pick up the power adapter and put it in the blue bin");
});

const MODEL = "pi05_realman_multitask_action_only/m_multitask_b16_2gpu";

test("train: curves, per-task eval and the prompt swap of a run", async ({ page }) => {
  await page.goto(`/#/train?run=${encodeURIComponent(MODEL)}`);
  await expect(page.locator("#run-list .item.selected")).toContainText("m_multitask_b16_2gpu");
  await expect(page.locator("#chart-loss path.line")).toHaveCount(1);
  await expect(page.locator("#chart-grad path.line")).toHaveCount(1);
  await expect(page.locator("#eval-table")).toContainText("0.096");
  await expect(page.locator("#eval-table")).toContainText("零动作基线");
  await expect(page.locator("#swap-table")).toContainText("0.187");
  await expect(page.locator("#run-detail .gpu-row")).toHaveCount(2);
  await expect(page.locator("#run-detail")).toContainText("平均速度");
  await expect(page.locator("#run-detail")).toContainText("1.33 步/s");
});

test("train: a live run shows its speed, time left and finish time", async ({ page }) => {
  await page.goto(`/#/train?run=${encodeURIComponent("pi05_realman_action_only/a_new_run")}`);
  await expect(page.locator("#run-detail")).toContainText("1.30 步/s");
  await expect(page.locator("#run-detail")).toContainText("46 min");
  await expect(page.locator("#run-list .item", { hasText: "a_new_run" })).toContainText("剩 46 min");
});

test("train: a new run needs GPUs and goes through the confirm dialog", async ({ page, request }) => {
  await page.goto("/#/train");
  await expect(page.locator("#new-run")).toBeHidden();
  await page.locator("#new-run-toggle").click();
  const form = page.locator("#train-form");
  await form.locator('input[name="config_name"]').fill("pi05_realman_multitask_action_only");
  await form.locator('select[name="view"]').selectOption("realman_right_arm_multitask_view");
  await form.locator('input[name="exp"]').fill("e2e_run");
  await page.locator("#start-train").click();
  await expect(page.locator("#train-error")).toContainText("GPU");
  await form.locator('input.gpu[data-gpu="1"]').check();
  await form.locator('input.gpu[data-gpu="3"]').check();
  await form.locator('input[name="batch"]').fill("16");
  await form.locator('input[name="dry_run"]').check();
  await page.locator("#start-train").click();
  await expect(page.locator("#confirm-dialog")).toContainText("GPU 1,3");
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake train done");
  const jobs = await (await request.get("/api/jobs?kind=train")).json();
  expect(jobs.jobs[0].params).toMatchObject({ exp: "e2e_run", gpus: "1,3", batch: 16, dry_run: true });
});

test("train: a dataset picked on the data page arrives in the new-run form", async ({ page }) => {
  await page.goto("/#/data?path=realman_right_arm_multitask_view");
  await page.locator("#train-from-view").click();
  await expect(page).toHaveURL(/#\/train\?view=realman_right_arm_multitask_view/);
  const view = page.locator('#train-form select[name="view"]');
  await expect(view).toHaveValue("realman_right_arm_multitask_view");
  await expect(page.locator("#train-dataset-info")).toContainText("pick up the power adapter 2 条");
  // Raw and cleaned sets are listed but need a training view first.
  await expect(view.locator("option[disabled]")).toHaveCount(2);
});

test("train: evaluate and register a run", async ({ page, request }) => {
  await page.goto(`/#/train?run=${encodeURIComponent(MODEL)}`);
  await page.locator('#eval-form select[name="gpu"]').selectOption("3");
  await page.locator("#start-eval").click();
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake eval done");
  await expect(page.locator("#drawer-job-head")).toContainText("成功");
  await page.waitForTimeout(500); // the page reloads itself when the job ends
  const evals = await (await request.get("/api/jobs?kind=eval")).json();
  expect(evals.jobs[0].params).toMatchObject({ gpu: "3", checkpoints: [29999], prompt_swap: null });
  await page.locator("#drawer-close").click(); // the floating log sits over the register form
  await page.locator('#register-form input[name="status"]').fill("e2e");
  await page.locator("#start-register").click();
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake register done");
});

test("serve: both ends, link checks with history and bridge stats", async ({ page }) => {
  await page.goto("/#/serve");
  await expect(page.locator("#serve-end")).toContainText("运行中");
  await expect(page.locator("#serve-end")).toContainText("openpi:dev");
  await expect(page.locator("#bridge-end")).toContainText("空闲");
  await expect(page.locator("#linkcheck-latest")).toContainText("bulk_throughput");
  await expect(page.locator("#linkcheck-latest")).toContainText("FAIL");
  await expect(page.locator("#linkcheck-history .item")).toHaveCount(2);
  await page.locator("#linkcheck-history .item").nth(1).click();
  await expect(page.locator("#linkcheck-latest")).toContainText("7.91 MB/s");
  await expect(page.locator("#bridge-stats")).toContainText("pick up the power adapter and put it in the blue bin");
  await expect(page.locator("#bridge-stats")).toContainText("26012");
});

test("serve: the served model's training data, its split and lineage", async ({ page }) => {
  await page.goto("/#/serve");
  const panel = page.locator("#serve-dataset");
  await expect(panel.locator("#serve-dataset-model")).toContainText("服务中");
  await expect(panel.locator("#serve-dataset-stats")).toContainText("3（训练 2 / 留出 1）");
  await expect(panel.locator("#serve-dataset-tasks")).toContainText("pick_only");
  await expect(panel.locator("#serve-dataset-tasks")).toContainText("训练 1 / 留出 1");
  await expect(panel.locator("#serve-dataset-lineage li")).toHaveCount(3);
  await expect(panel.locator("#serve-dataset-lineage")).toContainText("从上一级剔除 2 条");
  await expect(panel.locator("#serve-dataset-lengths rect")).not.toHaveCount(0);
  await expect(panel.locator("#serve-dataset-tags")).toContainText("还没有标签文件 episode_tags.json");
  await panel.locator("#serve-dataset-open").click();
  await expect(page).toHaveURL(/#\/data\?path=realman_right_arm_multitask_view/);
});

test("serve: settings are saved with the token and start asks first", async ({ page, request }) => {
  await page.goto("/#/serve");
  const form = page.locator("#serve-form");
  await expect(form.locator('select[name="model"]')).toHaveValue(MODEL);
  await form.locator('select[name="task"]').selectOption("pick_only");
  await form.locator('select[name="gpu"]').selectOption("3");
  await page.locator("#token").fill("wrong-token");
  await page.locator("#token").dispatchEvent("change");
  await page.locator("#save-settings").click();
  await expect(page.locator("#settings-message")).toContainText("wrong or missing token");
  await page.locator("#token").fill(TOKEN);
  await page.locator("#token").dispatchEvent("change");
  await page.locator("#save-settings").click();
  await expect(page.locator("#settings-message")).toContainText("已保存");
  const saved = await (await request.get("/api/serve/settings")).json();
  expect(saved.saved).toMatchObject({ gpu: 3, task: "pick_only" });
  await page.locator("#serve-start").click();
  await expect(page.locator("#confirm-dialog")).toContainText("GPU 3");
  await expect(page.locator("#confirm-dialog")).toContainText("pick up the power adapter");
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake serve done");
  await expect(page.locator("#drawer-job-head")).toContainText("成功");
  await page.waitForTimeout(500); // the page reloads itself when the job ends
  const jobs = await (await request.get("/api/jobs?kind=serve")).json();
  expect(jobs.jobs[0].params).toMatchObject({ action: "start", gpu: 3, task: "pick_only", model: MODEL });
  await page.locator("#serve-stop").click();
  await expect(page.locator("#confirm-dialog")).toContainText("先停桥接");
  await page.locator("#confirm-cancel").click();
  await expect(page.locator("#confirm-dialog")).toHaveCount(0);
});

test("models: registry, card and deploy to the serve page", async ({ page }) => {
  await page.goto("/#/models");
  const row = page.locator(`#model-table tr[data-model="${MODEL}"]`);
  await expect(row).toContainText("服务中");
  await expect(row).toContainText("0.096");
  await row.click();
  await expect(page.locator("#model-card")).toContainText("pi0.5 action-only fine-tune");
  await expect(page.locator("#model-card")).toContainText("pick up the power adapter");
  await expect(page.locator("#model-tags")).toContainText("还没有标签文件 episode_tags.json");
  // Rendered, not shown as source: a heading element, no literal "#", and the HTML comment is not printed as text.
  await expect(page.locator("#model-card-markdown h1")).toContainText("m_multitask_b16_2gpu");
  await expect(page.locator("#model-card-markdown")).not.toContainText("# m_multitask");
  await expect(page.locator("#model-card-markdown")).not.toContainText("generated by realman-train register");
  await expect(page.locator("#registry-markdown")).toContainText("模型登记表");
  await page.locator("#deploy").click();
  await expect(page).toHaveURL(/#\/serve\?model=/);
  await expect(page.locator('#serve-form select[name="model"]')).toHaveValue(MODEL);
});

test("drawer: re-selecting a finished job reopens its log", async ({ page, request }) => {
  // Create job1 and wait for it to finish before creating job2
  const makeJob = async () => {
    const r = await request.post("/api/jobs", {
      headers: { "X-Training-Token": TOKEN },
      data: { kind: "linkcheck", params: { only: ["link"] }, confirm: true },
    });
    expect(r.status()).toBe(201);
    return (await r.json()).job;
  };
  const job1 = await makeJob();
  // Poll until job1 is done before starting job2 (avoid conflict)
  for (let i = 0; i < 20; i++) {
    const r = await request.get(`/api/jobs/${job1.id}`);
    const data = await r.json();
    if (data.job.state === "succeeded" || data.job.state === "failed") break;
    await page.waitForTimeout(300);
  }
  const job2 = await makeJob();

  await page.goto("/");
  await page.locator("#jobs-button").click();
  await expect(page.locator("#drawer")).toBeVisible();

  // Select job1 (already finished) and wait for its log
  await page.locator(`#drawer-jobs .item[data-job="${job1.id}"]`).click();
  await expect(page.locator("#drawer-log")).toContainText("fake linkcheck done", { timeout: 10000 });
  await expect(page.locator("#drawer-job-head")).toContainText("成功");

  // Switch to job2 and wait for its log
  await page.locator(`#drawer-jobs .item[data-job="${job2.id}"]`).click();
  await expect(page.locator("#drawer-log")).toContainText("fake linkcheck done", { timeout: 10000 });

  // Re-select job1 — socket was closed and nulled; selecting again must reopen it
  await page.locator("#drawer-log").evaluate((el) => { el.textContent = ""; });
  await page.locator(`#drawer-jobs .item[data-job="${job1.id}"]`).click();
  await expect(page.locator("#drawer-log")).toContainText("fake linkcheck done", { timeout: 10000 });
});

test("the job log is a floating window that moves, switches size, hides and remembers", async ({ page }) => {
  await page.goto("/");
  const win = page.locator("#drawer");
  const fab = page.locator("#jobs-fab");
  await expect(win).toBeHidden();
  await expect(fab).toBeVisible();
  await fab.click();
  await expect(win).toBeVisible();
  await expect(fab).toBeHidden();
  await expect(win).toHaveAttribute("data-size", "small");
  await expect(page.locator("#drawer-log")).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/drawer-open/);
  const start = (await win.boundingBox())!;
  expect(start.width).toBeLessThan(500);

  const drag = async (from: { x: number; y: number }, to: { x: number; y: number }) => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 6 });
    await page.mouse.up();
  };
  const title = (await page.locator("#drawer-head h2").boundingBox())!;
  await drag({ x: title.x + 5, y: title.y + 5 }, { x: title.x - 300, y: title.y - 200 });
  const moved = (await win.boundingBox())!;
  expect(moved.x).toBeLessThan(start.x - 250);
  expect(moved.y).toBeLessThan(start.y - 150);
  const title2 = (await page.locator("#drawer-head h2").boundingBox())!;
  await drag({ x: title2.x + 5, y: title2.y + 5 }, { x: -400, y: -400 });
  const clamped = (await win.boundingBox())!;
  expect(clamped.x).toBeGreaterThanOrEqual(0);
  expect(clamped.y).toBeGreaterThanOrEqual(0);

  await page.locator("#drawer-size").click();
  await expect(win).toHaveAttribute("data-size", "large");
  await expect(page.locator("#drawer-log")).toBeVisible();
  const large = (await win.boundingBox())!;
  expect(large.width).toBeGreaterThan(700);
  const grip = (await page.locator("#drawer-grip").boundingBox())!;
  await drag({ x: grip.x + 8, y: grip.y + 8 }, { x: grip.x + 108, y: grip.y + 58 });
  const resized = (await win.boundingBox())!;
  expect(resized.width).toBeGreaterThan(large.width + 80);
  expect(resized.height).toBeGreaterThan(large.height + 30);

  await page.locator("#drawer-close").click();
  await expect(win).toBeHidden();
  await fab.click();
  expect(await win.boundingBox()).toEqual(resized);

  await page.reload();
  await expect(win).toBeVisible();
  await expect(win).toHaveAttribute("data-size", "large");
  expect(await win.boundingBox()).toEqual(resized);
  await page.keyboard.press("Escape");
  await expect(win).toBeHidden();
  await page.reload();
  await expect(fab).toBeVisible();
  await expect(win).toBeHidden();
});

test("the job log docks to the bottom on phones @mobile", async ({ page }) => {
  test.skip(page.viewportSize()!.width >= 720, "phones only");
  await page.goto("/");
  await page.locator("#jobs-fab").click();
  await page.locator("#drawer-size").click();
  const box = (await page.locator("#drawer").boundingBox())!;
  const view = page.viewportSize()!;
  expect(box.x).toBe(0);
  expect(Math.round(box.width)).toBe(view.width);
  expect(Math.round(box.y + box.height)).toBe(view.height);
  await expect(page.locator("#drawer-grip")).toBeHidden();
  await noHorizontalScroll(page);
});

test("data: tags show per episode and a tag filter joins the cleaned set", async ({ page, request }) => {
  await page.goto(`/#/data?path=${encodeURIComponent(RAW)}`);
  await expect(page.locator("#tags-facet")).toContainText("lighting_level");
  const light2 = page.locator('#tags-facet .tag-dist[data-key="lighting_level"] .tag-dist-row').first();
  await expect(light2).toContainText("2");
  await expect(light2).toContainText("3 条 · 60%");
  await expect(light2.locator(".tag-dist-bar i")).toHaveCount(2);
  await expect(page.locator('#tags-facet .tag-dist[data-key="failure_reason"]')).toContainText("1 条有内容");
  await expect(page.locator(`#quality-table tr[data-episode="2"]`)).toHaveClass(/failed/);
  await expect(page.locator(`#quality-table tr[data-episode="2"] td.tags`)).toContainText("失败");
  await page.locator(`#tag-filter input[data-key="lighting_level"][value="2"]`).check();
  await expect(page.locator("#drop-count")).toHaveText("已选 4 条（其中按标签 2 条）");
  await expect(page.locator(`#quality-table tr[data-episode="3"]`)).toHaveClass(/tag-drop/);
  await page.locator("#make-clean").click();
  const dialog = page.locator("#confirm-dialog");
  await expect(dialog).toContainText("剔除 4 条：1, 2, 3, 4");
  await expect(dialog).toContainText("lighting_level=2");
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake clean done");
  const jobs = await (await request.get("/api/jobs?kind=clean")).json();
  expect(jobs.jobs[0].params.where).toEqual(["lighting_level=2"]);
  expect(jobs.jobs[0].params.drop).toEqual([1, 2]);
});

test("data: refreshing tags goes through the confirm dialog", async ({ page }) => {
  await page.goto(`/#/data?path=${encodeURIComponent(RAW)}`);
  await page.locator("#tags-refresh").click();
  await expect(page.locator("#confirm-dialog")).toContainText("episode_meta.json");
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake tags_refresh done");
});
