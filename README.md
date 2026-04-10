# Task Manager — reviewer notes

Full-stack task manager (Express + MongoDB + React/Vite). JWT auth, task CRUD, dashboard, and optional AI-assisted insights (Groq / Gemini with server-side fallbacks). **This repo is a private submission; use this file to run and evaluate the work locally.**

## Hosted build (optional)

If you prefer not to run locally:

| | URL |
| --- | --- |
| Frontend | https://brand-novate-task-manager-app.vercel.app |
| API | https://brandnovate-task-manager-app.onrender.com |

Register a test account in the UI, or exercise the API directly (see below).

## What you need installed

- **Node.js** 18 or newer  
- **npm** (also used below to install the Envii CLI globally)

Env files for this project are **not** committed. They are restored with **[envii-cli](https://www.npmjs.com/package/envii-cli)** from an encrypted backup. The **12-word recovery phrase** is sent **in the email** that accompanies this submission—use that phrase only on your machine; do not commit it or share it in issues or chats.

## Run locally (quick path)

### 1. Clone the repo

```bash
git clone https://github.com/zayn-tech-info/BrandNovate-task-manager-app.git
cd BrandNovate-task-manager-app
```

### 2. Install Envii and restore `.env` files

Install the CLI once (npm; or use `pnpm add -g envii-cli` / `yarn global add envii-cli`):

```bash
npm install -g envii-cli
```

Run **`envii init`** and **`envii restore` only from the repository root**—the folder you `cd` into after cloning, the one that **contains** `backend/` and `frontend/` (not inside those subfolders). Envii matches the backup to that tree; running it from elsewhere is the usual reason restore looks wrong or empty.

1. **`envii init`** — If Envii is new on this machine, run this first from the root. When asked for a recovery phrase, choose the option to use an **existing** phrase and enter the **12 words from the email** sent with this submission.  
2. **`envii restore`** — From the same root directory, run restore and enter the **same recovery phrase** when prompted. This writes the backed-up `.env` files under `backend/` and `frontend/`.

| Command | Purpose |
| --- | --- |
| `envii init` | Link this device to the vault (new or existing recovery phrase from the email) |
| `envii restore` | Restore `.env` files into this project tree (run from root) |
| `envii list` | List projects/files in your backup |
| `envii backup` | (Author only) re-backup after changing env—reviewers do not need this |

### 3. Install dependencies

**Backend**

```bash
cd backend
npm install
```

**Frontend** (from repo root)

```bash
cd frontend
npm install
```

### 4. Start the servers

**Terminal 1 — API**

```bash
cd backend
npm run dev
```

Wait for the MongoDB connection and `Server listening on port …` (default **5000**).

**Terminal 2 — UI**

```bash
cd frontend
npm run dev
```

### 5. Open the app

Go to **http://localhost:5173**. Register, then use the dashboard and tasks pages.

If the UI cannot reach the API, check that `VITE_API_URL` matches the API origin and that `CORS_ORIGIN` in `backend/.env` includes `http://localhost:5173`.

---

## Environment variables (reference)

**`backend/.env`** — minimum to run:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default 5000) |
| `DATABASE_URI` | MongoDB connection string |
| `JWT_SECRET` | Required; server will not start without it |
| `JWT_EXPIRATION` | Optional; seconds as a number (e.g. `86400`) or a string like `24h` |
| `CORS_ORIGIN` | Allowed browser origin(s), comma-separated |

Optional AI-related keys (in restored `.env` or `backend/.env.example`): `AI_PROVIDER`, `GROQ_*`, `GEMINI_*`. `GEMINI_PROJECT_ID` is not read by this codebase.

**`frontend/.env`**

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, no trailing slash |

Do not commit `.env` files or the recovery phrase. The committed `.env.example` files document variable names for reference only; reviewers should rely on `envii restore` from the repo root.

## API surface (for manual checks)

- **`POST /api/auth/register`**, **`POST /api/auth/login`** — no auth  
- **`/api/tasks`** — CRUD, filters, complete/incomplete (JWT required)  
- **`/api/insights`** — overview, task draft, field hints (JWT required)

Health check: **`GET /`** on the API root returns a short JSON message.

## Architectural decisions

**Why a split API and SPA.** The backend and frontend deploy to different hosts  Render and Vercel. Keeping them as separate packages keeps ownership clear: JSON over HTTP, explicit CORS, and no coupling to a single monolith server. That matches how many production run a REST API next to a static or edge-hosted UI.

**Why JWT instead of server sessions.** Access tokens let the API stay stateless: no session store to provision for a take-home scale, and the same pattern works whether the server is one process or scaled later. Passwords are hashed with **bcryptjs**; the client sends the token on each request, and middleware verifies it once per route group.

**Why MongoDB and Mongoose.** Tasks and users map naturally to documents (nested-friendly, flexible fields for things like due dates and categories). Mongoose adds validation and hooks at the schema layer so bad data is caught before it hits business logic. Atlas is easy to hand to a reviewer with a connection string rather than asking them to run a local RDBMS.

**Why AI runs only on the server, with fallbacks.** Groq/Gemini keys never ship to the browser. The router tries configured providers, then falls back to **rules-based** copy so the dashboard and draft endpoints still return structured JSON if a model errors, times out, or keys are missing. Category/priority **hints** use a **keyword heuristic** on the server instead of an LLM call every time faster, cheaper, and predictable for a form assist feature.

**Why optimistic updates when creating a task.** Inserting a temporary row immediately makes the list feel responsive on slow networks; the server response replaces it, and a failed request removes the placeholder and shows an error toast so the user is never left guessing.

**Why Envii for environment files.** Secrets stay out of git while reviewers can still run the app locally: they restore encrypted backups with a phrase shared out-of-band (email), which is closer to how real teams handle credentials than checking `.env` into the repo.

**Why Zustand for auth state.** A small global store for user + token avoids prop-drilling and keeps login/register/logout logic in one place without pulling in a heavier state library for the rest of the UI.

## Stack (summary)

**Frontend:** React 18, Vite, Tailwind, MUI, Axios, React Router, Zustand, react-toastify, Chart.js.  
**Backend:** Node, Express, Mongoose, JWT, bcryptjs; Groq and Gemini via env-configured providers.
