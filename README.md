# MHCC CarePath

MHCC CarePath is a prototype mental health service intake and provider portal for the Mental Health Community Coalition of the ACT.

## Local Development

The app runs locally with a Vite React client, an Express API server, and a local SQLite database.

```powershell
npm.cmd install
npm.cmd run seed
npm.cmd run dev:all
```

Client: `http://localhost:5173`

API: `http://localhost:3001`

Health check:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

The database file lives at `server/data/mhcc.db` and is ignored by git. `npm.cmd run seed` inserts sample intakes, intake volume weeks, and program metrics when tables are empty.

To reseed program metrics:

```powershell
npm.cmd run seed -- --force
```

## Scripts

```powershell
npm.cmd run dev          # Vite client only
npm.cmd run dev:server   # Express API only
npm.cmd run dev:all      # API and client together
npm.cmd run seed         # Seed local SQLite data
npm.cmd run build:client # Build React client into dist/
npm.cmd start            # Start Express server
```

## Deployment

The current app requires a Node-capable host because it serves both the Express API and the built client. The active workflow is `.github/workflows/azure-webapps-deploy.yml` for Azure Web App deployment.

Azure Static Web Apps is not suitable for the current Express + SQLite architecture.
