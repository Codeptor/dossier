# codeptor-dossier

Personal dossier portfolio for Bhanu (handle `bhanueso`). Astro 5 static + Vercel adapter for the few serverless endpoints. Three sheets in one DOM (manifest, field log, archive) with view-transition swaps.

## Commands
- `pnpm dev` — Astro dev server (default :4321, falls back if busy)
- `pnpm build` — runs `prebuild` (GitHub activity fetch) → `astro check` → `astro build`
- `pnpm preview` — preview the production build
- `pnpm fetch:activity` — refresh `src/data/activity.json` from public GitHub commits

## Architecture

```
src/
├── data/
│   ├── profile.ts      # all editable copy (profile, history, assets, artifacts, capabilities, socials)
│   └── activity.json   # 12-month commit buckets, written by scripts/fetch-activity.ts
├── components/
│   ├── DossierStack.astro   # composes the three sheets, owns navigation + drag swap script
│   ├── ManifestSheet.astro  # green sheet — operational manifest
│   ├── ThoughtsSheet.astro  # paper sheet — field log + tag-filter chips
│   ├── ArchiveSheet.astro   # blue sheet — registry, distance rings, constellation footer
│   ├── Nav.astro            # nav links + theme toggle + keyboard shortcuts
│   ├── PulsarPlaque.astro   # SVG plaque in manifest header (astrolabe signature)
│   ├── Sparkline.astro      # SVG line chart for activity card
│   └── Barcode.astro        # decorative barcode strip
├── layouts/
│   └── BaseLayout.astro     # head metadata, RSS link, OG tags, JSON-LD Person
├── pages/
│   ├── index.astro          # /  → manifest active
│   ├── thoughts.astro       # /thoughts → field log active
│   ├── artifacts.astro      # /artifacts → archive active
│   ├── now.astro            # /now → status report card
│   ├── 404.astro            # in-aesthetic AUTHORIZATION_DENIED page
│   ├── rss.xml.ts           # /rss.xml feed from thoughts[]
│   ├── og.png.ts            # /og.png — @vercel/og generated card
│   └── api/
│       └── location.json.ts # visitor IP geo via Vercel edge headers
└── styles/global.css        # all CSS, includes the four theme palettes
```

## Sheet navigation

Three sheets are always in the DOM. Click navigation hits Astro's `ClientRouter` which uses the View Transitions API. Each sheet has `transition:name="sheet-{manifest|thoughts|archive}"` so the browser morphs them between routes by identity.

### Dynamic z-index for the becoming-active sheet
The pseudo-element `::view-transition-group(name)` cannot be targeted via attribute selectors on the host element — `html[data-target-sheet="X"] ::view-transition-group(...)` silently doesn't match. Verified at runtime via `getComputedStyle(document.documentElement, '::view-transition-group(...)').zIndex`.

The fix is in `DossierStack.astro`'s script: a managed `<style id="sheet-target-style">` tag injected/updated at runtime with a literal rule:

```css
::view-transition-group(sheet-thoughts) { z-index: 100 !important; }
```

Updated in three places to survive Astro's `<head>` swap:
- `go(route)` — before triggering the navigation
- `astro:before-swap` — reads the new doc's active sheet
- `astro:after-swap` — re-applies after Astro replaces the head

Without this, when you click a side sheet whose group sits below another group in DOM order, the becoming-active morph renders behind the other sheets' morphs ("moves to back, then to front through the stack").

### Drag-to-swap
Pointer-event handler on `.sheet.active`:
- pointermove sets `--drag-x` (horizontal only — `y=0, rot=0` during drag matches btn0s.dev's instrumented behaviour)
- pointerup with `|dx| > 120px` calls `go(routes[(index + direction + 3) % 3])`. `dx > 0` advances; routes cycle so there is no dead boundary.
- under threshold: `--drag-x` cleared, CSS `transition: transform 460ms cubic-bezier(0.32, 0, 0, 1)` snaps it back smoothly
- past threshold: don't clear `--drag-x`. The view-transition then captures the dragged-off transform as its FROM state, so the sheet flows continuously into the new layout.

Curve `cubic-bezier(0.32, 0, 0, 1)` and duration 460ms come from instrumenting btn0s.dev's runtime via Playwright (≈199 frame samples during a real navigation).

## Data flow

1. `src/data/profile.ts` is the single source of truth for copy.
2. `scripts/fetch-activity.ts` runs in `prebuild`, hits `api.github.com/search/commits?q=author:codeptor`, buckets last 12 months, writes `src/data/activity.json`. Falls back to keeping the previous file on failure.
3. `profile.ts` reads `activity.json` via `import { default as activity }`.
4. Stats (`ARTIFACTS / THOUGHTS / STACK`) are derived from `.length` of the arrays — never hand-typed.
5. `__GIT_SHA__` is injected by `astro.config.mjs` via `vite.define` from `git rev-parse --short=7 HEAD`. `profile.ts` reads it for the checksum (`BHN.{sha7}`). Falls back to `VERCEL_GIT_COMMIT_SHA`, then `"DEV"`.
6. Visitor location is fetched client-side from `/api/location.json` (Edge Function reading `x-vercel-ip-city` / `x-vercel-ip-country`).

## Fonts

All self-hosted in `public/fonts/`:
- Nippo Variable (sans/display)
- Departure Mono (mono — used on manifest + archive)
- Tronica Mono (mono — used on the field-log paper sheet only)

`global.css` defines `--mono`, `--mono-alt`, `--sans`, `--serif`.

## Themes

`html[data-theme="..."]` overrides on `:root` for `dark` (default), `blueprint`, `plaque`, `light`. Cycled by the theme button in `Nav.astro` (also bound to the `t` keyboard shortcut). Stored in `localStorage` as `codeptor-theme`.

## Keyboard shortcuts

- `1` / `h` → home
- `2` → thoughts
- `3` / `a` → artifacts
- `←` / `→` → prev / next route (cycles)
- `t` → cycle theme

Ignored when focus is in an input/textarea or `contenteditable`. Modifier keys bypass.

## Conventions

- Don't fabricate data. `profile.ts` only contains real values; placeholder months in `activity.json` are zeros.
- Stats derive from arrays; don't hand-edit values.
- New themes: add a `html[data-theme="X"]` block in `global.css` AND add `"X"` to the `THEMES` array in `Nav.astro`.
- New artifacts/thoughts/etc: edit `profile.ts` only. Components don't need touching.

## Deploy

Vercel. The two `prerender = false` routes (`/api/location.json`, `/og.png`) become serverless functions; everything else is static HTML at the edge.

## Open follow-ups

- `/thoughts/[slug]` and `/artifacts/[slug]` currently re-render the dossier stack — need real per-post pages (likely MDX) before launch.
- `bhanu-dossier.pdf` not yet in `public/`; the manifest's `Download_Full_Dossier.pdf` button 404s until added.
- Per-artifact RA/DEC coordinate strings are intentionally not added — would need real values per project.
