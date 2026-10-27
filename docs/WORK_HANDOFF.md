# ChatGPT Work handoff — LOW BLOW LEGENDS

**Send this file's mission section to ChatGPT Work after the foundation PR is merged.**

## Authority and source of truth

The repository is `https://github.com/QSOLKCB/LOWBLOWLEGENDS`. Read `AGENTS.md`, `docs/INVARIANTS.md`, `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/ASSETS_AND_RIGHTS.md` and `docs/ROADMAP.md` before making a single gameplay edit.

The **current site is a pre-production teaser, not a game**. A tested reference reducer is only an invariant proof. The mission is to turn this into a playable game, not to relabel the teaser.

## Work mission: LBL-001 — v0.1.0 arcade combat vertical slice

You are the lead engineer, game designer and test engineer for QSOL-IMC's LOW BLOW LEGENDS. Implement a genuinely entertaining original browser-based 2D fighting game: two original playable fighters, one stage, health/time/rounds, fair attacks/blocks, input mapping, genuine game-over conditions and a punishable psyche-out mechanic with fourth-wall dialogue.

Retain the project's *genre-wide* arcade inspiration but import **no** protected fighter IP, famous-person lookalikes, movie dialogue, copyrighted game assets or celebrity voices. Make original silhouettes and dialogue. Keep the fighting mechanically serious, the commentary outrageous, and every joke legible and non-obstructive.

Use a deterministic fixed-step 60 Hz state machine with normalized inputs, clear order-independent simultaneous strikes, finite stuns and replay verification. Keep the web runtime static, offline-capable, private and deliberately lightweight. Test in a real browser and headless harness. Build on repository-relative URLs compatible with GitHub Pages.

### Required working deliverable

A human can load the game, select two characters, play an actual match to KO or timeout, see the result, and restart. Basic special moves and one working psyche-out per fighter must be real simulation state changes, not cosmetic dialogue. Provide clear keyboard controls and help.

### Required PR evidence

- Exact final commit SHA, changes and known limitations.
- Tests executed and outcomes; deterministic replay evidence.
- Browser smoke tests including input, pause/resume and victory.
- Assets ledger and originality/rights review.
- Accessibility, performance and privacy checks.
- Screenshot and hosted preview only where actually verified.
- Next-step roadmap and honest status of partial features.

### Operating permissions

Implement and commit **only on a topic branch** in LOWBLOWLEGENDS. Open a PR. Obtain Codex review of the exact final head commit where possible; if any code changes after review, repeat checks and review. Do not merge, write to main, publish/tag a release, or claim Pages deployment before verification. The human maintainer handles integration.

### Stop conditions

If licences, a required capability, browser tests, or a legal design judgement cannot be verified, do not invent a positive outcome. Keep an honest working subset, log blockers and hand back a reviewable PR. Do not quietly relax core invariants to finish faster.

