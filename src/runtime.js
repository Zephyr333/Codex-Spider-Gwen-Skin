  const STATE_KEY = '__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__';
  const STYLE_ID = 'codex-spider-gwen-immersive-style';
  const CHROME_ID = 'codex-spider-gwen-immersive-chrome';
  const ROOT_CLASS = 'codex-spider-gwen-immersive';
  const ROLE_ATTR = 'data-spider-gwen-role';
  const COMPATIBILITY_REVISION = 16;
  const EDITORS = '[role="textbox"][contenteditable="true"], [data-codex-composer][contenteditable], textarea';
  const COMPOSERS = '[data-codex-composer-root], form[data-thread-find-composer], [data-composer-placement]';
  const STRUCTURAL = `main, aside, header, ${COMPOSERS}, ${EDITORS}, [data-app-shell-main-surface], [data-ds-part], [data-settings-panel-slug], button[aria-pressed], button[aria-label]`;

  const previous = window[STATE_KEY];
  let bootstrapError = null;
  try { previous?.destroy?.(); } catch (error) {
    bootstrapError = String(error);
    previous?.observer?.disconnect?.();
    if (previous?.timer) clearInterval(previous.timer);
    if (previous?.scheduler?.timeout) clearTimeout(previous.scheduler.timeout);
    if (previous?.scheduler?.settleTimeout) clearTimeout(previous.scheduler.settleTimeout);
  }
  let disposed = false;
  let observer;
  let timer;
  let resizeObserver;
  let observedMain;
  const scheduler = { timeout: null };
  const roles = new Map();
  const classes = new Map();
  const listeners = [];
  const runtime = {
    version: VERSION, compatibilityRevision: COMPATIBILITY_REVISION,
    metrics: { ensurePasses: 0, errors: 0, recoveries: 0 },
    diagnostics: { mode: 'inactive', reason: 'initializing', bootstrapError },
  };
  const all = (root, selector) => root ? [...root.querySelectorAll(selector)] : [];
  const visible = node => {
    if (!(node instanceof Element) || !node.isConnected || node.closest('[hidden], [inert], [aria-hidden="true"], [data-aria-hidden="true"]')) return false;
    const box = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0 &&
      box.top < innerHeight && box.left < innerWidth && style.visibility === 'visible' && style.display !== 'none';
  };
  const firstVisible = (root, selector) => all(root, selector).find(visible) || null;
  const editorNodes = root => all(root, EDITORS).filter(node => visible(node) && !node.closest('[role="dialog"], [role="menu"], [role="listbox"]'));
  const rect = node => {
    if (!node) return null;
    const { x, y, width, height, right, bottom } = node.getBoundingClientRect();
    return { x, y, width, height, right, bottom };
  };
  const themeId = () => String(window.__CODEX_PLUS_DREAM_SKIN_THEME__?.id || '').trim();
  const windowKind = () => {
    const initial = new URLSearchParams(location.search).get('initialRoute') || '';
    if (/^\/avatar-overlay(?:\/|$)/.test(initial) || /avatar-overlay/.test(location.pathname) || document.querySelector('[data-avatar-mascot="true"]')) return 'pet';
    if (/detached-window/.test(initial + location.pathname)) return 'detached';
    return 'main';
  };
  const engineState = () => {
    // The disabled flag is authoritative even while stale attributes are being cleared.
    if (window.__CODEX_DREAM_SKIN_DISABLED__ === true) return { ready: false, kind: 'disabled', reason: 'base-disabled-or-paused' };
    const root = document.documentElement;
    if (root?.getAttribute('data-dream-skin') === 'active') return { ready: true, kind: 'codex-plus-modern', reason: 'ready' };
    if (root?.classList.contains('codex-dream-skin')) return { ready: true, kind: 'legacy', reason: 'ready' };
    return { ready: false, kind: 'pending', reason: 'dream-skin-pending' };
  };

  const findMain = () => {
    const usable = node => visible(node) && node.getBoundingClientRect().width >= Math.min(240, innerWidth * .4) && node.getBoundingClientRect().height >= 100;
    for (const selector of ['[data-app-shell-main-surface]', 'main[data-ds-part="main"]', 'main']) {
      let candidates = all(document, selector).filter(usable);
      // Never choose a full-window wrapper over its active semantic child.
      candidates = candidates.filter(node => !candidates.some(other => other !== node && node.contains(other)));
      if (candidates.length === 1) return { node: candidates[0], source: selector };
      if (candidates.length > 1) {
        const focused = candidates.filter(node => node.contains(document.activeElement) && document.activeElement !== document.body);
        if (focused.length === 1) return { node: focused[0], source: `${selector}:focused` };
        const withComposer = candidates.filter(node => editorNodes(node).length > 0);
        if (withComposer.length === 1) return { node: withComposer[0], source: `${selector}:composer` };
        return { node: null, source: 'ambiguous-main' };
      }
    }
    return { node: null, source: 'missing-main' };
  };
  const findComposer = main => {
    let editors = editorNodes(main);
    if (editors.length > 1) {
      const focused = editors.filter(node => node === document.activeElement || node.contains(document.activeElement));
      if (focused.length !== 1) return { editor: null, host: null, surface: null };
      editors = focused;
    }
    const editor = editors[0] || null;
    if (!editor) return { editor: null, host: null, surface: null };
    // Style the actual native surface, not the wrapper holding status/approval rows.
    const host = editor.closest(COMPOSERS);
    const surface = editor.closest('[class*="ComposerLayoutRoot"]') || editor.closest('.composer-surface-chrome');
    if (!host || !main.contains(host)) return { editor, host: null, surface: null };
    return { editor, host, surface: surface && host.contains(surface) ? surface : null };
  };
  const classify = (main, composer) => {
    const modeButton = all(document, 'button[aria-label]').find(node => visible(node) && /切换模式|switch mode/i.test(node.getAttribute('aria-label') || ''));
    const mode = modeButton?.getAttribute('aria-label') || '';
    const label = composer.editor?.getAttribute('aria-label') || '';
    const selected = all(composer.host || main, '[role="group"] button[aria-pressed="true"]').filter(visible).map(node => node.textContent.trim()).join(' ');
    const chatgpt = /ChatGPT/i.test(mode) || (!/Codex/i.test(mode) && (/ChatGPT/i.test(label) || composer.host?.matches('form[data-thread-find-composer]')));
    const work = chatgpt && (/ChatGPT Work/i.test(label) || /^(工作|Work)$/i.test(selected));
    const product = chatgpt ? work ? 'chatgpt-work' : 'chatgpt-chat' : /Codex/i.test(mode) || composer.host?.hasAttribute('data-codex-composer-root') ? 'codex' : 'unknown';
    const placement = composer.host?.getAttribute('data-composer-placement') || composer.host?.querySelector('[data-composer-placement]')?.getAttribute('data-composer-placement');
    const settings = Boolean(firstVisible(main, '[data-settings-panel-slug], input[name="appearance-theme"]'));
    const route = settings && !composer.host ? 'settings' : placement === 'home' ? 'home' : placement === 'thread' ? 'thread' : 'unknown';
    return { product, route, pageKind: route === 'settings' ? 'settings' : product === 'unknown' || route === 'unknown' ? 'unknown' : `${product}-${route}` };
  };
  const findSidebar = () => firstVisible(document, 'aside[data-app-shell-left-panel], aside[data-app-shell-left-panel-appearance], aside.app-shell-left-panel');
  const findHeader = main => firstVisible(main, '[data-app-shell-application-menu-bar], header[data-app-shell-header-edge-scroll], header');
  const findNativeMenu = () => {
    const menu = firstVisible(document, '[role="menubar"], [class*="ApplicationMenuTopBar"]');
    return menu && menu.getBoundingClientRect().top < 8 && menu.getBoundingClientRect().height <= 80 ? menu : null;
  };

  // Track only our writes. Never delete host data-ds-part, legacy aliases, or route classes.
  const setClass = (node, name, enabled) => {
    if (!node) return;
    let owned = classes.get(node);
    if (enabled && !node.classList.contains(name)) {
      node.classList.add(name);
      if (!owned) classes.set(node, owned = new Set());
      owned.add(name);
    } else if (!enabled && owned?.has(name)) {
      node.classList.remove(name);
      owned.delete(name);
      if (!owned.size) classes.delete(node);
    }
  };
  const releaseRole = name => {
    const state = roles.get(name);
    if (!state) return;
    if (state.node.getAttribute(ROLE_ATTR) === name) {
      if (state.before === null) state.node.removeAttribute(ROLE_ATTR);
      else state.node.setAttribute(ROLE_ATTR, state.before);
    }
    const owned = classes.get(state.node);
    if (owned) { owned.forEach(value => state.node.classList.remove(value)); classes.delete(state.node); }
    roles.delete(name);
  };
  const syncRole = (name, node) => {
    if (roles.get(name)?.node !== node) releaseRole(name);
    if (!node) return null;
    if (!roles.has(name)) roles.set(name, { node, before: node.getAttribute(ROLE_ATTR) });
    if (node.getAttribute(ROLE_ATTR) !== name) node.setAttribute(ROLE_ATTR, name);
    return node;
  };
  const clearVisuals = () => {
    [...roles.keys()].forEach(releaseRole);
    classes.forEach((names, node) => names.forEach(name => node.classList.remove(name)));
    classes.clear();
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(CHROME_ID)?.remove();
    for (const key of ['--sg-shell-left', '--sg-shell-top']) document.documentElement?.style.removeProperty(key);
    resizeObserver?.disconnect();
    observedMain = null;
  };
  const installStyle = () => {
    setClass(document.documentElement, ROOT_CLASS, true);
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    if (style.textContent !== CSS) style.textContent = CSS;
    if (style.dataset.spiderGwenVersion !== VERSION) style.dataset.spiderGwenVersion = VERSION;
  };
  const chrome = main => {
    let node = document.getElementById(CHROME_ID);
    if (!node) {
      node = document.createElement('div');
      node.id = CHROME_ID;
      node.setAttribute('aria-hidden', 'true');
      // Text badges used to overlap native title/header controls. Keep edge decoration only.
      node.innerHTML = '<div class="sg-print-dots"></div><div class="sg-speed-lines"></div><div class="sg-web-corner"></div>';
      document.body.appendChild(node);
    }
    const box = rect(main);
    const set = (target, key, value) => { if (target.style.getPropertyValue(key) !== value) target.style.setProperty(key, value); };
    set(document.documentElement, '--sg-shell-left', `${Math.round(box.x)}px`);
    set(document.documentElement, '--sg-shell-top', `${Math.max(0, Math.round(box.y))}px`);
    for (const [key, value] of Object.entries({ left: box.x, top: box.y, width: box.width, height: box.height })) set(node, key, `${value}px`);
    return node;
  };
  const update = values => {
    runtime.diagnostics = { ...values, version: VERSION, compatibilityRevision: COMPATIBILITY_REVISION, checkedAt: Date.now(), bootstrapError };
    return runtime.diagnostics;
  };
  const ensure = () => {
    if (disposed || window[STATE_KEY] !== runtime) return runtime.diagnostics;
    runtime.metrics.ensurePasses++;
    try {
      const engine = engineState();
      const id = themeId();
      const kind = windowKind();
      const inactive = id !== 'spider-gwen' || kind === 'pet' || !engine.ready;
      if (inactive) {
        clearVisuals();
        return update({ mode: engine.kind === 'pending' && id === 'spider-gwen' && kind !== 'pet' ? 'base-only' : 'inactive',
          reason: kind === 'pet' ? 'excluded-pet-window' : id !== 'spider-gwen' ? 'theme-mismatch' : engine.reason,
          engine: engine.kind, dreamSkinReady: engine.ready, themeId: id, windowKind: kind,
          pageKind: 'unknown', route: 'unknown', capabilities: {}, anchors: {}, lastError: null });
      }
      const selection = findMain();
      const main = selection.node;
      if (!main) {
        clearVisuals();
        return update({ mode: 'degraded', reason: selection.source, engine: engine.kind, dreamSkinReady: true,
          themeId: id, windowKind: kind, pageKind: 'unknown', route: 'unknown', capabilities: { shellMain: false }, anchors: {}, lastError: null });
      }
      // Install the scoped compatibility repair before measuring descendants:
      // Codex++ 1.4 hides the content-bearing top-fade wrapper in Codex 26.924.
      installStyle();
      const composer = findComposer(main);
      const page = classify(main, composer);
      const sidebar = findSidebar();
      const header = findHeader(main);
      syncRole('shell-main', main);
      syncRole('sidebar', sidebar);
      syncRole('shell-header', header);
      syncRole('native-menu', findNativeMenu());
      syncRole('composer', composer.surface);
      syncRole('composer-body', firstVisible(composer.surface, '[data-composer-layout-body], [class*="ComposerLayoutBody"]'));
      syncRole('composer-footer', firstVisible(composer.surface, '[class*="ComposerLayoutFooter"]'));
      syncRole('home', page.route === 'home' ? firstVisible(main, '[role="main"]') : null);
      // An effect layer is optional. Never hide a semantic node containing real controls.
      const fade = firstVisible(main, '[data-app-shell-main-content-top-fade]');
      syncRole('top-fade', fade && !fade.querySelector('button, input, [role="textbox"]') ? fade : null);
      for (const node of [main, chrome(main)]) {
        setClass(node, 'spider-gwen-home-shell', page.route === 'home');
        setClass(node, 'spider-gwen-task-shell', page.route !== 'home');
      }
      if (observedMain !== main) {
        resizeObserver?.disconnect();
        observedMain = main;
        if (typeof ResizeObserver === 'function') {
          resizeObserver = new ResizeObserver(schedule);
          resizeObserver.observe(main);
        }
      }
      const capabilities = { shellMain: true, sidebar: Boolean(sidebar), header: Boolean(header),
        activeComposer: Boolean(composer.host && composer.surface), composer: Boolean(composer.surface),
        visualHome: page.route === 'home', nativeHomeLayout: true };
      const complete = page.pageKind !== 'unknown' && (page.route === 'settings' || capabilities.activeComposer);
      if (complete && ['base-only', 'degraded'].includes(runtime.diagnostics.mode)) runtime.metrics.recoveries++;
      return update({ mode: complete ? 'full' : 'degraded', reason: complete ? 'ready' : 'optional-or-unknown-layout',
        ...page, engine: engine.kind, dreamSkinReady: true, themeId: id, windowKind: kind, capabilities,
        anchors: { shellMain: selection.source, composer: composer.surface?.className || 'missing' },
        geometry: rect(main), composerGeometry: rect(composer.surface), lastError: null });
    } catch (error) {
      runtime.metrics.errors++;
      clearVisuals();
      return update({ mode: 'degraded', reason: 'ensure-error', capabilities: {}, lastError: String(error?.stack || error) });
    }
  };
  const getDiagnostics = () => JSON.parse(JSON.stringify({ ...runtime.diagnostics, metrics: runtime.metrics }));
  const selfCheck = () => {
    const diagnostics = ensure();
    const active = roles.has('shell-main');
    const styleCount = document.querySelectorAll(`#${STYLE_ID}`).length;
    const chromeCount = document.querySelectorAll(`#${CHROME_ID}`).length;
    const issues = [];
    if (active && (styleCount !== 1 || chromeCount !== 1)) issues.push('duplicate-or-missing-owned-layer');
    if (!active && (styleCount || chromeCount || document.documentElement.classList.contains(ROOT_CLASS))) issues.push('inactive-theme-leak');
    if (active && document.documentElement.scrollWidth > innerWidth + 1) issues.push('horizontal-overflow');
    const composer = roles.get('composer')?.node;
    if (composer) {
      const box = rect(composer);
      if (!visible(composer) || box.bottom > innerHeight + 1) issues.push('composer-clipped');
    }
    const decor = document.getElementById(CHROME_ID);
    if (decor && getComputedStyle(decor).pointerEvents !== 'none') issues.push('decoration-intercepts-input');
    const unusable = diagnostics.mode === 'base-only' || diagnostics.reason === 'ensure-error';
    return { ok: !issues.length && ['full', 'inactive'].includes(diagnostics.mode),
      usable: !issues.length && !unusable, activeTheme: active, version: VERSION, issues,
      singletons: { style: styleCount, chrome: chromeCount }, diagnostics: getDiagnostics() };
  };
  const schedule = () => {
    if (disposed || scheduler.timeout || window[STATE_KEY] !== runtime) return;
    scheduler.timeout = setTimeout(() => { scheduler.timeout = null; ensure(); }, 80);
  };
  const on = (target, name, handler) => { target.addEventListener(name, handler); listeners.push(() => target.removeEventListener(name, handler)); };
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    resizeObserver?.disconnect();
    clearInterval(timer);
    clearTimeout(scheduler.timeout);
    listeners.splice(0).forEach(fn => fn());
    if (window[STATE_KEY] === runtime) { clearVisuals(); delete window[STATE_KEY]; }
  };
  const stripOwnedClasses = value => String(value || '').split(/\s+/).filter(name => name && name !== ROOT_CLASS && !name.startsWith('spider-gwen-')).sort().join(' ');
  observer = new MutationObserver(records => {
    const relevant = records.some(record => {
      const target = record.target;
      if (!(target instanceof Element) || target.id === STYLE_ID || target.id === CHROME_ID || target.closest(`#${CHROME_ID}`)) return false;
      if (record.type === 'attributes') {
        if (record.attributeName === 'class' && stripOwnedClasses(record.oldValue) === stripOwnedClasses(target.className)) return false;
        if (record.oldValue === target.getAttribute(record.attributeName)) return false;
        return target === document.documentElement || target.matches(STRUCTURAL) || Boolean(target.querySelector(STRUCTURAL));
      }
      return [...record.addedNodes, ...record.removedNodes].some(node => node instanceof Element && (node.matches(STRUCTURAL) || node.querySelector(STRUCTURAL)));
    });
    if (relevant) schedule();
  });
  if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeOldValue: true,
    attributeFilter: ['class', 'hidden', 'inert', 'aria-hidden', 'data-aria-hidden', 'aria-label', 'aria-pressed',
      'data-dream-skin', 'data-dream-shell', 'data-app-shell-main-surface', 'data-app-shell-left-panel-appearance',
      'data-codex-composer-root', 'data-composer-placement', 'data-composer-layout', 'data-settings-panel-slug'] });
  timer = setInterval(ensure, 1500);
  on(window, 'resize', schedule);
  on(window, 'popstate', schedule);
  on(window, 'storage', schedule);
  on(document, 'visibilitychange', schedule);
  on(document, 'focusin', schedule);
  on(document, 'transitionend', schedule);
  Object.assign(runtime, { ensure, destroy, getDiagnostics, selfCheck, observer, timer, scheduler });
  window[STATE_KEY] = runtime;
  ensure();
