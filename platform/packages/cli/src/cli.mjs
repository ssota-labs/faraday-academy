// Command routing + argument parsing for the `faraday` CLI.
// Design mirrors the references: non-interactive by default, deterministic exit
// codes, side effects injectable via `context` so tests run without spawning.
import path from "node:path";
import fs from "node:fs/promises";
import spawn from "node:child_process";
import { generateLesson } from "./generate.mjs";
import { sanitizePackageName } from "./pkg.mjs";

const HELP = `faraday — scaffold AI-authored interactive lessons (shadcn-based)

Usage:
  faraday new <name> [--at <dir>] [--overwrite] [--skip-install] [--json]
  faraday check [--dir <lesson>]        verify the lesson layout + runtime pin
  faraday help

The generated lesson depends on the versioned @faraday-academy/runtime package
(pinned exactly) instead of vendoring it. Author your lesson in src/lesson/.

  --3d / --physics / --tutor are being repackaged as @faraday-academy/* addon
  packages and are temporarily unavailable; scaffold a 2D lesson for now.

Exit codes: 0 ok · 1 check failed · 2 usage error · 4 environment error`;

function makeContext(context = {}) {
  return {
    cwd: context.cwd ?? process.cwd(),
    env: context.env ?? process.env,
    stdout: context.stdout ?? ((s) => process.stdout.write(s)),
    stderr: context.stderr ?? ((s) => process.stderr.write(s)),
    runCommand: context.runCommand ?? defaultRunCommand,
    setExitCode: context.setExitCode ?? ((code) => { process.exitCode = code; }),
    throwOnError: context.throwOnError ?? false,
    uuid: context.uuid,
  };
}

function defaultRunCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn.spawn(command, args, { stdio: "inherit", shell: false, ...options });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)),
    );
  });
}

export async function runFaradayCli(argv, rawContext = {}) {
  const context = makeContext(rawContext);
  try {
    const [command, ...rest] = argv;
    if (!command || command === "help" || command === "--help" || command === "-h") {
      context.stdout(HELP + "\n");
      return;
    }
    if (command === "new") return await runNew(rest, context);
    if (command === "check") return await runCheck(rest, context);
    const err = new Error(`Unknown command: ${command}`);
    err.exitCode = 2;
    throw err;
  } catch (error) {
    const code = error.exitCode ?? 1;
    context.stderr(`faraday: ${error.message}\n`);
    context.setExitCode(code);
    if (context.throwOnError) throw error;
  }
}

function parseNewArgs(argv) {
  const opts = { name: undefined, at: undefined, overwrite: false, skipInstall: false, json: false, threeD: false, physics: false, tutor: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--at") opts.at = argv[++i];
    else if (arg === "--overwrite") opts.overwrite = true;
    else if (arg === "--skip-install") opts.skipInstall = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--3d") opts.threeD = true;
    else if (arg === "--physics") opts.physics = true;
    else if (arg === "--tutor") opts.tutor = true;
    else if (arg.startsWith("-")) { const e = new Error(`Unknown flag: ${arg}`); e.exitCode = 2; throw e; }
    else if (opts.name === undefined) opts.name = arg;
    else { const e = new Error(`Unexpected argument: ${arg}`); e.exitCode = 2; throw e; }
  }
  if (!opts.name) { const e = new Error("new requires a <name>"); e.exitCode = 2; throw e; }
  if (opts.at !== undefined && !opts.at) { const e = new Error("--at requires a value"); e.exitCode = 2; throw e; }
  return opts;
}

async function runNew(argv, context) {
  const opts = parseNewArgs(argv);
  const dirName = sanitizePackageName(opts.name).split("/").pop();
  const targetDir = opts.at
    ? path.resolve(context.cwd, opts.at)
    : path.resolve(context.cwd, dirName);

  const result = await generateLesson({
    targetDir,
    name: opts.name,
    force: opts.overwrite,
    threeD: opts.threeD,
    physics: opts.physics,
    tutor: opts.tutor,
    uuid: context.uuid,
  });

  const skip = opts.skipInstall || context.env.FARADAY_SKIP_INSTALL === "1";
  let installed = false;
  if (!skip) {
    try {
      const installStdio = opts.json ? ["ignore", "ignore", "inherit"] : "inherit";
      await context.runCommand("pnpm", ["install"], { cwd: targetDir, stdio: installStdio });
      installed = true;
    } catch (error) {
      const e = new Error(`pnpm install failed: ${error.message}`);
      e.exitCode = 4;
      throw e;
    }
  }

  const rel = path.relative(context.cwd, targetDir) || ".";
  if (opts.json) {
    context.stdout(JSON.stringify({
      ok: true, command: "new", title: result.title, packageName: result.packageName,
      dir: targetDir, installed,
      nextSteps: [`cd ${targetDir}`, ...(installed ? [] : ["pnpm install"]), "pnpm dev"],
    }, null, 2) + "\n");
  } else {
    context.stdout(
      `\n  Created ${result.title} in ${rel}/\n\n` +
      `  Next:\n    cd ${rel}\n${installed ? "" : "    pnpm install\n"}    pnpm dev\n\n` +
      `  Author your lesson in src/lesson/lesson.tsx — the UI, blocks, and runtime come\n` +
      `  from the pinned @faraday-academy/runtime dependency.\n`,
    );
  }
}

async function exists(p) { try { await fs.stat(p); return true; } catch { return false; } }

/** A lesson root is the nearest ancestor whose package.json depends on the runtime. */
async function findLessonRoot(start) {
  let dir = start;
  for (;;) {
    const pkgPath = path.join(dir, "package.json");
    if (await exists(pkgPath)) {
      try {
        const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
        if (pkg.dependencies?.["@faraday-academy/runtime"]) return dir;
      } catch {
        /* unreadable package.json — keep walking up */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const REQUIRED_FILES = [
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "components.json",
  "src/main.tsx",
  "src/app.css",
  "src/lesson/lesson.tsx",
  "package.json",
];

async function runCheck(argv, context) {
  let dir;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir") dir = argv[++i];
    else { const e = new Error(`Unknown argument: ${argv[i]}`); e.exitCode = 2; throw e; }
  }
  const start = dir ? path.resolve(context.cwd, dir) : context.cwd;
  const root = await findLessonRoot(start);
  if (!root) {
    const e = new Error("no @faraday-academy/runtime lesson found here — run inside a generated lesson");
    e.exitCode = 2;
    throw e;
  }

  const problems = [];
  for (const rel of REQUIRED_FILES) {
    if (!(await exists(path.join(root, rel)))) problems.push(`missing required file: ${rel}`);
  }
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
    const pin = pkg.dependencies?.["@faraday-academy/runtime"];
    if (!pin) problems.push("@faraday-academy/runtime is not a dependency");
    else if (!/^\d+\.\d+\.\d+/.test(pin)) problems.push(`@faraday-academy/runtime must be pinned exactly, found "${pin}"`);
  } catch {
    problems.push("package.json is missing or unreadable");
  }

  if (problems.length === 0) {
    context.stdout("faraday check: lesson layout intact, runtime pinned\n");
    return;
  }
  for (const p of problems) context.stderr(`  ${p}\n`);
  const e = new Error(`${problems.length} check finding(s)`);
  e.exitCode = 1;
  throw e;
}
