# Codex Spider-Gwen Skin

一套面向 Windows Codex++ / Dream Skin 的 Spider-Gwen 沉浸主题。

它将 Dream Skin 的连续壁纸主题与 Codex++ 用户脚本组合在一起，为首页、任务页、侧栏、输入框、菜单和浮层提供统一的 Earth-65 蓝粉视觉语言。

## 效果预览

### 首页沉浸全景
> 连续壁纸、半透明磨砂侧栏融合、顶部品牌标示与单层输入框。

![Spider-Gwen 首页全景预览](https://fastly.jsdelivr.net/gh/Zephyr333/Codex-Spider-Gwen-Skin@main/docs/screenshots/home.png)

### 会话阅读与暗色遮罩
> 保持背景连续透出，同时确保会话气泡、活动状态卡片与代码块的高可读性对比度。

![Spider-Gwen 会话阅读预览](https://fastly.jsdelivr.net/gh/Zephyr333/Codex-Spider-Gwen-Skin@main/docs/screenshots/session.png)

### 一体化输入框细节
> 项目栏与编辑器外框合二为一，具备粉蓝渐变流光描边，且完全保留原生点击交互。

![Spider-Gwen 一体化输入框细节](https://fastly.jsdelivr.net/gh/Zephyr333/Codex-Spider-Gwen-Skin@main/docs/screenshots/composer-composite.png)

## 包含内容

- `theme/theme.json`：Dream Skin 主题配置
- `theme/image.jpg`：Spider-Gwen 16:9 壁纸
- `codex-plus-plus/spider-gwen-immersive.js`：沉浸式 UI 用户脚本
- `codex-plus-plus/spider-gwen-icon.png`：透明 Spider-Gwen Logo 源文件

## 安装

**从 DreamSkin 社区来的用户请先看这里：社区 2.1.3 是基础主题，完整增强版为 GitHub 2.1.1。** 社区“一键换肤”只安装壁纸、配色和 Safe CSS，不会安装 `spider-gwen-immersive.js`，因此不包含增强脚本的新版组件兼容修复、品牌装饰、自检与自愈功能。两个版本号属于不同交付物，社区版本号更高不代表完整增强版更新。

- [社区基础主题 2.1.3](https://dreamskin.cc/themes/ver_966db74ee98d34241cad)：适合只需要背景和基础配色的用户。
- [完整增强版 2.1.1](https://github.com/Zephyr333/Codex-Spider-Gwen-Skin/releases/tag/v2.1.1)：下载 `Codex-Spider-Gwen-Skin-v2.1.1.zip`，安装其中的主题和用户脚本。
- [社区用户安装教程](docs/community-install.md)：包含已有社区主题的安装方式、效果检查和停用方法。

下面是完整增强版的安装步骤：

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
- 主题分为基础主题、必要兼容修复和视觉增强：`theme.json` 管理壁纸与基础配色；用户脚本承载已知结构冲突的修复，以及控件材质与装饰。增强识别失败时保留必要修复；用户脚本完全未加载时不能提供该修复。
- 增强脚本优先使用 Codex 的 `data-*` 语义属性，再使用受控兼容回退；侧栏、顶栏、首页或输入框中的单个锚点缺失时会独立降级，不再让整套皮肤退出。
- 普通程序更新不会覆盖用户数据目录中的主题和脚本。Codex/Codex++ 若彻底移除现有语义结构，增强层会进入降级模式并保留基础主题，而不是显示空白背景。

## v2.0 兼容与重构架构

### v2.1.0：稳定性、原生性与性能

- 事件按外壳、组件、输入框几何、侧栏和弹层分别失效；缓存页面状态切换立即重新选择活动区域。流式文字跳过识别，卡片新增或变化只更新所属组件。
- 取消每 1.5 秒完整识别。可见窗口每 5 秒做轻量健康检查，节点或样式丢失才恢复；隐藏窗口暂停周期工作。首次挂载使用最多 10 秒的有限退避。
- 日常输入的矩形数据由浏览器布局观察器提供，纯高度变化不重新识别历史内容或输入框结构；装饰坐标按 CSS 序列化精度比较，避免重复写入相同样式。
- 根状态观察器仅观察主题属性并保留旧值；活动界面属性观察不再申请全树旧值，子节点发现保留文档边界。重复写入同值和自有装饰写入不会触发循环更新。
- 删除过期材质规则与原生会话按钮的固定尺寸覆盖，保留原生 sticky、滚动、焦点、菜单和事件。增强只负责视觉及已验证的必要兼容修复。
- 页面语义与活动编辑器优先于模式文字，修正跨模式页面的诊断分类。热重载、节点复制和销毁会清理自有标记、尺寸变量、观察器及计时器。
- `getDiagnostics()` 增加 `modules` 和工作计数；`startPerformanceSampling()` / `stopPerformanceSampling()` 提供显式、最多 200 条的阶段耗时样本，默认不采样，不记录消息内容。
- 维护入口及验收边界见 [维护说明](docs/maintenance.md)。旧基线仍保留在 `docs/visual-baselines`。

### v2.0.4：摘要标题伪元素修复

- 清除摘要 sticky 标题上方原生 8px `::before` 的实色背景，消除分区横带和外缘分层观感；保留 sticky 布局、原生细分隔线和悬停反馈。
- `selfCheck()` 增加 `summaryHeadingScrims`，标题伪元素残留材质时报告 `summary-heading-material-stacked`，避免只检查标题元素本身就宣布视觉通过。

### v2.0.3：背景融合与外框兼容

- 首页使用 0.28、会话使用 0.80 的全窗口背景遮罩。顶栏、侧栏与主区共享连续壁纸和遮罩，原生外框留白不会露出未压暗的壁纸；保留原生布局尺寸。
- 恢复主页品牌与状态装饰，依据原生顶栏控件边界避让；恢复原生头像尺寸，清除模式按钮被底座附加的圆点。
- 会话操作栏按原生按钮实际边界避让，兼容 Codex 的置顶/归档及 ChatGPT 的菜单/置顶组合。只调整自有装饰变量，不改按钮事件；变量随路由与销毁清理。
- 外部提示不再令已确认的项目栏退出输入框组合，装饰可向上和向下扩展。提示保持独立，未知组合保留原生材质并报告失配。右侧摘要使用单层材质和柔和完整细边，内部标题不截断外缘。
- 显式 `selfCheck()` 增加背景覆盖、外壳连续性、头像、模式装饰、操作栏重叠、品牌避让、摘要边缘及项目栏识别结果。真实快速模式或额度提示的出现依赖应用状态，应与 fixture 验证分别记录。

### v2.0.2：恢复阅读基线与单层材质

- 会话恢复连续的 0.80 深蓝背景遮罩，正文不新增逐条气泡。按最亮白底保守计算，正文、必要次要文字和链接的主题色对比度不低于 4.5:1；这不是对整个应用所有像素的无障碍认证。
- 重复组件使用自有 `data-spider-gwen-surface` 标记，按逻辑外壳分配材质。工具标题不再通过 `activity-header` 子串给内部文字和 SVG 套上背景、边框或内边距。
- 保留原生展开按钮、事件、ARIA 状态和图标旋转；箭头默认可见。工具输出和代码使用一层卡片，文件列表的内部行保持透明。
- `spider-gwen-material` CSS 层负责已确认组件的视觉属性，避免当前底座的未分层规则将输入框覆盖成实色。输入框背景与青粉外缘由同一外壳绘制；Work 首页伸出节点的原生工具栏只延伸装饰，不改变原生节点高度或移动控件。
- 项目栏组合包含外部提示或身份不明确时保留原生材质；重复标记、装饰尺寸变量、观察器与旧实例资源在停用和销毁时清理。
- `selfCheck()` 分别返回 `functionalOk`、`structuralOk`、`visualOk`，新增 `visualChecks` 与 `visualIssues`。阅读对比度、嵌套材质、展开图标及完整外框检查失败时，不能把功能可用当作视觉通过。
- 较重的视觉检查只在显式自检时执行；背景更新使用结构变化标记和低频自愈，避免每个输出片段都全量扫描。

### v2.0.1：新版壳层与长期稳定性

- 正确关联位于主区域外的应用顶栏，不把来源面板标题识别为顶栏。
- 分别识别会话底部的空白实色装饰和独立 sticky 渐变装饰；允许装饰使用 `aria-hidden`，但不处理包含文本、控件或身份不明确的节点。
- 新增 `src/compatibility.css` 独立必要修复层。增强模块失配、主区域歧义或增强异常时，经过结构限定的 top-fade 修复仍然保留；切换主题、暂停或销毁时一起清理。
- 首页仅修复确认为空且受旧版 440px 约束的占位节点。插入公告、调整节点顺序或占位变成真实内容时，不按 `first-child` 继续强制布局。
- 输入框优先使用 `data-composer-surface-variant`、`data-composer-body` 和 `data-composer-footer-responsive`；类名变化时继续通过语义属性识别。
- 支持设置导航位于主区域外的新布局；设置页保留原生控件与滚动，只调整经过校验的内容背景。
- 可选模块异常独立降级；旧实例销毁异常时补做资源和所有权清理。核心输入未识别时，自检不会报告可用。
- `sourceSignature` 区分同版本的不同构建，`anchors`、`missing`、`moduleErrors` 和耗时指标用于定位兼容问题。

长期目标是常见结构变化自动恢复、未知结构安全降级，而不是承诺未来所有 Codex/Dream Skin 大版本都无需适配。自动回归覆盖结构变更和重复生命周期；实机验收与长期日常使用仍是不同证据。

构建与验证：

```sh
npm run build
npm test
npm run check
node scripts/manage.mjs inspect
```

部署先备份并校验文件；通过 Codex++ 的“重新加载用户脚本”入口加载后，应再次核对诊断中的 `sourceSignature`，不能只比较版本号。回退使用备份的 `manifest.json`，工具会拒绝覆盖部署后被另行修改的脚本。

v2.0 针对 Codex 26.924+ 及 Codex++ 1.4+ 进行了深度重构，支持完整的模块化构建与自动化回归测试：

- **Codex 26.924+ 结构适配**：新版 Codex 将主聊天视图包入 `[data-app-shell-main-content-top-fade]`，旧版基础皮肤将其设为 `display: none` 导致整个对话与输入框消失。v2.0 精确定向覆盖该规则，恢复内容层弹性布局。
- **Codex++ 现代引擎适配**：直接对接 Codex++ 的 `data-dream-skin="active"` 与 `data-ds-part` 标记，解除对旧版 `codex-dream-skin` class 的单一依赖。
- **全模式支持**：覆盖 Codex 首页/任务页、ChatGPT 聊天模式（首页/对话页）、ChatGPT 工作模式（首页/对话页）。
- **工程化与自动化**：源码拆分为 `src/skin.css` 与 `src/runtime.js`，提供 `npm run build` 打包构建、`npm test` 隔离无头浏览器回归测试，以及 `node scripts/manage.mjs inspect|deploy|restore` 一键备份部署工具。

## v1.5 低维护架构

v1.5 将容易随 Codex 更新失效的 DOM 定位集中到一个适配层，视觉 CSS 只依赖脚本自己写入的 `data-spider-gwen-role`。后续若上游再次改版，通常只需调整少量锚点解析，而不必重写整套主题。

- 锚点按“稳定语义属性 → 受控兼容标记 → 严格几何校验”三级解析；几何回退必须同时满足位置、尺寸和包含关系，避免误伤相似控件。
- 首页、任务页、侧栏折叠、延迟挂载和窗口尺寸变化都由同一个幂等 `ensure()` 收敛；重复执行不会叠加样式、装饰层或观察器。
- MutationObserver 只关注会影响关键锚点的结构变化，另有低频自检负责最终恢复，避免持续扫描完整 DOM。
- v2.0.1 对旧版首页占位冲突进一步收窄：只修正确认为空且具备已知 440px 约束的节点；真实 banner 不作为空占位处理。
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

- `ok: true`：当前页面所需的增强识别、单例与已实现的可用性检查通过。
- `usable: true`：在主题激活时，核心输入或设置页面通过检查；可选装饰缺失不一定使它变为 false。它不代表所有业务操作均已实机验证。
- `issues`：列出核心区域未识别、输入框裁切、横向溢出、装饰拦截输入、必要修复缺失或主题泄漏等实际检查结果。

## 致谢

- [CodexPlusPlus](https://github.com/BigPizzaV3/CodexPlusPlus)
- [Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin)

## 声明

这是非官方粉丝主题，与 OpenAI、Marvel、Sony 或相关权利方无隶属或背书关系。Spider-Gwen 名称、角色形象及壁纸素材的权利归各自权利方所有；请仅在你拥有相应使用权的范围内使用和再分发。本仓库不对素材授予额外许可。
