import { B, FIGHTERS, MOVES, VERSION } from './content.mjs';
export const HZ = 60;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const integer = (n, fallback, lo, hi) => Number.isSafeInteger(n) ? clamp(n, lo, hi) : fallback;
export function normalizeInput(input) {
  if (Number.isSafeInteger(input)) return input >= 0 ? input & 1023 : 0;
  if (!input || typeof input !== 'object') return 0;
  return Object.entries(B).reduce((n, [key, bit]) => n | (input[key] === true ? bit : 0), 0);
}
function fighter(character, id) {
  return { id, character, x: id ? 710 : 250, y: 0, vy: 0, facing: id ? -1 : 1,
    health: 100, meter: 50, stun: 0, guardStun: 0, move: '', frame: 0, connected: false,
    blocking: false, duck: false, lastInput: 0, buffer: 0, bufferTicks: 0,
    confirm: 0, combo: 0, lastHit: 0, psycheCooldown: 0 };
}
export function initialState(config = {}) {
  config = config && typeof config === 'object' ? config : {};
  const characters = [0, 1].map(i => Object.hasOwn(FIGHTERS, config.characters?.[i]) ? config.characters[i] : i ? 'clinker' : 'ledger');
  const seconds = integer(config.seconds, 60, 1, 99);
  return { version: VERSION, seed: integer(config.seed, 1, 0, 0xffffffff), seconds,
    tick: 0, phase: 'intro', phaseTicks: 90, round: 1, wins: [0, 0], timer: seconds * HZ,
    fighters: characters.map(fighter), hitstop: 0, winner: null, reason: '', events: [] };
}
export function hurtbox(f) {
  return { left: f.x - 26, right: f.x + 26, bottom: f.y, top: f.y + (f.duck ? 84 : 154) };
}
export function hitbox(f) {
  const m = MOVES[f.move];
  if (!m || f.frame < m.startup || f.frame >= m.startup + m.active) return null;
  return { left: f.x + (f.facing > 0 ? 0 : -m.range), right: f.x + (f.facing > 0 ? m.range : 0),
    bottom: f.y + m.bottom, top: f.y + m.top };
}
const overlaps = (a, b) => a && a.left <= b.right && a.right >= b.left && a.bottom < b.top && a.top > b.bottom;
const isPsyche = name => name.endsWith('Psyche');
function selectMove(bits, f) {
  if (bits & B.psyche) return f.y === 0 && f.meter >= 50 && f.psycheCooldown === 0 ? f.character + 'Psyche' : '';
  if (bits & B.special) return f.y === 0 ? f.character + 'Special' : '';
  if (bits & B.throw) return f.y === 0 ? 'throw' : '';
  if (bits & B.heavy) return f.y > 0 ? 'air' : f.duck ? 'low' : 'heavy';
  if (bits & B.light) return f.y > 0 ? 'air' : 'light';
  return '';
}
// Shared positional transaction; even world steps keep separation integral.
function separate(fs) {
  if (Math.abs(fs[0].y - fs[1].y) >= 90) return;
  const left = fs[0].x < fs[1].x || (fs[0].x === fs[1].x && fs[0].facing === 1) ? 0 : 1;
  const a = fs[left], b = fs[1 - left];
  if (b.x - a.x >= 56) return;
  const middle = (a.x + b.x) / 2;
  a.x = middle - 28; b.x = middle + 28;
  const shift = a.x < 40 ? 40 - a.x : b.x > 920 ? 920 - b.x : 0;
  a.x += shift; b.x += shift;
}
export function advance(s, raw = []) {
  if (s.phase === 'matchOver') return s;
  const inputs = [normalizeInput(raw?.[0]), normalizeInput(raw?.[1])];
  const n = { ...s, tick: s.tick + 1, wins: [...s.wins], events: [], fighters: s.fighters.map(f => ({ ...f })) };
  if (s.phase !== 'fight') {
    n.phaseTicks--;
    n.fighters.forEach((f, i) => { f.lastInput = inputs[i]; });
    if (n.phaseTicks <= 0) {
      if (s.phase === 'intro') n.phase = 'fight';
      else if (Math.max(...s.wins) >= 2 || s.round >= 5) {
        n.phase = 'matchOver'; n.winner = s.wins[0] === s.wins[1] ? null : s.wins[0] > s.wins[1] ? 0 : 1;
      } else {
        n.round++; n.phase = 'intro'; n.phaseTicks = 90; n.timer = s.seconds * HZ;
        n.fighters = s.fighters.map((f, i) => ({ ...fighter(f.character, i), lastInput: inputs[i] }));
        n.hitstop = 0; n.winner = null; n.reason = '';
      }
    }
    return n;
  }
  // Edges are latched during hitstop; repeated keydown cannot auto-repeat a move.
  n.fighters.forEach((f, i) => {
    const edges = inputs[i] & ~s.fighters[i].lastInput;
    f.lastInput = inputs[i];
    if (edges & (B.light | B.heavy | B.special | B.psyche | B.throw)) {
      f.buffer = edges; f.bufferTicks = 7;
    }
  });
  if (s.hitstop > 0) { n.hitstop--; return n; }
  n.timer--;
  n.fighters.forEach((f, i) => {
    const old = s.fighters[i], input = inputs[i];
    f.stun = Math.max(0, old.stun - 1); f.guardStun = Math.max(0, old.guardStun - 1);
    f.psycheCooldown = Math.max(0, old.psycheCooldown - 1);
    f.confirm = Math.max(0, old.confirm - 1);
    if (s.tick - old.lastHit > 100) f.combo = 0;
    if (old.move) {
      f.frame++;
      const m = MOVES[old.move];
      if (f.frame >= m.startup + m.active + m.recovery) { f.move = ''; f.frame = 0; f.connected = false; }
    }
    const free = old.stun === 0 && old.guardStun === 0;
    f.blocking = old.stun === 0 && !f.move && old.y === 0 && !!(input & B.block);
    f.duck = old.stun === 0 && !f.move && old.y === 0 && !!(input & B.down);
    if (free && !f.move) {
      if (!f.blocking && !f.duck) {
        f.x = clamp(f.x + FIGHTERS[f.character].speed * (Number(!!(input & B.right)) - Number(!!(input & B.left))), 40, 920);
        if ((input & B.jump) && !(old.lastInput & B.jump) && old.y === 0) f.vy = 20;
      }
    }
    if (f.y > 0 || f.vy > 0) { f.y = Math.max(0, f.y + f.vy); f.vy--; if (f.y === 0) f.vy = 0; }
    const cancel = old.move === 'light' && old.confirm > 0 && (f.buffer & B.heavy);
    if (free && (!f.move || cancel) && !f.blocking && f.bufferTicks > 0) {
      const name = selectMove(f.buffer, f);
      if (name) {
        f.move = name; f.frame = 0; f.connected = false; f.confirm = 0; f.bufferTicks = 0;
        if (isPsyche(name)) { f.meter -= 50; f.psycheCooldown = 180; n.events.push({ kind: 'taunt', player: i }); }
      }
    }
    f.bufferTicks = Math.max(0, f.bufferTicks - 1);
    if (f.bufferTicks === 0) f.buffer = 0;
  });
  separate(n.fighters);
  n.fighters.forEach((f, i) => {
    // Commitment locks facing. Neutral actors face the opponent after a cross-up.
    if (!f.move && n.fighters[1 - i].x !== f.x) f.facing = n.fighters[1 - i].x > f.x ? 1 : -1;
  });
  // Derive every contact from this one snapshot, THEN apply the exchange.
  const contacts = n.fighters.map((f, i) => {
    const target = n.fighters[1 - i], m = MOVES[f.move];
    if (!m || f.connected || !overlaps(hitbox(f), hurtbox(target))) return null;
    if (f.move === 'throw' && (target.y > 0 || target.stun > 0 || target.guardStun > 0)) return null;
    const blocked = target.blocking && (f.move !== 'throw') && (f.move !== 'low' || target.duck);
    return { attacker: i, target: 1 - i, name: f.move, blocked, m, facing: f.facing };
  });
  for (const c of contacts.filter(Boolean)) {
    const f = n.fighters[c.attacker], target = n.fighters[c.target];
    f.connected = true;
    if (c.blocked) {
      target.guardStun = Math.max(target.guardStun, isPsyche(c.name) ? 0 : 9);
      if (!isPsyche(c.name)) n.hitstop = Math.max(n.hitstop, 3);
      n.events.push({ kind: 'block', player: c.target });
      continue;
    }
    target.health = clamp(target.health - c.m.damage, 0, 100);
    target.stun = Math.max(target.stun, c.m.stun); target.move = ''; target.frame = 0;
    target.blocking = false; target.duck = false; target.confirm = 0;
    target.x = clamp(target.x + c.facing * c.m.push, 40, 920);
    if (isPsyche(c.name)) {
      n.events.push({ kind: 'psyche', player: c.attacker });
    } else {
      f.combo = s.tick - s.fighters[c.attacker].lastHit <= 100 ? f.combo + 1 : 1;
      f.lastHit = s.tick; if (c.name === 'light') f.confirm = 15;
      n.hitstop = 4;
      n.events.push({ kind: 'hit', player: c.attacker, damage: c.m.damage });
    }
  }
  // Simultaneous damage/psyche resource deltas must also commute. Recompute meters
  // from the snapshot costs, rather than order-dependent sequential clamping.
  n.fighters.forEach((f, i) => {
    const startedPsyche = n.events.some(e => e.kind === 'taunt' && e.player === i);
    let meter = s.fighters[i].meter - (startedPsyche ? 50 : 0);
    for (const c of contacts.filter(Boolean)) if (!c.blocked) {
      if (!isPsyche(c.name)) meter += c.attacker === i ? 12 : 6;
      else if (c.name === 'ledgerPsyche' && c.target === i) meter -= 20;
    }
    f.meter = clamp(meter, 0, 100);
    // A simultaneous received hit cancels any newly earned combo-cancel window.
    if (contacts.some(c => c && !c.blocked && c.target === i)) f.confirm = 0;
  });
  separate(n.fighters);
  if (n.fighters.some(f => f.health === 0) || n.timer <= 0) {
    const [a, b] = n.fighters;
    n.winner = a.health === b.health ? null : a.health > b.health ? 0 : 1;
    n.reason = a.health === 0 || b.health === 0 ? 'KO' : 'TIME';
    if (n.winner !== null) n.wins[n.winner]++;
    n.phase = 'roundOver'; n.phaseTicks = 150; n.hitstop = 0;
    n.events.push({ kind: 'round', player: n.winner });
  }
  return n;
}
// Explicit ordered tuple includes every future-affecting state field.
export function stateDigest(s) {
  const fields = ['id','character','x','y','vy','facing','health','meter','stun','guardStun','move','frame','connected','blocking','duck','lastInput','buffer','bufferTicks','confirm','combo','lastHit','psycheCooldown'];
  const value = [s.version,s.seed,s.seconds,s.tick,s.phase,s.phaseTicks,s.round,s.wins,s.timer,s.hitstop,s.winner,s.reason,
    s.fighters.map(f => fields.map(k => f[k])), s.events.map(e => [e.kind,e.player,e.damage ?? null])];
  let hash = 2166136261;
  for (const c of new TextEncoder().encode(JSON.stringify(value))) hash = Math.imul(hash ^ c, 16777619) >>> 0;
  return hash.toString(16).padStart(8, '0');
}
export function simulate(config, frames) {
  let state = initialState(config);
  for (const input of frames) state = advance(state, input);
  return state;
}
export function verifyReplay(replay) {
  if (!replay || replay.version !== VERSION || !Array.isArray(replay.frames) || replay.frames.length > 40000 ||
      !replay.frames.every(f => Array.isArray(f) && f.length === 2 && f.every(x => Number.isInteger(x) && x >= 0 && x <= 1023))) {
    throw new Error('Invalid or unsupported replay');
  }
  const state = simulate(replay.config, replay.frames);
  return { ok: stateDigest(state) === replay.digest, digest: stateDigest(state), state };
}
