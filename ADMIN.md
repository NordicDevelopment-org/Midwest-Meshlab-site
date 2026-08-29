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
| `email` | `contact@midwestmeshlab.net` (forward to your Proton inbox — see §6) |
| `instagram` / `instagramHandle` | already `@midwest_meshlab` |
| `youtube` / `youtubeLive` | your channel + live URLs |
| `buyMeACoffee` | your Buy Me a Coffee URL |
| `newsletterAction` | your email provider's subscribe endpoint (see §5) |
| `previewMode` | `true` while building out; `false` at launch (hides all *In progress* tags) |
| `mspMeshDiscord` | MSP Mesh's real **never-expiring** Discord invite (until then it points at mspmesh.org) |
| `githubDiscussions` | already points at this repo's Discussions — enable them in repo Settings |
| `giscus` | repo IDs from giscus.app once you enable Discussions (see §7) |

Then swap the three `data-video-id="SET_VIDEO_ID"` placeholders in the Broadcast section for real
YouTube IDs. Until you do, the play button just opens your channel.

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
- the three Broadcast videos while their `data-video-id` is still `SET_VIDEO_ID`,
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

## 5) Subscribe / reminders (no backend needed)

- **Email:** the form POSTs to your provider. Default placeholder is **Buttondown**. Create an account,
  then set `newsletterAction` to `https://buttondown.email/api/emails/embed-subscribe/USERNAME`. Switching
  providers? Update that URL **and** the `form-action` value in `netlify.toml`.
  (On Netlify you can also skip the third party entirely and use **Netlify Forms** — add `netlify` to the
  `<form>` tag, then drop `buttondown.email` from `form-action`.)
- **Calendar (zero PII):** the "Subscribe to ops calendar" button hands people a `webcal://…/events.ics`
  link. Their device syncs it and fires the reminders (the `.ics` already has 1-day + 1-hour alarms). Keep
  `events.ics` in sync with the `EVENTS` array. **Both ship empty** — add real events to each.
- **Real SMS:** not possible from a static page alone. If you ever need it: a Netlify scheduled function
  plus Twilio, with opt-ins in Supabase. That's real backend work — the calendar route covers most people
  for free.

---

## 6) Free, secure contact email

The address is published in `/.well-known/security.txt`, so it needs to actually receive mail.
Netlify doesn't do email, so forwarding comes from wherever your DNS lives:

- **DNS on Cloudflare** (common even with Netlify hosting): Cloudflare dashboard → **Email** →
  **Email Routing** → enable (adds MX/SPF for you), then route `contact@midwestmeshlab.net` to your
  real inbox and verify it.
- **DNS on Netlify**: Netlify DNS doesn't forward mail. Use a forwarding provider (ImprovMX, Purelymail,
  Fastmail) and add the MX records it gives you under **Domains → DNS records**.

Either way, add a DMARC record once mail flows:
`v=DMARC1; p=reject; rua=mailto:contact@midwestmeshlab.net`

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
