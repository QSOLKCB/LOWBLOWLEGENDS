# Getting started

**Current stage:** documentation and reference kernel, **not a playable fighting game**.

## Prerequisites

- Modern desktop browser.
- Python 3 (or another static file server) to preview the project site.
- Node.js 22+ to run the test and invariant suite; there are zero npm runtime dependencies.

## Run the pre-production site

```sh
python3 -m http.server 8000
```

Visit `http://localhost:8000/`. The site is an interactive *dialogue teaser* only.

## Run the foundation checks

```sh
npm test
npm run check
```

No `npm install` is needed. `src/combat-core.mjs` is a small, independently testable rules reference, not a rendered game.

## How Work should begin

Read [AGENTS.md](AGENTS.md) and [docs/WORK_HANDOFF.md](docs/WORK_HANDOFF.md). Inspect current main and open PRs, establish a new branch, and build the v0.1.0 gameplay slice under the invariant contract. Avoid introducing a framework unless a specific need and measurement justify it.

## GitHub Pages

GitHub Pages project URL: `https://qsolkcb.github.io/LOWBLOWLEGENDS/`. A successful PR does not deploy. After an approved merge to `main`, the deploy job runs if **Settings → Pages → Build and deployment → Source** is set to **GitHub Actions**. Confirm URL and deployed commit; don't claim live deployment from workflow success alone.

