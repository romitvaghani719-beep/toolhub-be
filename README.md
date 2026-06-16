# ToolHub Backend

Node.js + TypeScript API (Vercel serverless) with Supabase Postgres and Auth.

## Structure

```
toolhub-be/
├── api/             # Vercel serverless route handlers
├── shared/          # Zod schemas shared with the frontend
├── src/             # MVC modules, middleware, lib
├── supabase/        # SQL migrations
├── scripts/         # migrate & seed
└── docs/            # API documentation
```

## Setup

```bash
npm install
cp .env.example .env   # add Supabase keys
```

## Database

```bash
npm run db:migrate
npm run db:seed
```

Default admin: `admin@toolvault.io` / `Admin123!`

## Development

```bash
npm run dev
```

Runs a local API server on port `3001`. Browser calls go directly to `http://localhost:3001/api`.

Set `FE_URL` to your frontend origin for CORS (must match `VITE_FE_URL` on the frontend). In development, all `localhost` ports are allowed automatically.

See [SETUP.md](./SETUP.md) for full local + production URL configuration.

## API docs

See [docs/API.md](./docs/API.md).
