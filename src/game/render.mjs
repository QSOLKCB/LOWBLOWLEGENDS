import { FIGHTERS, MOVES } from './content.mjs';
import { hurtbox, hitbox } from './simulation.mjs';
const FLOOR = 410;
function line(c, color, width, points) {
  c.strokeStyle = color; c.lineWidth = width; c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); points.forEach(([x,y], i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.stroke();
}
function rect(c,x,y,w,h,color) { c.fillStyle=color; c.fillRect(x,y,w,h); }
function text(c, value, x, y, size=16, color='#e9dfca', align='left') {
  c.fillStyle=color; c.font=`700 ${size}px monospace`; c.textAlign=align; c.fillText(value,x,y);
}
export function drawFighter(c, f, tick, scale=1, x=f.x, floor=FLOOR-f.y) {
  const def=FIGHTERS[f.character], color=def.color;
  c.save(); c.translate(x,floor); c.scale(f.facing*scale,scale);
  const bob=f.move||f.stun ? 0 : Math.sin(tick/12)*2;
  if(f.duck) c.scale(1,0.55);
  const stride=!f.move&&!f.blocking&&!f.stun&&(f.lastInput&3) ? Math.sin(tick/3)*8 : 0;
  const active = MOVES[f.move] && f.frame >= MOVES[f.move].startup && f.frame < MOVES[f.move].startup+MOVES[f.move].active;
  const windup=!!f.move&&!active&&f.frame<MOVES[f.move].startup;
  const reach=active ? Math.min(MOVES[f.move].range-20,148) : windup ? -6 : 36;
  const kick=f.move==='low'||f.move==='air';
  c.translate(f.stun?-8:0, bob);
  c.globalAlpha=f.health===0?0.55:1;
  // Physical silhouettes: perforated paper head / angular coat versus kiln dome / chimney.
  if (f.character==='ledger') {
    line(c,'#171b20',18,[[-13,-42],[-22+stride,-13],[-29,-2]]); line(c,color,8,[[-13,-42],[-22+stride,-13],[-29,-2]]);
    line(c,'#171b20',18,[[12,-42],[20-stride,-17],[kick?reach:31,-3]]); line(c,color,8,[[12,-42],[20-stride,-17],[kick?reach:31,-3]]);
    c.fillStyle=color; c.beginPath(); c.moveTo(-29,-94);c.lineTo(21,-89);c.lineTo(32,-34);c.lineTo(-30,-34);c.lineTo(-20,-64);c.closePath();c.fill();
    rect(c,-8,-88,15,53,'#25282b'); rect(c,-5,-81,9,17,'#eee2c9');
    rect(c,-17,-135,37,40,'#f6e7c6');
    for(let j=0;j<5;j++) rect(c,-17+j*8,-99,4,7,'#f6e7c6');
    rect(c,-12,-122,27,4,'#26292b'); rect(c,5,-114,10,3,'#26292b');
    line(c,'#4f514a',13,[[-22,-82],[-39,-63],[-17,-59]]);
    line(c,color,13,[[17,-82],[windup?-26:38,-66],[kick?30:reach,-73]]);
    rect(c,(kick?30:reach)-2,-81,18,16,'#f6e7c6');
    for(let j=0;j<3;j++) rect(c,-25,-51+j*5,19,2,'#4b463d');
  } else {
    line(c,'#24252b',22,[[-24,-35],[-28+stride,-14],[-38,-2]]); line(c,color,10,[[-24,-35],[-28+stride,-14],[-38,-2]]);
    line(c,'#24252b',22,[[25,-35],[28-stride,-15],[kick?reach:38,-2]]); line(c,color,10,[[25,-35],[28-stride,-15],[kick?reach:38,-2]]);
    rect(c,-37,-94,73,63,color); c.fillStyle=color;c.beginPath();c.arc(0,-94,36,Math.PI,0);c.fill();
    rect(c,-22,-148,17,33,'#746a82');rect(c,-29,-151,31,8,color);
    rect(c,-26,-103,54,19,'#25282b');rect(c,-18,-98,36,7,'#edc77d');
    c.fillStyle='#36383c';c.beginPath();c.arc(0,-58,22,0,Math.PI*2);c.fill();
    line(c,'#e4d3b8',3,[[0,-58],[12,-70]]);
    line(c,'#746a82',18,[[-31,-81],[-48,-57],[-32,-43]]);
    const handY=f.move==='clinkerSpecial'&&active?-172:-67;
    line(c,color,18,[[30,-81],[windup?4:49,-60],[kick?38:reach,handY]]);
    rect(c,(kick?38:reach)-3,handY-12,23,24,'#ddd0e9');
    for(let j=0;j<3;j++) rect(c,-16+j*12,-37,6,5,'#575160');
  }
  if(f.blocking) line(c,'#e7dfcd',5,[[51,-116],[68,-90],[68,-37],[50,-20]]);
  if(f.move.endsWith('Psyche')) {
    c.save(); c.scale(f.facing,1); text(c,'…',0,-174,34,color,'center'); c.restore();
  }
  if(f.stun) { c.save();c.scale(f.facing,1);text(c,'! !',0,-164,18,'#f2d6a4','center');c.restore(); }
  c.restore();
}
export function render(c,s,settings) {
  c.clearRect(0,0,960,500);
  const bg=c.createLinearGradient(0,0,0,500);bg.addColorStop(0,'#10171c');bg.addColorStop(1,'#303538');c.fillStyle=bg;c.fillRect(0,0,960,500);
  c.save();
  if(settings.shake && s.hitstop) c.translate(s.tick%2?2:-2,0);
  // The Arbitration Pit: original municipal machinery and impossible paperwork.
  for(let x=20;x<960;x+=120) {rect(c,x,0,5,362,'#353c3e');rect(c,x+10,0,2,362,'#0d1418');}
  rect(c,282,47,396,90,'#090f13');rect(c,292,57,376,70,'#222a2e');
  text(c,'DEPARTMENT OF',480,82,16,'#b8b8ac','center');text(c,'UNRESOLVED GRIEVANCES',480,111,22,'#edc77d','center');
  for(let i=0;i<7;i++){rect(c,44+i*139,174,96,100,'#171f23');rect(c,54+i*139,184,76,3,'#4b5050');for(let j=0;j<5;j++)rect(c,57+i*139,201+j*12,70,3,'#323b3e');}
  rect(c,0,313,960,10,'#57594f');rect(c,0,327,960,6,'#11191e');
  for(let x=0;x<960;x+=60) {rect(c,x,335,5,76,'#454a49');}
  rect(c,0,FLOOR,960,90,'#20272a');rect(c,0,FLOOR,960,5,'#b0a486');
  for(let x=-80;x<1000;x+=80)line(c,'#333c3d',2,[[480+(x-480)*0.88,415],[x,500]]);
  line(c,'#434946',2,[[0,449],[960,449]]);line(c,'#434946',2,[[0,487],[960,487]]);
  text(c,'NO REFUNDS • NO REFEREE • NO EXCUSES',480,470,14,'#8e958b','center');
  for(const f of s.fighters) {c.fillStyle='#0c1216';c.beginPath();c.ellipse(f.x,FLOOR+5,51,10,0,0,Math.PI*2);c.fill();}
  s.fighters.forEach(f=>drawFighter(c,f,settings.motion?s.tick:0));
  if(settings.boxes) for(const f of s.fighters) {
    for(const [box,color] of [[hurtbox(f),'#f3edda'],[hitbox(f),'#f0b85d']]) if(box) {
      c.strokeStyle=color;c.lineWidth=2;c.strokeRect(box.left,FLOOR-box.top,box.right-box.left,box.top-box.bottom);
    }
  }
  // No full-screen flashes: optional small impact marker, deterministic lifetime.
  if(settings.flashes && s.hitstop) for(const f of s.fighters.filter(f=>f.stun)) {
    text(c,'×',f.x,FLOOR-f.y-70,46,'#f4dfad','center');
  }
  c.restore();
  text(c,'P1',s.fighters[0].x,FLOOR+32,13,'#edc77d','center');text(c,'P2',s.fighters[1].x,FLOOR+32,13,'#c6b7d8','center');
  if(s.phase==='intro') {
    rect(c,295,202,370,75,'#10171cf2');text(c,`ROUND ${s.round} / ${s.phaseTicks>25?'GET READY':'FIGHT'}`,480,250,30,'#f2e4cb','center');
  }
}
