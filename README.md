# ⏪ Rewound

Subscribe to a channel like it's day one. Time moves forward one real day at a time — your feed only knows what existed *then*.

Not affiliated with YouTube. Videos play through YouTube's official embedded player; nothing is rehosted.

## How it works

- **Calendar mode**: when you start a timeline, Rewound stores an anchor (`channels + sim start date + real start date`) in your browser. Your simulated date = sim start + days elapsed in real life. Skip a day, you skip a day there too — a catch-up banner shows what you missed.
- **Corpus**: a static `data/corpus.js` file holds each channel's upload history. A weekly GitHub Action rebuilds it from the YouTube Data API (which also satisfies YouTube's 30-day stored-data refresh policy). Visitors never hit the API and never see your key.
- **Lost videos**: uploads that have been deleted since the last build become tombstones — gray "no longer available" entries. That's authentic: much of early YouTube is gone.
- **View counts** are estimates back-simulated for the date, and labeled as such. Subscriber counts likewise.

## Deploy (about 15 minutes)

1. **Create a GitHub repo** with these files and push.
2. **Enable GitHub Pages**: repo → Settings → Pages → Source: *Deploy from a branch* → `main` / root. Your site appears at `https://<user>.github.io/<repo>/`. It already works at this point, using the bundled seed data (sample channels + real classics).
3. **Get a free YouTube API key**: [console.cloud.google.com](https://console.cloud.google.com) → create project → *Enable APIs* → **YouTube Data API v3** → Credentials → API key.
4. **Add the key as a secret**: repo → Settings → Secrets and variables → Actions → New repository secret → name `YOUTUBE_API_KEY`.
5. **Pick your channels**: edit `channels.json` (YouTube handles, e.g. `@penguinz0`).
6. **Run the workflow**: repo → Actions → *Refresh corpus* → Run workflow. It fetches real upload histories and commits `data/corpus.js`. Sample channels are replaced; the `classics` collection is kept. From then on it re-runs weekly by itself.

### Local preview

Just open `index.html` in a browser. No build step, no server.

## Quota math (free tier: 10,000 units/day)

Fetching one channel ≈ 1 unit (lookup) + 1 unit per 50 videos (list) + 1 unit per 50 videos (details). A 1,000-video channel ≈ 41 units. The weekly rebuild of 20 channels with deep catalogs stays well under 2% of one day's free quota.

## Compliance notes

- Official embedded player only; no downloads or rehosting.
- Stored API data is fully rebuilt weekly (< 30 days, per [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies)).
- Tombstones for deleted videos retain only id, title, and date.
- Simulated metrics are always labeled "est." and never presented as YouTube's data.
- Branding is distinct from YouTube; keep it that way if you restyle.

## Roadmap ideas

- **Day pages**: reconstruct "what was on the homepage" for any date from Wayback Machine snapshots of youtube.com (free, no key) — parsed once per date, committed as static JSON.
- **Real era comments**: the API exposes comment timestamps; show only comments posted before the simulated date (cache aggressively; mega-viral videos have millions).
- **Accounts**: sync timelines across devices with a free Supabase/Firebase tier. Until then, the "Copy save link" button is the cross-device save file.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (no build step) |
| `data/corpus.js` | Channel/video data (seed now, API-built later) |
| `channels.json` | Which channels the builder ingests |
| `scripts/build-corpus.mjs` | Corpus builder (runs in Actions) |
| `.github/workflows/refresh-corpus.yml` | Weekly rebuild + manual trigger |
