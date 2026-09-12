// Read-only application diagnosis. Contexts are isolated; no application storage is cleared.
import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const output=process.env.PM_QA_DIR;
if(output)await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const reports=[];
try{
  for(const [name,url] of [['dev','http://127.0.0.1:4194/property-media/'],['production-http1','http://127.0.0.1:4197/property-media/']]){
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('requestfailed',r=>errors.push(`${r.url()}: ${r.failure()?.errorText}`));
    await page.addInitScript(()=>{
      window.qaUnhandled=[];window.qaClicks=[];
      window.addEventListener('unhandledrejection',e=>window.qaUnhandled.push(String(e.reason)));
      document.addEventListener('click',e=>{window.qaClickAt=performance.now();window.qaClicks.push({text:e.target.textContent,time:window.qaClickAt});},true);
    });
    const sample=async label=>({label,...await page.evaluate(()=>{
      const root=document.querySelector('[data-phase]'),intro=document.querySelector('[aria-label="E.X Property Media 開場"]'),track=document.querySelector('#property-media-vnext-orbit-track');
      const r=root?.getBoundingClientRect();
      return {elapsedMs:window.qaClickAt===undefined?null:Math.round(performance.now()-window.qaClickAt),phase:root?.getAttribute('data-phase'),rootBox:r?.toJSON(),intro:!!intro,skip:[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Skip')),
        inert:!!track?.closest('[inert]'),bodyOverflow:getComputedStyle(document.body).overflow,htmlOverflow:getComputedStyle(document.documentElement).overflow,
        focused:document.activeElement?.tagName+':'+document.activeElement?.textContent?.slice(0,80),storage:{...sessionStorage},errors:window.qaUnhandled,clicks:window.qaClicks,
        ready:document.readyState,rootDisplay:root&&getComputedStyle(root).display};
    })});
    let navigationError;
    try { await page.goto(url); } catch(error) { navigationError=error.message; }
    const samples=[await sample('initial')];
    await page.getByRole('button',{name:/略過/}).click();
    const start=Date.now();
    for(const time of [0,100,300,1000,2000]){await page.waitForTimeout(Math.max(0,time-(Date.now()-start)));samples.push(await sample(`after ${time}ms`));}
    if(output)await page.screenshot({path:path.join(output,`${name}-after-skip.png`)});
    assert.equal(navigationError,undefined);
    assert.equal(samples.at(-1).phase,'complete');assert.equal(samples.at(-1).intro,false);assert.equal(samples.at(-1).inert,false);
    assert.notEqual(samples.at(-1).bodyOverflow,'hidden');assert.deepEqual(samples.at(-1).storage,{});assert.deepEqual(samples.at(-1).errors,[]);
    // Existing Property Media deliberately replays on reload: unlike Universe, no seen marker/query override.
    await page.reload();assert.equal(await page.getByRole('dialog',{name:'E.X Property Media 開場',exact:true}).count(),1);
    const reload=await sample('same-session reload: Intro is expected, bypass not supported');
    await page.getByRole('button',{name:/略過/}).click();await page.getByRole('dialog',{name:'E.X Property Media 開場',exact:true}).waitFor({state:'detached'});
    reports.push({name,navigationError,samples,reload,consoleErrors:errors});
    console.log(JSON.stringify(reports.at(-1),null,2));
    if(output)await fs.writeFile(path.join(output,'skip-diagnosis.json'),JSON.stringify(reports,null,2));
    await context.close();
    for(const mode of ['play-rejected','reduced-motion','intro-query']){
      const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:mode==='reduced-motion'?'reduce':'no-preference'});
      const p=await c.newPage(),runtime=[];p.on('pageerror',e=>runtime.push(e.message));
      if(mode==='play-rejected')await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('QA injected playback rejection','NotAllowedError'));};});
      await p.goto(url+(mode==='intro-query'?'?intro=1':''));
      assert.equal(await p.getByRole('dialog',{name:'E.X Property Media 開場',exact:true}).count(),1);
      const start=Date.now();
      if(mode==='play-rejected')await p.getByRole('button',{name:/進入空間/}).click();else await p.getByRole('button',{name:/略過/}).click();
      await p.getByRole('dialog',{name:'E.X Property Media 開場',exact:true}).waitFor({state:'detached'});
      const final=await p.evaluate(()=>({phase:document.querySelector('[data-phase]').dataset.phase,inert:!!document.querySelector('#property-media-vnext-orbit-track').closest('[inert]'),overflow:getComputedStyle(document.body).overflowY,storage:{...sessionStorage}}));
      assert.equal(final.phase,'complete');assert.equal(final.inert,false);assert.notEqual(final.overflow,'hidden');assert.deepEqual(final.storage,{});assert.deepEqual(runtime,[]);
      reports.push({name,case:mode,elapsedMs:Date.now()-start,final,runtime,note:mode==='intro-query'?'Query has no special semantics in Property Media':mode==='play-rejected'?'Injected rejection after explicit Sound On, not autoplay':'Reduced motion 220ms handoff'});await c.close();
    }
  }
  console.log(JSON.stringify(reports,null,2));if(output)await fs.writeFile(path.join(output,'skip-diagnosis.json'),JSON.stringify(reports,null,2));
}finally{await browser.close();}
