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
