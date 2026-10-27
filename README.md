# LOW BLOW LEGENDS

**Proper arcade combat. Catastrophically unprofessional conduct.**

[![Arcade checks](https://github.com/QSOLKCB/LOWBLOWLEGENDS/actions/workflows/check.yml/badge.svg)](https://github.com/QSOLKCB/LOWBLOWLEGENDS/actions/workflows/check.yml) · [Project site](https://qsolkcb.github.io/LOWBLOWLEGENDS/) · [Apache-2.0](LICENSE)

**Playable vertical slice, awaiting maintainer integration — not a tagged release.** This branch replaces the teaser with an actual 1v1 fighting game. The public Pages URL may still serve the foundation until this PR is reviewed, merged and its deployment verified.

Pick **Ledger**, an angular warranty-enforcement automaton, or **Clinker**, an unlicensed ceramic pressure vessel. Settle your dispute in the **Arbitration Pit** with local two-player controls or a simple CPU sparring partner.

- Walk, duck, jump, block, light/heavy attacks, sweeps, throws, specials and a light-to-heavy combo.
- Meter-costed, interruptible psyche-outs with original fourth-wall subtitles.
- First to two wins, KO/timeout/draw, bounded rounds, result screen, pause and rematch.
- Remappable keyboard controls, reduced motion, optional hitbox display, flash/shake off by default.
- Deterministic 60 Hz simulation, replay export/verification and offline reload after the first successful cache.
- Static HTML/CSS/Canvas 2D/JavaScript; **zero production dependencies or remote assets**.

No audio, touch controls, gamepads, network multiplayer or tournament-grade balancing yet. The CPU is a deterministic practice opponent, not an adaptive AI service. See the [tested evidence and limitations](docs/LBL-001-EVIDENCE.md).

## Play and develop

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Select both fighters and the opponent mode, then **Enter the pit**. The field manual inside the game lists and remaps every key. No build or package installation is needed to play.

```sh
npm run verify                  # dependency-free checks, tests and staging
npm ci --ignore-scripts         # only for browser testing
npx playwright install --with-deps chromium firefox webkit
npm run browser
```

Node.js 22+ is test/build tooling only. Browser checks serve the actual staged build under `/LOWBLOWLEGENDS/`.

## Project contract

**Correctness outranks speed. Gameplay outranks the joke. Comedy never overrides fair combat.**

Read [AGENTS.md](AGENTS.md), [invariants](docs/INVARIANTS.md), [architecture](docs/ARCHITECTURE.md), [move data](docs/MOVE_DATA.md), [rights review](docs/ASSETS_AND_RIGHTS.md), and [roadmap](docs/ROADMAP.md). Quick links: [getting started](GETTING_STARTED.md) · [player instructions](INSTRUCTIONS.md) · [game vision](docs/GAME_DESIGN.md).

The original reference kernel and tests remain preserved, separate from the playable simulation. Every PR needs review of its exact final commit and human approval. Agents do not merge, push main, tag or release.

Code, original programmatic art and documentation use [Apache-2.0](LICENSE). No franchise assets, recognizable public figures, copied film dialogue or celebrity voices are included. Originality review is documented, not a guarantee of legal clearance.
