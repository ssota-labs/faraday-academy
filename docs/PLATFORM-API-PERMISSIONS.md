# Platform API permission matrix (P0)

| Endpoint | Auth | Entitlement | Notes |
|---|---|---|---|
| `POST /api/auth/start` | none | — | PKCE + allowlisted `return_to` |
| `POST /api/auth/complete` | auth origin only | — | issues one-time code |
| `POST /api/auth/exchange` | learning origin | — | CSRF/state + PKCE; code single-use |
| `POST /api/studio/projects` | creator session | owner | creates draft |
| `POST /api/studio/chat` | creator session | course owner | no learner tokens |
| `POST /api/studio/publish` | creator session | course owner | quality gate + sealed split |
| `POST /api/studio/rollback` | creator session | course owner | pointer swap only |
| `GET /learn` (host) | guest or learner | free grant / paid | returns Course Shell HTML |
| `GET /api/artifacts/:hash/*` | artifact cookie / public free | release-scoped | no LMS/tutor capability |
| `POST /v1/enrollments` | learner | free grant or paid ACTIVE | pins courseVersionId |
| `GET /v1/courses/:id/entitlement` | learner | self | |
| `POST /v1/lms/events:batch` | learner | ACTIVE | ignores client `learnerId`; rejects official types |
| `GET /v1/courses/:id/progress` | learner | self | projection only |
| `POST /v1/assessments/:id/attempts` | learner | ACTIVE | OFFICIAL only; Shell UI |
| `POST /v1/assessment-attempts/:id/submit` | learner | attempt owner | ignores client score |
| `POST /v1/tutor/runs` | learner | ACTIVE | sealed grounding; budget |
| `GET /v1/tutor/runs/:id/stream` | learner | run owner | reconnect ownership check |
| `GET/POST /v1/courses/:id/community/threads` | learner | ACTIVE | no anonymous |
| `POST /v1/checkout` | learner | — | PUBLIC_PAID only |
| `POST /v1/webhooks/stripe` | Stripe signature | — | idempotent entitlement |
| `GET /v1/courses/:id/costs` | creator | owner | ops meter |
| `GET/DELETE /v1/me` | user | self | export / delete |

UGC iframe never receives rows from this table’s auth columns.
