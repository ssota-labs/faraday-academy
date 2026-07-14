# @faraday-academy/platform

Stage 2 web platform (Next.js) — Studio, Course Shell, central API.

```bash
pnpm --filter @faraday-academy/platform dev   # http://localhost:3100
pnpm verify:quick                             # contracts + typecheck + unit tests
```

See [docs/STAGE2-PLATFORM.md](../../docs/STAGE2-PLATFORM.md),
[PLATFORM-API-PERMISSIONS.md](../../docs/PLATFORM-API-PERMISSIONS.md),
[PLATFORM-THREAT-MODEL.md](../../docs/PLATFORM-THREAT-MODEL.md).

Identity for local API calls: header `x-faraday-user-id`.
