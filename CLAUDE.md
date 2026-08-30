# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

The website for [midwestmeshlab.net](https://midwestmeshlab.net) — a hub for off-grid mesh
networking, Raspberry Pi, and open hardware across the Midwest.

It is a **static site with no build step, no framework, and no dependencies to install**.
The entire homepage (HTML + CSS + JS) is one self-contained file: `index.html`. Content
sub-pages are plain standalone HTML that share one stylesheet. You ship it by pushing to
`main`; there is nothing to compile.

There is no test suite, no linter, no `package.json`, and no CI build. "Verifying" a change
means opening the file in a browser (see *Running locally*).

## The three rules that govern this repo

These are not style preferences. Breaking them is the main way to do damage here.

1. **Nothing invented.** `BUILDS`, `EVENTS`, `IG_POSTS` and `MN_NODES` ship **empty on
   purpose**, each with an empty state explaining why. They were previously seeded with
   fabricated operators, node IDs and events, and that was removed deliberately. Never
   re-seed a list with plausible-looking examples to make the page look fuller. Add real
   entries or leave it empty.
2. **Claims need sources.** Every `SIGNAL` entry carries a `src:` URL and renders a
   "source →" link. Every fix card in `troubleshoot.html` ends in a Sources block pointing at
   Meshtastic docs or a real GitHub issue. If you cannot source it, it does not ship.
3. **Don't claim first-hand experience the lab hasn't had.** Notes that explain published
   fundamentals say so in a callout. Do not write "we measured", "field-tested", or invent
   part counts, prices or measurements.

Unfinished work is marked, not faked: `CONFIG.previewMode` + `wip:true` render an amber
"In progress" tag, and unwritten pages are listed in `404.html`'s `PLANNED` map so their
links land on an explanation rather than a dead end.

## Repository layout

```
index.html                  the whole homepage — HTML + inline <style> + inline <script>
troubleshoot.html           guided Meshtastic troubleshooter (works without JS)
404.html                    custom not-found page; names unwritten guides
thanks.html                 landing page for Netlify Forms submissions
netlify.toml                deploy config: build, security headers, CSP, redirects
events.ics                  the calendar visitors subscribe to (keep in sync with EVENTS)
robots.txt
.well-known/security.txt    security contact, RFC 9116 (watch the Expires date)
assets/page.css             shared styles for ALL content sub-pages
manuals/                    how-to pages (e.g. flash-heltec-v3.html)
builds/                     build write-ups with BOM tables (e.g. solar-relay-v2.html)
notes/                      field-log / reference posts (e.g. height-beats-wattage.html)
tools/build-map.js          regenerates the Minnesota map geometry (local only, not deployed)
tools/minnesota.geojson     public-domain MN boundary data, input to the above
README.md                   short orientation
ADMIN.md                    the operator's full manual — the authoritative how-to
CLAUDE.md                   this file
```

There is deliberately **no `_headers` file**. Netlify reads both `_headers` and
`netlify.toml`, and two overlapping header sources drift apart — `netlify.toml` is the single
source of truth. Do not reintroduce `_headers`.

`media/` (for `og-card.png`, build photos, Instagram thumbnails) is referenced by the code
but not yet committed; create it when adding images.

## How `index.html` is organized

One file, four parts, read top to bottom (line numbers drift — search for the markers):

1. **`<head>`** (~1–19): meta tags, Open Graph, inline SVG favicon, Google Fonts link.
2. **`<style>` … `</style>`** (~20–464): all homepage CSS, inline. The design system
   (CSS custom properties for colors, fonts, spacing) lives at the top of this block.
3. **HTML body** (~465–930): the page sections, each with an `id` and an empty container
   element (e.g. `#manuals-list`, `#builds-cards`, `#gallery`) that JS fills in.
4. **`<script>` … `</script>`** (~931–1483), in three clearly commented blocks:
   - **`CONFIG`** (~936) — site-wide links, handles, coordinates, giscus IDs, `previewMode`.
   - **`DATA`** — every list rendered on the page, as plain arrays of objects.
   - **`WIRING (no need to edit below)`** (~1090) — renderers, clock, weather fetch, map
     projection and drawing, and event handlers that turn CONFIG + DATA into DOM.

**The editing rule:** for content and configuration changes you only touch `CONFIG` and the
`DATA` arrays. Everything below the `WIRING` banner is plumbing — change it only when you are
deliberately altering behavior, not content.

### The DATA arrays

Each array is a list of objects; add or edit a line to change the page. The renderers escape
all string values via `esc()` before inserting them, so write plain text (no manual HTML
entities) in the data.

| Array        | Drives                        | Object shape (keys)                                     |
|--------------|-------------------------------|---------------------------------------------------------|
| `STACK`      | quick-link cards              | `t, d, href, ic` (`ic` = raw SVG `<path>` markup)       |
| `MANUALS`    | the manuals list              | `hx, title, desc, url, tags[]`, optional `wip`          |
| `BUILDS_REF` | the "build guides" cards      | `ct, title, desc, url`; `parts, cost, time` **optional**|
| `TOOLS`      | the toolkit grid              | `title, desc, ic`                                       |
| `POSTS`      | field-notes cards             | `title, excerpt, url`; optional `date`, `kind`, `wip`   |
| `SIGNAL`     | the "signal" cards            | `tag, title, desc, src` — **`src` is required**         |
| `TICKER`     | the scrolling ticker line     | array of strings (short, checkable statements)          |
| `IG_POSTS`   | Instagram tiles — **empty**   | `img, cap`, optional `url`                              |
| `BUILDS`     | community build wall — **empty** | `id, title, type, hw, loc, by, img`                  |
| `EVENTS`     | the events list — **empty**   | `title, start, end (ISO local), loc, desc`              |
| `MN_CITIES`  | map reference cities          | `name, x, y, lat, lon`, optional `major`, `la:'w'`      |
| `MN_NODES`   | real mesh nodes — **empty**   | `id, name, lat, lon`, optional `hub:true`               |
| `MN_LINKS`   | map edges                     | `[fromIndex, toIndex]` pairs into `MN_NODES`            |

Notes:
- The four arrays marked **empty** are empty by design — see rule 1 above.
- `BUILDS_REF` `parts`/`cost`/`time` are only filled in when the build page exists and has a
  real bill of materials. A planned build shows "BOM & costs once it's built" instead of
  invented numbers.
- `POSTS` labels by state: `wip` → "Planned", `date` → formatted date, else `kind`
  (e.g. "Reference note"). Don't add a publication date to something unpublished.
- In `BUILDS`, `type` must be one of `relay`, `gateway`, `handheld`, `sensor` — those are the
  filter buttons.
- `ic` fields hold raw inner SVG markup (`<path .../>`), injected verbatim into a wrapping
  `<svg>` — trusted author content, not escaped. Keep it to literal SVG paths.

## The Minnesota map

The map is **real geography, generated — not decoration.**

`tools/build-map.js` projects `tools/minnesota.geojson` (public-domain boundary data) through
an **Albers Equal Area Conic** projection — standard parallels 44.48°N / 48.40°N, central
meridian 93.364°W — simplifies the ring, and prints an SVG path. The viewBox is
**`0 0 520 593`**, which matches the true projected aspect ratio so the state is not stretched.

- **Never hand-edit the `<path id="mn-state">` data.** Regenerate: `node tools/build-map.js`.
- The **projection constants exist in two places** — `tools/build-map.js` and the map renderer
  in `index.html` (search `LAT0=46.44`). They must match, or city markers drift off the
  outline.
- `MN_CITIES` `x`/`y` are precomputed by that script from real `lat`/`lon`. They are
  geographic reference points and are explicitly **not** mesh nodes; the legend says so.
- `MN_NODES` is empty; when populated, the renderer projects each node by `lat`/`lon` at
  runtime. With it empty the map renders geography and states "No live node data connected."

## troubleshoot.html

A guided diagnostic. Its architecture matters:

- **Every fix is real HTML** in the page (`<article class="fix" id="fix-…">`). The wizard is
  only a *navigation layer* that reveals the matching card.
- So the page works **fully without JavaScript**, and every fix is deep-linkable
  (`/troubleshoot.html#fix-no-region`).
- Do not "simplify" it into JS-rendered content — that silently breaks both properties.
- The question tree is the `STEPS` object in the page's script; each option either points to
  another step (`next`) or resolves to a card (`fix`).
- Every card needs a Sources block. Bump the "Sources checked" date when revising.

## Content sub-pages (`manuals/`, `builds/`, `notes/`)

Each card in `MANUALS` / `BUILDS_REF` / `POSTS` links to a hand-written HTML page in the
matching folder. To add one:

1. **Copy an existing file in that folder as a template.** `flash-heltec-v3.html`,
   `solar-relay-v2.html`, and `height-beats-wattage.html` are the canonical examples.
2. Rename it to a slug and edit the content. Keep it in its folder.
3. Link it with `<link rel="stylesheet" href="../assets/page.css" />` — **do not** add inline
   styles; restyle once in `assets/page.css` and every sub-page updates.
4. Add the matching object to the relevant DATA array in `index.html`, and **remove its entry
   from the `PLANNED` map in `404.html`** if it had one.

Reusable page-CSS components (in `assets/page.css`): `.doc` article wrapper, `.eyebrow`,
`.note` / `.note.warn` callouts, `.table-wrap` + `table` for BOMs, `.specs`/`.spec` chips,
`.prevnext` nav. Match the existing markup. Note `.note` is already styled there — don't
redefine it in a page's own `<style>`.

## Conventions

- **Spelling/trademarks:** trademarked product names (Meshtastic®, Raspberry Pi®) carry the ®
  on first prominent use. The footer has a nominative-use disclaimer. Keep that style.
- **Visual theme:** "tactical" dark theme. Colors and fonts are CSS custom properties — change
  the variables, not individual rules. The palette is duplicated in the `index.html` `<style>`
  block and in `assets/page.css`; if you change brand colors, update both.
- **No new runtime dependencies / no third-party trackers.** Deliberate. Anything new must be
  added to the CSP in `netlify.toml` or the browser blocks it.
- **Accessibility / motion:** the JS respects `prefers-reduced-motion` (`reduce`); preserve
  that when touching animations (background canvas, count-up chips, ticker).

## Things that must stay in sync

- **`events.ics` ↔ `EVENTS`.** Both currently ship **empty**. When events are added, update
  both; the ICS uses **UTC** times with 1-day and 1-hour `VALARM` reminders. The calendar
  buttons disable themselves while `EVENTS` is empty.
- **`netlify.toml` CSP ↔ external origins used in code.** Adding a script, font, API, iframe
  or form endpoint means adding its origin to the right directive. Current allowlist: Google
  Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), Open-Meteo (`api.open-meteo.com`),
  YouTube embeds (`www.youtube-nocookie.com`), giscus (`giscus.app`). Both forms are Netlify
  Forms and post same-origin, so `form-action` is just `'self'`. The CSP uses
  `'unsafe-inline'` **because** CSS/JS are inline in one file — the documented trade-off
  (ADMIN.md §10 covers going strict).
- **`netlify.toml` must keep `skip_processing = false`.** Netlify detects forms during
  postprocessing; skipping it means the contact and subscribe forms silently never register.
  Individual transforms are disabled instead, so markup is still left alone.
- **Unwritten pages ↔ `404.html` `PLANNED` map ↔ `wip:true`.** All three describe the same
  set. Publishing a page means clearing it from all three.
- **`.well-known/security.txt` `Expires`** must stay within ~1 year; bump before it lapses.
  Its `Contact:` is an **https URL** to the contact form, not a mailto — the domain has no MX
  records, so a published address would bounce. Don't "fix" it back to an email.
- **`CONFIG` placeholders:** some fields are intentionally stubbed —
  `giscus.repoId`/`categoryId` are empty, and `buyMeACoffee` is a placeholder the operator
  asked to leave alone. Don't fill these with invented values; they need real credentials.

## Video embeds

A YouTube **channel homepage cannot be iframed** — the embed player accepts a video ID or a
playlist ID only. "Feature this channel" is therefore implemented as its uploads playlist.
Each slot in the Broadcast section takes either `data-playlist-id` or `data-video-id`, and
nothing is requested from YouTube until the visitor clicks play. Preserve that click-to-load
behavior.

## Running locally

No server is required to view it: open `index.html` in a browser. To exercise relative paths
correctly (sub-page links, `events.ics`, fetches), serve the folder root:

```
python3 -m http.server 8000      # then visit http://localhost:8000
```

The weather ticker calls Open-Meteo at runtime; offline it degrades to "LINK DOWN" by design.

Useful checks before committing:

```
# inline script parses (extract between the <script> markers first)
node --check /tmp/main.js
# map geometry still reproduces
node tools/build-map.js
```

## Deploying

**Netlify**, connected to this repo. Build command: *none*. Publish directory: `.` (repo root
= site root); both are declared in `netlify.toml`. **Every push to `main` redeploys
automatically.** Pull requests get their own deploy preview — a good place to confirm Netlify
Forms actually registered.

## Git workflow

- Develop on the branch you were assigned; create it locally if needed. Do not push to `main`
  directly unless explicitly told to.
- Commit with clear messages. Push with `git push -u origin <branch>`.
- **Do not open a pull request unless explicitly asked.**

## Where to look first

- Editing content or config → `index.html` `CONFIG` + `DATA` blocks.
- Adding a manual/build/note page → copy a template in the matching folder, add it to the
  array, clear it from `404.html`.
- Styling a sub-page → `assets/page.css`.
- Security headers / CSP / redirects / build settings → `netlify.toml`.
- The map's geometry → `tools/build-map.js`, never the path in `index.html`.
- Anything operational not covered here → **`ADMIN.md`** is the authoritative manual.

## License

Code is MIT; words and docs are CC BY-SA. Not affiliated with Meshtastic LLC, Raspberry Pi
Ltd, or MSP Mesh — those names are used nominatively.
