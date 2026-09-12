import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { runtimeGraph } from './helpers/universe-boundary.mjs';
import { sha256, validateCandidates, assertRuntimeMedia, exactFile } from './helpers/universe-assets.mjs';

// Isolated SYNTHETIC fixture bytes: never real media or visual-quality evidence.
function fixture(t, files) {
  const root = mkdtempSync(resolve(tmpdir(), 'ex-universe-contract-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(resolve(root,path)), { recursive:true });
    writeFileSync(resolve(root,path), content);
  }
  return root;
}
const config = JSON.stringify({ compilerOptions:{ moduleResolution:'bundler', module:'esnext', paths:{ '@/*':['./src/*'] } }, include:['src/**/*'] });
const base = { 'tsconfig.json':config, 'package.json':'{"dependencies":{"three":"approved-for-property-media"}}', 'src/main.ts':'export const ready = true;', 'src/property.ts':"import * as THREE from 'three';" };
test('package three and disconnected Property Media viewer do not contaminate Universe', t => {
  assert.equal(runtimeGraph(fixture(t,base), ['src/main.ts']).size,1);
});
for (const spec of ['three','three/examples/jsm/loaders/GLTFLoader.js','@react-three/fiber','react-three-fiber','gsap','gsap/ScrollTrigger']) {
  test('reject runtime engine '+spec, t => {
    assert.throws(()=>runtimeGraph(fixture(t,{...base,'src/main.ts':`import x from '${spec}';`}),['src/main.ts']),/FORBIDDEN_RUNTIME/);
  });
}
test('alias helper and re-export barrel cannot conceal engines', t => {
  assert.throws(()=>runtimeGraph(fixture(t,{...base,'src/main.ts':"import '@/barrel';",'src/barrel.ts':"export * from './helper';",'src/helper.ts':"require('three');"}),['src/main.ts']),/FORBIDDEN_RUNTIME/);
});
test('literal dynamic engine import is rejected', t => {
  assert.throws(()=>runtimeGraph(fixture(t,{...base,'src/main.ts':"import('gsap/ScrollTrigger');"}),['src/main.ts']),/FORBIDDEN_RUNTIME/);
});
test('type-only imports and exports are not runtime', t => {
  assert.equal(runtimeGraph(fixture(t,{...base,'src/main.ts':"import type { Scene } from 'three'; export type { Scene } from 'three'; import {type Mesh} from 'three';"}),['src/main.ts']).size,1);
});
test('unresolved local helper fails closed', t => {
  assert.throws(()=>runtimeGraph(fixture(t,{...base,'src/main.ts':"import '@/missing';"}),['src/main.ts']),/UNRESOLVED_LOCAL/);
});
test('dynamic local import and CommonJS require follow the same graph', t => {
  assert.throws(()=>runtimeGraph(fixture(t,{...base,'src/main.ts':"import('./helper');",'src/helper.ts':"const x = require('three');"}),['src/main.ts']),/FORBIDDEN_RUNTIME/);
});
const auditPath='public/images/universe/candidates/audit.json';
const audit=JSON.stringify({images:[{name:'fixture',sha256:sha256('TEST IMAGE')}],videos:[{name:'fixture',sha256:sha256('TEST VIDEO')}]});
const candidates={ [auditPath]:audit, 'public/images/universe/fixture.png':'TEST IMAGE', 'public/images/universe/candidates/fixture.webp':'TEST WEBP', 'public/images/universe/candidates/fixture.avif':'TEST AVIF', 'public/video/fixture.mp4':'TEST VIDEO', 'public/video/fixture-web.mp4':'TEST CANDIDATE VIDEO' };
test('complete synthetic candidate contract passes',t=>assert.deepEqual(validateCandidates(fixture(t,candidates)),{images:1,videos:1}));
for(const missing of [auditPath,'public/images/universe/candidates/fixture.webp','public/images/universe/candidates/fixture.avif','public/video/fixture-web.mp4','public/video/fixture.mp4']) {
  test('candidate missing input fails: '+missing,t=>{
    const files={...candidates}; delete files[missing];
    assert.throws(()=>validateCandidates(fixture(t,files)),/CANDIDATE_INPUTS_REQUIRED/);
  });
}
for(const invalid of ['not json','{}','{"images":[],"videos":[]}']) {
  test('candidate invalid schema fails: '+invalid,t=>assert.throws(()=>validateCandidates(fixture(t,{...candidates,[auditPath]:invalid})),/CANDIDATE_/));
}
test('candidate original hash mismatch fails',t=>assert.throws(()=>validateCandidates(fixture(t,{...candidates,'public/images/universe/fixture.png':'CHANGED'})),/HASH_MISMATCH/));
test('runtime candidate or web intro activation fails',()=>{
  assert.throws(()=>assertRuntimeMedia('/images/universe/candidates/a.webp'),/UNAPPROVED/);
  assert.throws(()=>assertRuntimeMedia('/video/intro-web.mp4'),/UNAPPROVED/);
});
test('case mismatch and LFS pointer fail',t=>{
  const root=fixture(t,{'media/A.png':'fixture','media/p.mp4':'version https://git-lfs.github.com/spec/v1'});
  assert.throws(()=>exactFile(root,'media/a.png'),/CASE_OR_MISSING/);
  assert.throws(()=>exactFile(root,'media/p.mp4'),/NOT_RESTORED/);
});
