import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Separate process/profile: never attaches to or changes the user's Codex/browser.
export async function browser() {
  const executable = process.env.SKIN_TEST_BROWSER || [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/chromium', '/usr/bin/google-chrome',
  ].find(existsSync);
  if (!executable) throw new Error('Set SKIN_TEST_BROWSER to an existing Chromium browser. No installation is performed.');
  const work = path.resolve('work');
  await mkdir(work, { recursive: true });
  const profile = await mkdtemp(path.join(work, 'browser-'));
  const child = spawn(executable, [
    '--headless=new', '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-component-update', '--disable-sync', 'about:blank',
  ], { windowsHide: true, stdio: 'ignore' });
  let spawnError;
  child.on('error', error => { spawnError = error; });
  let ws;
  try {
    let port;
    for (let i = 0; i < 100; i++) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null) throw new Error(`Test browser exited: ${child.exitCode}`);
      try { port = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch {}
      if (port) break;
      await new Promise(r => setTimeout(r, 100));
    }
    if (!port) throw new Error('Test browser CDP startup timed out');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const target = targets.find(t => t.type === 'page' && t.url === 'about:blank');
    if (!target) throw new Error('Isolated test target missing');
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let id = 0;
    const pending = new Map();
    ws.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      const entry = pending.get(message.id);
      if (!entry) return;
      pending.delete(message.id);
      clearTimeout(entry.timeout);
      if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
      else entry.resolve(message.result);
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const key = ++id;
      const timeout = setTimeout(() => { pending.delete(key); reject(new Error(`CDP timeout: ${method}`)); }, 10000);
      pending.set(key, { resolve, reject, timeout });
      ws.send(JSON.stringify({ id: key, method, params }));
    });
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result?.value;
    };
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    return {
      send, evaluate, profile,
      async content(html) {
        await evaluate('window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__?.destroy?.()');
        const { frameTree } = await send('Page.getFrameTree');
        await send('Page.setDocumentContent', { frameId: frameTree.frame.id, html });
      },
      async close() {
        for (const entry of pending.values()) { clearTimeout(entry.timeout); entry.reject(new Error('Test browser closed')); }
        pending.clear();
        ws.close();
        // Only the process created above is stopped; profiles stay in ignored work/.
        child.kill();
      },
    };
  } catch (error) { ws?.close(); child.kill(); throw error; }
}
