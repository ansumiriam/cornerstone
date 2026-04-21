# Cornerstone

Cornerstone is a lightweight family construction tracker built as a dependency-free progressive web app. It is designed around a Google Sheets-friendly data model so the next step can be wiring these screens to Sheets-backed CRUD.

## Current scope

- Dashboard for project overview
- Expense tracking with `paid by` visibility
- Spend-by-material summary
- Task tracker
- Contact list with tags and a primary site contact
- Notes for later discussion
- Installable PWA with offline caching
- Shareable app link inside the app

## Local use

Open `index.html` in a browser, or serve the folder with any static file server for the best PWA behavior.

## Planned next step

Connect the screens to Google Sheets API for multi-user CRUD using the agreed tabs:

- `Users`
- `Expenses`
- `Tasks`
- `Contacts`
- `Notes`
- `Summary`
