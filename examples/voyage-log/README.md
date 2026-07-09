# Voyage Log — 항해 일지

GTM Stage 1 curriculum demo (**C-B**): a space-voyage map where each stop is an
interactive lab on orbits, gravity assists, equivalence, gravitational time
dilation, light bending, and clock sync.

- **No film titles, dialogue, or score** — physics concepts only (Interstellar *motif*, not a tie-in).
- Scaffolded with `faraday new voyage-log --3d` from the Faraday CLI.
- World: `<CurriculumHost>` + `world3dPack` (`mood` space).

```bash
pnpm check && pnpm dev
pnpm build   # → dist/ for Vercel (root directory: examples/voyage-log)
```
