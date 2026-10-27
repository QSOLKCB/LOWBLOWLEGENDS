# Player instructions

Choose both fighters (mirror matches are allowed), select **CPU sparring partner** or **Local player 2**, choose a round clock, then enter the pit. First to two wins. A KO ends a round; timeout compares remaining health. Equal health is a draw and awards no win. After five rounds, the higher round score wins, or the match is drawn.

| Action | Player 1 | Player 2 |
| --- | --- | --- |
| Left / right | A / D | Left / Right |
| Jump / crouch | W / S | Up / Down |
| Light / heavy | F / G | J / K |
| Block | H | L |
| Special | R | U |
| Psyche-out | T | I |
| Throw | Y | O |
| Pause / resume | Escape | Escape |

Tap attacks; holding them never auto-repeats. Movement and guard use held keys. Every gameplay binding is remappable in the field manual. Duplicate assignments are rejected. Escape cancels a remap; starting, resuming or rematching also cancels unfinished remaps; Tab and browser shortcuts retain normal navigation. Key bindings alone are saved locally. Keyboard ghosting varies by hardware; change conflicting bindings if simultaneous controls fail.

- **Light → heavy:** land a light, then tap heavy during the confirmation window. It cancels light recovery into a true two-hit combo.
- **Down + heavy:** low sweep defeats standing guard. Hold down + block to defend it.
- **Throw:** defeats close guard; escape by jumping or leaving range. No grabbing stunned/airborne opponents.
- **Ledger special:** a long, punishable carbon-copy lunge. **Clinker special:** pressure-release uppercut with anti-air reach.
- **Psyche-out:** costs 50 ego immediately, including on a miss or interruption. A visible windup leaves you exposed. It briefly stuns an unguarded opponent in range; Ledger also drains 20 ego. Block, jump out of its height, back away or interrupt the windup. Cooldown is three simulated seconds.
- Light/heavy hits earn 12 ego; taking a damaging hit earns 6. Maximum 100. Each round starts at 50. Blocking takes no chip damage.

The HUD shows health, timer, round wins and ego. Subtitles sit outside the fighting area; victory has its own result screen. The overlay offers rematch or fighter selection. Focus loss pauses and clears held controls; resume explicitly. The field manual can be opened during a pause.

Flash and shake default off. Reduced-motion preference disables idle animation. You can toggle subtitles, small impact markers, gentle shake and collision bounds. No sound is shipped yet. A keyboard is required, even on a narrow/mobile screen. Screen-reader-accessible menus and results are provided, but combat is visual and has not been certified for nonvisual play.

**Verify & save replay** freezes an active match, recomputes the complete normalized input log, and downloads JSON only after its digest matches. **Check saved replay** verifies a file locally (2 MB / 40,000 ticks maximum). Replays are diagnostic, not cryptographic attestations; altered logs can be given a new checksum.
