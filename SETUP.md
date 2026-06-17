# ToolHub — How to Run

## URL env vars (local + production)

FE and BE use the same pattern: each app has its own public URL, and they point at each other.

### Frontend (`toolhub-fe/.env`)

```env
VITE_FE_URL=http://localhost:5173
VITE_BE_URL=http://localhost:3001
```

| Variable | Purpose |
|----------|---------|
| `VITE_FE_URL` | Frontend public URL |
| `VITE_BE_URL` | Backend URL — browser calls `{VITE_BE_URL}/api` |

### Backend (`toolhub-be/.env`)

```env
BE_URL=http://localhost:3001
FE_URL=http://localhost:5173
```

| Variable | Purpose |
|----------|---------|
| `BE_URL` | Backend public URL (must match `VITE_BE_URL` on FE) |
| `FE_URL` | Allowed CORS origins (must match `VITE_FE_URL` on FE) |

**Rule:** `VITE_BE_URL` (FE) = `BE_URL` (BE), and `VITE_FE_URL` (FE) = value in `FE_URL` (BE).

---

## Local development

```
Browser (localhost:5173)
   → http://localhost:3001/api/tools
Backend responds with JSON + CORS headers
```

CORS: in development, any `http://localhost:*` origin is allowed automatically.

**Terminal 1 — Backend:**
```bash
cd toolhub-be
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd toolhub-fe
npm run dev
```

---

## Production (Vercel)

Same env pattern — only the URLs change.

**FE (Vercel project: toolhub-fe)**
```env
VITE_FE_URL=https://toolhub-fe.vercel.app
VITE_BE_URL=https://toolhub-be.vercel.app
```

**BE (Vercel project: toolhub-be)**
```env
BE_URL=https://toolhub-be.vercel.app
FE_URL=https://toolhub-fe.vercel.app
```

If you get a CORS error in production, check that `FE_URL` on BE **exactly** matches the browser origin (`VITE_FE_URL` on FE). No trailing slash.

---

## Backend database + auth env

```env
SUPABASE_POOLER_URL=postgresql://...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

```bash
cd toolhub-be
npm run db:migrate
npm run db:seed
```

Login: `admin@toolvault.io` / `Admin123!`

### Browse performance indexes

`GET /api/tools` (browse page) is indexed for these patterns:

| Browse action | Index used |
|---------------|------------|
| Newest (default) | `idx_tools_created_at_desc` |
| Category + newest | `idx_tools_category_created_at` |
| Most votes | `idx_tools_votes_created_at` |
| Category + votes | `idx_tools_category_votes` |
| A → Z sort | `idx_tools_name_asc` |
| Category + A → Z | `idx_tools_category_name` |
| Search text | `idx_tools_name_trgm`, `idx_tools_description_trgm` (pg_trgm) |

Migrations `005_read_performance_indexes.sql` and `006_browse_sort_indexes.sql` create these. Re-run `npm run db:migrate` after pulling if browse feels slow.

---

## Auth session (7 days)

Login uses **Supabase Auth**. The app keeps users signed in for **7 days**:

| Token | Lifetime | Purpose |
|-------|----------|---------|
| `access_token` | ~1 hour (Supabase JWT) | Sent on every API request |
| `refresh_token` | **7 days** | Used to get a new access token automatically |

**Configure in Supabase Dashboard → Authentication → Settings:**

1. **JWT expiry** — keep default `3600` (1 hour). The frontend auto-refreshes.
2. **Refresh token expiry** — set to `604800` seconds (**7 days**).

Flow:
```
Login → store access_token + refresh_token + expires_at in browser (localStorage)
API call → if access token expired → POST /api/auth/refresh → new tokens
After 7 days → refresh fails → user must log in again
```
