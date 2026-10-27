# Rights, originality and provenance policy

**This is a conservative engineering checklist, not legal advice or a guarantee against claims.**

## No "change the hat" clones

LOW BLOW LEGENDS is inspired by broad fighting-game genres and irreverent character archetypes, **not** an unauthorised roster of renamed celebrities or lightly modified franchise fighters.

Reject character designs whose **combined** silhouette, costume, hairstyle, colour blocking, name, moves, mannerisms, voice or catchphrases strongly identify a known person or protected character. Changing a few details does not guarantee legal clearance. Prefer fully original designs and fictional histories.

Do not import original game sprites, announcer samples, arena art, fonts, special-move sound effects, trademarks, signature animations or ripped assets from other fighting games. Do not use synthesized celebrity voices/likenesses.

When in doubt, develop an independently original option or obtain express rights and maintainer approval.

## Asset ledger

For every third-party asset, record a row before distribution:

| File(s) | Author / owner | Source URL | Licence and verification date | Modifications | Required credit | Review status |
| --- | --- | --- | --- | --- | --- | --- |
| _None imported in pre-production scaffold_ | — | — | — | — | — | — |

- Keep original licence text and attribution where required.
- Check that any licence permits redistribution, derivatives and the intended public deployment.
- Do not assume that a directory of "free game assets" confers rights to each listed item.
- Do not infer rights from a download button or AI output alone.
- Assets that require external permission must not ship while permission is pending.
- Store sources and hashes in a machine-readable manifest when actual asset integration starts.
- Maintain Apache-2.0 notices for code and separate licences for third-party assets.

## Content boundaries

Aim satire at fictional institutions and behaviour, not protected characteristics or identifiable private individuals. Avoid defamatory factual allegations about real people, misleading endorsements and unnecessary graphic violence. Groin-kick jokes and self-aware non-graphic anticlimaxes are allowed creative directions; no gore is required for the concept.

## Release review

A release PR includes the licence ledger, proof of the rights review, provenance manifest and explicit acknowledgement of unresolved legal/design risks. A programmatic scan is useful but cannot replace human judgement about resemblance or fair use.


## LBL-001 original production inventory and review — 27 October 2026

| File(s) | Author / owner | Source | Licence | Modifications / credit | Review status |
| --- | --- | --- | --- | --- | --- |
| `src/game/render.mjs` | QSOL-IMC project; AI-assisted original implementation | Repository-authored Canvas geometry | Repository Apache-2.0 | Original Ledger/Clinker poses, stage, UI glyphs; no imported media | Engineering/editorial check completed; maintainer visual sign-off pending |
| `src/game/content.mjs` | QSOL-IMC project; AI-assisted original writing | Repository-authored identities, move names and dialogue | Repository Apache-2.0 | New fictional characters; no celebrity voice or film quotation | Engineering/editorial check completed; no formal trademark clearance claimed |
| `index.html`, `style.css` | QSOL-IMC project; AI-assisted original implementation | Repository-authored layout, copy and style | Repository Apache-2.0 | Native system-font stacks; no bundled font files | No external artwork, branding pack or proprietary typeface imported |
| `docs/evidence/*.png` | QSOL-IMC project; automated browser capture | Locally served staged game | Repository Apache-2.0 | Unaltered browser screenshots; documentation only | Captured and visually inspected; not distributed in runtime |

The machine-readable [asset manifest](ASSET_MANIFEST.json) records original asset-source SHA-256 values. `npm run check` verifies those values before packaging. The existing third-party ledger remains empty: **no third-party production asset was introduced**. Programmatic geometry is the artwork; there are no sprite packs, image-generation outputs, synthesized voices, samples or music. Browser-provided system fonts remain browser/OS resources rather than redistributed files.

Combined-design review: Ledger has a perforated receipt head, asymmetrical paper coat, filing-strip details and warranty-inspector motivation. Clinker is a broad ceramic kiln body with off-centre chimney, pressure gauge and furnace slit. Their proportions, geometric faces, costumes, names, colours, jokes and animations were composed together for this project without a franchise or public-figure reference. The Arbitration Pit is a fictional municipal grievance room. Generic punches, sweeps, throws and an uppercut express genre mechanics without importing signature audiovisual choreography.

Dialogue targets the fictional fighter, imaginary bureaucracy and the game/controller. Reviewed text contains no real-person allegations, slurs, celebrity mannerisms, film dialogue, protected-character names or copied announcer samples. The original foundation's illustrative finisher quotes are design notes, not runtime script: the game uses new text in `content.mjs` and `app.mjs`.

This review records process and observed design, not a legal opinion or a guarantee that a short name is globally unique. No close-call imitation was intentionally retained pending permission. Maintainer approval and any desired professional trademark/design clearance remain external to an automated engineering review.

Test tooling: Playwright / playwright-core 1.51.1 use Apache-2.0, verified from the installed package licence and exact npm lockfile. The optional macOS `fsevents` lockfile entry is MIT and does not ship in the game. Browser engines and their third-party notices remain upstream-installed test tools; `_site` never bundles them. They only open the locally served project during these tests.
