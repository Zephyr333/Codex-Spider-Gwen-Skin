import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { browser } from './browser.mjs';
import { fixture } from './fixtures.mjs';
const source=await readFile(new URL('../codex-plus-plus/spider-gwen-immersive.js',import.meta.url),'utf8');
let page;
before(async()=>{page=await browser()});after(async()=>{await page?.close()});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const diagnostics=()=>page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.getDiagnostics()');
async function load(){await page.content(fixture({placement:'thread',hiddenFirst:false}));await page.evaluate("window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'}");await page.evaluate(source);await wait(250)}

test('30 second visible idle performs health checks without full scanning',async()=>{
 await load();const before=await diagnostics();await wait(30000);const after=await diagnostics();
 assert.equal(after.metrics.fullScans,before.metrics.fullScans);assert.equal(after.metrics.ensurePasses,before.metrics.ensurePasses);assert.ok(after.metrics.healthChecks-before.metrics.healthChecks>=5);
});

test('60 seconds of streaming has no full scans and no component reconciliations',async()=>{
 await load();const before=await diagnostics();
 for(let chunk=0;chunk<60;chunk++) await page.evaluate(`new Promise(resolve=>{let i=0;const message=document.querySelector('article[data-message-author-role=assistant]');const interval=setInterval(()=>{message.appendChild(document.createTextNode(' streamed'));if(++i===10){clearInterval(interval);resolve()}},100)})`);
 const after=await diagnostics();assert.equal(after.metrics.fullScans,before.metrics.fullScans);assert.equal(after.metrics.componentUpdates,before.metrics.componentUpdates);
});

test('late code component reconciles locally and unknown shape releases owned paint',async()=>{
 await load();const before=await diagnostics();
 await page.evaluate(`document.querySelector('article[data-message-author-role=assistant]').insertAdjacentHTML('beforeend','<div data-local-conversation-item-target-ids="incremental"><div class="group/activity-header" id="inc-header"><button aria-expanded="false" aria-labelledby="inc-title"></button><span id="inc-title">Tool</span></div></div>')`);await wait(180);
 assert.equal(await page.evaluate('document.getElementById("inc-header").getAttribute("data-spider-gwen-surface")'),'activity-header');
 assert.equal((await diagnostics()).metrics.fullScans,before.metrics.fullScans);
 await page.evaluate('document.getElementById("inc-header").className="future-unknown"');await wait(180);
 assert.equal(await page.evaluate('document.getElementById("inc-header").hasAttribute("data-spider-gwen-surface")'),false);
});

test('missing stylesheet recovers after a lost observer notification',async()=>{
 await load();await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.observer.disconnect();document.getElementById("codex-spider-gwen-immersive-style").remove()');await wait(5300);
 assert.equal(await page.evaluate('!!document.getElementById("codex-spider-gwen-immersive-style")'),true);
 assert.equal((await diagnostics()).mode,'full');
});

test('hidden window has no periodic work and resumes missed changes immediately',async()=>{
 await load();await page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"))');const before=await diagnostics();await wait(5300);const after=await diagnostics();
 assert.equal(after.metrics.healthChecks,before.metrics.healthChecks);assert.equal(after.metrics.ensurePasses,before.metrics.ensurePasses);
 await page.evaluate('document.getElementById("codex-spider-gwen-background").remove();Object.defineProperty(document,"hidden",{configurable:true,get:()=>false});document.dispatchEvent(new Event("visibilitychange"))');await wait(180);
 assert.equal(await page.evaluate('!!document.getElementById("codex-spider-gwen-background")'),true);
});

test('active native ChatGPT editor outranks stale Codex mode label',async()=>{
 await page.content(fixture({product:'ChatGPT',placement:'thread',hiddenFirst:false}));await page.evaluate("document.querySelector('button[aria-label*=\"Switch mode\"]').setAttribute('aria-label','Switch mode, current mode: Codex');window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'}");await page.evaluate(source);
 assert.equal((await diagnostics()).pageKind,'chatgpt-chat-thread');
});

test('100 route replacements and 50 reloads keep resources bounded and stale runtimes stopped',async()=>{
 await load();for(let i=0;i<100;i++)await page.evaluate(`{const old=document.getElementById('active');const next=old.cloneNode(true);next.removeAttribute('data-spider-gwen-role');old.replaceWith(next);window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();if(old.hasAttribute('data-spider-gwen-role'))throw Error('stale owned role')}`);
 for(let i=0;i<50;i++)await page.evaluate(source);
 assert.deepEqual(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().singletons'),{style:1,chrome:1,compatibility:1});
 await page.evaluate('window.stale=window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__;stale.destroy()');const before=await page.evaluate('stale.metrics.ensurePasses');await wait(180);assert.equal(await page.evaluate('stale.metrics.ensurePasses'),before);assert.equal(await page.evaluate('document.querySelectorAll("#codex-spider-gwen-background,[data-spider-gwen-surface]").length'),0);
});

test('equal root writes and wrapped tool mounts avoid full shell discovery',async()=>{
 await load();const before=await diagnostics();
 await page.evaluate(`{
   for(let i=0;i<100;i++)document.documentElement.setAttribute('data-dream-skin','active');
   document.querySelector('article[data-message-author-role=assistant]').insertAdjacentHTML('beforeend','<div><div data-local-conversation-item-target-ids="wrapped"><div class="group/activity-header" id="wrapped-header"><button aria-expanded="false" aria-labelledby="wrapped-title"></button><span id="wrapped-title">Tool</span></div></div></div>');
 }`);await wait(180);
 assert.equal((await diagnostics()).metrics.fullScans,before.metrics.fullScans);
 assert.equal(await page.evaluate('document.getElementById("wrapped-header").getAttribute("data-spider-gwen-surface")'),'activity-header');
});

test('optional module exception preserves core controls and unrelated card ownership',async()=>{
 await load();
 await page.evaluate('document.querySelector("#active header").getBoundingClientRect=()=>{throw Error("header failure")};window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
 const d=await diagnostics();assert.equal(d.modules.header.status,'degraded');assert.equal(d.capabilities.activeComposer,true);
 assert.equal(await page.evaluate('document.querySelector("article pre").getAttribute("data-spider-gwen-surface")'),'code-surface');
});

test('cached page visibility change switches active identity without waiting for guard',async()=>{
 await load();
 await page.evaluate(`{
   window.oldPage=document.getElementById('active');window.nextPage=oldPage.cloneNode(true);nextPage.hidden=true;
   oldPage.parentElement.appendChild(nextPage);
 }`);await wait(180);
 await page.evaluate('oldPage.hidden=true;nextPage.hidden=false');await wait(180);
 assert.equal(await page.evaluate('document.querySelector("[data-spider-gwen-role=shell-main]")===nextPage'),true);
 assert.equal((await diagnostics()).mode,'full');
});

test('short semantic main remains authoritative instead of oscillating into outer wrapper',async()=>{
 await load();
 await page.evaluate(`{
   const old=document.getElementById('active'),next=old.cloneNode(true);next.id='short-page';next.style.height='90px';next.style.flex='none';
   old.replaceWith(next);window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
 }`);await wait(180);
 assert.equal(await page.evaluate('document.querySelector("[data-spider-gwen-role=shell-main]").id'),'short-page');
 const before=await diagnostics();await wait(400);
 assert.ok((await diagnostics()).metrics.fullScans-before.metrics.fullScans<=1);
});

test('composer resizing uses browser geometry snapshots without synchronous main measurement',async()=>{
 await load();
 const before=await diagnostics();
 await page.evaluate(`{
   document.getElementById('active').getBoundingClientRect=()=>{throw Error('synchronous layout read during input')};
   document.querySelector('.ComposerLayoutRoot').style.height='140px';
 }`);await wait(300);
 const after=await diagnostics();
 assert.equal(after.metrics.errors,before.metrics.errors);
 assert.equal(after.modules.decoration.status,'ready');
 assert.equal(after.metrics.fullScans,before.metrics.fullScans);
 assert.ok(after.metrics.geometryUpdates>before.metrics.geometryUpdates);
});
