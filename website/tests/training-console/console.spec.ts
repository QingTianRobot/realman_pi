import { expect, test, type Page } from "@playwright/test";

export const TOKEN = "e2e-token";
const PAGES = ["overview", "serve", "data", "train", "models"];

async function noHorizontalScroll(page: Page) {
  const [scroll, inner] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scroll).toBeLessThanOrEqual(inner);
}

test("the shell shows five tabs and the chain pills @mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("nav.tabs a")).toHaveText(["总览", "服务", "数据", "训练", "模型"]);
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
  await page.locator("#drawer-close").click();
  await expect(page.locator("#drawer")).toBeHidden();
});

test("overview: four status cards and the recent lists @mobile", async ({ page }) => {
  await page.goto("/#/overview");
  await expect(page.locator("#card-serve")).toContainText("pi05_realman_multitask_action_only/m_multitask_b16_2gpu");
  await expect(page.locator("#card-serve")).toContainText("29999");
  await expect(page.locator("#card-link")).toContainText("未通过");
  await expect(page.locator("#card-link")).toContainText("bulk_throughput");
  await expect(page.locator("#card-gpus .gpu-row")).toHaveCount(4);
  await expect(page.locator("#card-gpus")).toContainText("openpi-serve-openpi-1");
  await expect(page.locator("#card-train")).toContainText("a_new_run");
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
});

test("train: a new run needs GPUs and goes through the confirm dialog", async ({ page, request }) => {
  await page.goto("/#/train");
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
  await page.locator('#register-form input[name="status"]').fill("e2e");
  await page.locator("#start-register").click();
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake register done");
});
