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
    assert.equal(await page.evaluate('(()=>{const code=document.querySelector("#active pre");return code.scrollWidth>code.clientWidth&&getComputedStyle(code).overflowX==="auto"&&document.documentElement.scrollWidth<=innerWidth+1})()'), true, `local code scrolling at width=${width}`);
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

// New shell: application header is a sibling of main; the footer carries an
// empty opaque scrim, while the summary panel has unrelated nested headers.
async function modernShell() {
  await page.content(fixture({ placement: 'thread', hiddenFirst: false }));
  await page.evaluate(`{
    const main=document.getElementById('active');
    const header=main.querySelector('header');header.id='application-header';
    header.setAttribute('data-app-shell-titlebar','true');
    header.style.cssText='position:fixed;top:44px;left:280px;width:calc(100% - 280px);height:50px';
    main.before(header);
    main.querySelector('section').insertAdjacentHTML('beforeend','<aside data-summary-panel-variant="default"><header id="summary-header">Sources</header></aside>');
    const host=main.querySelector('[data-codex-composer-root]');
    const footer=document.createElement('div');footer.setAttribute('data-thread-scroll-footer','true');
    footer.style.cssText='position:relative;flex:none';host.before(footer);
    footer.innerHTML='<div id="footer-scrim" aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;background:rgb(24,24,24)"></div>';
    footer.appendChild(host);
    window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'};
    window.__CODEX_DREAM_SKIN_DISABLED__=false;
  }`);
  await page.evaluate(source);
}

test('external application header is selected; summary panel headers stay native', async () => {
  await modernShell();
  assert.equal(await page.evaluate('document.querySelector("[data-spider-gwen-role=shell-header]")?.id'), 'application-header');
  assert.equal(await page.evaluate('document.getElementById("summary-header").hasAttribute("data-spider-gwen-role")'), false);
});

test('only empty noninteractive footer scrim loses background; controls remain native', async () => {
  await modernShell();
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("footer-scrim")).backgroundColor'), 'rgba(0, 0, 0, 0)');
  await page.evaluate('document.getElementById("footer-scrim").innerHTML="<button>Permission required</button>";window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  assert.equal(await page.evaluate('document.getElementById("footer-scrim").hasAttribute("data-spider-gwen-role")'), false);
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("footer-scrim")).backgroundColor'), 'rgb(24, 24, 24)');
});

test('semantic composer survives generated class replacement and intermediate wrappers', async () => {
  await page.content(fixture({ hiddenFirst: false }));
  await page.evaluate(`{
    for (const [selector,attribute] of [['.ComposerLayoutRoot','data-composer-surface-variant'],['.ComposerLayoutBody','data-composer-body'],['.ComposerLayoutFooter','data-composer-footer-responsive']]) {
      const node=document.querySelector(selector);node.setAttribute(attribute,'default');node.className='renamed-after-update';
    }
    const editor=document.querySelector('[role=textbox]');const wrapper=document.createElement('div');editor.before(wrapper);wrapper.appendChild(editor);
    window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'};
  }`);
  await page.evaluate(source);
  assert.equal((await diagnostics()).capabilities.composer, true);
  assert.equal(await page.evaluate('document.querySelectorAll("[data-spider-gwen-role=composer-body], [data-spider-gwen-role=composer-footer]").length'), 2);
});

test('ambiguous main preserves essential repair and never reports core usability', async () => {
  await load({ hiddenFirst: false });
  await page.evaluate(`{
    const main=document.getElementById('active');const other=main.cloneNode(true);other.id='other';
    other.querySelectorAll('[data-spider-gwen-role]').forEach(n=>n.removeAttribute('data-spider-gwen-role'));other.removeAttribute('data-spider-gwen-role');main.after(other);
    window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
  }`);
  assert.equal((await diagnostics()).reason, 'ambiguous-main');
  assert.equal(await page.evaluate('!!document.getElementById("codex-spider-gwen-compatibility-style")'), true);
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().usable'), false);
});

test('optional header exception degrades only that module; core composer remains usable', async () => {
  await modernShell();
  await page.evaluate('document.getElementById("application-header").getBoundingClientRect=()=>{throw new Error("header replaced during render")};window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  const state = await diagnostics();
  assert.equal(state.mode, 'degraded');
  assert.ok(state.moduleErrors.header);
  assert.equal(state.capabilities.activeComposer, true);
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().usable'), true);
  await page.evaluate('delete document.getElementById("application-header").getBoundingClientRect;window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  assert.equal((await diagnostics()).mode, 'full');
});

test('essential top-fade repair survives enhancement exception and late base stylesheet', async () => {
  await load({ hiddenFirst: false, placement: 'thread' });
  await page.evaluate(`{
    const main=document.getElementById('active');
    const wrapper=document.createElement('div');wrapper.setAttribute('data-app-shell-main-content-top-fade','visible');
    const content=document.createElement('div');content.setAttribute('data-app-shell-focus-area','main');
    [...main.children].forEach(n=>content.appendChild(n));wrapper.appendChild(content);main.appendChild(wrapper);
    const base=document.createElement('style');base.textContent='html[data-dream-skin="active"][data-dream-art-wide="true"] main[data-app-shell-main-surface] [data-app-shell-main-content-top-fade]{display:none!important}';document.head.appendChild(base);
    document.documentElement.setAttribute('data-dream-art-wide','true');
    main.getBoundingClientRect=()=>{throw new Error('transient main measurement error')};
    window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
  }`);
  assert.equal((await diagnostics()).reason, 'ensure-error');
  assert.equal(await page.evaluate('getComputedStyle(document.querySelector("[data-app-shell-main-content-top-fade]")).display'), 'flex');
  assert.equal(await page.evaluate('!!document.getElementById("codex-spider-gwen-immersive-style")'), false);
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().usable'), false);
});

test('late composer mount recovers automatically without refresh or explicit ensure', async () => {
  await load({ hiddenFirst: false });
  await page.evaluate('window.delayedComposer=document.querySelector("#active [data-codex-composer-root]");delayedComposer.remove()');
  await new Promise(r => setTimeout(r, 250));
  assert.equal((await diagnostics()).capabilities.activeComposer, false);
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().usable'), false);
  await page.evaluate('document.getElementById("active").appendChild(delayedComposer)');
  await new Promise(r => setTimeout(r, 250));
  assert.equal((await diagnostics()).mode, 'full');
});

test('30 route replacements and 20 hot reloads leave only current owned resources', async () => {
  await load({ hiddenFirst: false });
  for (let i = 0; i < 30; i++) {
    await page.evaluate(`{
      const old=document.getElementById('active');const next=old.cloneNode(true);
      next.querySelectorAll('[data-spider-gwen-role]').forEach(n=>n.removeAttribute('data-spider-gwen-role'));next.removeAttribute('data-spider-gwen-role');
      next.querySelector('[data-composer-placement]').setAttribute('data-composer-placement','${i % 2 ? 'home' : 'thread'}');
      old.replaceWith(next);window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
      if(old.hasAttribute('data-spider-gwen-role'))throw Error('detached main retains owned state');
    }`);
  }
  for (let i = 0; i < 20; i++) {
    await page.evaluate('window.stale=window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__');
    await page.evaluate(source);
    await page.evaluate('stale.destroy()');
  }
  assert.deepEqual(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().singletons'), { style: 1, chrome: 1, compatibility: 1 });
  await page.evaluate('window.stopped=window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__;stopped.destroy()');
  const before = await page.evaluate('stopped.metrics.ensurePasses');
  await new Promise(r => setTimeout(r, 1700));
  assert.equal(await page.evaluate('stopped.metrics.ensurePasses'), before);
  assert.equal(await page.evaluate('document.querySelectorAll("[data-spider-gwen-role], [data-spider-gwen-compatibility], #codex-spider-gwen-compatibility-style").length'), 0);
});

test('streaming message buttons and pseudo changes do not trigger continuous shell scans', async () => {
  await load({ hiddenFirst: false, placement: 'thread' });
  await new Promise(r => setTimeout(r, 150));
  const before = (await diagnostics()).metrics.ensurePasses;
  await page.evaluate(`new Promise(resolve=>{
    const message=document.querySelector('article[data-message-author-role=assistant]');let count=0;
    const id=setInterval(()=>{message.insertAdjacentHTML('beforeend','<p>Streamed text <button aria-label="Copy chunk">Copy</button></p>');
      if(++count===100){clearInterval(id);resolve();}},10);
  })`);
  await new Promise(r => setTimeout(r, 150));
  assert.ok((await diagnostics()).metrics.ensurePasses - before <= 2);
});

test('only proven empty legacy home spacer is repaired; reordered real banners retain layout', async () => {
  await page.content(fixture({ hiddenFirst: false }));
  await page.evaluate(`{
    document.documentElement.setAttribute('data-dream-art-wide','true');
    const main=document.getElementById('active');
    const layout=document.createElement('div');layout.className='group/home-composer-layout';
    layout.innerHTML='<div id="real-banner">Announcement <button>Learn more</button></div><div id="empty-spacer"></div>';
    main.querySelector('section').appendChild(layout);
    const base=document.createElement('style');base.textContent='html[data-dream-skin="active"][data-dream-art-wide="true"] main[data-app-shell-main-surface] [class*="group/home-composer-layout"] > div{min-height:440px!important;flex:0 0 440px!important}';document.head.appendChild(base);
    window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'};
  }`);
  await page.evaluate(source);
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("real-banner")).minHeight'), '440px');
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("empty-spacer")).minHeight'), '0px');
  await page.evaluate('document.getElementById("empty-spacer").textContent="New content"');
  await new Promise(r => setTimeout(r, 250));
  assert.equal(await page.evaluate('document.getElementById("empty-spacer").hasAttribute("data-spider-gwen-empty-home-slot")'), false);
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("empty-spacer")).minHeight'), '440px');
});

test('ambiguous decoration and missing visual composer degrade without touching core controls', async () => {
  await modernShell();
  await page.evaluate(`{
    const decor=document.getElementById('footer-scrim');const other=decor.cloneNode(true);other.id='second-scrim';other.removeAttribute('data-spider-gwen-role');decor.after(other);
    window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
  }`);
  assert.equal((await diagnostics()).mode, 'degraded');
  assert.equal((await diagnostics()).anchors.footerDecoration, 'ambiguous-footer-decoration');
  assert.equal(await page.evaluate('document.querySelectorAll("[data-spider-gwen-role=footer-decoration]").length'), 0);
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().usable'), true);
  await load({ hiddenFirst: false });
  await page.evaluate('document.querySelector(".ComposerLayoutRoot").className="future-unrecognized-surface";window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  assert.equal((await diagnostics()).mode, 'degraded');
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().usable'), true);
});

test('separate sticky scroll fade is repaired only next to the native footer', async () => {
  await modernShell();
  await page.evaluate(`{
    const main=document.getElementById('active');main.setAttribute('data-app-action-timeline-scroll','');
    const footer=main.querySelector('[data-thread-scroll-footer]');const r=footer.getBoundingClientRect();
    const sticky=document.createElement('div');sticky.style.cssText='position:sticky;height:0;pointer-events:none';
    sticky.innerHTML='<div aria-hidden="true" id="sticky-fade" style="position:absolute;width:'+r.width+'px;height:32px;pointer-events:none;background:linear-gradient(to top,#181818,transparent)"></div>';
    footer.before(sticky);window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
  }`);
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("sticky-fade")).backgroundImage'), 'none');
  await page.evaluate('document.getElementById("sticky-fade").innerHTML="<button>Important</button>"');
  await new Promise(r => setTimeout(r, 250));
  assert.equal(await page.evaluate('document.getElementById("sticky-fade").hasAttribute("data-spider-gwen-role")'), false);
});

test('external selected settings navigation identifies a composer-free native settings page', async () => {
  await page.content(fixture({ hiddenFirst: false }));
  await page.evaluate(`{
    document.querySelector('aside').insertAdjacentHTML('beforeend','<button data-settings-panel-slug="general-settings" aria-current="page">General</button>');
    const main=document.getElementById('active');main.querySelector('[data-codex-composer-root]').remove();
    main.querySelector('section').outerHTML='<div id="settings-surface" style="flex:1;width:100%;background:#181818"><h1>General</h1><button>Native setting</button></div>';
    window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'};
  }`);
  await page.evaluate(source);
  assert.equal((await diagnostics()).pageKind, 'settings');
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().usable'), true);
  assert.equal(await page.evaluate('document.getElementById("settings-surface").getAttribute("data-spider-gwen-role")'), 'settings-surface');
});

test('failed old destroy falls back to owned cleanup; new destroy leaves no stale markers', async () => {
  await modernShell();
  await page.evaluate('window.failedOld=window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__;failedOld.destroy=()=>{throw Error("old destroy failed")};window.oldPasses=failedOld.metrics.ensurePasses');
  await page.evaluate(source);
  assert.match((await diagnostics()).bootstrapError, /old destroy failed/);
  assert.equal((await diagnostics()).mode, 'full');
  await new Promise(r => setTimeout(r, 1700));
  assert.equal(await page.evaluate('failedOld.metrics.ensurePasses'), await page.evaluate('oldPasses'));
  await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.destroy()');
  assert.equal(await page.evaluate('document.querySelectorAll("[data-spider-gwen-role], [data-spider-gwen-compatibility], #codex-spider-gwen-compatibility-style").length'), 0);
});

test('base observer coexists with enhancement; equal-value host writes settle', async () => {
  await page.content(fixture({ hiddenFirst: false }));
  await page.evaluate(`{
    window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'};
    window.baseObserver=new MutationObserver(records=>{
      for(const r of records){if(r.oldValue===r.target.getAttribute('class'))continue;
        if(r.target.tagName==='MAIN'&&!r.target.classList.contains('base-surface'))r.target.classList.add('base-surface');}
    });
    baseObserver.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});
  }`);
  try {
    await page.evaluate(source);
    await new Promise(r => setTimeout(r, 250));
    const before = (await diagnostics()).metrics.ensurePasses;
    await page.evaluate('for(let i=0;i<100;i++)document.documentElement.setAttribute("class",document.documentElement.className)');
    await new Promise(r => setTimeout(r, 600));
    assert.ok((await diagnostics()).metrics.ensurePasses - before <= 1);
    assert.equal((await diagnostics()).mode, 'full');
  } finally { await page.evaluate('baseObserver.disconnect()'); }
});
