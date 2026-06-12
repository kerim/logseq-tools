# Logseq Tools

A single-page showcase of seven open-source tools for [Logseq DB](https://logseq.com) graphs, built by [P. Kerim Friedman](https://github.com/kerim).

Live at: **https://kerim.github.io/logseq-tools/**

## What it is

A static web page — no framework, no build step, no dependencies — that displays each tool as a card with its description, integration type, runtime, and last-updated date. Dates are fetched live from the GitHub API on each page load; if GitHub is unreachable, saved fallback dates are shown instead so the page always looks complete.

Features:

- Responsive grid: 1 column on phones, 2 on tablets (≥700 px), 3 on desktop (≥1100 px)
- High-contrast light and dark themes; toggles with a button, persists to `localStorage`, falls back to OS preference
- Integration type badges (Logseq CLI / Logseq HTTP API / Logseq Plugin / Standalone utility) — labeled in text, not color alone
- Accessible: semantic landmarks, visible focus rings, `aria-label` on all interactive elements, WCAG-AA contrast in both themes

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell — header, grid container, footer |
| `styles.css` | All styling — CSS custom properties, grid, badges, themes |
| `app.js` | Renders panels, fetches live dates, wires theme toggle |
| `projects.json` | The seven projects (source of truth for panel content) |

## Run locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Or any static file server — the page is plain files, no server-side logic needed.

## Deploy to GitHub Pages

1. Push this repository to GitHub (or create a new one):
   ```sh
   gh repo create kerim/logseq-tools --public --source=. --remote=origin --push
   ```

2. Enable GitHub Pages from the repository **Settings → Pages** tab:
   - Source: **Deploy from a branch**
   - Branch: `main`, folder: `/ (root)`
   - Click **Save**

3. After about a minute, the page will be live at `https://kerim.github.io/logseq-tools/`.

   You can also enable Pages via the CLI:
   ```sh
   gh api -X POST repos/kerim/logseq-tools/pages \
     -f 'source[branch]=main' \
     -f 'source[path]=/'
   ```

## Adding or updating a project

Edit `projects.json`. Each entry has these fields:

```json
{
  "name": "repo-name-on-github",
  "title": "Display title",
  "repo": "https://github.com/kerim/repo-name-on-github",
  "description": "One or two sentences.",
  "integration": "Logseq CLI",
  "runtime": "Language · framework",
  "fallbackUpdated": "YYYY-MM-DD"
}
```

Valid `integration` values: `Logseq CLI`, `Logseq HTTP API`, `Logseq Plugin`, `Standalone utility`.

Update `fallbackUpdated` whenever you make a significant change, so offline visitors see a reasonable date.
