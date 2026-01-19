# Gemini CLI 设置 (`/settings` 命令)

使用 `/settings` 命令控制您的 Gemini CLI 体验。`/settings`
命令打开一个对话框，用于查看和编辑您的所有 Gemini
CLI 设置，包括您的 UI 体验、键绑定和辅助功能。

您的 Gemini CLI 设置存储在 `settings.json` 文件中。除了使用 `/settings`
命令外，您还可以在以下位置之一编辑它们：

- **用户设置**: `~/.gemini/settings.json`
- **工作区设置**: `your-project/.gemini/settings.json`

注意：工作区设置覆盖用户设置。

## 设置参考

以下是所有可用设置的列表，按类别分组并按它们在 UI 中出现的顺序排列。

<!-- SETTINGS-AUTOGEN:START -->

### 常规 (General)

| UI 标签             | 设置                               | 描述                                   | 默认值  |
| :------------------ | :--------------------------------- | :------------------------------------- | :------ |
| 预览功能 (例如模型) | `general.previewFeatures`          | 启用预览功能（例如预览模型）。         | `false` |
| Vim 模式            | `general.vimMode`                  | 启用 Vim 键绑定                        | `false` |
| 启用自动更新        | `general.enableAutoUpdate`         | 启用自动更新。                         | `true`  |
| 启用提示词补全      | `general.enablePromptCompletion`   | 启用输入时的 AI 驱动的提示词补全建议。 | `false` |
| 调试按键日志        | `general.debugKeystrokeLogging`    | 启用按键记录到控制台的调试日志。       | `false` |
| 启用会话清理        | `general.sessionRetention.enabled` | 启用自动会话清理                       | `false` |

### 输出 (Output)

| UI 标签  | 设置            | 描述                                      | 默认值   |
| :------- | :-------------- | :---------------------------------------- | :------- |
| 输出格式 | `output.format` | CLI 输出的格式。可以是 `text` 或 `json`。 | `"text"` |

### UI

| UI 标签              | 设置                                    | 描述                                                                                             | 默认值  |
| :------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------- | :------ |
| 隐藏窗口标题         | `ui.hideWindowTitle`                    | 隐藏窗口标题栏                                                                                   | `false` |
| 在标题中显示思路     | `ui.showStatusInTitle`                  | 在工作阶段期间，在终端窗口标题中显示 Gemini CLI 模型思路                                         | `false` |
| 动态窗口标题         | `ui.dynamicWindowTitle`                 | 使用当前状态图标更新终端窗口标题 (就绪: ◇, 需要操作: ✋, 工作中: ✦)                              | `true`  |
| 显示主目录警告       | `ui.showHomeDirectoryWarning`           | 在主目录中运行 Gemini CLI 时显示警告。                                                           | `true`  |
| 隐藏提示             | `ui.hideTips`                           | 隐藏 UI 中的有用提示                                                                             | `false` |
| 隐藏横幅             | `ui.hideBanner`                         | 隐藏应用程序横幅                                                                                 | `false` |
| 隐藏上下文摘要       | `ui.hideContextSummary`                 | 隐藏输入框上方的上下文摘要（GEMINI.md, MCP 服务器）。                                            | `false` |
| 隐藏 CWD             | `ui.footer.hideCWD`                     | 隐藏页脚中的当前工作目录路径。                                                                   | `false` |
| 隐藏沙盒状态         | `ui.footer.hideSandboxStatus`           | 隐藏页脚中的沙盒状态指示器。                                                                     | `false` |
| 隐藏模型信息         | `ui.footer.hideModelInfo`               | 隐藏页脚中的模型名称和上下文使用情况。                                                           | `false` |
| 隐藏上下文窗口百分比 | `ui.footer.hideContextPercentage`       | 隐藏剩余上下文窗口百分比。                                                                       | `true`  |
| 隐藏页脚             | `ui.hideFooter`                         | 从 UI 中隐藏页脚                                                                                 | `false` |
| 显示内存使用         | `ui.showMemoryUsage`                    | 在 UI 中显示内存使用信息                                                                         | `false` |
| 显示行号             | `ui.showLineNumbers`                    | 在聊天中显示行号。                                                                               | `true`  |
| 显示引用             | `ui.showCitations`                      | 在聊天中显示生成文本的引用。                                                                     | `false` |
| 在聊天中显示模型信息 | `ui.showModelInfoInChat`                | 在每轮模型对话中显示模型名称。                                                                   | `false` |
| 使用全宽             | `ui.useFullWidth`                       | 使用终端的整个宽度进行输出。                                                                     | `true`  |
| 使用备用屏幕缓冲区   | `ui.useAlternateBuffer`                 | 为 UI 使用备用屏幕缓冲区，保留 shell 历史记录。                                                  | `false` |
| 增量渲染             | `ui.incrementalRendering`               | 启用 UI 的增量渲染。此选项将减少闪烁，但可能会导致渲染伪影。仅在启用 useAlternateBuffer 时支持。 | `true`  |
| 启用加载短语         | `ui.accessibility.enableLoadingPhrases` | 在操作期间启用加载短语。                                                                         | `true`  |
| 屏幕阅读器模式       | `ui.accessibility.screenReader`         | 以纯文本渲染输出，以便更好地支持屏幕阅读器                                                       | `false` |

### IDE

| UI 标签  | 设置          | 描述                | 默认值  |
| :------- | :------------ | :------------------ | :------ |
| IDE 模式 | `ide.enabled` | 启用 IDE 集成模式。 | `false` |

### 模型 (Model)

| UI 标签              | 设置                         | 描述                                                | 默认值 |
| :------------------- | :--------------------------- | :-------------------------------------------------- | :----- |
| 最大会话轮数         | `model.maxSessionTurns`      | 会话中保留的最大用户/模型/工具轮数。-1 表示无限制。 | `-1`   |
| 压缩阈值             | `model.compressionThreshold` | 触发上下文压缩的上下文使用比例（例如 0.2, 0.3）。   | `0.5`  |
| 跳过下一个发言者检查 | `model.skipNextSpeakerCheck` | 跳过下一个发言者检查。                              | `true` |

### 上下文 (Context)

| UI 标签            | 设置                                              | 描述                                                                                                    | 默认值  |
| :----------------- | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------ | :------ |
| 记忆发现最大目录数 | `context.discoveryMaxDirs`                        | 搜索记忆的最大目录数。                                                                                  | `200`   |
| 从包含目录加载记忆 | `context.loadMemoryFromIncludeDirectories`        | 控制 `/memory refresh` 如何加载 GEMINI.md 文件。为 true 时，扫描包含目录；为 false 时，仅使用当前目录。 | `false` |
| 遵守 .gitignore    | `context.fileFiltering.respectGitIgnore`          | 搜索时遵守 .gitignore 文件。                                                                            | `true`  |
| 遵守 .geminiignore | `context.fileFiltering.respectGeminiIgnore`       | 搜索时遵守 .geminiignore 文件。                                                                         | `true`  |
| 启用递归文件搜索   | `context.fileFiltering.enableRecursiveFileSearch` | 在提示词中补全 @ 引用时启用递归文件搜索功能。                                                           | `true`  |
| 启用模糊搜索       | `context.fileFiltering.enableFuzzySearch`         | 搜索文件时启用模糊搜索。                                                                                | `true`  |

### 工具 (Tools)

| UI 标签          | 设置                                 | 描述                                                                                                              | 默认值    |
| :--------------- | :----------------------------------- | :---------------------------------------------------------------------------------------------------------------- | :-------- |
| 启用交互式 Shell | `tools.shell.enableInteractiveShell` | 使用 node-pty 获得交互式 shell 体验。child_process 的回退仍然适用。                                               | `true`    |
| 显示颜色         | `tools.shell.showColor`              | 在 shell 输出中显示颜色。                                                                                         | `false`   |
| 自动接受         | `tools.autoAccept`                   | 自动接受并执行被视为安全的工具调用（例如，只读操作）。                                                            | `false`   |
| 使用 Ripgrep     | `tools.useRipgrep`                   | 使用 ripgrep 进行文件内容搜索，而不是回退实现。提供更快的搜索性能。                                               | `true`    |
| 启用工具输出截断 | `tools.enableToolOutputTruncation`   | 启用大型工具输出的截断。                                                                                          | `true`    |
| 工具输出截断阈值 | `tools.truncateToolOutputThreshold`  | 如果工具输出大于这么多字符，则截断它。设置为 -1 以禁用。                                                          | `4000000` |
| 工具输出截断行数 | `tools.truncateToolOutputLines`      | 截断工具输出时保留的行数。                                                                                        | `1000`    |
| 禁用 LLM 修正    | `tools.disableLLMCorrection`         | 禁用针对编辑工具的基于 LLM 的错误修正。启用后，如果未找到精确的字符串匹配项，工具将立即失败，而不是尝试自我修正。 | `false`   |

### 安全 (Security)

| UI 标签             | 设置                                            | 描述                                           | 默认值  |
| :------------------ | :---------------------------------------------- | :--------------------------------------------- | :------ |
| 禁用 YOLO 模式      | `security.disableYoloMode`                      | 禁用 YOLO 模式，即使通过标志启用。             | `false` |
| 允许永久工具批准    | `security.enablePermanentToolApproval`          | 在工具确认对话框中启用“允许所有未来会话”选项。 | `false` |
| 阻止来自 Git 的扩展 | `security.blockGitExtensions`                   | 阻止从 Git 安装和加载扩展。                    | `false` |
| 文件夹信任          | `security.folderTrust.enabled`                  | 跟踪文件夹信任是否启用的设置。                 | `false` |
| 启用环境变量修订    | `security.environmentVariableRedaction.enabled` | 启用可能包含机密的环境变量的修订。             | `false` |

### 实验性 (Experimental)

| UI 标签              | 设置                                                    | 描述                                                            | 默认值  |
| :------------------- | :------------------------------------------------------ | :-------------------------------------------------------------- | :------ |
| Agent 技能           | `experimental.skills`                                   | 启用 Agent 技能（实验性）。                                     | `false` |
| 启用代码库调查员     | `experimental.codebaseInvestigatorSettings.enabled`     | 启用代码库调查员 (Codebase Investigator) 代理。                 | `true`  |
| 代码库调查员最大轮数 | `experimental.codebaseInvestigatorSettings.maxNumTurns` | 代码库调查员代理的最大轮数。                                    | `10`    |
| 使用 OSC 52 粘贴     | `experimental.useOSC52Paste`                            | 使用 OSC 52 序列进行粘贴，而不是 clipboardy（对远程会话有用）。 | `false` |
| 启用 CLI 帮助代理    | `experimental.cliHelpAgentSettings.enabled`             | 启用 CLI 帮助代理。                                             | `true`  |
| 规划 (Plan)          | `experimental.plan`                                     | 启用规划功能（规划模式和工具）。                                | `false` |

### 挂钩 (Hooks)

| UI 标签   | 设置                  | 描述                            | 默认值 |
| :-------- | :-------------------- | :------------------------------ | :----- |
| Hook 通知 | `hooks.notifications` | 在 Hooks 执行时显示视觉指示器。 | `true` |

<!-- SETTINGS-AUTOGEN:END -->
