// Explicit local-preview QA using Chromium touch input, not iPhone/Safari certification.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
const output = process.env.PM_QA_DIR;
if (output) await fs.mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const results=[], errors=[];
try {
  for(const width of [390,320,430,375,768,1440]) {
    const mobile=width<768;
    const context=await browser.newContext({viewport:{width,height:844},isMobile:mobile,hasTouch:mobile});
    const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.PM_PREVIEW_URL || 'http://127.0.0.1:4197/property-media/');
    await page.getByRole('button',{name:/略過/}).click(); await page.locator('[data-phase="complete"]').waitFor();
    // Complete is a real persistent contract. Also assert usable UI, not only an internal attribute.
    assert.equal(await page.getByRole('dialog',{name:'E.X Property Media 開場',exact:true}).count(),0);
    assert.equal(await page.locator('#property-media-vnext-orbit-track').evaluate(e=>!!e.closest('[inert]')),false);
    assert.notEqual(await page.evaluate(()=>getComputedStyle(document.body).overflowY),'hidden');
    const track=page.locator('#property-media-vnext-orbit-track');
    const active=()=>track.locator('[aria-pressed="true"]').getAttribute('aria-label');
    const position=()=>track.evaluate(e=>Number(e.dataset.visualPosition??1));
    const transforms=()=>track.locator('article').evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));
    const center=async()=>{const r=await track.locator('[aria-pressed="true"] img').boundingBox();assert.ok(r);return{x:r.x+r.width/2,y:r.y+r.height/2};};
    const pause=ms=>page.waitForTimeout(ms);
    const cdp=await context.newCDPSession(page);
    const touch=(type,x=0,y=0)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:['touchEnd','touchCancel'].includes(type)?[]:[{x,y,id:1}]});
    const released=async()=>{await pause(350);assert.equal(await page.getByRole('dialog').count(),0,'Gesture must not open Lightbox');};
    assert.ok((await active()).includes('空間口播導覽'));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(!mobile){
      const stopped=await transforms();await page.waitForTimeout(100);assert.deepEqual(await transforms(),stopped,'No static orbit drift');
      const button=track.locator('[aria-pressed="true"]');const beforeHover=await button.evaluate(e=>getComputedStyle(e).transform);
      await button.hover();await page.waitForTimeout(450);assert.notEqual(await button.evaluate(e=>getComputedStyle(e).transform),beforeHover);
      const p=await center();await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x-140,p.y,{steps:12});await page.mouse.up();await released();
      assert.ok(!(await active()).includes('空間口播導覽'));
      await page.getByRole('button',{name:'下一個精選作品',exact:true}).click();await released();
      const before=await active();await page.locator('[aria-label="Property Media 精選作品導覽"]').press('ArrowLeft');await released();assert.notEqual(await active(),before);
      await track.locator('[aria-pressed="true"]').press('Enter');await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
      await track.locator('[aria-pressed="true"]').click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
      if(output)await page.screenshot({path:path.join(output,`${width}-desktop.png`)});
      results.push({width,desktopDragArrowsKeyboard:'PASS',overflow:false});await context.close();continue;
    }
    await track.evaluate(track=>{window.captureLog=[];for(const type of ['pointerdown','lostpointercapture','pointerup'])track.addEventListener(type,e=>window.captureLog.push({type,target:e.target.tagName}));});
    let p=await center();const initial=await transforms();await touch('touchStart',p.x,p.y);
    for(let i=1;i<=6;i++){await touch('touchMove',p.x-i*12,p.y);await pause(75);}
    const half=await transforms(),held=await position();assert.ok(half.filter((t,i)=>t!==initial[i]).length>=2);
    assert.ok((await active()).includes('空間口播導覽'));await pause(500);assert.equal(await position(),held);
    if(output)await page.screenshot({path:path.join(output,`${width}-holding.png`)});
    await touch('touchMove',p.x-35,p.y);
    // CDP acknowledges before Chromium delivers its coalesced touchmove (observed in diagnosis).
    // Sample after two display frames, not before the real event reaches React.
    await pause(32);
    assert.ok(await position()<held);await pause(150);
    await touch('touchMove',p.x-110,p.y);await pause(160);await touch('touchEnd');await released();assert.ok((await active()).includes('AI 空間變裝'));
    const log=await page.evaluate(()=>window.captureLog);
    assert.ok(log.some(e=>e.type==='pointerdown'&&e.target==='IMG'));
    assert.ok(log.some(e=>e.type==='lostpointercapture'&&e.target==='IMG'));
    assert.ok(log.some(e=>e.type==='pointerup'&&e.target==='DIV'));
    p=await center();const anchor=await active();await touch('touchStart',p.x,p.y);await touch('touchMove',p.x+70,p.y);await pause(120);await touch('touchMove',p.x,p.y);await pause(150);await touch('touchEnd');await released();assert.equal(await active(),anchor);
    await touch('touchStart',p.x,p.y);await touch('touchMove',p.x-35,p.y);await touch('touchCancel');await released();
    p=await center();await page.touchscreen.tap(p.x,p.y);await page.getByRole('dialog').waitFor();await pause(500);await page.keyboard.press('Escape');await pause(100);
    const reached=new Set([await active()]);
    for(let i=0;i<9;i++){p=await center();await touch('touchStart',p.x,p.y);for(let j=1;j<=5;j++){await touch('touchMove',p.x-j*22,p.y);await pause(45);}await pause(150);await touch('touchEnd');await released();reached.add(await active());}
    assert.equal(reached.size,9);
    p=await center();const beforeScroll=await page.evaluate(()=>scrollY),beforeVertical=await active();await touch('touchStart',p.x,p.y);
    for(let i=1;i<=6;i++){await touch('touchMove',p.x,p.y-i*25);await pause(50);}await touch('touchEnd');await released();
    assert.ok(await page.evaluate(()=>scrollY)>beforeScroll+30);assert.equal(await active(),beforeVertical);
    await page.evaluate(()=>scrollTo(0,0));await pause(300);await page.emulateMedia({reducedMotion:'reduce'});await pause(100);
    p=await center();const beforeReduced=await active();await touch('touchStart',p.x,p.y);await touch('touchMove',p.x-110,p.y);await pause(160);await touch('touchEnd');await released();assert.notEqual(await active(),beforeReduced);
    await track.locator('[aria-pressed="true"]').press('Space');await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    results.push({width,captureTransfer:'PASS',continuousHeldReverse:'PASS',nineCases:reached.size,dragClickCancel:'PASS',nativeScroll:'PASS',reducedMotion:'PASS',keyboard:'PASS',overflow:false});await context.close();
  }
  assert.deepEqual(errors,[]);const report={browser:await browser.version(),results,errors};console.log(JSON.stringify(report,null,2));
  if(output)await fs.writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2));
}finally{await browser.close();}
