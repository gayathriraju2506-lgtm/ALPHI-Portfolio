# Mutual Fund Portfolio Calculator

A lightweight web app that fetches latest AMFI NAV data and calculates the portfolio value for selected mutual funds.

## Features
- Live NAV fetching from AMFI feed
- Fund selector with instant portfolio value calculation
- Input validation and user-friendly error states
- Ready for one-click deployment on Railway

## Data Source
- AMFI NAV feed: https://www.amfiindia.com/spages/NAVAll.txt
- Fetched through the app backend (`/api/nav`) to avoid browser CORS issues and proxy outages

## Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start server:
   ```bash
   npm start
   ```
3. Open http://localhost:3000

## Deploy on Railway
1. Push this repository to GitHub.
2. In Railway, create a **New Project** and select **Deploy from GitHub Repo**.
3. Choose this repository.
4. Railway will auto-detect Node.js and run:
   - `npm install`
   - `npm start`
5. Once deployed, open the generated Railway domain.

The app binds to `process.env.PORT`, so it works with Railway's runtime requirements.

If the upstream AMFI feed is temporarily unavailable, the app now serves bundled sample NAV data so the UI remains functional.
