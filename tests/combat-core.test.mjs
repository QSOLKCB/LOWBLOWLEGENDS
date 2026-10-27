import test from 'node:test';
import assert from 'node:assert/strict';
import { TICKS_PER_SECOND, createMatch, advance, normalizeInput, simulate, stateDigest } from '../src/combat-core.mjs';

const closeMatch = () => {
  const s = createMatch();
  return { ...s, fighters: s.fighters.map((f, i) => ({ ...f, x: i ? 535 : 465 })) };
};

test('fixed 60 Hz logical clock and finite countdown', () => {
  assert.equal(TICKS_PER_SECOND, 60);
  let s = createMatch({ timerSeconds: 1 });
  for (let n = 0; n < 60; n++) s = advance(s, [{}, {}]);
  assert.equal(s.tick, 60);
  assert.equal(s.timerTicks, 0);
  assert.equal(s.status, 'timeout');
  assert.equal(s.winner, null);
  assert.strictEqual(advance(s, [{ attack: true }, {}]), s);
});

test('pure reducer does not mutate prior state', () => {
  const s = closeMatch();
  const json = JSON.stringify(s);
  const n = advance(s, [{ attack: true }, { attack: true }]);
  assert.equal(JSON.stringify(s), json);
  assert.notEqual(n, s);
  assert.notEqual(n.fighters[0], s.fighters[0]);
});

test('both players trade attacks with no privileged iteration order', () => {
  const n = advance(closeMatch(), [{ attack: true }, { attack: true }]);
  assert.equal(n.fighters[0].health, 88);
  assert.equal(n.fighters[1].health, 88);
  assert.equal(n.fighters[0].meter, 12);
  assert.equal(n.fighters[1].meter, 12);
});

test('block reduces incoming attack damage', () => {
  const n = advance(closeMatch(), [{ attack: true }, { block: true }]);
  assert.equal(n.fighters[1].health, 97);
});

test('two simultaneous finishing strikes lead to a draw', () => {
  const s = closeMatch();
  s.fighters[0].health = 12;
  s.fighters[1].health = 12;
  const n = advance(s, [{ attack: true }, { attack: true }]);
  assert.equal(n.status, 'ko');
  assert.equal(n.winner, null);
});

test('psyche-out consumes meter, has cooldown, and releases victim after finite ticks', () => {
  const s = closeMatch();
  s.fighters[0].meter = 80;
  const stunned = advance(s, [{ psyche: true }, { move: -1, attack: true }]);
  assert.equal(stunned.fighters[1].stunTicks, 18);
  assert.equal(stunned.fighters[0].meter, 40);
  assert.equal(stunned.fighters[0].psycheCooldown, 120);
  // A valid opposing attack on the same tick still connects.
  assert.equal(stunned.fighters[0].health, 88);
  const heldX = stunned.fighters[1].x;
  let now = stunned;
  for (let i = 0; i < 18; i++) {
    now = advance(now, [{ psyche: true }, { move: -1, attack: true }]);
    assert.equal(now.fighters[1].x, heldX);
  }
  assert.equal(now.fighters[1].stunTicks, 0);
  assert.equal(now.fighters[0].psycheCooldown, 102);
  const freed = advance(now, [{}, { move: -1 }]);
  assert.equal(freed.fighters[1].x, heldX - 5);
});

test('out-of-range psyche-out is a bounded whiff, not an infinite area stun', () => {
  const s = createMatch();
  s.fighters[0].meter = 40;
  const n = advance(s, [{ psyche: true }, {}]);
  assert.equal(n.fighters[0].meter, 0);
  assert.equal(n.fighters[0].psycheCooldown, 120);
  assert.equal(n.fighters[1].stunTicks, 0);
});

test('movement is integer bounded and malformed input cannot inject NaN', () => {
  const a = normalizeInput({ move: Number.NaN, attack: 1, block: 'yes' });
  assert.deepEqual(a, { move: 0, attack: false, block: false, psyche: false });
  let s = createMatch();
  for (let i = 0; i < 250; i++) s = advance(s, [{ move: -999 }, { move: +999 }]);
  assert.equal(s.fighters[0].x, 0);
  assert.equal(s.fighters[1].x, 1024);
});

test('replay yields same deterministic digest and state for identical inputs', () => {
  const frames = Array.from({ length: 200 }, (_, i) => [
    { move: 1, attack: i % 19 === 0, psyche: i % 43 === 0 },
    { move: -1, block: i % 23 === 0, attack: i % 29 === 0 },
  ]);
  const a = simulate(2026, frames), b = simulate(2026, frames);
  assert.deepEqual(a, b);
  assert.equal(stateDigest(a), stateDigest(b));
  assert.match(stateDigest(a), /^[0-9a-f]{8}$/);
});

