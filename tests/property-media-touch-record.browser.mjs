// Run only AFTER the browser gate. Actual Chromium screenshots encoded as WebM, not generated imagery.
import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';
const output=process.env.PM_QA_DIR;
if(!output)throw new Error('PM_QA_DIR required');
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
let recording=false,loop;
try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();await page.goto(process.env.PM_PREVIEW_URL||'http://127.0.0.1:4197/property-media/');
  const encoder=await browser.newPage();await encoder.setContent('<canvas width="390" height="844"></canvas>');
  await encoder.evaluate(()=>{
    window.chunks=[];window.recorder=new MediaRecorder(document.querySelector('canvas').captureStream(12),{mimeType:'video/webm;codecs=vp8'});
    window.recorder.ondataavailable=e=>window.chunks.push(e.data);window.recorder.start();
  });
  await page.bringToFront();recording=true;
  loop=(async()=>{while(recording){
    const frame=(await page.screenshot({type:'jpeg',quality:85})).toString('base64');
    await encoder.evaluate(async data=>{const image=new Image();image.src='data:image/jpeg;base64,'+data;await image.decode();document.querySelector('canvas').getContext('2d').drawImage(image,0,0);},frame);
    await page.waitForTimeout(65);
  }})();
  await page.waitForTimeout(700);await page.getByRole('button',{name:/略過/}).click();await page.getByRole('dialog',{name:'E.X Property Media 開場',exact:true}).waitFor({state:'detached'});await page.waitForTimeout(500);
  const cdp=await context.newCDPSession(page);
  const touch=(type,x=0,y=0)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
  const center=async()=>{const r=await page.locator('#property-media-vnext-orbit-track [aria-pressed="true"] img').boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2};};
  for(const direction of [-1,1]){
    const p=await center();await touch('touchStart',p.x,p.y);
    for(let i=1;i<=10;i++){await touch('touchMove',p.x+direction*i*11,p.y);await page.waitForTimeout(i===5?700:100);}
    await page.waitForTimeout(150);await touch('touchEnd');await page.waitForTimeout(700);
  }
  const p=await center();await page.touchscreen.tap(p.x,p.y);await page.getByRole('dialog').waitFor();await page.waitForTimeout(1400);
  recording=false;await loop;
  const bytes=await encoder.evaluate(()=>new Promise(resolve=>{
    window.recorder.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(window.chunks).arrayBuffer())));window.recorder.stop();
  }));
  const file=path.join(output,'390-skip-touch-lightbox.webm');await fs.writeFile(file,Buffer.from(bytes));console.log(file,bytes.length,'bytes');
}finally{recording=false;if(loop)await loop.catch(()=>{});await browser.close();}
