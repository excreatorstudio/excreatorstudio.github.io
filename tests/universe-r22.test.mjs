import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const motion=read('src/components/universe/useUniverseMotion.ts');
function harness({mobile=true,reduced=false,low=false,enabled=true}={}){
  const events=new Map(),frames=new Map(),values=new Map();
  let cleanup,time=0,id=0,ref=0,activeChanges=0,reads=0;
  const root={style:{setProperty:(k,v)=>values.set(k,v)},clientWidth:390,clientHeight:1200,
    getBoundingClientRect:()=>{reads++;return {top:240-window.scrollY,left:0,width:390,height:1200};},
    addEventListener(){},removeEventListener(){},contains:()=>false};
  const layer={offsetTop:180,offsetParent:root,clientWidth:390,clientHeight:1000};
  const planets=['create','knowledge','language','insight'].map((name,i)=>({galaxy:{id:name,position:{x:'50%',y:'50%',z:0}},element:{offsetParent:layer,offsetTop:i*190,offsetLeft:20,offsetWidth:210,offsetHeight:250,values:new Map(),style:{setProperty(k,v){planets[i].element.values.set(k,Number(v));}}}}));
  root.querySelector=s=>planets.find(n=>s.includes('"'+n.galaxy.id+'"'))?.element??null;
  const window={innerHeight:844,innerWidth:390,scrollY:0,addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)};
  const document={hidden:false,addEventListener(){},removeEventListener(){}};
  const exports={};
  vm.runInNewContext(ts.transpileModule(motion,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{
    exports,require:n=>n==='react'?{useRef:v=>({current:ref++===0?root:v}),useState:v=>[v,()=>{if(v===null)activeChanges++;}],useEffect:f=>{cleanup=f();}}:{universeGalaxies:planets.map(n=>n.galaxy)},
    window,document,navigator:{deviceMemory:low?2:8,hardwareConcurrency:low?2:8},sessionStorage:{getItem:()=>null,setItem(){}},
    matchMedia:q=>({matches:q.includes('reduced')?reduced:mobile,addEventListener(){},removeEventListener(){}}),
    performance:{now:()=>time},ResizeObserver:class{observe(){}disconnect(){}},
    requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:i=>frames.delete(i),
  });
  exports.useUniverseMotion(enabled);
  const settle=()=>{for(let i=0;i<250&&frames.size;i++){time+=16;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(f=>f(time));}return frames.size;};
  return {exports,window,planets,events,settle,cleanup:()=>cleanup(),reads:()=>reads,active:()=>activeChanges};
}
test('corridor signal is continuous and bounded for near and distant viewport positions',()=>{
  const h=harness();for(const y of [-10000,0,200,600,10000])assert.ok(Math.abs(h.exports.corridorProgress(500,y,844))<=1);
  assert.ok(Math.abs(h.exports.corridorProgress(500,95,844)-h.exports.corridorProgress(500,96,844))<.01);h.cleanup();
});
test('mobile scroll uses cached geometry, settles the single loop and never activates a destination',()=>{
  const h=harness();h.settle();const reads=h.reads();
  h.window.scrollY=360;h.events.get('scroll')();assert.equal(h.settle(),0);
  assert.equal(h.reads(),reads);assert.equal(h.active(),0);
  assert.notEqual(h.planets[0].element.values.get('--scroll-depth'),h.planets[3].element.values.get('--scroll-depth'));
  assert.ok(h.planets.every(n=>Math.abs(n.element.values.get('--scroll-depth'))<=1));
  h.cleanup();assert.equal(h.events.has('scroll'),false);
});
test('desktop, reduced, low GPU and inactive Intro have no dynamic corridor depth',()=>{
  for(const options of [{mobile:false},{reduced:true},{low:true},{enabled:false}]){
    const h=harness(options);h.settle();h.window.scrollY=500;h.events.get('scroll')();h.settle();
    for(const node of h.planets)assert.equal(node.element.values.get('--scroll-depth')??0,0);
    assert.equal(h.active(),0);h.cleanup();
  }
});
test('mobile-only layout keeps native scrolling, four unequal planes and one composed transform',()=>{
  const css=read('src/app/universe-preview/universe-preview.module.css');
  const corridor=css.split('/* R2.2 — Mobile spatial corridor.')[1];
  assert.match(corridor,/@media \(max-width:767px\)/);
  assert.doesNotMatch(corridor,/transform:|backdrop-filter|filter:|scroll-snap|touch-action:none/);
  for(const id of ['create','knowledge','language','insight'])assert.match(corridor,new RegExp('data-galaxy="'+id+'"'));
  assert.match(css,/var\(--pointer-x\).*var\(--scroll-depth,0\)/);
  assert.equal((motion.match(/requestAnimationFrame\(tick\)/g)||[]).length,2);
  assert.doesNotMatch(motion,/setInterval|preventDefault/);
  assert.match(motion,/addEventListener\("scroll", scroll, \{ passive: true \}\)/);
  assert.match(corridor,/data-focused="true"/);
  assert.match(corridor,/\.galaxyVisual \{ pointer-events:none; \}/);
  assert.match(corridor,/\.galaxyVisual::after \{ pointer-events:auto; \}/);
});
const audioExports={};
vm.runInNewContext(ts.transpileModule(read('src/components/universe/intro-audio.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:audioExports});
class Media extends EventTarget{
  currentTime=0;duration=30;readyState=1;paused=true;ended=false;calls=0;outcome=()=>Promise.resolve();
  play(){this.calls++;this.paused=false;return this.outcome();}pause(){this.paused=true;}removeAttribute(){}load(){}
}
const flush=()=>new Promise(r=>setImmediate(r));
function audioHarness(){
  const video=new Media(),audio=new Media(),visibility=new EventTarget(),states=[];visibility.hidden=false;
  const control=audioExports.createIntroAudio(video,audio,s=>states.push(s),visibility);
  const playing=()=>{video.paused=false;video.dispatchEvent(new Event('playing'));};
  return {video,audio,control,states,playing};
}
test('mute pauses only soundtrack and remains effective across video playing events',async()=>{
  const h=audioHarness();h.playing();await flush();h.control.mute();
  assert.equal(h.audio.paused,true);assert.equal(h.video.paused,false);
  h.playing();await flush();assert.equal(h.audio.calls,1);
  h.video.currentTime=9;h.control.enable();await flush();assert.equal(h.audio.currentTime,9);assert.equal(h.video.currentTime,9);
  h.control.dispose();
});
test('Skip wins for playing, manually enabled, blocked and pending audio',async()=>{
  for(const state of ['playing','manual','blocked','pending']){
    const h=audioHarness();let resolve;
    if(state==='blocked'||state==='manual')h.audio.outcome=()=>Promise.reject(new Error('blocked'));
    if(state==='pending')h.audio.outcome=()=>new Promise(r=>{resolve=r;});
    h.playing();if(state!=='pending')await flush();
    if(state==='manual'){h.audio.outcome=()=>Promise.resolve();h.control.enable();await flush();}
    const calls=h.audio.calls;h.control.stop();resolve?.();await flush();h.control.enable();h.playing();await flush();
    assert.equal(h.audio.paused,true);assert.equal(h.audio.calls,calls);h.control.dispose();
  }
});
test('explicit mute invalidates a pending autoplay without later audio leaking',async()=>{
  const h=audioHarness();let resolve;h.audio.outcome=()=>new Promise(r=>{resolve=r;});h.playing();h.control.mute();resolve();await flush();
  assert.equal(h.audio.paused,true);assert.notEqual(h.states.at(-1),'played');h.control.dispose();
});
test('Intro keeps one audio instance, sound and Skip have separate handlers and session guard remains',()=>{
  const intro=read('src/components/universe/UniverseIntro.tsx');
  assert.equal((intro.match(/new Audio\(\)/g)||[]).length,1);
  assert.match(intro,/audioStatus === "played"\) audioControl.current\?\.mute/);
  assert.match(intro,/onClick=\{\(\) => finishRef.current\(\)\}/);
  assert.match(intro,/audioControl.current\?\.stop\(\)/);
  assert.match(intro,/if \(!source \|\| !element\) return/);
  assert.match(intro,/seen && new URLSearchParams\(location.search\).get\("intro"\) !== "1"/);
});
