# Codex Spider-Gwen Skin

一套面向 Windows Codex++ / Dream Skin 的 Spider-Gwen 沉浸主题。

它将 Dream Skin 的连续壁纸主题与 Codex++ 用户脚本组合在一起，为首页、任务页、侧栏、输入框、菜单和浮层提供统一的 Earth-65 蓝粉视觉语言。

## 包含内容

- `theme/theme.json`：Dream Skin 主题配置
- `theme/image.jpg`：Spider-Gwen 16:9 壁纸
- `codex-plus-plus/spider-gwen-immersive.js`：沉浸式 UI 用户脚本
- `codex-plus-plus/spider-gwen-icon.png`：透明 Spider-Gwen Logo 源文件

## 安装

1. 安装并启动 [Codex++](https://github.com/BigPizzaV3/CodexPlusPlus)，确保 Dream Skin 与用户脚本功能可用。
2. 将 `theme` 文件夹内的两个文件复制到：

   `%USERPROFILE%\.codex-session-delete\dream-skin\themes\spider-gwen\`

3. 将 `codex-plus-plus/spider-gwen-immersive.js` 复制到：

   `%APPDATA%\Codex++\user_scripts\`

4. 在 Codex++ 的用户脚本管理中启用 `spider-gwen-immersive.js`。
5. 在 Dream Skin 主题列表中选择 `Spider-Gwen`，然后重新打开 Codex++。

如果 Codex++ 使用了自定义数据目录，请以管理工具显示的实际目录为准。

## 设计与兼容性

- 壁纸焦点固定为 `50% 50%`，保持 Gwen 的构图位置。
- 用户脚本只在当前 Dream Skin 主题 ID 为 `spider-gwen` 时启用；切换其他主题时会自动移除自己的样式和装饰层。
- 脚本不包含用户名、盘符或本机绝对路径，也不修改 Codex、Codex++ 或 WindowsApps 的安装文件。
- 主题分为基础层与增强层：即使 Codex++ 用户脚本暂时未加载，`theme.json` 仍会提供壁纸、基础配色和可读性；增强脚本只负责沉浸装饰与控件细节。
- 增强脚本优先使用 Codex 的 `data-*` 语义属性，再使用受控兼容回退；侧栏、顶栏、首页或输入框中的单个锚点缺失时会独立降级，不再让整套皮肤退出。
- 普通程序更新不会覆盖用户数据目录中的主题和脚本。Codex/Codex++ 若彻底移除现有语义结构，增强层会进入降级模式并保留基础主题，而不是显示空白背景。

## v1.5 低维护架构

v1.5 将容易随 Codex 更新失效的 DOM 定位集中到一个适配层，视觉 CSS 只依赖脚本自己写入的 `data-spider-gwen-role`。后续若上游再次改版，通常只需调整少量锚点解析，而不必重写整套主题。

- 锚点按“稳定语义属性 → 受控兼容标记 → 严格几何校验”三级解析；几何回退必须同时满足位置、尺寸和包含关系，避免误伤相似控件。
- 首页、任务页、侧栏折叠、延迟挂载和窗口尺寸变化都由同一个幂等 `ensure()` 收敛；重复执行不会叠加样式、装饰层或观察器。
- MutationObserver 只关注会影响关键锚点的结构变化，另有低频自检负责最终恢复，避免持续扫描完整 DOM。
- 新版首页若被 Dream Skin v3 的旧 `first-child` 规则推到第二屏，脚本会优先识别 banner 语义节点；语义标记消失时，才使用“空首节点、占满首屏、真实标题在后方”的严格几何兜底。
- `main-surface` 是为 Dream Skin v3 保留的唯一平台兼容别名，不承载 Spider-Gwen 样式；切换其他主题时，格温专属样式、角色标记和顶栏装饰会全部移除。
- 脚本销毁、重新注入和旧版本异常均有所有权保护。Codex++ 热重载时旧实例不能删除新实例，也不会留下重复定时器。

壁纸仍完全由 `theme/theme.json` 管理，增强层不会修改图片路径、缩放方式或 `50% 50%` 焦点。

## 运行状态诊断

在 Codex++ 开发者工具控制台中执行：

```js
window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__?.getDiagnostics?.()
```

返回值中的 `mode` 含义：

- `full`：基础主题和已识别的增强模块均正常。
- `degraded`：个别可选控件未识别，其余模块继续工作。
- `base-only`：Codex 或 Dream Skin 尚在加载，暂时只保留基础层并等待恢复。
- `inactive`：当前不是 Spider-Gwen 主题，脚本已清理自己的样式。

`capabilities` 会列出主界面、侧栏、顶栏、输入框等模块的识别结果，便于在 Codex 更新后快速定位兼容点。

需要做一次完整自检时执行：

```js
window.__CODEX_PLUS_SPIDER_GWEN_IMMERSIVE__?.selfCheck?.()
```

- `ok: true`：当前页面所需的增强锚点完整、单例和壁纸检查均通过。
- `usable: true`：即使个别可选增强未识别，基础主题和核心功能仍可安全使用。
- `issues`：只列出需要处理的单例、壁纸位置、顶栏连续性或主题泄漏问题。

## 致谢

- [CodexPlusPlus](https://github.com/BigPizzaV3/CodexPlusPlus)
- [Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin)

## 声明

这是非官方粉丝主题，与 OpenAI、Marvel、Sony 或相关权利方无隶属或背书关系。Spider-Gwen 名称、角色形象及壁纸素材的权利归各自权利方所有；请仅在你拥有相应使用权的范围内使用和再分发。本仓库不对素材授予额外许可。

