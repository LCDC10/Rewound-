/**
 * Rewound corpus builder (v3).
 * Runs in GitHub Actions (or locally): node scripts/build-corpus.mjs
 * Requires env YOUTUBE_API_KEY.
 *
 * Modes (env BUILD_MODE):
 *   full     (default) — re-fetch every channel; weekly cron uses this,
 *              which keeps stored data <30 days old per YouTube policy.
 *   missing  — only fetch channels NOT yet in the corpus; existing ones
 *              are carried over untouched. Use for quickly adding
 *              channels without re-running everything.
 *
 * Channel resolution, in order:
 *   { "id": "UCxxxx" }      — pinned channel ID (never grabs the wrong channel)
 *   { "handle": "@name" }   — tries forHandle, then forUsername (legacy
 *                             usernames from the pre-handle era)
 *
 * Resilience: if a channel fails mid-run (API hiccup, quota, rename),
 * its data from the previous build is carried forward instead of
 * disappearing from the site.
 *
 * channels.json options:
 *   maxVideosPerChannel: 5000      // global cap on stored videos
 *   keep: "oldest"                 // global: "oldest" | "newest"
 *   hardFetchCeiling: 20000        // safety stop while paging
 *   channels: [
 *     { "handle": "@mkbhd" },
 *     { "handle": "@PewDiePie", "maxVideos": 6000 },
 *     { "handle": "@somenews", "keep": "newest" },
 *     { "id": "UCxxxxxxxxxxxxxxxxxxxxxx", "handle": "@labelOnly" }
 *   ]
 */
import fs from "node:fs";

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) { console.error("Missing YOUTUBE_API_KEY env var."); process.exit(1); }

const MODE = (process.env.BUILD_MODE || "full").toLowerCase() === "missing" ? "missing" : "full";

const cfg = JSON.parse(fs.readFileSync("channels.json", "utf8"));
const MAX_GLOBAL = cfg.maxVideosPerChannel || 2000;
const KEEP_GLOBAL = cfg.keep === "newest" ? "newest" : "oldest";
const CEILING = cfg.hardFetchCeiling || 20000;
const OUT = "data/corpus.js";

function entryKey(entry){
  if (entry.handle) return entry.handle.replace(/^@/, "").toLowerCase();
  return (entry.id || "").toLowerCase();
}

function readPrevCorpus() {
  try {
    const raw = fs.readFileSync(OUT, "utf8");
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    return JSON.parse(json);
  } catch { return { channels: [] }; }
}

async function yt(endpoint, params) {
  const u = new URL("https://www.googleapis.com/youtube/v3/" + endpoint);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set("key", KEY);
  const r = await fetch(u);
  if (!r.ok) throw new Error(`${endpoint} ${r.status}: ${await r.text()}`);
  return r.json();
}

const CH_PARTS = "snippet,contentDetails,statistics";

async function resolveChannel(entry){
  if (entry.id) {
    const r = await yt("channels", { part: CH_PARTS, id: entry.id, maxResults: 1 });
    return r.items?.[0] || null;
  }
  const raw = entry.handle.replace(/^@/, "");
  let r = await yt("channels", { part: CH_PARTS, forHandle: raw, maxResults: 1 });
  if (r.items?.length) return r.items[0];
  // legacy username fallback (channels from before @handles existed)
  r = await yt("channels", { part: CH_PARTS, forUsername: raw, maxResults: 1 });
  if (r.items?.length) { console.log(`  (resolved via legacy username)`); return r.items[0]; }
  return null;
}

async function fetchChannel(entry) {
  const label = entry.handle || entry.id;
  const max = entry.maxVideos || MAX_GLOBAL;
  const keep = entry.keep === "newest" ? "newest"
             : entry.keep === "oldest" ? "oldest"
             : KEEP_GLOBAL;

  const c = await resolveChannel(entry);
  if (!c) { console.warn(`  NOT FOUND: ${label} — check the handle on youtube.com (URL after /@), or pin with {"id":"UC..."}`); return null; }
  const uploadsId = c.contentDetails.relatedPlaylists.uploads;

  // Walk the ENTIRE uploads playlist (newest-first; the API has no
  // reverse order). Cheap: 1 unit per 50 videos.
  let ids = [], pageToken = "";
  while (ids.length < CEILING) {
    const pl = await yt("playlistItems", {
      part: "contentDetails", playlistId: uploadsId, maxResults: 50,
      ...(pageToken ? { pageToken } : {})
    });
    for (const it of pl.items) ids.push(it.contentDetails.videoId);
    pageToken = pl.nextPageToken;
    if (!pageToken) break;
  }
  const totalUploads = ids.length;

  // Keep the right slice BEFORE the expensive detail lookups.
  // List is newest-first, so the oldest N is the END of the array.
  if (ids.length > max) ids = keep === "oldest" ? ids.slice(-max) : ids.slice(0, max);

  // Per-video details in batches of 50 (kept videos only).
  const videos = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const vr = await yt("videos", { part: "snippet,statistics,status", id: batch.join(","), maxResults: 50 });
    for (const v of vr.items) {
      if (v.status.privacyStatus !== "public") continue;
      videos.push({
        id: v.id,
        title: v.snippet.title,
        date: v.snippet.publishedAt.slice(0, 10), // UTC date
        nowViews: Number(v.statistics?.viewCount || 0),
        embeddable: v.status.embeddable !== false,
        desc: (v.snippet.description || "").split("\n")[0].slice(0, 140)
      });
    }
  }
  videos.sort((a, b) => a.date < b.date ? -1 : 1);

  return {
    key: entryKey(entry),
    name: c.snippet.title,
    handle: entry.handle || c.snippet.customUrl || "",
    channelId: c.id,
    avatarUrl: c.snippet.thumbnails?.default?.url || "",
    real: true,
    keepMode: keep,
    totalUploads,
    subsNow: Number(c.statistics?.subscriberCount || 0),
    blurb: (c.snippet.description || "").split("\n")[0].slice(0, 120),
    videos
  };
}

function addTombstones(prev, fresh) {
  const prevCh = prev.channels?.find(p => p.channelId === fresh.channelId || p.key === fresh.key);
  if (!prevCh || !fresh.videos.length) return fresh;

  // Only declare a previously-seen video deleted if it falls INSIDE the
  // date window we just fetched. Videos outside the window (cap shifted,
  // keep-order changed) are out of scope — not gone.
  const minD = fresh.videos[0].date;
  const maxD = fresh.videos[fresh.videos.length - 1].date;
  const liveIds = new Set(fresh.videos.map(v => v.id));

  for (const old of prevCh.videos || []) {
    if (old.gone) {
      if (old.date >= minD && old.date <= maxD && !liveIds.has(old.id)) fresh.videos.push(old);
    } else if (old.id && !liveIds.has(old.id) && old.date >= minD && old.date <= maxD) {
      fresh.videos.push({ id: old.id, title: old.title, date: old.date, gone: true });
    }
  }
  fresh.videos.sort((a, b) => a.date < b.date ? -1 : 1);
  return fresh;
}

/* ============================ main ============================ */

console.log(`Build mode: ${MODE}`);
const prev = readPrevCorpus();
const prevByKey = new Map((prev.channels || []).map(c => [c.key, c]));
const kept = (prev.channels || []).filter(c => c.keep === true); // e.g. the classics collection

const built = [];
let fetched = 0, cached = 0, carried = 0, failed = 0;

for (const entry of cfg.channels) {
  const key = entryKey(entry);
  const prevCh = prevByKey.get(key);

  if (MODE === "missing" && prevCh) {
    built.push(prevCh); cached++;
    continue;
  }

  console.log("Fetching", entry.handle || entry.id, "...");
  try {
    let ch = await fetchChannel(entry);
    if (ch) {
      ch = addTombstones(prev, ch);
      built.push(ch); fetched++;
      console.log(`  kept ${ch.videos.length} of ${ch.totalUploads} uploads (${ch.keepMode} first)`);
    } else if (prevCh) {
      built.push(prevCh); carried++;
      console.log("  carried previous build's data forward");
    } else { failed++; }
  } catch (e) {
    console.error(`  FAILED ${entry.handle || entry.id}:`, e.message);
    if (prevCh) { built.push(prevCh); carried++; console.log("  carried previous build's data forward"); }
    else failed++;
  }
}

if (!built.length) { console.error("Nothing built; keeping existing corpus."); process.exit(1); }

const corpus = {
  meta: { builtAt: new Date().toISOString(), source: "youtube-data-api-v3", mode: MODE },
  channels: [...kept, ...built]
};
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(OUT, "window.CORPUS = " + JSON.stringify(corpus, null, 1) + ";\n");

const totalVideos = corpus.channels.reduce((n, c) => n + (c.videos?.length || 0), 0);
const bytes = fs.statSync(OUT).size;
console.log(`Wrote ${OUT}: ${corpus.channels.length} channels, ${totalVideos} videos, ${(bytes/1048576).toFixed(1)} MB.`);
console.log(`  fetched ${fetched} · cached ${cached} · carried-forward ${carried} · failed ${failed}`);
if (bytes > 8 * 1048576) console.warn("  ⚠ corpus.js is getting heavy — every visitor downloads it. Consider lowering maxVideosPerChannel or ask for per-channel lazy-loading.");
