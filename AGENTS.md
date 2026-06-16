# AGENTS.md

Audience: OpenAI Codex agents working in this repository. Read this first, then run `git status --short --branch` before changing anything.

Discovery date: 2026-06-10. Last material update: 2026-06-16.

## Project Summary

MHCC CarePath is a living wireframe for a mental health service intake and provider portal for the Mental Health Community Coalition of the ACT.

Current implementation:
- Frontend: React 18 + Vite + Tailwind CSS.
- Backend: Express 5 API server using SQLite through `better-sqlite3`.
- Charts: Recharts.
- Icons: `lucide-react`.
- Data store: local SQLite database at `server/data/mhcc.db`, ignored by git.
- Runtime target: Node.js `>=24.0.0`.

The app has two major experiences:
- Public site: landing content, privacy/about/news overlays, and a 3-step intake form.
- Provider portal: mock login, shared intake queue, embedded services discovery, intake analytics, program analytics, sector analytics, organization/team/settings views.

There is no React Router. Top-level navigation is local component state in `src/App.jsx`.

## First Commands

In PowerShell on this machine, `npm` may be blocked by execution policy because `npm.ps1` is disabled. Prefer `npm.cmd`.

```powershell
git status --short --branch
npm.cmd install
npm.cmd run seed
npm.cmd run dev:all
```

Useful commands:

```powershell
npm.cmd run dev          # Vite client only, normally http://localhost:5173
npm.cmd run dev:server   # Express API only, normally http://localhost:3001
npm.cmd run dev:all      # API + Vite together via concurrently
npm.cmd run seed         # seed SQLite if tables are empty
npm.cmd run seed -- --force    # clears and reseeds program metrics only
npm.cmd run seed -- --refresh  # clears and reseeds all mock data with recent dates
npm.cmd run build:client # Vite production build into dist/
npm.cmd start            # node server/index.js
```

Health check:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

No test or lint scripts are configured. Do not add, recommend, or spend quota on a test harness for this project unless the user explicitly reverses that direction; this is a living wireframe, not a production-grade business app.

## Git And Workspace Rules

The worktree may already be dirty. Treat existing changes as user work. Do not revert, overwrite, or clean up files outside the requested scope.

Generated/ignored paths:
- `node_modules/`
- `dist/`
- `server/data/`
- `*.db`, `*.db-wal`, `*.db-shm`, `*.db-journal`
- `.env*`

Only edit `package-lock.json` when dependency changes require it. Do not edit `dist/` unless explicitly asked.

## Repository Map

Root:
- `package.json`: main scripts/dependencies, root package is ESM (`"type": "module"`).
- `vite.config.js`: Vite React plugin and `/api` dev proxy to `http://localhost:3001`.
- `tailwind.config.js`: Inter font, `brand` teal palette, `highlight` pink (`#c8336d`), animations.
- `index.html`: Vite HTML shell; loads Inter and `/src/main.jsx`.
- `README.md`: current local SQLite and Express/Vite instructions.
- `.github/workflows/azure-webapps-deploy.yml`: current Azure Web App workflow.
- `img/CarePath.png`: logo/icon used by Vite as `/img/CarePath.png`.
- `img/avatars/*.png`: provider avatar images looked up by username.

Client:
- `src/App.jsx`: top-level UI state, modals, page overlays, provider login switch.
- `src/api/client.js`: fetch wrapper using `BASE = '/api'`.
- `src/context/DataContext.jsx`: provider-portal data loader and mutation helpers.
- `src/data/programs.json`: canonical static program/service metadata, including the fictional Greener Pastures demo programs.
- `src/data/programs.js`: imports `programs.json` and exports derived filter constants.
- `src/data/serviceOverviews.js`: derives public service overview page summaries from `programs.json`.
- `src/data/organisations.js`: organization IDs/names/URLs, including fictional `DEMO_GP`.
- `src/data/demoProvider.js`: canonical fictional provider portal organization/team config for Greener Pastures.
- `src/data/news.js`: static news article content.
- `src/utils/programData.js`: age/gender helper utilities only. Do not reintroduce client-side mock metric generation.
- `src/utils/csvUtils.js`: browser CSV download filename/type constants only.
- `src/constants/theme.js`: shared chart/UI color constants.
- `src/components/`: public site, intake form, service directory, provider portal, charts, settings, and shared UI primitives.

Server:
- `server/package.json`: declares `"type": "commonjs"` so files under `server/` can use `require()`.
- `server/index.js`: Express app, CORS, JSON middleware, API route mounting, production static serving from `dist/`.
- `server/db.js`: opens SQLite, enables WAL and foreign keys, runs versioned SQL migrations through `schema_migrations`.
- `server/migrations/001_init.sql`: base schema.
- `server/migrations/002_add_intake_routing.sql`: intake routing columns.
- `server/migrations/003_intake_routes.sql`: multi-program routed care plan rows.
- `server/scripts/seed.js`: seeds or refreshes persisted mock intakes, intake volume, and program metrics.
- `server/crypto.js`: AES-256-GCM helpers for PII fields.
- `server/csvUtils.js`: CommonJS CSV serialization helpers for export only.
- `server/programs.js`: CommonJS reader for `src/data/programs.json`.
- `server/routes/intakes.js`: intake list/create/update/routing.
- `server/routes/intakeVolume.js`: weekly intake volume endpoint.
- `server/routes/programMetrics.js`: sector/program metric endpoint.
- `server/routes/admin.js`: CSV export and mock-data refresh endpoints.

## Runtime Architecture

Development flow:
1. Vite serves the React app on port `5173`.
2. Vite proxies `/api/*` to Express on port `3001`.
3. Express opens SQLite through `server/db.js` on startup and runs pending migrations.
4. `DataProvider` fetches provider data from `/api/intakes`, `/api/intake-volume`, and `/api/program-metrics`.

Production flow:
1. Build client with `npm.cmd run build:client`.
2. Run `NODE_ENV=production node server/index.js`.
3. Express serves `/api/*` and static files from `dist/`.
4. Catch-all route returns `dist/index.html`.

Important environment variables:
- `PORT`: API/server port, defaults to `3001`.
- `ALLOWED_ORIGINS`: comma-separated CORS origins, defaults to `http://localhost:5173`.
- `DB_PATH`: SQLite database path, defaults to `server/data/mhcc.db`.
- `SERVER_ENCRYPTION_KEY`: 32-byte key material for AES-256-GCM PII encryption. If unset, a hardcoded dev key is used.
- `NODE_ENV=production`: enables static `dist/` serving.

No `VITE_*` env vars are used by the current app.

## Frontend Architecture

`src/App.jsx` is the top-level state machine:
- Public mode renders navbar, hero, informational sections, CTA, and footer.
- Modal state controls `IntakeForm`, `PrivacyPolicy`, and `ProviderLogin`.
- `currentPage` controls overlay pages: about CarePath, about MHCC, partners, news, and service overviews.
- If `providerUser` is set, the public app is replaced by `DataProvider` + `ProviderLayout`.

Public services discovery is intentionally not exposed in the main-site menus. `ServicesDirectory.jsx` now supports an embedded mode and is registered as the second-last Provider Portal tab.

`ProviderLogin.jsx` is prototype-only:
- Username defaults to `Inga Matthews`.
- Any non-empty username signs in.
- Password is accepted but not checked.
- Provider APIs have no authentication guard.

`DataContext.jsx` exists only around the provider portal:
- Loads `intakeQueue`, `intakeVolume`, `memberSharedData`.
- Builds `memberSharedData` as a map keyed by `${programId}_${gender}`.
- Exposes `submitIntake`, `routeIntake`, `routeCarePlan`, and `refresh`.
- `routeIntake` PATCHes an intake and updates local queue state immediately.
- `routeCarePlan` PATCHes multiple route entries for one intake and updates local queue state immediately.

Public `IntakeForm.jsx` imports `apiPost` directly and surfaces submit errors.

## Provider Demo Identity

Greener Pastures is a fictional demo provider organization. Its canonical config lives in `src/data/demoProvider.js`, with organization ID `DEMO_GP`, and it should be used for the Provider Portal demo organization, team, and program filtering.

Nexus Human Services is a real listed organization and must remain sovereign. Do not reuse a Nexus org ID, Nexus program, or Nexus display content as the Greener Pastures demo identity.

## Main Components

Public:
- `Navbar.jsx`: dropdown navigation and mobile menu for public pages. Services discovery is not linked from the public menus.
- `Hero.jsx`, `HowItWorks.jsx`, `AboutMHCC.jsx`, `ServicesGrid.jsx`, `CallToAction.jsx`, `Footer.jsx`: public landing sections; `ServicesGrid.jsx` opens service overview pages for its eight tiles.
- `PageOverlay.jsx`: reusable full-screen overlay shell for about/partner/news/service pages.
- `AboutCarePathPage.jsx`, `AboutMHCCPage.jsx`, `PartnerOrganisationsPage.jsx`, `NewsUpdatesPage.jsx`, `PrivacyPolicy.jsx`: static informational overlays.
- `ServiceOverviewPage.jsx`: public service overview overlay backed by `src/data/serviceOverviews.js`; its Seek Support action opens `IntakeForm.jsx` with matching Step 2 support type options pre-selected but editable.
- `ServicesDirectory.jsx`: searchable/filterable program directory backed by `src/data/programs.js`; used in embedded form inside the Provider Portal.
- `IntakeForm.jsx`: 3-step public intake form.

Provider:
- `ProviderLayout.jsx`: left nav and page switcher using `DEMO_PROVIDER`.
- `SharedIntake.jsx`: provider intake queue table, filters, DB-backed service matching, routed row visibility, toast.
- `IntakeDetailModal.jsx`: intake detail and route-referral select.
- `IntakeData.jsx`: DB-backed CarePath intake analytics.
- `ProgramData.jsx`: program-level metrics charts and filters.
- `SharedData.jsx`: sector-level analytics and unmet needs grid.
- `MyOrganisation.jsx`: provider-driven fictional Greener Pastures profile.
- `TeamMembers.jsx`: provider-driven fictional team/admin list plus current user.
- `ProviderSettings.jsx`: CSV downloads and mock-data refresh button.

## Static And Mock Data

Static domain data:
- Program/service metadata is canonical in `src/data/programs.json`.
- `src/data/programs.js` derives `PROGRAMS`, `ALL_TARGET_GROUPS`, `ALL_FUNCTIONS`, and `ALL_ACCESS_MODES`.
- `server/programs.js` reads the same JSON file for server exports and seed logic.
- Organization metadata is in `src/data/organisations.js`.
- Demo provider metadata is in `src/data/demoProvider.js`.

Mock operational data must live in SQLite, not in client-side runtime generators. The server seed script may generate deterministic mock records, but those records must be persisted to database tables before the UI uses them.

Active mock DB data includes:
- intake queue records in `intakes` and `intake_tags`, currently seeded as 54 recent-ish records over roughly four months with a mix of queued and routed statuses;
- intake-volume rows in `intake_volume_weeks`, currently seeded as 18 weekly rows;
- program and sector metrics in `program_metrics` and `program_metrics_age`, including deterministic current occupancy/capacity/waitlist bands.

Program metric seeding should keep occupancy realistic for demos:
- a majority of programs should be under or at capacity;
- a minority of programs may be over capacity, but over-allocation must never exceed 10% of the base capacity;
- waitlists should only appear on over-capacity rows, about 80% of the time, or at-capacity rows, about 25% of the time;
- under-capacity rows should not have waitlists.
- age demographic counts should be weighted by age-bracket width, with a slight linear decline from age 0 to 75 representing about 30% total mortality difference across that span.

Refresh options:
- Provider Settings includes a Refresh Mock Data action.
- `POST /api/admin/refresh-mock-data` destructively clears and reseeds mock data tables with dates near the current date.
- `npm.cmd run seed -- --refresh` performs the same refresh from the command line.

CSV import has been removed. CSV export remains available for intake queue, intake volume, and sector data.

## Intake Data Contract

POST `/api/intakes` accepts:

```js
{
  firstName, lastName, dob, email, phone, suburb,
  gender, genderSelfDescribe,
  seekerGroups: [],
  supportTypes: [],
  urgency: 'low' | 'medium' | 'high' | 'crisis',
  description, previousServices,
  accessModes: [],
  contactMethod: [],
  contactTime,
  specialRequirements,
  consentData: boolean,
  consentCrisis: boolean
}
```

Server-generated/returned fields include:
- `id`: `INT-` + 8-char uppercase UUID prefix for new submissions.
- `submittedAt`: ISO timestamp.
- `status`: defaults to `queued`; routing sets `routed`.
- `assignedOrgId`, `assignedAt`.
- `routedProgramId`, `routedAt`, `routedOrgName`, `routedProgramName`.
- `routedPrograms`: array of committed route entries for single or multi-provider routed care plans.

PII encrypted at rest:
- `first_name`, `last_name`, `email`, `phone`, `dob`.

PII not encrypted:
- `gender`, `gender_self_describe`, `suburb`, free-text support/preference fields.

Multi-value fields are stored in `intake_tags`:
- `seekerGroup`
- `supportType`
- `accessMode`
- `contactMethod`

## Backend API

Base path is `/api`.

Health:
- `GET /health` -> `{ status: 'ok', db: 'connected' }`

Intakes:
- `GET /intakes`
- Optional query filters: `urgency`, `status`.
- Returns decrypted intake objects plus tag arrays.
- `POST /intakes`
- Validates body with Zod, encrypts PII, inserts tags, returns created intake.
- `PATCH /intakes/:id`
- Accepts `status`, `assignedOrgId`, `routedProgramId`, `routedOrgName`, `routedProgramName`.
- Also accepts `routes: [{ programId, orgId, orgName, programName, supportType }]` for multi-program care plan routing; the first route is mirrored to legacy single-route columns.

Analytics:
- `GET /intake-volume`
- Returns `{ week, count }[]` ordered by insertion.
- `GET /program-metrics`
- Returns metric objects with camelCase names and chart-ready arrays:
  - `outcomesByAge: [{ label, positive, negative }]`
  - `demographicSplit: [{ label, value }]`

Admin:
- `GET /admin/export-csv?type=intake-queue|intake-volume|member-shared`
- `POST /admin/refresh-mock-data`

## Database Schema

Versioned SQL files live in `server/migrations/`. `server/db.js` records applied files in `schema_migrations` and runs pending migrations on startup. Add new schema changes as numbered SQL files, e.g. `003_descriptive_name.sql`.

Tables:
- `intakes`: intake records, encrypted PII fields, workflow/routing fields.
- `intake_routes`: committed single or multi-program route entries for an intake.
- `intake_tags`: multi-select fields, composite primary key `(intake_id, kind, value)`.
- `intake_volume_weeks`: DB-backed intake volume chart data.
- `program_metrics`: gender-scoped program metric summaries.
- `program_metrics_age`: age-group outcome/client rows for each program/gender.
- `schema_migrations`: applied migration version records.

Existing local DBs may contain legacy columns. Do not delete local DB files unless the user explicitly asks.

## CSV Contracts

CSV export exists in two places:
- Browser: `src/utils/csvUtils.js` for download filenames and labels.
- Server: `server/csvUtils.js` for CSV serialization.

CSV types:
- `intake-queue`: file name `intake-data-queue.csv`
- `intake-volume`: file name `intake-data-volume.csv`
- `member-shared`: file name `sector-data.csv`

Arrays are encoded as pipe-separated values inside a CSV field.

CSV import is intentionally removed. If a future request appears to need CSV import, prefer the existing Refresh Mock Data path unless the user explicitly asks to reintroduce imports.

## Matching And Analytics Logic

Shared intake matching:
- Implemented in `src/components/SharedIntake.jsx`.
- Exported helper: `getTopMatchesWithScores(intake, n = 2, memberSharedData = null)`.
- Used by `SharedIntake.jsx` and `IntakeDetailModal.jsx`.
- Uses static `PROGRAMS` plus DB-backed `memberSharedData`.

Score components:
- Describes / target group match: 30%.
- Support type / program function match: 30%.
- Access mode match: 10%.
- Demographic success: 20%.
- Availability: 10%, split across capacity, waitlist depth, and average wait days.

Analytics:
- `IntakeData.jsx` uses DB-loaded `intakeQueue` and `intakeVolume`; do not reintroduce synthetic chart data.
- `ProgramData.jsx` uses `memberSharedData` from `/api/program-metrics`; organization-scoped Program Data is a mandatory-filtered subset of Sector Data.
- `SharedData.jsx` aggregates sector metrics from `memberSharedData` and no longer falls back to client mock generators.
- Outcome metric data still uses the internal/API key `negative`, but user-facing chart and export copy should call this `non-positive` because it may include neutral or absent outcomes.

Terminology:
- Sector Data means all data for all programs, aggregate or filtered/drilled down.
- Program Data means an organization-scoped mandatory-filtered subset of Sector Data.
- Intake Data means metadata about use of the platform itself.

## Styling And UI Conventions

This repo uses:
- Function components.
- Hooks, no classes.
- JavaScript/JSX, no TypeScript.
- Semicolon-free style.
- Single quotes.
- Tailwind utility classes.
- Shared classes in `src/index.css`: `.btn-primary`, `.btn-outline`, `.btn-white`, `.form-input`, `.form-label`.
- Brand colors in Tailwind: `brand` teal family and `highlight` pink.
- Shared chart/theme constants in `src/constants/theme.js`.
- Recharts for charts.
- `lucide-react` for icons.

When adding UI:
- Follow existing compact portal/dashboard styling.
- Prefer `lucide-react` icons for controls.
- Avoid introducing a router unless the user asks for a structural navigation change.
- Keep public modals/overlays consistent with `PageOverlay.jsx` or the existing full-screen modal patterns.
- If adding provider pages, register them in `ProviderLayout.jsx` `NAV_ITEMS` and render switch.

## Security And Privacy Notes

This is prototype-grade security:
- Provider login accepts any non-empty username.
- API endpoints have no auth/authorization.
- PII encryption falls back to a hardcoded dev key if `SERVER_ENCRYPTION_KEY` is unset.
- GET `/api/intakes` returns decrypted PII to any caller with API access.
- SQLite database is local and ignored, but not a production security boundary.

The user has chosen not to revisit auth/authorization for this prototype unless explicitly requested.

## Deployment Notes

Current viable deployment path is Azure Web App or another Node-capable host because the app requires an Express server and writable SQLite file.

`.github/workflows/azure-webapps-deploy.yml`:
- Runs on pushes to `main` and manual dispatch.
- Uses Node 24.
- Runs `npm ci`, `npm run build:client`, then `npm ci --omit=dev`.
- Zips the repo excluding `.git`, `*.bat`, and `src/*`.
- Deploys with `azure/webapps-deploy@v3`.
- Requires secrets `AZURE_WEBAPP_NAME` and `AZURE_WEBAPP_PUBLISH_PROFILE`.

The legacy Azure Static Web Apps workflow has been removed because Static Web Apps cannot host the current Express + SQLite backend as-is.

## Change Checklist For Common Tasks

Adding or changing intake fields:
- Update `IntakeForm.jsx` form state and validation.
- Update `server/routes/intakes.js` Zod schema, insert SQL, row mapping, encryption decision.
- Add a numbered SQL migration in `server/migrations/`.
- Update CSV export helpers if the field is exported.
- Update `IntakeDetailModal.jsx`, `SharedIntake.jsx`, and analytics if the field is displayed or filtered.

Changing program/service metadata:
- Update `src/data/programs.json`.
- Keep `src/data/programs.js` as derived exports from the JSON.
- Check `server/programs.js`, `ServicesDirectory.jsx`, `SharedIntake.jsx`, `ProgramData.jsx`, and `SharedData.jsx` for assumptions about categories/access modes.
- If changing `ALL_TARGET_GROUPS`, `ALL_FUNCTIONS`, or `ALL_ACCESS_MODES`, verify filters in service directory and shared intake.
- If adding demo-provider programs, keep them under `DEMO_GP` and refresh mock data so program metrics exist.

Changing program metrics schema:
- Add a numbered SQL migration in `server/migrations/`.
- Update `server/scripts/seed.js`.
- Update `server/routes/programMetrics.js`.
- Update `server/routes/admin.js` and CSV serialization if exports change.
- Update `ProgramData.jsx`, `SharedData.jsx`, and `SharedIntake.jsx`.

Changing provider demo identity:
- Start in `src/data/demoProvider.js`.
- Check `ProviderLayout.jsx`, `TeamMembers.jsx`, `MyOrganisation.jsx`, and `ProgramData.jsx`.
- Keep Greener Pastures fictional and distinct from Nexus Human Services.

Changing CSV export:
- Update `src/utils/csvUtils.js`, `server/csvUtils.js`, `ProviderSettings.jsx`, and `server/routes/admin.js`.
- Do not reintroduce CSV import unless explicitly requested.

## Navigation/Search Hints

Fast orientation:

```powershell
rg --files
rg "useData|apiGet|apiPost|apiPatch" src server
rg "PROGRAMS|ALL_TARGET_GROUPS|ALL_FUNCTIONS|ALL_ACCESS_MODES" src server
rg "CREATE TABLE|ALTER TABLE|schema_migrations|program_metrics_age|intake_tags" server
rg "CSV_TYPES|member-shared|intake-queue|export-csv|refresh-mock-data" src server
rg "getTopMatchesWithScores|computeMatchScore|TARGET_MAP|SUPPORT_FN_MAP" src
rg "DEMO_PROVIDER|DEMO_GP|Greener Pastures|Nexus Human Services" src server
```

For local DB inspection without mutating:

```powershell
@'
const Database = require('better-sqlite3')
const db = new Database('server/data/mhcc.db', { readonly: true, fileMustExist: true })
for (const t of db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all()) {
  console.log(t.name, db.pragma(`table_info(${t.name})`).map(c => c.name))
}
db.close()
'@ | node -
```

Use `rg` before broad edits. The app has duplicated concepts across client, server, seed, schema, and CSV helpers; most meaningful changes need updates in more than one place.

## Final Agent Step

Before any pass completes, check whether the work made material changes that affect the accuracy of this file. If it did, update `AGENTS.md` in the same pass so future prompts can start by reading accurate instructions and end by keeping them accurate.
