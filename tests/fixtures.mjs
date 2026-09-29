// Synthetic, privacy-free fixtures based on observed semantic hooks in Codex 26.924.
// They reproduce structure/geometry, not a claim of complete native app coverage.
export function fixture({ product = 'Codex', placement = 'home', work = false, hiddenFirst = true, sidebar = true, engine = 'modern' } = {}) {
  const editorLabel = product === 'Codex' ? '随心输入' : work ? '使用 ChatGPT Work' : 'Message ChatGPT';
  const codexRoot = product === 'Codex' || work;
  return `<!doctype html><html ${engine === 'modern' ? 'data-dream-skin="active" data-dream-shell="dark"' : engine === 'legacy' ? 'class="codex-dream-skin dream-art-wide dream-theme-dark"' : ''}>
  <head><meta charset="utf-8"><style>
  * { box-sizing: border-box } body { margin:0; color:#ddd; background:#162030; font-family:Arial }
  :root { --dream-skin-art:linear-gradient(110deg,#07182f,#522651); --dream-skin-art-position:50% 50%; --dream-art:var(--dream-skin-art); --dream-art-position:50% 50% }
  #outer { height:100vh; display:flex; flex-direction:column }
  [role=menubar] { height:44px; flex:none; display:flex; align-items:center; gap:12px }
  #frame { min-height:0; flex:1; display:flex }
  aside { flex:0 0 280px; background:#182030 }
  #active { flex:1; min-width:0; display:flex; flex-direction:column; position:relative }
  header { height:50px; flex:none; display:flex; align-items:center; justify-content:space-between }
  [role=main] { flex:1; min-height:0; overflow:auto; padding:24px }
  .compose-host { flex:none; width:min(736px,calc(100% - 32px)); margin:16px auto; }
  .ComposerLayoutRoot { border-radius:18px; background:#243044; overflow:visible }
  .ComposerLayoutBody { padding:14px; min-height:64px }
  .ComposerLayoutFooter { padding:10px; display:flex; justify-content:space-between }
  [role=textbox] { min-height:44px; outline:none }
  button { color:inherit; background:#27374f; padding:8px; border:1px solid #546075; border-radius:7px }
  button:focus-visible { outline:2px solid cyan }
  pre { overflow:auto; max-width:100% } [hidden] { display:none !important }
  </style></head><body>
  <main id="outer" class="main-surface"><div role="menubar"><button aria-label="Switch mode, current mode: ${product}">${product}</button></div>
  <div id="frame">${sidebar ? '<aside class="app-shell-left-panel" data-app-shell-left-panel-appearance="default"><nav><button>New chat</button><button aria-current="page">Compatibility test</button></nav></aside>' : ''}
  ${hiddenFirst ? '<main hidden data-app-shell-main-surface="default"><div data-codex-composer-root data-composer-placement="home"><div role="textbox" contenteditable="true">cached</div></div></main>' : ''}
  <main id="active" data-app-shell-main-surface="default"><header data-app-shell-application-menu-bar><button data-app-shell-sidebar-trigger="true">Sidebar</button><button>Tools</button></header>
  <section role="main">${placement === 'home' ? '<h1>Start something new</h1><div data-home-banners><button>Suggested task</button></div>' : '<article data-message-author-role="user">Explain this change.</article><article data-message-author-role="assistant"><p>Test message with a long code block.</p><pre><code>const example = "' + 'long '.repeat(90) + '";</code></pre><button>Copy</button></article>'}</section>
  <${codexRoot ? 'div data-codex-composer-root' : 'form data-thread-find-composer="true"'} class="compose-host" data-composer-placement="${placement}">
    ${product === 'ChatGPT' ? `<div role="group" aria-label="Composer mode"><button aria-pressed="${!work}">Chat</button><button aria-pressed="${work}">Work</button></div>` : ''}
    <div class="ComposerLayoutRoot" data-composer-utility-bar-variant="${placement}" data-composer-layout="multiline">
      <div class="ComposerLayoutBody" data-composer-layout="multiline"><div class="ProseMirror" role="textbox" contenteditable="true" aria-label="${editorLabel}" ${codexRoot ? 'data-codex-composer="true"' : ''}></div></div>
      <div class="ComposerLayoutFooter"><button type="button">Attach</button><button type="button" id="send">Send</button></div>
    </div>
  </${codexRoot ? 'div' : 'form'}></main></div></main></body></html>`;
}
