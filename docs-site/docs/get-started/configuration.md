# Gemini CLI 配置

> **关于配置格式的说明，2025/9/17：** `settings.json`
> 文件的格式已更新为新的、更有组织的结构。
>
> - 新格式将从 **[2025/09/10]** 开始在稳定版本中受支持。
> - 从旧格式到新格式的自动迁移将于 **[2025/09/17]** 开始。
>
> 有关先前格式的详细信息，请参阅 [v1 配置文档](./configuration-v1.md)。

Gemini
CLI 提供了多种配置行为的方式，包括环境变量、命令行参数和设置文件。本文档概述了不同的配置方法和可用设置。

## 配置层级

配置按以下优先顺序应用（较低的数字被较高的数字覆盖）：

1.  **默认值：** 应用程序中硬编码的默认值。
2.  **系统默认文件：** 系统范围的默认设置，可由其他设置文件覆盖。
3.  **用户设置文件：** 当前用户的全局设置。
4.  **项目设置文件：** 特定于项目的设置。
5.  **系统设置文件：** 覆盖所有其他设置文件的系统范围设置。
6.  **环境变量：** 系统范围或特定于会话的变量，可能从 `.env` 文件加载。
7.  **命令行参数：** 启动 CLI 时传递的值。

## 设置文件

Gemini CLI 使用 JSON 设置文件进行持久化配置。这些文件有四个位置：

> **提示：** 通过指向本仓库中的 `schemas/settings.schema.json`
> 生成的 schema，JSON 感知编辑器可以使用自动补全和验证。在仓库外工作时，请引用托管的 schema：`https://raw.githubusercontent.com/google-gemini/gemini-cli/main/schemas/settings.schema.json`。

- **系统默认文件：**
  - **位置：** `/etc/gemini-cli/system-defaults.json` (Linux),
    `C:\ProgramData\gemini-cli\system-defaults.json` (Windows) 或
    `/Library/Application Support/GeminiCli/system-defaults.json`
    (macOS)。路径可以使用 `GEMINI_CLI_SYSTEM_DEFAULTS_PATH` 环境变量覆盖。
  - **范围：**
    提供系统范围默认设置的基础层。这些设置优先级最低，旨在被用户、项目或系统覆盖设置所覆盖。
- **用户设置文件：**
  - **位置：** `~/.gemini/settings.json`（其中 `~` 是您的主目录）。
  - **范围：** 适用于当前用户的所有 Gemini CLI 会话。用户设置覆盖系统默认值。
- **项目设置文件：**
  - **位置：** 您项目根目录下的 `.gemini/settings.json`。
  - **范围：** 仅在从该特定项目运行 Gemini
    CLI 时适用。项目设置覆盖用户设置和系统默认值。
- **系统设置文件：**
  - **位置：** `/etc/gemini-cli/settings.json` (Linux),
    `C:\ProgramData\gemini-cli\settings.json` (Windows) 或
    `/Library/Application Support/GeminiCli/settings.json` (macOS)。路径可以使用
    `GEMINI_CLI_SYSTEM_SETTINGS_PATH` 环境变量覆盖。
  - **范围：** 适用于系统上的所有 Gemini
    CLI 会话，针对所有用户。系统设置作为覆盖项，优先于所有其他设置文件。这对于企业的系统管理员控制用户的 Gemini
    CLI 设置可能很有用。

**关于设置中环境变量的说明：** `settings.json` 和 `gemini-extension.json`
文件中的字符串值可以使用 `$VAR_NAME` 或 `${VAR_NAME}`
语法引用环境变量。这些变量将在加载设置时自动解析。例如，如果您有一个环境变量
`MY_API_TOKEN`，您可以在 `settings.json`
中这样使用它：`"apiKey": "$MY_API_TOKEN"`。此外，每个扩展可以在其目录中拥有自己的
`.env` 文件，该文件将被自动加载。

> **企业用户注意事项：** 有关在企业环境中部署和管理 Gemini CLI 的指导，请参阅
> [企业配置](../cli/enterprise.md) 文档。

### 项目中的 `.gemini` 目录

除了项目设置文件外，项目的 `.gemini` 目录还可以包含与 Gemini
CLI 操作相关的其他特定于项目的文件，例如：

- [自定义沙盒配置文件](#sandboxing)（例如 `.gemini/sandbox-macos-custom.sb`,
  `.gemini/sandbox.Dockerfile`）。

### `settings.json` 中的可用设置

设置分为几类。所有设置都应放置在 `settings.json` 文件中相应的顶级类别对象内。

<!-- SETTINGS-AUTOGEN:START -->

#### `general` (常规)

- **`general.previewFeatures`** (boolean):
  - **描述:** 启用预览功能（例如预览模型）。
  - **默认值:** `false`

- **`general.preferredEditor`** (string):
  - **描述:** 打开文件的首选编辑器。
  - **默认值:** `undefined`

- **`general.vimMode`** (boolean):
  - **描述:** 启用 Vim 键绑定。
  - **默认值:** `false`

- **`general.enableAutoUpdate`** (boolean):
  - **描述:** 启用自动更新。
  - **默认值:** `true`

- **`general.enableAutoUpdateNotification`** (boolean):
  - **描述:** 启用更新通知提示。
  - **默认值:** `true`

- **`general.checkpointing.enabled`** (boolean):
  - **描述:** 启用会话检查点以进行恢复。
  - **默认值:** `false`
  - **需要重启:** 是

- **`general.enablePromptCompletion`** (boolean):
  - **描述:** 启用输入时的 AI 驱动的提示词补全建议。
  - **默认值:** `false`
  - **需要重启:** 是

- **`general.retryFetchErrors`** (boolean):
  - **描述:** 在遇到 "exception TypeError: fetch failed sending
    request" 错误时重试。
  - **默认值:** `false`

- **`general.debugKeystrokeLogging`** (boolean):
  - **描述:** 启用按键记录到控制台的调试日志。
  - **默认值:** `false`

- **`general.sessionRetention.enabled`** (boolean):
  - **描述:** 启用自动会话清理。
  - **默认值:** `false`

- **`general.sessionRetention.maxAge`** (string):
  - **描述:** 会话保留的最大时间（例如 "30d", "7d", "24h", "1w"）。
  - **默认值:** `undefined`

- **`general.sessionRetention.maxCount`** (number):
  - **描述:** 替代方案：保留的最大会话数量（最近的）。
  - **默认值:** `undefined`

- **`general.sessionRetention.minRetention`** (string):
  - **描述:** 最小保留期（安全限制，默认为 "1d"）。
  - **默认值:** `"1d"`

#### `output` (输出)

- **`output.format`** (enum):
  - **描述:** CLI 输出的格式。可以是 `text` 或 `json`。
  - **默认值:** `"text"`
  - **值:** `"text"`, `"json"`

#### `ui` (界面)

- **`ui.theme`** (string):
  - **描述:** UI 的颜色主题。查看 CLI 主题指南以获取可用选项。
  - **默认值:** `undefined`

- **`ui.customThemes`** (object):
  - **描述:** 自定义主题定义。
  - **默认值:** `{}`

- **`ui.hideWindowTitle`** (boolean):
  - **描述:** 隐藏窗口标题栏。
  - **默认值:** `false`
  - **需要重启:** 是

- **`ui.showStatusInTitle`** (boolean):
  - **描述:** 在工作阶段期间，在终端窗口标题中显示 Gemini CLI 模型思路。
  - **默认值:** `false`

- **`ui.dynamicWindowTitle`** (boolean):
  - **描述:** 使用当前状态图标更新终端窗口标题 (就绪: ◇, 需要操作: ✋, 工作中:
    ✦)。
  - **默认值:** `true`

- **`ui.showHomeDirectoryWarning`** (boolean):
  - **描述:** 在主目录中运行 Gemini CLI 时显示警告。
  - **默认值:** `true`
  - **需要重启:** 是

- **`ui.hideTips`** (boolean):
  - **描述:** 隐藏 UI 中的有用提示。
  - **默认值:** `false`

- **`ui.hideBanner`** (boolean):
  - **描述:** 隐藏应用程序横幅。
  - **默认值:** `false`

- **`ui.hideContextSummary`** (boolean):
  - **描述:** 隐藏输入框上方的上下文摘要（GEMINI.md, MCP 服务器）。
  - **默认值:** `false`

- **`ui.footer.hideCWD`** (boolean):
  - **描述:** 隐藏页脚中的当前工作目录路径。
  - **默认值:** `false`

- **`ui.footer.hideSandboxStatus`** (boolean):
  - **描述:** 隐藏页脚中的沙盒状态指示器。
  - **默认值:** `false`

- **`ui.footer.hideModelInfo`** (boolean):
  - **描述:** 隐藏页脚中的模型名称和上下文使用情况。
  - **默认值:** `false`

- **`ui.footer.hideContextPercentage`** (boolean):
  - **描述:** 隐藏剩余上下文窗口百分比。
  - **默认值:** `true`

- **`ui.hideFooter`** (boolean):
  - **描述:** 从 UI 中隐藏页脚。
  - **默认值:** `false`

- **`ui.showMemoryUsage`** (boolean):
  - **描述:** 在 UI 中显示内存使用信息。
  - **默认值:** `false`

- **`ui.showLineNumbers`** (boolean):
  - **描述:** 在聊天中显示行号。
  - **默认值:** `true`

- **`ui.showCitations`** (boolean):
  - **描述:** 在聊天中显示生成文本的引用。
  - **默认值:** `false`

- **`ui.showModelInfoInChat`** (boolean):
  - **描述:** 在每轮模型对话中显示模型名称。
  - **默认值:** `false`

- **`ui.useFullWidth`** (boolean):
  - **描述:** 使用终端的整个宽度进行输出。
  - **默认值:** `true`

- **`ui.useAlternateBuffer`** (boolean):
  - **描述:** 为 UI 使用备用屏幕缓冲区，保留 shell 历史记录。
  - **默认值:** `false`
  - **需要重启:** 是

- **`ui.incrementalRendering`** (boolean):
  - **描述:**
    启用 UI 的增量渲染。此选项将减少闪烁，但可能会导致渲染伪影。仅在启用 useAlternateBuffer 时支持。
  - **默认值:** `true`
  - **需要重启:** 是

- **`ui.customWittyPhrases`** (array):
  - **描述:**
    加载期间显示的自定义诙谐短语。提供后，CLI 将循环显示这些短语而不是默认短语。
  - **默认值:** `[]`

- **`ui.accessibility.enableLoadingPhrases`** (boolean):
  - **描述:** 在操作期间启用加载短语。
  - **默认值:** `true`
  - **需要重启:** 是

- **`ui.accessibility.screenReader`** (boolean):
  - **描述:** 以纯文本渲染输出，以便更好地支持屏幕阅读器。
  - **默认值:** `false`
  - **需要重启:** 是

#### `ide` (IDE 集成)

- **`ide.enabled`** (boolean):
  - **描述:** 启用 IDE 集成模式。
  - **默认值:** `false`
  - **需要重启:** 是

- **`ide.hasSeenNudge`** (boolean):
  - **描述:** 用户是否已看到 IDE 集成提示。
  - **默认值:** `false`

#### `privacy` (隐私)

- **`privacy.usageStatisticsEnabled`** (boolean):
  - **描述:** 启用使用情况统计信息收集。
  - **默认值:** `true`
  - **需要重启:** 是

#### `model` (模型)

- **`model.name`** (string):
  - **描述:** 用于对话的 Gemini 模型。
  - **默认值:** `undefined`

- **`model.maxSessionTurns`** (number):
  - **描述:** 会话中保留的最大用户/模型/工具轮数。-1 表示无限制。
  - **默认值:** `-1`

- **`model.summarizeToolOutput`** (object):
  - **描述:**
    启用或禁用工具输出摘要。配置每个工具的 token 预算（例如 {"run_shell_command":
    {"tokenBudget": 2000}}）。目前仅 run_shell_command 工具支持摘要。
  - **默认值:** `undefined`

- **`model.compressionThreshold`** (number):
  - **描述:** 触发上下文压缩的上下文使用比例（例如 0.2, 0.3）。
  - **默认值:** `0.5`
  - **需要重启:** 是

- **`model.skipNextSpeakerCheck`** (boolean):
  - **描述:** 跳过下一个发言者检查。
  - **默认值:** `true`

#### `modelConfigs` (模型配置)

- **`modelConfigs.aliases`** (object):
  - **描述:** 模型配置的命名预设。可用于代替模型名称，并可使用 `extends`
    属性继承其他别名。
  - **默认值:** (JSON 对象，此处省略，内容同英文版)

- **`modelConfigs.customAliases`** (object):
  - **描述:** 自定义的模型配置命名预设。这些预设与内置别名合并（并覆盖）。
  - **默认值:** `{}`

- **`modelConfigs.customOverrides`** (array):
  - **描述:** 自定义模型配置覆盖。这些覆盖与内置覆盖合并（并添加）。
  - **默认值:** `[]`

- **`modelConfigs.overrides`** (array):
  - **描述:**
    根据匹配项应用特定配置覆盖，主键为模型（或别名）。将使用最具体的匹配项。
  - **默认值:** `[]`

#### `agents` (代理)

- **`agents.overrides`** (object):
  - **描述:** 覆盖特定代理的设置，例如禁用代理、设置自定义模型配置或运行配置。
  - **默认值:** `{}`
  - **需要重启:** 是

#### `context` (上下文)

- **`context.fileName`** (string | string[]):
  - **描述:**
    要加载到内存中的上下文文件或文件的名称。接受单个字符串或字符串数组。
  - **默认值:** `undefined`

- **`context.importFormat`** (string):
  - **描述:** 导入记忆时使用的格式。
  - **默认值:** `undefined`

- **`context.discoveryMaxDirs`** (number):
  - **描述:** 搜索记忆的最大目录数。
  - **默认值:** `200`

- **`context.includeDirectories`** (array):
  - **描述:** 包含在工作区上下文中的其他目录。缺失的目录将被跳过并发出警告。
  - **默认值:** `[]`

- **`context.loadMemoryFromIncludeDirectories`** (boolean):
  - **描述:** 控制 `/memory refresh`
    如何加载 GEMINI.md 文件。为 true 时，扫描包含目录；为 false 时，仅使用当前目录。
  - **默认值:** `false`

- **`context.fileFiltering.respectGitIgnore`** (boolean):
  - **描述:** 搜索时遵守 .gitignore 文件。
  - **默认值:** `true`
  - **需要重启:** 是

- **`context.fileFiltering.respectGeminiIgnore`** (boolean):
  - **描述:** 搜索时遵守 .geminiignore 文件。
  - **默认值:** `true`
  - **需要重启:** 是

- **`context.fileFiltering.enableRecursiveFileSearch`** (boolean):
  - **描述:** 在提示词中补全 @ 引用时启用递归文件搜索功能。
  - **默认值:** `true`
  - **需要重启:** 是

- **`context.fileFiltering.enableFuzzySearch`** (boolean):
  - **描述:** 搜索文件时启用模糊搜索。
  - **默认值:** `true`
  - **需要重启:** 是

#### `tools` (工具)

- **`tools.sandbox`** (boolean | string):
  - **描述:**
    沙盒执行环境。设置为布尔值以启用或禁用沙盒，或提供沙盒配置文件的字符串路径。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`tools.shell.enableInteractiveShell`** (boolean):
  - **描述:**
    使用 node-pty 获得交互式 shell 体验。child_process 的回退仍然适用。
  - **默认值:** `true`
  - **需要重启:** 是

- **`tools.shell.pager`** (string):
  - **描述:** 用于 shell 输出的分页命令。默认为 `cat`。
  - **默认值:** `"cat"`

- **`tools.shell.showColor`** (boolean):
  - **描述:** 在 shell 输出中显示颜色。
  - **默认值:** `false`

- **`tools.shell.inactivityTimeout`** (number):
  - **描述:** 允许 shell 命令无输出的最大时间（秒）。默认为 5 分钟。
  - **默认值:** `300`

- **`tools.shell.enableShellOutputEfficiency`** (boolean):
  - **描述:** 启用 shell 输出效率优化以获得更好的性能。
  - **默认值:** `true`

- **`tools.autoAccept`** (boolean):
  - **描述:** 自动接受并执行被视为安全的工具调用（例如，只读操作）。
  - **默认值:** `false`

- **`tools.core`** (array):
  - **描述:**
    使用允许列表限制内置工具集。匹配语义反映 tools.allowed；有关可用名称，请参阅内置工具文档。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`tools.allowed`** (array):
  - **描述:** 绕过确认对话框的工具名称。对于受信任的命令很有用（例如
    ["run_shell_command(git)", "run_shell_command(npm
    test)"]）。有关匹配详情，请参阅 shell 工具命令限制。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`tools.exclude`** (array):
  - **描述:** 要从发现中排除的工具名称。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`tools.discoveryCommand`** (string):
  - **描述:** 运行工具发现的命令。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`tools.callCommand`** (string):
  - **描述:**
    定义用于调用已发现工具的自定义 shell 命令。该命令必须将工具名称作为第一个参数，从 stdin 读取 JSON 参数，并在 stdout 上发出 JSON 结果。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`tools.useRipgrep`** (boolean):
  - **描述:**
    使用 ripgrep 进行文件内容搜索，而不是回退实现。提供更快的搜索性能。
  - **默认值:** `true`

- **`tools.enableToolOutputTruncation`** (boolean):
  - **描述:** 启用大型工具输出的截断。
  - **默认值:** `true`
  - **需要重启:** 是

- **`tools.truncateToolOutputThreshold`** (number):
  - **描述:** 如果工具输出大于这么多字符，则截断它。设置为 -1 以禁用。
  - **默认值:** `4000000`
  - **需要重启:** 是

- **`tools.truncateToolOutputLines`** (number):
  - **描述:** 截断工具输出时保留的行数。
  - **默认值:** `1000`
  - **需要重启:** 是

- **`tools.disableLLMCorrection`** (boolean):
  - **描述:**
    禁用针对编辑工具的基于 LLM 的错误修正。启用后，如果未找到精确的字符串匹配项，工具将立即失败，而不是尝试自我修正。
  - **默认值:** `false`
  - **需要重启:** 是

- **`tools.enableHooks`** (boolean):
  - **描述:**
    启用 Hooks 系统实验。禁用时，无论其他设置如何，Hooks 系统都将完全停用。
  - **默认值:** `true`
  - **需要重启:** 是

#### `mcp`

- **`mcp.serverCommand`** (string):
  - **描述:** 启动 MCP 服务器的命令。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`mcp.allowed`** (array):
  - **描述:** 允许的 MCP 服务器列表。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`mcp.excluded`** (array):
  - **描述:** 排除的 MCP 服务器列表。
  - **默认值:** `undefined`
  - **需要重启:** 是

#### `useWriteTodos`

- **`useWriteTodos`** (boolean):
  - **描述:** 启用 write_todos 工具。
  - **默认值:** `true`

#### `security` (安全)

- **`security.disableYoloMode`** (boolean):
  - **描述:** 禁用 YOLO 模式，即使通过标志启用。
  - **默认值:** `false`
  - **需要重启:** 是

- **`security.enablePermanentToolApproval`** (boolean):
  - **描述:** 在工具确认对话框中启用“允许所有未来会话”选项。
  - **默认值:** `false`

- **`security.blockGitExtensions`** (boolean):
  - **描述:** 阻止从 Git 安装和加载扩展。
  - **默认值:** `false`
  - **需要重启:** 是

- **`security.folderTrust.enabled`** (boolean):
  - **描述:** 跟踪文件夹信任是否启用的设置。
  - **默认值:** `false`
  - **需要重启:** 是

- **`security.environmentVariableRedaction.allowed`** (array):
  - **描述:** 始终允许（绕过修订）的环境变量。
  - **默认值:** `[]`
  - **需要重启:** 是

- **`security.environmentVariableRedaction.blocked`** (array):
  - **描述:** 始终修订的环境变量。
  - **默认值:** `[]`
  - **需要重启:** 是

- **`security.environmentVariableRedaction.enabled`** (boolean):
  - **描述:** 启用可能包含机密的环境变量的修订。
  - **默认值:** `false`
  - **需要重启:** 是

- **`security.auth.selectedType`** (string):
  - **描述:** 当前选择的验证类型。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`security.auth.enforcedType`** (string):
  - **描述:** 必需的验证类型。如果这与选择的验证类型不匹配，将提示用户重新验证。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`security.auth.useExternal`** (boolean):
  - **描述:** 是否使用外部验证流程。
  - **默认值:** `undefined`
  - **需要重启:** 是

#### `advanced` (高级)

- **`advanced.autoConfigureMemory`** (boolean):
  - **描述:** 自动配置 Node.js 内存限制。
  - **默认值:** `false`
  - **需要重启:** 是

- **`advanced.dnsResolutionOrder`** (string):
  - **描述:** DNS 解析顺序。
  - **默认值:** `undefined`
  - **需要重启:** 是

- **`advanced.excludedEnvVars`** (array):
  - **描述:** 从项目上下文中排除的环境变量。
  - **默认值:**

    ```json
    ["DEBUG", "DEBUG_MODE"]
    ```

- **`advanced.bugCommand`** (object):
  - **描述:** 错误报告命令的配置。
  - **默认值:** `undefined`

#### `experimental` (实验性)

- **`experimental.enableAgents`** (boolean):
  - **描述:** 启用本地和远程子代理。警告：实验性功能，对子代理使用 YOLO 模式。
  - **默认值:** `false`
  - **需要重启:** 是

- **`experimental.extensionManagement`** (boolean):
  - **描述:** 启用扩展管理功能。
  - **默认值:** `true`
  - **需要重启:** 是

- **`experimental.extensionConfig`** (boolean):
  - **描述:** 启用请求和获取扩展设置。
  - **默认值:** `false`
  - **需要重启:** 是

- **`experimental.extensionReloading`** (boolean):
  - **描述:** 启用 CLI 会话内的扩展加载/卸载。
  - **默认值:** `false`
  - **需要重启:** 是

- **`experimental.jitContext`** (boolean):
  - **描述:** 启用即时 (JIT) 上下文加载。
  - **默认值:** `false`
  - **需要重启:** 是

- **`experimental.skills`** (boolean):
  - **描述:** 启用 Agent 技能（实验性）。
  - **默认值:** `false`
  - **需要重启:** 是

- **`experimental.codebaseInvestigatorSettings.enabled`** (boolean):
  - **描述:** 启用代码库调查员 (Codebase Investigator) 代理。
  - **默认值:** `true`
  - **需要重启:** 是

- **`experimental.codebaseInvestigatorSettings.maxNumTurns`** (number):
  - **描述:** 代码库调查员代理的最大轮数。
  - **默认值:** `10`
  - **需要重启:** 是

- **`experimental.codebaseInvestigatorSettings.maxTimeMinutes`** (number):
  - **描述:** 代码库调查员代理的最长时间（分钟）。
  - **默认值:** `3`
  - **需要重启:** 是

- **`experimental.codebaseInvestigatorSettings.thinkingBudget`** (number):
  - **描述:** 代码库调查员代理的思考预算。
  - **默认值:** `8192`
  - **需要重启:** 是

- **`experimental.codebaseInvestigatorSettings.model`** (string):
  - **描述:** 用于代码库调查员代理的模型。
  - **默认值:** `"auto"`
  - **需要重启:** 是

- **`experimental.useOSC52Paste`** (boolean):
  - **描述:** 使用 OSC 52 序列进行粘贴，而不是 clipboardy（对远程会话有用）。
  - **默认值:** `false`

- **`experimental.cliHelpAgentSettings.enabled`** (boolean):
  - **描述:** 启用 CLI 帮助代理。
  - **默认值:** `true`
  - **需要重启:** 是

- **`experimental.plan`** (boolean):
  - **描述:** 启用规划功能（规划模式和工具）。
  - **默认值:** `false`
  - **需要重启:** 是

#### `skills` (技能)

- **`skills.disabled`** (array):
  - **描述:** 禁用的技能列表。
  - **默认值:** `[]`
  - **需要重启:** 是

#### `hooks` (挂钩)

- **`hooks.enabled`** (boolean):
  - **描述:** Hooks 系统的规范开关。禁用时，将不会执行任何 Hooks。
  - **默认值:** `false`

- **`hooks.disabled`** (array):
  - **描述:**
    应禁用的 Hook 名称（命令）列表。即使配置了，此列表中的 Hooks 也不会执行。
  - **默认值:** `[]`

- **`hooks.notifications`** (boolean):
  - **描述:** 在 Hooks 执行时显示视觉指示器。
  - **默认值:** `true`

- **`hooks.BeforeTool`** (array):
  - **描述:** 在工具执行之前执行的 Hooks。可以拦截、验证或修改工具调用。
  - **默认值:** `[]`

- **`hooks.AfterTool`** (array):
  - **描述:** 在工具执行之后执行的 Hooks。可以处理结果、记录输出或触发后续操作。
  - **默认值:** `[]`

- **`hooks.BeforeAgent`** (array):
  - **描述:** 在代理循环开始之前执行的 Hooks。可以设置上下文或初始化资源。
  - **默认值:** `[]`

- **`hooks.AfterAgent`** (array):
  - **描述:** 在代理循环完成之后执行的 Hooks。可以执行清理或总结结果。
  - **默认值:** `[]`

- **`hooks.Notification`** (array):
  - **描述:**
    在通知事件（错误、警告、信息）上执行的 Hooks。可以记录或针对特定条件发出警报。
  - **默认值:** `[]`

- **`hooks.SessionStart`** (array):
  - **描述:** 在会话开始时执行的 Hooks。可以初始化特定于会话的资源或状态。
  - **默认值:** `[]`

- **`hooks.SessionEnd`** (array):
  - **描述:** 在会话结束时执行的 Hooks。可以执行清理或持久化会话数据。
  - **默认值:** `[]`

- **`hooks.PreCompress`** (array):
  - **描述:** 在聊天记录压缩之前执行的 Hooks。可以在压缩之前备份或分析对话。
  - **默认值:** `[]`

- **`hooks.BeforeModel`** (array):
  - **描述:**
    在 LLM 请求之前执行的 Hooks。可以修改提示词、注入上下文或控制模型参数。
  - **默认值:** `[]`

- **`hooks.AfterModel`** (array):
  - **描述:** 在 LLM 响应之后执行的 Hooks。可以处理输出、提取信息或记录交互。
  - **默认值:** `[]`

- **`hooks.BeforeToolSelection`** (array):
  - **描述:** 在工具选择之前执行的 Hooks。可以动态过滤或优先排序可用工具。
  - **默认值:** `[]`

#### `admin` (管理)

- **`admin.secureModeEnabled`** (boolean):
  - **描述:** 如果为 true，则禁止使用 yolo 模式。
  - **默认值:** `false`

- **`admin.extensions.enabled`** (boolean):
  - **描述:** 如果为 false，则禁止安装或使用扩展。
  - **默认值:** `true`

- **`admin.mcp.enabled`** (boolean):
  - **描述:** 如果为 false，则禁止使用 MCP 服务器。
  - **默认值:** `true`

- **`admin.skills.enabled`** (boolean):
  - **描述:** 如果为 false，则禁止使用 Agent 技能。
  - **默认值:** `true`
  <!-- SETTINGS-AUTOGEN:END -->

#### `mcpServers`

配置到一个或多个模型上下文协议 (MCP) 服务器的连接，以发现和使用自定义工具。Gemini
CLI 尝试连接到每个配置的 MCP 服务器以发现可用工具。如果多个 MCP 服务器暴露了同名工具，工具名称将以您在配置中定义的服务器别名作为前缀（例如
`serverAlias__actualToolName`），以避免冲突。请注意，为了兼容性，系统可能会从 MCP 工具定义中剥离某些 schema 属性。必须提供
`command`、`url` 或 `httpUrl` 中的至少一个。如果指定了多个，优先级顺序为
`httpUrl`，然后是 `url`，然后是 `command`。

- **`mcpServers.<SERVER_NAME>`** (object): 命名服务器的服务器参数。
  - `command` (string, optional): 通过标准 I/O 启动 MCP 服务器的命令。
  - `args` (array of strings, optional): 传递给命令的参数。
  - `env` (object, optional): 为服务器进程设置的环境变量。
  - `cwd` (string, optional): 启动服务器的工作目录。
  - `url` (string, optional): 使用 Server-Sent Events
    (SSE) 进行通信的 MCP 服务器的 URL。
  - `httpUrl` (string,
    optional): 使用可流式传输 HTTP 进行通信的 MCP 服务器的 URL。
  - `headers` (object, optional): 发送给 `url` 或 `httpUrl`
    的请求的 HTTP 标头映射。
  - `timeout` (number, optional): 请求此 MCP 服务器的超时时间（毫秒）。
  - `trust` (boolean, optional): 信任此服务器并绕过所有工具调用确认。
  - `description` (string, optional): 服务器的简短描述，可能用于显示目的。
  - `includeTools` (array of strings,
    optional): 要从此 MCP 服务器包含的工具名称列表。指定后，仅此处列出的工具可从此服务器获得（允许列表行为）。如果未指定，默认情况下启用服务器中的所有工具。
  - `excludeTools` (array of strings,
    optional): 要从此 MCP 服务器排除的工具名称列表。此处列出的工具即使由服务器暴露，也不会对模型可用。**注意：**
    `excludeTools` 优先于 `includeTools` - 如果工具同在两个列表中，它将被排除。

#### `telemetry` (遥测)

配置 Gemini CLI 的日志记录和指标收集。有关更多信息，请参阅
[遥测](../cli/telemetry.md)。

- **属性：**
  - **`enabled`** (boolean): 是否启用遥测。
  - **`target`** (string): 收集的遥测数据的目的地。支持的值为 `local` 和 `gcp`。
  - **`otlpEndpoint`** (string): OTLP 导出器的端点。
  - **`otlpProtocol`** (string): OTLP 导出器的协议（`grpc` 或 `http`）。
  - **`logPrompts`** (boolean): 是否在日志中包含用户提示词的内容。
  - **`outfile`** (string): 当 `target` 为 `local` 时写入遥测数据的文件。
  - **`useCollector`** (boolean): 是否使用外部 OTLP 收集器。

### `settings.json` 示例

这是 v0.3.0 新增的具有嵌套结构的 `settings.json` 文件示例：

```json
{
  "general": {
    "vimMode": true,
    "preferredEditor": "code",
    "sessionRetention": {
      "enabled": true,
      "maxAge": "30d",
      "maxCount": 100
    }
  },
  "ui": {
    "theme": "GitHub",
    "hideBanner": true,
    "hideTips": false,
    "customWittyPhrases": [
      "You forget a thousand things every day. Make sure this is one of ’em",
      "Connecting to AGI"
    ]
  },
  "tools": {
    "sandbox": "docker",
    "discoveryCommand": "bin/get_tools",
    "callCommand": "bin/call_tool",
    "exclude": ["write_file"]
  },
  "mcpServers": {
    "mainServer": {
      "command": "bin/mcp_server.py"
    },
    "anotherServer": {
      "command": "node",
      "args": ["mcp_server.js", "--verbose"]
    }
  },
  "telemetry": {
    "enabled": true,
    "target": "local",
    "otlpEndpoint": "http://localhost:4317",
    "logPrompts": true
  },
  "privacy": {
    "usageStatisticsEnabled": true
  },
  "model": {
    "name": "gemini-1.5-pro-latest",
    "maxSessionTurns": 10,
    "summarizeToolOutput": {
      "run_shell_command": {
        "tokenBudget": 100
      }
    }
  },
  "context": {
    "fileName": ["CONTEXT.md", "GEMINI.md"],
    "includeDirectories": ["path/to/dir1", "~/path/to/dir2", "../path/to/dir3"],
    "loadFromIncludeDirectories": true,
    "fileFiltering": {
      "respectGitIgnore": false
    }
  },
  "advanced": {
    "excludedEnvVars": ["DEBUG", "DEBUG_MODE", "NODE_ENV"]
  }
}
```

## Shell 历史记录

CLI 会保留您运行的 shell 命令的历史记录。为了避免不同项目之间的冲突，此历史记录存储在用户主文件夹内的项目特定目录中。

- **位置：** `~/.gemini/tmp/<project_hash>/shell_history`
  - `<project_hash>` 是根据您的项目根路径生成的唯一标识符。
  - 历史记录存储在名为 `shell_history` 的文件中。

## 环境变量和 `.env` 文件

环境变量是配置应用程序的常用方法，特别是对于敏感信息（如 API 密钥）或环境之间可能更改的设置。有关验证设置，请参阅
[验证文档](./authentication.md)，其中涵盖了所有可用的验证方法。

CLI 自动从 `.env` 文件加载环境变量。加载顺序为：

1.  当前工作目录中的 `.env` 文件。
2.  如果未找到，它会在父目录中向上搜索，直到找到 `.env` 文件或到达项目根目录（由
    `.git` 文件夹标识）或主目录。
3.  如果仍未找到，它会查找 `~/.env`（在用户的主目录中）。

**环境变量排除：** 默认情况下，一些环境变量（如 `DEBUG` 和
`DEBUG_MODE`）会自动从项目 `.env`
文件加载中排除，以防止干扰 gemini-cli 行为。来自 `.gemini/.env`
文件的变量永远不会被排除。您可以在 `settings.json` 文件中使用
`advanced.excludedEnvVars` 设置自定义此行为。

- **`GEMINI_API_KEY`**:
  - 您的 Gemini API 密钥。
  - 几种可用 [验证方法](./authentication.md) 之一。
  - 在您的 shell 配置文件（例如 `~/.bashrc`, `~/.zshrc`）或 `.env`
    文件中设置此项。
- **`GEMINI_MODEL`**:
  - 指定要使用的默认 Gemini 模型。
  - 覆盖硬编码的默认值
  - 示例: `export GEMINI_MODEL="gemini-2.5-flash"`
- **`GOOGLE_API_KEY`**:
  - 您的 Google Cloud API 密钥。
  - 在快速模式下使用 Vertex AI 所必需。
  - 确保您拥有必要的权限。
  - 示例: `export GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"`。
- **`GOOGLE_CLOUD_PROJECT`**:
  - 您的 Google Cloud 项目 ID。
  - 使用 Code Assist 或 Vertex AI 所必需。
  - 如果使用 Vertex AI，请确保您在此项目中拥有必要的权限。
  - **Cloud Shell 说明：** 在 Cloud Shell 环境中运行时，此变量默认为分配给 Cloud
    Shell 用户的特殊项目。如果您在 Cloud Shell 的全局环境中设置了
    `GOOGLE_CLOUD_PROJECT`，它将被此默认值覆盖。要在 Cloud
    Shell 中使用不同的项目，您必须在 `.env` 文件中定义 `GOOGLE_CLOUD_PROJECT`。
  - 示例: `export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"`。
- **`GOOGLE_APPLICATION_CREDENTIALS`** (string):
  - **描述:** 您的 Google 应用程序凭据 JSON 文件的路径。
  - **示例:**
    `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"`
- **`OTLP_GOOGLE_CLOUD_PROJECT`**:
  - 用于 Google Cloud 中遥测的 Google Cloud 项目 ID。
  - 示例: `export OTLP_GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"`。
- **`GEMINI_TELEMETRY_ENABLED`**:
  - 设置为 `true` 或 `1` 以启用遥测。任何其他值都被视为禁用它。
  - 覆盖 `telemetry.enabled` 设置。
- **`GEMINI_TELEMETRY_TARGET`**:
  - 设置遥测目标（`local` 或 `gcp`）。
  - 覆盖 `telemetry.target` 设置。
- **`GEMINI_TELEMETRY_OTLP_ENDPOINT`**:
  - 设置遥测的 OTLP 端点。
  - 覆盖 `telemetry.otlpEndpoint` 设置。
- **`GEMINI_TELEMETRY_OTLP_PROTOCOL`**:
  - 设置 OTLP 协议（`grpc` 或 `http`）。
  - 覆盖 `telemetry.otlpProtocol` 设置。
- **`GEMINI_TELEMETRY_LOG_PROMPTS`**:
  - 设置为 `true` 或 `1`
    以启用或禁用用户提示词的日志记录。任何其他值都被视为禁用它。
  - 覆盖 `telemetry.logPrompts` 设置。
- **`GEMINI_TELEMETRY_OUTFILE`**:
  - 设置当目标为 `local` 时写入遥测的文件路径。
  - 覆盖 `telemetry.outfile` 设置。
- **`GEMINI_TELEMETRY_USE_COLLECTOR`**:
  - 设置为 `true` 或 `1`
    以启用或禁用使用外部 OTLP 收集器。任何其他值都被视为禁用它。
  - 覆盖 `telemetry.useCollector` 设置。
- **`GOOGLE_CLOUD_LOCATION`**:
  - 您的 Google Cloud 项目位置（例如 us-central1）。
  - 在非快速模式下使用 Vertex AI 所必需。
  - 示例: `export GOOGLE_CLOUD_LOCATION="YOUR_PROJECT_LOCATION"`。
- **`GEMINI_SANDBOX`**:
  - `settings.json` 中 `sandbox` 设置的替代方案。
  - 接受 `true`, `false`, `docker`, `podman`, 或自定义命令字符串。
- **`GEMINI_SYSTEM_MD`**:
  - 用 Markdown 文件中的内容替换内置系统提示词。
  - `true`/`1`: 使用项目默认路径 `./.gemini/system.md`。
  - 任何其他字符串：视为路径（支持相对/绝对路径，`~` 展开）。
  - `false`/`0` 或未设置：使用内置提示词。请参阅
    [系统提示词覆盖](../cli/system-prompt.md)。
- **`GEMINI_WRITE_SYSTEM_MD`**:
  - 将当前内置系统提示词写入文件以供审查。
  - `true`/`1`: 写入 `./.gemini/system.md`。否则将值视为路径。
  - 设置此项运行一次 CLI 以生成文件。
- **`SEATBELT_PROFILE`** (macOS 特有):
  - 切换 macOS 上的 Seatbelt (`sandbox-exec`) 配置文件。
  - `permissive-open`: (默认) 限制对项目文件夹的写入（以及少数其他文件夹，见
    `packages/cli/src/utils/sandbox-macos-permissive-open.sb`），但允许其他操作。
  - `strict`: 使用严格的配置文件，默认拒绝操作。
  - `<profile_name>`: 使用自定义配置文件。要定义自定义配置文件，请在项目的
    `.gemini/` 目录中创建一个名为 `sandbox-macos-<profile_name>.sb` 的文件（例如
    `my-project/.gemini/sandbox-macos-custom.sb`）。
- **`DEBUG` 或 `DEBUG_MODE`** (通常由底层库或 CLI 本身使用):
  - 设置为 `true` 或 `1` 以启用详细的调试日志记录，这对故障排除很有帮助。
  - **注意：** 默认情况下，这些变量会自动从项目 `.env`
    文件中排除，以防止干扰 gemini-cli 行为。如果需要专门为 gemini-cli 设置这些变量，请使用
    `.gemini/.env` 文件。
- **`NO_COLOR`**:
  - 设置为任何值以禁用 CLI 中的所有颜色输出。
- **`CLI_TITLE`**:
  - 设置为一个字符串以自定义 CLI 的标题。
- **`CODE_ASSIST_ENDPOINT`**:
  - 指定代码辅助服务器的端点。
  - 这对于开发和测试很有用。

### 环境变量修订

为了防止意外泄露敏感信息，Gemini
CLI 在执行工具（如 shell 命令）时会自动从环境变量中修订潜在的机密。这种“尽力而为”的修订适用于从系统继承或从
`.env` 文件加载的变量。

**默认修订规则：**

- **按名称：** 如果变量名称包含敏感词（如 `TOKEN`, `SECRET`, `PASSWORD`, `KEY`,
  `AUTH`, `CREDENTIAL`, `PRIVATE`, 或 `CERT`），则将其修订。
- **按值：** 如果变量值匹配已知的机密模式，则将其修订，例如：
  - 私钥 (RSA, OpenSSH, PGP 等)
  - 证书
  - 包含凭据的 URL
  - API 密钥和令牌 (GitHub, Google, AWS, Stripe, Slack 等)
- **特定黑名单：** 某些变量（如 `CLIENT_ID`, `DB_URI`, `DATABASE_URL`, 和
  `CONNECTION_STRING`）默认情况下始终被修订。

**白名单（永不修订）：**

- 常见的系统变量（例如 `PATH`, `HOME`, `USER`, `SHELL`, `TERM`, `LANG`）。
- 以 `GEMINI_CLI_` 开头的变量。
- GitHub Action 特定变量。

**配置：**

您可以在 `settings.json` 文件中自定义此行为：

- **`security.allowedEnvironmentVariables`**: 即使匹配敏感模式，也 _永不_
  修订的变量名称列表。
- **`security.blockedEnvironmentVariables`**: 即使不匹配敏感模式，也 _始终_
  修订的变量名称列表。

```json
{
  "security": {
    "allowedEnvironmentVariables": ["MY_PUBLIC_KEY", "NOT_A_SECRET_TOKEN"],
    "blockedEnvironmentVariables": ["INTERNAL_IP_ADDRESS"]
  }
}
```

## 命令行参数

运行时直接传递的参数可以覆盖该特定会话的其他配置。

- **`--model <model_name>`** (**`-m <model_name>`**):
  - 指定此会话使用的 Gemini 模型。
  - 示例: `npm start -- --model gemini-1.5-pro-latest`
- **`--prompt <your_prompt>`** (**`-p <your_prompt>`**):
  - 用于直接向命令传递提示词。这会以非交互模式调用 Gemini CLI。
  - 有关脚本示例，请使用 `--output-format json` 标志以获得结构化输出。
- **`--prompt-interactive <your_prompt>`** (**`-i <your_prompt>`**):
  - 以提供的提示词作为初始输入启动交互式会话。
  - 提示词在交互式会话中处理，而不是在其之前。
  - 从 stdin 管道输入时不能使用。
  - 示例: `gemini -i "explain this code"`
- **`--output-format <format>`**:
  - **描述:** 指定非交互模式下 CLI 输出的格式。
  - **值:**
    - `text`: (默认) 标准的人类可读输出。
    - `json`: 机器可读的 JSON 输出。
    - `stream-json`: 发出实时事件的流式 JSON 输出。
  - **注意：** 对于结构化输出和脚本编写，请使用 `--output-format json` 或
    `--output-format stream-json` 标志。
- **`--sandbox`** (**`-s`**):
  - 为此会话启用沙盒模式。
- **`--debug`** (**`-d`**):
  - 为此会话启用调试模式，提供更详细的输出。按 F12 打开调试控制台以查看更多日志。

- **`--help`** (或 **`-h`**):
  - 显示有关命令行参数的帮助信息。
- **`--yolo`**:
  - 启用 YOLO 模式，自动批准所有工具调用。
- **`--approval-mode <mode>`**:
  - 设置工具调用的批准模式。可用模式：
    - `default`: 每次工具调用都提示批准（默认行为）
    - `auto_edit`: 自动批准编辑工具（replace, write_file），同时提示其他工具
    - `yolo`: 自动批准所有工具调用（等同于 `--yolo`）
    - `plan`: 工具调用的只读模式（需要启用实验性规划功能）。
      > **注意：** 此模式目前正在开发中，尚未完全发挥作用。
  - 不能与 `--yolo` 一起使用。请使用 `--approval-mode=yolo` 代替 `--yolo`
    以获得新的统一方法。
  - 示例: `gemini --approval-mode auto_edit`
- **`--allowed-tools <tool1,tool2,...>`**:
  - 一个逗号分隔的工具名称列表，这些工具将绕过确认对话框。
  - 示例: `gemini --allowed-tools "ShellTool(git status)"`
- **`--extensions <extension_name ...>`** (**`-e <extension_name ...>`**):
  - 指定会话使用的扩展列表。如果未提供，则使用所有可用扩展。
  - 使用特殊术语 `gemini -e none` 禁用所有扩展。
  - 示例: `gemini -e my-extension -e my-other-extension`
- **`--list-extensions`** (**`-l`**):
  - 列出所有可用扩展并退出。
- **`--resume [session_id]`** (**`-r [session_id]`**):
  - 恢复之前的聊天会话。使用 "latest" 表示最近的会话，提供会话索引号，或提供完整的会话 UUID。
  - 如果未提供 session_id，默认为 "latest"。
  - 示例: `gemini --resume 5` 或 `gemini --resume latest` 或
    `gemini --resume a1b2c3d4-e5f6-7890-abcd-ef1234567890` 或 `gemini --resume`
  - 有关更多详细信息，请参阅 [会话管理](../cli/session-management.md)。
- **`--list-sessions`**:
  - 列出当前项目的所有可用聊天会话并退出。
  - 显示会话索引、日期、消息计数和第一条用户消息的预览。
  - 示例: `gemini --list-sessions`
- **`--delete-session <identifier>`**:
  - 按索引号或完整会话 UUID 删除特定聊天会话。
  - 先使用 `--list-sessions` 查看可用会话、它们的索引和 UUID。
  - 示例: `gemini --delete-session 3` 或
    `gemini --delete-session a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **`--include-directories <dir1,dir2,...>`**:
  - 在工作区中包含其他目录以支持多目录。
  - 可以多次指定或作为逗号分隔的值。
  - 最多可以添加 5 个目录。
  - 示例: `--include-directories /path/to/project1,/path/to/project2` 或
    `--include-directories /path/to/project1 --include-directories /path/to/project2`
- **`--screen-reader`**:
  - 启用屏幕阅读器模式，调整 TUI 以更好地兼容屏幕阅读器。
- **`--version`**:
  - 显示 CLI 的版本。
- **`--experimental-acp`**:
  - 以 ACP 模式启动代理。
- **`--allowed-mcp-server-names`**:
  - 允许的 MCP 服务器名称。
- **`--fake-responses`**:
  - 用于测试的伪造模型响应文件的路径。
- **`--record-responses`**:
  - 用于测试的记录模型响应的文件路径。

## 上下文文件（分层指令上下文）

虽然不严格属于 CLI 的 _行为_ 配置，但上下文文件（默认为 `GEMINI.md`，但可通过
`context.fileName` 设置进行配置）对于配置提供给 Gemini 模型的
_指令上下文_（也称为“记忆”）至关重要。这一强大功能允许您为 AI 提供特定于项目的说明、编码风格指南或任何相关背景信息，使其响应更加符合您的需求。CLI 包含 UI 元素，例如页脚中显示已加载上下文文件数量的指示器，让您随时了解活动上下文。

- **目的：**
  这些 Markdown 文件包含您希望 Gemini 模型在交互期间了解的说明、指南或上下文。系统设计为分层管理此指令上下文。

### 上下文文件内容示例（例如 `GEMINI.md`）

这是一个 TypeScript 项目根目录下上下文文件内容的概念示例：

```markdown
# Project: My Awesome TypeScript Library

## General Instructions:

- When generating new TypeScript code, please follow the existing coding style.
- Ensure all new functions and classes have JSDoc comments.
- Prefer functional programming paradigms where appropriate.
- All code should be compatible with TypeScript 5.0 and Node.js 20+.

## Coding Style:

- Use 2 spaces for indentation.
- Interface names should be prefixed with `I` (e.g., `IUserService`).
- Private class members should be prefixed with an underscore (`_`).
- Always use strict equality (`===` and `!==`).

## Specific Component: `src/api/client.ts`

- This file handles all outbound API requests.
- When adding new API call functions, ensure they include robust error handling
  and logging.
- Use the existing `fetchWithRetry` utility for all GET requests.

## Regarding Dependencies:

- Avoid introducing new external dependencies unless absolutely necessary.
- If a new dependency is required, please state the reason.
```

此示例展示了如何提供通用项目上下文、特定编码约定，甚至关于特定文件或组件的注释。您的上下文文件越相关、越精确，AI 就能越好地协助您。强烈建议使用特定于项目的上下文文件来建立约定和上下文。

- **分层加载和优先级：** CLI 通过从多个位置加载上下文文件（例如
  `GEMINI.md`）来实现复杂的分层记忆系统。此列表中较低位置（更具体）的文件内容通常会覆盖或补充较高位置（更通用）的文件内容。可以使用
  `/memory show` 命令检查确切的拼接顺序和最终上下文。典型的加载顺序是：
  1.  **全局上下文文件：**
      - 位置：`~/.gemini/<configured-context-filename>`（例如，用户主目录中的
        `~/.gemini/GEMINI.md`）。
      - 范围：为您的所有项目提供默认说明。
  2.  **项目根目录和祖先上下文文件：**
      - 位置：CLI 在当前工作目录中搜索配置的上下文文件，然后在每个父目录中向上搜索，直到项目根目录（由
        `.git` 文件夹标识）或主目录。
      - 范围：提供与整个项目或其重要部分相关的上下文。
  3.  **子目录上下文文件（上下文/本地）：**
      - 位置：CLI 还会扫描当前工作目录 _下方_
        的子目录中的配置的上下文文件（遵守常见的忽略模式，如 `node_modules`,
        `.git` 等）。此搜索的广度默认为限制为 200 个目录，但可以在
        `settings.json` 文件中使用 `context.discoveryMaxDirs` 设置进行配置。
      - 范围：允许针对项目的特定组件、模块或子部分提供高度具体的说明。
- **拼接和 UI 指示：**
  所有找到的上下文文件的内容被拼接在一起（带有指示其来源和路径的分隔符），并作为系统提示词的一部分提供给 Gemini 模型。CLI 页脚显示已加载上下文文件的计数，为您提供有关活动指令上下文的快速视觉提示。
- **导入内容：** 您可以使用 `@path/to/file.md`
  语法通过导入其他 Markdown 文件来模块化您的上下文文件。有关更多详细信息，请参阅
  [内存导入处理器文档](../core/memport.md)。
- **记忆管理命令：**
  - 使用 `/memory refresh`
    强制从所有配置的位置重新扫描和加载所有上下文文件。这将更新 AI 的指令上下文。
  - 使用 `/memory show`
    显示当前加载的组合指令上下文，允许您验证 AI 正在使用的层级和内容。
  - 请参阅 [命令文档](../cli/commands.md#memory) 了解 `/memory`
    命令及其子命令（`show` 和 `refresh`）的完整详情。

通过了解并利用这些配置层级和上下文文件的分层性质，您可以有效地管理 AI 的记忆，并根据您的特定需求和项目定制 Gemini
CLI 的响应。

## 沙盒

Gemini
CLI 可以在沙盒环境中执行可能不安全的操作（如 shell 命令和文件修改）以保护您的系统。

沙盒默认禁用，但您可以通过几种方式启用它：

- 使用 `--sandbox` 或 `-s` 标志。
- 设置 `GEMINI_SANDBOX` 环境变量。
- 默认情况下，使用 `--yolo` 或 `--approval-mode=yolo` 时会启用沙盒。

默认情况下，它使用预构建的 `gemini-cli-sandbox` Docker 镜像。

对于特定于项目的沙盒需求，您可以在项目根目录的 `.gemini/sandbox.Dockerfile`
中创建自定义 Dockerfile。此 Dockerfile 可以基于基本沙盒镜像：

```dockerfile
FROM gemini-cli-sandbox

# 在此处添加您的自定义依赖项或配置
# 例如：
# RUN apt-get update && apt-get install -y some-package
# COPY ./my-config /app/my-config
```

当存在 `.gemini/sandbox.Dockerfile` 时，您可以在运行 Gemini CLI 时使用
`BUILD_SANDBOX` 环境变量自动构建自定义沙盒镜像：

```bash
BUILD_SANDBOX=1 gemini -s
```

## 使用情况统计

为了帮助我们改进 Gemini
CLI，我们收集匿名的使用统计数据。这些数据有助于我们了解 CLI 的使用方式，识别常见问题并确定新功能的优先级。

**我们收集什么：**

- **工具调用：**
  我们记录调用的工具名称、它们是成功还是失败以及执行所需的时间。我们不收集传递给工具的参数或工具返回的任何数据。
- **API 请求：**
  我们记录每个请求使用的 Gemini 模型、请求的持续时间以及是否成功。我们不收集提示词的内容或响应。
- **会话信息：** 我们收集有关 CLI 配置的信息，例如启用的工具和批准模式。

**我们不收集什么：**

- **个人身份信息 (PII)：**
  我们不收集任何个人信息，例如您的姓名、电子邮件地址或 API 密钥。
- **提示词和响应内容：** 我们不记录您的提示词内容或 Gemini 模型的响应。
- **文件内容：** 我们不记录 CLI 读取或写入的任何文件的内容。

**如何选择退出：**

您可以随时通过在 `settings.json` 文件的 `privacy` 类别下将
`usageStatisticsEnabled` 属性设置为 `false` 来选择退出使用情况统计信息收集：

```json
{
  "privacy": {
    "usageStatisticsEnabled": false
  }
}
```
