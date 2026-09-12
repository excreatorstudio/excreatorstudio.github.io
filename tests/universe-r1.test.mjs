import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFileSync(new URL(path,new URL('../',import.meta.url)),'utf8');
const css=read('src/app/universe-preview/universe-preview.module.css');
const r1=css.split('/* R1 — Premium Tech Glass.')[1].split('/* R2 — Local glass finish only.')[0];
test('R1 surfaces do not replace spatial transforms or introduce animation/filter engines',()=>{
  assert.ok(r1);
  assert.doesNotMatch(r1, /(?:^|[;{\s])(?:transform|filter|backdrop-filter|animation)\s*:/);
  assert.match(r1, /pointer-events:none/);
  assert.match(r1, /:has\(\.page\) > footer/);
  assert.match(r1, /min-height:44px/);
});
test('R1 retains one primary CTA and a distinct Creator Center destination',()=>{
  const scene=read('src/components/universe/UniversePreview.tsx');
  assert.equal((scene.match(/data-primary-cta="true"/g)||[]).length,1);
  assert.match(scene,/整合 AI 影音、創作者學習、語言互動與資訊工具。/);
  assert.match(scene,/href="\/ex-ai\/">進入創作中心/);
  assert.match(read('src/data/universe-navigation.ts'),/href: "\/ex-ai\/"/);
});
test('R1 protected motion, routes and shared components are byte-identical to approved baseline',()=>{
  // R2.1 explicitly changes Intro audio; its bridge/session invariants and audio behavior are tested separately.
  // R2.2 composes scroll in the existing motion loop; desktop/gyro invariants are separately exercised.
  for(const path of ['src/components/universe/GalaxyNode.tsx','src/components/Header.tsx','src/components/Footer.tsx','src/app/page.tsx','src/app/ex-ai/page.tsx','src/app/property-media/page.tsx','src/app/market-radar/page.tsx','src/app/ai-learning/page.tsx','src/data/universe-navigation.ts','package.json','package-lock.json']) {
    const approved=execFileSync('git',['show','e4613d745c546c361e29caf315e0701efd4d4d66:'+path],{cwd:root});
    // Git normalizes line endings; compare text without CR.
    assert.equal(read(path).replaceAll('\r',''),approved.toString().replaceAll('\r',''),path);
  }
});
test('R1 text colors exceed normal-text contrast on conservative lightest surface stops',()=>{
  const lum=hex=>{
    const channels=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
  };
  for(const [fg,bg] of [['c8d9e7','29435b'],['f0f5fa','29435b'],['cfdfed','24415e'],['14283d','bbd3e6'],['223f55','bbd3e6'],['cedbe7','0e1c2e']]) {
    const a=lum(fg),b=lum(bg);
    assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,fg+'/'+bg);
  }
});
