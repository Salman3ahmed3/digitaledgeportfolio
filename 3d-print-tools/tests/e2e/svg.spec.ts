import { expect, test } from "@playwright/test";
import { activate, expectDownload, expectModel, trackErrors, upload } from "./helpers";

async function setNumber(page: import("@playwright/test").Page, label: string, value: string) {
  const input = page.getByLabel(`${label} value`);
  await input.fill(value);
  await input.press("Enter");
}

test("SVG to STL: upload, change two settings, download STL", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/svg-to-stl");
  await upload(page, "multicolor.svg");
  await expectModel(page);
  await setNumber(page, "Real width", "90");
  await setNumber(page, "Height", "5");
  await expect(page.getByTestId("dims")).toContainText("90.0 ×");
  await expect(page.getByTestId("dims")).toContainText("× 5.0 mm");
  await expectDownload(page, "stl");
  expect(errors).toEqual([]);
});

test("SVG to STL: stroke-only file with line width", async ({ page }) => {
  await page.goto("/svg-to-stl");
  await upload(page, "stroke-only.svg");
  await expectModel(page);
  await page.getByText("Clean-up").click();
  await setNumber(page, "Line width", "2");
  await expectDownload(page, "stl");
});

test("SVG to 3MF preset downloads 3MF", async ({ page }) => {
  await page.goto("/svg-to-3mf");
  await upload(page, "multicolor.svg");
  await expectModel(page);
  await expectDownload(page, "3mf");
});

test("SVG to OBJ preset downloads OBJ", async ({ page }) => {
  await page.goto("/svg-to-obj");
  await upload(page, "letters.svg");
  await expectModel(page);
  await expectDownload(page, "obj");
});

test("Keychain maker: change shape and loop", async ({ page }) => {
  await page.goto("/keychain-maker");
  await upload(page, "letters.svg");
  await expectModel(page);
  await page.getByLabel("Plate shape").selectOption("circle");
  await page.getByRole("radio", { name: "Inside hole" }).click();
  await expect(page.getByTestId("model-info")).toContainText("Yes");
  await expectDownload(page, "stl");
});

test("Cookie cutter maker: set width and height", async ({ page }) => {
  await page.goto("/cookie-cutter-maker");
  await activate(page); // first interaction loads the 3D engine
  await page.getByText("No file handy? Try a sample").click();
  await expectModel(page);
  await setNumber(page, "Cutter width", "60");
  await setNumber(page, "Cutter height", "14");
  await expect(page.getByTestId("dims")).toContainText("× 14.0 mm");
  await expectDownload(page, "stl");
});

test("Text to STL: type text and change font", async ({ page }) => {
  await page.goto("/text-to-stl");
  await activate(page);
  await expectModel(page);
  await page.getByLabel("Text").fill("Maker");
  await page.getByLabel("Font").selectOption("bebas");
  await setNumber(page, "Real width", "70");
  await expect(page.getByTestId("dims")).toContainText("70.0 ×");
  await expectDownload(page, "stl");
});

test("SVG tool rejects PNG with a helpful link", async ({ page }) => {
  await page.goto("/svg-to-stl");
  await upload(page, "logo.png");
  await expect(page.getByRole("alert").filter({ hasText: "Image to STL" })).toBeVisible();
});
