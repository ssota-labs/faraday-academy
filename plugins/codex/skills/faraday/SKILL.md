---
name: faraday
description: Scaffold and author interactive textbook lessons (and grounded AI tutors) with the Faraday CLI. Use when the user wants to turn a topic, lesson, or course into an interactive Vite+React textbook, add an AI tutor to a lesson, build a curriculum/world of lessons, or run the Faraday quality gates. Triggers on "interactive lesson/textbook", "faraday", "teach X interactively", "AI tutor for my course", "scaffold a lesson".
---

# Faraday — author interactive courseware

Faraday scaffolds **one interactive lesson** per app: a self-contained Vite +
React page where the reader *manipulates* a live canvas instead of reading static
text. Flags add a grounded **AI tutor**, **3D/physics**, and lessons compose into
**courses** and **worlds**. Drive it end-to-end: scaffold → author → pass the
gates → (optionally) deploy.

Invoke this skill explicitly with `$faraday`, or Codex will pick it up implicitly
when the task matches the description above.

## The one rule that governs everything: two zones

| Zone | Path | Rule |
|---|---|---|
| **Author area** | `src/lesson/**` | You write here. `src/lesson/lesson.tsx` is the fixed entry; it must `export default` a React component. Add sibling files freely (`src/lesson/chapters/`, helpers, models). |
| **Protected area** | `src/faraday/**` | Vendored UI, blocks, runtime, styles, world/tutor code. **Never edit.** Sealed by a SHA-256 manifest — `faraday check` fails on any drift, and so will CI/deploy. |

If a primitive seems missing, **note it in your summary — do not work around the
lock** by editing `src/faraday/`. Also never run `shadcn add` (it writes into the
locked tree).

## Invoking the CLI

The CLI is `faraday`. Prefer the published package; fall back to the local repo:

```bash
npx @faraday-kit/cli@latest <args>        # canonical (Stage 1)
# during pre-publish local dev, equivalently:
node /path/to/faraday-edu/bin/faraday.mjs <args>
```

Use `--json` on `new` for a machine-readable result you can parse (title, dir,
next steps). Exit codes: `0` ok · `1` check failed · `2` usage · `4` environment.

## The loop

1. **Scaffold.** Pick flags from the decision guide below, then:
   `npx @faraday-kit/cli@latest new <name> [--3d|--physics] [--tutor] [--json]`
   (installs deps unless `--skip-install`). `cd` into the new dir.
2. **Read the in-project guide.** The scaffold ships `AGENTS.md` and
   `docs/authoring.md` — the authoritative blocks reference lives there and in
   [references/blocks.md](references/blocks.md). Read before authoring.
3. **Author** `src/lesson/lesson.tsx` from `@/faraday/blocks` + `@/faraday/runtime`.
   Start from a `docs/examples/*.tsx` when one fits — copy it to
   `src/lesson/lesson.tsx` and adapt.
4. **Gate:** `pnpm check` — structure + integrity must exit 0. Fix drift (usually:
   you edited `src/faraday/` — revert it).
5. **Verify live:** `pnpm dev` — Vite prints a Local URL on a free port (read it
   from output). Open it, drive every control, fix console errors. End the lesson
   with a `<Quiz>`.
6. **Ship (optional):** `pnpm build` → static `dist/`, or deploy (static host, or
   Vercel for tutor lessons — see references/tutor.md).

Never claim a lesson works from `pnpm check` alone — `check` only proves the
locked tree is intact, not that your lesson renders. Drive it in `dev`.

## Decision guide — what to scaffold

- **2D (default)** — diagrams, charts, algorithm walk-throughs, parameter
  exploration. Stays light; no `three`. Right default for most topics.
- **`--3d`** — the subject is inherently spatial (astronomy, molecules, geometry,
  anatomy). Adds R3F `<Scene3D>`. Domain scenes **must** set a `mood`.
- **`--physics`** — genuine dynamics: collisions, gravity, stacking, joints
  (implies `--3d`). For scripted motion (orbits) use the render loop, not physics.
- **`--tutor`** — the reader benefits from asking questions. Adds a durable,
  grounded chat tutor. Needs `AI_GATEWAY_API_KEY` locally. See
  [references/tutor.md](references/tutor.md).
- **Single lesson vs. course vs. world** — one idea → one `<Lesson>`. A sequence →
  `<Course>` (linear chapters). A graph with unlock progression / a game map →
  `<CurriculumHost>` + a pack. See [references/worlds.md](references/worlds.md).

## Styling (non-negotiable)

shadcn CSS-style convention. Use **semantic** Tailwind classes
(`text-muted-foreground`, `bg-card`, `text-primary`) and, in SVG, theme tokens via
`style={{ fill: "var(--primary)" }}`. **Never** hardcode `#hex` or `text-blue-500`
— it breaks light/dark. Data-series colors: `var(--chart-1..5)`.

## References (load as needed)

- [references/blocks.md](references/blocks.md) — the full block API + canonical lesson shapes.
- [references/tutor.md](references/tutor.md) — embed + ground the `--tutor` AI, edit its persona/model.
- [references/worlds.md](references/worlds.md) — `<Course>`, `<CurriculumHost>`, packs, 3D moods, LMS.
