# Faraday Labs

An **internal** catalog for the dev team — a live, read-only view of the two things we keep
building against:

- **UI components** (`/components`) — the `@faraday/runtime` layer that gets vendored into every
  lesson, grouped by folder (Blocks, UI primitives, Runtime, World, LMS). Each card shows a
  component's header doc, exported symbols, and source path.
- **Skills & packs** (`/skills`) — what the agent plugins expose: the `faraday` skill + its phase
  references, the slash commands, the authoring subagent, plus the world packs and feature packs
  (`--3d` / `--tutor`) the CLI overlays at scaffold time.

It answers "what UI components exist?" and "which skills/packs are ready?" without leaving your
editor — and it never drifts, because it reads straight from the source tree at request time.

## Run it

```bash
pnpm install            # from platform/ (workspace) or this dir
pnpm --filter @faraday/labs dev
# → http://localhost:4200
```

`next dev` re-reads the source on every request, so edit a component's header doc or add a skill
reference and just refresh.

## How it works

`lib/catalog.ts` is a `server-only` module that walks the repo with `node:fs`:

- component groups ← `platform/packages/runtime/{blocks,ui,runtime,world,lms}` (header comment +
  `export` scan)
- skill / commands / agents ← `plugins/claude-code/**` (front-matter + first `# H1`)
- world packs ← `platform/packages/runtime/world/packs`, feature packs ← `platform/packages/cli/templates`
- plugins ← each `plugins/*/…/plugin.json`

The repo root is found by walking up until a folder contains both `platform/` and `plugins/`, so it
works whether `next dev` runs from here or the workspace root. Pages are `force-dynamic` (no caching)
so the catalog is always current.

## Scope

Metadata catalog, not a live playground — it does **not** render the components (they target a
generated Vite lesson's `@/faraday/*` alias + Tailwind setup, and many are interactive/3D). Live
interactive previews are a possible next step.
