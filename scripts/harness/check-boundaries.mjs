#!/usr/bin/env node
/**
 * harness:boundaries — platform packages must not leak secrets into UGC bridges.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const targets = [
  "packages/platform-contracts",
  "packages/platform-core",
  "packages/platform-artifact-router",
  "packages/platform-studio-build",
  "packages/platform-studio-sandbox",
  "packages/platform-adapter-supabase",
  "apps/platform",
];

let failed = false;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "generated") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|mjs|js)$/.test(name)) files.push(p);
  }
  return files;
}

for (const t of targets) {
  const dir = join(root, t);
  let files;
  try {
    files = walk(dir);
  } catch {
    continue;
  }
  for (const file of files) {
    if (/\.test\./.test(file)) continue;
    const src = readFileSync(file, "utf8");
    if (/workerEnv[\s\S]*process\.env/.test(src) && /studio-sandbox/.test(file)) {
      console.error("boundary: workerEnv must not forward process.env:", file);
      failed = true;
    }
    if (
      /UGC|ugc|iframe/.test(src) &&
      /accessToken|sessionToken/.test(src) &&
      /postMessage/.test(src)
    ) {
      console.error("boundary: possible token postMessage to UGC:", file);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("harness:boundaries — ok");
