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

## 致谢

- [CodexPlusPlus](https://github.com/BigPizzaV3/CodexPlusPlus)
- [Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin)

## 声明

这是非官方粉丝主题，与 OpenAI、Marvel、Sony 或相关权利方无隶属或背书关系。Spider-Gwen 名称、角色形象及壁纸素材的权利归各自权利方所有；请仅在你拥有相应使用权的范围内使用和再分发。本仓库不对素材授予额外许可。

