// Wall time lives only in this adapter, never in the combat reducer.
export class FixedClock {
  constructor() { this.reset(0); }
  reset(now) { this.origin = now; this.steps = 0; }
  pump(now, step) {
    if (now - (this.origin + this.steps * 1000 / 60) > 250) this.reset(now - 250);
    let count = 0;
    while (this.origin + (this.steps + 1) * 1000 / 60 <= now + 0.000001) {
      this.steps++; step(this.origin + this.steps * 1000 / 60); count++;
    }
    return count;
  }
}
// Preserve quick taps between renders and sample ordered events at tick deadlines.
export class InputQueue {
  constructor() { this.clear(); }
  clear() { this.queue = []; this.held = [0, 0]; }
  push(time, player, bit, down) {
    if (this.queue.length >= 1024) this.clear();
    this.queue.push({ time, player, bit, down });
  }
  sample(time) {
    const pressed = [0, 0];
    let count = 0;
    for (const e of this.queue) {
      if (e.time > time) break;
      if (e.down) { pressed[e.player] |= e.bit & ~this.held[e.player]; this.held[e.player] |= e.bit; }
      else this.held[e.player] &= ~e.bit;
      count++;
    }
    this.queue.splice(0, count);
    return this.held.map((held, i) => held | pressed[i]);
  }
}
