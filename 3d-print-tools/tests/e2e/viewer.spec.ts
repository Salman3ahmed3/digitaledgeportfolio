import { expect, test } from "@playwright/test";
import { activate, expectDownload, expectModel, trackErrors, upload } from "./helpers";

const CASES: [string, string[]][] = [
  ["binary STL", ["cube-binary.stl"]],
  ["ASCII STL", ["cube-ascii.stl"]],
  ["OBJ + MTL", ["cube.obj", "cube.mtl"]],
  ["3MF", ["cube.3mf"]],
  ["PLY", ["cube.ply"]],
  ["GLB", ["cube.glb"]],
];

for (const [label, files] of CASES) {
  test(`viewer loads ${label}`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/stl-viewer");
    await upload(page, ...files);
    await expectModel(page);
    await expect(page.getByTestId("dims")).toContainText("20.0 × 20.0 × 20.0");
    await expect(page.getByTestId("model-info")).toContainText("Yes"); // watertight
    expect(errors).toEqual([]);
  });
}

test("viewer converts to 3MF after changing display settings", async ({ page }) => {
  await page.goto("/stl-viewer");
  await upload(page, "cube-binary.stl");
  await expectModel(page);
  await page.getByRole("radio", { name: "Wireframe" }).click();
  await page.getByRole("switch", { name: /Axes/ }).click();
  await page.getByLabel("File format").selectOption("3mf");
  await expectDownload(page, "3mf");
});

const PRESETS: [string, string[]][] = [
  ["/obj-viewer", ["cube.obj", "cube.mtl"]],
  ["/3mf-viewer", ["cube.3mf"]],
  ["/ply-viewer", ["cube.ply"]],
  ["/glb-viewer", ["cube.glb"]],
];
for (const [path, files] of PRESETS) {
  test(`${path} preset opens its format and converts to STL`, async ({ page }) => {
    await page.goto(path);
    await upload(page, ...files);
    await expectModel(page);
    await expectDownload(page, "stl");
  });
}

test("3D engine is not downloaded until the visitor interacts", async ({ page }) => {
  const chunks: string[] = [];
  page.on("request", (r) => r.url().includes("/_next/static/chunks/") && chunks.push(r.url()));
  await page.goto("/stl-viewer");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("tool-placeholder")).toBeVisible();
  const before = chunks.length;
  await activate(page);
  expect(chunks.length).toBeGreaterThan(before);
});

test("no third-party requests while using a tool (files stay local)", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (!["localhost", "127.0.0.1"].includes(u.hostname) && u.protocol.startsWith("http")) external.push(r.url());
  });
  await page.goto("/stl-viewer");
  await upload(page, "cube-binary.stl");
  await expectModel(page);
  await expectDownload(page, "obj");
  expect(external).toEqual([]);
});
