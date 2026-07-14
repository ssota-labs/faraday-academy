#!/usr/bin/env node
/**
 * harness:docs — ensure STAGE2-PLATFORM.md and platform-contracts stay aligned.
 * Checks that contract titles referenced in docs exist in generated schema map.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const docsPath = join(root, "docs/STAGE2-PLATFORM.md");
const contractsPkg = join(root, "packages/platform-contracts");

const requiredMentions = [
  "CourseDefinition",
  "ReleaseManifest",
  "LearningEvent",
  "Entitlement",
  "PRACTICE",
  "OFFICIAL",
  "Artifact Router",
  "UgcBridge",
];

const docs = readFileSync(docsPath, "utf8");
const missing = requiredMentions.filter((m) => !docs.includes(m));
if (missing.length) {
  console.error("harness:docs — STAGE2-PLATFORM.md missing:", missing.join(", "));
  process.exit(1);
}

const gen = spawnSync(
  "pnpm",
  ["--filter", "@faraday-academy/platform-contracts", "build:schema"],
  { cwd: root, stdio: "inherit", shell: false },
);
if (gen.status !== 0) process.exit(gen.status ?? 1);

const schemaPath = join(contractsPkg, "generated/schemas.json");
if (!existsSync(schemaPath)) {
  console.error("harness:docs — schemas.json not generated");
  process.exit(1);
}

const outDir = join(root, "docs/generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "contracts-index.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      schemas: Object.keys(JSON.parse(readFileSync(schemaPath, "utf8"))),
    },
    null,
    2,
  ) + "\n",
);

console.log("harness:docs — ok");
