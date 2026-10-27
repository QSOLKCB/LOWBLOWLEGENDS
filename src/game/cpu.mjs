import { B } from './content.mjs';
// Optional deterministic sparring partner. No future inputs or random calls.
export function cpuInput(s, i = 1) {
  const f = s.fighters[i], enemy = s.fighters[1 - i], distance = Math.abs(f.x - enemy.x);
  if (s.phase !== 'fight') return 0;
  const toward = f.x < enemy.x ? B.right : B.left;
  const pulse = s.tick % 30;
  if (enemy.move && distance < 160 && s.tick % 120 < 45) return B.block | (enemy.move === 'low' ? B.down : 0);
  if (distance > 110) return toward | (pulse === 0 && distance < 210 ? B.special : 0);
  if (pulse === 0) return s.tick % 180 === 0 && f.meter >= 50 ? B.psyche : B.light;
  if (pulse === 10) return B.heavy;
  if (pulse === 20 && distance < 80) return B.throw;
  return 0;
}
