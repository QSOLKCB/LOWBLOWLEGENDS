import { FIGHTERS, B, ACTIONS, VERSION } from './content.mjs';
import { initialState, advance, stateDigest, verifyReplay } from './simulation.mjs';
import { render, drawFighter } from './render.mjs';
import { FixedClock, InputQueue } from './timing.mjs';
import { cpuInput } from './cpu.mjs';
const $ = id => document.getElementById(id);
const text = (id,value) => { if($(id).textContent!==value) $(id).textContent=value; };
const canvas=$('stage'), ctx=canvas.getContext('2d'), clock=new FixedClock(), input=new InputQueue();
const defaults=[['KeyA','KeyD','KeyW','KeyS','KeyF','KeyG','KeyH','KeyR','KeyT','KeyY'],
  ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyJ','KeyK','KeyL','KeyU','KeyI','KeyO']];
const allowed = code => /^(Key[A-Z]|Digit[0-9]|Arrow(Left|Right|Up|Down)|Space|Shift(Left|Right)|Control(Left|Right)|Numpad[0-9])$/.test(code);
const label = code => code.replace('Key','').replace('Digit','').replace('Arrow','').replace('Numpad','Num ');
const loadKeys = () => {
  try {
    const keys=JSON.parse(localStorage.getItem('lbl-keys-v1'));
    if(Array.isArray(keys)&&keys.length===2&&keys.every(x=>Array.isArray(x)&&x.length===10)&&keys.flat().every(allowed)&&new Set(keys.flat()).size===20) return keys;
  } catch { /* Private browsing/storage denial: defaults remain usable. */ }
  return defaults.map(x=>[...x]);
};
let keys=loadKeys(), binding=null, state=null, config=null, frames=[], paused=false, mode='cpu', lastPhase='', subtitleUntil=0;
const settings={ subtitles:true, motion:!matchMedia('(prefers-reduced-motion: reduce)').matches, flashes:false, shake:false, boxes:false };
for(const [id,value] of Object.entries(settings)) {
  $(id).checked=value;
  $(id).addEventListener('change',()=>{ settings[id]=$(id).checked; if(id==='subtitles') $('subtitle').hidden=!settings.subtitles; if(state)display(); });
}
function saveKeys() { try { localStorage.setItem('lbl-keys-v1',JSON.stringify(keys)); } catch { $('binding-status').textContent='Bindings work this session; browser storage is unavailable.'; } }
function bindings() {
  const grid=document.createElement('div');grid.className='binding-grid';
  for(const heading of ['ACTION','PLAYER 1','PLAYER 2']) {const b=document.createElement('b');b.textContent=heading;grid.append(b);}
  ACTIONS.forEach((action,index)=>{
    const name=document.createElement('span');name.textContent=action.toUpperCase();grid.append(name);
    [0,1].forEach(player=>{
      const button=document.createElement('button');button.textContent=label(keys[player][index]);
      button.setAttribute('aria-label',`Remap player ${player+1} ${action}: ${label(keys[player][index])}`);
      button.onclick=()=>{setPaused(true);binding={player,index};$('binding-status').textContent=`Press a key for player ${player+1} ${action}. Escape cancels.`;};grid.append(button);
    });
  });
  $('bindings').replaceChildren(grid);
  if(state) updateTips();
}
bindings();
$('reset-keys').onclick=()=>{keys=defaults.map(x=>[...x]);binding=null;saveKeys();bindings();$('binding-status').textContent='Default keys restored.';};
function updateTips() {
  [0,1].forEach(i=>{$('tip'+i).textContent=`P${i+1} · ${['light','heavy','block','special','psyche','throw'].map(a=>`${label(keys[i][ACTIONS.indexOf(a)])} ${a}`).join(' / ')}`;});
}
function clearInput() {input.clear();}
function setPaused(value) {
  if(!state||state.phase==='matchOver') return;
  paused=value;clearInput();clock.reset(performance.now());
  $('pause').textContent=paused?'Resume (Esc)':'Pause (Esc)';display();
}
function begin() {
  config={characters:[$('p1').value,$('p2').value],seconds:Number($('seconds').value),seed:1};
  mode=$('mode').value;state=initialState(config);frames=[];paused=false;lastPhase='';subtitleUntil=0;
  clearInput();clock.reset(performance.now());$('selection').hidden=true;$('arena').hidden=false;$('help').open=false;
  $('pause').textContent='Pause (Esc)';$('replay-status').textContent='';
  $('subtitle').textContent='The complaints department is now accepting punches.';
  updateTips();display();canvas.focus();
}
function leave() {state=null;paused=false;clearInput();$('arena').hidden=true;$('selection').hidden=false;$('p1').focus();}
$('setup').onsubmit=e=>{e.preventDefault();begin();};
$('pause').onclick=()=>{setPaused(!paused);if(!paused)canvas.focus();};
$('resume').onclick=()=>{setPaused(false);canvas.focus();};
$('rematch').onclick=begin;$('leave').onclick=leave;$('back').onclick=leave;
window.addEventListener('blur',()=>setPaused(true));
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPaused(true);});
document.addEventListener('pointerdown',e=>{
  if(state && !paused && !e.target.closest('#stage, #pause, #overlay, #leave')) setPaused(true);
});
window.addEventListener('keydown',e=>{
  // Browser/OS shortcuts retain their normal behaviour, including while rebinding.
  if(e.altKey||e.metaKey||(e.ctrlKey&&!e.code.startsWith('Control'))) return;
  if(binding) {
    e.preventDefault();if(e.code==='Escape'){binding=null;$('binding-status').textContent='Remap cancelled.';return;}
    if(!allowed(e.code)){$('binding-status').textContent='Use a letter, number, arrow, Space, Shift or Control. Browser navigation keys are reserved.';return;}
    const {player,index}=binding;
    if(keys.some((row,p)=>row.some((key,k)=>key===e.code&&(p!==player||k!==index)))){$('binding-status').textContent='That key is already assigned. Choose another.';return;}
    keys[player][index]=e.code;binding=null;saveKeys();bindings();$('binding-status').textContent='Binding saved.';return;
  }
  if(!state) return;
  if(e.code==='Escape'&&!e.repeat){e.preventDefault();setPaused(!paused);if(!paused)canvas.focus();return;}
  if(e.code==='Tab'){setPaused(true);return;}
  if(paused||document.activeElement!==canvas||e.repeat||e.altKey||e.metaKey) return;
  keys.forEach((row,p)=>{const k=row.indexOf(e.code);if(k>=0){e.preventDefault();input.push(performance.now(),p,B[ACTIONS[k]],true);}});
});
window.addEventListener('keyup',e=>{
  if(!state||paused)return;
  keys.forEach((row,p)=>{const k=row.indexOf(e.code);if(k>=0)input.push(performance.now(),p,B[ACTIONS[k]],false);});
});
function display() {
  if(!state)return;
  state.fighters.forEach((f,i)=>{
    $('name'+i).textContent=FIGHTERS[f.character].name+((mode==='cpu'&&i===1)?' / CPU':'');
    $('health'+i).value=f.health;$('hp'+i).textContent=f.health+' HP';$('wins'+i).textContent=state.wins[i]+' WINS';
    $('meter'+i).textContent=`EGO ${f.meter} / 100${f.psycheCooldown>0?' • WAIT '+Math.ceil(f.psycheCooldown/60)+'s':f.meter>=50?' • PSYCHE READY':''}`;
  });
  $('timer').textContent=Math.ceil(state.timer/60).toString().padStart(2,'0');$('round').textContent='ROUND '+state.round;
  const result=state.phase==='matchOver', round=state.phase==='roundOver';
  $('overlay').hidden=!(paused||result||round);
  $('resume').hidden=!paused;$('rematch').hidden=!(paused||result);$('back').hidden=!(paused||result);
  if(paused) {$('overlay-label').textContent='TIME IS MONEY. THIS BIT IS FREE.';text('result','PAUSED');$('result-detail').textContent='Take a breath. Change controls. Resume when ready.';}
  else if(result||round) {
    $('overlay-label').textContent=result?'CASE CLOSED':state.reason+' / ROUND '+state.round;
    text('result',state.winner===null?(result?'MATCH DRAW':'ROUND DRAW'):`P${state.winner+1} ${FIGHTERS[state.fighters[state.winner].character].name} ${result?'WINS':'TAKES THE ROUND'}`);
    $('result-detail').textContent=result?(state.winner===null?'Five rounds. No resolution. The committee would be proud.':FIGHTERS[state.fighters[state.winner].character].win):'Breathe. The next hearing begins shortly.';
  }
  if(result&&lastPhase!=='matchOver') {$('subtitle').textContent=$('result').textContent+'. '+$('result-detail').textContent;$('rematch').focus();}
  lastPhase=state.phase;
  render(ctx,state,settings);
}
function tick(deadline) {
  const frame=input.sample(deadline);if(mode==='cpu')frame[1]=cpuInput(state);
  if(frames.length>=40000){setPaused(true);$('replay-status').textContent='Replay limit reached. Restart this match.';return;}
  frames.push(frame);state=advance(state,frame);
  for(const event of state.events) {
    if(event.kind==='taunt') {$('subtitle').textContent=`${FIGHTERS[state.fighters[event.player].character].name}: “${FIGHTERS[state.fighters[event.player].character].taunt}”`;subtitleUntil=state.tick+240;}
    if(event.kind==='hit'&&state.fighters[event.player].combo===2&&state.tick>subtitleUntil) {$('subtitle').textContent='TWO-HIT COMBO. Please attach both bruises to the same complaint.';subtitleUntil=state.tick+150;}
  }
}
let renderedTick=-1;
function animate(now) {
  if(state) {
    if(!paused&&state.phase!=='matchOver')clock.pump(now,deadline=>{if(!paused&&state.phase!=='matchOver')tick(deadline);});
    else clock.reset(now);
    if(state.tick!==renderedTick){display();renderedTick=state.tick;}
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
for(const character of Object.keys(FIGHTERS)) {
  const portrait=$('portrait-'+character),c=portrait.getContext('2d');
  drawFighter(c,{...initialState({characters:[character,character]}).fighters[0],x:130},0,1.25,128,215);
}
function replayRecord() {return {version:VERSION,config,frames,digest:stateDigest(state)};}
$('replay').onclick=()=>{
  if(!state)return;setPaused(true);
  const record=replayRecord(),result=verifyReplay(record);
  $('replay-status').textContent=result.ok?`Replay verified · ${frames.length} ticks · ${result.digest}`:'Replay verification FAILED';
  if(!result.ok)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(record)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`lbl-replay-${record.digest}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('replay-file').onchange=async e=>{
  setPaused(true);const file=e.target.files[0];if(!file)return;
  try {
    if(file.size>2_000_000)throw new Error('Replay exceeds 2 MB limit');
    const result=verifyReplay(JSON.parse(await file.text()));
    $('replay-status').textContent=result.ok?`Saved replay verified · ${result.digest}`:'Saved replay digest mismatch';
  }catch(error){$('replay-status').textContent='Cannot verify: '+error.message;}
  e.target.value='';
};
// Inspection is read-only and also useful for reproducible bug reports.
Object.defineProperty(window,'lblSnapshot',{get:()=>state?structuredClone({state,paused,digest:stateDigest(state),frames:frames.length}):null});
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('../../sw.js',import.meta.url),{scope:new URL('../../',import.meta.url).pathname})
    .then(()=>navigator.serviceWorker.ready).then(()=>{$('offline-status').textContent='Offline cache ready. This game can reload without a network connection.';})
    .catch(()=>{$('offline-status').textContent='Offline cache unavailable. Keep this tab open, or serve the downloaded game locally.';});
} else $('offline-status').textContent='Offline reload unavailable here. A local static server works without internet.';
