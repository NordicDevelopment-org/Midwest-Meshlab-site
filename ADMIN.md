# Midwest Mesh Lab — Admin Manual

Everything you need to run this site solo. The whole site is **one file** (`index.html`)
with all content in plain arrays at the bottom. Edit an array, save, push — done.

---

## 1) The 60-second mental model

- `index.html` — the entire site (HTML + CSS + JS in one file).
- Open it and scroll to the `<script>` near the bottom. The first two blocks are:
  - **`CONFIG`** — your links, email, handles, coordinates.
  - **`DATA`** — every list on the page (manuals, builds, tools, posts, signal, events, IG, map nodes).
- You almost never touch anything below the line that says *"WIRING (no need to edit below)."*

Supporting files (deploy as-is):
```
index.html                  the site
404.html                    custom not-found page
netlify.toml                deploy config: headers, CSP, redirects (single source of truth)
events.ics                  the calendar people subscribe to (keep in sync with EVENTS)
robots.txt
.well-known/security.txt    researcher contact (RFC 9116)
tools/build-map.js          regenerates the Minnesota map geometry
/manuals/  /builds/  /notes/  (you create) the pages the cards link to
/media/ig/                  (you create) square Instagram thumbnails
```

> **House rule: nothing fake.** Every list on this site ships empty rather than seeded with
> plausible-looking examples, and anything unwritten is tagged *In progress*. If you can't source
> a number, leave it out. That rule is the reason the site can be trusted at all.

---

## 2) First-launch checklist (edit `CONFIG`)

| Field | Set to |
|---|---|
| `instagram` / `instagramHandle` | already `@midwest_meshlab` |
| `youtube` / `youtubeLive` | your channel + live URLs |
| `buyMeACoffee` | your Buy Me a Coffee URL (not set up yet — deliberately left alone) |
| `previewMode` | `true` while building out; `false` at launch (hides all *In progress* tags) |
| `githubDiscussions` | already points at this repo's Discussions — enable them in repo Settings |
| `giscus` | repo IDs from giscus.app once you enable Discussions (see §7) |

**Video slots.** A YouTube *channel homepage cannot be embedded* — the player only accepts a video or
a playlist ID, and channel pages refuse framing. So "feature this channel" is implemented as that
channel's uploads playlist. Each slot takes either:

- `data-playlist-id="UU…"` — a channel's uploads playlist (auto-updates, no maintenance), or
- `data-video-id="…"` — one specific video.

Currently: Constellation Response's *Getting Started with Meshtastic* playlist, S2 Underground's
uploads, and an Atlavox video on private channels. Nothing is requested from YouTube until a click.

---

## 3) Editing content (the part you'll do weekly)

Each list is an array of objects. Copy a line, change the text, save. Examples:

**Add a manual** — find `const MANUALS = [` and add:
```js
{ hx:"0x7A", title:"Your guide title", desc:"One-line summary.", url:"/manuals/your-guide.html", tags:["Tag1","Tag2"] },
```

**Add a build** — `const BUILDS_REF = [`:
```js
{ ct:"Relay", title:"Name", desc:"What it is.", url:"/builds/name.html", parts:12, cost:"$70", time:"2h" },
{ ct:"Relay", title:"Planned one", desc:"What it will be.", url:"/builds/name.html", wip:true },
```
`parts` / `cost` / `time` are **optional** — only fill them in once the build page exists and has a real
bill of materials. A planned build shows "BOM & costs once it's built" instead of invented numbers.

**Add a blog post** — `const POSTS = [`:
```js
{ date:"2026-07-01", title:"Post title", excerpt:"Teaser sentence.", url:"/notes/post-slug.html" },
```
`date` is optional; omit it on an unwritten post (it then reads "Not yet published" rather than
claiming a publication date that never happened).

**Add a community build to the wall** — `const BUILDS = [`. This array is empty and should only ever
contain builds real people actually sent in:
```js
{ id:"0xABCD", title:"Name", type:"relay", hw:"board · power · antenna", loc:"City, ST", by:"@handle", img:null },
```
`type` must be one of: `relay`, `gateway`, `handheld`, `sensor` (those are the filter buttons).
Set `img` to `"/media/builds/name.jpg"` once you have a photo, or leave `null` for the glyph.

**Signal / Tech-talk** → `SIGNAL` array. Every entry needs a `src:` URL — the card renders a
"source →" link, and a claim you can't source doesn't belong there. **Ticker line** → `TICKER`
(short, checkable statements only). **Toolkit** → `TOOLS`. **Instagram tiles** → `IG_POSTS`
(set `img` to a file in `/media/ig/`).

> The card links point to pages you host (`/manuals/...`, `/builds/...`, `/notes/...`). Write those as
> simple Markdown→HTML or plain HTML pages and drop them in the matching folder.

### Preview build: "In progress" tags

While you're still filling the site in, **`CONFIG.previewMode: true`** shows an amber **In progress**
tag on every unfinished item and a small legend in the bottom-left corner (with a live count). It marks:

- any `MANUALS` / `BUILDS_REF` / `POSTS` entry flagged **`wip: true`** (use this for cards whose page you
  haven't written yet — the three that ship with real pages are already un-flagged),
- any Broadcast slot still set to `SET_PLAYLIST_ID` / `SET_VIDEO_ID`,
- the discussion board until `CONFIG.giscus` is filled in, and the Discord card until `mspMeshDiscord`
  points at a real invite (not `mspmesh.org`).

Unwritten pages are also listed in `404.html`, so a visitor who follows one of those links is told the
guide is planned rather than hitting a bare "not found". Remove the entry there as you publish each one.

When a page goes live, delete that entry's `wip: true`. When the whole site is ready, set
**`previewMode: false`** — every tag and the legend vanish, and nothing else about the site changes.

---

## 4) The Minnesota map

The map is **real geography**, generated rather than drawn by hand.

**How it's built.** `tools/build-map.js` reads `tools/minnesota.geojson` (public-domain boundary data,
867 points) and projects it through an **Albers Equal Area Conic** projection — standard parallels
44.48°N / 48.40°N, central meridian 93.364°W. It simplifies the ring to ~270 points and prints an SVG
path. The viewBox (`0 0 520 593`) matches the **true projected aspect ratio**, so the state is not
stretched in either direction.

```bash
node tools/build-map.js     # prints the path + city coords, writes tools/mn-out.json
```

Then paste the new path into the `<path id="mn-state">` in `index.html`. **Don't hand-edit that path** —
regenerate it. If you change the projection constants, change them in *both* `tools/build-map.js` and the
matching block in the map renderer in `index.html`, or markers will drift off the outline.

**Cities** (`MN_CITIES`) are real lat/lon run through that same projection, which is why they land
correctly. They are geographic reference points, **not mesh nodes** — the legend says so. Set `la:'w'`
on an entry to flip its label to the left when it collides with a neighbour.

**Nodes** (`MN_NODES`) ship **empty on purpose**. Add real nodes with real coordinates and the map draws
them, projecting each by lat/lon:

```js
const MN_NODES = [
  { id:"!a1b2c3d4", name:"Rooftop relay", lat:44.9778, lon:-93.2650, hub:true },
];
const MN_LINKS = [[0,1]];   // pairs of MN_NODES indexes, for heard links
```

With the array empty the map renders geography and prints "No live node data connected." Never seed it
with invented nodes — that was the whole problem with the original build.

**Want genuinely live data?** Two honest routes:
- Link out. The "Live maps" card already points at meshmap.net, map.meshtastic.org and mspmesh.org/map.
- Feed it yourself. Put your own nodes in a **Supabase** table and fetch them into `MN_NODES` on load
  (see §11). Don't scrape someone else's map server.

---

## 5) Forms and contact (Netlify Forms)

**There is no mail server, and no published email address.** A live DNS check showed
`midwestmeshlab.net` has **no MX records** — mail to `contact@midwestmeshlab.net` bounced. Rather than
publish an address that doesn't work, both forms now post to **Netlify Forms**.

- Both `#contactForm` and `#subscribeForm` carry `data-netlify="true"`, a hidden `form-name` input
  matching the form's `name`, and a `bot-field` honeypot. Submissions land in the Netlify dashboard
  under **Forms**; both redirect to `/thanks.html`.
- The free tier allows **100 submissions/month**.
- `.well-known/security.txt` now uses an https `Contact:` URL (RFC 9116 permits this) pointing at the
  contact form, so the security contact actually reaches you.

> **Do not set `skip_processing = true` in `netlify.toml`.** Netlify detects forms during
> postprocessing; skipping it means the forms silently never register. The file instead leaves
> processing on and disables each individual transform, which keeps the markup untouched.

**Calendar (zero PII):** the "Subscribe to ops calendar" button hands people a `webcal://…/events.ics`
link; their device syncs it and fires reminders. Keep `events.ics` in sync with `EVENTS` — **both ship
empty**, and the buttons disable themselves while there are no events.

**If you later want real email**, add MX records at your DNS host and point `security.txt` back at a
mailbox. Until those records exist, do not publish an address anywhere.

---

## 6) Troubleshooting tool

`troubleshoot.html` is a guided diagnostic. Its architecture matters if you edit it:

- **Every fix is real HTML in the page**, in a `<article class="fix" id="fix-…">`. The wizard at the
  top is only a *navigation layer* that reveals the matching card.
- So the page works fully **without JavaScript**, and every fix is deep-linkable
  (`/troubleshoot.html#fix-no-region`).
- The question tree lives in the `STEPS` object in the page's script. Each option either points to
  another step (`next`) or resolves to a card (`fix`).

**House rule: no fix ships without a source link.** Each card ends in a Sources block pointing at the
Meshtastic docs or a real tracker issue. If you cannot source a cause, it does not go on the page.
Update the "Sources checked" date when you revise it.

## 7) Community discussion (GitHub Discussions via giscus)

Free, no database, you moderate from GitHub:
1. Make the repo (see §8) **public**, then enable **Discussions** in repo Settings.
2. Install the **giscus** GitHub App on the repo: <https://github.com/apps/giscus>.
3. Go to <https://giscus.app>, enter the repo, pick a category, and copy the generated
   `repo`, `repoId`, `category`, `categoryId`.
4. Paste them into `CONFIG.giscus`. The "Load discussion" button on the site now loads the thread.
   (giscus is loaded **only on click**, and its origin is already allow-listed in `netlify.toml`.)

---

## 8) Deploying (GitHub + Netlify)

The repo root **is** the web root. There's no build step and no framework.

**Connect it (deploys on every push)**
1. Push to GitHub.
2. Netlify → **Add new site → Import an existing project** → pick the repo.
3. Build command: **leave empty**. Publish directory: **`.`** — both are already declared in
   `netlify.toml`, so you can just accept what it detects.
4. **Domains → Add a custom domain** → `midwestmeshlab.net`, and point DNS at Netlify. HTTPS is
   provisioned automatically (Let's Encrypt).
5. From then on: edit `index.html`, commit, push → live in well under a minute.

**`netlify.toml` is the single source of truth** for headers, CSP and redirects. There is deliberately
no `_headers` file — Netlify reads both, and two files that say overlapping things will drift apart.
Edit the toml.

Deploy previews come free: every pull request gets its own URL, which is a good place to check a
change before it hits the live domain.

## 9) Hardening checklist (10 minutes, once)

- **HTTPS**: Netlify provisions certs automatically. Turn on **Force HTTPS** in Domain settings.
- **HSTS** is already sent by `netlify.toml` (2 years, includeSubDomains, preload). Submit to
  <https://hstspreload.org> only once you're sure every subdomain is HTTPS — preload is hard to undo.
- **DNSSEC** at your registrar / DNS host.
- **2FA** on your Netlify *and* GitHub accounts. For a static site the accounts are the real attack
  surface, not the HTML.
- **Build settings**: keep "skip processing" on (already set) so Netlify doesn't rewrite your markup.
- After deploy, scan at <https://securityheaders.com> and <https://developer.mozilla.org/en-US/observatory>
  (aim for A/A+), and check DevTools for zero CSP errors.
- Re-check `/.well-known/security.txt` yearly — it has an `Expires` date and goes stale.

## 10) Going fully strict later (optional)

When you want the no-`unsafe-inline` CSP the security crowd loves:
1. Move the `<style>` block to `styles.css` and the `<script>` block to `app.js`.
2. Reference them with `<link rel="stylesheet" href="styles.css">` and `<script src="app.js" defer>`.
3. In `netlify.toml`, change `script-src` to `'self' https://giscus.app` and `style-src` to
   `'self' https://fonts.googleapis.com` (drop both `'unsafe-inline'`).
4. Self-host the four fonts to also drop the Google origins. Then the only external calls are the weather
   API and (on click) YouTube/giscus.

That's the trade-off: one easy-to-edit file now, or a stricter multi-file setup later. Both are supported.

---

## 11) Live data with Supabase (optional)

The site is static, but a static page can still `fetch()` public data. Supabase is a good fit for the
two lists that should eventually be live: **map nodes** and the **community build wall**.

**Ground rules**
- Only ever ship the **publishable (anon) key** — never the service-role key. A key in `index.html` is
  world-readable, so treat it as public.
- Turn on **Row Level Security** and add a read-only policy. Without RLS, an anon key is a data leak.
- Add your project origin to `connect-src` in `netlify.toml`, or the browser will block the request:
  `connect-src 'self' https://api.open-meteo.com https://YOUR-PROJECT.supabase.co`

**Table**
```sql
create table public.nodes (
  id          text primary key,          -- e.g. '!a1b2c3d4'
  name        text not null,
  lat         double precision not null,
  lon         double precision not null,
  hub         boolean not null default false,
  updated_at  timestamptz not null default now()
);
alter table public.nodes enable row level security;
create policy "public read" on public.nodes for select to anon using (true);
```

**Wiring it into the map.** The renderer already projects by lat/lon, so you only need to fill
`MN_NODES` before it runs. Replace `const MN_NODES = [];` with a fetch, and re-run the map draw:

```js
fetch('https://YOUR-PROJECT.supabase.co/rest/v1/nodes?select=*', {
  headers: { apikey: PUBLISHABLE_KEY, Authorization: 'Bearer ' + PUBLISHABLE_KEY }
})
  .then(r => r.ok ? r.json() : Promise.reject(r.status))
  .then(rows => { MN_NODES.push(...rows); drawMap(); })
  .catch(() => { /* leave the honest empty state in place */ });
```

Keep that `.catch()`. If the fetch fails the map must fall back to "No live node data connected"
rather than showing something stale or made up — same house rule as everywhere else.

**Accepting build submissions.** The contact form currently opens the visitor's mail client. If you'd
rather collect submissions directly, either use **Netlify Forms** (zero backend, submissions land in the
Netlify UI) or insert into a Supabase table behind RLS — and moderate before anything appears on the
wall.
