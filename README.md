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

### Docker

```bash
docker compose up tdp-frontend-dev
```

Open `http://localhost:3001`.

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
