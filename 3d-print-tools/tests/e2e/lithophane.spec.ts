import { expect, test, type Page } from "@playwright/test";
import { expectDownload, expectModel, trackErrors, upload } from "./helpers";

async function setNumber(page: Page, label: string, value: string) {
  const input = page.getByLabel(`${label} value`, { exact: true });
  await input.fill(value);
  await input.press("Enter");
}

test("Lithophane: upload, change two settings, backlit preview, download", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/lithophane-maker");
  await upload(page, "photo.jpg");
  await expectModel(page);
  await setNumber(page, "Width", "120");
  await setNumber(page, "Max thickness (dark areas)", "3.2");
  await page.getByRole("button", { name: "Backlit" }).click();
  await expect(page.getByTestId("model-info")).toContainText("Yes");
  await expect(page.getByTestId("model-info")).toContainText("PLA weight (est.)");
  await expectDownload(page, "stl");
  expect(errors).toEqual([]);
});

for (const shape of ["arc", "cylinder", "heart", "circle"]) {
  test(`Lithophane ${shape} shape builds a watertight model`, async ({ page }) => {
    await page.goto("/lithophane-maker");
    await upload(page, "photo.jpg");
    await expectModel(page);
    await page.getByLabel("Shape").selectOption(shape);
    await expect(page.getByTestId("model-info")).toContainText("Yes");
    await expectDownload(page, "stl");
  });
}
