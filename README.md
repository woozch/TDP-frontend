# Target Discovery Platform Frontend

Frontend MVP for a bio-domain hybrid intelligence workflow.

## Stack

- Next.js (TypeScript, App Router)
- Tailwind CSS
- FSD (Feature-Sliced Design)
- Mock API with streaming SSE
- Docker / docker-compose

## FSD Layers

- `src/app`: Next entry, global layout, API routes
- `src/pages`: route-level page composition
- `src/widgets`: big UI blocks for screen composition
- `src/features`: user actions and interaction logic
- `src/entities`: domain objects and domain-centric UI/state
- `src/shared`: reusable libraries, api client, constants, mocks

Dependency direction:

`app -> pages -> widgets -> features -> entities -> shared`

## Run

### Local (Node required)

```bash
npm install
npm run dev
```

Create `.env.local` before running:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-random-secret
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret
ENABLE_DEV_SIGNIN=true
GOOGLE_ALLOWLIST_PROVIDER=local-file
GOOGLE_ALLOWLIST_FILE=data/google-allowlist.json
```

### Docker

```bash
docker compose up tdp-frontend-dev
```

Open `http://localhost:3001`.

## Authentication notes

- Google sign-in is available only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured.
- In production, `NEXTAUTH_SECRET` is required and startup fails if it is missing.
- Development sign-in (`credentials`) is enabled only in development and can be disabled with `ENABLE_DEV_SIGNIN=false`.
- Google allowlist supports company domains and specific emails from `data/google-allowlist.json`.

## API Contracts

- OpenAPI: `contracts/openapi.yaml`
- TypeScript interfaces: `contracts/types.ts`

## Implemented MVP Behaviors

- Left sidebar (profile/history/settings)
- Streaming answer in chat
- Progressive tab completion
  - LLM Answer
  - Evidence
  - Gene Graph
  - Pharma Report
- Single-active tab visibility
# TDP
