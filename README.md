# MediaVault

A full-stack personal cloud storage app for photos, videos, and documents: upload, organize into folders, tag, favorite, search/filter, preview, share via public links, and trash/restore. Built as two independent apps — a REST API and a React SPA — talking over HTTP.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript + React Router + Tailwind CSS + TanStack Query |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT access + refresh tokens in httpOnly cookies, bcrypt password hashing |
| File storage | Pluggable provider: local disk (default), AWS S3, Supabase Storage, or Cloudinary |

The database never stores raw files — only metadata (`fileName`, `fileSize`, `storageKey`, `storageUrl`, ...). Actual bytes live wherever `STORAGE_PROVIDER` points.

## Project layout

```
mediavault/
├── backend/                     REST API (Express + Prisma)
│   ├── prisma/schema.prisma     Users, Files, Folders, Tags, FileTags, SharedLinks, tokens
│   ├── src/
│   │   ├── config/              env loading, Prisma client singleton
│   │   ├── middleware/          auth guard, error handler, multer upload, zod validation
│   │   ├── storage/             StorageProvider interface + local/s3/supabase/cloudinary adapters
│   │   ├── services/            business logic (auth, file, folder, share, thumbnail, email, user)
│   │   ├── controllers/         HTTP handlers — parse request, call a service, shape the response
│   │   ├── routes/               Express routers, one per resource, wired in routes/index.ts
│   │   ├── utils/                jwt, password hashing, ApiError, asyncHandler, mime classification
│   │   ├── app.ts                Express app: middleware pipeline + route mounting
│   │   └── server.ts             entrypoint — starts the HTTP listener
│   ├── uploads/                  local-disk storage provider's file root (gitignored)
│   ├── .env.example              copy to .env and fill in
│   └── Dockerfile
│
├── frontend/                    React SPA (Vite)
│   ├── src/
│   │   ├── api/                  one file per resource; thin wrappers around an axios client
│   │   ├── components/
│   │   │   ├── layout/            Sidebar, Topbar, MobileNav/Drawer, Dashboard/AuthLayout
│   │   │   ├── ui/                 generic building blocks: Modal, Dropdown, ProgressBar, ...
│   │   │   ├── files/               file-specific UI: FileCard/Row, UploadModal, PreviewModal, ...
│   │   │   └── dashboard/           StatsCard, StorageWidget, RecentFiles
│   │   ├── pages/                 route-level screens (one per route)
│   │   ├── context/                AuthContext, ThemeContext, UploadContext (React context providers)
│   │   ├── hooks/                  TanStack Query hooks wrapping the api/ layer
│   │   ├── routes/                 AppRoutes + ProtectedRoute
│   │   ├── types/                  shared TS types mirroring the API's DTOs
│   │   └── utils/                  formatBytes, file-type icon mapping, debounce
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml            postgres + backend + frontend, for local prod-like deployment
└── README.md
```

## Running it locally (without Docker)

Prerequisites: Node 20+, a PostgreSQL server.

```bash
# 1. Database
createdb mediavault    # or however you create databases on your Postgres install

# 2. Backend
cd backend
cp .env.example .env   # edit DATABASE_URL if needed
npm install
npx prisma migrate dev --name init
npm run dev             # http://localhost:4000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev              # http://localhost:5173
```

Open http://localhost:5173, register an account, and start uploading. With `STORAGE_PROVIDER=local` (the default) uploaded files are written to `backend/uploads/` and served back from `http://localhost:4000/files/...` — no cloud account needed to try the app.

Password resets: without SMTP configured, the reset link is printed to the backend console instead of emailed (`[MediaVault] Password reset link for ...`).

## Running it with Docker

```bash
docker compose up --build
```

This starts Postgres, runs migrations, and serves the API on :4000 and the SPA (via nginx) on :5173.

## Switching to a real cloud storage provider

Set `STORAGE_PROVIDER` in `backend/.env` to `s3`, `supabase`, or `cloudinary` and fill in the matching credentials block — no code changes needed. All four providers implement the same `StorageProvider` interface (`backend/src/storage/storage.interface.ts`): `upload`, `remove`, `getSignedUrl`.

## Notable design choices

- **Storage quota** counts every file row that still exists in the database, including trashed-but-not-yet-emptied files — the bytes are still occupied on disk until a file is permanently deleted, so trash correctly counts against your quota (this mirrors Google Drive / Dropbox behavior).
- **Trash** is a soft delete (`isDeleted` + `deletedAt`); permanent delete removes both the database row and the underlying stored object.
- **Sharing** issues a random token per link (`SharedLink` model), with `isPublic`, `isActive` (owner can disable without deleting), optional `expiresAt`, and a `permission` of `VIEW` or `DOWNLOAD`. The public viewer route (`/share/:token`) requires no login.
- **Auth** uses short-lived (15 min) access tokens plus a rotating 7-day refresh token, both in httpOnly cookies; the frontend's axios interceptor transparently refreshes on a 401 and retries the original request once.
