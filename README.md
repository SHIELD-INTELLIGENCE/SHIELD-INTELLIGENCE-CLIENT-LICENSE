# SHIELD INTELLIGENCE CLIENT LICENSE v1.0 — Static Site

Standalone single-page legal/document site for the SHIELD Intelligence universal client-product license.

## Stack

Vanilla HTML / CSS / JS. No framework, no backend, no database, no external APIs. Works fully offline after load (no CDN fonts or scripts).

## Structure

```text
index.html   — single page (lives at /)
styles.css   — light/dark + responsive + print styles
app.js       — TOC, search, theme, anchors, PDF-via-print
LICENSE.md   — canonical license text (Markdown)
assets/      — shield.svg favicon
README.md    — this file
```

## Run

Any static server, document lives at `/`:

```bash
cd SHIELD-INTELLIGENCE-CLIENT-LICENSE
python3 -m http.server 8080
# open http://localhost:8080/
```

Or: `npx http-server . -p 3000 -o`

## Features

- Markdown-style legal document, exact license text (33 sections, unmodified)
- Sticky desktop TOC with scroll-spy; collapsible TOC on mobile
- Document search: highlight, match count, next/previous, `Enter`/`Shift+Enter`, `Esc` clears, `/` focuses
- Stable section anchors (`#client-ownership`, …) with `§` copy-link buttons
- Light (default) / dark theme, persisted in `localStorage`
- Download buttons: `.md` (direct `LICENSE.md` download) + PDF (print stylesheet → Save as PDF, fully offline)
- Print stylesheet: hides nav/search/controls, black-on-white, avoids orphaned headings
- Accessibility: skip link, semantic headings, focus-visible states, ARIA labels, `prefers-reduced-motion` support

## Offline / PDF notes

The PDF button triggers `window.print()` with a dedicated print stylesheet. Choose **Save as PDF** in the dialog. This keeps the site 100% offline with zero PDF libraries. The Markdown button downloads `LICENSE.md` via a plain same-origin link.
