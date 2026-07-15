# projectile

- **outcome:** Find that range is maximized near 45° (level ground) and compute range from v0, θ.
- **interaction:** Launch workbench (angle + speed sliders, trajectory SVG) + Chart of range vs angle + Derivation of R = v² sin(2θ)/g.
- **check:** Challenge — land within ±3 m of an 80 m flag by tuning angle (or NumericAnswer for range at given v0,θ). Prefer Challenge with onDone→complete().
- **audience:** secondary, 5E
- **packs:** sim2d (useSvgDrag optional)
- **file:** `src/lesson/nodes/projectile.tsx`
- **status:** todo
- **requires:** uam
- **source:** Level-ground projectile; g=9.8 (or 10 if stated). Original CSAT-style situation, no copyrighted text.
- **quality:** MUST hit quality-bar Surface 2 — multiple interactives, prose between them, all math in TeX, central formula via Derivation, ≥~substantial prose. Import InstallCta from `../_shared/InstallCta`. useNode().complete on pass.
