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

## Repository layout

```
index.html                  the whole homepage — HTML + inline <style> + inline <script>
_headers                    Cloudflare Pages security headers + CSP (do NOT rename)
events.ics                  the calendar visitors subscribe to (keep in sync with EVENTS)
robots.txt
.well-known/security.txt    security contact, RFC 9116 (watch the Expires date)
assets/page.css             shared styles for ALL content sub-pages
manuals/                    how-to pages (e.g. flash-heltec-v3.html)
builds/                     build write-ups with BOM tables (e.g. solar-relay-v2.html)
notes/                      field-log / blog posts (e.g. height-beats-wattage.html)
README.md                   short orientation
ADMIN.md                    the operator's full manual — the authoritative how-to
CLAUDE.md                   this file
```

`media/` (for `og-card.png`, build photos, Instagram thumbnails) is referenced by the code
but not yet committed; create it when adding images.

## How `index.html` is organized

The file has three parts. Read it top to bottom:

1. **`<head>`** (lines ~1–19): meta tags, Open Graph, inline SVG favicon, Google Fonts link.
2. **`<style>` … `</style>`** (lines ~20–421): all homepage CSS, inline. The design system
   (CSS custom properties for colors, fonts, spacing) lives at the top of this block.
3. **HTML body** (lines ~422–851): the page sections, each with an `id` and an empty
   container element (e.g. `#manuals-list`, `#builds-cards`, `#map`) that JS fills in.
4. **`<script>` … `</script>`** (lines ~852–1211), in three clearly commented blocks:
   - **`CONFIG`** — site-wide links, email, handles, coordinates, giscus IDs.
   - **`DATA`** — every list rendered on the page, as plain arrays of objects.
   - **`WIRING (no need to edit below)`** — the renderers, clock, weather fetch, map
     animation, and event handlers that turn CONFIG + DATA into DOM.

**The editing rule:** for content and configuration changes you only touch `CONFIG` and the
`DATA` arrays. Everything below the `WIRING` banner is plumbing — change it only when you
are deliberately altering behavior, not content.

### The DATA arrays

Each array is a list of objects; add or edit a line to change the page. The renderers in the
WIRING block escape all string values via `esc()` before inserting them, so write plain text
(no manual HTML entities) in the data.

| Array        | Drives                          | Object shape (keys)                                      |
|--------------|---------------------------------|----------------------------------------------------------|
| `STACK`      | top nav / quick-link cards      | `t, d, href, ic` (`ic` = raw SVG `<path>` markup)        |
| `MANUALS`    | the manuals list                | `hx, title, desc, url, tags[]`                           |
| `BUILDS_REF` | the "build guides" cards        | `ct, title, desc, url, parts, cost, time`                |
| `TOOLS`      | the toolkit grid                | `title, desc, ic`                                        |
| `POSTS`      | field-notes / blog cards        | `date (YYYY-MM-DD), title, excerpt, url`                 |
| `SIGNAL`     | the "signal" tech-talk cards    | `tag, title, desc`                                       |
| `TICKER`     | the scrolling ticker line       | array of strings                                         |
| `IG_POSTS`   | Instagram tiles                 | `img (path or null), cap`                                |
| `BUILDS`     | the community "build wall"      | `id, title, type, hw, loc, by, img`                      |
| `EVENTS`     | the events list                 | `title, start, end (ISO local), loc, desc`              |
| `MN_NODES`   | Minnesota map node dots         | `name, x, y` (in a 520×640 SVG box), optional `hub:true` |
| `MN_LINKS`   | map edges                       | array of `[fromIndex, toIndex]` pairs into `MN_NODES`    |

Notes:
- In `BUILDS`, `type` must be one of `relay`, `gateway`, `handheld`, `sensor` — those are the
  filter buttons. Set `img` to a path under `/media/builds/` or leave `null` for a glyph.
- `ic` fields hold raw inner SVG markup (`<path .../>`), injected verbatim into a wrapping
  `<svg>` — this is trusted author content, not escaped. Keep it to literal SVG paths.

## Content sub-pages (`manuals/`, `builds/`, `notes/`)

Each card in `MANUALS` / `BUILDS_REF` / `POSTS` links to a hand-written HTML page in the
matching folder. To add one:

1. **Copy an existing file in that folder as a template** — each starts with a
   `<!-- TEMPLATE: copy this file... -->` comment. `flash-heltec-v3.html`,
   `solar-relay-v2.html`, and `height-beats-wattage.html` are the canonical examples.
2. Rename it to a slug and edit the content. Keep it in its folder.
3. Link it with `<link rel="stylesheet" href="../assets/page.css" />` — **do not** add inline
   styles; restyle once in `assets/page.css` and every sub-page updates.
4. Add the matching object to the relevant DATA array in `index.html` so it's linked.

Reusable page-CSS components (defined in `assets/page.css`): `.doc` article wrapper,
`.eyebrow`, `.note` / `.note.warn` callouts, `.steps` ordered list, `.table-wrap` + `table`
for BOMs, `.specs`/`.spec` chips, `.prevnext` nav. Match the existing markup.

## Conventions

- **Spelling/trademarks:** product names that are trademarks (Meshtastic®, Raspberry Pi®) are
  written with the ® on first prominent use. The footer carries a nominative-use disclaimer.
  Keep that style; the site is intentionally careful here.
- **Visual theme:** "tactical" dark theme. Colors and fonts are CSS custom properties — change
  the variables, not individual rules. The same palette is duplicated in the `index.html`
  `<style>` block and in `assets/page.css`; if you change brand colors, update both.
- **No new runtime dependencies / no third-party trackers.** This is a deliberate stance.
  Outbound calls are limited to a small allowlist (see CSP below). Anything new must be added
  to the CSP in `_headers` or the browser will block it.
- **Accessibility / motion:** the JS respects `prefers-reduced-motion` (`reduce`); preserve
  that when touching animations (map packets, count-up chips, ticker).

## Things that must stay in sync

- **`events.ics` ↔ `EVENTS` array.** Both ship the same events. The ICS uses **UTC** times
  (Central time + 5h CDT / + 6h CST), with 1-day and 1-hour `VALARM` reminders. Update both
  when events change.
- **`_headers` CSP ↔ external origins used in code.** If you add a script, font, API, iframe,
  or form endpoint, add its origin to the right CSP directive in `_headers`. Current allowlist:
  Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), Open-Meteo weather
  (`api.open-meteo.com`), YouTube embeds (`www.youtube-nocookie.com`), giscus (`giscus.app`),
  newsletter POST (`buttondown.email`). The CSP uses `'unsafe-inline'` **because** CSS/JS are
  inline in one file — that's the documented trade-off (see ADMIN.md §10 for going strict).
- **`.well-known/security.txt` `Expires`** must stay within ~1 year; bump it before it lapses.
- **`CONFIG` placeholders:** some fields are intentionally stubbed (`giscus.repoId`/`categoryId`
  empty, `mspMeshDiscord` pointing at the site until a real invite exists, YouTube
  `SET_VIDEO_ID` placeholders in the Broadcast section). Don't "fix" these with invented
  values — they need real credentials from the operator.

## Running locally

No server is required to view it: open `index.html` in a browser. To exercise relative paths
correctly (sub-page links, `events.ics`, fetches), serve the folder root:

```
python3 -m http.server 8000      # then visit http://localhost:8000
```

The weather ticker calls Open-Meteo at runtime; offline it degrades to "LINK DOWN" by design.

## Deploying

**Cloudflare Pages**, connected to this repo. Build command: *none*. Output directory: `/`
(repo root = site root). **Every push to `main` redeploys automatically** (~30s). There is no
staging build to run or artifacts to produce.

## Git workflow for this task

- Develop on the branch you were assigned; create it locally if needed. Do not push to `main`
  directly unless explicitly told to.
- Commit with clear messages. Push with `git push -u origin <branch>`.
- **Do not open a pull request unless explicitly asked.**

## Where to look first

- Editing content or config → `index.html` `CONFIG` + `DATA` blocks.
- Adding a manual/build/note page → copy a template in the matching folder, then add it to the
  array in `index.html`.
- Styling a sub-page → `assets/page.css`.
- Security headers / CSP / external origins → `_headers`.
- Anything operational not covered here → **`ADMIN.md`** is the authoritative manual.

## License

Code is MIT; words and docs are CC BY-SA. Not affiliated with Meshtastic LLC, Raspberry Pi
Ltd, or MSP Mesh — those names are used nominatively.
