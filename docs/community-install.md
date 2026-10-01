# 社区主题与完整增强版安装说明

**DreamSkin 社区 2.1.3 是基础主题；GitHub 2.1.2 是主题与用户脚本组成的完整增强版。** 社区“一键换肤”不会自动安装增强脚本。两者独立编号，不能仅凭版本号大小判断功能多少。

| 交付物 | 包含内容 | 安装入口 |
| --- | --- | --- |
| 社区基础主题 2.1.3 | 壁纸、Earth-65 配色、受限 Safe CSS | [DreamSkin 社区详情](https://dreamskin.cc/themes/ver_966db74ee98d34241cad) |
| 完整增强版 2.1.2 | 基础主题，以及新版组件兼容修复、品牌装饰、诊断、自愈和性能控制脚本 | [GitHub 正式版](https://github.com/Zephyr333/Codex-Spider-Gwen-Skin/releases/tag/v2.1.2) |

## 安装完整增强版

1. 安装并启动 [Codex++](https://github.com/BigPizzaV3/CodexPlusPlus)，确认 Dream Skin 与用户脚本功能可用。普通浏览器的 Tampermonkey/ScriptCat 不是这个脚本的安装入口。
2. 从正式版附件下载 `Codex-Spider-Gwen-Skin-v2.1.2.zip` 并解压。
3. 将 ZIP 中 `theme` 文件夹内的 `theme.json` 和 `image.jpg` 放入：

   `%USERPROFILE%\.codex-session-delete\dream-skin\themes\spider-gwen\`

4. 将 ZIP 中 `codex-plus-plus/spider-gwen-immersive.js` 放入：

   `%APPDATA%\Codex++\user_scripts\`

5. 在 Codex++ 的用户脚本管理中启用 `spider-gwen-immersive.js`，在 Dream Skin 中选择刚安装的本地 `Spider-Gwen` 主题，然后通过正常入口重新加载用户脚本；若没有重载入口，关闭并重新打开 Codex++。

使用自定义数据目录时，以管理工具显示的实际路径为准。不要把脚本放进 Codex 或 Codex++ 的安装目录，也不要修改应用安装文件。

## 已经安装社区 2.1.3 的情况

只需要基础外观，可以继续使用社区主题，无需脚本。

需要完整增强效果，请按上面的完整包步骤安装，并选择完整包提供的本地主题。完整版本的实机验收使用该主题与脚本组合；社区 Safe CSS 与脚本叠加的组合没有完成同等实机验收，不将它当作已经验证的完整安装方式。两个主题若同名，以管理工具显示的本地来源和安装路径区分。

已有文件时先备份，再替换同名文件。同一脚本只启用一份，避免同时启用旧副本与新副本。

## 确认安装结果

- 用户脚本管理中，脚本版本应为 `2.1.2`，且处于启用状态；仅把文件复制过去不等于已经加载。
- 选择其他主题时，Spider-Gwen 增强会停用。这是正常行为，脚本只在主题 ID 为 `spider-gwen` 时启用。
- 首页品牌装饰、连续背景和已识别组件材质可以作为外观参考，但外观存在不等于所有功能通过。
- 进一步诊断请按[维护说明](maintenance.md)运行已加载实例的 `selfCheck()`，分别查看功能、结构和视觉结果。未加载脚本时不会出现该诊断接口。

正式版单独脚本的 SHA-256：

```text
744e05ad2465f607a79c8d275b9c0be5a40f4deac713e748a5732a08743da33a
```

## 停用与回退

在用户脚本管理中停用增强脚本并重新加载，即可退出脚本增强；基础外观由当前 Dream Skin 主题继续提供。回退增强版本时恢复事先备份的脚本；需要恢复原主题时，同时恢复主题文件或重新选择原主题。

未来 Codex 或 Dream Skin 改版仍可能需要适配。快速模式、用量耗尽等真实提示场景尚未完成全面实机验收；社区模拟预览不代表完整增强版的实际运行效果。
