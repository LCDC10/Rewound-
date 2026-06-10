# ⏪ Rewound

Subscribe to a channel like it's day one. Time moves forward one real day at a time — your feed only knows what existed *then*.

Not affiliated with YouTube. Videos play through YouTube's official embedded player; nothing is rehosted.

## How it works

- **Calendar mode**: when you start a timeline, Rewound stores an anchor (`channels + sim start date + real start date`) in your browser. Your simulated date = sim start + days elapsed in real life. Skip a day, you skip a day there too — a catch-up banner shows what you missed.
- **Corpus**: a static `data/corpus.js` file holds each channel's upload history. A weekly GitHub Action rebuilds it from the YouTube Data API (which also satisfies YouTube's 30-day stored-data refresh policy). Visitors never hit the API and never see your key.
- **Lost videos**: uploads that have been deleted since the last build become tombstones — gray "no longer available" entries. That's authentic: much of early YouTube is gone.
- **Community comments (optional)**: travelers leave notes stamped with their *simulated* date, and you only see comments from at or before your own day. Someone who passed through October 2010 last year left words you'll find when you arrive. Spoiler-proof by construction — fast-forwarding just changes which notes you can see.
- **View counts** are estimates back-simulated for the date, and labeled as such. Subscriber counts likewise.

## Deploy (about 15 minutes)

1. **Create a GitHub repo** with these files and push (index.html at the repo root).
2. **Enable GitHub Pages**: repo → Settings → Pages → Source: *Deploy from a branch* → `main` / root. Your site appears at `https://<user>.github.io/<repo>/`. It already works at this point, using the bundled seed data.
3. **Get a free YouTube API key**: [console.cloud.google.com](https://console.cloud.google.com) → create project → *Library* → enable **YouTube Data API v3** → Credentials → API key (restrict it to the YouTube Data API).
4. **Add the key as a secret**: repo → Settings → Secrets and variables → Actions → New repository secret → name `YOUTUBE_API_KEY`.
5. **Pick your channels**: edit `channels.json` (YouTube handles, e.g. `@penguinz0`).
6. **Run the workflow**: repo → Actions → *Refresh corpus* → Run workflow. Sample channels are replaced with real data; the `classics` collection is kept. Re-runs weekly by itself.

### Enable community comments (optional, free, ~10 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. SQL Editor → New query → paste the whole of `supabase/schema.sql` → **Run**.
3. Authentication → Sign In / Providers → enable **Anonymous sign-ins**.
4. Project Settings → API → copy the **Project URL** and **anon public** key.
5. Paste both into the `REWOUND_CONFIG` block near the top of `index.html` and push. (The anon key is designed to be public — safe to commit.)

Moderation: comments auto-hide after 3 reports. You can hide/restore/delete anything in Supabase's Table Editor (`comments` table, `hidden` column). Rate limit: 5 comments per user per 5 minutes, enforced server-side.

### Local preview

Just open `index.html` in a browser. No build step, no server. (Comments require the site to be served over http(s) — they stay off on `file://`.)

## Quota math (free tier: 10,000 units/day)

Fetching one channel ≈ 1 unit (lookup) + 1 unit per 50 videos (list) + 1 unit per 50 videos (details). A 1,000-video channel ≈ 41 units. A weekly rebuild of 20 deep channels stays under 2% of one day's quota.

## Compliance notes

- Official embedded player only; no downloads or rehosting.
- Stored API data is fully rebuilt weekly (< 30 days, per [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies)).
- Tombstones for deleted videos retain only id, title, and date.
- Simulated metrics are always labeled "est." and never presented as YouTube's data.
- Community comments are user-generated content on *your* deployment — you are the moderator.
- Branding is distinct from YouTube; keep it that way if you restyle.

## Roadmap ideas

- **Groups / events**: a shared save link already syncs people to the same timeline (calendar mode is pure date arithmetic). Next step: named events with a locked pace (no fast-forward) vs. free pace (fast-forward forks you).
- **Day pages**: reconstruct "what was on the homepage" for any date from Wayback Machine snapshots of youtube.com.
- **Real era comments**: show actual YouTube comments posted before the simulated date (API exposes timestamps; cache aggressively).
- **On-demand channels**: a tiny Cloudflare Worker proxy would let visitors paste any channel handle without exposing your key.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (no build step) |
| `data/corpus.js` | Channel/video data (seed now, API-built later) |
| `channels.json` | Which channels the builder ingests |
| `scripts/build-corpus.mjs` | Corpus builder (runs in Actions) |
| `.github/workflows/refresh-corpus.yml` | Weekly rebuild + manual trigger |
| `supabase/schema.sql` | Optional comments backend (tables, policies, moderation) |
