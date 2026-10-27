# Core invariants — LBL contract v1

These are **normative project requirements**, not aspirational feature requests. An agent must explicitly identify and request human approval before changing any invariant. A green test suite does not waive a policy or rights requirement. Target numeric balance parameters may evolve through reviewed changes; the properties listed here may not.

| ID | Non-negotiable requirement | Minimum evidence / acceptance criterion |
| --- | --- | --- |
| **LBL-001 — Truth** | Never present a mock-up, teaser, placeholder, unverifiable claim or planned feature as implemented gameplay. | README and PR state completed, tested, pending and blocked items separately. |
| **LBL-002 — Originality** | All production character identities, costumes, names, silhouettes, voices, dialogue, arenas and animation must be independently original or permissibly licensed. Avoid substantially similar combined identities and distinctive signature moves. | Human-facing originality review and asset inventory; not a claim of guaranteed legal safety. |
| **LBL-003 — Rights** | No asset enters a distributed build without traceable origin, allowed use, required attribution and licence compatibility. | Per-asset manifest, retained licence texts when required; provenance check before packaging. |
| **LBL-004 — Logical clock** | Combat simulation runs at a fixed **60 Hz** logical step; real-time render cadence does not define hit timing. | Automated repeatable tests across different render scheduling patterns. |
| **LBL-005 — Deterministic state** | Given equivalent initial state, normalized ordered inputs, version and seed, simulation produces equivalent state transitions in the defined tested runtime scope. No `Math.random` / wall time in combat state updates. | Replay fixture / identical state digest on multiple runs; scope of cross-platform guarantees documented. |
| **LBL-006 — Fair resolution** | Both fighters are resolved using a documented, order-independent simultaneous exchange policy; no hidden first-player attack priority. | Tests covering simultaneous strike, stun and victory resolution. |
| **LBL-007 — Bounded effects** | Stuns, buffs, psyche-outs, cooldowns and spawns are finite and cannot soft-lock a round. Input validation keeps values bounded. | Duration/recovery, malformed input and resource-bound tests. |
| **LBL-008 — Player agency** | The game never synthesizes or captures real-world input outside normal, consented game controls. Psyche-outs cannot freeze browser controls or deliberately make keyboard/controller hardware unresponsive. | Tests for telegraph/counterplay in the game simulation; manual controls review. |
| **LBL-009 — Competitive clarity** | Attacks and taunts have readable telegraphs, costs, counterplay and recovery. Jokes do not hide critical hitboxes or defeat cues. | Playtesting and documented move data; both players can understand outcomes. |
| **LBL-010 — Static and private** | Production is usable as a static browser application without an account, external service, telemetry, advertising or remote AI dependency. | Network audit and offline smoke test before release. |
| **LBL-011 — No gratuitous bloat** | Keep the runtime minimal; any added dependencies, engine layers, build steps or larger assets must serve a stated measured purpose. | PR lists dependency, size and performance impact; no mandatory runtime package ecosystem. |
| **LBL-012 — Comfort and access** | Gameplay release supports remappable inputs, keyboard use, subtitles, readable contrast, scalable HUD and reduced flash/shake modes. | Browser and manual accessibility checklist; no unavoidable rapid flashing. |
| **LBL-013 — CI before claims** | Required tests run on the exact PR head. Never silence, skip or delete a failing check to get green. | CI logs and local commands in PR; explicit remaining failures. |
| **LBL-014 — Human gate** | Every PR requires specific final-commit review and human approval for merge; no autonomous main push, merge, release or tag. | PR SHA, review and maintainer-controlled merge history. |
| **LBL-015 — Respectful satire** | Satirize fictional egos and behaviours without hate speech, slurs against protected groups, harassment of real people, or claims that parody eliminates all IP/likeness risks. | Creative/editorial review of dialogue, roster and promotional content. |
| **LBL-016 — Preservation** | Preserve verified replay fixtures and release artefacts; record intentional changes to deterministic behaviour. Do not silently rewrite immutable baselines. | Versioned fixtures, change notes and reviewed migration evidence. |

## Resolution contract

- The game is **1v1** for the first playable slice. A local practice mode and later multiplayer are optional.
- Normalize both players' inputs before updating state.
- Derive intent from the same prior-tick snapshot; resolve simultaneous hits without loop-order bias.
- Apply effects in an explicit, documented order, then clamp bounded integer resources.
- Stun recovery and cooldown advancement must not depend on render FPS or real-world time.
- Use integer gameplay ticks and stable integer or quantized arithmetic where feasible. No unqualified bit-for-bit cross-platform promise.
- A round's completion is explicit (KO, timeout or intentional draw); actors never silently become immortal.

## Change-control rules

Changing gameplay balance (e.g. a 12-frame startup) is ordinary reviewable work. Removing reproducibility, fairness, provenance, player agency, or human review is **not** ordinary balance work and requires an independently scoped maintainer-approved invariants revision.

**Precedence:** if a task or source asset conflicts with these invariants, keep the last valid version, explain the conflict, and propose a compliant alternative.

