// Invoke with the supported Browser runtime's tab; no second browser driver.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

export async function inspectHero(tab) {
  const result = await tab.playwright.evaluate(() => {
    const entry = document.querySelector('[data-handbook-entry="hero"]');
    const image = entry.querySelector("img");
    const rect = element => { const r = element.getBoundingClientRect(); return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height }; };
    const e = rect(entry), s = getComputedStyle(entry);
    const intersects = (a,b) => Math.min(a.right,b.right)-Math.max(a.left,b.left) > 1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top) > 1;
    const selectors = [".creator-hero__title > span:first-child", ".creator-hero__title-accent", ".creator-hero__description", ".creator-search", ".creator-header", ".creator-hero__primary-entry", ".personal-brand-showcase-float", ".platform-navigator"];
    const collisions = selectors.filter(selector => { const p=document.querySelector(selector); return p && intersects(e,rect(p)); });
    const copyControlCollisions = [];
    for (const copy of [".creator-hero__eyebrow", ".creator-hero__title > span:first-child", ".creator-hero__title-accent", ".creator-hero__description", ".creator-search"]) {
      for (const control of [".creator-hero__primary-entry", ".personal-brand-showcase-float", ".creator-header"]) {
        if (intersects(rect(document.querySelector(copy)),rect(document.querySelector(control)))) copyControlCollisions.push(`${copy} / ${control}`);
      }
    }
    const clipping = [];
    for (let p=entry.parentElement;p;p=p.parentElement) {
      const c=getComputedStyle(p), r=rect(p);
      if ((/hidden|clip/.test(c.overflowX) && (e.left<r.left-1 || e.right>r.right+1)) || (/hidden|clip/.test(c.overflowY) && (e.top<r.top-1 || e.bottom>r.bottom+1))) clipping.push(p.className || p.tagName);
    }
    const hits = [[.5,.5],[.15,.2],[.85,.2],[.2,.85],[.8,.85]].map(([x,y]) => entry.contains(document.elementFromPoint(e.left+e.width*x,e.top+e.height*y)));
    return { entry:e, image:{...rect(image),src:image.currentSrc,complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight}, display:s.display, opacity:s.opacity, visibility:s.visibility, collisions, copyControlCollisions, clipping, hits, overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth, hero:rect(document.querySelector(".creator-hero")), viewport:{width:document.documentElement.clientWidth,height:innerHeight} };
  });
  assert.notEqual(result.display,"none"); assert.equal(result.visibility,"visible"); assert.equal(result.opacity,"1");
  assert.equal(result.image.complete,true); assert.ok(result.image.naturalWidth>0);
  assert.ok(result.image.src.endsWith("/images/editing-handbook/book-entry.png"));
  assert.equal(result.collisions.length,0,JSON.stringify(result.collisions));
  assert.equal(result.copyControlCollisions.length,0,JSON.stringify(result.copyControlCollisions));
  assert.equal(result.clipping.length,0,JSON.stringify(result.clipping));
  assert.ok(result.hits.every(Boolean),"Five distinct points on the book link must be reachable");
  assert.equal(result.overflow,false);
  assert.ok(result.entry.left>=0 && result.entry.right<=result.viewport.width+1);
  assert.ok(result.hero.bottom<=result.viewport.height+1,"Screenshot viewport must include the full Hero");
  return result;
}

export async function captureHero(tab, path) {
  // Call separately after the prepared page has painted; no batched stale captures.
  const result = await inspectHero(tab);
  await writeFile(path,await tab.screenshot({}));
  await writeFile(path.replace(/\.jpg$/,".ax.txt"),await tab.ax.get());
  return result;
}

export async function exerciseHero(tab) {
  const entry=tab.playwright.locator('[data-handbook-entry="hero"]');
  assert.equal(await entry.getAttribute("href"),"/ex-ai/editing/handbook/");
  const search=tab.playwright.getByRole("searchbox",{name:"搜尋課程、資源與創作主題"});
  await search.fill("剪輯"); assert.equal(await search.getAttribute("type"),"search"); await search.fill("");
  await tab.playwright.getByRole("button",{name:"切換至 創作者學院",exact:true}).click();
  assert.equal(await tab.playwright.getByRole("button",{name:"切換至 創作者學院",exact:true}).getAttribute("aria-pressed"),"true");
  await tab.playwright.getByRole("button",{name:"切換至 AI 影片製作",exact:true}).click();
  for (const name of ["進入 AI 影片製作工作室","開啟 Ernest 個人品牌展示站"]) assert.ok(await tab.playwright.getByRole("link",{name,exact:true}).getAttribute("href"));
  await entry.click();
  assert.ok(await tab.playwright.locator("[data-handbook-intro][open]").isVisible());
  await tab.ax.pressKey(null,"Escape");
  assert.equal(await entry.evaluate(element=>element===document.activeElement),true);
  await entry.press("Tab"); await tab.ax.pressKey(null,"Shift+Tab");
  const focus=await entry.evaluate(element=>({focused:element===document.activeElement,visible:element.matches(":focus-visible"),outline:getComputedStyle(element).outlineWidth}));
  assert.equal(focus.focused,true); assert.equal(focus.visible,true); assert.notEqual(focus.outline,"0px");
  await entry.press("Enter");
  assert.ok(await tab.playwright.locator("[data-handbook-intro][open]").isVisible());
  await tab.playwright.getByRole("link",{name:"開始閱讀剪片說明書 →",exact:true}).click();
  await tab.playwright.waitForURL("http://127.0.0.1:4327/ex-ai/editing/handbook/");
  assert.ok(await tab.playwright.getByRole("heading",{name:"剪片說明書",exact:true}).isVisible());
  return {pointer:"PASS",keyboard:"PASS",focus:"PASS",intro:"PASS",handbookNavigation:"PASS",searchInput:"EDITABLE",platformSwitch:"PASS"};
}
