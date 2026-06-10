/**
 * Rewound corpus builder.
 * Runs in GitHub Actions (or locally): node scripts/build-corpus.mjs
 * Requires env YOUTUBE_API_KEY.
 *
 * - Resolves each handle in channels.json (channels.list, 1 unit)
 * - Pulls full upload history (playlistItems, 1 unit / 50 videos)
 * - Fetches per-video status + stats (videos.list, 1 unit / 50 videos)
 * - Marks videos that disappeared since the last build as gone (tombstones)
 * - Full rebuild every run => complies with YouTube's 30-day stored-data policy
 */
import fs from "node:fs";

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) { console.error("Missing YOUTUBE_API_KEY env var."); process.exit(1); }

const cfg = JSON.parse(fs.readFileSync("channels.json", "utf8"));
const MAX = cfg.maxVideosPerChannel || 2000;
const OUT = "data/corpus.js";

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

async function fetchChannel(handle) {
  const ch = await yt("channels", {
    part: "snippet,contentDetails,statistics",
    forHandle: handle.replace(/^@/, ""),
    maxResults: 1
  });
  if (!ch.items?.length) { console.warn(`Handle not found: ${handle}`); return null; }
  const c = ch.items[0];
  const uploadsId = c.contentDetails.relatedPlaylists.uploads;

  // full upload list (ids + publish dates)
  let ids = [], pageToken = "";
  while (ids.length < MAX) {
    const pl = await yt("playlistItems", {
      part: "contentDetails", playlistId: uploadsId, maxResults: 50,
      ...(pageToken ? { pageToken } : {})
    });
    for (const it of pl.items) ids.push(it.contentDetails.videoId);
    pageToken = pl.nextPageToken;
    if (!pageToken) break;
  }
  ids = ids.slice(0, MAX);

  // per-video details in batches of 50
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
    key: handle.replace(/^@/, "").toLowerCase(),
    name: c.snippet.title,
    handle,
    channelId: c.id,
    avatarUrl: c.snippet.thumbnails?.default?.url || "",
    real: true,
    subsNow: Number(c.statistics?.subscriberCount || 0),
    blurb: (c.snippet.description || "").split("\n")[0].slice(0, 120),
    videos
  };
}

function addTombstones(prev, fresh) {
  const prevCh = prev.channels?.find(p => p.channelId === fresh.channelId || p.key === fresh.key);
  if (!prevCh) return fresh;
  const liveIds = new Set(fresh.videos.map(v => v.id));
  for (const old of prevCh.videos || []) {
    if (!old.gone && old.id && !liveIds.has(old.id)) {
      // keep only id/title/date — data minimization for removed content
      fresh.videos.push({ id: old.id, title: old.title, date: old.date, gone: true });
    } else if (old.gone) {
      fresh.videos.push(old); // carry existing tombstones forward
    }
  }
  fresh.videos.sort((a, b) => a.date < b.date ? -1 : 1);
  return fresh;
}

const prev = readPrevCorpus();
const kept = (prev.channels || []).filter(c => c.keep); // e.g. the classics collection
const built = [];
for (const { handle } of cfg.channels) {
  console.log("Fetching", handle, "...");
  try {
    let ch = await fetchChannel(handle);
    if (ch) { ch = addTombstones(prev, ch); built.push(ch); console.log(`  ${ch.videos.length} videos`); }
  } catch (e) { console.error(`  FAILED ${handle}:`, e.message); }
}

if (!built.length) { console.error("Nothing built; keeping existing corpus."); process.exit(1); }

const corpus = {
  meta: { builtAt: new Date().toISOString(), source: "youtube-data-api-v3" },
  channels: [...kept, ...built]
};
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(OUT, "window.CORPUS = " + JSON.stringify(corpus, null, 1) + ";\n");
console.log(`Wrote ${OUT}: ${corpus.channels.length} channels.`);
