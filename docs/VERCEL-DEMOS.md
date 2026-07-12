# Deploy Stage 1 demos on Vercel

GitHub Pages 대신 **Vercel**에 올리는 방법. `@faraday-academy/*`가 npm에
아직 없어도 됩니다 — Root Directory를 예제 폴더로 두고, install이 모노레포
루트에서 workspace를 링크합니다.

## 프로젝트 2개 (권장)

| Vercel project name (제안) | Root Directory | 예상 URL |
|---|---|---|
| `faraday-demo-interest` | `examples/compound-interest` | `https://faraday-demo-interest.vercel.app` |
| `faraday-demo-voyage` | `examples/voyage-log` | `https://faraday-demo-voyage.vercel.app` |

각 예제의 [`vercel.json`](../examples/compound-interest/vercel.json)이 이미 설정되어 있음:

- `installCommand`: `cd ../.. && pnpm install` (루트 workspace → runtime/three 링크)
- `buildCommand`: `pnpm build`
- `outputDirectory`: `dist`

## 대시보드에서 (1회)

1. [vercel.com/new](https://vercel.com/new) → **Import** `ssota-labs/faraday-academy`
2. **Root Directory** → `examples/compound-interest` (Edit)
3. Framework Preset: Vite (자동)
4. Deploy
5. 같은 레포로 **Add New Project** 한 번 더 → Root Directory `examples/voyage-log`

Production branch는 soft-launch 브랜치가 아니라 **`main`** (머지 후) 또는
지금 브랜치 `cursor/stage1-deploy-plan-1f31`를 임시 Production으로.

## CLI (토큰 있을 때)

Cursor Secret / env에 `VERCEL_TOKEN`을 넣고:

```bash
# from repo root
npx vercel@latest link --yes --token "$VERCEL_TOKEN"   # once per project cwd
cd examples/compound-interest && npx vercel@latest --prod --token "$VERCEL_TOKEN"
cd ../voyage-log && npx vercel@latest --prod --token "$VERCEL_TOKEN"
```

## npm publish 이후 (선택)

패키지가 registry에 올라가면 Root Directory install을 단순화해도 됩니다:

```json
"installCommand": "pnpm install",
"buildCommand": "pnpm build"
```

지금은 **모노레포 install**을 유지하는 편이 안전합니다.

## CTA에 넣을 URL

배포 후 `docs/CONTENT-STAGE1.md` / README Example 표의 `<DEMO_*>`를
실제 `*.vercel.app` 주소로 교체하면 됩니다.
