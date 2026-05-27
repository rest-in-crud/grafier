# Grafier

> All-in-one browser design surface: editor, projects, version history, sharing, and accounts.

**Live demo:** https://grafier.ink

<!-- Screenshot or GIF goes here -->

## What it does

- **Editor.** Fabric.js canvas with a Photoshop and Figma style toolset: brush, eraser (via `@erase2d/fabric`), shapes, fill, copy and paste, layers, plus an artboard-centered viewport with pan and zoom driven by CSS transforms.
- **Projects.** Save and load designs to your account, with per-project version history.
- **Sharing.** Public share links with social-media-ready Open Graph previews (Twitter, Slack, Discord, LinkedIn, Telegram, WhatsApp).
- **Accounts.** Email and password with verification and reset flows, plus Google OAuth (linked to an existing local account when the email matches).
- **PDF export.** One-click export of the current artboard via `jsPDF`.
- **Surfaces.** Dashboard, templates, and a community page alongside the editor.

## Stack

**Client (`apps/client`)**

- React 19, Vite, TypeScript (strict mode)
- Fabric.js and `@erase2d/fabric` for the canvas runtime
- TanStack Query for server state; Zustand for editor state
- react-router for routing
- Radix UI and Tailwind v4 for the UI layer
- react-hook-form and Zod for forms and validation
- jsPDF for export

**Server (`apps/server`)**

- NestJS 11 on Node 18+
- Drizzle ORM on PostgreSQL
- Passport with local, JWT, and Google OAuth 2.0 strategies
- Resend and react-email for transactional mail
- class-validator and class-transformer for DTOs
- `@nestjs/throttler` for rate limiting

**Tooling and infra**

- Turborepo with npm workspaces
- Docker Compose for both development and production
- Vercel for the client
- ESLint, Prettier, and `tsc --noEmit` gating on the client

## Run locally

Requirements: Node 18+, npm 11+, Docker.

```bash
npm install
cp .env.example .env   # fill in DB creds, JWT secret, Google OAuth, Resend key
docker compose -f compose.dev.yaml up
```

This boots Postgres, runs migrations, and starts both the server (`http://localhost:3000`) and the client (`http://localhost:5173`) with hot reload.

## Project layout

```
grafier/
├── apps/
│   ├── client/          # React 19, Vite, Fabric.js
│   └── server/          # NestJS 11, Drizzle, Postgres
├── compose.dev.yaml     # Full dev stack: Postgres, migrate, server, client
├── compose.prod.yaml    # Production compose
└── turbo.json
```

## License

MIT. See [`LICENSE`](LICENSE).