  const STATE_KEY = '__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__';
  const STYLE_ID = 'codex-spider-gwen-immersive-style';
  const COMPATIBILITY_STYLE_ID = 'codex-spider-gwen-compatibility-style';
  const COMPATIBILITY_ATTR = 'data-spider-gwen-compatibility';
  const HOME_SLOT_ATTR = 'data-spider-gwen-empty-home-slot';
  const CHROME_ID = 'codex-spider-gwen-immersive-chrome';
  const ROOT_CLASS = 'codex-spider-gwen-immersive';
  const ROLE_ATTR = 'data-spider-gwen-role';
  const SURFACE_ATTR = 'data-spider-gwen-surface';
  const COMPATIBILITY_REVISION = 20;
  const BACKGROUND_ID = "codex-spider-gwen-background";
  const SURFACE_HINTS = '[data-local-conversation-item-target-ids], div[class~="group/activity-header"], [data-testid="exec-shell-body"], div[class~="group/command"], div[class~="group/output"], div[class~="group/turn-diff-header"], [data-summary-panel-variant], pre, [data-composer-utility-bar], [class*="ComposerUtility"], [class*="ComposerLayoutUtilityBar"], [data-composer-rail], [data-above-composer-portal], [data-home-beacon-banner], [data-app-action-sidebar-thread-row], [data-codex-action-group-version], [role="alert"], [role="menu"], [role="dialog"], [role="listbox"], [role="tooltip"]';
  const EDITORS = '[role="textbox"][contenteditable="true"], [data-codex-composer][contenteditable], textarea';
  const COMPOSERS = '[data-codex-composer-root], form[data-thread-find-composer], [data-composer-placement]';
  const STRUCTURAL = `main, aside, header, ${COMPOSERS}, ${EDITORS}, [data-app-shell-main-surface], [data-app-shell-active-page], [data-settings-panel-slug], [data-thread-scroll-footer], [data-composer-surface-variant], ${SURFACE_HINTS}`;
  const INTERACTIVE = 'button, a, input, textarea, select, [contenteditable], [tabindex], [role="button"], [role="textbox"], [role="dialog"], [role="status"], [role="alert"]';

  const previous = window[STATE_KEY];
  let bootstrapError = null;
  try { previous?.destroy?.(); } catch (error) {
    bootstrapError = String(error);
    previous?.observer?.disconnect?.();
    previous?.rootObserver?.disconnect?.();
    previous?.resizeObserver?.disconnect?.();
    previous?.layoutObserver?.disconnect?.();
    try { previous?.stopResources?.(); } catch { /* old instance is already being replaced */ }
    try { previous?.releaseOwnedState?.(); } catch { /* optional fallback on older runtimes */ }
    if (previous?.timer) clearInterval(previous.timer);
    if (previous?.scheduler?.timeout) clearTimeout(previous.scheduler.timeout);
    if (previous?.scheduler?.retry) clearTimeout(previous.scheduler.retry);
    if (previous?.scheduler?.settleTimeout) clearTimeout(previous.scheduler.settleTimeout);
  }
  let disposed = false;
  let observer;
  let rootObserver;
  let timer;
  let resizeObserver;
  let layoutObserver;
  const layoutTargets = new Set();
  let layoutBoxes = new WeakMap();
  let observedMain;
  let observedComposer;
  const scheduler = { timeout: null, retry: null };
  const dirty = new Set(['shell', 'components', 'composer', 'geometry', 'sidebar', 'popup']);
  let activeWork = new Set(dirty);
  const dirtyRoots = new Set();
  const moduleCache = new Map();
  const moduleState = {};
  const performanceSamples = [];
  let sampling = false, bootstrapStarted = performance.now(), retryIndex = 0;
  const retryDelays = [80, 160, 320, 640, 1280, 2000];
  const attributeValues = new WeakMap();
  const invalidate = kind => { dirty.add(kind); if (kind === 'shell') { moduleCache.clear(); surfacesDirty = true; } if (['components','composer','popup'].includes(kind)) surfacesDirty = true; };
  const recordDuration = (kind, value) => {
    if (sampling) { performanceSamples.push({ kind, ms: Math.round(value * 1000) / 1000 }); if (performanceSamples.length > 200) performanceSamples.shift(); }
  };
  const memo = (name, read, kinds = ['shell']) => {
    if (moduleCache.has(name) && !kinds.some(kind => activeWork.has(kind))) return moduleCache.get(name);
    const value = read(); moduleCache.set(name, value); return value;
  };
  const roles = new Map();
  const classes = new Map();
  const surfaces = new Map();
  const extensions = new Map();
  const actionOffsets = new Map();
  let surfacesDirty = true;
  let surfaceMain;
  let surfaceComposer;
  let visualReport = null;
  const listeners = [];
  const homeSlots = new Map();
  let compatibilityBefore;
  const runtime = {
    version: VERSION, sourceSignature: SOURCE_SIGNATURE, compatibilityRevision: COMPATIBILITY_REVISION,
    metrics: { ensurePasses: 0, errors: 0, recoveries: 0, lastEnsureMs: 0, maxEnsureMs: 0, fullScans: 0, componentUpdates: 0, geometryUpdates: 0, healthChecks: 0, lastHealthMs: 0, observerBatches: 0 },
    diagnostics: { mode: 'inactive', reason: 'initializing', bootstrapError },
  };
  const all = (root, selector) => root ? [...root.querySelectorAll(selector)] : [];
  const painted = node => {
    if (!(node instanceof Element) || !node.isConnected || node.closest('[hidden], [inert]')) return false;
    const box = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0 &&
      box.top < innerHeight && box.left < innerWidth && style.visibility === 'visible' && style.display !== 'none';
  };
  const visible = node => painted(node) && !node.closest('[aria-hidden="true"], [data-aria-hidden="true"]');
  const firstVisible = (root, selector) => all(root, selector).find(visible) || null;
  const editorNodes = root => all(root, EDITORS).filter(node => visible(node) && !node.closest('[role="dialog"], [role="menu"], [role="listbox"]'));
  const rect = node => {
    if (!node) return null;
    const { x, y, width, height, right, bottom } = node.getBoundingClientRect();
    return { x, y, width, height, right, bottom };
  };
  const layoutRect = node => !activeWork.has('shell') && layoutBoxes.has(node) ? layoutBoxes.get(node) : rect(node);
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
    const usable = (node, semantic) => visible(node) && node.getBoundingClientRect().width >= Math.min(240, innerWidth * .4) &&
      node.getBoundingClientRect().height >= (semantic ? 1 : 100);
    for (const selector of ['[data-app-shell-main-surface]', 'main[data-ds-part="main"]', 'main']) {
      let candidates = all(document, selector).filter(node => usable(node, selector !== 'main'));
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
    const selectors = ['[data-composer-surface-variant][data-composer-layout]', '[data-ds-part="composer"]', '[class*="ComposerLayoutRoot"]', '.composer-surface-chrome'];
    const selector = selectors.find(value => editor.closest(value) && host?.contains(editor.closest(value)));
    const surface = selector ? editor.closest(selector) : null;
    if (!host || !main.contains(host)) return { editor, host: null, surface: null };
    return { editor, host, surface, source: selector || 'unrecognized-surface' };
  };
  const classify = (main, composer) => {
    const modeButton = all(document, 'button[aria-label*="切换模式"], button[aria-label*="switch mode" i]').find(visible);
    const mode = modeButton?.getAttribute('aria-label') || '';
    const label = composer.editor?.getAttribute('aria-label') || '';
    const selected = all(composer.host || main, '[role="group"] button[aria-pressed="true"]').filter(visible).map(node => node.textContent.trim()).join(' ');
    const chatgpt = /ChatGPT/i.test(label) || composer.host?.matches('form[data-thread-find-composer]') || (!/Codex/i.test(label) && /ChatGPT/i.test(mode));
    const work = chatgpt && (/ChatGPT Work/i.test(label) || /^(工作|Work)$/i.test(selected));
    const product = chatgpt ? work ? 'chatgpt-work' : 'chatgpt-chat' : /Codex/i.test(mode) || composer.host?.hasAttribute('data-codex-composer-root') ? 'codex' : 'unknown';
    const placement = composer.host?.getAttribute('data-composer-placement') || composer.host?.querySelector('[data-composer-placement]')?.getAttribute('data-composer-placement');
    const selectedSettings = firstVisible(document, '[data-settings-panel-slug][aria-current="page"]');
    const settings = Boolean(firstVisible(main, '[data-settings-panel-slug], input[name="appearance-theme"]') ||
      selectedSettings && !selectedSettings.closest('[role="dialog"], [role="menu"]') && firstVisible(main, 'h1'));
    const route = settings && !composer.host ? 'settings' : placement === 'home' ? 'home' : placement === 'thread' ? 'thread' : 'unknown';
    return { product, route, pageKind: route === 'settings' ? 'settings' : product === 'unknown' || route === 'unknown' ? 'unknown' : `${product}-${route}` };
  };
  const findSettingsSurface = main => {
    const heading = firstVisible(main, 'h1');
    const box = rect(main);
    for (let node = heading?.parentElement; node && node !== main; node = node.parentElement) {
      const r = rect(node), s = getComputedStyle(node);
      if (r.width >= box.width * .9 && r.height >= box.height * .75 &&
        (s.backgroundColor !== 'rgba(0, 0, 0, 0)' || roles.get('settings-surface')?.node === node)) return node;
    }
    return null;
  };
  const findSidebar = () => firstVisible(document, 'aside[data-app-shell-left-panel], aside[data-app-shell-left-panel-appearance], aside.app-shell-left-panel');
  const findHeader = main => {
    const box = rect(main);
    const candidates = all(document, 'header[data-app-shell-titlebar], header[data-app-shell-application-menu-bar], header[data-app-shell-header-edge-scroll]').filter(node => {
      if (!visible(node) || node.closest('aside, [role="dialog"], [role="menu"]')) return false;
      const r = rect(node);
      const overlap = Math.min(box.right, r.right) - Math.max(box.x, r.x);
      return r.height <= 96 && Math.abs(r.y - box.y) <= 80 && overlap >= box.width * .65;
    });
    if (candidates.length === 1) return { node: candidates[0], source: 'semantic-shell-header' };
    if (candidates.length > 1) return { node: null, source: 'ambiguous-header' };
    const direct = [...main.children].filter(node => node.tagName === 'HEADER' && visible(node) && !node.querySelector('[data-summary-panel-variant]'));
    return { node: direct.length === 1 ? direct[0] : null, source: direct.length === 1 ? 'direct-main-header' : 'missing-header' };
  };
  const findFooter = (main, composer) => {
    const footer = composer.host?.closest('[data-thread-scroll-footer="true"]');
    if (!footer || !main.contains(footer) || !visible(footer)) return { footer: null, decor: null, source: 'not-present' };
    const box = rect(footer);
    const candidates = [...footer.children].filter(node => {
      // aria-hidden intentionally excludes a scrim from accessibility, not paint.
      if (node.tagName !== 'DIV' || !painted(node) || node.childElementCount || node.textContent.trim() || node.matches(INTERACTIVE)) return false;
      const s = getComputedStyle(node), r = rect(node);
      return s.position === 'absolute' && s.pointerEvents === 'none' &&
        Math.abs(r.x - box.x) <= 2 && Math.abs(r.width - box.width) <= 2 && r.height <= box.height + 96;
    });
    return { footer, decor: candidates.length === 1 ? candidates[0] : null,
      source: candidates.length === 1 ? 'empty-footer-decoration' : candidates.length > 1 ? 'ambiguous-footer-decoration' : 'no-safe-decoration' };
  };
  const findFooterFade = (main, footer) => {
    const scroll = footer?.closest('[data-app-action-timeline-scroll], [data-ds-part="thread"], .thread-scroll-container');
    if (!scroll || !main.contains(scroll)) return null;
    const box = rect(footer);
    const candidates = all(scroll, 'div[aria-hidden="true"]').filter(node => {
      const parent = node.parentElement;
      if (node.tagName !== 'DIV' || node.childElementCount || node.textContent.trim() || node.matches(INTERACTIVE) || !painted(node)) return false;
      if (parent.childElementCount !== 1 || parent.textContent.trim() || getComputedStyle(parent).position !== 'sticky') return false;
      const s = getComputedStyle(node), r = rect(node);
      const gradient = s.backgroundImage.includes('gradient(') || roles.get('footer-fade')?.node === node;
      return gradient && s.position === 'absolute' && s.pointerEvents === 'none' && r.height <= 64 &&
        r.width >= box.width - 64 && r.width <= box.width + 2 && Math.abs(r.x - box.x) <= 32 && Math.abs(r.y - box.y) <= 48;
    });
    return candidates.length === 1 ? candidates[0] : null;
  };
  const findNativeMenu = () => {
    const menu = firstVisible(document, '[role="menubar"], [class*="ApplicationMenuTopBar"]');
    return menu && menu.getBoundingClientRect().top < 8 && menu.getBoundingClientRect().height <= 80 ? menu : null;
  };

  // Track only our writes. Never delete host data-ds-part, legacy aliases, or route classes.
  const setClass = (node, name, enabled) => {
    if (!node) return;
    let owned = classes.get(node);
    if (enabled) {
      if (!node.classList.contains(name)) node.classList.add(name);
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
    if (!roles.has(name)) roles.set(name, { node, before: node.getAttribute(ROLE_ATTR) === name ? null : node.getAttribute(ROLE_ATTR) });
    if (node.getAttribute(ROLE_ATTR) !== name) node.setAttribute(ROLE_ATTR, name);
    return node;
  };
  const releaseSurface = node => {
    const state = surfaces.get(node);
    if (node.getAttribute(SURFACE_ATTR) === state.kind) {
      if (state.before === null) node.removeAttribute(SURFACE_ATTR);
      else node.setAttribute(SURFACE_ATTR, state.before);
    }
    surfaces.delete(node);
  };
  const releaseExtension = node => {
    const state = extensions.get(node);
    if (node.style.getPropertyValue('--sg-composer-extension') === state.written) {
      if (state.before) node.style.setProperty('--sg-composer-extension', state.before, state.priority);
      else node.style.removeProperty('--sg-composer-extension');
      if (!state.hadStyle && !node.style.length) node.removeAttribute('style');
    }
    if (node.style.getPropertyValue('--sg-composer-top-extension') === state.topWritten) {
      if (state.topBefore) node.style.setProperty('--sg-composer-top-extension', state.topBefore, state.topPriority);
      else node.style.removeProperty('--sg-composer-top-extension');
    }
    if (!state.hadStyle && !node.style.length) node.removeAttribute('style');
    extensions.delete(node);
  };
  const syncExtension = (node, height, top = 0) => {
    for (const other of extensions.keys()) if (other !== node) releaseExtension(other);
    if (!node) return;
    if (!extensions.has(node)) extensions.set(node, { before: node.style.getPropertyValue('--sg-composer-extension'),
      priority: node.style.getPropertyPriority('--sg-composer-extension'), topBefore: node.style.getPropertyValue('--sg-composer-top-extension'), topPriority: node.style.getPropertyPriority('--sg-composer-top-extension'), hadStyle: node.hasAttribute('style') });
    const value = `${Math.max(0, Math.round(height * 100) / 100)}px`;
    if (node.style.getPropertyValue('--sg-composer-extension') !== value) node.style.setProperty('--sg-composer-extension', value);
    extensions.get(node).written = value;
    const topValue = Math.max(0, Math.round(top * 100) / 100) + 'px';
    if (node.style.getPropertyValue('--sg-composer-top-extension') !== topValue) node.style.setProperty('--sg-composer-top-extension', topValue);
    extensions.get(node).topWritten = topValue;
  };
  const releaseActionOffset = node => {
    const state = actionOffsets.get(node);
    if (node.style.getPropertyValue('--sg-actions-right') === state.written) {
      if (state.before) node.style.setProperty('--sg-actions-right', state.before, state.priority);
      else node.style.removeProperty('--sg-actions-right');
      if (!state.hadStyle && !node.style.length) node.removeAttribute('style');
    }
    actionOffsets.delete(node);
  };
  const syncActions = () => {
    const current = new Set();
    for (const row of all(roles.get('sidebar')?.node, '[data-app-action-sidebar-thread-row]')) {
      const groups = all(row, '.codex-session-actions[data-codex-action-group-version]');
      if (groups.length !== 1) continue;
      const group = groups[0], native = all(row, 'button').filter(n => !group.contains(n) && rect(n).width > 0);
      if (!native.length) continue;
      const rowBox = rect(row), left = Math.min(...native.map(n => rect(n).x));
      const value = Math.max(0, rowBox.right - left + 4) + 'px';
      current.add(group);
      if (!actionOffsets.has(group)) actionOffsets.set(group, { before: group.style.getPropertyValue('--sg-actions-right'), priority: group.style.getPropertyPriority('--sg-actions-right'), hadStyle: group.hasAttribute('style') });
      if (group.style.getPropertyValue('--sg-actions-right') !== value) group.style.setProperty('--sg-actions-right', value);
      actionOffsets.get(group).written = value;
    }
    for (const node of actionOffsets.keys()) if (!current.has(node)) releaseActionOffset(node);
  };
  const syncSurfaces = (main, composer) => {
    if (!surfacesDirty && surfaceMain === main && surfaceComposer === composer.surface) return;
    if (surfaceMain === main && surfaceComposer === composer.surface && !['shell','components','composer','popup','sidebar'].some(kind => activeWork.has(kind))) {
      const frame = [...surfaces].find(([,state]) => state.kind === 'composer-frame')?.[0];
      const utilities = [...surfaces].filter(([,state]) => state.kind === 'composer-utility').map(([node]) => node);
      if (frame && layoutBoxes.has(frame) && utilities.every(node => layoutBoxes.has(node))) {
        const base = layoutRect(frame), boxes = utilities.map(layoutRect);
        const above = frame === composer.surface ? Math.max(0, ...boxes.map(box => base.y-box.y)) : 0;
        const below = Math.max(0, ...boxes.map(box => box.bottom-base.bottom));
        if (above <= 128 && below <= 96) syncExtension(frame, below, above);
      }
      surfacesDirty = false; visualReport = null; return;
    }
    if (activeWork.has('shell') || activeWork.has('sidebar')) syncActions();
    const full = surfaceMain !== main || activeWork.has('shell');
    const cardRoots = full ? [main] : [...dirtyRoots].filter(node => node.isConnected && main.contains(node));
    const composerWork = full || activeWork.has('composer') || activeWork.has('geometry');
    const popupWork = full || activeWork.has('popup');
    const next = new Map([...surfaces].filter(([node, state]) => node.isConnected &&
      (state.kind.startsWith('popup') || main.contains(node))).map(([node, state]) => [node, state.kind]));
    for (const [node, kind] of next) {
      if (full || kind.startsWith('composer-') && composerWork || kind.startsWith('popup') && popupWork ||
          !kind.startsWith('composer-') && !kind.startsWith('popup') && cardRoots.some(root => root.contains(node))) next.delete(node);
    }
    const scoped = selector => [...new Set(cardRoots.flatMap(root => [...(root.matches(selector) ? [root] : []), ...all(root, selector)]))];
    if (cardRoots.length) runtime.metrics.componentUpdates++;
    dirtyRoots.clear();
    const eligible = node => node instanceof Element && node.isConnected && main.contains(node) &&
      !node.closest('[hidden], [inert], [aria-hidden="true"], [data-aria-hidden="true"]');
    const mark = (node, kind) => { if (eligible(node)) next.set(node, kind); };
    for (const header of scoped('div[class~="group/activity-header"]')) {
      if (!eligible(header)) continue;
      const triggers = [...header.children].filter(node => node.matches('button[aria-expanded][aria-labelledby]'));
      if (triggers.length !== 1) continue;
      mark(header, 'activity-header');
      mark(triggers[0], 'activity-trigger');
      mark(header.closest('[data-local-conversation-item-target-ids]'), 'activity-group');
      const indicators = all(header, ':scope > span > svg[aria-hidden="true"]').filter(node => (node.getAttribute('class') || '').includes('activity-header'));
      // The indicator is deliberately aria-hidden; the native button supplies
      // its accessible name and state. Never assign material to arbitrary SVGs.
      if (indicators.length === 1) next.set(indicators[0], 'activity-indicator');
    }
    for (const body of scoped('[data-testid="exec-shell-body"]')) {
      if (!eligible(body)) continue;
      for (const card of all(body, 'div.group.rounded-lg')) {
        if (card.querySelector('div[class~="group/command"], div[class~="group/output"]')) mark(card, 'tool-output');
      }
    }
    for (const pre of scoped('pre')) {
      if (!eligible(pre)) continue;
      let tool = pre.parentElement;
      while (tool && tool !== main && next.get(tool) !== 'tool-output') tool = tool.parentElement;
      if (tool && tool !== main) { mark(pre, 'code-inner'); continue; }
      const wrapper = pre.closest('[class~="code-block"], [data-code-block]');
      if (wrapper && wrapper.querySelectorAll('pre').length === 1 && eligible(wrapper)) {
        mark(wrapper, 'code-surface'); mark(pre, 'code-inner');
      } else mark(pre, 'code-surface');
    }
    for (const header of scoped('div[class~="group/turn-diff-header"]')) {
      const card = header.parentElement;
      if (!eligible(card) || !header.querySelector('button')) continue;
      mark(card, 'file-card');
      for (const child of card.children) if (child !== header) mark(child, 'file-content');
      for (const row of all(card, '[class~="group/turn-diff-file-row"]')) mark(row, 'file-row');
    }
    for (const node of scoped('[data-summary-panel-variant], [data-user-message-bubble="true"], [data-message-author-role="user"], [data-app-shell-page-banner], [data-codex-composer-root] aside')) {
      mark(node, node.matches('[data-summary-panel-variant]') ? 'summary-card' : node.matches('[data-app-shell-page-banner], aside') ? 'banner' : 'user-message');
    }
    if (composerWork && composer.host?.getAttribute('data-composer-placement') === 'home') {
      for (const node of all(main, '[data-ds-part="home-hero"]')) mark(node, 'home-title');
    }
    if (composerWork && composer.surface) {
      let frame = composer.surface;
      let extension = 0, topExtension = 0, detachedRail = false;
      const utility = all(composer.host, '[data-composer-utility-bar], [data-composer-utility], [class*="ComposerUtility"], [class*="ComposerLayoutUtilityBar"], [data-composer-rail-item][data-composer-placement="home"]')
        .filter(node => eligible(node) && node !== composer.surface);
      if (utility.length === 1) {
        let common = composer.surface.parentElement;
        while (common && common !== composer.host && !common.contains(utility[0])) common = common.parentElement;
        const nativeRail = utility[0].hasAttribute('data-composer-rail-item') && !utility[0].querySelector(EDITORS);
        const protectedContent = common && all(common, '[role="alert"], [data-above-composer-portal], [data-home-beacon-banner], [data-codex-composer-root] aside')
          .some(node => node.textContent.trim() || node.querySelector(INTERACTIVE));
        const extraContent = common === composer.host && [...common.children].some(node =>
          !node.contains(composer.surface) && !node.contains(utility[0]) && (node.textContent.trim() || node.querySelector(INTERACTIVE)));
        if (composer.surface.contains(utility[0]) && nativeRail) {
          const base = rect(composer.surface), rail = rect(utility[0]);
          if (rail.x >= base.x - 1 && rail.right <= base.right + 1 && rail.bottom <= base.bottom + 96) extension = Math.max(0, rail.bottom - base.bottom);
        } else if (common && editorNodes(common).length === 1 && !protectedContent && !extraContent &&
          (getComputedStyle(common).position === 'relative' || common === composer.host && nativeRail)) frame = common;
        if (frame === composer.surface && !frame.contains(utility[0]) && nativeRail) {
          const base = rect(frame), rail = rect(utility[0]);
          const notices = all(composer.host, '[data-above-composer-portal], [role="alert"], [data-home-beacon-banner], [data-codex-composer-root] aside').filter(visible);
          const overlapsNotice = notices.some(node => { const n = rect(node); return n.bottom > rail.y + 1 && n.y < base.bottom && n.right > base.x && n.x < base.right; });
          if (!overlapsNotice && rail.x >= base.x - 1 && rail.right <= base.right + 1 && rail.bottom <= base.y + 10 && base.y - rail.y <= 128) {
            topExtension = base.y - rail.y; detachedRail = true;
          }
        }
        // Outside notices make this composite unverified. In that case leave
        // the utility's native material intact instead of clearing its shield.
        if (frame.contains(utility[0]) || detachedRail) {
          mark(utility[0], 'composer-utility');
          mark(utility[0].closest('[data-composer-rail]'), 'composer-utility');
        }
      }
      mark(frame, 'composer-frame');
      if (frame !== composer.surface) mark(composer.surface, 'composer-inner');
      syncExtension(frame, extension, topExtension);
    } else if (composerWork) syncExtension(null, 0);
    for (const node of popupWork ? all(document, '[role="menu"], [role="listbox"], [role="dialog"], [role="tooltip"]') : []) {
      if (!visible(node)) continue;
      const host = node.closest('[data-radix-popper-content-wrapper]')?.firstElementChild;
      const owner = host && host.contains(node) && painted(host) ? host : node;
      next.set(owner, 'popup');
      if (owner !== node) next.set(node, 'popup-inner');
    }
    for (const [node, state] of surfaces) if (next.get(node) !== state.kind) releaseSurface(node);
    for (const [node, kind] of next) {
      if (!surfaces.has(node)) surfaces.set(node, { kind, before: node.getAttribute(SURFACE_ATTR) === kind ? null : node.getAttribute(SURFACE_ATTR) });
      if (node.getAttribute(SURFACE_ATTR) !== kind) node.setAttribute(SURFACE_ATTR, kind);
    }
    surfaceMain = main;
    surfaceComposer = composer.surface;
    surfacesDirty = false;
    visualReport = null;
  };
  const clearVisuals = () => {
    dirtyRoots.clear();
    for (const name of Object.keys(moduleState)) delete moduleState[name];
    [...extensions.keys()].forEach(releaseExtension);
    [...actionOffsets.keys()].forEach(releaseActionOffset);
    [...surfaces.keys()].forEach(releaseSurface);
    surfaceMain = surfaceComposer = null;
    surfacesDirty = true;
    visualReport = null;
    moduleCache.clear();
    [...roles.keys()].forEach(releaseRole);
    classes.forEach((names, node) => names.forEach(name => node.classList.remove(name)));
    classes.clear();
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(CHROME_ID)?.remove();
    document.getElementById(BACKGROUND_ID)?.remove();
    for (const key of ['--sg-shell-left', '--sg-shell-top']) document.documentElement?.style.removeProperty(key);
    resizeObserver?.disconnect();
    layoutObserver?.disconnect(); layoutTargets.clear(); layoutBoxes = new WeakMap();
    observedMain = null;
    observedComposer = null;
  };
  const releaseHomeSlot = node => {
    if (node.getAttribute(HOME_SLOT_ATTR) === 'true') {
      const before = homeSlots.get(node);
      if (before === null) node.removeAttribute(HOME_SLOT_ATTR); else node.setAttribute(HOME_SLOT_ATTR, before);
    }
    homeSlots.delete(node);
  };
  const clearCompatibility = () => {
    [...homeSlots.keys()].forEach(releaseHomeSlot);
    document.getElementById(COMPATIBILITY_STYLE_ID)?.remove();
    if (compatibilityBefore !== undefined && document.documentElement.getAttribute(COMPATIBILITY_ATTR) === 'active') {
      if (compatibilityBefore === null) document.documentElement.removeAttribute(COMPATIBILITY_ATTR);
      else document.documentElement.setAttribute(COMPATIBILITY_ATTR, compatibilityBefore);
    }
    compatibilityBefore = undefined;
  };
  const installCompatibility = () => {
    const root = document.documentElement;
    if (compatibilityBefore === undefined) compatibilityBefore = root.getAttribute(COMPATIBILITY_ATTR);
    if (root.getAttribute(COMPATIBILITY_ATTR) !== 'active') root.setAttribute(COMPATIBILITY_ATTR, 'active');
    let style = document.getElementById(COMPATIBILITY_STYLE_ID);
    if (!style) { style = document.createElement('style'); style.id = COMPATIBILITY_STYLE_ID; (document.head || root).appendChild(style); }
    if (style.textContent !== COMPATIBILITY_CSS) style.textContent = COMPATIBILITY_CSS;
    // A positional selector is never sufficient: only empty, noninteractive
    // spacers with the known legacy 440px constraint qualify for this repair.
    if (!activeWork.has('shell')) return;
    const slots = new Set();
    for (const layout of all(document, '[class*="group/home-composer-layout"]')) {
      if (layout.closest('[hidden], [inert], [aria-hidden="true"]')) continue;
      const candidates = [...layout.children].flatMap(node => getComputedStyle(node).display === 'contents' ? [...node.children] : [node]);
      for (const node of candidates) {
        if (node.tagName !== 'DIV' || node.childElementCount || node.textContent.trim() || node.matches(INTERACTIVE)) continue;
        const s = getComputedStyle(node);
        if (!homeSlots.has(node) && ![s.minHeight, s.flexBasis].some(value => Math.abs(parseFloat(value) - 440) <= 1)) continue;
        slots.add(node);
        if (!homeSlots.has(node)) homeSlots.set(node, node.getAttribute(HOME_SLOT_ATTR));
        if (node.getAttribute(HOME_SLOT_ATTR) !== 'true') node.setAttribute(HOME_SLOT_ATTR, 'true');
      }
    }
    for (const node of homeSlots.keys()) if (!slots.has(node)) releaseHomeSlot(node);
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
  const chrome = (main, page) => {
    let background = document.getElementById(BACKGROUND_ID);
    if (!background) {
      background = document.createElement('div'); background.id = BACKGROUND_ID;
      background.setAttribute('aria-hidden', 'true'); document.body.appendChild(background);
    }
    let node = document.getElementById(CHROME_ID);
    if (!node) {
      node = document.createElement('div');
      node.id = CHROME_ID;
      node.setAttribute('aria-hidden', 'true');
      // Home badges retain measured clearance from native controls; never intercept input.
      node.innerHTML = '<div class="sg-brand"><img class="sg-brand-icon" alt=""><div><b>SPIDER-GWEN</b><small>EARTH-65 · DIMENSIONAL CODE</small></div></div><div class="sg-status"><i></i>DIMENSION LINK // STABLE</div><div class="sg-print-dots"></div><div class="sg-speed-lines"></div><div class="sg-web-corner"></div>';
      node.querySelector('img').src = ICON_DATA_URL;
      document.body.appendChild(node);
    }
    const box = layoutRect(main);
    const set = (target, key, value) => { if (target.style.getPropertyValue(key) !== value) target.style.setProperty(key, value); };
    set(document.documentElement, '--sg-shell-left', `${Math.round(box.x)}px`);
    set(document.documentElement, '--sg-shell-top', `${Math.max(0, Math.round(box.y))}px`);
    // CSSOM serializes fractional pixels to fewer decimals. Compare the same
    // precision so unchanged geometry never emits another style mutation.
    for (const [key, value] of Object.entries({ left: box.x, top: box.y, width: box.width, height: box.height })) set(node, key, `${Math.round(value * 100) / 100}px`);
    setClass(node, 'spider-gwen-home-shell', page.route === 'home');
    setClass(node, 'spider-gwen-task-shell', page.route !== 'home');
    if (page.route === 'home') {
      const controls = all(roles.get('shell-header')?.node, 'button, a').filter(visible).map(rect);
      const occupied = (r, others) => others.some(b => r.x < b.right + 16 && r.right > b.x - 16 && r.y < b.bottom + 16 && r.bottom > b.y - 16);
      const brand = node.querySelector('.sg-brand'), status = node.querySelector('.sg-status');
      const br = rect(brand), sr = rect(status);
      set(brand, 'visibility', br.width && br.right <= box.right - 16 && !occupied(br, controls) ? 'visible' : 'hidden');
      set(status, 'visibility', sr.width && !occupied(sr, [...controls, br]) && sr.x >= box.x + 16 ? 'visible' : 'hidden');
    }
    return node;
  };
  const update = values => {
    runtime.diagnostics = { ...values, version: VERSION, sourceSignature: SOURCE_SIGNATURE, compatibilityRevision: COMPATIBILITY_REVISION, checkedAt: Date.now(), bootstrapError };
    return runtime.diagnostics;
  };
  const ensure = () => {
    if (disposed || window[STATE_KEY] !== runtime) return runtime.diagnostics;
    activeWork = new Set(dirty); dirty.clear();
    if (!activeWork.size) return runtime.diagnostics;
    runtime.metrics.ensurePasses++;
    if (activeWork.has('shell')) runtime.metrics.fullScans++;
    const started = performance.now();
    const moduleErrors = {};
    const resolveModule = (name, resolve, fallback) => {
      const moduleStarted = sampling ? performance.now() : 0;
      try {
        const kinds = name === 'composer' ? ['shell','composer'] : name === 'sidebar' ? ['shell','sidebar'] :
          ['header','settings'].includes(name) ? ['shell'] : ['footer','footerFade'].includes(name) ? ['shell','footer'] :
          ['shell','components','composer','geometry','sidebar','popup'];
        const value = name === 'surfaces' || name === 'decoration' ? resolve() : memo(name, resolve, kinds);
        moduleState[name] = { status: 'ready' }; return value;
      } catch (error) {
        runtime.metrics.errors++;
        moduleErrors[name] = String(error);
        moduleState[name] = { status: 'degraded', reason: String(error) };
        return fallback;
      } finally {
        if (sampling) recordDuration('module:' + name + ':' + [...activeWork].join(','), performance.now() - moduleStarted);
      }
    };
    try {
      const engine = engineState();
      const id = themeId();
      const kind = windowKind();
      const inactive = id !== 'spider-gwen' || kind === 'pet' || !engine.ready;
      if (inactive) {
        clearVisuals();
        clearCompatibility();
        return update({ mode: engine.kind === 'pending' && id === 'spider-gwen' && kind !== 'pet' ? 'base-only' : 'inactive',
          reason: kind === 'pet' ? 'excluded-pet-window' : id !== 'spider-gwen' ? 'theme-mismatch' : engine.reason,
          engine: engine.kind, dreamSkinReady: engine.ready, themeId: id, windowKind: kind,
          pageKind: 'unknown', route: 'unknown', capabilities: {}, anchors: {}, lastError: null });
      }
      installCompatibility();
      const selection = memo('main', findMain);
      const main = selection.node;
      if (!main) {
        clearVisuals();
        return update({ mode: 'degraded', reason: selection.source, engine: engine.kind, dreamSkinReady: true,
          themeId: id, windowKind: kind, pageKind: 'unknown', route: 'unknown', capabilities: { shellMain: false }, anchors: {}, lastError: null });
      }
      // Install the scoped compatibility repair before measuring descendants:
      // Codex++ 1.4 hides the content-bearing top-fade wrapper in Codex 26.924.
      installStyle();
      const composer = resolveModule('composer', () => findComposer(main), { editor: null, host: null, surface: null, source: 'resolver-error' });
      if (moduleCache.has('footer') && (composer.host?.closest('[data-thread-scroll-footer="true"]') || null) !== moduleCache.get('footer')?.footer) {
        activeWork.add('footer');
      }
      const page = memo('page', () => classify(main, composer), ['shell','composer']);
      const sidebar = resolveModule('sidebar', findSidebar, null);
      const header = resolveModule('header', () => findHeader(main), { node: null, source: 'resolver-error' });
      const footer = resolveModule('footer', () => findFooter(main, composer), { footer: null, decor: null, source: 'resolver-error' });
      const footerFade = resolveModule('footerFade', () => findFooterFade(main, footer.footer), null);
      syncRole('shell-main', main);
      syncRole('sidebar', sidebar);
      syncRole('shell-header', header.node);
      syncRole('native-menu', memo('native-menu', findNativeMenu));
      syncRole('composer', composer.surface);
      syncRole('composer-editor', composer.editor);
      syncRole('composer-body', memo('composer-body', () => firstVisible(composer.surface, '[data-composer-body], [data-composer-layout-body], [class*="ComposerLayoutBody"]'), ['shell','composer']));
      syncRole('composer-footer', memo('composer-footer', () => firstVisible(composer.surface, '[data-composer-footer-responsive], [class*="ComposerLayoutFooter"]'), ['shell','composer']));
      syncRole('footer-decoration', footer.decor);
      syncRole('footer-fade', footerFade);
      syncRole('home', memo('home', () => page.route === 'home' ? firstVisible(main, '[role="main"]') : null, ['shell','composer']));
      const settingsSurface = page.route === 'settings' ? resolveModule('settings', () => findSettingsSurface(main), null) : null;
      syncRole('settings-surface', settingsSurface);
      resolveModule('surfaces', () => syncSurfaces(main, composer), null);
      // An effect layer is optional. Never hide a semantic node containing real controls.
      const fade = memo('fade', () => firstVisible(main, '[data-app-shell-main-content-top-fade]'));
      syncRole('top-fade', fade && !fade.childElementCount && !fade.textContent.trim() && !fade.matches(INTERACTIVE) ? fade : null);
      for (const node of [main, (activeWork.has('shell') || activeWork.has('geometry') ? resolveModule('decoration', () => chrome(main, page), null) : document.getElementById(CHROME_ID))]) {
        setClass(node, 'spider-gwen-home-shell', page.route === 'home');
        setClass(node, 'spider-gwen-task-shell', page.route !== 'home');
      }
      observeLayout(main, composer.surface);
      const capabilities = { shellMain: true, sidebar: Boolean(sidebar), header: Boolean(header.node),
        activeComposer: Boolean(composer.host && composer.editor), composer: Boolean(composer.surface),
        footerDecoration: Boolean(footer.decor), footerFade: Boolean(footerFade), essentialRepair: true,
        settingsSurface: Boolean(settingsSurface),
        visualHome: page.route === 'home', nativeHomeLayout: true };
      const missing = [!header.node && 'header', page.route !== 'settings' && !composer.surface && 'composer-surface',
        page.route === 'settings' && !settingsSurface && 'settings-surface',
        footer.footer && !footer.decor && 'footer-decoration'].filter(Boolean);
      const complete = page.pageKind !== 'unknown' && (page.route === 'settings' || capabilities.activeComposer) && !missing.length && !Object.keys(moduleErrors).length;
      if (complete && ['base-only', 'degraded'].includes(runtime.diagnostics.mode)) runtime.metrics.recoveries++;
      const geometryStarted = sampling ? performance.now() : 0;
      const geometry = { geometry: layoutRect(main), composerGeometry: layoutRect(composer.surface) };
      if (sampling) recordDuration('geometry-read', performance.now() - geometryStarted);
      return update({ mode: complete ? 'full' : 'degraded', reason: complete ? 'ready' : 'optional-or-unknown-layout',
        ...page, engine: engine.kind, dreamSkinReady: true, themeId: id, windowKind: kind, capabilities,
        anchors: { shellMain: selection.source, composer: composer.source || 'missing', header: header.source, footerDecoration: footer.source,
          footerFade: footerFade ? 'empty-sticky-scroll-decoration' : 'not-recognized-or-absent' }, missing, moduleErrors,
        ...geometry, lastError: null });
    } catch (error) {
      runtime.metrics.errors++;
      clearVisuals();
      return update({ mode: 'degraded', reason: 'ensure-error', capabilities: {}, lastError: String(error?.stack || error) });
    } finally {
      if (activeWork.has('geometry')) runtime.metrics.geometryUpdates++;
      recordDuration(activeWork.has('shell') ? 'full' : 'component', performance.now() - started);
      runtime.metrics.lastEnsureMs = Math.round((performance.now() - started) * 100) / 100;
      runtime.metrics.maxEnsureMs = Math.max(runtime.metrics.maxEnsureMs, runtime.metrics.lastEnsureMs);
    }
  };
  const getDiagnostics = () => JSON.parse(JSON.stringify({ ...runtime.diagnostics,
    visualChecks: visualReport?.checks || null, visualIssues: visualReport?.issues || [],
    visualCheckedAt: visualReport?.checkedAt || null,
    ...(visualReport?.issues.length ? { mode: 'degraded', reason: 'visual-check-failed' } : {}), metrics: runtime.metrics, modules: moduleState, performance: sampling ? performanceSamples : null }));
  const checkVisuals = () => {
    const issues = [], checks = {};
    const main = roles.get('shell-main')?.node;
    if (!main) return { checks, issues };
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const color = value => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const blend = (fg, bg) => fg.slice(0, 3).map((value, i) => value * fg[3] / 255 + bg[i] * (1 - fg[3] / 255));
    const luminance = rgb => rgb.map(value => { const v = value / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; })
      .reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
    const contrast = (foreground, background) => { const a = luminance(blend(foreground, background)), b = luminance(background); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
    if (runtime.diagnostics.route === 'thread') {
      const s = getComputedStyle(main);
      // Conservatively composite against white wallpaper, including a 3%
      // allowance for the subtle accent wash. No wallpaper pixel sampling.
      const layer = document.getElementById(BACKGROUND_ID);
      const backdrop = layer ? blend(color(getComputedStyle(layer).backgroundColor), [255, 255, 255]) : [255, 255, 255];
      const bg = blend(color(s.backgroundColor), backdrop).map(value => value + (255 - value) * .03);
      const foregrounds = { primary: s.color, secondary: s.getPropertyValue('--sg-reading-muted').trim(), link: s.getPropertyValue('--sg-cyan').trim() };
      checks.readingContrast = Object.fromEntries(Object.entries(foregrounds).map(([key, value]) => [key, Math.round(contrast(color(value), bg) * 100) / 100]));
      checks.readingContrast.minimum = Math.min(...Object.values(checks.readingContrast));
      if (checks.readingContrast.minimum < 4.5 || Number(s.opacity) !== 1) issues.push('reading-contrast');
    }

    const layer = document.getElementById(BACKGROUND_ID), layerBox = rect(layer);
    checks.backgroundCoverage = Boolean(layerBox && layerBox.x === 0 && layerBox.y === 0 && layerBox.width >= innerWidth - 1 && layerBox.height >= innerHeight - 1);
    checks.shellContinuity = [main, roles.get('sidebar')?.node, roles.get('native-menu')?.node, roles.get('shell-header')?.node].filter(Boolean).every(node => {
      const s = getComputedStyle(node); return color(s.backgroundColor)[3] === 0 && s.backgroundImage === 'none' && s.backdropFilter === 'none';
    });
    if (!checks.backgroundCoverage) issues.push('background-incomplete');
    if (!checks.shellContinuity) issues.push('shell-material-discontinuous');
    const avatar = firstVisible(roles.get('sidebar')?.node, 'button[aria-label="打开个人资料菜单"]');
    checks.avatarSize = !avatar || rect(avatar).width >= 28 && rect(avatar).height >= 28;
    if (!checks.avatarSize) issues.push('native-avatar-compressed');
    const mode = firstVisible(roles.get('sidebar')?.node, 'button[aria-label^="切换模式"],button[aria-label*="Switch mode"]');
    checks.modeDecoration = !mode || ['none', '""'].includes(getComputedStyle(mode, '::after').content);
    if (!checks.modeDecoration) issues.push('mode-decoration-overlap');
    checks.sidebarActions = true;
    for (const row of all(roles.get('sidebar')?.node, '[data-app-action-sidebar-thread-row]')) {
      const buttons = all(row, 'button').filter(node => painted(node) && !node.closest('[hidden]'));
      for (let a = 0; a < buttons.length; a++) for (let b = a + 1; b < buttons.length; b++) {
        const x = rect(buttons[a]), y = rect(buttons[b]);
        if (Math.min(x.right,y.right)-Math.max(x.x,y.x) > 1 && Math.min(x.bottom,y.bottom)-Math.max(x.y,y.y) > 1) checks.sidebarActions = false;
      }
    }
    if (!checks.sidebarActions) issues.push('sidebar-actions-overlap');
    checks.summaryBorder = [...surfaces].filter(([, state]) => state.kind === 'summary-card').every(([node]) => {
      const s = getComputedStyle(node, '::after'); return s.content === '""' && s.pointerEvents === 'none' && parseFloat(s.paddingTop) === 1;
    });
    if (!checks.summaryBorder) issues.push('summary-border-incomplete');
    checks.summaryHeadingScrims = [...surfaces].filter(([, state]) => state.kind === 'summary-card').every(([node]) =>
      all(node, 'header').every(header => {
        const s = getComputedStyle(header, '::before');
        return color(s.backgroundColor)[3] === 0 && s.backgroundImage === 'none' && s.boxShadow === 'none';
      }));
    if (!checks.summaryHeadingScrims) issues.push('summary-heading-material-stacked');
    checks.brandClearance = all(document.getElementById(CHROME_ID), '.sg-brand, .sg-status').filter(visible).every(node => {
      const a = rect(node), box = rect(main);
      return a.x >= box.x && a.right <= box.right && all(roles.get('shell-header')?.node, 'button, a').filter(visible).every(control => {
        const b = rect(control); return a.right + 16 <= b.x || a.x - 16 >= b.right || a.bottom + 16 <= b.y || a.y - 16 >= b.bottom;
      });
    });
    if (!checks.brandClearance) issues.push('brand-controls-overlap');
    const composerHost = roles.get('composer')?.node?.closest(COMPOSERS);
    checks.composerUtilities = all(composerHost, '[data-composer-rail-item][data-composer-placement="home"]').filter(visible)
      .every(node => surfaces.get(node)?.kind === 'composer-utility');
    if (!checks.composerUtilities) issues.push('composer-utility-unverified');
    checks.activityLayers = true; checks.expandIndicators = true; checks.cardLayers = true;
    checks.surfaceCoverage = all(main, '[data-local-conversation-item-target-ids] button[aria-expanded][aria-labelledby]')
      .filter(node => !node.closest('[hidden], [inert], [aria-hidden="true"], [data-aria-hidden="true"]'))
      .every(node => surfaces.get(node)?.kind === 'activity-trigger');
    if (!checks.surfaceCoverage) issues.push('activity-structure-unrecognized');
    for (const [node, state] of surfaces) {
      if (state.kind === 'activity-header') {
        for (const child of all(node, 'span, svg')) {
          const s = getComputedStyle(child);
          if (color(s.backgroundColor)[3] || s.backgroundImage !== 'none' || s.backdropFilter !== 'none') checks.activityLayers = false;
        }
      }
      if (state.kind === 'activity-indicator') {
        const s = getComputedStyle(node);
        if (Number(s.opacity) < .8 || parseFloat(s.width) - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight) < 8) checks.expandIndicators = false;
      }
      if (['code-inner', 'file-row', 'file-content', 'composer-inner'].includes(state.kind)) {
        const s = getComputedStyle(node);
        if (color(s.backgroundColor)[3] || s.backgroundImage !== 'none' || s.backdropFilter !== 'none') checks.cardLayers = false;
      }
    }
    if (!checks.activityLayers) issues.push('nested-activity-material');
    if (!checks.expandIndicators) issues.push('expand-indicator-hidden-or-clipped');
    if (!checks.cardLayers) issues.push('nested-card-material');
    const frames = [...surfaces].filter(([, state]) => state.kind === 'composer-frame');
    checks.composerMaterial = !roles.has('composer') || frames.length === 1 && getComputedStyle(frames[0][0], '::before').backgroundImage.includes('gradient(');
    if (!checks.composerMaterial) issues.push('composer-material-overridden');
    checks.composerFrameBounds = frames.every(([node]) => {
      const expected = node.getBoundingClientRect().height + parseFloat(node.style.getPropertyValue('--sg-composer-extension') || '0') + parseFloat(node.style.getPropertyValue('--sg-composer-top-extension') || '0');
      const box = pseudo => { const s = getComputedStyle(node, pseudo); return parseFloat(s.height) + (s.boxSizing === 'border-box' ? 0 : parseFloat(s.paddingTop) + parseFloat(s.paddingBottom)); };
      return Math.abs(box('::before') - expected) <= 1 && Math.abs(box('::after') - expected) <= 1;
    });
    if (!checks.composerFrameBounds) issues.push('composer-frame-incomplete');
    return { checks, issues };
  };
  // Public checks are explicit reconciliation requests. Background checks use
  // the dirty cache; callers never receive stale ownership after a DOM change.
  const forceEnsure = () => { invalidate('shell'); const result = ensure(); bindObserver(); return result; };
  const selfCheck = () => {
    const diagnostics = forceEnsure();
    const active = roles.has('shell-main');
    const styleCount = document.querySelectorAll(`#${STYLE_ID}`).length;
    const chromeCount = document.querySelectorAll(`#${CHROME_ID}`).length;
    const compatibilityCount = document.querySelectorAll(`#${COMPATIBILITY_STYLE_ID}`).length;
    const issues = [];
    if (active && (styleCount !== 1 || chromeCount !== 1)) issues.push('duplicate-or-missing-owned-layer');
    if (!active && (styleCount || chromeCount || document.documentElement.classList.contains(ROOT_CLASS))) issues.push('inactive-theme-leak');
    if (active && document.documentElement.scrollWidth > innerWidth + 1) issues.push('horizontal-overflow');
    const expected = themeId() === 'spider-gwen' && engineState().ready && windowKind() !== 'pet';
    if (expected && !diagnostics.capabilities?.shellMain) issues.push('core-main-unverified');
    if (expected && diagnostics.route !== 'settings' && !diagnostics.capabilities?.activeComposer) issues.push('core-composer-unverified');
    if (expected && compatibilityCount !== 1) issues.push('essential-repair-missing');
    if (!expected && compatibilityCount) issues.push('inactive-compatibility-leak');
    const composer = roles.get('composer')?.node;
    if (composer) {
      const box = rect(composer);
      if (!visible(composer) || box.bottom > innerHeight + 1) issues.push('composer-clipped');
    }
    const decor = document.getElementById(CHROME_ID);
    if (decor && getComputedStyle(decor).pointerEvents !== 'none') issues.push('decoration-intercepts-input');
    const editor = roles.get('composer-editor')?.node;
    if (expected && diagnostics.route !== 'settings' && (!editor || !visible(editor))) issues.push('core-editor-hidden');
    const unusable = diagnostics.mode === 'base-only' || diagnostics.reason === 'ensure-error';
    const visual = checkVisuals();
    visualReport = { ...visual, checkedAt: Date.now() };
    return { ok: !issues.length && !visual.issues.length && ['full', 'inactive'].includes(diagnostics.mode),
      functionalOk: !issues.length && !unusable, structuralOk: !issues.length, visualOk: !visual.issues.length,
      visualChecks: visual.checks, visualIssues: visual.issues,
      usable: !issues.length && !unusable && !visual.issues.includes('reading-contrast'), activeTheme: active, version: VERSION, issues,
      singletons: { style: styleCount, chrome: chromeCount, compatibility: compatibilityCount }, diagnostics: getDiagnostics() };
  };
  const schedule = () => {
    if (disposed || scheduler.timeout || window[STATE_KEY] !== runtime) return;
    scheduler.timeout = setTimeout(() => { scheduler.timeout = null; if (document.hidden) return; const shellWork = dirty.has('shell'); ensure(); if (shellWork) bindObserver(); armRetry(); }, 80);
  };
  const on = (target, name, handler) => { target.addEventListener(name, handler); listeners.push(() => target.removeEventListener(name, handler)); };
  const stopResources = () => {
    const cleanup = [() => observer?.disconnect(), () => rootObserver?.disconnect(), () => resizeObserver?.disconnect(), () => layoutObserver?.disconnect(),
      () => clearTimeout(timer), () => clearTimeout(scheduler.retry), () => clearTimeout(scheduler.timeout), ...listeners.splice(0)];
    for (const fn of cleanup) {
      try { fn(); } catch (error) { bootstrapError = [bootstrapError, `cleanup: ${String(error)}`].filter(Boolean).join('; '); }
    }
    timer = scheduler.timeout = scheduler.retry = null;
    runtime.timer = null;
    sampling = false;
    performanceSamples.length = 0;
  };
  const releaseOwnedState = () => { if (window[STATE_KEY] === runtime) { clearVisuals(); clearCompatibility(); } };
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    stopResources();
    if (window[STATE_KEY] === runtime) { releaseOwnedState(); delete window[STATE_KEY]; }
  };
  const stripOwnedClasses = value => String(value || '').split(/\s+/).filter(name => name && name !== ROOT_CLASS && !name.startsWith('spider-gwen-')).sort().join(' ');

  const observeLayout = (main, surface) => {
    if (typeof ResizeObserver !== 'function') return;
    if (!resizeObserver) {
      if (typeof IntersectionObserver === 'function') layoutObserver = new IntersectionObserver(entries => {
        if (disposed || document.hidden) return;
        const started = sampling ? performance.now() : 0;
        for (const entry of entries) {
          const old = layoutBoxes.get(entry.target), box = entry.boundingClientRect;
          layoutBoxes.set(entry.target, { x:box.x,y:box.y,width:box.width,height:box.height,right:box.right,bottom:box.bottom });
          if (entry.target === observedMain && old && (old.width !== box.width || old.x !== box.x)) invalidate('sidebar');
        }
        invalidate('geometry'); surfacesDirty = true; schedule();
        if (sampling) recordDuration('layout-capture', performance.now()-started);
      });
      resizeObserver = new ResizeObserver(() => {
        if (disposed || document.hidden) return;
        if (layoutObserver) for (const node of layoutTargets) { layoutObserver.unobserve(node); layoutObserver.observe(node); }
        else { invalidate('geometry'); surfacesDirty = true; schedule(); }
      });
    }
    observedMain = main; observedComposer = surface;
    const next = new Set([main,surface,...[...surfaces].filter(([,state]) => ['composer-frame','composer-utility'].includes(state.kind)).map(([node]) => node)].filter(Boolean));
    for (const node of layoutTargets) if (!next.has(node)) { resizeObserver.unobserve(node); layoutObserver?.unobserve(node); layoutTargets.delete(node); layoutBoxes.delete(node); }
    for (const node of next) if (!layoutTargets.has(node)) { layoutTargets.add(node); resizeObserver.observe(node); layoutObserver?.observe(node); }
    runtime.resizeObserver = resizeObserver; runtime.layoutObserver = layoutObserver;
  };
  const markComponent = node => {
    const owner = node.closest('[data-local-conversation-item-target-ids], [data-summary-panel-variant], [data-message-author-role], [data-user-message-bubble], [data-code-block]') || node;
    dirtyRoots.add(owner); invalidate('components');
  };
  const signal = node => {
    if (node.matches('main, [data-app-shell-main-surface], [data-app-shell-active-page]')) invalidate('shell');
    else if (node.closest(COMPOSERS) || node.querySelector(COMPOSERS)) { invalidate('composer'); invalidate('geometry'); }
    else if (node.closest('[role="menu"], [role="dialog"], [role="listbox"], [role="tooltip"], [data-radix-popper-content-wrapper]') || node.querySelector('[role="menu"], [role="dialog"], [role="listbox"], [role="tooltip"]')) invalidate('popup');
    else if (node.closest('[data-spider-gwen-role="sidebar"]')) { invalidate('sidebar'); surfacesDirty = true; }
    else if (node.matches('[data-summary-panel-variant], [data-local-conversation-item-target-ids], pre') || node.closest('[data-local-conversation-item-target-ids], [data-summary-panel-variant], [data-message-author-role]') || node.querySelector(SURFACE_HINTS)) markComponent(node);
    else invalidate('shell');
  };
  rootObserver = new MutationObserver(records => {
    if (records.some(r => r.attributeName === 'class' ? stripOwnedClasses(r.oldValue) !== stripOwnedClasses(r.target.className) : r.oldValue !== r.target.getAttribute(r.attributeName))) { invalidate('shell'); schedule(); }
  });
  rootObserver.observe(document.documentElement, { attributes: true, attributeOldValue: true,
    attributeFilter: ['class','data-dream-skin','data-dream-shell','data-theme','data-dream-task-mode','data-dream-art-task-mode'] });
  observer = new MutationObserver(records => {
    runtime.metrics.observerBatches++;
    let relevant = false;
    for (const record of records) {
      const target = record.target;
      if (!(target instanceof Element) || [STYLE_ID, CHROME_ID, COMPATIBILITY_STYLE_ID, BACKGROUND_ID].includes(target.id) || target.closest('#'+CHROME_ID)) continue;
      if (record.type === 'attributes') {
        if (!target.closest('[data-spider-gwen-role="sidebar"] [data-app-action-sidebar-thread-row]') && !surfaces.has(target) && !target.matches(STRUCTURAL) && !target.matches('button[aria-label*="切换模式"], button[aria-label*="switch mode" i]')) continue;
        let values = attributeValues.get(target); if (!values) { values = new Map(); attributeValues.set(target, values); }
        const value = record.attributeName === 'class' ? stripOwnedClasses(target.className) : target.getAttribute(record.attributeName);
        if (values.get(record.attributeName) === value) continue;
        values.set(record.attributeName, value);
        if (record.attributeName === 'class' && [roles.get('composer-editor')?.node, roles.get('composer')?.node].includes(target)) {
          invalidate('geometry'); surfacesDirty = true;
        } else signal(target);
        relevant = true;
      } else {
        if (target.closest('[data-spider-gwen-role="sidebar"]') && [...record.addedNodes,...record.removedNodes].some(n => n instanceof Element)) { invalidate('sidebar'); surfacesDirty = true; relevant = true; continue; }
        if (homeSlots.has(target) || target === roles.get('footer-decoration')?.node || target === roles.get('footer-fade')?.node) { invalidate('shell'); relevant = true; }
        // Text streaming and ordinary paragraphs/buttons have no structural work.
        for (const node of [...record.addedNodes, ...record.removedNodes]) {
          if (!(node instanceof Element)) continue;
          if (!node.matches(STRUCTURAL) && !node.querySelector(STRUCTURAL)) continue;
          if (node.matches('main, aside[data-app-shell-left-panel-appearance], [data-app-shell-main-surface]') || node.querySelector('[data-app-shell-main-surface]')) invalidate('shell');
          else if (!node.isConnected) signal(target);
          else signal(node);
          relevant = true;
        }
      }
    }
    if (relevant) schedule();
  });
  const bindObserver = () => {
    observer.disconnect();
    // Child discovery stays at the document boundary for route replacement;
    // attribute observation is limited to the active shell, not hidden caches.
    observer.observe(document.body, { childList: true, subtree: true });
    const shell = roles.get('shell-main')?.node?.closest('[data-app-shell-frame]') || roles.get('shell-main')?.node;
    if (shell) observer.observe(shell, { childList: true, subtree: true, attributes: true,
      attributeFilter: ['class','hidden','inert','aria-hidden','data-aria-hidden','aria-label','aria-pressed',
        'data-composer-placement','data-composer-layout','data-composer-surface-variant','data-app-shell-main-surface',
        'data-app-shell-active-page','data-settings-panel-slug','data-thread-scroll-footer','data-app-shell-titlebar','data-app-shell-focus-area'] });
    const side = roles.get('sidebar')?.node;
    if (side && !shell?.contains(side)) observer.observe(side, { childList: true, subtree: true, attributes: true, attributeFilter:['class','hidden','aria-label','aria-pressed'] });
  };
  const healthCheck = () => {
    if (disposed || document.hidden || window[STATE_KEY] !== runtime) return;
    const started = performance.now(); runtime.metrics.healthChecks++;
    const main = roles.get('shell-main')?.node, composer = roles.get('composer')?.node;
    const broken = !main?.isConnected || main.closest('[hidden],[inert],[aria-hidden="true"],[data-app-shell-active-page="false"]') ||
      runtime.diagnostics.route !== 'settings' && !composer?.isConnected ||
      document.getElementById(STYLE_ID)?.textContent !== CSS || !document.getElementById(BACKGROUND_ID) || !document.getElementById(COMPATIBILITY_STYLE_ID) ||
      themeId() !== runtime.diagnostics.themeId || engineState().ready !== runtime.diagnostics.dreamSkinReady;
    if (broken && (themeId() === 'spider-gwen' || roles.size)) { invalidate('shell'); schedule(); }
    runtime.metrics.lastHealthMs = Math.round((performance.now() - started) * 1000) / 1000;
    recordDuration('health', performance.now() - started);
  };
  const armHealth = () => {
    clearTimeout(timer); timer = null;
    if (disposed || document.hidden) { runtime.timer = null; return; }
    timer = setTimeout(() => { timer = null; healthCheck(); armHealth(); }, 5000); runtime.timer = timer;
  };
  const armRetry = () => {
    if (disposed || document.hidden || scheduler.retry || performance.now() - bootstrapStarted > 10000 || runtime.diagnostics.mode === 'full' || runtime.diagnostics.mode === 'inactive') return;
    scheduler.retry = setTimeout(() => { scheduler.retry = null; invalidate('shell'); ensure(); bindObserver(); armRetry(); }, retryDelays[Math.min(retryIndex++,retryDelays.length-1)]);
  };
  on(window, 'resize', () => { invalidate('geometry'); surfacesDirty = true; schedule(); });
  on(window, 'popstate', () => { invalidate('shell'); schedule(); });
  on(window, 'storage', () => { invalidate('shell'); schedule(); });
  on(document, 'visibilitychange', () => {
    if (document.hidden) { clearTimeout(scheduler.timeout); scheduler.timeout = null; clearTimeout(scheduler.retry); scheduler.retry = null; }
    else {
      healthCheck();
      if (layoutObserver) for (const node of layoutTargets) { layoutObserver.unobserve(node); layoutObserver.observe(node); }
      invalidate('geometry'); surfacesDirty = true;
      if (dirty.size) schedule();
    }
    armHealth();
  });
  on(document, 'focusin', event => { if (event.target?.closest?.(COMPOSERS)) { invalidate('geometry'); schedule(); } });
  Object.assign(runtime, { ensure: forceEnsure, destroy, stopResources, releaseOwnedState, getDiagnostics, selfCheck, observer, rootObserver, timer, scheduler,
    startPerformanceSampling: () => { performanceSamples.length = 0; sampling = true; },
    stopPerformanceSampling: () => { sampling = false; return performanceSamples.slice(); } });
  window[STATE_KEY] = runtime;
  ensure(); bindObserver(); armHealth(); armRetry();
