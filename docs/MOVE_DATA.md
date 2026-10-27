# Playable move data — ruleset `lbl-arcade-1`

All durations are 60 Hz combat ticks, excluding hitstop. Starting a move records frame 0. The first active contact occurs when its frame reaches `startup`; then active and recovery frames follow. An action is processed once per press, with a 6-tick input buffer (held during hitstop). Range extends from the fighter centre in the committed facing direction; hurtboxes extend 26 units either side. View exact collision bounds in the field manual. No character has invincibility or a hidden priority bonus.

| Move | Startup | Active | Recovery | Range | Damage | Hitstun |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Light | 5 | 3 | 12 | 100 | 7 | 23 |
| Heavy / anti-air | 12 | 4 | 23 | 126 | 13 | 27 |
| Crouching heavy / low sweep | 11 | 4 | 23 | 120 | 11 | 25 |
| Air attack | 7 | 4 | 19 | 106 | 10 | 24 |
| Throw | 8 | 1 | 28 | 64 | 15 | 30 |
| Ledger: Carbon-copy lunge | 16 | 5 | 24 | 182 | 16 | 29 |
| Clinker: Pressure release | 14 | 5 | 28 | 108 | 18 | 30 |
| Ledger: Terms & concussions | 32 | 1 | 28 | 224 | 0 | 48 |
| Clinker: Mandatory tutorial | 38 | 1 | 30 | 194 | 0 | 54 |

Ledger walks 6 units/tick; Clinker walks 4. Jump starts at velocity 20, gravity 1; the integer arc lands after 41 ticks. There is no air steer during an attack. Automatic facing updates only in neutral; committed attacks can be crossed over. Grounded bodies push apart, including at walls, without slot priority. Fractional collision midpoints round toward the stage centre, retaining integer coordinates and mirror symmetry.

Both psyche-outs cost 50 ego, have 180-tick cooldown, can be blocked with either guard and can be interrupted throughout startup/recovery. Ledger additionally drains 20 opponent ego on success. Both need grounded startup and only reach 115 units above the attacker, so a correctly timed jump avoids them. Their different reach/startup/stun create different commitments. They alter avatars only.

Guards block normal, air and special attacks; only crouch guard blocks low sweeps. Throws beat both guards but cannot grab airborne or already-stunned targets. Blocks cause 9 ticks of guardstun and 3 of hitstop (psyche blocks have neither); damaging contacts cause 4 hitstop. No chip damage. Hitstun and knockback stop indefinite light chains; only confirmed light may cancel into heavy (15-tick window). Attacks connect at most once per execution.

All contacts are derived from the same post-intent, post-movement snapshot. Valid simultaneous hits trade, including strike/psyche and throw/throw. Incoming hits cancel outgoing recovery but never retroactively remove an already-derived contact. Meter gains/costs/drains are summed once before clamping. KO is checked after the whole transaction; double KO draws. Timer stops during intros, hitstop, round results and pause. Timeout is resolved after contacts on its last tick; KO takes reason precedence.

Balance is preliminary. The optional CPU reads current state only and uses deterministic periodic decisions. Its pattern can be exploited; it has no future-input access and is not tournament AI.
