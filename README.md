# Midwest Mesh Lab

The site for [midwestmeshlab.net](https://midwestmeshlab.net) — an open hub for off-grid mesh
networking, Raspberry Pi, and open hardware across the Midwest.

It's a **static site**: one self-contained `index.html` plus a few content pages. No build step.

## Run it
Open `index.html` in a browser, or serve the folder with any static server.

## Deploy
Connected to **Netlify**. No build step — the repo root is the web root. Every push to `main`
redeploys automatically. All deploy config (headers, CSP, redirects) lives in `netlify.toml`,
which is the single source of truth; there is deliberately no `_headers` file.

## Edit content
Almost everything lives in plain arrays at the bottom of `index.html` (`MANUALS`, `BUILDS`,
`POSTS`, `EVENTS`, `MN_NODES`, …). Add a line, commit, push. Full guide: **[ADMIN.md](ADMIN.md)**.

## Layout
```
index.html                 the site (HTML + CSS + JS in one file)
troubleshoot.html          guided Meshtastic troubleshooter (works without JS)
404.html                   custom not-found page (names unwritten guides)
thanks.html                form submission landing page
netlify.toml               deploy config: headers, CSP, redirects
events.ics                 calendar people subscribe to
robots.txt
.well-known/security.txt   security contact (RFC 9116)
assets/page.css            shared styles for content pages
manuals/  builds/  notes/  content pages (copy the templates inside)
tools/build-map.js         regenerates the Minnesota map geometry
ADMIN.md                   how to operate everything
```

## The Minnesota map
The state outline is generated, not hand-drawn: `tools/build-map.js` projects public-domain
boundary data through an Albers Equal Area Conic projection and prints an SVG path, and the
viewBox matches the true projected aspect ratio so nothing is stretched. City markers are real
lat/lon run through the same projection. Run `node tools/build-map.js` to regenerate; don't
hand-edit the path in `index.html`.

## Forms
There is no mail server: `midwestmeshlab.net` has no MX records, so the old
`contact@midwestmeshlab.net` address bounced. Both forms post to **Netlify Forms** instead and land
on `/thanks.html`. `netlify.toml` must keep `skip_processing = false` or Netlify never registers
them.

## No invented content
Lists that have no real data yet (community builds, Instagram tiles, events, mesh nodes) ship
**empty**, with an empty state explaining why. Cards whose page isn't written are tagged
**In progress** via `CONFIG.previewMode`. Please keep it that way: add real entries, don't seed
plausible-looking examples.

## License
Code MIT · words & docs CC BY-SA. Not affiliated with Meshtastic LLC, Raspberry Pi Ltd, or MSP Mesh;
those names are used nominatively. See the disclaimer in the site footer.
