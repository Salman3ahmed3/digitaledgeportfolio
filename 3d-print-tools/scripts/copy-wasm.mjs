// Copies WASM binaries that workers load at runtime into /public so the
// static export can serve them. Runs automatically before dev and build.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "public/wasm"), { recursive: true });
copyFileSync(
  join(root, "node_modules/manifold-3d/manifold.wasm"),
  join(root, "public/wasm/manifold.wasm"),
);
console.log("copied manifold.wasm -> public/wasm/");
