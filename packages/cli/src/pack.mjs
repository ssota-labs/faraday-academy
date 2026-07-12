// Module packs: install a self-contained pack (runtime half + skill half) into an
// existing lesson. This generalizes the hardcoded `--3d`/`--tutor` addon logic in
// generate.mjs into a declarative, manifest-driven flow. A pack lives at
// `packs/<name>/pack.json` (shipped with the CLI); `faraday pack add <name>` pins
// its runtime deps, wires CSS, copies files, and installs its skill reference +
// an AGENTS.md pointer so the agent knows the pack is available.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyDirectory, pathExists } from "./copy.mjs";
import { findLessonRoot } from "./doctor.mjs";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function packsRoot(root = PACKAGE_ROOT) {
  return path.join(root, "packs");
}

/** All packs shipped with the CLI: [{ name, ...manifest }]. */
export async function listPacks(root = PACKAGE_ROOT) {
  const dir = packsRoot(root);
  if (!(await pathExists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const packs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(dir, entry.name, "pack.json");
    if (!(await pathExists(manifestPath))) continue;
    try {
      const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
      packs.push({ name: entry.name, ...manifest });
    } catch {
      /* malformed manifest — skip in listing */
    }
  }
  return packs.sort((a, b) => a.name.localeCompare(b.name));
}

async function readManifest(packName, root = PACKAGE_ROOT) {
  const packDir = path.join(packsRoot(root), packName);
  const manifestPath = path.join(packDir, "pack.json");
  if (!(await pathExists(manifestPath))) {
    const err = new Error(`Unknown pack: ${packName} (try \`faraday pack list\`)`);
    err.exitCode = 2;
    throw err;
  }
  return { packDir, manifest: JSON.parse(await fs.readFile(manifestPath, "utf8")) };
}

function mergeSortedDeps(pkg, group, deps) {
  if (!deps) return;
  pkg[group] = { ...(pkg[group] ?? {}), ...deps };
  pkg[group] = Object.fromEntries(Object.entries(pkg[group]).sort(([a], [b]) => a.localeCompare(b)));
}

/** Copy a file or a directory from `from` to `to`. No-op if `from` is absent. */
async function copyEntry(from, to) {
  if (!(await pathExists(from))) return false;
  const st = await fs.stat(from);
  if (st.isDirectory()) {
    await copyDirectory(from, to);
  } else {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  }
  return true;
}

async function applyCopies(rules, packDir, lessonRoot) {
  for (const c of rules ?? []) {
    await copyEntry(path.join(packDir, c.from), path.join(lessonRoot, c.to));
  }
}

/** Append text to a file, idempotent via `marker`. Skips absent files. */
async function applyAppends(rules, lessonRoot) {
  for (const a of rules ?? []) {
    const dest = path.join(lessonRoot, a.to);
    try {
      const text = await fs.readFile(dest, "utf8");
      if (a.marker && text.includes(a.marker)) continue;
      await fs.appendFile(dest, a.text);
    } catch {
      /* target file absent — skip this append */
    }
  }
}

/**
 * Install a pack into the lesson containing `fromDir`.
 * @param {string} packName
 * @param {object} opts
 * @param {string} opts.fromDir        a path inside (or at) the target lesson
 * @param {string|null} [opts.variant] e.g. "physics"
 * @param {boolean} [opts.scaffold]    also stamp the pack's `scaffold` demo (new-lesson only)
 * @param {string} [opts.templateRoot] override CLI package root (tests)
 * @returns {Promise<{lessonRoot, packName, variant, addedDeps, installedRefs}>}
 */
export async function installPack(packName, opts) {
  const { fromDir, variant = null, scaffold = false, templateRoot } = opts;
  const { packDir, manifest } = await readManifest(packName, templateRoot);

  const lessonRoot = await findLessonRoot(fromDir);
  if (!lessonRoot) {
    const err = new Error(
      `not inside a Faraday lesson (no @faraday-academy/* dependency found from ${fromDir})`,
    );
    err.exitCode = 2;
    throw err;
  }

  if (variant && !manifest.runtime?.variants?.[variant]) {
    const err = new Error(`pack ${packName} has no variant "${variant}"`);
    err.exitCode = 2;
    throw err;
  }

  const rt = manifest.runtime ?? {};
  const addedDeps = [];

  // 1. runtime deps -> lesson package.json (base + variant)
  const pkgPath = path.join(lessonRoot, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  const before = JSON.stringify({ d: pkg.dependencies, dd: pkg.devDependencies });
  mergeSortedDeps(pkg, "dependencies", rt.dependencies);
  mergeSortedDeps(pkg, "devDependencies", rt.devDependencies);
  if (variant) {
    mergeSortedDeps(pkg, "dependencies", rt.variants[variant].dependencies);
    mergeSortedDeps(pkg, "devDependencies", rt.variants[variant].devDependencies);
  }
  if (JSON.stringify({ d: pkg.dependencies, dd: pkg.devDependencies }) !== before) {
    for (const name of Object.keys({ ...rt.dependencies, ...rt.devDependencies })) addedDeps.push(name);
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // 2. css imports -> src/app.css (idempotent)
  const appCss = path.join(lessonRoot, "src", "app.css");
  if (rt.cssImports?.length && (await pathExists(appCss))) {
    let css = await fs.readFile(appCss, "utf8");
    let changed = false;
    for (const imp of rt.cssImports) {
      const line = `@import "${imp}";`;
      if (!css.includes(line)) {
        css = (css.endsWith("\n") ? css : css + "\n") + line + "\n";
        changed = true;
      }
    }
    if (changed) await fs.writeFile(appCss, css);
  }

  // 3. copy runtime files (examples, author-editable source, assets) + appends
  await applyCopies(rt.copy, packDir, lessonRoot);
  await applyAppends(rt.appends, lessonRoot);

  // 3b. scaffold demo (new-lesson only, never on `pack add` into existing work)
  if (scaffold && manifest.scaffold) {
    await applyCopies(manifest.scaffold.copy, packDir, lessonRoot);
    if (variant && manifest.scaffold.variants?.[variant]) {
      await applyCopies(manifest.scaffold.variants[variant].copy, packDir, lessonRoot);
    }
    await applyAppends(manifest.scaffold.appends, lessonRoot);
  }

  // 4. skill half -> .faraday/packs/<name>/ + pointer into AGENTS.md / authoring.md
  const installedRefs = [];
  if (manifest.skill?.reference) {
    const refSrc = path.join(packDir, manifest.skill.reference);
    const destDir = path.join(lessonRoot, ".faraday", "packs", packName);
    await fs.mkdir(destDir, { recursive: true });
    const stat = await fs.stat(refSrc);
    let refRel;
    if (stat.isDirectory()) {
      await copyDirectory(refSrc, destDir);
      refRel = path.relative(lessonRoot, destDir);
    } else {
      const refDest = path.join(destDir, path.basename(manifest.skill.reference));
      await fs.copyFile(refSrc, refDest);
      refRel = path.relative(lessonRoot, refDest);
    }
    installedRefs.push(refRel);

    const when = manifest.skill.loadWhen ? ` Load it when ${manifest.skill.loadWhen}.` : "";
    const pointer =
      `\n> **Pack \`${packName}\`:** installed via \`faraday pack add ${packName}\`. ` +
      `Authoring guide at \`${refRel}\`.${when}\n`;
    const marker = `Pack \`${packName}\`:`;
    for (const doc of ["AGENTS.md", "docs/authoring.md"]) {
      const docPath = path.join(lessonRoot, doc);
      try {
        const text = await fs.readFile(docPath, "utf8");
        if (!text.includes(marker)) await fs.appendFile(docPath, pointer);
      } catch {
        /* doc absent — skip pointer for it */
      }
    }
  }

  // 5. provenance
  const provPath = path.join(lessonRoot, ".faraday", "provenance.json");
  try {
    const prov = JSON.parse(await fs.readFile(provPath, "utf8"));
    const tag = variant ? `${packName}:${variant}` : packName;
    prov.packs = Array.from(new Set([...(prov.packs ?? []), tag]));
    await fs.writeFile(provPath, JSON.stringify(prov, null, 2) + "\n");
  } catch {
    /* older lesson without provenance — skip */
  }

  return { lessonRoot, packName, variant, addedDeps, installedRefs };
}
