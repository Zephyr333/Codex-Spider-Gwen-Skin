import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { browser } from './browser.mjs';
import { fixture } from './fixtures.mjs';

const source = await readFile(new URL('../codex-plus-plus/spider-gwen-immersive.js', import.meta.url), 'utf8');
let page;
before(async () => { page = await browser(); });
after(async () => { await page?.close(); });

async function load({ utility = false } = {}) {
  await page.content(fixture({ placement: 'thread', hiddenFirst: false }));
  await page.evaluate(`{
    document.documentElement.style.setProperty('--dream-skin-art','linear-gradient(white,white)');
    const section=document.querySelector('#active section');
    section.insertAdjacentHTML('beforeend',
      '<div data-local-conversation-item-target-ids="test-command" id="activity-group">'+
      '<div class="group/activity-header" id="activity-header">'+
      '<button aria-labelledby="activity-title" aria-expanded="false" id="activity-trigger"></button>'+
      '<span class="group-hover/activity-header:text-default"><span id="activity-title" class="group-hover/activity-header:text-default">Ran a command</span></span>'+
      '<span class="pointer-events-none relative flex"><svg aria-hidden="true" viewBox="0 0 20 20" class="icon-2xs opacity-0 group-focus-visible/activity-header:opacity-100" id="activity-chevron"><path d="M7 3L14 10L7 17"/></svg></span></div>'+
      '<div data-testid="exec-shell-body" id="activity-body" hidden><div><div class="group rounded-lg border" id="output-card">'+
      '<div class="group/command"><div role="button" tabindex="0"><code>node example.mjs</code></div></div>'+
      '<div class="group/output"><pre id="output-pre">'+ 'long output '.repeat(100)+'</pre></div></div></div></div></div>'+
      '<div id="file-card"><div class="group/turn-diff-header"><button aria-label="View changed files"></button><span>Changed files</span></div><div><div class="group/turn-diff-file-row"><button>example.ts +4 -2</button></div></div></div>');
    document.getElementById('activity-trigger').onclick=event=>{
      const expanded=event.currentTarget.getAttribute('aria-expanded')==='true';
      event.currentTarget.setAttribute('aria-expanded',String(!expanded));document.getElementById('activity-body').hidden=expanded;
    };
    const css=document.createElement('style');css.textContent=
      '#activity-header{position:relative;display:inline-flex;gap:4px;align-items:center;max-width:100%}'+
      '#activity-trigger{position:absolute;inset:0;background:transparent}'+
      '#activity-header>span{position:relative;pointer-events:none}'+
      '#activity-chevron{width:14px;height:14px;opacity:0}'+
      '#output-card{background:rgba(255,255,255,.05);border:1px solid #777;border-radius:8px}'+
      '#output-pre{max-width:100%;overflow:auto}';document.head.appendChild(css);
    if(${utility}) {
      const root=document.querySelector('.ComposerLayoutRoot'),host=root.parentElement;
      const core=document.createElement('div');core.style.position='relative';root.before(core);core.appendChild(root);
      core.insertAdjacentHTML('beforeend','<div data-composer-utility-bar="true" id="utility"><button>Project</button></div>');
      host.insertAdjacentHTML('afterbegin','<div role="alert" id="permission">Permission notice</div>');
    }
    window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:'spider-gwen'};
  }`);
  await page.evaluate(source);
}
async function clickTrigger() {
  const point = await page.evaluate('(()=>{const r=document.getElementById("activity-trigger").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 150));
}

test('real activity state classes never receive nested card material or SVG padding', async () => {
  await load();
  const result = await page.evaluate(`(()=>{
    const header=document.getElementById('activity-header'),svg=document.getElementById('activity-chevron'),s=getComputedStyle(svg);
    return {surface:header.getAttribute('data-spider-gwen-surface'),childBackgrounds:[...header.querySelectorAll('span,svg')].map(n=>getComputedStyle(n).backgroundColor),padding:s.padding,opacity:Number(s.opacity),width:svg.getBoundingClientRect().width};
  })()`);
  assert.equal(result.surface, 'activity-header');
  assert.ok(result.childBackgrounds.every(value => value === 'rgba(0, 0, 0, 0)'));
  assert.equal(result.padding, '0px');
  assert.ok(result.opacity >= .8);
  assert.ok(result.width >= 12 && result.width <= 16);
});

test('native expand/collapse mounts one output material; nested code stays transparent', async () => {
  await load();
  await clickTrigger();
  assert.equal(await page.evaluate('document.getElementById("activity-trigger").getAttribute("aria-expanded")'), 'true');
  assert.equal(await page.evaluate('document.getElementById("output-card").getAttribute("data-spider-gwen-surface")'), 'tool-output');
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("output-pre")).backgroundColor'), 'rgba(0, 0, 0, 0)');
  await clickTrigger();
  assert.equal(await page.evaluate('document.getElementById("activity-trigger").getAttribute("aria-expanded")'), 'false');
});

test('worst white wallpaper still gives readable thread text without fading content', async () => {
  await load();
  const check = await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck()');
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("active")).opacity'), '1');
  assert.ok(check.visualChecks?.readingContrast?.minimum >= 4.5);
  assert.equal(check.visualOk, true);
});

test('layered composer material wins against later high-specificity adopted base CSS', async () => {
  await load();
  await page.evaluate(`{
    const sheet=new CSSStyleSheet();sheet.replaceSync('html[data-dream-skin="active"]:has(main#active) main#active [data-composer-layout].ComposerLayoutRoot{background:#181818!important;backdrop-filter:none!important;border-radius:22px!important}');
    document.adoptedStyleSheets=[sheet];
  }`);
  assert.equal(await page.evaluate('getComputedStyle(document.querySelector("[data-spider-gwen-role=composer]"),"::before").backgroundImage.includes("gradient(")'), true);
  assert.equal(await page.evaluate('getComputedStyle(document.querySelector("[data-spider-gwen-role=composer]"),"::before").backdropFilter'), 'blur(14px) saturate(1.04)');
});

test('known utility shares composer frame; permission notice stays outside', async () => {
  await load({ utility: true });
  assert.equal(await page.evaluate('document.getElementById("utility").closest("[data-spider-gwen-surface=composer-frame]")?.contains(document.querySelector("[role=textbox]"))'), true);
  assert.equal(await page.evaluate('document.getElementById("permission").closest("[data-spider-gwen-surface=composer-frame]")'), null);
  const inner = await page.evaluate('(()=>{const n=document.querySelector("[data-spider-gwen-role=composer]");return {background:getComputedStyle(n).backgroundColor,surface:n.getAttribute("data-spider-gwen-surface"),html:n.outerHTML.slice(0,400),owners:[...document.querySelectorAll("[data-spider-gwen-surface]")].map(n=>({tag:n.tagName,id:n.id,kind:n.getAttribute("data-spider-gwen-surface")}))}})()');
  inner.rules = await page.evaluate(`(()=>{const node=document.querySelector('[data-spider-gwen-role=composer]'),out=[];function scan(rules,layer){for(const r of rules){if(r.selectorText&&r.style?.getPropertyValue('background')){try{if(node.matches(r.selectorText))out.push({layer,selector:r.selectorText,bg:r.style.getPropertyValue('background'),priority:r.style.getPropertyPriority('background')});}catch{}}if(r.cssRules)scan(r.cssRules,r.name||layer);}}for(const s of document.styleSheets)scan(s.cssRules,'unlayered');return out;})()`);
  assert.equal(inner.background, 'rgba(0, 0, 0, 0)', JSON.stringify(inner));
});

test('collection ownership cleans detached cards and survives repeat injection', async () => {
  await load();
  assert.ok(await page.evaluate('document.querySelectorAll("[data-spider-gwen-surface]").length') >= 3);
  await page.evaluate('window.detached=document.getElementById("activity-group");detached.remove();window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  assert.equal(await page.evaluate('detached.querySelectorAll("[data-spider-gwen-surface]").length'), 0);
  await page.evaluate(source);
  await page.evaluate('window.__CODEX_PLUS_DREAM_SKIN_THEME__={id:"other"};window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  assert.equal(await page.evaluate('document.querySelectorAll("[data-spider-gwen-surface]").length'), 0);
});

test('visual failure cannot masquerade as functional and structural success', async () => {
  await load();
  await page.evaluate('document.getElementById("active").style.setProperty("background-color","white","important")');
  const check = await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck()');
  assert.equal(check.functionalOk, true);
  assert.equal(check.structuralOk, true);
  assert.equal(check.visualOk, false);
  assert.equal(check.ok, false);
  assert.equal(check.usable, false);
  assert.ok(check.visualIssues.includes('reading-contrast'));
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.getDiagnostics().mode'), 'degraded');
});

test('unknown activity shape releases material and reports incomplete visual coverage', async () => {
  await load();
  await page.evaluate('document.getElementById("activity-header").className="future-native-widget";window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  assert.equal(await page.evaluate('document.getElementById("activity-header").hasAttribute("data-spider-gwen-surface")'), false);
  const check = await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck()');
  assert.ok(check.visualIssues.includes('activity-structure-unrecognized'));
  assert.equal(check.functionalOk, true);
  assert.equal(check.visualOk, false);
});

test('native home rail remains in one decorative frame when an external portal notice appears', async () => {
  await load();
  await page.evaluate(`{
    const host=document.querySelector('[data-codex-composer-root]');host.setAttribute('data-composer-placement','home');
    host.insertAdjacentHTML('afterbegin','<div data-above-composer-portal="true" id="portal"></div><div data-composer-rail><div data-composer-rail-item="present" data-composer-placement="home" id="native-rail"><button>Project</button></div></div>');
    window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
  }`);
  assert.equal(await page.evaluate('document.querySelector("[data-codex-composer-root]").getAttribute("data-spider-gwen-surface")'), 'composer-frame');
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("native-rail")).backgroundColor'), 'rgba(0, 0, 0, 0)');
  await page.evaluate('document.getElementById("portal").innerHTML="<div role=alert>Permission needed</div>";window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  assert.equal(await page.evaluate('document.querySelector("[data-codex-composer-root]").hasAttribute("data-spider-gwen-surface")'), false);
  assert.equal(await page.evaluate('document.querySelector("[data-spider-gwen-role=composer]").getAttribute("data-spider-gwen-surface")'), 'composer-frame');
  assert.equal(await page.evaluate('document.getElementById("native-rail").getAttribute("data-spider-gwen-surface")'), "composer-utility");
  assert.ok(await page.evaluate('parseFloat(document.querySelector("[data-spider-gwen-role=composer]").style.getPropertyValue("--sg-composer-top-extension"))') > 0);
});

test('contained absolute Work rail extends decoration only, without moving native content', async () => {
  await load();
  await page.evaluate(`{
    const root=document.querySelector('[data-spider-gwen-role=composer]');root.style.position='relative';root.style.marginBottom='40px';
    root.insertAdjacentHTML('beforeend','<div data-composer-rail-item="present" data-composer-placement="home" id="below-rail" style="position:absolute;top:100%;height:40px;left:8px;right:8px"><button>Project</button></div>');
    window.rectBefore=root.getBoundingClientRect().height;window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
  }`);
  assert.equal(await page.evaluate('document.querySelector("[data-spider-gwen-role=composer]").getBoundingClientRect().height'), await page.evaluate('rectBefore'));
  assert.equal(await page.evaluate('document.querySelector("[data-spider-gwen-role=composer]").style.getPropertyValue("--sg-composer-extension")'), '40px');
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("below-rail")).backgroundColor'), 'rgba(0, 0, 0, 0)');
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().visualChecks.composerFrameBounds'), true);
  await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.destroy()');
  assert.equal(await page.evaluate('document.querySelector(".ComposerLayoutRoot").style.getPropertyValue("--sg-composer-extension")'), '');
});


test('one background covers native gutters and late menu glass while shell stays transparent', async () => {
  await load();
  await page.evaluate(`{const sheet=new CSSStyleSheet();sheet.replaceSync('html[data-dream-skin="active"] [data-spider-gwen-role="native-menu"]{background:#112233!important;backdrop-filter:blur(24px)!important}');document.adoptedStyleSheets=[sheet];}`);
  const check=await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck()');
  assert.equal(check.visualChecks.backgroundCoverage,true);
  assert.equal(check.visualChecks.shellContinuity,true);
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("active")).backgroundColor'),'rgba(0, 0, 0, 0)');
  await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.destroy()');
  assert.equal(await page.evaluate('document.getElementById("codex-spider-gwen-background")'),null);
});

test('profile retains native size and action GROUP is never sized like a button', async () => {
  await load();
  await page.evaluate(`{
    const side=document.querySelector('aside');
    side.insertAdjacentHTML('beforeend','<div class="sidebar-item"><div class="flex"><button aria-label="打开个人资料菜单" style="width:36px;height:36px">Profile</button></div></div><div data-app-action-sidebar-thread-row><div class="codex-session-actions" style="display:flex;gap:4px;width:48px"><button class="codex-session-action-button">More</button><button class="codex-session-action-button">Delete</button></div></div><button aria-label="切换模式，当前模式：Codex">Codex</button>');
    window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
  }`);
  assert.equal(await page.evaluate('document.querySelector(".codex-session-actions").getBoundingClientRect().width'),48);
  const check=await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck()');
  assert.equal(check.visualChecks.avatarSize,true);assert.equal(check.visualChecks.sidebarActions,true);assert.equal(check.visualChecks.modeDecoration,true);
});

test('summary edge belongs to one overlay above transparent section headings', async () => {
  await load();
  await page.evaluate(`document.getElementById("active").insertAdjacentHTML("beforeend",'<aside data-summary-panel-variant="test"><header>Plan</header><div>Details</div><header>Sources</header></aside>');window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()`);
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().visualChecks.summaryBorder'),true);
  assert.equal(await page.evaluate('getComputedStyle(document.querySelector("[data-summary-panel-variant] header")).backgroundColor'),'rgba(0, 0, 0, 0)');
});

test('native sticky summary heading backdrop never creates solid 8px section bands', async () => {
  await load();
  await page.evaluate(`{
    document.getElementById('active').insertAdjacentHTML('beforeend','<div data-summary-panel-variant="summary"><section><header>AI</header><button>Changes</button></section><section><header>Plan</header><div>Plan text</div></section><section><header>Sources</header><button>Source</button></section></div>');
    const sheet=new CSSStyleSheet();sheet.replaceSync('[data-summary-panel-variant] header{position:sticky;top:8px}[data-summary-panel-variant] header::before{content:"";position:absolute;top:-8px;left:0;right:0;height:8px;background:#0b203b!important}');
    document.adoptedStyleSheets=[sheet];window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
  }`);
  const check=await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck()');
  assert.equal(check.visualChecks.summaryHeadingScrims,true);
  assert.equal(await page.evaluate('getComputedStyle(document.querySelector("[data-summary-panel-variant] header")).position'),'sticky');
  await page.evaluate('document.querySelector("[data-summary-panel-variant] header").style.setProperty("color","cyan")');
  assert.equal(await page.evaluate('getComputedStyle(document.querySelector("[data-summary-panel-variant] header"),"::before").height'),'8px');
  await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.destroy()');
  assert.equal(await page.evaluate('getComputedStyle(document.querySelector("[data-summary-panel-variant] header"),"::before").backgroundColor'),'rgb(11, 32, 59)');
});

test('home decorations are owned, pointer transparent, and absent after destroy', async () => {
  await load();
  await page.evaluate('document.querySelector("[data-codex-composer-root]").setAttribute("data-composer-placement","home");window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure()');
  assert.equal(await page.evaluate('document.querySelector(".sg-brand b").textContent'),'SPIDER-GWEN');
  assert.equal(await page.evaluate('getComputedStyle(document.querySelector(".sg-status")).pointerEvents'),'none');
  await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.destroy()');
  assert.equal(await page.evaluate('document.querySelector(".sg-brand")'),null);
});

test('sidebar decorations preserve native positioned children', async () => {
  await load();
  await page.evaluate(`{
    const sheet=new CSSStyleSheet();sheet.replaceSync('.native-sidebar-footer{position:absolute;bottom:0}');document.adoptedStyleSheets=[sheet];
    document.querySelector('aside[data-spider-gwen-role="sidebar"]').insertAdjacentHTML('beforeend','<div class="native-sidebar-footer" id="native-footer"><button>Usage</button></div>');
  }`);
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("native-footer")).position'),'absolute');
});

test('ChatGPT native menu plus pin remains separate from injected delete rail and restores ownership', async () => {
  await load();
  await page.evaluate(`{
    document.querySelector('aside').insertAdjacentHTML('beforeend', '<div data-app-action-sidebar-thread-row id="action-row" style="position:relative;width:260px;height:32px"><div style="position:absolute;right:0;display:flex;gap:8px"><button aria-label="聊天操作">Menu</button><button aria-label="置顶聊天">Pin</button></div><div class="codex-session-actions" data-codex-action-group-version="6" style="position:absolute;right:28px;display:flex;gap:2px"><button class="codex-session-action-button">More</button><button class="codex-session-action-button">Delete</button></div></div>');
    window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.ensure();
  }`);
  assert.equal(await page.evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.selfCheck().visualChecks.sidebarActions'), true);
  assert.ok(await page.evaluate('parseFloat(document.querySelector(".codex-session-actions").style.getPropertyValue("--sg-actions-right"))') > 28);
  await page.evaluate('window.savedGroup=document.querySelector(".codex-session-actions");window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__.destroy()');
  assert.equal(await page.evaluate('savedGroup.style.getPropertyValue("--sg-actions-right")'), '');
  assert.equal(await page.evaluate('savedGroup.style.right'), '28px');
});
