# Voyage Log — authoring friction log

Notes taken while building the C-B curriculum (`kepler → slingshot → elevator + dilation → lens → sync`)
as an external creator would experience Faraday. Severity legend:
**blocker** = can't ship without · **annoying** = wastes minutes per lesson ·
**nice-to-have** = polish.

## 1. `Chart` `data` type rejects `null` (annoying)

`ChartSeries`/`Chart` types `data` as `Record<string, string | number>[]`. I wanted a
"you are here" series that's `null` everywhere except at the current x-bucket (so
Recharts draws a single dot). TypeScript rejected `null`. Falling back to `0`
works but creates a visual spike from 0 to the current value.

**Suggested fix (SDK):** widen `data` to `Record<string, string | number | null>[]`
(Recharts already supports `null` for line gaps). Or expose a `<Chart.Marker x={} y={} />`
child so lessons don't have to hack a series.

## 2. Chart doesn't render a visible curve in headless Chrome (nice-to-have)

At 220 px height with an area series, the curve is present in the DOM but very
low-contrast against the white card — in headless-Chrome screenshots the axes
draw but the filled area barely shows. Real browsers render it fine. Might not
be a Faraday issue at all, but any doc snippet using `Chart` at short heights
should note it.

**Suggested fix (docs):** in `docs/authoring.md`, recommend `height ≥ 260` for
area charts and note that CSS custom-property colours won't be picked up in some
screenshot pipelines (workaround: pass `color` explicitly on the `ChartSeries`).

## 3. `<Planet>` is a decoration, not a Kepler integrator (annoying — but doc'd)

`docs/authoring.md` DOES warn that `<Planet>` moves at a constant rate. But the
warning is on line ~119 of a very long doc, and the scaffolded `lesson.tsx`
happily uses `<Planet>` for "how planets orbit" — which is exactly the case
where you SHOULDN'T use it. First-time authors will almost certainly copy that
pattern for anything Kepler-shaped and get wrong physics.

**Suggested fix (skill doc / template):** ship a `docs/examples/kepler.tsx` with
a `KeplerPlanet` component that solves `M = E − e·sinE` (like this repo's
`src/lesson/nodes/kepler.tsx`) so the copy-paste path is correct-by-default.

## 4. `<OrbitPath>` colour is a hex prop, not a theme token (annoying)

`<OrbitPath color="#94a3b8">` — three.js can't parse `oklch(...)`, so I had to
pick a Tailwind slate-400 hex. That's fine as documented, but the semantic
colour rules ("no `#hex` for UI chrome") and the actual pattern in 3D
("hex is required for materials") conflict enough that I kept second-guessing
which layer I was in.

**Suggested fix (docs):** call out the split more loudly — a two-column table
at the top of the "3D lessons" section: "DOM & SVG → tokens; three.js materials
→ hex." Right now it's a paragraph note easy to miss.

## 5. `world3dPack` renders WebGL that headless-Chrome can't rasterise (nice-to-have)

Not a Faraday bug: swiftshader-webgl in `--headless=new` produces a canvas but
doesn't paint to the PNG buffer. For anyone verifying lessons with headless
Chrome screenshots (as I did in `pnpm build` → screenshot pipelines), 3D scenes
appear as blank rectangles. I worked around it by swapping to `linearPack` for
the walk.

**Suggested fix (docs):** add a "testing your curriculum" tip: for CI
screenshot tests, temporarily swap the pack to `linearPack` (single-line
change) and drive by button-clicks. Or ship a `TESTING_PACK` seam that reads
`import.meta.env.MODE`.

## 6. No `Chart.ReferenceLine` (nice-to-have)

For node 4 (`dilation`) I wanted a vertical dashed line at the current
`r/r_s`. Recharts supports `<ReferenceLine>` but it's not surfaced through the
Faraday `<Chart>` wrapper.

**Suggested fix (SDK):** add an optional `refX`/`refY` prop, or accept a
`children` slot passed through to the underlying Recharts chart. Currently the
only way is via the series-with-a-spike hack noted above.

## 7. `Segmented` value type is `string` only (nice-to-have)

`Segmented`'s `onChange` signature is `(value: string) => void`. In the elevator
lesson I want `mode: "accel" | "gravity"`, so I had to cast: `setMode(v as
"accel" | "gravity")`. This is a minor TS papercut; a generic would fix it.

**Suggested fix (SDK):** `Segmented<T extends string>` with `value: T`,
`onChange: (v: T) => void`, `options: { value: T; ... }[]`.

## 8. `useNode()` requires a curriculum host (annoying, correct-but-surprising)

`useNode().complete()` is essential for wiring `<Quiz onCorrect={complete} />`,
but it throws if the component is rendered directly (i.e. not inside a
`CurriculumHost`). That's the right behaviour, but during authoring I want to
develop a single node in isolation. I ended up temporarily creating a
throwaway `<CurriculumHost>` wrapper just to preview a lesson.

**Suggested fix (SDK):** `useNode()` could return a no-op `complete` when
there's no context (with a `console.warn`), or expose an
`<IsolatedNodePreview>` block for authoring one node at a time.

## 9. `Workbench` requires a `<Card>`-style body (nice-to-have)

`Workbench`'s slot expects a canvas-ish `children`. When I wanted extra Stats
below the canvas (node 1, 2, 5), I stacked them inside the same `children` —
which works but visually cramps under the canvas. Rendering them below the
Card would be cleaner.

**Suggested fix (SDK):** add an optional `footer` slot to `Workbench` for
Stats/legend content, sitting under the canvas card but above the panel's
scroll boundary.

## 10. Curriculum-object identity gotcha (blocker if you miss it, docs warn)

The docs correctly say "keep curriculum at module scope for stable identity."
On my first pass I put the array inside the component and immediately lost
progress on every re-render. This is one of those bugs where the FIX takes 5
seconds but the DIAGNOSIS could easily take an hour. `CurriculumHost` could
`useMemo` on `curriculum.title + nodes.map(id).join()` internally as a defensive
measure.

**Suggested fix (SDK):** either memoise defensively (with a dev warning when a
new-identity curriculum arrives), or crash loudly with a message pointing at
the module-scope pattern.

## 11. `mood="space"` is mandatory but silent (annoying)

The docs say `mood` is REQUIRED for domain scenes, but `<Scene3D>` defaults to
`"neutral"` (transparent) — so forgetting `mood` produces a scene that renders
without an error, just… wrong. A dev-mode warning ("Scene3D is being used
without a domain mood; pick one of space/cell/lab/physics/abstract") would save
the "why is my space scene white?" round-trip.

**Suggested fix (SDK):** log once when `<Scene3D>` mounts with `mood="neutral"`
outside a `neutral`-flagged location, or make `mood` a required prop with an
explicit `"neutral"` opt-out.

## 12. Six-lesson curriculum ⇒ 1.6 MB JS bundle (nice-to-have)

`pnpm build` warned about `>500 kB` chunk. The whole three.js + drei + rapier +
Recharts stack lands in one entry. For a demo that's fine; for a real course
lazy-loading each `nodes/*.tsx` under `React.lazy` would drop first-paint
significantly. Not blocking, just a Stage 2 concern.

**Suggested fix (SDK):** ship `<CurriculumHost>` with automatic lazy chunking of
`node.lesson` (they're already ReactNode, so wrapping them in a Suspense
boundary is a mechanical change) — or a plain doc snippet showing how.
