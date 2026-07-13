# stem-methods sandbox — testing plan

Fifteen minimal demos in **one** workspace app (`examples/stem-methods`). Each
chapter is one methodology; together they show how **unit arc** and **block
families** differ while the physics anchor (등가속도 운동 / UAM) recurs in science nodes.

## Architecture

| Piece | Path |
|---|---|
| Curriculum shell | `src/lesson/lesson.tsx` → `<LinearCourse>` |
| One node per method | `src/lesson/nodes/<slug>.tsx` |
| Shared chrome | `src/lesson/_shared/MethodShell.tsx` |
| UAM math | `src/lesson/_shared/uam.ts` |
| Pack skill (design-time) | `.faraday/packs/stem-methods/` |

## Topic map (15 methods)

| # | Slug | Method | Domain topic | Distinctive arc signal |
|---|---|---|---|---|
| 1 | `cra-cpa` | CRA/CPA | Math — fraction addition | concrete tiles → bar diagram → symbol |
| 2 | `polya` | Polya | Math — train catch-up | understand → plan → execute → look back |
| 3 | `variation-theory` | Variation theory | Math — slope in y=mx | contrast cases → invariant m role |
| 4 | `modeling-instruction` | Modeling Instruction | **Physics — UAM** | phenomenon → model → deploy → revise |
| 5 | `pogil` | POGIL | Physics — v–t from a | explore sheet → invent → apply |
| 6 | `poe` | Predict–Observe–Explain | Physics — UAM at t=3 s | locked prediction before sim |
| 7 | `adi` | Argument-driven inquiry | Physics — mass & acceleration | claim → evidence → review → revise |
| 8 | `pbl` | PBL | Engineering — Wi-Fi dead zone | messy problem → learning issues → apply |
| 9 | `pjbl` | PjBL/CBL | Engineering — phone stand | brief → build → verify rubric |
| 10 | `design-cycle` | Design cycle | Engineering — egg parachute | define → ideate → prototype → test |
| 11 | `ct` | Computational thinking | Computing — find maximum | decompose → abstract → algorithm |
| 12 | `primm` | PRIMM | Computing — UAM loop sum | predict → run → investigate → modify |
| 13 | `gaise` | GAISE | Statistics — study hours vs score | question → data → analysis → interpret |
| 14 | `sbi` | Simulation-based inference | Statistics — fair coin? | simulate null → locate observed |
| 15 | `ibl` | Inquiry-based learning | Science — projectile range | orient → question → investigate |

## Automated gates (CI / agent)

```bash
# From repo root
cd examples/stem-methods
pnpm install
pnpm check          # layout + pin integrity
pnpm typecheck      # tsc
pnpm build          # production bundle
```

**Pass criteria:** exit code 0 on all three.

## Manual smoke (per chapter)

Run `pnpm dev --port 4315 --host` and visit each hash:

```
http://localhost:4315/#cra-cpa
http://localhost:4315/#modeling-instruction
… (all 15 slugs)
```

| Check | What to verify |
|---|---|
| **Phase labels** | Callout lists phases; page sections follow that order |
| **Family fit** | Manipulative-heavy methods lead with Workbench/Stage; PRIMM leads with Quiz before CodeCell |
| **POE / PRIMM lock** | Predict/Run disabled until commit |
| **UAM consistency** | modeling-instruction, poe, primm use same x = v₀t + ½at² |
| **Method contrast** | Side-by-side: `poe` (one cycle) vs `modeling-instruction` (full model arc) vs `pogil` (sheet rhythm) |

## Rubric (discipline-fit, not full quality-bar)

Grade each node against `packages/official-packs/methodology/stem-methods/quality.md`:

1. **Discipline-fit** — topic matches selection.md row
2. **One arc** — no blended methods inside a node
3. **Family mapping** — uses ≥2 families named in Callout
4. **Check closes loop** — final Quiz/NumericAnswer/Challenge needs prior interaction

## Optional: single-node dev

Temporarily export one node from `lesson.tsx` while authoring:

```tsx
export { default } from "./nodes/modeling-instruction";
```

## Future automation

- Playwright script: visit 15 hashes, assert Callout + phase headings exist
- `faraday-author` subagent: score each node against quality.md pack rules
