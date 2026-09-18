# Fastwork Clone — React + Go + sqlite3

Marketplace freelancer mirip Fastwork.id

## Stack
- **Frontend**: React + Vite + Tailwind + React Router + Axios
- **Backend**: Go + Gin + GORM + sqlite3 (glebarez/sqlite pure Go, no CGO) + JWT
- **DB**: `fastwork.db` sqlite3 (auto-migrate + seed)

## Struktur
```
/root/fastwork/
  backend/
    cmd/server/main.go
    internal/{config,models,handlers,middleware,routes,utils}
    fastwork.db (sqlite3, auto-create)
    go.mod
  frontend/
    src/{components,pages,context,utils}
    vite.config.js (proxy /api -> :8080)
```

## Seed Data
- 8 kategori (Desain Grafis, Website & IT, dll)
- 3 user: dian_design, budi_coder (freelancer), client_andi (client) — password: `password123`
- 4 gig contoh dengan 3 paket (Basic/Standard/Premium)

## API Endpoints
- GET /api/health
- GET /api/categories
- GET /api/gigs?q=&category=&sort=&page=&limit=
- GET /api/gigs/:slug
- POST /api/auth/register, /api/auth/login, GET /api/auth/me
- POST /api/gigs (auth), GET /api/my/gigs, DELETE /api/gigs/:id
- POST /api/orders, GET /api/orders, PUT /api/orders/:id/status
- POST /api/reviews

## Jalankan

### Backend
```bash
cd /root/fastwork/backend
go run ./cmd/server
# atau
./fastwork-server
# running di http://localhost:8080
# DB file: ./fastwork.db (sqlite3)
```

### Frontend
```bash
cd /root/fastwork/frontend
npm install
npm run dev
# http://localhost:3000 (proxy /api ke :8080)
# atau build: npm run build && npm run preview
```

### ENV Frontend
Buat `.env` jika backend bukan localhost:8080:
```
VITE_API_URL=http://localhost:8080/api
```

## sqlite3
```bash
sqlite3 backend/fastwork.db "select name from categories;"
sqlite3 backend/fastwork.db "select title, slug from gigs;"
```

## Deploy
- Backend butuh env `PORT` (default 8080)
- Frontend butuh `VITE_API_URL`
- DB sqlite3 file-based, cukup backup `fastwork.db`
