# Cornerstone

Cornerstone is a Next.js PWA for family construction tracking, styled with Tailwind and shadcn-style UI primitives. The current version presents the agreed MVP modules and keeps the data model aligned to a future Google Sheets CRUD backend.

## Current scope

- Next.js app router foundation
- Tailwind + shadcn-style UI components
- Dashboard, expenses, tasks, contacts, notes, and users overview
- Material-wise totals and `paid by` expense visibility
- Shareable app link inside the app
- PWA manifest and service worker registration

## Local use

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## Planned next step

Wire the screens to Google Sheets API for multi-user CRUD using the agreed tabs:

- `Users`
- `Expenses`
- `Tasks`
- `Contacts`
- `Notes`
- `Summary`
