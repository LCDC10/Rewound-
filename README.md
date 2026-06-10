# ⏪ Rewound

Subscribe to a channel like it's day one. Time moves forward one real day at a time — your feed only knows what existed *then*.

Not affiliated with YouTube. Videos play through YouTube's official embedded player; nothing is rehosted.

## How it works

- **Calendar mode**: when you start a timeline, Rewound stores an anchor (`channels + sim start date + real start date`) in your browser. Your simulated date = sim start + days elapsed in real life. Skip a day, you skip a day there too — a catch-up banner shows what you missed.
- **Corpus**: a static `data/corpus.js` file holds each channel's upload history. A weekly GitHub Action rebuilds it from the YouTube Data API (which also satisfies YouTube's 30-day stored-data refresh policy). Visitors never hit the API and never see your key. The builder keeps each channel's **oldest** videos when over the cap — the right bias for a time machine.
- **Lost videos**: uploads that have been deleted since the last build become tombstones — gray "no longer available" entries. That's authentic: much of early YouTube is gone.
- **Community comments (optional)**: travelers leave notes stamped with their *simulated* date, and you only see comments from at or before your own day. Spoiler-proof by construction.
- **Group events (optional)**: shared timelines joined via `#g=code` links. Members stay in lockstep through pure date arithmetic. **Locked pace** disables fast-forward; **free pace** allows it but forks you. Late joiners enter *in step* with the group.
- **View counts** are estimates back-simulated for the date, and labeled as such. Subscriber counts likewise.

## Deploy (about 15 minutes)

1. **Create a GitHub repo** with these files and push (index.html at the repo root).
2. **Enable GitHub Pages**: repo → Settings → Pages → Source: *Deploy from a branch* → `main` / root.
3. **Get a free YouTube API key**: [console.cloud.google.com](https://console.cloud.google.com) → create project → *Library* → enable **YouTube Data API v3** → Credentials → API key (restrict it to the YouTube Data API).
4. **Add the key as a secret**: repo → Settings → Secrets and variables → Actions → `YOUTUBE_API_KEY`.
5. **Pick your channels**: edit `channels.json`.
6. **Run the workflow**: repo → Actions → *Refresh corpus* → Run workflow.

### Managing channels

`channels.json` entry options:

```json
{ "handle": "@mkbhd" }
{ "handle": "@PewDiePie", "maxVideos": 6000 }
{ "handle": "@somenews", "keep": "newest" }
{ "id": "UCxxxxxxxxxxxxxxxxxxxxxx", "handle": "@labelOnly" }
```

- **Adding channels without rebuilding everything**: Actions → *Refresh corpus* → Run workflow → mode **`missing`**. Only channels not yet in the corpus are fetched; everything else is carried over. The weekly cron still does a full rebuild (data freshness + tombstone detection).
- **"Handle not found"**: many older channels use *legacy usernames* that differ from their current @handle. The builder automatically falls back to username lookup, which fixes most. Still failing? Open the channel on youtube.com and copy the handle from the URL (the part after `/@`).
- **Wrong channel / squatted handle** (e.g. a one-video channel where a famous one should be): pin it by channel ID — on the channel's page: ⋯ → Share channel → Copy channel ID — and use `{ "id": "UC..." }`.
- **If a channel fails mid-run**, its data from the previous build is carried forward instead of disappearing from the site.

**Page weight**: every visitor downloads `data/corpus.js`. Roughly 160 bytes per video — 50,000 videos ≈ 8 MB. The build log prints the size and warns past 8 MB. Levers: lower `maxVideosPerChannel`, or ask for per-channel lazy-loading (roadmap).

### Enable community comments (optional, free, ~10 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. SQL Editor → New query → paste the whole of `supabase/schema.sql` → **Run**.
3. Authentication → Sign In / Providers → enable **Anonymous sign-ins**.
4. Settings → Data API → copy the **Project URL** (bare domain — no `/rest/v1`). Settings → API Keys → copy the **publishable** key using the copy button.
5. Paste both into the `REWOUND_CONFIG` block near the top of `index.html` and push.

Moderation: comments auto-hide after 3 reports; manage in Table Editor (`comments.hidden`). Rate limit: 5 comments / 5 minutes, server-side.

### Enable group events (optional, needs comments enabled first)

SQL Editor → paste `supabase/groups.sql` → **Run** (once). The setup screen then shows "make it a group event". Rate limit: 3 events per user per hour.

### Local preview

Open `index.html` in a browser. No build step. (Comments/events need http(s) — they stay off on `file://`.)

## Quota math (free tier: 10,000 units/day)

Walking a channel's full upload list costs 1 unit per 50 videos; details cost 1 unit per 50 *kept* videos. Even ~75 channels with deep catalogs costs a few thousand units — under half a day's free quota, weekly.

## Compliance notes

- Official embedded player only; no downloads or rehosting.
- Stored API data is fully rebuilt weekly (< 30 days, per [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies)); `missing` mode is for quick additions in between.
- Tombstones retain only id, title, date — and only within the fetched date window.
- Simulated metrics are always labeled "est." and never presented as YouTube's data.
- Comments and events are user-generated content on *your* deployment — you are the moderator.
- Branding is distinct from YouTube; keep it that way if you restyle.

## Roadmap ideas

- **Per-channel corpus files**: split `corpus.js` and lazy-load only subscribed channels (page weight at scale).
- **Day pages**: reconstruct "what was on the homepage" for any date from Wayback Machine snapshots of youtube.com.
- **Real era comments**: show actual YouTube comments posted before the simulated date.
- **On-demand channels**: a tiny Cloudflare Worker proxy so visitors can paste any handle without exposing your key.
- **Group walls**: a per-event feed of members' recent comments.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (no build step) |
| `data/corpus.js` | Channel/video data (seed now, API-built later) |
| `channels.json` | Which channels the builder ingests + options |
| `scripts/build-corpus.mjs` | Corpus builder (runs in Actions) |
| `.github/workflows/refresh-corpus.yml` | Weekly full rebuild + manual full/missing trigger |
| `supabase/schema.sql` | Comments backend (tables, policies, moderation) |
| `supabase/groups.sql` | Group events backend (additive upgrade) |
