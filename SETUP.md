# ToolHub — How to Run

## URL env vars (local + production)

### Frontend (`toolhub-fe/.env`)

```env
VITE_FE_URL=http://localhost:5173
VITE_BE_URL=http://localhost:3001
VITE_API_URL=/api
```

| Variable | Purpose |
|----------|---------|
| `VITE_FE_URL` | Frontend public URL |
| `VITE_BE_URL` | Backend URL (Vite dev proxy target) |
| `VITE_API_URL` | Path/URL the browser uses for API calls |

### Backend (`toolhub-be/.env`)

```env
BE_URL=http://localhost:3001
FE_URL=http://localhost:5173,http://localhost:5174
```

| Variable | Purpose |
|----------|---------|
| `BE_URL` | Backend public URL (docs / reference) |
| `FE_URL` | Allowed CORS origins (comma-separated) |

---

## Local development

```
Browser → http://localhost:5173/api/tools
         ↓ (Vite proxy uses VITE_BE_URL)
Backend → http://localhost:3001/api/tools
```

CORS: backend only allows origins listed in `FE_URL`.

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

## Production

### Same domain (Vercel rewrites — recommended)

**FE**
```env
VITE_FE_URL=https://yourapp.vercel.app
VITE_BE_URL=https://yourapp.vercel.app
VITE_API_URL=/api
```

**BE**
```env
BE_URL=https://yourapp.vercel.app
FE_URL=https://yourapp.vercel.app
```

### Separate API domain

**FE**
```env
VITE_FE_URL=https://app.yourdomain.com
VITE_BE_URL=https://api.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

**BE**
```env
BE_URL=https://api.yourdomain.com
FE_URL=https://app.yourdomain.com
```

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
