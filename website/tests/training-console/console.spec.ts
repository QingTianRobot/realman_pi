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
