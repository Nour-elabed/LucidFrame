# LucidFrame

Social-style feed with AI image generation, comments, chat (Socket.IO), and a dashboard. **Frontend** lives at the repo root (Vite + React). **Backend** is in `backend/` (Express + MongoDB + Socket.IO).

## Stack

| Part | Tech |
|------|------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind 4, Zustand, Motion, React Router |
| Backend | Node.js, Express, Mongoose, JWT, Multer, Socket.IO, Google Gemini (optional) |

## Prerequisites

- Node.js 20+ (LTS recommended)
- MongoDB URI (e.g. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- PowerShell on Windows: if `npm` fails, use `npm.cmd` or Command Prompt (`cmd`)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, optional GEMINI_API_KEY
npm install
npm run dev
```

API default: `http://localhost:5000` (health: `GET /api/health`).

### 2. Frontend (repo root)

```bash
# From project root (same folder as this README)
npm install
npm run dev
```

App default: `http://localhost:5173`.

Optional `.env` at the **root** (create if needed):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. One-shot build (CI / production)

```bash
npm run build
```

Builds backend (`tsc`) then the Vite client.

## Repo layout

```
LucidFrame/
├── src/                 # React app
├── backend/
│   ├── src/             # Express + sockets
│   ├── scripts/         # Media maintenance (see below)
│   ├── uploads/         # Runtime uploads (only .gitkeep in git)
│   └── .env.example     # Copy to .env — never commit .env
├── package.json         # Frontend scripts + dev:api helper
└── vite.config.ts
```

## Restoring images after `uploads/` was deleted

Posts in **MongoDB** store paths like `/uploads/<exact-filename>`. The browser loads them from your **API host** + that path (e.g. `http://localhost:5000/uploads/...`).

1. **Put every file back** under `backend/uploads/` using the **same filename** MongoDB expects (same name as when the post was created, e.g. `ai-....jpg`, `image-....webp`).
2. If you copied from an old GitHub/deployment, URLs in the database might still be **full `https://...` links**. Normalize them to local paths:

   ```bash
   cd backend
   npm run normalize-media-urls
   ```

3. **Check** that every DB reference has a file on disk:

   ```bash
   cd backend
   npm run verify-media
   ```

   It prints any **missing files** and **orphan** files on disk not referenced in the DB. Fix missing names until the script reports all clear, then restart the API and hard-refresh the app.

## GitHub: stop tracking `node_modules` or `.env` (already pushed)

If those were committed once, **ignoring is not enough** — remove them from Git’s index (files stay on your PC):

```bash
git rm -r --cached node_modules 2>nul
git rm -r --cached backend/node_modules 2>nul
git rm --cached .env 2>nul
git rm --cached backend/.env 2>nul
git add .gitignore README.md
git commit -m "chore: ignore node_modules and env; remove from tracking"
git push
```

Then confirm `backend/.env` exists locally (copy from `.env.example`) and run `npm install` in root and `backend/`.

## Scripts (root `package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run dev:api` | Backend `ts-node-dev` from `backend/` |
| `npm run build` | Backend build + Vite production build |
| `npm run lint` | ESLint (frontend `src/`) |
| `npm run preview` | Preview production frontend build |

## License

Private / your choice — update this section when you publish.
