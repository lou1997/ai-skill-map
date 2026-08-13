# AGENTS.md

Vite + React + TypeScript + Tailwind SPA. Deployed to GitHub Pages on push to `main`.

## Commands

- `npm run dev` — dev server at `http://localhost:5173/ai-skill-map/`
- `npm run build` — runs `tsc && vite build`. No test or lint scripts exist.
- `npm run gen:data` — generates `public/data/skills.json` and `src/data/skills.json` from `data/scraped-skills.json`. CI runs this before build.
- `npm run scrape` — scrape GitHub for SKILL.md files (needs `GITHUB_TOKEN` env var for rate limits).

## Generated data files — never hand-edit

`src/data/skills.json` and `public/data/skills.json` are written by `scripts/gen-data.mjs`.
They are in `.gitignore`. Regenerate with `npm run gen:data` after changing `data/scraped-skills.json`.

## `src/data/seed.ts` is orphaned

The README says to add skills to `seed.ts`, but `gen-data.mjs` only reads `data/scraped-skills.json`.
Editing `seed.ts` has no effect on the running app. To add a skill: add it to `data/scraped-skills.json`
then run `npm run gen:data`.

## Build pipeline

- `tsc` runs before `vite build` (strict mode, `noUnusedLocals`, `noUnusedParameters`).
- Vite `base` is `/ai-skill-map/` — all asset paths include this prefix.
- Data is loaded at runtime via `fetch(import.meta.env.BASE_URL + '/data/skills.json')`.

## Tag system

Tags are defined in `src/data/tags.ts` across four categories: capability, domain, platform, maturity.
Skills reference tag IDs. New tags require an entry in `tags.ts` or the app silently ignores them.

## Other scripts (not in `package.json`)

- `scripts/scrape-candidates.mjs` — broader candidate search (`.mdc` files, prompts, rules).
- `scripts/filter-candidates.mjs` — deduplicates candidates and merges into scraped skills.
- `scripts/fetch-content.mjs` — backfills `content` on skills missing it.