# Primer — interactive-lesson scaffolder (CLI phase)

> Working codename. This is the **CLI-only phase** of an AI-authored interactive
> textbook, modeled on [toolcraft](../toolcraft-analysis) (self-contained
> vendoring) and headed toward a [mirror-dimension](../mirror-dimension)-style
> web platform later.

Primer is a pure **scaffolder**. `primer new <name>` produces a self-contained
Vite + React app for **one interactive lesson** — no npm publish, no workspace.
A lesson runtime and a set of interactive blocks are *vendored* into the app
under `src/primer/**` and locked with a SHA-256 manifest; the authoring agent
writes only in `src/lesson/**`.

## Loop this enables

In a clean session, an agent (Claude Code) can:

```bash
node bin/primer.mjs new my-lesson     # scaffold + pnpm install
cd my-lesson
# author src/lesson/lesson.tsx using @/primer/blocks + @/primer/runtime
pnpm check                            # structure + integrity gates
pnpm dev                              # verify it renders and interactions work
```

## Layout

```
agent-edu/
├─ bin/primer.mjs         # entry
├─ src/                   # CLI: cli, generate, copy, manifest, pkg (+ tests)
└─ templates/
   ├─ starter/            # app shell -> project root (incl. demo lesson in src/lesson/)
   ├─ runtime/            # -> src/primer/runtime  (LessonHost, useStepper, styles)
   └─ blocks/             # -> src/primer/blocks   (Lesson, Prose, Stage, Slider, Scrubber, Check)
```

## What the scaffolder does

Copy starter → target · restore `.gitignore` · vendor runtime+blocks into
`src/primer/` · inject package name + HTML title · issue a `lessonId`
(`.primer/provenance.json`) · write the integrity manifest · `pnpm install`.

Because templates already import via the `@/primer/*` alias, there is **no import
rewriting** at scaffold time — unlike toolcraft's `@repo/*` → `@/toolcraft/*` pass.

## Commands

- `primer new <name> [--at <dir>] [--overwrite] [--skip-install] [--json]`
- `primer check [--dir <lesson>]` — verify a lesson's protected tree
- `primer help`

Exit codes: `0` ok · `1` check failed · `2` usage · `4` environment.

## Tests

```bash
node --test src/*.test.mjs
```
