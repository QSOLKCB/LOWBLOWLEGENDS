# Agent instructions — LOW BLOW LEGENDS

**Read this file before touching code, assets, prose, Pages configuration or CI.**

This is the standing instruction set for ChatGPT Work, Codex and other engineering assistants. If a task conflicts with this contract, stop the conflicting action and report the exact conflict to the maintainer. No implied permission to weaken a gate.

## Order of authority

1. Applicable law, licences, platform rules and user safety requirements.
2. Maintainer's explicit project-specific instructions.
3. [docs/INVARIANTS.md](docs/INVARIANTS.md) (non-negotiable project contract).
4. This file and [docs/ASSETS_AND_RIGHTS.md](docs/ASSETS_AND_RIGHTS.md).
5. Scoped implementation plans, tickets and optional stylistic guidance.

Project invariants cannot be weakened by quietly editing documentation or a test. A proposed change to an invariant requires a separate, explicitly approved PR.

## Mission and tone

Build a **genuinely good** 2D fighter with classic arcade responsiveness, accessible controls, distinct **wholly fictional** fighters, and outrageous fourth-wall-breaking comedy. Genre references are inspirations, **not reusable character, costume, sound, logo, animation, move-name, signature pose or dialogue assets**.

Never imply a public figure or franchise owns, endorses or appears in the game. Avoid near-copies in aggregate, even if each individual detail was slightly modified. Do not synthesize recognizable celebrity voices.

The combat should be skill-based and legible. Psyche-outs are intentional game actions with declared startup, range, cost, duration, counterplay and recovery. Do not hijack the player's actual keyboard/controller, browser or OS.

## Engineering rules

- Browser-native HTML, CSS and JavaScript; static GitHub Pages deployment, offline-capable assets.
- No server, account requirement, surveillance, advertising, cryptocurrency, forced online DRM or pay-to-win design.
- A deterministic **60 logical ticks per simulated second** for combat. Use explicit inputs, a defined resolution order and seeded PRNG only if randomness is required. Rendering may run at another frame rate.
- Put simulation state behind a testable interface, not in DOM event handlers or rendering code.
- Avoid mandatory runtime frameworks or toolchains. A new dependency requires a measured technical justification and licensing/security review.
- Validate asset provenance before importing; maintain rights metadata.
- No false claims: test only what actually ran; label prototypes and limitations.
- Accessibility and comfort: remappable controls, readable UI, subtitles, configurable flashing and shake are required before a gameplay release.

## Branch and review protocol

1. Inspect main and current open PRs before making changes.
2. Make a small scoped branch from the current main SHA.
3. Implement with regression tests; run relevant checks and document evidence.
4. Open a PR with exact SHA, change summary, test results, asset licence notes and known limitations.
5. Request Codex review where available; wait for a review explicitly accepting the **exact final commit**.
6. If the commit changes, re-run checks and request a fresh review.
7. Leave merge, main-branch deployment, semantic version tags and releases to the human maintainer.

**Never commit directly to main. Never self-merge, enable auto-merge or create a release on an agent's own authority.**

## Current baseline

The landing page is **not a playable fighter**. `src/combat-core.mjs` is a small reference kernel to prove important contracts and is deliberately not an approved full game design. ChatGPT Work may evolve or replace internals while preserving documented invariants and tests.

Before building the next gameplay PR, read [docs/WORK_HANDOFF.md](docs/WORK_HANDOFF.md), [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/ASSETS_AND_RIGHTS.md](docs/ASSETS_AND_RIGHTS.md), and [docs/ROADMAP.md](docs/ROADMAP.md).

