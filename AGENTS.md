# Project Notes

## Stack
- Astro static site with TypeScript.
- Content lives in `src/data/profile.ts`.
- Main visual system lives in `src/styles/global.css`.
- The dossier stack is rendered by `src/components/DossierStack.astro`.

## Conventions
- Keep the portfolio data-driven. Update arrays in `profile.ts` instead of hardcoding copy in components.
- Preserve the three-document model: manifest, field log, archive.
- Use Astro server-rendered markup first; add client JS only for small interaction polish.
- Prefer ASCII copy and concise labels.

## Known Follow-Ups
- Replace placeholder links with final project URLs.
- Add real MDX entries if this becomes a writing site.
- Add a downloadable resume PDF at `public/bhanu-dossier.pdf`.
