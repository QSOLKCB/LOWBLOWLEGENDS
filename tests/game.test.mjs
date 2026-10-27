import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialState, advance, normalizeInput, stateDigest, simulate, verifyReplay, HZ } from '../src/game/simulation.mjs';
import { B, MOVES, VERSION } from '../src/game/content.mjs';
import { FixedClock, InputQueue } from '../src/game/timing.mjs';
import { cpuInput } from '../src/game/cpu.mjs';
const idle = (s,n=1,inputs=[0,0])=>{for(let i=0;i<n;i++)s=advance(s,inputs);return s;};
const ready = (characters=['ledger','clinker'], distance=80)=>{
  const s=idle(initialState({characters}),90);s.fighters[0].x=480-distance/2;s.fighters[1].x=480+distance/2;return s;
};
const perform=(s,action,defence=0,ticks=1)=>idle(advance(s,[action,defence]),ticks-1,[0,defence]);
function mirror(s){return {...s,wins:[...s.wins].reverse(),winner:s.winner===null?null:1-s.winner,
  fighters:[...s.fighters].reverse().map((f,i)=>({...f,id:i,x:960-f.x,facing:-f.facing,lastInput:flip(f.lastInput),buffer:flip(f.buffer)})),events:[]};}
const flip=bits=>(bits&~3)|((bits&B.left)?B.right:0)|((bits&B.right)?B.left:0);

test('integer inputs and malformed config are bounded; zero seed retained',()=>{
  assert.equal(HZ,60);assert.equal(normalizeInput(NaN),0);assert.equal(normalizeInput(-1),0);
  assert.equal(normalizeInput({light:1,block:'yes',psyche:true}),B.psyche);
  assert.equal(normalizeInput(0xffff),1023);assert.equal(initialState(null).seconds,60);
  assert.equal(initialState({seconds:Infinity}).seconds,60);assert.equal(initialState({seed:0}).seed,0);
  assert.equal(initialState({characters:['toString','__proto__']}).fighters[0].character,'ledger');
});
test('pure transition and prior nested state remain unchanged',()=>{
  const s=ready(),copy=structuredClone(s);Object.freeze(s.fighters[0]);Object.freeze(s.fighters[1]);Object.freeze(s.fighters);Object.freeze(s);
  advance(s,[B.light,B.psyche]);assert.deepEqual(s,copy);
});
test('startup telegraphs, one contact per move, held attack cannot repeat',()=>{
  let s=perform(ready(),B.light,0,5);assert.equal(s.fighters[1].health,100);
  s=idle(s,1,[B.light,0]);assert.equal(s.fighters[1].health,93);
  s=idle(s,100,[B.light,0]);assert.equal(s.fighters[1].health,93);
  s=idle(s);s=perform(s,B.light,0,6);assert.equal(s.fighters[1].health,86);
});
test('simultaneous strikes both land and simultaneous finishing strikes draw',()=>{
  let s=ready();s.fighters.forEach(f=>f.health=7);
  s=idle(advance(s,[B.light,B.light]),5);assert.deepEqual(s.fighters.map(f=>f.health),[0,0]);
  assert.equal(s.phase,'roundOver');assert.equal(s.winner,null);assert.deepEqual(s.wins,[0,0]);
});
test('mirror symmetry across 3000 varied ticks, including stun, knockback, and meter saturation',()=>{
  let a=ready(),b=mirror(a),seed=719;
  for(let i=0;i<3000;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const input=[seed&1023,(seed>>>12)&1023];a=advance(a,input);b=advance(b,[flip(input[1]),flip(input[0])]);
    const expected=mirror(a);assert.deepEqual(b.fighters,expected.fighters,`fighter symmetry tick ${i}`);
    assert.deepEqual(b.wins,expected.wins);assert.equal(b.winner,expected.winner);
  }
});
test('high attacks block without chip, low sweeps defeat standing guard but crouch block works',()=>{
  assert.equal(perform(ready(),B.heavy,B.block,14).fighters[1].health,100);
  assert.equal(perform(ready(),B.down|B.heavy,B.block,13).fighters[1].health,89);
  assert.equal(perform(ready(),B.down|B.heavy,B.down|B.block,13).fighters[1].health,100);
});
test('throws beat guard, whiff at distance, and cannot grab airborne victims',()=>{
  assert.equal(perform(ready(undefined,58),B.throw,B.block,10).fighters[1].health,85);
  assert.equal(perform(ready(undefined,150),B.throw,0,10).fighters[1].health,100);
  assert.equal(perform(ready(undefined,58),B.throw,B.jump,10).fighters[1].health,100);
});
test('both specials deal real damage; distinct reach and anti-air coverage',()=>{
  assert.equal(perform(ready(['ledger','clinker'],180),B.special,0,18).fighters[1].health,84);
  assert.equal(perform(ready(['clinker','ledger'],180),B.special,0,18).fighters[1].health,100);
  let s=ready(['clinker','ledger'],80);s.fighters[1].y=145;s.fighters[1].vy=7;
  s=perform(s,B.special,0,16);assert.equal(s.fighters[1].health,82);
});
test('light-to-heavy confirm produces a true two-hit combo',()=>{
  let s=perform(ready(),B.light,0,6);assert.equal(s.fighters[1].health,93);
  s=perform(s,B.heavy,0,19);assert.equal(s.fighters[1].health,80);assert.equal(s.fighters[0].combo,2);
});
test('each psyche costs 50, telegraphs, stuns, releases and has finite cooldown',()=>{
  for(const character of ['ledger','clinker']){
    let s=ready([character,'ledger'],150);const move=MOVES[character+'Psyche'];
    s=perform(s,B.psyche,0,move.startup);assert.equal(s.fighters[0].meter,0);assert.equal(s.fighters[1].stun,0);
    s=idle(s);assert.equal(s.fighters[1].stun,move.stun);
    if(character==='ledger')assert.equal(s.fighters[1].meter,30);
    s=idle(s,200);assert.equal(s.fighters[1].stun,0);assert.equal(s.fighters[0].psycheCooldown,0);assert.equal(s.fighters[0].move,'');
    const x=s.fighters[1].x;s=advance(s,[0,B.right]);assert.ok(s.fighters[1].x>x);
  }
});
test('psyche counterplay: block, spacing, jump and hit the startup; no refund on interruption',()=>{
  assert.equal(perform(ready(),B.psyche,B.block,40).fighters[1].stun,0);
  assert.equal(perform(ready(undefined,400),B.psyche,0,40).fighters[1].stun,0);
  let s=perform(ready(),B.psyche,0,20);s=idle(s,13,[0,B.jump]);assert.equal(s.fighters[1].stun,0);
  s=advance(ready(),[B.psyche,B.light]);s=idle(s,40);assert.equal(s.fighters[0].health,93);assert.equal(s.fighters[0].meter,6);assert.equal(s.fighters[1].stun,0);
});
test('simultaneous psyche and strike retain both contacts',()=>{
  let s=ready(undefined,80);s.fighters[0].move='ledgerPsyche';s.fighters[0].frame=31;
  s.fighters[1].move='light';s.fighters[1].frame=4;
  s=advance(s);assert.equal(s.fighters[0].health,93);assert.equal(s.fighters[1].stun,48);
  const reflected=advance(mirror({...ready(),fighters:[{...ready().fighters[0],move:'ledgerPsyche',frame:31},{...ready().fighters[1],move:'light',frame:4}]}));
  assert.deepEqual(reflected.fighters,mirror(s).fighters);
});
test('jump returns to floor and collision cannot leave the arena',()=>{
  let s=advance(ready(),[B.jump,0]);assert.ok(s.fighters[0].y>0);s=idle(s,45);assert.equal(s.fighters[0].y,0);
  s=idle(s,300,[B.left,B.right]);assert.deepEqual(s.fighters.map(f=>f.x),[40,920]);
  s=idle(s,400,[B.right,B.left]);assert.ok(s.fighters[1].x-s.fighters[0].x>=56);
});
test('KO, unequal timeout, draw limit, complete match, terminal state and restart',()=>{
  let s=initialState({seconds:1});s=idle(s,90);s.fighters[1].health=90;
  s=idle(s,60);assert.equal(s.reason,'TIME');assert.equal(s.winner,0);
  s=idle(s,150+90);assert.equal(s.round,2);assert.equal(s.fighters[1].health,100);
  s.fighters[1].health=90;s=idle(s,60+150);assert.equal(s.phase,'matchOver');assert.equal(s.winner,0);
  assert.strictEqual(advance(s,[B.light,B.light]),s);
  const fresh=initialState();assert.deepEqual(fresh.wins,[0,0]);assert.equal(fresh.round,1);
  s=idle(initialState({seconds:1}),1500);assert.equal(s.phase,'matchOver');assert.equal(s.winner,null);assert.equal(s.round,5);
});
test('CPU match terminates and all gameplay resources remain bounded integers',()=>{
  let s=initialState({seconds:15});
  for(let i=0;i<6000&&s.phase!=='matchOver';i++){
    s=advance(s,[cpuInput(s,0),cpuInput(s,1)]);
    for(const f of s.fighters){for(const k of ['x','y','vy','health','meter','stun','guardStun','psycheCooldown','frame'])assert.ok(Number.isInteger(f[k]),k);
      assert.ok(f.health>=0&&f.health<=100);assert.ok(f.meter>=0&&f.meter<=100);assert.ok(f.stun<=54);assert.ok(f.x>=40&&f.x<=920);}
  }
  assert.equal(s.phase,'matchOver');
});
test('30/60/144 Hz rendering schedules yield identical normalized inputs and state',()=>{
  const results=[];
  for(const fps of [30,60,144]){
    const queue=new InputQueue(),clock=new FixedClock();clock.reset(0);
    for(const [time,p,bit,down] of [[1800,0,B.right,true],[1800,1,B.left,true],[2300,0,B.right,false],[2300,1,B.left,false],[2401,0,B.light,true],[2404,0,B.light,false],[2650,1,B.psyche,true],[2670,1,B.psyche,false]])queue.push(time,p,bit,down);
    let s=initialState();const frames=[];
    for(let i=1;i<=fps*5;i++)clock.pump(i*1000/fps,time=>{const inputs=queue.sample(time);frames.push(inputs);s=advance(s,inputs);});
    results.push({frames,digest:stateDigest(s)});
  }
  assert.equal(results[0].frames.length,300);assert.deepEqual(results[0],results[1]);assert.deepEqual(results[1],results[2]);assert.ok(results[0].frames.some(f=>f[0]&B.light));
});
test('long render stall caps catch-up and queued inputs have finite memory',()=>{
  const clock=new FixedClock();assert.equal(clock.pump(10000,()=>{}),15);
  const q=new InputQueue();for(let i=0;i<3000;i++)q.push(i,0,B.light,true);assert.ok(q.queue.length<=1024);q.clear();assert.deepEqual(q.sample(5000),[0,0]);
});
test('frozen replay fixture has unchanged digest and validates corrupt/versioned input',()=>{
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/arcade-v1.json',import.meta.url)));
  assert.equal(verifyReplay(fixture).ok,true);assert.equal(stateDigest(simulate(fixture.config,fixture.frames)),fixture.digest);
  assert.equal(verifyReplay({...fixture,digest:'00000000'}).ok,false);
  assert.throws(()=>verifyReplay({...fixture,version:'wrong'}));assert.throws(()=>verifyReplay({...fixture,frames:[[Infinity,0]]}));
  assert.throws(()=>verifyReplay({...fixture,frames:Array(40001).fill([0,0])}));assert.equal(fixture.version,VERSION);
});
