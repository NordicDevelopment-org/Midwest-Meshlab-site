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
_headers                    Cloudflare security headers + CSP
events.ics                  the calendar people subscribe to (keep in sync with EVENTS)
robots.txt
.well-known/security.txt    researcher contact (RFC 9116)
/manuals/  /builds/  /notes/  (you create) the pages the cards link to
/media/ig/                  (you create) square Instagram thumbnails
```

---

## 2) First-launch checklist (edit `CONFIG`)

| Field | Set to |
|---|---|
| `email` | `contact@midwestmeshlab.net` (forward to your Proton inbox — see §6) |
| `instagram` / `instagramHandle` | already `@midwest_meshlab` |
| `youtube` / `youtubeLive` | your channel + live URLs |
| `buyMeACoffee` | your Buy Me a Coffee URL |
| `newsletterAction` | your email provider's subscribe endpoint (see §5) |
| `mspMeshDiscord` | MSP Mesh's real **never-expiring** Discord invite (until then it points at mspmesh.org) |
| `githubDiscussions` | `https://github.com/YOURUSER/midwestmeshlab/discussions` |
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
```

**Add a blog post** — `const POSTS = [`:
```js
{ date:"2026-07-01", title:"Post title", excerpt:"Teaser sentence.", url:"/notes/post-slug.html" },
```

**Add a community build to the wall** — `const BUILDS = [`:
```js
{ id:"0xABCD", title:"Name", type:"relay", hw:"board · power · antenna", loc:"City, ST", by:"@handle", img:null },
```
`type` must be one of: `relay`, `gateway`, `handheld`, `sensor` (those are the filter buttons).
Set `img` to `"/media/builds/name.jpg"` once you have a photo, or leave `null` for the glyph.

**Signal / Tech-talk** → `SIGNAL` array. **Ticker line** → `TICKER` array.
**Toolkit** → `TOOLS`. **Instagram tiles** → `IG_POSTS` (set `img` to a file in `/media/ig/`).

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

When a page goes live, delete that entry's `wip: true`. When the whole site is ready, set
**`previewMode: false`** — every tag and the legend vanish, and nothing else about the site changes.

---

## 4) The Minnesota map

Edit `MN_NODES` (positions in the 520×640 SVG box) and `MN_LINKS` (pairs of node indexes).
`hub:true` makes a node amber with a pulsing range ring. Packets auto-animate along the links.

- The state outline is a **stylized, original** path from public-domain boundary data — not copied from
  any project, and not live telemetry (so no trademark/data issues).
- For a real, MQTT-fed map, the "Live maps" card already links to meshmap.net and map.meshtastic.org.
  If you ever want live data on your own domain, self-host one of those open projects on a subdomain and
  link to it — don't scrape someone else's server.

---

## 5) Subscribe / reminders (no backend needed)

- **Email:** the form POSTs to your provider. Default placeholder is **Buttondown**. Create an account,
  then set `newsletterAction` to `https://buttondown.email/api/emails/embed-subscribe/USERNAME`. Switching
  providers? Update that URL **and** the `form-action` line in `_headers`.
- **Calendar (zero PII):** the "Subscribe to ops calendar" button hands people a `webcal://…/events.ics`
  link. Their device syncs it and fires the reminders (the `.ics` already has 1-day + 1-hour alarms). Keep
  `events.ics` in sync with the `EVENTS` array (same four events ship in both).
- **Real SMS:** not possible from a static site. If you ever need it: Cloudflare Worker + Cron Trigger +
  Twilio, storing opt-ins in Workers KV. It's real backend work — the calendar route covers most people free.

---

## 6) Free, secure contact email (Cloudflare → Proton)

1. Cloudflare dashboard → **Email** → **Email Routing** → enable (adds MX/SPF automatically).
2. Route `contact@midwestmeshlab.net` → **forward to** your Proton inbox; verify it.
3. Add a DMARC record: `v=DMARC1; p=reject; rua=mailto:contact@midwestmeshlab.net`.
The address is also published in `/.well-known/security.txt` for researchers.

---

## 7) Community discussion (GitHub Discussions via giscus)

Free, no database, you moderate from GitHub:
1. Make the repo (see §8) **public**, then enable **Discussions** in repo Settings.
2. Install the **giscus** GitHub App on the repo: <https://github.com/apps/giscus>.
3. Go to <https://giscus.app>, enter the repo, pick a category, and copy the generated
   `repo`, `repoId`, `category`, `categoryId`.
4. Paste them into `CONFIG.giscus`. The "Load discussion" button on the site now loads the thread.
   (giscus is loaded **only on click**, and its origin is already allow-listed in `_headers`.)

---

## 8) Recommended setup: GitHub repo + Cloudflare Pages

Yes — make the repo. It gives you version history, doc control, discussions, and one-click deploys.

**Suggested layout**
```
midwestmeshlab/                <- repo root = site root
├─ index.html
├─ _headers
├─ events.ics
├─ robots.txt
├─ .well-known/security.txt
├─ manuals/   builds/   notes/   media/
├─ ADMIN.md                     <- this file (private notes are fine; repo can still be public)
└─ README.md
```

**Connect it (deploy on every push)**
1. Push the folder to a new GitHub repo named `midwestmeshlab`.
2. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
   Build command: *none*. Output directory: `/`.
3. Add custom domains `midwestmeshlab.net` and `www`.
4. From now on: edit `index.html`, `git commit`, `git push` → live in ~30 seconds.

Prefer not to use Git? You can drag-and-drop the folder into Pages → **Upload assets** each time instead.
Either way the site is the same single file.

> **Go ahead and create the repo**, then share the URL and I'll tailor the README, the `/manuals` and
> `/builds` page templates, and the exact giscus snippet to it.

---

## 9) Cloudflare hardening checklist (10 minutes, once)

- SSL/TLS: **Full (strict)** · **Always Use HTTPS** on · **Min TLS 1.2** · Automatic HTTPS Rewrites on.
- **HSTS** on (matches `_headers`); submit to hstspreload.org once stable.
- **DNSSEC** on (enable in Cloudflare, add the DS record at your registrar).
- **WAF** managed ruleset on · **Bot Fight Mode** on · a **rate-limit** rule (e.g. 50 req/10s/IP).
- **2FA** on your Cloudflare *and* GitHub accounts — for a static site, the accounts are the real target.
- After deploy, scan at <https://securityheaders.com> and <https://observatory.mozilla.org> (aim for A/A+),
  and check DevTools console for zero CSP errors.

---

## 10) Going fully strict later (optional)

When you want the no-`unsafe-inline` CSP the security crowd loves:
1. Move the `<style>` block to `styles.css` and the `<script>` block to `app.js`.
2. Reference them with `<link rel="stylesheet" href="styles.css">` and `<script src="app.js" defer>`.
3. In `_headers`, change `script-src` to `'self' https://giscus.app` and `style-src` to
   `'self' https://fonts.googleapis.com` (drop both `'unsafe-inline'`).
4. Self-host the four fonts to also drop the Google origins. Then the only external calls are the weather
   API and (on click) YouTube/giscus.

That's the trade-off: one easy-to-edit file now, or a stricter multi-file setup later. Both are supported.
