# AFTERSHOW

A premium, modern TV-series discovery and streaming web application. AFTERSHOW is
the TV-series sibling of Anteiku (anime) and FRAME (movies) — independent
infrastructure, same engineering philosophy, its own identity.

> **Status: Phases 1–6 complete, plus Phase 7's deployment configuration.**
> Phases 1–6 built the full application — project foundation, design system,
> live TMDB-backed pages, Supabase Authentication, the watchlist/collections/
> history data layer, and VidRift playback. This pass adds the deployment
> half of Phase 7: separate Vercel configuration for the frontend and
> backend, matching the brief's requirement that each application keep its
> own independent deployment. It also fixed a real bug this work surfaced —
> see "A bug this work surfaced and fixed" under Deployment below. What
> Phase 7 still needs from you is the testing pass itself (section 22 of the
> brief) — running the app against live credentials — since that requires
> infrastructure I don't have access to here.

---

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + React Router +
  TanStack Query + Framer Motion + Lucide React + React Hook Form + Zod
- **Backend:** Node.js + Express + TypeScript + Zod + Helmet + CORS
- **Database & Auth:** Supabase PostgreSQL + Prisma ORM + Supabase Authentication
- **External services:** TMDB (TV metadata), VidRift (playback), YouTube (trailers)

## Project structure

```text
AFTERSHOW/
├── frontend/     React + Vite + TypeScript app
├── backend/      Express + TypeScript API
├── prisma/       Shared Prisma schema (Supabase PostgreSQL)
├── .env.example  Documents every required environment variable
└── package.json  Root workspace scripts
```

See inline comments in `frontend/src` and `backend/src` for the fuller
directory layout (components, pages, services, routes, middleware, etc).

## Getting started

### 1. Install dependencies

```bash
npm run install:all
```

This installs both `frontend/` and `backend/` dependencies. (Requires network
access to the npm registry — this could not be executed in the sandbox that
generated this scaffold; run it in your own environment before starting the
dev servers.)

### 2. Configure environment variables

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Fill in:

- **Supabase** — project URL, anon key, and service-role key (from your
  AFTERSHOW-specific Supabase project; do not reuse Anteiku's or FRAME's).
- **Database** — `DATABASE_URL` / `DIRECT_URL` from the same Supabase project.
- **TMDB** — a TMDB API Read Access Token (v4 auth).
- VidRift's public embed integration needs **no credential** — it is used
  directly as a documented embed URL.

### 3. Set up the database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run the dev servers

In two terminals:

```bash
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:5173
```

Visit `http://localhost:5173`. The homepage shows a live backend health check
and the six-theme switcher so you can confirm both halves of the stack are
talking to each other.

### 5. Verify

```bash
npm run type-check:frontend
npm run type-check:backend
npm run build:frontend
npm run build:backend
```

---

## What Phase 2 adds

- **Navigation & layout:** A sticky, scroll-aware header with desktop nav,
  a mobile drawer menu, and a command-palette-style search overlay
  (⌘K / Ctrl+K, routes to `/explore?q=`). A consistent footer with TMDB
  attribution. All pages named in the brief's route list now exist and are
  wired into the router, each as a clearly-labeled placeholder for the phase
  that implements it (Explore → Phase 3, Watchlist/Collections/History →
  Phase 5, Watch → Phase 6, Auth screens → Phase 4).
- **Reusable UI kit** (`src/components/ui/`): `Button` / `IconButton`,
  `Badge`, `Input`, `Select`, `Modal` / `ConfirmModal`, `Skeleton` (including
  poster, card-row and episode-card variants), `EmptyState`, `ErrorState`,
  `Rating`, and `ThemePicker`. All are theme-aware via CSS custom properties
  — no component hardcodes a color.
- **Show components** (`src/components/shows/`): `ShowCard` (poster card
  with lazy image loading and a fade-in once loaded), `ShowRow` (horizontal
  scrolling section with loading/error states and a "See all" link), and
  `ShowGrid` (responsive grid for Explore/search results with skeleton and
  empty states).
- **Six complete themes**, implemented as CSS custom properties and switched
  through the existing `ThemeProvider` — Midnight Blue, Cinema Night, Noir,
  Burgundy Premiere, Forest Cinema, Ivory Matinee. `ThemePicker` renders a
  miniature live preview of each theme's UI (not just a color swatch), shows
  the active theme, switches instantly, and includes a reset-to-default
  action. It lives at **Profile → Appearance & Themes** per the brief, and
  works for guests via `localStorage` before falling back to the account-level
  preference once auth lands in Phase 4.
- **Homepage shell:** cinematic hero layout, a Continue Watching section with
  a real empty state, and discovery rows (Trending, Popular, Top Rated,
  Airing Today, Currently Airing) rendered with `ShowRow` in its loading
  state — ready to receive real data the moment Phase 3 wires up TMDB.
- **Supporting hooks:** `useDebounce`, `useLocalStorage`, `useToast`.

## What Phase 3 adds

- **Backend TMDB layer:** an in-memory TTL cache in `tmdbService` (5-minute
  default, shorter for search/discover, 1 hour for the genre list) so
  repeated requests don't all round-trip to TMDB, plus translation of TMDB's
  error responses into clean API errors (404 for missing shows, 429 passed
  through on rate limits, 502 for upstream failures) instead of leaking raw
  axios errors. Added `GET /api/tv/genres` for the Explore filter UI and
  `watch/providers` is now appended to show details for regional
  availability.
- **Homepage:** the hero now features the top trending series with its real
  backdrop, overview, year and rating; Trending, Popular, Top Rated, Airing
  Today and Currently Airing rows are now live `ShowRow`s backed by TanStack
  Query, each with its own loading and error-retry state.
- **Explore page:** search (debounced, synced to the `q` URL param) and
  filters for genre, year, rating, and original language, plus a sort
  control (popularity, rating, newest/oldest, name) — all reflected in the
  URL so a search or filtered view can be shared or revisited. A responsive
  grid with pagination, and clear empty/error states. Filters are disabled
  while a text search is active, since TMDB's `/search/tv` doesn't support
  them, with an explanatory note.
- **Series details page:** full backdrop/poster header, meta row (year,
  status, season/episode counts, runtime, rating), genre pills, overview,
  trailer button (YouTube modal), cast row, creators and networks, a season
  selector row linking into each season, regional watch-provider logos, and
  Recommended/Similar rows. Watchlist/Collection/Mark Completed actions are
  visibly present but disabled with a "sign in" hint until Phase 4/5 land.
- **Season details page:** episode list with stills, air dates, runtimes and
  overviews, each linking to its episode page, plus a season switcher.
- **Episode details page:** still, overview, guest stars, and previous/next
  navigation that is computed from the *actual* loaded season and series
  data — correctly crossing season boundaries (next episode of the last
  episode in a season points at the next season's episode 1; previous/next
  are `null` rather than guessed when that data isn't available) instead of
  assuming episode number + 1 always exists.
- **People page:** profile photo, computed age, biography, and a "Known For"
  row of their TV credits.
- **New shared components:** `ShowCard`, `ShowRow`, `ShowGrid`, `PersonCard`,
  `TrailerModal`, `Pagination`, all theme-aware and reused across the pages
  above.

## What Phase 4 adds

- **Supabase Authentication:** full sign up, sign in, and password reset
  flows (`/signup`, `/login`, `/forgot-password`, `/reset-password`), built
  with React Hook Form + Zod validation and clean, end-user-readable error
  messages. Sign-up correctly handles the case where Supabase requires email
  confirmation, showing a "check your email" state instead of silently
  failing to redirect. Sessions persist across reloads via Supabase's own
  storage, and `AuthContext` listens for auth-state changes so the whole app
  reacts immediately to sign-in/sign-out.
- **Protected routes:** `/watchlist`, `/history`, `/collections`, and
  `/collections/:id` now require a signed-in session — a `ProtectedRoute`
  wrapper redirects to `/login?redirect=<path>`, and login returns the user
  to exactly where they were headed. Public discovery pages (`/`, `/explore`,
  `/tv/:id`, people pages) remain fully open to guests, per the brief.
- **Profile management:** `/profile` now loads and displays the real
  account (lazily created on first load via the existing backend
  `upsert`), supports inline display-name editing, and includes a working
  sign-out button. Guests still see a working theme picker so appearance
  isn't gated behind an account.
- **Theme preference, connected both ways:** picking a theme while signed in
  now persists it to the account via `PUT /api/profile/theme` (guests still
  get `localStorage`-only persistence, unchanged from Phase 2). A small
  `ThemeSync` component applies the account's saved theme once after sign-in,
  so the theme a user set on one device follows them to another.
- **Viewing preferences, connected:** `/settings` (now gated — themes stay
  accessible to guests from `/profile`, but autoplay/language/region are
  account data) has a real form bound to the backend: an autoplay-next
  toggle and preferred-language / preferred-region selects, saved via
  `PUT /api/profile/preferences`.
- **New dependency:** `@hookform/resolvers`, to connect the existing
  React Hook Form + Zod stack (`zodResolver`).

## What Phase 5 adds

- **Watchlist (`/watchlist`):** status tabs (All, Watching, Plan to Watch,
  Completed, On Hold, Dropped), search within the list, sort by date added /
  rating / name, a quick inline status-change dropdown per show, and remove.
  Backed by `useWatchlist`/`useAddToWatchlist`/`useUpdateWatchlistEntry`/
  `useRemoveFromWatchlist`, which wrap the Phase 1 API with React Query
  caching and invalidation.
- **Collections (`/collections`, `/collections/:id`):** create, rename
  (via the create/edit modal), and delete collections; a detail page to
  search for and add shows, remove them, and see a cover made from the
  collection's own posters. Duplicate adds are caught and surfaced from the
  backend's existing unique constraint rather than silently failing.
- **Viewing History (`/history`):** Continue Watching (unfinished episodes)
  and Completed Episodes, each entry linking to its episode or resuming
  playback, with a remove action per the brief's "remove an item from
  history where supported."
- **Watchlist and Collection actions wired into the series page:** the
  Watchlist button is now a real status menu (add / change status / remove),
  "Collection" opens a modal to add the show to an existing or brand-new
  collection, and "Mark Completed" sets the watchlist status directly.
- **Series progress:** `computeShowProgress` (`src/lib/showProgress.ts`)
  derives episodes-watched, a completion percentage, seasons completed, and
  a best-effort "next episode to watch" from the user's real watch-history
  records and the show's actual TMDB season/episode counts — never from a
  fabricated total. The series page shows a progress bar and switches its
  primary action to "Continue Watching" once any progress exists; the season
  page marks individual episodes as watched.
- **Continue Watching on the homepage** now shows real unfinished episodes
  with a progress bar, replacing the Phase 2/3 placeholder.
- **New hook:** `useShowsByIds` — batch-fetches TMDB show summaries for a
  list of ids (watchlist entries, collection items, history rows all only
  store `tmdbTvId`) and shares its cache with the series detail page's own
  query, so a show already open elsewhere isn't re-fetched.

## What Phase 6 adds

- **`src/lib/vidrift.ts`:** the single source of truth for VidRift's embed
  URL format and postMessage contract. Builds the documented
  `https://embed.vidrift.net/embed/tv/{TMDB_ID}/{SEASON}/{EPISODE}` URL from
  real TMDB identifiers, validates every incoming message's origin (exact
  match against the VidRift origin) and source (must be the specific iframe
  window AFTERSHOW created, not just any window), and only ever sends
  outgoing messages to that exact origin — never `*`. Unknown message types
  and malformed payloads (missing or non-numeric `currentTime`, `season`,
  `episode`) are rejected rather than trusted.
- **`VidRiftPlayer.tsx`** (`src/components/player/`): the isolated,
  reusable player. Takes a TMDB id, season, episode, optional resume
  position, and the real next-episode info; renders a responsive 16:9 iframe
  with no `sandbox` attribute, `allow="autoplay; fullscreen; encrypted-media;
  picture-in-picture"`, and `referrerpolicy="strict-origin-when-cross-origin"`,
  exactly per the brief. It never fetches the embed URL — the URL is set
  directly as the iframe's `src`. Handles `vidrift:state` (sends
  `vidrift:nextup-info` and, once, `vidrift:resume`), `vidrift:progress`,
  `vidrift:paused`/`unpaused`, `vidrift:episode`, and `vidrift:nextup-play`,
  and offers a retry if no message arrives within 15 seconds (a soft
  "still loading" prompt, not a false claim of failure).
- **Watch Page (`/watch/tv/:id/:season/:episode`):** large central player,
  series title and back link, current season/episode and episode
  title/overview, a season selector, a scrollable episode list with
  watched-state checkmarks, previous/next navigation, and an "Up Next" card
  that appears when autoplay is off. AFTERSHOW owns episode ordering
  throughout — next/previous (including crossing season boundaries) comes
  from the same `getAdjacentEpisodes` utility now shared with the episode
  details page, never from incrementing an episode number blindly.
- **Playback progress & resume:** `vidrift:progress` updates are throttled
  to one real save every 15 seconds (never lost, though — pausing or
  leaving the episode always flushes the latest position immediately via
  `POST /api/history`, built back in Phase 1). An episode is marked
  completed once playback crosses 90%, or immediately when the player
  reports `vidrift:nextup-play`. A saved, unfinished position is sent back
  to the player exactly once per load as `vidrift:resume`, guarded so it's
  never repeated and never causes an unexpected jump.
- **Auto next-episode:** gated by the user's own `autoplayNext` preference
  (Phase 4's Settings page) — enabled, it navigates straight to the next
  episode (correctly crossing season boundaries, or showing "End of series"
  at the real finale); disabled, it shows a manual "Up Next" card instead of
  auto-advancing. Either way the next episode's real title and still image
  come from TMDB, with an extra season fetch only when the next episode
  belongs to a season not already loaded.
- **Everything from Phase 5 now actually fills up:** watching an episode
  here writes real `WatchHistory` rows, so Continue Watching (homepage and
  `/history`), the series progress bar, and watched-episode checkmarks on
  the season page all reflect real activity for the first time.
- **Shared refactor:** the season-boundary-aware previous/next logic that
  used to live only in the episode details page is now
  `src/lib/episodeNav.ts`, used by both that page and the Watch Page so
  they can never drift out of sync with each other.

## What Phase 1 includes

- **Frontend:** Vite + React + TypeScript project configured with Tailwind,
  React Router, TanStack Query, the Supabase client, an Axios API client
  (attaches the user's Supabase access token to every request), and a
  complete six-theme CSS custom-property system (Midnight Blue, Cinema Night,
  Noir, Burgundy Premiere, Forest Cinema, Ivory Matinee) wired through a
  `ThemeProvider` with `localStorage` persistence and no flash-of-wrong-theme.
  A minimal home page, header/footer layout, 404 page, and the full `types/`
  and `services/` contracts the later phases build against.
- **Backend:** Express + TypeScript server with Helmet, CORS (locked to the
  configured frontend origin), rate limiting, a centralized error handler, a
  Supabase-token verification middleware (user ID is always derived from the
  verified JWT, never from the request body), a TMDB service layer, and REST
  routes for TV discovery/details, people, profile, watchlist, watch history,
  and collections — backed by Prisma.
- **Database:** Prisma schema for `Profile`, `WatchlistEntry`, `WatchHistory`,
  `TVCollection`, and `CollectionShow`, with the constraints called for in the
  brief (one watchlist entry per user per series, one progress record per
  user per episode, no duplicate shows within a collection, series status
  tracked independently from per-episode completion).
- **Environment configuration:** `.env.example` files at the root, frontend,
  and backend documenting every variable named in the brief.

## Project status

All six phases from the brief are now implemented: project foundation,
design system, TMDB integration, authentication and profiles, watchlist/
collections/history, and VidRift playback. See each phase's section above
for exactly what it added. What's genuinely left is operational, not
architectural — things only you can do, since they depend on real
credentials and your own judgment calls:

- Run `npm run install:all`, the type-checks, and both builds in a real
  environment (this project was assembled without network access — see the
  note at the very top of this file).
- Point the backend at real Supabase and TMDB credentials, run the Prisma
  migration, and add the password-reset redirect URL in Supabase (see
  "Authentication notes" below).
- Test actual playback with content you're authorized to embed or
  distribute — VidRift being able to load a stream doesn't by itself
  establish that right, and AFTERSHOW implements no DRM circumvention or
  access-control bypass of any kind.
- Everything under "Testing Requirements" in the original brief (frontend,
  backend, playback, and deployment test passes) — this build has been
  checked for internal consistency throughout (no unused imports, matching
  types end to end, consistent routing) but has not been exercised against
  a live TMDB/Supabase/VidRift stack.
- Actually deploying (see "Deployment" below) — the configuration is in
  place, but creating the Vercel projects and Supabase project, and wiring
  in the environment variables, is something only you can do with your own
  accounts.

## Deployment

AFTERSHOW deploys as **two separate Vercel projects** — one for
`frontend/`, one for `backend/` — per the brief's requirement that each
application keep its own independent deployment configuration. Database and
auth are Supabase, configured separately from Vercel.

### Backend (`backend/`)

1. In Vercel, create a new project from this repo and set **Root Directory**
   to `backend`.
2. Under **Settings → General**, enable **"Include source files outside of
   the Root Directory"**. The backend's build needs the Prisma schema at
   `/prisma/schema.prisma`, one level above `backend/` — without this
   toggle, Vercel won't upload it.
3. Leave the **Build Command** on Vercel's default — it will automatically
   run the `vercel-build` script in `backend/package.json`
   (`prisma generate --schema=../prisma/schema.prisma && tsc && tsc-alias`),
   which is the standard npm convention Vercel looks for. No Output
   Directory is needed (API projects don't serve static files).
4. Add these environment variables in **Settings → Environment Variables**:
   `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `TMDB_API_READ_ACCESS_TOKEN`, and
   `FRONTEND_URL` (set this to your deployed frontend's URL once you have
   it, for CORS). `PORT` is not needed on Vercel — it only matters for
   `npm run dev` / a traditional Node host.
5. Deploy. The function lives at `backend/api/index.ts`, and
   `backend/vercel.json` routes every path (`/health`, `/api/tv/...`, etc.)
   to it, so the deployed API shape matches local dev exactly — no route
   path changes needed on the frontend.
6. Run the Prisma migration against your production database from your own
   machine (`DATABASE_URL` pointed at production,
   `npm run prisma:migrate` from the repo root) — Vercel's build step only
   runs `prisma generate` (building the client), not `migrate deploy`,
   so schema changes need an explicit, deliberate push rather than
   happening automatically on every deploy.

### Frontend (`frontend/`)

1. Create a second Vercel project from the same repo, **Root Directory**
   set to `frontend`. Vercel's Vite preset auto-detects the build command
   from `package.json` (`tsc && vite build`) and the output directory
   (`dist`) — no extra configuration needed there.
2. Add `VITE_API_BASE_URL` (your deployed backend project's URL),
   `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` as environment
   variables.
3. Deploy. `frontend/vercel.json` adds the SPA rewrite every client-rendered
   route needs — without it, refreshing on a deep link like `/tv/1399`
   would 404 instead of loading `index.html` and letting React Router take
   over.
4. Once both are live, go back to the backend project and set `FRONTEND_URL`
   to this frontend's actual URL (step 4 above used a placeholder) so CORS
   allows it, then redeploy the backend.

### A bug this work surfaced and fixed

While wiring up deployment, I found that the backend's plain `tsc` build
didn't actually work: TypeScript's `paths` option (`@/*` → `./src/*`) is a
type-checking convenience only — `tsc` does **not** rewrite those import
specifiers in its compiled output, so `npm run build && npm start` would
have crashed on `Cannot find module '@/config/env.js'` the moment anyone
tried it outside of `tsx` (which does understand `paths` at runtime, and is
what `npm run dev` uses — masking the problem in local development). Fixed
by adding `tsc-alias`, which rewrites the compiled output's aliased imports
into real relative paths as a build step; `npm run build` now runs
`tsc && tsc-alias`, and `api/index.ts` imports from that corrected output
rather than from the raw TypeScript source.

### Known rough edge: Prisma on Vercel's serverless runtime

Prisma's generated client includes a native query-engine binary matched to
the OS it's generated on. `binaryTargets` in `prisma/schema.prisma` includes
`rhel-openssl-3.0.x` alongside `native`, which is the commonly recommended
target for Vercel's Node runtime — but Prisma's supported targets do shift
between versions, and I can't verify this against a live Vercel deployment
from here. If a deployed function errors specifically on loading the Prisma
engine (not on your own route logic), that binary target is the first thing
to check against Prisma's current documentation.

## Watchlist, Collections & History notes

- Series/season/episode progress is computed client-side from TMDB's season
  metadata plus the user's `WatchHistory` rows — there's no separate
  "progress" table to keep in sync, so it can never drift from what TMDB
  currently reports for a show.
- "Mark Completed" sets the *watchlist* status, which is intentionally
  independent from per-episode completion in `WatchHistory`, per the brief's
  explicit instruction not to conflate the two.
- Until Phase 6 can write real progress, Continue Watching and Viewing
  History will be empty even for a signed-in user — there's no synthetic or
  seeded data standing in for it.

## VidRift playback notes

- VidRift's documented public embed integration needs no API key or
  account — `TMDB_API_READ_ACCESS_TOKEN` is the only credential this app
  requires, and `VidRiftPlayer` never sends one anywhere.
- The player component is intentionally dumb about *why* it's being shown
  a given episode — `WatchPage` is what decides season/episode order,
  resume position, and the autoplay preference, and hands the player only
  the data it needs for that one episode. This keeps `VidRiftPlayer`
  reusable and testable on its own.
- If VidRift ever changes its documented message names or payload shapes,
  `src/lib/vidrift.ts` is the only file that should need updating —
  `VidRiftPlayer` and `WatchPage` consume its typed exports rather than
  working with raw postMessage data directly.
- The 15-second "still loading" prompt is a heuristic, not a real failure
  detection mechanism — cross-origin iframes don't give the embedding page
  a reliable way to know *why* nothing loaded (blocked content vs. a slow
  network vs. a dead stream all look identical from outside). Treat it as a
  nudge to retry, not a diagnostic.

## Authentication notes

- Supabase's email-confirmation setting (on by default for new projects)
  determines whether sign-up logs the user in immediately or requires them
  to click a confirmation link first; the sign-up page handles both cases.
- The password-reset email's link must redirect back to
  `${FRONTEND_URL}/reset-password` — this is set automatically from
  `window.location.origin` in `sendPasswordReset`, but your Supabase project
  also needs that URL added to **Authentication → URL Configuration → Redirect
  URLs** or Supabase will reject it.
- `requireAuth` on the backend (built in Phase 1) verifies the Supabase JWT
  server-side on every request to a protected API route — the frontend's
  `ProtectedRoute` is a UX convenience, not the security boundary.

## TMDB notes

- The TV-series detail route requests `videos`, `credits`, and
  `watch/providers` in one call via `append_to_response` to avoid extra
  round-trips.
- Regional watch-provider data is currently shown for the US region; a
  user-selectable region (using `preferredRegion` from the profile) is a
  natural follow-up once Phase 4's profile preferences are wired up.
- The in-memory TMDB cache lives in a single Node process. If you deploy
  multiple backend instances, each will keep its own cache — functionally
  fine, just less effective. Swap in Redis if that matters at your scale.

The TV/people backend routes currently proxy directly to TMDB per-endpoint;
response shaping, caching and discovery-filter composition land in Phase 3.

## Environment variables required

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | frontend | Backend base URL |
| `VITE_SUPABASE_URL` | frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | frontend | Supabase anon/public key |
| `PORT` | backend | Port the Express server listens on |
| `FRONTEND_URL` | backend | Allowed CORS origin |
| `DATABASE_URL` / `DIRECT_URL` | backend, Prisma | Supabase PostgreSQL connection |
| `SUPABASE_URL` | backend | Supabase project URL |
| `SUPABASE_ANON_KEY` | backend | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | Server-side token verification — **never expose to the frontend** |
| `TMDB_API_READ_ACCESS_TOKEN` | backend | TMDB v4 Read Access Token |

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
