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


## ADR-005: LBL-001 playable implementation

`src/combat-core.mjs` and its nine tests remain the original preserved proof/reference. The production game is separate in `src/game/`: `simulation.mjs` implements the pure reducer, `content.mjs` is frozen move/character data, `timing.mjs` samples input at fixed deadlines, `cpu.mjs` supplies ordinary deterministic inputs, `render.mjs` draws original Canvas geometry, and `app.mjs` owns DOM/focus/replay controls. The old teaser script remains historical source, excluded from the deployed bundle.

The public simulation API is `initialState(config)`, `advance(state, [mask0, mask1])`, `stateDigest(state)`, `simulate(config, frames)` and `verifyReplay(record)`. Config and input are bounded; `advance` accepts states produced by this reducer, not arbitrary untrusted state objects. The versioned fixture is retained under `tests/fixtures/arcade-v1.json`. New rulesets need new fixtures; never overwrite an established fixture to conceal a mismatch.

Clock: fixed 60 Hz deadlines independent of rendering. Inputs are an ordered event queue, normalized to ten bits; opposing movement cancels. A press/release between render frames still appears in a logical frame. Wall-time gaps exceeding 250 ms simulate at most 15 ticks, discarding excess time rather than accumulating debt; extreme stalls slow the game. Pause/visibility/focus reset the adapter and clear keys. Replays retain the exact normalized frames actually simulated, including CPU frames, and exclude paused wall time. Rendered state updates at most once per logical tick, with no interpolation.

State phases are intro (90 ticks), fight, roundOver (150 ticks), and terminal matchOver. First to two wins; at most five rounds prevents indefinite draws. Round reset creates new bounded fighter state while retaining character selection and round score. Rendering never mutates simulation state. Input queues cap at 1,024 events and replay logs at 40,000 frames. No projectile/particle spawning is present.

`stateDigest` is an ordered-field 32-bit FNV diagnostic fingerprint, not a security primitive. Headless and browser fixtures compare the same inputs/version. Tests establish the specific engine versions recorded in evidence, not all JavaScript implementations. Retain the fixture's SHA-256 separately for file integrity.

`sw.js` caches only explicit runtime URLs within its registration scope. Cache names include the scope to avoid touching sibling projects. Bump its cache version whenever runtime bytes change; old versions activate after old tabs close. No forced mid-match reload. Registration/cache denial has a visible fallback message. The static local-server copy remains offline usable. Service workers require HTTPS or localhost; `file:` is unsupported.

The production package contains HTML/CSS, six small game modules, the worker and `.nojekyll`; no fonts, image downloads, audio, analytics, dependencies or test fixtures. Playwright is a pinned Apache-2.0 **test-only** dependency; its installed licence was inspected, lockfile integrity retained, and package install scripts disabled. CI downloads browsers separately on Ubuntu 24.04. Browser packages are not distributed by this project.
