// Original geometric characters, names and dialogue authored for LBL-001.
export const FIGHTERS = Object.freeze({
  ledger: Object.freeze({ name: 'LEDGER', title: 'Warranty enforcement', color: '#edc77d', speed: 6,
    psyche: 'Terms & concussions', special: 'Carbon-copy lunge',
    taunt: 'Your controller has declined responsibility for this performance.',
    win: 'I have itemised your defeat. The embarrassment is complimentary.' }),
  clinker: Object.freeze({ name: 'CLINKER', title: 'Unlicensed pressure vessel', color: '#b4a4ca', speed: 4,
    psyche: 'Mandatory tutorial', special: 'Pressure release',
    taunt: 'Hold on. The tutorial says you are the practice dummy.',
    win: 'That was my finishing move. The rest of the budget went on this text box.' }),
});
export const VERSION = 'lbl-arcade-1';
export const B = Object.freeze({ left: 1, right: 2, jump: 4, down: 8, light: 16, heavy: 32,
  block: 64, special: 128, psyche: 256, throw: 512 });
export const ACTIONS = Object.freeze(Object.keys(B));
// startup, active, recovery, range, bottom, top, damage, stun, push (world units).
const move = (startup, active, recovery, range, bottom, top, damage, stun, push) =>
  Object.freeze({ startup, active, recovery, range, bottom, top, damage, stun, push });
export const MOVES = Object.freeze({
  light: move(5, 3, 12, 100, 42, 88, 7, 23, 10),
  heavy: move(12, 4, 23, 126, 38, 148, 13, 27, 24),
  low: move(11, 4, 23, 120, 0, 38, 11, 25, 18),
  air: move(7, 4, 19, 106, 0, 92, 10, 24, 14),
  throw: move(8, 1, 28, 64, 0, 110, 15, 30, 70),
  ledgerSpecial: move(16, 5, 24, 182, 40, 96, 16, 29, 32),
  clinkerSpecial: move(14, 5, 28, 108, 0, 222, 18, 30, 38),
  ledgerPsyche: move(32, 1, 28, 224, 0, 115, 0, 48, 0),
  clinkerPsyche: move(38, 1, 30, 194, 0, 115, 0, 54, 0),
});
