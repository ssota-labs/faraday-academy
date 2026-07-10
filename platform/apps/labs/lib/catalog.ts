import "server-only";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./paths";

// ── Types ────────────────────────────────────────────────────────────────────

export type Component = {
  name: string;
  file: string; // basename
  relPath: string; // repo-relative source path
  summary: string; // leading `// <Name> — …` header doc
  exports: string[];
  isUtil: boolean; // no <Name>/pack- header → a helper, not a top-level component
};

export type ComponentGroup = {
  id: string;
  title: string;
  blurb: string;
  importPath: string;
  components: Component[];
};

export type Pack = {
  id: string;
  title: string;
  summary: string;
  relPath: string;
  tag: string;
};

export type SkillRef = { file: string; title: string };
export type Skill = { name: string; description: string; relPath: string; references: SkillRef[] };
export type Command = { name: string; description: string; relPath: string };
export type Agent = { name: string; description: string; relPath: string };
export type Plugin = {
  name: string;
  displayName: string;
  description: string;
  keywords: string[];
  relPath: string;
  host: string;
};

// ── Paths ────────────────────────────────────────────────────────────────────

const ROOT = repoRoot();
const RUNTIME = path.join(ROOT, "platform/packages/runtime");
const CLI_TEMPLATES = path.join(ROOT, "platform/packages/cli/templates");
const CC = path.join(ROOT, "plugins/claude-code");
const PLUGINS = path.join(ROOT, "plugins");

const rel = (abs: string) => path.relative(ROOT, abs).split(path.sep).join("/");
const readSafe = (file: string) => {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
};
const listFiles = (dir: string, ext: RegExp) => {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && ext.test(e.name))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
};

// ── Parsers ──────────────────────────────────────────────────────────────────

/** The leading `//` comment block of a source file, joined into one string. */
function headerDoc(text: string): string {
  const out: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*\/\/ ?(.*)$/);
    if (m) {
      out.push(m[1]);
      continue;
    }
    if (line.trim() === "") {
      if (out.length) break;
      continue;
    }
    break;
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

function displayName(doc: string, fallback: string): { name: string; isUtil: boolean } {
  const angle = doc.match(/^<([A-Za-z0-9]+)>/);
  if (angle) return { name: angle[1], isUtil: false };
  const pack = doc.match(/^([a-z][a-z0-9-]+) —/);
  if (pack) return { name: pack[1], isUtil: false };
  return { name: fallback, isUtil: true };
}

function exportsOf(text: string): string[] {
  const names = new Set<string>();
  for (const m of text.matchAll(/export\s+(?:async\s+)?(?:function|const|class|type|interface)\s+([A-Za-z0-9_]+)/g)) {
    names.add(m[1]);
  }
  for (const m of text.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(",")) {
      const id = part
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        .trim();
      if (id && /^[A-Za-z]/.test(id)) names.add(id);
    }
  }
  return [...names];
}

function frontmatter(text: string): Record<string, string> {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const out: Record<string, string> = {};
  if (!m) return out;
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (mm) out[mm[1]] = mm[2].trim();
  }
  return out;
}

function firstH1(text: string): string {
  const m = text.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "";
}

// ── Loaders ──────────────────────────────────────────────────────────────────

const GROUP_DEFS = [
  {
    id: "blocks",
    dir: "blocks",
    title: "Blocks",
    importPath: "@/faraday/blocks",
    blurb: "The authoring API — lesson building blocks composed from shadcn UI. This is what lesson code writes against.",
  },
  {
    id: "ui",
    dir: "ui",
    title: "UI primitives",
    importPath: "@/faraday/ui",
    blurb: "Vendored shadcn / Base UI primitives the blocks are built on. Rarely used directly in a lesson.",
  },
  {
    id: "runtime",
    dir: "runtime",
    title: "Runtime",
    importPath: "@/faraday/runtime",
    blurb: "Lesson & course hosts, the stepper, motion helpers, and theming — the machinery that runs a lesson.",
  },
  {
    id: "world",
    dir: "world",
    title: "World",
    importPath: "@/faraday/world",
    blurb: "Curriculum-as-world: the host, HUD, progression store, and node context. Swappable packs live under world/packs.",
  },
  {
    id: "lms",
    dir: "lms",
    title: "LMS",
    importPath: "@/faraday/lms",
    blurb: "A progress recorder + dashboard components that attach to a single lesson or a whole curriculum.",
  },
] as const;

export function loadComponentGroups(): ComponentGroup[] {
  return GROUP_DEFS.map((g) => {
    const dir = path.join(RUNTIME, g.dir);
    const files = listFiles(dir, /\.(tsx|ts)$/).filter((f) => f !== "index.ts");
    const components: Component[] = files.map((file) => {
      const text = readSafe(path.join(dir, file));
      const doc = headerDoc(text);
      const base = file.replace(/\.(tsx|ts)$/, "");
      const { name, isUtil } = displayName(doc, base);
      return {
        name,
        file,
        relPath: rel(path.join(dir, file)),
        summary: doc,
        exports: exportsOf(text),
        isUtil,
      };
    });
    // real components first, helpers last; alpha within each
    components.sort((a, b) => Number(a.isUtil) - Number(b.isUtil) || a.name.localeCompare(b.name));
    return { id: g.id, title: g.title, blurb: g.blurb, importPath: g.importPath, components };
  });
}

const FEATURE_PACKS: Array<{ dir: string; title: string; tag: string; summary: string }> = [
  {
    dir: "starter",
    title: "starter",
    tag: "base",
    summary:
      "The app shell every lesson starts from — Vite + React, the two-zone layout, a demo lesson, AGENTS.md, and authoring docs. Copied to the project root.",
  },
  {
    dir: "addon-3d",
    title: "addon-3d",
    tag: "--3d / --physics",
    summary:
      "Three.js / React Three Fiber scene block + demo lessons and model assets. With --physics, adds the Rapier walkable-world extras.",
  },
  {
    dir: "addon-tutor",
    title: "addon-tutor",
    tag: "--tutor",
    summary:
      "The durable grounded AI tutor: chat UI vendored into the locked tree, Nitro api/ routes, a Workflow agent, and the Vite+Nitro config that makes the app server-backed.",
  },
];

export function loadWorldPacks(): Pack[] {
  const dir = path.join(RUNTIME, "world/packs");
  return listFiles(dir, /\.tsx$/).map((file) => {
    const text = readSafe(path.join(dir, file));
    const doc = headerDoc(text);
    const base = file.replace(/\.tsx$/, "");
    const { name } = displayName(doc, base);
    return { id: base, title: name, summary: doc, relPath: rel(path.join(dir, file)), tag: "world pack" };
  });
}

export function loadFeaturePacks(): Pack[] {
  return FEATURE_PACKS.filter((p) => fs.existsSync(path.join(CLI_TEMPLATES, p.dir))).map((p) => ({
    id: p.dir,
    title: p.title,
    summary: p.summary,
    relPath: rel(path.join(CLI_TEMPLATES, p.dir)),
    tag: p.tag,
  }));
}

export function loadSkill(): Skill | null {
  const skillFile = path.join(CC, "skills/faraday/SKILL.md");
  const text = readSafe(skillFile);
  if (!text) return null;
  const fm = frontmatter(text);
  const refDir = path.join(CC, "skills/faraday/references");
  const references: SkillRef[] = listFiles(refDir, /\.md$/).map((file) => ({
    file,
    title: firstH1(readSafe(path.join(refDir, file))) || file.replace(/\.md$/, ""),
  }));
  return {
    name: fm.name || "faraday",
    description: fm.description || "",
    relPath: rel(skillFile),
    references,
  };
}

export function loadCommands(): Command[] {
  const dir = path.join(CC, "commands");
  return listFiles(dir, /\.md$/).map((file) => {
    const fm = frontmatter(readSafe(path.join(dir, file)));
    return { name: file.replace(/\.md$/, ""), description: fm.description || "", relPath: rel(path.join(dir, file)) };
  });
}

export function loadAgents(): Agent[] {
  const dir = path.join(CC, "agents");
  return listFiles(dir, /\.md$/).map((file) => {
    const fm = frontmatter(readSafe(path.join(dir, file)));
    return {
      name: fm.name || file.replace(/\.md$/, ""),
      description: fm.description || "",
      relPath: rel(path.join(dir, file)),
    };
  });
}

export function loadPlugins(): Plugin[] {
  const out: Plugin[] = [];
  for (const entry of ["claude-code", "codex"]) {
    const base = path.join(PLUGINS, entry);
    const manifest =
      ["/.claude-plugin/plugin.json", "/.codex-plugin/plugin.json"]
        .map((p) => path.join(base, p))
        .find((p) => fs.existsSync(p)) ?? "";
    if (!manifest) continue;
    try {
      const json = JSON.parse(readSafe(manifest));
      out.push({
        name: json.name ?? entry,
        displayName: json.displayName ?? json.interface?.displayName ?? entry,
        description: json.description ?? json.interface?.shortDescription ?? "",
        keywords: json.keywords ?? [],
        relPath: rel(base),
        host: entry === "claude-code" ? "Claude Code" : "Codex",
      });
    } catch {
      /* skip malformed manifest */
    }
  }
  return out;
}

export type CatalogSummary = {
  componentCount: number;
  groupCount: number;
  blockCount: number;
  skillRefCount: number;
  commandCount: number;
  agentCount: number;
  worldPackCount: number;
  featurePackCount: number;
  pluginCount: number;
};

export function loadSummary(): CatalogSummary {
  const groups = loadComponentGroups();
  const skill = loadSkill();
  return {
    componentCount: groups.reduce((n, g) => n + g.components.length, 0),
    groupCount: groups.length,
    blockCount: groups.find((g) => g.id === "blocks")?.components.length ?? 0,
    skillRefCount: skill?.references.length ?? 0,
    commandCount: loadCommands().length,
    agentCount: loadAgents().length,
    worldPackCount: loadWorldPacks().length,
    featurePackCount: loadFeaturePacks().length,
    pluginCount: loadPlugins().length,
  };
}
