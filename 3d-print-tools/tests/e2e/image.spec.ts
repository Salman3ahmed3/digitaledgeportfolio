import { expect, test, type Page } from "@playwright/test";
import { expectDownload, expectModel, trackErrors, upload } from "./helpers";

async function setNumber(page: Page, label: string, value: string) {
  const input = page.getByLabel(`${label} value`, { exact: true });
  await input.fill(value);
  await input.press("Enter");
}

test("Image to STL heightmap: photo, change width and max height, download", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/image-to-stl");
  await upload(page, "photo.jpg");
  await expectModel(page);
  await setNumber(page, "Width", "120");
  await setNumber(page, "Max height", "6");
  await expect(page.getByTestId("dims")).toContainText("120.0 × 90.0 ×"); // Z depends on the brightest pixel
  await expectDownload(page, "stl");
  expect(errors).toEqual([]);
});

test("Image to STL extrude: logo, keyring + base", async ({ page }) => {
  await page.goto("/image-to-stl");
  await upload(page, "logo.png");
  await page.getByRole("radio", { name: "Extrude (logo)" }).click();
  await expectModel(page);
  await page.getByRole("radio", { name: "Outline" }).click();
  await page.getByRole("switch", { name: "Keyring loop" }).click();
  await expect(page.getByTestId("model-info")).toContainText("Yes");
  await expectDownload(page, "stl");
});

test("PNG to STL preset traces in extrude mode", async ({ page }) => {
  await page.goto("/png-to-stl");
  await upload(page, "logo.png");
  await expectModel(page);
  await setNumber(page, "Width", "80");
  await setNumber(page, "Extrude height", "4");
  await expect(page.getByTestId("dims")).toContainText("80.0 ×");
  await expectDownload(page, "stl");
});

test("JPG to STL preset", async ({ page }) => {
  await page.goto("/jpg-to-stl");
  await upload(page, "photo.jpg");
  await expectModel(page);
  await expectDownload(page, "stl");
});

test("Logo to STL preset", async ({ page }) => {
  await page.goto("/logo-to-stl");
  await upload(page, "logo.png");
  await expectModel(page);
  await expectDownload(page, "stl");
});

test("Image to OBJ and 3MF presets use their default format", async ({ page }) => {
  await page.goto("/image-to-obj");
  await upload(page, "photo.jpg");
  await expectModel(page);
  await expectDownload(page, "obj");
  await page.goto("/image-to-3mf");
  await upload(page, "logo.png");
  await expectModel(page);
  await expectDownload(page, "3mf");
});

test("Image tool routes SVG files to the SVG engine", async ({ page }) => {
  await page.goto("/image-to-stl");
  await upload(page, "multicolor.svg");
  await expect(page.getByText("SVG detected")).toBeVisible();
  await expectModel(page);
});
