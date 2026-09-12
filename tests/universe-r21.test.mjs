import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('src/components/universe/intro-audio.ts');
const exports={};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
class Media extends EventTarget {
  currentTime=0; duration=30; readyState=1; paused=true; ended=false; calls=0; removed=false;
  outcome=()=>Promise.resolve();
  play(){this.calls++;this.paused=false;return this.outcome();}
  pause(){this.paused=true;}
  removeAttribute(){this.removed=true;}
  load(){}
}
function harness(){
  const video=new Media(),audio=new Media(),visibility=new EventTarget(),states=[];
  visibility.hidden=false;
  const controller=exports.createIntroAudio(video,audio,v=>states.push(v),visibility);
  const playing=()=>{video.paused=false;video.dispatchEvent(new Event('playing'));};
  return {video,audio,visibility,states,controller,playing};
}
test('audio waits for actual video playback and follows its clock when autoplay is allowed',async()=>{
  const h=harness();assert.equal(h.audio.calls,0);
  h.video.currentTime=3.25;h.playing();await flush();
  assert.equal(h.audio.calls,1);assert.equal(h.audio.currentTime,3.25);assert.equal(h.states.at(-1),'played');
  h.controller.dispose();
});
test('blocked autoplay is silent-safe and never retried by further playing events',async()=>{
  const h=harness();h.audio.outcome=()=>Promise.reject(new Error('NotAllowedError'));
  h.playing();await flush();h.playing();await flush();
  assert.equal(h.audio.calls,1);assert.equal(h.states.at(-1),'blocked-safely');assert.equal(h.video.paused,false);
  h.controller.dispose();
});
test('explicit mid-intro sound action retries once at current video time without restarting video',async()=>{
  const h=harness();h.audio.outcome=()=>Promise.reject(new Error('NotAllowedError'));
  h.playing();await flush();h.video.currentTime=7;
  h.audio.outcome=()=>Promise.resolve();h.controller.enable();await flush();
  assert.equal(h.audio.calls,2);assert.equal(h.audio.currentTime,7);assert.equal(h.video.currentTime,7);assert.equal(h.video.calls,0);
  h.controller.dispose();
});
test('skip/cleanup invalidates pending play completion and prevents stray audio',async()=>{
  const h=harness();let resolve;h.audio.outcome=()=>new Promise(r=>{resolve=r;});
  h.playing();h.controller.stop();resolve();await flush();
  assert.equal(h.audio.paused,true);assert.notEqual(h.states.at(-1),'played');
  h.controller.enable();assert.equal(h.audio.calls,1);
  h.controller.dispose();assert.equal(h.audio.removed,true);
});
test('pause and resume resynchronize only previously authorized playback',async()=>{
  const h=harness();h.playing();await flush();
  h.video.paused=true;h.video.dispatchEvent(new Event('pause'));assert.equal(h.audio.paused,true);
  h.video.currentTime=8;h.playing();await flush();
  assert.equal(h.audio.currentTime,8);assert.equal(h.audio.calls,2);
  h.controller.dispose();
});
test('audio metadata arrival aligns delayed decoding and exhausted soundtrack never restarts',async()=>{
  const h=harness();h.audio.readyState=0;h.video.currentTime=5;h.playing();await flush();
  h.audio.readyState=1;h.audio.dispatchEvent(new Event('loadedmetadata'));assert.equal(h.audio.currentTime,5);
  h.video.currentTime=35;h.controller.enable();await flush();
  assert.equal(h.audio.calls,1);assert.equal(h.audio.paused,true);assert.equal(h.states.at(-1),'ended');
  h.controller.dispose();
});
test('visibility pauses sound; blocked playback is not retried on returning to tab',async()=>{
  const h=harness();h.audio.outcome=()=>Promise.reject(new Error('blocked'));h.playing();await flush();
  h.visibility.hidden=true;h.visibility.dispatchEvent(new Event('visibilitychange'));
  h.visibility.hidden=false;h.visibility.dispatchEvent(new Event('visibilitychange'));await flush();
  assert.equal(h.audio.calls,1);h.controller.dispose();
});
test('video ended and error permanently stop audio; disposal removes event listeners',async()=>{
  for(const event of ['ended','error']){
    const h=harness();h.playing();await flush();h.video.dispatchEvent(new Event(event));
    assert.equal(h.audio.paused,true);h.controller.enable();assert.equal(h.audio.calls,1);
    h.controller.dispose();h.playing();assert.equal(h.audio.calls,1);
  }
});
test('a fresh replay owns a fresh audio controller, never reactivating its disposed predecessor',async()=>{
  const a=harness();a.playing();await flush();a.controller.dispose();
  const b=harness();b.playing();await flush();a.controller.enable();
  assert.equal(a.audio.paused,true);assert.equal(a.audio.calls,1);assert.equal(b.audio.calls,1);b.controller.dispose();
});
test('Intro keeps muted video, guarded session bypass, bridge timings and explicit-only sound button',()=>{
  const intro=read('src/components/universe/UniverseIntro.tsx');
  assert.match(intro,/autoPlay muted playsInline/);
  assert.match(intro,/seen && new URLSearchParams\(location.search\).get\("intro"\) !== "1"/);
  assert.match(intro,/if \(!source \|\| !element\) return/);
  assert.match(intro,/useSimple \? 240.*650 : 850/);
  assert.match(intro,/audioControl.current\?\.stop\(\)/);
  assert.match(intro,/controller.dispose\(\)/);
  assert.match(intro,/aria-label=.*開啟音效 Sound/);
  assert.match(intro,/if \(leaving\) return/);
  assert.match(intro,/else audioControl.current\?\.enable\(\)/);
  assert.doesNotMatch(source,/requestAnimationFrame|setInterval|setTimeout|pointerdown|keydown|scroll/);
});
test('R2.1 only compresses static layout, preserving glass and all spatial transforms',()=>{
  const css=read('src/app/universe-preview/universe-preview.module.css').split('/* R2.1 — Compact composition')[1].split('/* R2.2 — Mobile spatial corridor.')[0];
  assert.doesNotMatch(css,/(?:transform|filter|backdrop-filter|animation)\s*:/);
  assert.match(css,/min-height:58px/);assert.match(css,/min-height:44px/);
  assert.doesNotMatch(css,/scroll-behavior|scroll-snap/);
  assert.match(css,/\.spatialSlot \{ display:block; min-height:44px; \}/);
  assert.match(read('src/components/universe/UniversePreview.tsx'),/className=\{styles.spatialSlot\}/);
});
