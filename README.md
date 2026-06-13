# Task Management Dashboard

A production-grade task management dashboard built with **Next.js (App Router)**, **TypeScript (strict)**, **MongoDB/Mongoose**, **TanStack Query v5**, **Tailwind CSS**, and **ShadCN-style UI** components. Authentication is handled with **JWT** stored in an httpOnly cookie.

## Features

- 🔐 Email/password auth (register, login, logout) with hashed passwords (bcrypt) and JWT cookies
- ✅ Full task CRUD with per-user ownership enforced on every route
- 🔎 Server-side search (by title) and status filtering with a debounced search box
- 📊 Live stat cards (total / completed / pending / completion %)
- ⚡ Optimistic create, update, delete with automatic rollback on error
- 🛡️ Protected routes via root middleware
- 🎨 Accessible UI primitives (dialogs, alert dialogs, selects) with light/dark tokens

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js (App Router)                |
| Language     | TypeScript (strict)                 |
| Styling      | Tailwind CSS + ShadCN-style UI      |
| Server State | TanStack Query v5                   |
| Backend      | Next.js API Routes (REST)           |
| Database     | MongoDB (Mongoose)                  |
| Auth         | JWT (`jsonwebtoken` + `bcryptjs`)   |
| Tooling      | ESLint + Prettier                   |

> Note: this project was scaffolded on Next.js 16 / React 19. The App Router API used here is identical to Next.js 14; only the runtime version differs.

## Setup

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd my-app
   ```
2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the values:
   | Key                  | Description                                              |
   | -------------------- | -------------------------------------------------------- |
   | `MONGODB_URI`        | MongoDB connection string (Atlas or local)               |
   | `JWT_SECRET`         | Long, random string used to sign JWTs                    |
   | `NEXT_PUBLIC_APP_URL`| Public base URL (e.g. `http://localhost:3000`)           |
   | `NODE_ENV`           | `development` or `production`                             |
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script                 | Description                       |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the dev server             |
| `npm run build`        | Production build                 |
| `npm run start`        | Start the production server      |
| `npm run lint`         | ESLint                           |
| `npm run typecheck`    | `tsc --noEmit`                   |
| `npm run format`       | Prettier write                   |
| `npm run format:check` | Prettier check                   |

## Project Structure

```
src/
├── app/
│   ├── (auth)/{login,register}/page.tsx   # Centered auth cards
│   ├── (dashboard)/                       # Protected layout + dashboard
│   └── api/{auth,tasks}/...               # REST endpoints
├── components/{ui,shared}/                # UI primitives + shared components
├── features/{auth,tasks}/                 # Feature modules (components, hooks, services)
├── hooks/                                 # Global hooks (useDebounce)
├── services/                              # API fetchers (authService, taskService)
├── lib/                                   # db, auth, models, constants, helpers
├── types/                                 # Shared TS interfaces
└── utils/                                 # Pure helpers (date, taskStats)
middleware.ts                              # Route protection
```

## API Reference

All task routes and `/api/auth/me` are protected: each verifies the JWT via `getUserFromRequest` and returns `401` when absent/invalid.

| Method | Route                | Body / Query                                  | Success |
| ------ | -------------------- | --------------------------------------------- | ------- |
| POST   | `/api/auth/register` | `{ name, email, password }`                   | `201`   |
| POST   | `/api/auth/login`    | `{ email, password }` → sets cookie           | `200`   |
| POST   | `/api/auth/logout`   | —                                             | `200`   |
| GET    | `/api/auth/me`       | —                                             | `200`   |
| GET    | `/api/tasks`         | `?status=&search=`                            | `200`   |
| POST   | `/api/tasks`         | `{ title, description, dueDate }`             | `201`   |
| GET    | `/api/tasks/:id`     | —                                             | `200`   |
| PATCH  | `/api/tasks/:id`     | `{ title?, description?, status?, dueDate? }` | `200`   |
| DELETE | `/api/tasks/:id`     | —                                             | `200`   |

Status codes used: `200`, `201`, `400` (validation), `401` (no/invalid token), `404` (not found / not owned), `409` (duplicate email), `500` (server error).

## Architecture Decisions

### Why JWT over NextAuth
The app has a single, self-contained email/password flow with no third-party OAuth providers. A hand-rolled JWT in an httpOnly cookie keeps the dependency surface small, makes the token contract explicit (`{ userId, email }`), and gives full control over cookie flags (`httpOnly`, `SameSite=strict`, `Secure` in prod). NextAuth shines with multiple providers and adapter-backed sessions — overkill here, and it would add abstraction over a flow that is only a few lines.

### Why MongoDB over SQL
Tasks are a flat, document-shaped entity with a stable schema and no complex relational joins — a single `userId`-scoped collection. MongoDB Atlas offers a zero-config free tier ideal for this scope, and Mongoose gives us typed schemas and validation without a migration toolchain. A `userId` index keeps per-user queries fast as data grows.

### TanStack Query optimistic update strategy
Every mutation (`useCreateTask`, `useUpdateTask`, `useDeleteTask`) follows the same pattern:
1. `onMutate` — cancel in-flight refetches, snapshot **all** `["tasks", …]` query caches, and apply the change optimistically across every cached filter variant.
2. `onError` — restore the snapshot, rolling the UI back exactly.
3. `onSettled` — invalidate `["tasks"]` so the server response reconciles the cache.

Because the stat row reads from an **unfiltered** `useTasks()` query while the list reads from a **filtered** one — and both share the `["tasks", filters]` key namespace — a single optimistic write updates the cards and the list together, with no flicker.

### Auth on the Edge
The root `middleware.ts` only checks for cookie **presence** (the `jsonwebtoken` library is not Edge-compatible). Full signature verification happens in each API route via `getUserFromRequest`, so an unauthenticated or tampered token can never read or mutate data — the middleware is a UX redirect layer, not the security boundary.

## Assumptions

- Single user per session (no multi-tenant / team sharing).
- No pagination — all of a user's tasks are returned and filtered. Pagination can be layered onto `GET /api/tasks` as an extension.
- Registration auto-logs the user in (register → login) for a smoother first-run.

## Deployment (Vercel)

1. Push the repo to GitHub and import it into Vercel.
2. Provision a MongoDB Atlas cluster (free tier) and copy its connection string.
3. In **Vercel → Project → Settings → Environment Variables**, add `MONGODB_URI`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL` for the Production environment.
4. Deploy. `Secure` cookies activate automatically because `NODE_ENV=production` on Vercel.
