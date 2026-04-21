# Cornerstone

Cornerstone is a Next.js PWA for family construction tracking, styled with Tailwind and shadcn-style UI primitives. The current version presents the agreed MVP modules and keeps the data model aligned to a future Google Sheets CRUD backend.

## Current scope

- Next.js app router foundation
- Tailwind + shadcn-style UI components
- Dashboard, expenses, tasks, contacts, notes, and users overview
- Material-wise totals and `paid by` expense visibility
- Shareable app link inside the app
- PWA manifest and service worker registration
- Google Sheets adapter with demo-data fallback
- CRUD API routes and form-driven UI for expenses, tasks, contacts, and notes

## Local use

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## Google Sheets setup

1. Copy `.env.example` to `.env.local`
2. Create a Google Cloud service account with Sheets API access
3. Share the target spreadsheet with the service account email
4. Fill in:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

If those values are missing, the app automatically falls back to the built-in demo dataset so local development still works.
In fallback mode, mutations are persisted to `data/demo-project-data.json`.

## Planned next step

Extend the Google Sheets integration from the current CRUD foundation into authentication, user management, and richer workflows using the agreed tabs:

- `Users`
- `Expenses`
- `Tasks`
- `Contacts`
- `Notes`
- `Summary`
