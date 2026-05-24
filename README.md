# Office / WFH Recorder

A simple monthly calendar for tracking Office, WFH, and a few work-day labels.

## Run Locally

```bash
npm run dev
```

The app runs at `http://127.0.0.1:4173` by default.

You can also run the local server directly:

```bash
node server.js
```

## Deploy on Vercel

Deploy the project root as a static site. No build command or output directory is required because the app is fully contained in `index.html`. If your Vercel project has old settings, clear the Build Command and Output Directory values before redeploying.

## Data Storage

Selections are saved in the browser using IndexedDB. This keeps the app simple for single-user personal tracking and works well with static hosting on Vercel.

Data is stored per browser/device. Clearing site data for the deployed app will clear the saved records.

## Labels

Office is the default for any day that is not marked as WFH. WFH fills the day in yellow. Second-Shift, Comp-Off, and Expensify-Logged can be combined on the same day and appear as colored stars.
