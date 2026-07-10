import fs from "node:fs";
import path from "node:path";

// Labs lives at platform/apps/labs but catalogs source from platform/packages/**
// and plugins/**. Resolve the repo root by walking up from the working dir until
// we find the folder that holds both `platform/` and `plugins/` — robust whether
// `next dev` runs from the app dir, the workspace root, or the repo root.
export function repoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "plugins")) && fs.existsSync(path.join(dir, "platform"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}
