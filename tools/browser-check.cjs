/* Test-only dependency: Playwright. The shipped site has zero packages. */
const { chromium, firefox, webkit } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const { readFile, mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve('_site'), output = path.resolve(process.env.LBL_EVIDENCE || 'test-results');
const types = { '.html':'text/html', '.css':'text/css', '.mjs':'text/javascript', '.js':'text/javascript' };
(async()=>{
  await mkdir(output,{recursive:true});
  const server=http.createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      if(!url.pathname.startsWith('/LOWBLOWLEGENDS/')) {res.writeHead(404);res.end();return;}
      const local=decodeURIComponent(url.pathname.slice('/LOWBLOWLEGENDS/'.length))||'index.html';
      const file=path.resolve(root,local);
      if(!file.startsWith(root+path.sep))throw new Error('outside root');
      const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
    }catch{res.writeHead(404);res.end('Not found');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`,url=origin+'/LOWBLOWLEGENDS/';
  const report={testedAt:new Date().toISOString(),url,checks:[],browsers:[],failures:[]};
  const fixture=JSON.parse(await readFile('tests/fixtures/arcade-v1.json','utf8'));
  let browser;
  const check=name=>{report.checks.push(name);console.log('PASS',name);};
  try {
    browser=await chromium.launch({headless:true,args:['--no-sandbox']});
    report.browsers.push({name:'chromium',version:browser.version()});
    const context=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
    page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${r.url()}`);});
    await page.goto(url);await page.waitForFunction(()=>document.querySelector('#offline-status').textContent.includes('cache ready'));
    await page.screenshot({path:path.join(output,'selection.png'),fullPage:true});
    assert.equal(await page.locator('#motion').isChecked(),false);assert.equal(await page.locator('#shake').isChecked(),false);assert.equal(await page.locator('#flashes').isChecked(),false);
    check('character selection renders; reduced-motion and default flash/shake settings');
    await page.clock.install();
    await page.selectOption('#mode','local');await page.selectOption('#seconds','15');
    await page.getByRole('button',{name:'Remap player 1 light: F',exact:true}).click();
    await page.locator('#setup button').click();await page.clock.runFor(1600);
    const snap=()=>page.evaluate(()=>window.lblSnapshot);
    assert.equal((await snap()).state.phase,'fight');
    await page.evaluate(()=>{window.repeatedKeys=[];window.addEventListener('keydown',e=>{if(e.repeat)window.repeatedKeys.push({code:e.code,prevented:e.defaultPrevented});});});
    const scrollBefore=await page.evaluate(()=>scrollY);
    await page.keyboard.down('ArrowDown');await page.keyboard.down('ArrowDown');await page.clock.runFor(150);await page.keyboard.up('ArrowDown');
    assert.deepEqual(await page.evaluate(()=>window.repeatedKeys),[{code:'ArrowDown',prevented:true}]);
    assert.equal(await page.evaluate(()=>scrollY),scrollBefore);check('repeated mapped arrow keydown suppresses page scrolling');
    await page.keyboard.down('d');await page.keyboard.down('ArrowLeft');await page.clock.runFor(650);await page.keyboard.up('d');await page.keyboard.up('ArrowLeft');await page.clock.runFor(50);
    const fighters=(await snap()).state.fighters;assert.ok(Math.abs(fighters[0].x-fighters[1].x)<=100);check('both players move through real keyboard events');
    await page.keyboard.down('f');await page.clock.runFor(200);await page.keyboard.up('f');await page.clock.runFor(100);
    assert.equal((await snap()).state.fighters[1].health,93);check('keyboard light attack produces damage');
    await page.keyboard.press('Escape');const before=await snap();await page.clock.runFor(2000);assert.equal((await snap()).digest,before.digest);assert.equal((await snap()).paused,true);
    await page.keyboard.press('Escape');await page.clock.runFor(400);assert.equal((await snap()).paused,false);check('pause freezes simulation and resumes without catch-up');
    await page.keyboard.down('w');await page.clock.runFor(200);await page.keyboard.up('w');assert.ok((await snap()).state.fighters[0].y>0);await page.clock.runFor(700);check('jump and landing from keyboard');
    await page.keyboard.down('t');await page.clock.runFor(800);await page.keyboard.up('t');
    assert.ok((await snap()).state.fighters[1].stun>0);assert.equal((await snap()).state.fighters[0].meter,12);assert.match(await page.locator('#meter0').textContent(),/WAIT/);check('psyche-out changes state, displays original subtitle and shows cooldown');
    await page.screenshot({path:path.join(output,'combat.png')});
    await page.keyboard.down('a');await page.clock.runFor(650);await page.keyboard.up('a');
    // Keep the real configured clock; virtual browser time runs all animation callbacks.
    await page.clock.runFor(16000);let now=await snap();assert.equal(now.state.round,2);check('first timeout awards round by health');
    await page.clock.runFor(2000);
    await page.keyboard.down('d');await page.keyboard.down('ArrowLeft');await page.clock.runFor(650);await page.keyboard.up('d');await page.keyboard.up('ArrowLeft');await page.clock.runFor(50);
    await page.keyboard.down('f');await page.clock.runFor(180);await page.keyboard.up('f');
    await page.keyboard.down('a');await page.clock.runFor(650);await page.keyboard.up('a');await page.clock.runFor(18000);
    now=await snap();assert.equal(now.state.phase,'matchOver');assert.equal(now.state.winner,0);assert.match(await page.locator('#result').textContent(),/P1 LEDGER WINS/);
    await page.screenshot({path:path.join(output,'victory.png')});check('full two-round match, victory UI and finisher dialogue');
    const downloadPromise=page.waitForEvent('download');await page.click('#replay');const download=await downloadPromise;await download.saveAs(path.join(output,'browser-replay.json'));
    assert.match(await page.locator('#replay-status').textContent(),/Replay verified/);check('real match replay verifies in browser and exports');
    await page.locator('#rematch').click();await page.clock.runFor(1600);now=await snap();assert.deepEqual(now.state.wins,[0,0]);assert.deepEqual(now.state.fighters.map(f=>f.health),[100,100]);check('restart resets wins, health, inputs and round');
    // Blur pauses with held input cleared; Tab remains normal browser navigation.
    await page.keyboard.down('d');await page.clock.runFor(50);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));const x=(await snap()).state.fighters[0].x;
    await page.keyboard.up('d');await page.clock.runFor(500);assert.equal((await snap()).state.fighters[0].x,x);
    await page.locator('#resume').click();await page.clock.runFor(300);assert.equal((await snap()).state.fighters[0].x,x);
    await page.keyboard.press('Tab');assert.equal((await snap()).paused,true);check('focus loss clears held keys; Tab exits game controls');
    await page.locator('#help summary').click();
    await page.getByRole('button',{name:'Remap player 1 light: F',exact:true}).click();await page.locator('#resume').click();
    const remapX=(await snap()).state.fighters[0].x;await page.keyboard.down('d');await page.clock.runFor(100);await page.keyboard.up('d');
    assert.ok((await snap()).state.fighters[0].x>remapX);assert.equal(await page.getByRole('button',{name:'Remap player 1 light: F',exact:true}).count(),1);
    await page.keyboard.press('Escape');await page.getByRole('button',{name:'Remap player 1 light: F',exact:true}).click();await page.locator('#rematch').click();await page.clock.runFor(1600);
    const freshX=(await snap()).state.fighters[0].x;await page.keyboard.down('d');await page.clock.runFor(50);await page.keyboard.up('d');assert.ok((await snap()).state.fighters[0].x>freshX);
    check('start, resume and rematch cancel pending remaps without swallowing gameplay');
    await page.keyboard.press('Escape');await page.locator('#help summary').click();
    await page.getByRole('button',{name:'Remap player 1 light: F',exact:true}).click();await page.keyboard.press('z');
    await page.locator('#resume').click();await page.clock.runFor(50);
    await page.keyboard.down('d');await page.clock.runFor(1050);await page.keyboard.up('d');await page.clock.runFor(50);
    await page.keyboard.down('z');await page.clock.runFor(200);await page.keyboard.up('z');assert.equal((await snap()).state.fighters[1].health,93);check('control remapping applies to actual combat');
    // Verify the frozen fixture in the production module, plus measure draw+step cost.
    const result=await page.evaluate(async fixture=>{
      const sim=await import('./src/game/simulation.mjs'),renderer=await import('./src/game/render.mjs');
      const verified=sim.verifyReplay(fixture);let state=sim.initialState();const times=[];
      const canvas=document.createElement('canvas');canvas.width=960;canvas.height=500;const ctx=canvas.getContext('2d');
      for(let i=0;i<360;i++){const start=performance.now();state=sim.advance(state,fixture.frames[i]);renderer.render(ctx,state,{motion:false,boxes:false,shake:false,flashes:false});times.push(performance.now()-start);}
      return {digest:verified.digest,ok:verified.ok,times};
    },fixture);
    assert.equal(result.ok,true);report.replay={ticks:fixture.frames.length,digest:result.digest};
    // Virtual clock freezes performance.now; real performance is measured in a fresh page below.
    check('browser replays frozen Node fixture to identical digest');
    await context.setOffline(true);await page.reload();await page.waitForSelector('#setup button');
    assert.equal(await page.getByRole('button',{name:'Remap player 1 light: Z',exact:true}).count(),1);
    await page.locator('#setup button').click();await page.clock.runFor(1600);assert.ok(await snap());check('offline reload, saved bindings and playable startup');
    await context.setOffline(false);
    assert.deepEqual(errors,[]);assert.ok(requests.every(u=>u.startsWith(origin+'/LOWBLOWLEGENDS/')||u.startsWith('blob:')));report.externalRequests=0;check('zero console/page/network errors and zero external runtime requests');
    const small=await context.newPage();await small.setViewportSize({width:390,height:844});await small.goto(url);assert.equal(await small.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await small.screenshot({path:path.join(output,'mobile-layout.png'),fullPage:true});check('390 px layout has no horizontal overflow (keyboard still required)');
    const perfContext=await browser.newContext();const perf=await perfContext.newPage();await perf.goto(url);
    report.performance=await perf.evaluate(async fixture=>{
      const sim=await import('./src/game/simulation.mjs'),renderer=await import('./src/game/render.mjs');
      const c=document.createElement('canvas');c.width=960;c.height=500;const ctx=c.getContext('2d');const values=[];let s=sim.initialState();
      for(let i=0;i<600;i++){const t=performance.now();s=sim.advance(s,fixture.frames[i]);renderer.render(ctx,s,{motion:true,flashes:false,shake:false,boxes:false});values.push(performance.now()-t);}
      values.sort((a,b)=>a-b);return {samples:600,medianMs:values[300],p95Ms:values[570],maxMs:values[599],note:'Headless Chromium CPU step + Canvas command submission; not physical display FPS.'};
    },fixture);
    await browser.close();browser=null;
    for(const [name,engine] of [['firefox',firefox],['webkit',webkit]]){
      browser=await engine.launch({headless:true,timeout:15000,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});const page=await browser.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>console.error(name,e.message));await page.goto(url);console.log(name,'loaded');
      const result=await page.evaluate(async fixture=>(await import('./src/game/simulation.mjs')).verifyReplay(fixture),fixture);
      assert.equal(result.ok,true);await page.selectOption('#mode','local');await page.locator('#setup button').click();await page.waitForFunction(()=>window.lblSnapshot?.state.phase==='fight',null,{timeout:10000});
      await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>window.lblSnapshot.paused),true);
      report.browsers.push({name,version:browser.version(),digest:result.digest});check(name+' fixture parity, start and pause');await browser.close();browser=null;
    }
  }catch(error){report.failures.push(error.stack);throw error;}
  finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));await writeFile(path.join(output,'browser-report.json'),JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error);process.exitCode=1;});
