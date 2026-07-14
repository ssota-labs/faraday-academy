# Platform threat model (P0 draft)

## Trust boundaries

1. **Studio origin** (`studio.faraday.com`) — creator session; sandbox tools; no learner data.
2. **Learning origin** (`{slug}.learn.faraday.com`) — trusted Course Shell; holds learner host-only cookie.
3. **Artifact origin** (`{hash}.artifact.faraday.com`) — untrusted UGC; read-only artifact cookie at most.
4. **Preview origin** — short-lived; no platform cookies.
5. **API origin** — server authorization + RLS deny-all for direct DB.

## Assets

- Learner session / capability tokens
- Official answer keys & grading policy (sealed)
- AI Gateway / Stripe / Supabase service secrets
- Entitlement & official grades
- Source drafts in Studio sandbox

## Key threats & controls

| Threat | Control |
|---|---|
| UGC steals learner session | Tokens never postMessage’d; separate origins; CSP |
| Public bundle contains answers | `scanPublicArtifactForSecrets` gate on publish |
| Auth code replay / CSRF | one-time code, PKCE S256, state, allowlisted `return_to` |
| Client forges XP/complete | LMS rejects official event types; server grants only |
| Client forges assessment score | Server grades from sealed key; ignore client fields |
| Tutor leaks exam answers | `officialAttemptId` lock mode |
| Sandbox exfiltrates secrets | `workerEnv` allowlist; assertWorkerEnvClean |
| Paid content hotlink | entitlement check + host-scoped artifact cookie |
| Webhook replay duplicate entitlement | idempotent by provider payment id |

## Auth bootstrap

```text
learn origin → auth start (state+PKCE+return_to)
  → login → one-time code
  → learn origin exchange → host-only HttpOnly cookie
```

Open redirect, code replay, and PKCE mismatch are covered by unit tests in
`@faraday-academy/platform-core`.
