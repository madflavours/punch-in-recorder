# Office / WFH Recorder

A simple monthly calendar for marking work days as either Office or WFH.

## Run Locally

```bash
npm run dev
```

The app runs at `http://127.0.0.1:4173` by default.

## Data Storage

Selections are saved in the browser using IndexedDB. This keeps the app simple for single-user personal tracking and works well with static hosting on Vercel.

Data is stored per browser/device. Clearing site data for the deployed app will clear the saved records.
