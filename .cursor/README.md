# Cursor Cloud environment (this repo)

## What `environment.json` controls (edit in git)

| Field | Purpose |
|---|---|
| `install` | Runs on boot to refresh deps (`pnpm install`). Cached when unchanged. |
| `start` | Runs on **every** agent boot — use for secret → `.env.local` materialization. |

The dashboard message *"This environment is managed by `.cursor/environment.json`"* means
**install/start/docker** are versioned in the repo. It does **not** mean secrets are disabled.

## Where secrets go (Cursor dashboard — not in this file)

**Do not put API keys or tokens in `environment.json`** (it is committed to git).

1. Open [Cursor → Cloud Agents](https://cursor.com/dashboard?tab=cloud-agents) → your environment.
2. Add **Runtime Secrets** whose names match `.env.example` exactly (e.g. `NPM_TOKEN`, `VERCEL_TOKEN`).
3. On each agent boot, Cursor injects them as `process.env` variables.
4. `start` runs `scripts/setup-env-local.mjs`, which copies matching keys into `.env.local`
   (git-ignored) for tools that read files instead of the shell environment.

Re-run manually anytime: `pnpm setup:env`

### Troubleshooting

- **Secret in dashboard but `.env.local` empty?** Check the secret **name** matches `.env.example`
  (case-sensitive). Re-run `pnpm setup:env` in a terminal inside the agent.
- **Need a secret only at Docker build time** (private npm registry): use a **Build Secret** in the
  dashboard and reference it from `.cursor/Dockerfile` with `RUN --mount=type=secret,...`.
