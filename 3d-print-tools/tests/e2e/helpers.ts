import { expect, type Page } from "@playwright/test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const fixture = (name: string) => join(dirname(fileURLToPath(import.meta.url)), "../fixtures", name);

export async function upload(page: Page, ...names: string[]) {
  await page.getByTestId("file-input").first().setInputFiles(names.map(fixture));
}

/** Click download and assert the file has the right extension and is non-empty. */
export async function expectDownload(page: Page, ext: string) {
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByTestId("download").click()]);
  expect(dl.suggestedFilename()).toMatch(new RegExp(`\\.${ext}$`));
  const path = await dl.path();
  const { statSync } = await import("node:fs");
  expect(statSync(path!).size).toBeGreaterThan(0);
  await expect(page.getByTestId("download-done")).toBeVisible();
  return path!;
}

export async function expectModel(page: Page) {
  await expect(page.getByTestId("model-info")).toBeVisible();
  await expect(page.getByTestId("triangles")).not.toHaveText("0");
}

/** Fail the test on uncaught page errors. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}
