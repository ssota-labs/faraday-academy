# Courses, worlds, 3D, LMS

## `<Course>` — linear textbook

Bundle several lessons into a navigable textbook (chapter nav, prev/next, `#hash`
deep links). Make it your default export; keep chapter components in
`src/lesson/chapters/`.

```tsx
import { Course } from "@/faraday/runtime";
export default function MyCourse() {
  return <Course title="…" chapters={[
    { slug: "intro", title: "Intro", element: <IntroChapter /> },   // each is a normal <Lesson>
    { slug: "next",  title: "Next",  element: <NextChapter /> },
  ]} />;
}
```

## `<CurriculumHost>` — graph / world with unlock progression

For a graph of lessons with **unlock progression** (not just linear chapters).
You declare a `Curriculum` (nodes with `requires` + a per-node `lesson`); the host
owns progress, the world↔lesson toggle, the HUD, and an event stream for
LMS/tutor hooks. The *shape* of the world is a swappable **pack**
(ports-and-adapters) — change one prop, keep the content:

- `linearPack` — status list (baseline, no deps). `@/faraday/world`
- `map2dPack` — 2D SVG node map (game-like). `@/faraday/world`
- `world3dPack` — 3D open-world constellation (needs `--3d`). `@/faraday/three`

```tsx
import { CurriculumHost, map2dPack, type Curriculum } from "@/faraday/world";
const curriculum: Curriculum = { title: "…", nodes: [
  { id: "a", title: "A", meta: { x: 15, y: 50 }, lesson: <LessonA /> },
  { id: "b", title: "B", requires: ["a"], meta: { x: 55, y: 50 }, lesson: <LessonB /> },
]};
export default () => <CurriculumHost curriculum={curriculum} pack={map2dPack} />;
```

`meta.{x,y}` (0..100) place nodes on the map/world — percentages of the pack's
canvas (`map2dPack` is a fixed 720×440 SVG, so `y:50` centres and extreme `x` can
clip labels); omit for auto layout. A lesson self-completes via
`useNode().complete()`; the idiomatic wiring is **`<Quiz onCorrect={complete} />`**
(answer correctly → node done → dependents unlock). The learner can also press
Finish. See `docs/examples/curriculum.tsx` (+ `curriculum3d.tsx` with `--3d`).

## 3D lessons (`--3d`) — Three.js / R3F

Import from `@/faraday/three`. `three` is only installed/bundled with `--3d`.

- `<Scene3D mood height? camera? controls? autoRotate?>` — preconfigured R3F
  canvas (perspective camera, OrbitControls). Drop into a `<Workbench>` center;
  bind panel controls to scene state via React.
- Procedural helpers: `<Body radius color emissive?>`, `<OrbitPath a e?>`,
  `<Planet a e? size? speed?>`, `<Label3D position>`. Compose for astronomy,
  physics, chemistry (atoms/molecules), math surfaces, a stylized cell — **all
  code-generated, no assets.** For custom geometry, drop R3F intrinsics
  (`<mesh>`/`<sphereGeometry>`) directly inside `<Scene3D>`.

### MANDATORY: domain scenes must carry a `mood`

A `<Scene3D>` for a real subject **must** set `mood` to match — a domain scene
shipping `neutral` is a defect.

| Subject | `mood` | Look |
|---|---|---|
| astronomy, space, gravity | `"space"` | deep-black + starfield |
| biology, cells, microscopy | `"cell"` | ethereal teal haze + drifting motes |
| chemistry, molecules | `"lab"` | clean bright lab + grid |
| mechanics, forces | `"physics"` | dim studio + reference grid |
| math, abstract geometry | `"abstract"` | minimal dark |
| UI/plumbing demo only | `"neutral"` | transparent (rare) |

Match procedural object palettes to the mood too (glowing bodies in space,
bioluminescent cyans in a cell). Note: three uses fixed hex colors, not theme CSS
vars (it can't parse `oklch`). Pass hex to 3D objects.

`docs/examples/` holds ready-to-copy 3D lessons (e.g. `cell.tsx`). Copy one into
`src/lesson/lesson.tsx` as a starting point.

### Detailed models → `<Model>` (glTF)

For photoreal/organic shapes not practical to code-generate:

```tsx
import { Scene3D, Model } from "@/faraday/three";
<Scene3D mood="lab"><Model url="/models/fox.glb" scale={0.05} animation="Walk" /></Scene3D>
```

Drop `.glb` in `public/models/`. Curated open-license sources: NASA 3D Resources,
Smithsonian 3D, NIH 3D / BioModels, Poly Haven (CC0), Khronos glTF samples (CC0),
CC-licensed Sketchfab. Prefer procedural when it's clear enough.

### Physics (`--physics`)

Rapier engine (implies `--3d`). Wrap scene bodies in `<Physics>` from
`@react-three/rapier`:

```tsx
import { Physics, RigidBody } from "@react-three/rapier";
<Scene3D mood="physics"><Physics gravity={[0,-9.8,0]}>
  <RigidBody type="fixed"><mesh><boxGeometry args={[16,0.5,16]} /></mesh></RigidBody>
  <RigidBody colliders="ball" restitution={0.7} position={[0,9,0]}><mesh><sphereGeometry args={[0.6]} /></mesh></RigidBody>
</Physics></Scene3D>
```

Use physics only for genuine dynamics (collisions, joints, stacking). For scripted
motion (orbits, pendulums-as-math), integrate in the render loop — it's lighter.

## LMS — progress tracking

The vendored `@/faraday/lms` exposes a progress recorder + dashboard components
that attach to a lesson or a whole curriculum. Wire it to the `CurriculumHost`
event stream:

```tsx
import { CurriculumHost } from "@/faraday/world";
import { useLmsRecorder, ProgressDashboard } from "@/faraday/lms";
const rec = useLmsRecorder("my-course");           // → { onEvent, events, clear }
<CurriculumHost curriculum={c} pack={map2dPack} onEvent={rec.onEvent} />
<ProgressDashboard events={rec.events} />          // summarizes internally
```

For a cohort read-out pass `learners={[{ id, name, summary: summarize(rec.events) }]}`
(`summarize` builds the `LmsSummary`, incl. `perNode`). Use for roster/progress.
Like everything under `src/faraday/`, it's locked — compose it, don't edit it.

## Rendering gotcha (3D & charts)

A `<Scene3D>` or `<Chart>` only paints once its container has non-zero width (both
defer via ResizeObserver so they never mount at 0px). On a normal page load this
is instant; in a headless/collapsed harness it can look blank until first layout —
dispatching a window `resize` forces it. Expected, not a bug.
