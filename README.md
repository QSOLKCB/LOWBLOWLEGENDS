# LOW BLOW LEGENDS

**A 2D arcade fighter with legitimate combat mechanics and profoundly illegitimate finishing moves.**

[![Foundation checks](https://github.com/QSOLKCB/LOWBLOWLEGENDS/actions/workflows/check.yml/badge.svg)](https://github.com/QSOLKCB/LOWBLOWLEGENDS/actions/workflows/check.yml) · [Project site](https://qsolkcb.github.io/LOWBLOWLEGENDS/) · [Apache-2.0](LICENSE)

> **Status: pre-production / design baseline.** This repository contains a project-site teaser, an independently testable deterministic reference combat kernel, and binding engineering/creative invariants. It is **not yet a playable fighting game**. No released version or verified Pages deployment is claimed.

**Premise:** A tournament of totally original egomaniacs, corporate nightmares, pseudo-intellectuals and other gloriously daft fictional fighters. The combat is serious; the finishing moves have better things to do. A fighter can break the fourth wall, taunt their opponent or decline the mandatory 37-button finisher and take the direct route.

## Project laws

**Correctness outranks speed. Gameplay outranks the joke. Comedy never overrides fair combat.**

Read [AGENTS.md](AGENTS.md) first. The detailed, numbered non-negotiable contract is [docs/INVARIANTS.md](docs/INVARIANTS.md); these govern every Work/agent PR.

## What exists today

- A static HTML/CSS/JS pre-production landing page with an interactive **dialogue teaser**. It is not a gameplay demo.
- A dependency-free, pure JavaScript **reference** match reducer with a fixed logical tick, bounded attacks and deterministic replay fingerprinting.
- Node built-in tests and GitHub Actions checks, plus a guarded Pages workflow.
- Game vision, rights policy, architecture decisions, roadmap and explicit autonomous-work handoff.

## Start here

- [Project concept and mechanics](docs/GAME_DESIGN.md)
- [Core invariants and acceptance gates](docs/INVARIANTS.md)
- [Technical architecture](docs/ARCHITECTURE.md)
- [Originality and asset rights](docs/ASSETS_AND_RIGHTS.md)
- [ChatGPT Work handoff](docs/WORK_HANDOFF.md)
- [Roadmap](docs/ROADMAP.md)
- [Getting started](GETTING_STARTED.md)
- [Player instructions: planned controls](INSTRUCTIONS.md)

## Development

Node.js 22+ is used **only for checks**, not the deployed website. No npm dependencies are required.

```sh
npm test
npm run check
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`. Run through a local server for development; the project site is entirely static.

**Maintainer control:** Agents work in branches and pull requests. No direct main writes, self-merges, releases or immutable tags without the human maintainer's approval. Every PR earns its own review, including a new review if the final commit changes.

## Licence

Project code and documentation: [Apache License 2.0](LICENSE), subject to any future clearly identified third-party files and their individual licences. No third-party franchise characters, graphics, voice recordings or sounds have been imported. See [docs/ASSETS_AND_RIGHTS.md](docs/ASSETS_AND_RIGHTS.md).

QSOL-IMC original satire; not affiliated with or endorsed by any fighting-game franchise or public figure.

