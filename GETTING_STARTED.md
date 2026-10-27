# Getting started

## Play locally

Use a modern desktop browser and a keyboard. From this directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`, choose both fighters, then choose CPU or local player 2. Click **Enter the pit**. [INSTRUCTIONS.md](INSTRUCTIONS.md) lists the keys; the in-game field manual also remaps them.

ES modules require a static HTTP server; double-clicking `index.html` with a `file:` URL is not supported. The server can run entirely offline. A successful initial HTTPS/localhost visit also caches the static game for offline reload. Browser privacy policies can deny caches; the UI reports that condition. Close all game tabs and reopen after an update so the new service worker can activate. Clearing this site's browser data removes cached files and local key mappings.

## Verify

Node.js 22+ is tooling only. No installed packages are needed for:

```sh
npm run verify
```

This checks the invariant documents and asset hashes, runs the preserved reference tests and actual game regressions, and stages only production files in `_site/`.

Real-browser verification needs the pinned test-only Playwright package and engines:

```sh
npm ci --ignore-scripts
npx playwright install --with-deps chromium firefox webkit
npm run browser
```

CI pins Ubuntu 24.04 instead of a moving runner image. Reports, screenshots and the real keyboard match replay appear in `test-results/`. Chromium gets the full match/offline/input suite; Firefox and WebKit get startup/pause and frozen-replay parity checks. Browser engines are test tools and are never copied into `_site/`.

## GitHub Pages

The deployment job requires both check jobs and only runs after a push to `main`; the maintainer controls integration. Project path: `/LOWBLOWLEGENDS/`. All runtime fetches are relative to this scope. Verify the deployed SHA and actual URL after merge before announcing it live. This branch has not deployed the game or created a release.

Before changes, read [AGENTS.md](AGENTS.md) and the linked invariant, rights, design and architecture documents.
