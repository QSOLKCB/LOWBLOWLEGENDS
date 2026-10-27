// LOW BLOW LEGENDS — small pure reference kernel, NOT the finished game.
// No DOM, wall clock, network, random APIs, or floating-time integration.
export const TICKS_PER_SECOND = 60;
export const RULESET_VERSION = 1;
const ARENA_MIN = 0, ARENA_MAX = 1024, WALK_STEP = 5;
const PUNCH_RANGE = 92, PSYCHE_RANGE = 160;
const PUNCH_DAMAGE = 12, BLOCKED_DAMAGE = 3;
const PUNCH_COOLDOWN = 14, PSYCHE_COST = 40;
const PSYCHE_COOLDOWN = 120, PSYCHE_STUN = 18;

const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));
const boundedInteger = (n, fallback, lo, hi) =>
  Number.isSafeInteger(n) ? clamp(n, lo, hi) : fallback;

// Fixed-point positions and integer ticks are intentional for replay clarity.
export function createMatch({ seed = 1, timerSeconds = 99 } = {}) {
  const seconds = boundedInteger(timerSeconds, 99, 1, 180);
  return {
    version: RULESET_VERSION,
    seed: boundedInteger(seed, 1, 0, 0xffffffff),
    tick: 0,
    timerTicks: seconds * TICKS_PER_SECOND,
    status: 'active',
    winner: null,
    fighters: [
      { id: 0, x: 400, health: 100, meter: 0, stunTicks: 0, attackCooldown: 0, psycheCooldown: 0 },
      { id: 1, x: 624, health: 100, meter: 0, stunTicks: 0, attackCooldown: 0, psycheCooldown: 0 },
    ],
  };
}

// All control values are normalised, so unexpected input is not passed into state.
export function normalizeInput(input) {
  const i = input && typeof input === 'object' ? input : {};
  const movement = typeof i.move === 'number' && Number.isFinite(i.move)
    ? Math.sign(i.move) : 0;
  return {
    move: movement,
    attack: i.attack === true,
    block: i.block === true,
    psyche: i.psyche === true,
  };
}

// Simultaneous attacks resolve from one post-movement snapshot.
// A stun applied on this tick does not retroactively cancel a valid hit.
export function advance(state, rawInputs = []) {
  if (state.status !== 'active') return state;
  const old = state.fighters;
  const inputs = [normalizeInput(rawInputs?.[0]), normalizeInput(rawInputs?.[1])];
  const next = old.map(f => ({
    ...f,
    stunTicks: Math.max(0, f.stunTicks - 1),
    attackCooldown: Math.max(0, f.attackCooldown - 1),
    psycheCooldown: Math.max(0, f.psycheCooldown - 1),
  }));
  const canAct = old.map(f => f.stunTicks === 0);
  for (let i = 0; i < 2; i++) {
    if (canAct[i] && !inputs[i].block) {
      next[i].x = clamp(old[i].x + WALK_STEP * inputs[i].move, ARENA_MIN, ARENA_MAX);
    }
  }
  const distance = Math.abs(next[0].x - next[1].x);
  const intent = inputs.map((input, i) => {
    if (!canAct[i]) return 'none';
    if (input.psyche && old[i].psycheCooldown === 0 && old[i].meter >= PSYCHE_COST) return 'psyche';
    if (input.attack && old[i].attackCooldown === 0) return 'attack';
    return input.block ? 'block' : 'none';
  });

  // All damage and stun are collected BEFORE changing health.
  const damage = [0, 0], appliedStun = [0, 0], hit = [false, false];
  for (let i = 0; i < 2; i++) {
    const opponent = 1 - i;
    if (intent[i] === 'attack') {
      next[i].attackCooldown = PUNCH_COOLDOWN;
      if (distance <= PUNCH_RANGE) {
        damage[opponent] += intent[opponent] === 'block' ? BLOCKED_DAMAGE : PUNCH_DAMAGE;
        hit[i] = true;
      }
    }
    if (intent[i] === 'psyche') {
      next[i].meter -= PSYCHE_COST;
      next[i].psycheCooldown = PSYCHE_COOLDOWN;
      if (distance <= PSYCHE_RANGE) appliedStun[opponent] = Math.max(appliedStun[opponent], PSYCHE_STUN);
    }
  }
  for (let i = 0; i < 2; i++) {
    next[i].health = clamp(old[i].health - damage[i], 0, 100);
    next[i].meter = clamp(next[i].meter + (hit[i] ? 12 : 0), 0, 100);
    next[i].stunTicks = Math.max(next[i].stunTicks, appliedStun[i]);
  }
  const timerTicks = Math.max(0, state.timerTicks - 1);
  let status = 'active', winner = null;
  if (next[0].health === 0 || next[1].health === 0) {
    status = 'ko';
    if (next[0].health > next[1].health) winner = 0;
    if (next[1].health > next[0].health) winner = 1;
  } else if (timerTicks === 0) {
    status = 'timeout';
    if (next[0].health > next[1].health) winner = 0;
    if (next[1].health > next[0].health) winner = 1;
  }
  return {
    version: state.version,
    seed: state.seed,
    tick: state.tick + 1,
    timerTicks, status, winner, fighters: next,
  };
}

export function simulate(seed, frames, timerSeconds = 99) {
  let state = createMatch({ seed, timerSeconds });
  for (const frame of frames) state = advance(state, frame);
  return state;
}

// Stable small diagnostic fingerprint, not a cryptographic integrity check.
// Only known ordered fields participate; no JSON object-key ordering assumptions.
export function stateDigest(s) {
  const tuple = [s.version, s.seed, s.tick, s.timerTicks, s.status, s.winner];
  for (const f of s.fighters) {
    tuple.push(f.id, f.x, f.health, f.meter, f.stunTicks, f.attackCooldown, f.psycheCooldown);
  }
  const bytes = new TextEncoder().encode(JSON.stringify(tuple));
  let hash = 2166136261;
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619) >>> 0;
  return hash.toString(16).padStart(8, '0');
}

