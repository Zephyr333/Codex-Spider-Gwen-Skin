import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { browser } from './browser.mjs';
import { fixture } from './fixtures.mjs';

const source = await readFile(new URL('../codex-plus-plus/spider-gwen-immersive.js', import.meta.url), 'utf8');
let page;
before(async () => { page = await browser(); });
after(async () => { await page?.close(); });
async function load(options = {}, disabled = false) {
  await page.content(fixture(options));
  await page.evaluate(`window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'}; window.__CODEX_DREAM_SKIN_DISABLED__=${disabled}; window.__CODEX_PLUS_EXTERNAL_DREAM_SKIN_RUNTIME__=true; window.__CODEX_DREAM_SKIN_STATE__={ensure(){window.baseEnsureCalls=(window.baseEnsureCalls||0)+1}}`);
  await page.evaluate(source);
}
const diagnostics = () => page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.getDiagnostics()');

test('modern engine, hidden cached page and outer wrapper: choose active content', async () => {
  await load();
  assert.equal(await page.evaluate('document.querySelector("[data-spider-gwen-role=shell-main]")?.id'), 'active');
  const state = await diagnostics();
  assert.equal(state.dreamSkinReady, true);
  assert.equal(state.capabilities.activeComposer, true);
  assert.equal(await page.evaluate('window.baseEnsureCalls || 0'), 0, 'enhancement must not restart base engine');
});

test('explicitly disabled base removes all enhancement, even with stale active marker', async () => {
  await load({}, true);
  assert.equal(await page.evaluate('document.querySelectorAll("#codex-spider-gwen-immersive-style, [data-spider-gwen-role]").length'), 0);
  assert.equal((await diagnostics()).mode, 'inactive');
});

test('ChatGPT conversation composer is recognized without Codex-only markers', async () => {
  await load({ product: 'ChatGPT', placement: 'thread', hiddenFirst: false });
  const state = await diagnostics();
  assert.equal(state.pageKind, 'chatgpt-chat-thread');
  assert.equal(state.capabilities.activeComposer, true);
});

test('collapsed sidebar does not disable the active theme', async () => {
  await load({ sidebar: false });
  assert.equal((await diagnostics()).mode, 'full');
});

test('Codex++ 1.4 top-fade rule must not hide the new content-bearing wrapper', async () => {
  await page.content(fixture());
  await page.evaluate(`{
    document.documentElement.setAttribute('data-dream-art-wide','true');
    const main=document.getElementById('active');
    const wrapper=document.createElement('div');wrapper.setAttribute('data-app-shell-main-content-top-fade','visible');wrapper.style.cssText='display:flex;flex-direction:column;flex:1;min-height:0';
    const content=document.createElement('div');content.setAttribute('data-app-shell-focus-area','main');content.style.cssText='display:flex;flex-direction:column;flex:1;min-height:0';
    [...main.children].filter(n=>n.tagName!=='HEADER').forEach(n=>content.appendChild(n));wrapper.appendChild(content);main.appendChild(wrapper);
    const base=document.createElement('style');base.textContent='html[data-dream-skin="active"][data-dream-art-wide="true"] main:is(.main-surface,[data-app-shell-main-surface],[class*="_MainContentSurface_"]) :is(.app-shell-main-content-top-fade,[data-app-shell-main-content-top-fade],[class*="_MainContentTopFade_"]){display:none!important;background:transparent!important}';document.head.appendChild(base);
    window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'};window.__CODEX_DREAM_SKIN_DISABLED__=false;
  }`);
  await page.evaluate(source);
  assert.equal(await page.evaluate('getComputedStyle(document.querySelector("[data-app-shell-main-content-top-fade]")).display'), 'flex');
  assert.equal((await diagnostics()).capabilities.activeComposer, true);
  assert.equal(await page.evaluate('document.querySelector("[role=textbox]:not([hidden])").closest("[hidden]") !== null'), true, 'cached editor stays hidden');
  assert.equal(await page.evaluate('document.querySelector("#active [role=textbox]").getBoundingClientRect().height > 0'), true);
});

for (const product of ['Codex', 'ChatGPT']) for (const placement of ['home', 'thread']) for (const work of product === 'ChatGPT' ? [false, true] : [false]) {
  test(`${product} ${work ? 'Work' : ''} ${placement}: visible native composer and no layout changes`, async () => {
    await page.content(fixture({ product, placement, work }));
    const before = await page.evaluate('(()=>{const r=document.querySelector("#active .ComposerLayoutRoot").getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()');
    await page.evaluate("window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'};window.__CODEX_DREAM_SKIN_DISABLED__=false");
    await page.evaluate(source);
    const state = await diagnostics();
    assert.equal(state.pageKind, `${product === 'Codex' ? 'codex' : work ? 'chatgpt-work' : 'chatgpt-chat'}-${placement}`);
    const after = await page.evaluate('(()=>{const r=document.querySelector("#active .ComposerLayoutRoot").getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()');
    assert.deepEqual(after, before);
    const check = await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck()');
    assert.deepEqual(check.issues, []);
    assert.equal(check.ok, true);
  });
}

test('pause, theme switch, late mount and hot reload clean owned state', async () => {
  await load();
  await page.evaluate('window.staleRuntime=window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__');
  await page.evaluate(source);
  await page.evaluate('window.staleRuntime.destroy()');
  assert.equal((await diagnostics()).mode, 'full');
  await page.evaluate("window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'other'};window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()");
  assert.equal(await page.evaluate('document.querySelectorAll("[data-spider-gwen-role], #codex-spider-gwen-immersive-style").length'), 0);
  assert.equal(await page.evaluate('document.documentElement.getAttribute("data-dream-skin")'), 'active');
  await page.evaluate("window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'};window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();window.__CODEX_DREAM_SKIN_DISABLED__=true;window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()");
  assert.equal((await diagnostics()).mode, 'inactive');
  await page.evaluate("window.__CODEX_DREAM_SKIN_DISABLED__=false;document.documentElement.removeAttribute('data-dream-skin');window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()");
  assert.equal((await diagnostics()).mode, 'base-only');
  await page.evaluate("document.documentElement.setAttribute('data-dream-skin','active');window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()");
  assert.equal((await diagnostics()).mode, 'full');
});

test('route switch cleans detached nodes and does not spin on its own writes', async () => {
  await load();
  await page.evaluate(`window.oldMain=document.getElementById('active');const fresh=oldMain.cloneNode(true);fresh.querySelector('[data-composer-placement]').setAttribute('data-composer-placement','thread');fresh.querySelectorAll('[data-spider-gwen-role]').forEach(n=>n.removeAttribute('data-spider-gwen-role'));fresh.removeAttribute('data-spider-gwen-role');oldMain.replaceWith(fresh)`);
  await new Promise(r => setTimeout(r, 300));
  assert.equal((await diagnostics()).pageKind, 'codex-thread');
  assert.equal(await page.evaluate('oldMain.hasAttribute("data-spider-gwen-role")'), false);
  const count = (await diagnostics()).metrics.ensurePasses;
  await new Promise(r => setTimeout(r, 600));
  assert.ok((await diagnostics()).metrics.ensurePasses - count <= 2, 'observer must settle');
});

test('narrow and zoom-like viewports retain controls and local code scrolling', async () => {
  for (const width of [480, 768, 1024, 1440]) {
    await page.send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1.5, mobile: false });
    await load({ sidebar: width >= 1024, placement: 'thread' });
    assert.deepEqual((await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck()')).issues, [], `width=${width}`);
    assert.equal(await page.evaluate('(()=>{const n=document.getElementById("send"),r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})()'), true);
  }
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
});

test('legacy engine is read without invoking it; auxiliary pet surface is excluded', async () => {
  await load({ engine: 'legacy' });
  assert.equal((await diagnostics()).engine, 'legacy');
  await page.evaluate('document.body.insertAdjacentHTML("beforeend", "<div data-avatar-mascot=\"true\"></div>")'.replace('data-avatar-mascot="true"', 'data-avatar-mascot=true'));
  await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  assert.equal((await diagnostics()).reason, 'excluded-pet-window');
  assert.equal(await page.evaluate('document.querySelectorAll("[data-spider-gwen-role]").length'), 0);
});
