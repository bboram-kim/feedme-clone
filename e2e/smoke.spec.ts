import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 화면 제목과 URL 입력칸이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Feedme");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "웹페이지를 Markdown으로"
  );
  await expect(page.getByLabel("웹 페이지 URL")).toBeVisible();
});
