# Midwest Mesh Lab

The site for [midwestmeshlab.net](https://midwestmeshlab.net) — an open hub for off-grid mesh
networking, Raspberry Pi, and open hardware across the Midwest.

It's a **static site**: one self-contained `index.html` plus a few content pages. No build step.

## Run it
Open `index.html` in a browser, or serve the folder with any static server.

## Deploy
Connected to **Cloudflare Pages** (build command: none, output dir: `/`). Every push to `main`
redeploys automatically.

## Edit content
Almost everything lives in plain arrays at the bottom of `index.html` (`MANUALS`, `BUILDS`,
`POSTS`, `EVENTS`, `MN_NODES`, …). Add a line, commit, push. Full guide: **[ADMIN.md](ADMIN.md)**.

## Layout
```
index.html                 the site (HTML + CSS + JS in one file)
_headers                   Cloudflare security headers + CSP
events.ics                 calendar people subscribe to
robots.txt
.well-known/security.txt   security contact (RFC 9116)
assets/page.css            shared styles for content pages
manuals/  builds/  notes/  content pages (copy the templates inside)
ADMIN.md                   how to operate everything
```

## License
Code MIT · words & docs CC BY-SA. Not affiliated with Meshtastic LLC, Raspberry Pi Ltd, or MSP Mesh;
those names are used nominatively. See the disclaimer in the site footer.
