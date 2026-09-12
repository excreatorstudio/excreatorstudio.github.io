import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css=readFileSync(new URL('../src/app/universe-preview/universe-preview.module.css',import.meta.url),'utf8');
const r2=css.split('/* R2 — Local glass finish only.')[1].split('/* R2.1 — Compact composition')[0];

test('R2 finish stays within Hero, header and CTA without replacing spatial transforms',()=>{
  assert.ok(r2);
  assert.doesNotMatch(r2,/(?:^|[;{\s])(?:transform|filter|animation|opacity|position|height|z-index)\s*:/m);
  // Only the existing decorative top edge may alter its length.
  const declarations=r2.replace(/\.heroCopy::before\s*\{[^}]*\}/g,'');
  assert.doesNotMatch(declarations,/\.(?:page|sceneWorld|galaxy\w*|core\w*|intro\w*|secondaryDestinations)\b/);
});
test('R2 blur is local, bounded, with more opaque mobile and unsupported-browser fallbacks',()=>{
  const radii=[...r2.matchAll(/backdrop-filter:blur\((\d+)px\)/g)].map(m=>Number(m[1]));
  assert.ok(radii.length>0 && radii.every(n=>n<=10));
  assert.match(r2,/@media \(max-width:767px\)/);
  assert.match(r2,/@supports not/);
  assert.match(r2,/-webkit-backdrop-filter/);
  assert.match(r2,/@media \(prefers-reduced-motion:reduce\).*transition:none/);
});
test('R2 reading and button colors retain contrast over the navy scene upper-stop sample',()=>{
  const rgb=h=>h.match(/\w\w/g).map(v=>parseInt(v,16)/255);
  const lum=c=>c.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  // Sample the existing brightest navy atmosphere stop; moving highlights need visual review.
  const scene=rgb('31516c');
  const base=rgb('213950').map((v,i)=>v*(166/255)+scene[i]*(1-166/255));
  for(const foreground of ['f1f0e9','d1dee9']) {
    const a=lum(rgb(foreground)),b=lum(base);
    assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,foreground);
  }
  const a=lum(rgb('223f55')),b=lum(rgb('c4d5e2'));
  assert.ok((b+.05)/(a+.05)>=4.5);
});
