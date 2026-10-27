# Technical architecture and decision records

## ADR-001: Browser-native static architecture — accepted baseline

Runtime: HTML5 + CSS + vanilla JavaScript + **Canvas 2D by default**. Work may choose WebGL2 if measured presentation requirements justify it; document the trade-off first. No heavyweight runtime framework or mandatory backend.

GitHub Pages path: `/LOWBLOWLEGENDS/`; all assets and links must be relative to the project path. Serve all distributed media locally, not by hotlink.

Node.js 22+ is allowed for tests and packaging **only**. No installed npm packages are required for the pre-production foundation.

## ADR-002: Deterministic simulation — accepted baseline

Use a fixed logical step (60 Hz), collect/normalize timestamped input into logical ticks, and render separately with interpolation if needed. Gameplay uses ticks, not `Date.now`, frame delta, or unconstrained randomness.

A future core should expose:

- `initialState(config, seed)`: fresh, bounded state with version recorded.
- `advance(state, [player1Input, player2Input])`: a pure state transition that never mutates the supplied state.
- `stateDigest(state)`: stable versioned digest of gameplay-relevant fields for replay checking.
- `simulate(seed, orderedInputs)`: offline headless reproduction.

The first checked-in `src/combat-core.mjs` is a **minimal reference contract**, not a released fighter and not a demand to preserve its particular move frame data. It intentionally uses simple integer positions and moves. Do not couple real rendering to this test double.

## ADR-003: Order-independent exchange — accepted baseline

Each tick's attacker eligibility and range calculations must use an agreed snapshot; both successful strikes should land if both are valid, independent of iteration order. Resolve KO/draw after applying the simultaneous transaction. Psyche-out application likewise requires explicit ordering and fairness tests.

## ADR-004: Creative and rights provenance — accepted baseline

Each external resource requires a source URL, human-readable author/rights holder, licence, terms verification date, attribution and local project path. Track removals and replacements. No guessed licences.

## Proposed future modules (not yet implemented)

- `src/simulation/` — normalized inputs, state reducer, move/frame-data definitions, hitboxes/hurtboxes, combat, deterministic replay.
- `src/render/` — sprite sheets, scene compositor, effects, animation and HUD.
- `src/input/` — keyboard/gamepad mapping, rebinding, focus/pause handling.
- `src/audio/` — local sound effects, accessibility/subtitles.
- `src/content/` — original fighters, stages, narration and dialogue.
- `tests/` — simulation tests, replay fixtures, browser smoke/a11y tests.

Proposed directories are conceptual. Do **not** scaffold dozens of empty directories just to look complete.

## Threats to correctness

- Variable frame time changes move outcomes.
- Using floating-point accumulation for hitstun/cooldown across devices.
- A render callback also mutates gameplay state.
- First-player loop-order wins exchanges.
- Stun or input loss lasts forever.
- Substituting a licensed asset with a recognizably derivative copy.
- Unbounded sprites, particles, spawn loops or external asset fetches.
- Broken repository-relative URLs after GitHub Pages deployment.

Every risk needs a focused regression or a documented human review gate before claiming completion.

