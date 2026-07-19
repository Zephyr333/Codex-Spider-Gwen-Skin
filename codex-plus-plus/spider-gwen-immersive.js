(() => {
  const STATE_KEY = "__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__";
  const STYLE_ID = "codex-spider-gwen-immersive-style";
  const CHROME_ID = "codex-spider-gwen-immersive-chrome";
  const ROOT_CLASS = "codex-spider-gwen-immersive";
  const HOME_CLASS = "spider-gwen-home";
  const HOME_SHELL_CLASS = "spider-gwen-home-shell";
  const TASK_SHELL_CLASS = "spider-gwen-task-shell";
  const VERSION = "1.3.4";
  const ICON_DATA_URL = "data:image/png;base64,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";

  const CSS = String.raw`
:root.codex-dream-skin.codex-spider-gwen-immersive {
  color-scheme: dark !important;
  --sg-void: #06101f;
  --sg-navy: #0a1930;
  --sg-navy-raised: #102442;
  --sg-cyan: #59d7f0;
  --sg-cyan-bright: #baf7ff;
  --sg-pink: #ff5ca8;
  --sg-violet: #7847e8;
  --sg-paper: #effbff;
  --sg-muted: #a9bdd6;
  --sg-line: rgb(89 215 240 / .34);
  --sg-line-hot: rgb(255 92 168 / .46);
  /* Directional hierarchy: cyan rises from lower-left; pink cuts from upper-right. */
  --sg-edge-cyan-soft: rgb(89 215 240 / .17);
  --sg-edge-pink-soft: rgb(255 92 168 / .23);
  --sg-edge-cyan: rgb(89 215 240 / .30);
  --sg-edge-pink: rgb(255 92 168 / .42);
  --sg-edge-cyan-strong: rgb(89 215 240 / .48);
  --sg-edge-pink-strong: rgb(255 92 168 / .60);
  --sg-material-highlight: rgb(220 249 255 / .09);
  --sg-material-depth: rgb(1 7 18 / .52);
  --sg-focus-cyan: rgb(89 215 240 / .62);
  --sg-focus-pink: rgb(255 92 168 / .68);
  --sg-glass: rgb(7 18 38 / .76);
  --sg-glass-strong: rgb(8 22 43 / .90);
  --sg-shadow: rgb(1 7 18 / .56);
  --sg-surface-soft:
    radial-gradient(circle at 100% 0%, rgb(255 72 151 / .12), transparent 34%),
    radial-gradient(circle at 0% 100%, rgb(43 158 255 / .12), transparent 38%),
    linear-gradient(to top right, rgb(5 22 45 / .78), rgb(12 22 53 / .76) 58%, rgb(36 15 64 / .76));
  --sg-surface:
    radial-gradient(circle at 100% 0%, rgb(255 72 151 / .16), transparent 32%),
    radial-gradient(circle at 0% 100%, rgb(43 158 255 / .15), transparent 38%),
    linear-gradient(to top right, rgb(5 23 48 / .91), rgb(12 23 55 / .89) 58%, rgb(39 15 66 / .89));
  --sg-surface-strong:
    radial-gradient(circle at 100% 0%, rgb(255 72 151 / .20), transparent 30%),
    radial-gradient(circle at 0% 100%, rgb(43 158 255 / .18), transparent 36%),
    linear-gradient(to top right, rgb(5 22 46 / .98), rgb(13 23 55 / .97) 58%, rgb(38 15 65 / .97));
  --sg-control-surface:
    radial-gradient(circle at 100% 0%, rgb(255 72 151 / .16), transparent 28%),
    radial-gradient(circle at 0% 100%, rgb(43 158 255 / .13), transparent 34%),
    linear-gradient(to top right, rgb(6 25 50 / .94), rgb(12 24 55 / .93) 62%, rgb(34 17 62 / .92));
  --sg-passive-ring:
    linear-gradient(45deg,
      var(--sg-edge-cyan-soft) 0%,
      transparent 38%,
      transparent 62%,
      var(--sg-edge-pink-soft) 100%);
  --sg-content-ring:
    linear-gradient(45deg,
      var(--sg-edge-cyan) 0%,
      rgb(89 215 240 / .12) 30%,
      transparent 44%,
      transparent 56%,
      rgb(255 92 168 / .16) 70%,
      var(--sg-edge-pink) 100%);
  --sg-focus-ring-both:
    linear-gradient(45deg,
      var(--sg-focus-cyan) 0%,
      rgb(89 215 240 / .32) 22%,
      transparent 38%,
      transparent 62%,
      rgb(255 92 168 / .36) 78%,
      var(--sg-focus-pink) 100%);
  --sg-focus-ring-cyan:
    linear-gradient(45deg, var(--sg-focus-cyan) 0%, rgb(89 215 240 / .30) 28%, transparent 48%);
  --sg-focus-ring-pink:
    linear-gradient(45deg, transparent 52%, rgb(255 92 168 / .34) 72%, var(--sg-focus-pink) 100%);
  --dream-accent: var(--sg-cyan) !important;
  --dream-accent-ink: #04111d !important;
  --dream-canvas: var(--sg-void) !important;
  --dream-surface: var(--sg-navy) !important;
  --dream-surface-raised: var(--sg-navy-raised) !important;
  --dream-sidebar: #07162b !important;
  --dream-text: var(--sg-paper) !important;
  --dream-text-muted: var(--sg-muted) !important;
  --dream-line: var(--sg-line) !important;
  --dream-line-soft: rgb(89 215 240 / .16) !important;
  --dream-accent-soft: rgb(89 215 240 / .14) !important;
  --dream-accent-hover: rgb(89 215 240 / .22) !important;
  --dream-hero-shade: rgb(5 13 29 / .76) !important;
  --dream-immersive-sidebar: rgb(6 17 35 / .66) !important;
  --dream-task-immersive-sidebar: rgb(6 17 35 / .82) !important;
  --dream-immersive-composer: rgb(8 23 44 / .88) !important;
  --dream-immersive-line: rgb(89 215 240 / .28) !important;
  --codex-base-surface: #08172d !important;
  --color-background-surface: rgb(7 19 39 / .92) !important;
  --color-background-surface-under: #07162c !important;
  --color-background-control: rgb(8 27 51 / .92) !important;
  --color-background-control-opaque: #0b203b !important;
  --color-background-elevated-primary: rgb(13 27 56 / .96) !important;
  --color-background-elevated-primary-opaque: #0f1e3b !important;
  --color-background-elevated-secondary: rgb(11 27 53 / .88) !important;
  --color-background-elevated-secondary-opaque: #0d1d39 !important;
  --color-background-panel: #0b1b36 !important;
  --color-background-editor-opaque: #07182f !important;
  --color-token-bg-primary: #07162c !important;
  --color-token-bg-secondary: rgb(8 23 46 / .92) !important;
  --color-token-bg-tertiary: rgb(14 23 53 / .86) !important;
  --color-token-main-surface-primary: #08182f !important;
  --color-token-main-surface-secondary: #0b1c38 !important;
  --color-token-main-surface-tertiary: #101d42 !important;
  --color-token-side-bar-background: #07162b !important;
  --color-token-input-background: rgb(7 25 49 / .92) !important;
  --color-token-dropdown-background: #0b1c38 !important;
  --color-token-menu-background: rgb(12 27 55 / .96) !important;
  --color-token-editor-widget-background: rgb(12 27 55 / .96) !important;
  --color-token-editor-background: #07182f !important;
  --color-token-terminal-background: #07172e !important;
  --color-token-diff-surface: color-mix(in oklab, var(--sg-navy) 94%, white) !important;
  --color-token-checkbox-background: rgb(15 31 61 / .94) !important;
  --color-token-input-border: rgb(89 215 240 / .28) !important;
  --color-token-border-default: rgb(89 215 240 / .16) !important;
  --color-token-border-light: rgb(89 215 240 / .10) !important;
  --color-token-border-heavy: rgb(89 215 240 / .28) !important;
  --color-token-toolbar-hover-background: rgb(89 215 240 / .12) !important;
  --color-token-button-background: var(--sg-cyan) !important;
  --color-token-button-foreground: #04111d !important;
  --color-background-button-primary: var(--sg-cyan) !important;
  --color-background-button-primary-hover: #8beafa !important;
  --color-text-button-primary: #04111d !important;
  --color-background-button-secondary: rgb(89 215 240 / .10) !important;
  --color-background-button-secondary-hover: rgb(89 215 240 / .17) !important;
  --color-background-button-tertiary: rgb(120 71 232 / .10) !important;
  --color-background-button-tertiary-hover: rgb(120 71 232 / .18) !important;
  --vscode-input-background: rgb(7 25 49 / .94) !important;
  --vscode-dropdown-background: #0b1c38 !important;
  --vscode-dropdown-listBackground: rgb(11 28 56 / .97) !important;
  --vscode-menu-background: rgb(12 27 55 / .97) !important;
  --vscode-quickInput-background: rgb(12 27 55 / .97) !important;
  --vscode-quickInputTitle-background: rgb(15 26 58 / .97) !important;
  --vscode-quickInputList-focusBackground: rgb(89 215 240 / .14) !important;
  --vscode-editorWidget-background: rgb(12 27 55 / .97) !important;
  --vscode-editor-background: #07182f !important;
  --vscode-panel-background: rgb(11 27 54 / .96) !important;
  --vscode-notifications-background: rgb(12 27 55 / .97) !important;
  --vscode-editorHoverWidget-background: rgb(12 27 55 / .97) !important;
  --vscode-editorSuggestWidget-background: rgb(12 27 55 / .97) !important;
  --vscode-inlineChatInput-background: rgb(7 25 49 / .94) !important;
  --vscode-settings-textInputBackground: rgb(7 25 49 / .94) !important;
  --vscode-settings-numberInputBackground: rgb(7 25 49 / .94) !important;
  --vscode-settings-dropdownBackground: #0b1c38 !important;
  --vscode-settings-checkboxBackground: rgb(15 31 61 / .94) !important;
  --vscode-sideBar-background: #07162b !important;
  --vscode-sideBarTitle-background: #07162b !important;
  --vscode-sideBarSectionHeader-background: rgb(12 27 55 / .92) !important;
  --vscode-list-hoverBackground: rgb(89 215 240 / .11) !important;
  --vscode-button-background: #10334f !important;
  --vscode-button-hoverBackground: #184d68 !important;
  --vscode-button-foreground: var(--sg-paper) !important;
  --vscode-input-border: rgb(89 215 240 / .24) !important;
  --vscode-dropdown-border: rgb(89 215 240 / .22) !important;
  --vscode-widget-border: rgb(89 215 240 / .22) !important;
  --vscode-focusBorder: rgb(89 215 240 / .72) !important;
}

html.codex-spider-gwen-immersive body {
  color: var(--sg-paper) !important;
  background-color: var(--sg-void) !important;
  background-image: var(--dream-art) !important;
  background-repeat: no-repeat !important;
  background-position: var(--dream-art-position) !important;
  background-size: cover !important;
  background-attachment: fixed !important;
  font-family: "Segoe UI Variable Text", "Segoe UI", "Microsoft YaHei UI", system-ui, sans-serif !important;
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel,
html.codex-spider-gwen-immersive main.main-surface {
  position: relative;
  z-index: 2;
}

html.codex-dream-skin.dream-theme-dark.codex-spider-gwen-immersive [class~="group/application-menu-top-bar"] {
  color: var(--sg-paper) !important;
  background: var(--sg-surface-strong) !important;
  border-bottom: 1px solid rgb(89 215 240 / .22) !important;
  box-shadow: 0 1px 18px rgb(1 7 18 / .46) !important;
  backdrop-filter: blur(18px) saturate(1.04) !important;
}

html.codex-dream-skin.dream-theme-dark.codex-spider-gwen-immersive [class~="group/application-menu-top-bar"] button,
html.codex-dream-skin.dream-theme-dark.codex-spider-gwen-immersive [class~="group/application-menu-top-bar"] svg {
  color: var(--sg-paper) !important;
  filter: drop-shadow(1px 0 rgb(89 215 240 / .20)) drop-shadow(-1px 0 rgb(255 92 168 / .16));
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel {
  color: var(--sg-paper) !important;
  background:
    radial-gradient(circle at 100% 0%, rgb(255 72 151 / .13), transparent 31%),
    radial-gradient(circle at 0% 100%, rgb(43 158 255 / .19), transparent 35%),
    linear-gradient(to top right, rgb(5 23 43 / .84), rgb(9 17 43 / .75) 58%, rgb(32 13 62 / .72)) !important;
  border: 0 !important;
  border-right: 1px solid rgb(89 215 240 / .22) !important;
  box-shadow:
    inset -1px 0 rgb(255 92 168 / .10),
    12px 0 36px rgb(1 6 18 / .18) !important;
  backdrop-filter: blur(13px) saturate(1.16) !important;
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: .13;
  background-image: radial-gradient(circle, var(--sg-cyan-bright) 0 1px, transparent 1.35px);
  background-size: 13px 13px;
  mask-image: linear-gradient(180deg, black, transparent 28%, transparent 68%, black);
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel > * {
  position: relative;
  z-index: 1;
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel nav {
  background: transparent !important;
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel button {
  color: var(--sg-paper) !important;
  border-radius: 7px 15px 7px 15px !important;
  transition:
    transform 150ms cubic-bezier(.22, 1, .36, 1),
    color 150ms ease,
    background-color 150ms ease,
    box-shadow 150ms ease !important;
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel button:hover {
  --sg-control-ring: var(--sg-focus-ring-both);
  --sg-control-ring-opacity: 1;
  color: white !important;
  background:
    linear-gradient(100deg, rgb(89 215 240 / .38), rgb(120 71 232 / .32) 56%, rgb(255 92 168 / .36)) !important;
  box-shadow:
    -3px 3px 22px rgb(89 215 240 / .18),
    3px -3px 20px rgb(255 92 168 / .20),
    inset 0 1px 0 rgb(220 249 255 / .14) !important;
  transform: translateX(2px);
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel [class~="bg-token-list-hover-background"],
html.codex-spider-gwen-immersive aside.app-shell-left-panel [aria-current="page"] {
  --sg-control-ring: var(--sg-focus-ring-both);
  --sg-control-ring-opacity: 1;
  color: white !important;
  background:
    linear-gradient(104deg, rgb(89 215 240 / .23), rgb(68 50 144 / .24) 56%, rgb(255 92 168 / .17)) !important;
  border: 0 !important;
  border-radius: 7px 17px 7px 17px !important;
  box-shadow:
    -4px 4px 22px rgb(89 215 240 / .10),
    4px -4px 20px rgb(255 92 168 / .12),
    inset 3px 0 var(--sg-cyan) !important;
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel [class*="text-token-description"],
html.codex-spider-gwen-immersive aside.app-shell-left-panel [class*="text-token-text-secondary"] {
  color: var(--sg-muted) !important;
}

html.codex-spider-gwen-immersive main.main-surface {
  color: var(--sg-paper) !important;
  border: 0 !important;
  box-shadow: none !important;
}

html.codex-spider-gwen-immersive main.main-surface.spider-gwen-home-shell {
  background:
    linear-gradient(90deg, rgb(4 16 34 / .14), transparent 35%, transparent 78%, rgb(35 11 67 / .08)) !important;
}

html.codex-spider-gwen-immersive main.main-surface.spider-gwen-task-shell {
  background:
    linear-gradient(90deg,
      rgb(5 14 30 / .90) 0%,
      rgb(7 18 38 / .82) 42%,
      rgb(9 20 43 / .68) 66%,
      rgb(17 14 47 / .38) 84%,
      rgb(33 12 66 / .20) 100%) !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive main.main-surface > header.app-header-tint {
  color: var(--sg-paper) !important;
  background: var(--sg-surface-soft) !important;
  border-bottom: 1px solid rgb(89 215 240 / .18) !important;
  box-shadow: 0 6px 24px rgb(1 7 18 / .18) !important;
  backdrop-filter: blur(12px) saturate(1.04) !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive main.main-surface.spider-gwen-home-shell > header.app-header-tint {
  background: transparent !important;
  border-bottom-color: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive main.main-surface > header.app-header-tint button,
html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive main.main-surface > header.app-header-tint svg {
  color: var(--sg-paper) !important;
  filter: drop-shadow(0 1px 2px var(--sg-shadow));
}

html.codex-spider-gwen-immersive [role="main"] {
  color: var(--sg-paper) !important;
  background: transparent !important;
}

html.codex-spider-gwen-immersive .dream-home {
  background: transparent !important;
}

html.codex-spider-gwen-immersive .dream-home > div:first-child > div:first-child > div:first-child,
html.codex-spider-gwen-immersive main.main-surface.dream-home-shell .dream-home > div:first-child > div:first-child > div:first-child {
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

html.codex-spider-gwen-immersive .dream-home > div:first-child > div:first-child > div:first-child::before {
  content: none !important;
}

html.codex-spider-gwen-immersive .dream-home > div:first-child > div:first-child > div:first-child > div:first-child {
  justify-content: flex-end !important;
  padding: 30px 24px 28px 24px !important;
}

html.codex-spider-gwen-immersive .dream-home > div:first-child > div:first-child > div:first-child > div:first-child > div:first-child {
  width: min(48%, 760px) !important;
  align-items: flex-end !important;
  text-align: right !important;
}

html.codex-spider-gwen-immersive .dream-home [data-feature="game-source"] {
  position: relative;
  color: white !important;
  font-size: clamp(27px, 2.15vw, 36px) !important;
  line-height: 1.08 !important;
  font-weight: 760 !important;
  letter-spacing: -.025em !important;
  text-align: right !important;
  white-space: nowrap !important;
  text-shadow:
    0 2px 3px rgb(1 7 18 / .90),
    0 0 14px rgb(4 12 29 / .72),
    1px 0 0 rgb(89 215 240 / .18),
    -1px 0 0 rgb(255 92 168 / .14) !important;
  opacity: 1 !important;
}

html.codex-spider-gwen-immersive .dream-home [data-feature="game-source"]::before {
  content: "EARTH-65  /  DIMENSION WORKSPACE";
  display: block;
  margin-bottom: 10px;
  color: var(--sg-cyan-bright);
  font-size: 10px;
  line-height: 1;
  font-weight: 760;
  letter-spacing: .21em;
  text-shadow:
    1px 0 var(--sg-pink),
    0 0 12px rgb(89 215 240 / .58);
}

html.codex-spider-gwen-immersive .dream-home [data-feature="game-source"] button {
  --sg-control-ring: var(--sg-content-ring);
  --sg-control-ring-opacity: 1;
  margin: 0 4px !important;
  padding: 2px 8px 3px !important;
  white-space: nowrap !important;
  color: var(--sg-cyan-bright) !important;
  border: 0 !important;
  border-radius: 5px 11px 5px 11px !important;
  background:
    linear-gradient(115deg, rgb(6 24 45 / .88), rgb(42 21 74 / .82)) !important;
  box-shadow:
    2px -2px 0 rgb(255 92 168 / .24),
    -1px 1px 0 rgb(89 215 240 / .16),
    inset 0 0 14px rgb(89 215 240 / .10) !important;
}

html.codex-spider-gwen-immersive .dream-home .group\/home-suggestions button {
  --sg-control-ring: var(--sg-passive-ring);
  --sg-control-ring-opacity: 1;
  color: var(--sg-paper) !important;
  border: 0 !important;
  border-radius: 8px 18px 8px 18px !important;
  background:
    radial-gradient(circle at 88% 10%, rgb(255 92 168 / .15), transparent 30%),
    linear-gradient(145deg, rgb(8 27 49 / .78), rgb(14 18 49 / .70)) !important;
  box-shadow:
    0 12px 28px var(--sg-shadow),
    inset 0 1px 0 var(--sg-material-highlight),
    inset 0 -1px 0 rgb(1 7 18 / .32) !important;
  backdrop-filter: blur(10px) saturate(1.08) !important;
  transition: transform 170ms cubic-bezier(.22, 1, .36, 1), border-color 170ms ease, box-shadow 170ms ease !important;
}

html.codex-spider-gwen-immersive .dream-home .group\/home-suggestions button:hover {
  --sg-control-ring: var(--sg-focus-ring-both);
  border-color: transparent !important;
  background:
    radial-gradient(circle at 88% 10%, rgb(255 92 168 / .30), transparent 34%),
    linear-gradient(145deg, rgb(24 58 91 / .94), rgb(48 34 91 / .90)) !important;
  box-shadow:
    -5px 5px 24px rgb(89 215 240 / .16),
    5px -5px 24px rgb(255 92 168 / .18),
    0 16px 32px var(--sg-shadow),
    inset 0 1px 0 rgb(220 249 255 / .12) !important;
  transform: translateY(-3px) skewX(-.5deg) !important;
}

html.codex-spider-gwen-immersive .dream-home .group\/home-suggestions button > span:first-child > span:first-child {
  color: #04111d !important;
  border-radius: 5px 12px 5px 12px !important;
  background: linear-gradient(135deg, var(--sg-cyan) 0 52%, var(--sg-pink) 54% 100%) !important;
  box-shadow: 3px 3px 0 rgb(120 71 232 / .30), 0 0 18px rgb(89 215 240 / .24) !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .dream-home-utility {
  position: relative;
  color: var(--sg-paper) !important;
  margin-inline: 0 !important;
  border: 0 !important;
  border-bottom: 0 !important;
  border-radius: 22px 22px 0 0 !important;
  background: var(--sg-surface-soft) !important;
  box-shadow:
    inset 0 1px 0 var(--sg-material-highlight) !important;
  backdrop-filter: blur(14px) saturate(1.04) !important;
  overflow: hidden !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .composer-surface-chrome {
  --sg-composer-base: var(--sg-surface);
  --sg-composer-focus-ring: var(--sg-focus-ring-both);
  position: relative;
  color: var(--sg-paper) !important;
  border: 0 !important;
  border-radius: 18px !important;
  background: var(--sg-composer-base) !important;
  box-shadow:
    0 16px 36px var(--sg-shadow),
    inset 0 1px 0 var(--sg-material-highlight),
    inset 0 -1px 0 var(--sg-material-depth) !important;
  backdrop-filter: blur(14px) saturate(1.04) !important;
  overflow: visible !important;
  transition: background 170ms ease, box-shadow 170ms ease !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .composer-surface-chrome::before {
  content: none !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .composer-surface-chrome::after,
html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .dream-home-utility::after,
html.codex-spider-gwen-immersive aside.app-shell-left-panel button::after,
html.codex-spider-gwen-immersive aside.app-shell-left-panel [class~="bg-token-list-hover-background"]::after,
html.codex-spider-gwen-immersive aside.app-shell-left-panel [aria-current="page"]::after,
html.codex-spider-gwen-immersive .dream-home [data-feature="game-source"] button::after,
html.codex-spider-gwen-immersive .dream-home .group\/home-suggestions button::after {
  content: "" !important;
  position: absolute;
  inset: 0;
  z-index: 2;
  padding: 1px;
  border-radius: inherit;
  pointer-events: none;
  opacity: var(--sg-control-ring-opacity, 0);
  background: var(--sg-control-ring, var(--sg-composer-focus-ring, var(--sg-focus-ring-pink)));
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  transition: opacity 170ms ease !important;
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel button,
html.codex-spider-gwen-immersive aside.app-shell-left-panel [class~="bg-token-list-hover-background"],
html.codex-spider-gwen-immersive aside.app-shell-left-panel [aria-current="page"],
html.codex-spider-gwen-immersive .dream-home [data-feature="game-source"] button,
html.codex-spider-gwen-immersive .dream-home .group\/home-suggestions button {
  position: relative;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .dream-home:has(.dream-home-utility) .composer-surface-chrome {
  --sg-composer-base: var(--sg-surface-soft);
  --sg-composer-focus-ring: var(--sg-focus-ring-cyan);
  border-top: 0 !important;
  border-radius: 0 0 22px 22px !important;
  background: var(--sg-composer-base) !important;
  box-shadow:
    0 16px 36px var(--sg-shadow),
    inset 0 -1px 0 var(--sg-material-depth) !important;
  overflow: hidden !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .composer-surface-chrome:focus-within {
  background: var(--sg-composer-base) !important;
  box-shadow:
    0 18px 40px var(--sg-shadow),
    -8px 8px 28px rgb(89 215 240 / .10),
    8px -8px 28px rgb(255 92 168 / .10),
    inset 0 1px 0 rgb(220 249 255 / .12),
    inset 0 -1px 0 var(--sg-material-depth) !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .composer-surface-chrome:focus-within::after,
html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .dream-home:has(.composer-surface-chrome:focus-within) .dream-home-utility::after {
  opacity: 1;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .dream-home:has(.composer-surface-chrome:focus-within) .dream-home-utility {
  background: var(--sg-surface-soft) !important;
  box-shadow:
    7px -7px 24px rgb(255 92 168 / .07),
    inset 0 1px 0 var(--sg-material-highlight) !important;
}

html.codex-dream-skin.dream-art-wide.codex-spider-gwen-immersive .dream-home:has(.dream-home-utility) .composer-surface-chrome:focus-within {
  background: var(--sg-composer-base) !important;
}

html.codex-spider-gwen-immersive .ProseMirror {
  color: var(--sg-paper) !important;
  caret-color: var(--sg-cyan) !important;
}

html.codex-spider-gwen-immersive .ProseMirror p.is-editor-empty:first-child::before,
html.codex-spider-gwen-immersive textarea::placeholder,
html.codex-spider-gwen-immersive input::placeholder {
  color: rgb(169 189 214 / .68) !important;
}

html.codex-spider-gwen-immersive input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),
html.codex-spider-gwen-immersive textarea,
html.codex-spider-gwen-immersive select,
html.codex-spider-gwen-immersive [role="combobox"] {
  color: var(--sg-paper) !important;
  border-color: transparent !important;
  background: var(--sg-control-surface) !important;
  box-shadow:
    inset 0 1px 0 var(--sg-material-highlight),
    inset 0 -1px 0 var(--sg-material-depth),
    0 6px 18px rgb(1 7 18 / .16) !important;
  transition: background 160ms ease, box-shadow 160ms ease !important;
}

html.codex-spider-gwen-immersive input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):focus,
html.codex-spider-gwen-immersive textarea:focus,
html.codex-spider-gwen-immersive select:focus,
html.codex-spider-gwen-immersive [role="combobox"]:focus,
html.codex-spider-gwen-immersive [role="combobox"][aria-expanded="true"] {
  border-color: transparent !important;
  background: var(--sg-control-surface) !important;
  box-shadow:
    -5px 5px 18px rgb(89 215 240 / .09),
    5px -5px 18px rgb(255 92 168 / .09),
    inset 0 1px 0 rgb(220 249 255 / .12),
    inset 0 -1px 0 var(--sg-material-depth) !important;
}

html.codex-spider-gwen-immersive input[type="checkbox"],
html.codex-spider-gwen-immersive input[type="radio"] {
  accent-color: var(--sg-cyan) !important;
}

html.codex-spider-gwen-immersive button[class~="bg-token-foreground"] {
  color: #04111d !important;
  border: 1px solid rgb(220 253 255 / .62) !important;
  background: linear-gradient(to top right, #59d7f0 0%, #76c7ff 58%, #ff79b8 100%) !important;
  box-shadow:
    inset 1px -1px 0 rgb(186 247 255 / .48),
    inset -1px 1px 0 rgb(255 166 207 / .72),
    0 0 0 1px rgb(4 17 29 / .24),
    0 4px 12px rgb(1 7 18 / .32) !important;
  filter: none !important;
  overflow: hidden !important;
}

html.codex-spider-gwen-immersive button[class~="bg-token-foreground"] svg {
  color: #04111d !important;
  filter: none !important;
}

html.codex-spider-gwen-immersive main.main-surface [data-message-author-role="user"] {
  color: var(--sg-paper) !important;
  border: 0 !important;
  border-radius: 7px 17px 7px 17px !important;
  background: var(--sg-surface-soft) !important;
  box-shadow:
    0 8px 22px rgb(1 7 18 / .16),
    inset 0 1px 0 var(--sg-material-highlight),
    inset 0 -1px 0 rgb(1 7 18 / .28) !important;
}

html.codex-spider-gwen-immersive main.main-surface article,
html.codex-spider-gwen-immersive main.main-surface [data-message-author-role] {
  color: var(--sg-paper) !important;
}

html.codex-spider-gwen-immersive main.main-surface pre,
html.codex-spider-gwen-immersive main.main-surface [class*="code-block"] {
  color: #e9fbff !important;
  border: 0 !important;
  border-radius: 6px 15px 6px 15px !important;
  background: var(--sg-surface-strong) !important;
  box-shadow:
    inset 2px 0 rgb(89 215 240 / .16),
    0 10px 24px rgb(1 7 18 / .28),
    inset 0 1px 0 var(--sg-material-highlight),
    inset 0 -1px 0 rgb(1 7 18 / .36) !important;
}

html.codex-spider-gwen-immersive [role="dialog"],
html.codex-spider-gwen-immersive [role="menu"],
html.codex-spider-gwen-immersive [role="listbox"],
html.codex-spider-gwen-immersive [role="tooltip"],
html.codex-spider-gwen-immersive [data-radix-popper-content-wrapper] > div {
  color: var(--sg-paper) !important;
  border: 0 !important;
  border-radius: 8px 18px 8px 18px !important;
  background: var(--sg-surface-strong) !important;
  box-shadow:
    -5px 5px 26px rgb(89 215 240 / .08),
    5px -5px 26px rgb(255 92 168 / .10),
    0 22px 52px rgb(1 6 18 / .62),
    inset 0 1px 0 var(--sg-material-highlight) !important;
  backdrop-filter: blur(22px) saturate(1.12) !important;
}

html.codex-spider-gwen-immersive [class~="bg-token-main-surface-secondary"],
html.codex-spider-gwen-immersive [class~="bg-token-main-surface-primary"] {
  border-color: rgb(89 215 240 / .14);
}

html.codex-spider-gwen-immersive main.main-surface [class~="bg-token-dropdown-background"],
html.codex-spider-gwen-immersive main.main-surface [class~="bg-token-dropdown-background/50"] {
  color: var(--sg-paper) !important;
  border-color: rgb(89 215 240 / .20) !important;
  background: var(--sg-surface-soft) !important;
}

html.codex-spider-gwen-immersive main.main-surface [class~="bg-token-main-surface-primary/70"],
html.codex-spider-gwen-immersive main.main-surface [class~="bg-token-main-surface-secondary"],
html.codex-spider-gwen-immersive main.main-surface [class~="bg-token-bg-secondary"],
html.codex-spider-gwen-immersive [data-sonner-toast] {
  color: var(--sg-paper) !important;
  border-color: rgb(89 215 240 / .18) !important;
  background: var(--sg-control-surface) !important;
}

html.codex-spider-gwen-immersive [role="menuitem"]:hover,
html.codex-spider-gwen-immersive [role="option"]:hover {
  color: white !important;
  background:
    radial-gradient(circle at 100% 0%, rgb(255 72 151 / .28), transparent 46%),
    linear-gradient(to top right, rgb(43 158 255 / .36), rgb(120 71 232 / .31) 64%, rgb(255 72 151 / .26)) !important;
}

html.codex-spider-gwen-immersive [role="option"][aria-selected="true"] {
  background:
    radial-gradient(circle at 100% 0%, rgb(255 72 151 / .14), transparent 42%),
    linear-gradient(to top right, rgb(43 158 255 / .18), rgb(120 71 232 / .16) 64%, rgb(255 72 151 / .12)) !important;
}

html.codex-spider-gwen-immersive main.main-surface [class~="bg-token-dropdown-background"] {
  backdrop-filter: blur(16px) saturate(1.06) !important;
}

html.codex-spider-gwen-immersive main.main-surface [class~="bg-token-dropdown-background"]:has([class~="group/summary-panel-item"]) {
  border: 0 !important;
  background: var(--sg-surface-soft) !important;
  box-shadow:
    0 18px 44px rgb(1 7 18 / .34),
    inset 0 1px 0 var(--sg-material-highlight),
    inset 0 -1px 0 rgb(1 7 18 / .34) !important;
  backdrop-filter: blur(18px) saturate(1.04) !important;
}

html.codex-spider-gwen-immersive main.main-surface [class~="bg-token-dropdown-background/50"] {
  box-shadow:
    0 12px 28px rgb(1 7 18 / .22),
    inset 0 1px 0 var(--sg-material-highlight),
    inset 0 -1px 0 rgb(1 7 18 / .30) !important;
}

html.codex-spider-gwen-immersive :focus-visible {
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow:
    -5px 5px 20px rgb(89 215 240 / .16),
    5px -5px 20px rgb(255 92 168 / .18) !important;
}

html.codex-spider-gwen-immersive aside.app-shell-left-panel button:focus-visible,
html.codex-spider-gwen-immersive .dream-home [data-feature="game-source"] button:focus-visible,
html.codex-spider-gwen-immersive .dream-home .group\/home-suggestions button:focus-visible {
  --sg-control-ring: var(--sg-focus-ring-both);
  --sg-control-ring-opacity: 1;
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow:
    -4px 4px 20px rgb(89 215 240 / .10),
    4px -4px 20px rgb(255 92 168 / .12),
    0 10px 24px rgb(1 7 18 / .28) !important;
}

html.codex-spider-gwen-immersive button[class~="bg-token-foreground"]:focus-visible {
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow:
    inset 1px -1px 0 rgb(186 247 255 / .48),
    inset -1px 1px 0 rgb(255 166 207 / .72),
    0 0 0 2px rgb(220 253 255 / .24),
    -4px 4px 18px rgb(89 215 240 / .13),
    4px -4px 18px rgb(255 92 168 / .15),
    0 4px 12px rgb(1 7 18 / .32) !important;
}

html.codex-spider-gwen-immersive .composer-surface-chrome .ProseMirror:focus-visible {
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
}

html.codex-spider-gwen-immersive input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):focus-visible,
html.codex-spider-gwen-immersive textarea:focus-visible,
html.codex-spider-gwen-immersive select:focus-visible,
html.codex-spider-gwen-immersive [role="combobox"]:focus-visible {
  outline: none !important;
  outline-offset: 0 !important;
}

html.codex-spider-gwen-immersive * {
  scrollbar-color: rgb(89 215 240 / .30) rgb(4 13 28 / .16);
}

#codex-spider-gwen-immersive-chrome {
  position: fixed;
  z-index: 3;
  overflow: hidden;
  pointer-events: none !important;
  color: var(--sg-paper);
}

#codex-spider-gwen-immersive-chrome,
#codex-spider-gwen-immersive-chrome * {
  pointer-events: none !important;
  user-select: none !important;
}

.sg-brand {
  position: absolute;
  left: 24px;
  top: 8px;
  display: none;
  align-items: center;
  gap: 9px;
  height: 38px;
  color: white;
  text-shadow: 1px 0 rgb(89 215 240 / .42), -1px 0 rgb(255 92 168 / .32), 0 2px 8px var(--sg-shadow);
}

#codex-spider-gwen-immersive-chrome.spider-gwen-home-shell .sg-brand {
  display: flex;
}

.sg-brand-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  object-fit: contain;
  filter:
    drop-shadow(2px 1px 0 rgb(255 92 168 / .24))
    drop-shadow(-1px 0 0 rgb(89 215 240 / .20))
    drop-shadow(0 0 10px rgb(89 215 240 / .28));
}

.sg-brand b {
  display: block;
  font-size: 12px;
  line-height: 1;
  font-weight: 820;
  letter-spacing: .17em;
}

.sg-brand small {
  display: block;
  margin-top: 5px;
  color: var(--sg-cyan-bright);
  font-size: 8px;
  line-height: 1;
  font-weight: 650;
  letter-spacing: .23em;
}

.sg-status {
  position: absolute;
  right: 110px;
  top: 17px;
  display: none;
  align-items: center;
  gap: 8px;
  color: var(--sg-cyan-bright);
  font-size: 9px;
  font-weight: 720;
  letter-spacing: .20em;
  text-shadow: 1px 0 var(--sg-pink), 0 0 10px rgb(89 215 240 / .44);
}

#codex-spider-gwen-immersive-chrome.spider-gwen-home-shell .sg-status {
  display: flex;
}

.sg-status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--sg-cyan);
  box-shadow: 2px 0 var(--sg-pink), 0 0 12px var(--sg-cyan);
}

.sg-print-dots {
  position: absolute;
  right: -40px;
  top: 46px;
  width: 54%;
  height: 48%;
  opacity: .12;
  background-image: radial-gradient(circle, var(--sg-cyan-bright) 0 1.1px, transparent 1.6px);
  background-size: 12px 12px;
  mask-image: radial-gradient(ellipse at 78% 18%, black, transparent 68%);
  mix-blend-mode: screen;
}

.sg-speed-lines {
  position: absolute;
  left: 6%;
  bottom: 8%;
  width: 48%;
  height: 27%;
  opacity: .14;
  background: repeating-linear-gradient(164deg, transparent 0 17px, var(--sg-pink) 18px, transparent 19px 34px);
  mask-image: linear-gradient(90deg, black, transparent 86%);
  transform: skewX(-10deg);
}

.sg-web-corner {
  position: absolute;
  right: -100px;
  top: -96px;
  width: 410px;
  height: 340px;
  opacity: .13;
  background:
    repeating-radial-gradient(circle at 100% 0%, transparent 0 41px, var(--sg-cyan-bright) 42px 43px),
    repeating-conic-gradient(from 181deg at 100% 0%, transparent 0deg 13deg, var(--sg-pink) 14deg 14.7deg);
  mask-image: radial-gradient(circle at 100% 0%, black, transparent 72%);
}

#codex-spider-gwen-immersive-chrome.spider-gwen-task-shell .sg-brand,
#codex-spider-gwen-immersive-chrome.spider-gwen-task-shell .sg-status {
  display: none;
}

#codex-spider-gwen-immersive-chrome.spider-gwen-task-shell .sg-print-dots { opacity: 0; }
#codex-spider-gwen-immersive-chrome.spider-gwen-task-shell .sg-speed-lines { opacity: .025; }
#codex-spider-gwen-immersive-chrome.spider-gwen-task-shell .sg-web-corner { opacity: .04; }

@media (max-width: 1120px) {
  .sg-status { display: none !important; }
  .sg-print-dots { width: 46%; opacity: .08; }
  html.codex-spider-gwen-immersive .dream-home > div:first-child > div:first-child > div:first-child > div:first-child {
    padding-right: 24px !important;
  }
  html.codex-spider-gwen-immersive .dream-home > div:first-child > div:first-child > div:first-child > div:first-child > div:first-child {
    width: min(54%, 620px) !important;
  }
}

@media (max-width: 900px) {
  .sg-brand small { display: none; }
  .sg-web-corner { opacity: .07; }
  html.codex-spider-gwen-immersive .dream-home [data-feature="game-source"] {
    font-size: clamp(24px, 3.4vw, 32px) !important;
  }
}

@media (max-width: 680px) {
  .sg-brand, .sg-status, .sg-web-corner { display: none !important; }
  html.codex-spider-gwen-immersive .dream-home > div:first-child > div:first-child > div:first-child > div:first-child {
    justify-content: center !important;
    padding: 24px !important;
  }
  html.codex-spider-gwen-immersive .dream-home > div:first-child > div:first-child > div:first-child > div:first-child > div:first-child {
    width: min(90%, 460px) !important;
    align-items: center !important;
    text-align: center !important;
  }
  html.codex-spider-gwen-immersive .dream-home [data-feature="game-source"] {
    text-align: center !important;
    white-space: normal !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  html.codex-spider-gwen-immersive *,
  html.codex-spider-gwen-immersive *::before,
  html.codex-spider-gwen-immersive *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
`;

  const previous = window[STATE_KEY];
  previous?.destroy?.();

  let observer = null;
  let timer = null;
  const scheduler = { timeout: null };

  const isAvatarOverlay = () => document.documentElement?.classList.contains("compact-window") &&
    new URLSearchParams(window.location.search).get("initialRoute") === "/avatar-overlay";

  const themeId = () => String(window.__CODEX_PLUS_DREAM_SKIN_THEME__?.id || "").trim();

  const clearRouteClasses = () => {
    document.querySelectorAll(`.${HOME_CLASS}`).forEach((node) => node.classList.remove(HOME_CLASS));
    document.querySelectorAll(`.${HOME_SHELL_CLASS}`).forEach((node) => node.classList.remove(HOME_SHELL_CLASS));
    document.querySelectorAll(`.${TASK_SHELL_CLASS}`).forEach((node) => node.classList.remove(TASK_SHELL_CLASS));
  };

  const removeVisuals = () => {
    document.documentElement?.classList.remove(ROOT_CLASS);
    clearRouteClasses();
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(CHROME_ID)?.remove();
  };

  const writeStyle = (style) => {
    style.textContent = CSS;
    style.dataset.spiderGwenVersion = VERSION;
  };

  const ensure = () => {
    const root = document.documentElement;
    const shellMain = document.querySelector("main.main-surface");
    const shellSidebar = document.querySelector("aside.app-shell-left-panel");
    const targetTheme = themeId() === "spider-gwen";
    const dreamSkinReady = root?.classList.contains("codex-dream-skin");

    if (!root || !document.body || !shellMain || !shellSidebar || isAvatarOverlay() || !targetTheme || !dreamSkinReady) {
      removeVisuals();
      return;
    }

    root.classList.add(ROOT_CLASS);

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || root).appendChild(style);
    }
    if (style.dataset.spiderGwenVersion !== VERSION || style.textContent !== CSS) writeStyle(style);

    const dreamHome = document.querySelector(".dream-home");
    const home = dreamHome?.closest('[role="main"]') ||
      dreamHome ||
      document.querySelector('[role="main"]:has([data-testid="home-icon"])') ||
      document.querySelector("main.main-surface.dream-home-shell [role=\"main\"]");
    document.querySelectorAll(`.${HOME_CLASS}`).forEach((candidate) => {
      if (candidate !== home) candidate.classList.remove(HOME_CLASS);
    });
    home?.classList.add(HOME_CLASS);
    shellMain.classList.toggle(HOME_SHELL_CLASS, Boolean(home));
    shellMain.classList.toggle(TASK_SHELL_CLASS, !home);

    let chrome = document.getElementById(CHROME_ID);
    if (!chrome || chrome.parentElement !== document.body) {
      chrome?.remove();
      chrome = document.createElement("div");
      chrome.id = CHROME_ID;
      chrome.setAttribute("aria-hidden", "true");
      chrome.innerHTML =
        '<div class="sg-brand"><img class="sg-brand-icon" src="' + ICON_DATA_URL + '" alt=""><span><b>SPIDER-GWEN</b><small>EARTH-65 · DIMENSIONAL CODE</small></span></div>' +
        '<div class="sg-status"><i></i><span>DIMENSION LINK // STABLE</span></div>' +
        '<div class="sg-print-dots"></div><div class="sg-speed-lines"></div>' +
        '<div class="sg-web-corner"></div>';
      document.body.appendChild(chrome);
    }

    const shellBox = shellMain.getBoundingClientRect();
    chrome.style.left = `${Math.round(shellBox.left)}px`;
    chrome.style.top = `${Math.round(shellBox.top)}px`;
    chrome.style.width = `${Math.round(shellBox.width)}px`;
    chrome.style.height = `${Math.round(shellBox.height)}px`;
    chrome.classList.toggle(HOME_SHELL_CLASS, Boolean(home));
    chrome.classList.toggle(TASK_SHELL_CLASS, !home);
  };

  const scheduleEnsure = () => {
    if (scheduler.timeout) clearTimeout(scheduler.timeout);
    scheduler.timeout = setTimeout(() => {
      scheduler.timeout = null;
      ensure();
    }, 160);
  };

  const destroy = () => {
    observer?.disconnect();
    if (timer) clearInterval(timer);
    if (scheduler.timeout) clearTimeout(scheduler.timeout);
    removeVisuals();
    delete window[STATE_KEY];
    return true;
  };

  observer = new MutationObserver(scheduleEnsure);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "data-theme", "data-appearance", "data-color-mode"],
  });
  timer = setInterval(ensure, 3000);
  window[STATE_KEY] = { ensure, destroy, observer, timer, scheduler, version: VERSION };
  ensure();
})();
