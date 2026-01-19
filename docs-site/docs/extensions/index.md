# Gemini CLI 扩展

_本文档已更新至 v0.4.0 版本。_

Gemini
CLI 扩展将提示词、MCP 服务器、Agent 技能和自定义命令打包成一种熟悉且用户友好的格式。通过扩展，您可以扩展 Gemini
CLI 的功能并与他人共享这些功能。它们旨在易于安装和共享。

要查看扩展示例，您可以浏览
[Gemini CLI 扩展库](https://geminicli.com/extensions/browse/)。

请参阅 [入门文档](getting-started-extensions.md) 以获取创建第一个扩展的指南。

请参阅 [发布文档](extension-releasing.md) 以获取有关设置 GitHub
Releases 的高级指南。

## 扩展管理

我们使用 `gemini extensions` 命令提供了一套扩展管理工具。

请注意，CLI 内部不支持这些命令，尽管您可以使用 `/extensions list`
子命令列出已安装的扩展。

请注意，所有这些命令只有在重新启动后才会反映在活动的 CLI 会话中。

### 安装扩展

您可以使用 `gemini extensions install` 通过 GitHub URL 或本地路径安装扩展。

请注意，我们会创建已安装扩展的副本，因此您需要运行 `gemini extensions update`
以提取本地定义的扩展和 GitHub 上的扩展的更改。

注意：如果您要从 GitHub 安装扩展，则需要在计算机上安装 `git`。请参阅
[git 安装说明](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)
获取帮助。

```
gemini extensions install <source> [--ref <ref>] [--auto-update] [--pre-release] [--consent]
```

- `<source>`: 要安装的扩展的 GitHub URL 或本地路径。
- `--ref`: 要安装的 git ref。
- `--auto-update`: 为此扩展启用自动更新。
- `--pre-release`: 为此扩展启用预发布版本。
- `--consent`: 确认安装扩展的安全风险并跳过确认提示。

### 卸载扩展

要卸载一个或多个扩展，请运行 `gemini extensions uninstall <name...>`：

```
gemini extensions uninstall gemini-cli-security gemini-cli-another-extension
```

### 禁用扩展

默认情况下，扩展在所有工作区中启用。您可以完全禁用扩展或针对特定工作区禁用扩展。

```
gemini extensions disable <name> [--scope <scope>]
```

- `<name>`: 要禁用的扩展的名称。
- `--scope`: 禁用扩展的范围（`user` 或 `workspace`）。

### 启用扩展

您可以使用 `gemini extensions enable <name>` 启用扩展。您还可以使用
`gemini extensions enable <name> --scope=workspace`
在该工作区内为特定工作区启用扩展。

```
gemini extensions enable <name> [--scope <scope>]
```

- `<name>`: 要启用的扩展的名称。
- `--scope`: 启用扩展的范围（`user` 或 `workspace`）。

### 更新扩展

对于从本地路径或 git 仓库安装的扩展，您可以使用
`gemini extensions update <name>` 显式更新到最新版本（反映在
`gemini-extension.json` `version` 字段中）。

您可以使用以下命令更新所有扩展：

```
gemini extensions update --all
```

### 创建样板扩展

我们提供了几个扩展示例 `context`, `custom-commands`, `exclude-tools` 和
`mcp-server`。您可以
[在此处](https://github.com/google-gemini/gemini-cli/tree/main/packages/cli/src/commands/extensions/examples)
查看这些示例。

要使用您选择的类型将这些示例之一复制到开发目录中，请运行：

```
gemini extensions new <path> [template]
```

- `<path>`: 创建扩展的路径。
- `[template]`: 要使用的样板模板。

### 链接本地扩展

`gemini extensions link` 命令将创建一个从扩展安装目录到开发路径的符号链接。

这很有用，这样您就不必每次进行想要测试的更改时都运行
`gemini extensions update`。

```
gemini extensions link <path>
```

- `<path>`: 要链接的扩展的路径。

## 工作原理

启动时，Gemini CLI 在 `<home>/.gemini/extensions` 中查找扩展。

扩展作为包含 `gemini-extension.json` 文件的目录存在。例如：

`<home>/.gemini/extensions/my-extension/gemini-extension.json`

### `gemini-extension.json`

`gemini-extension.json` 文件包含扩展的配置。该文件具有以下结构：

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "mcpServers": {
    "my-server": {
      "command": "node my-server.js"
    }
  },
  "contextFileName": "GEMINI.md",
  "excludeTools": ["run_shell_command"]
}
```

- `name`: 扩展的名称。这用于唯一标识扩展，并在扩展命令与用户或项目命令同名时用于冲突解决。名称应为小写字母或数字，并使用破折号代替下划线或空格。这是用户在 CLI 中引用您的扩展的方式。请注意，我们希望此名称与扩展目录名称匹配。
- `version`: 扩展的版本。
- `mcpServers`:
  MCP 服务器到设置的映射。键是服务器的名称，值是服务器配置。这些服务器将在启动时加载，就像
  [`settings.json` 文件](../get-started/configuration.md)
  中的 MCP 服务器设置一样。如果扩展和 `settings.json`
  文件都设置了同名的 MCP 服务器，则 `settings.json` 文件中定义的服务器优先。
  - 请注意，支持除 `trust` 之外的所有 MCP 服务器配置选项。
- `contextFileName`: 包含扩展上下文的文件名。这将用于从扩展目录加载上下文。如果未使用此属性但扩展目录中存在
  `GEMINI.md` 文件，则将加载该文件。
- `excludeTools`: 要从模型中排除的工具名称数组。您还可以为支持它的工具指定特定于命令的限制，例如
  `run_shell_command`
  工具。例如，`"excludeTools": ["run_shell_command(rm -rf)"]` 将阻止 `rm -rf`
  命令。请注意，这与 MCP 服务器 `excludeTools`
  功能不同，后者可以在 MCP 服务器配置中列出。

Gemini
CLI 启动时，它会加载所有扩展并合并其配置。如果有任何冲突，工作区配置优先。

### 设置

_注意：这是一个实验性功能。我们尚不建议扩展作者将设置作为其核心流程的一部分引入。_

扩展可以定义用户在安装时提示提供的设置。这对于扩展运行所需的 API 密钥、URL 或其他配置非常有用。

要定义设置，请将 `settings` 数组添加到您的 `gemini-extension.json`
文件中。数组中的每个对象都应具有以下属性：

- `name`: 设置的用户友好名称。
- `description`: 设置的描述及其用途。
- `envVar`: 设置将存储为的环境变量的名称。
- `sensitive`: 可选的布尔值。如果为 true，则混淆用户提供的输入并将机密存储在钥匙串存储中。**示例**

```json
{
  "name": "my-api-extension",
  "version": "1.0.0",
  "settings": [
    {
      "name": "API Key",
      "description": "Your API key for the service.",
      "envVar": "MY_API_KEY"
    }
  ]
}
```

当用户安装此扩展时，系统会提示他们输入 API 密钥。该值将保存到扩展目录中的 `.env`
文件中（例如 `<home>/.gemini/extensions/my-api-extension/.env`）。

您可以通过运行以下命令查看扩展的设置列表：

```
gemini extensions list
```

您可以使用以下命令更新给定的设置：

```
gemini extensions config <extension name> [setting name] [--scope <scope>]
```

- `--scope`: 设置的范围（`user` 或 `workspace`）。这是可选的，默认为 `user`。

### 自定义命令

扩展可以通过在扩展目录内的 `commands/` 子目录中放置 TOML 文件来提供
[自定义命令](../cli/custom-commands.md)。这些命令遵循与用户和项目自定义命令相同的格式，并使用标准命名约定。

**示例**

一个名为 `gcp` 的扩展，具有以下结构：

```
.gemini/extensions/gcp/
├── gemini-extension.json
└── commands/
    ├── deploy.toml
    └── gcs/
        └── sync.toml
```

将提供这些命令：

- `/deploy` - 在帮助中显示为 `[gcp] Custom command from deploy.toml`
- `/gcs:sync` - 在帮助中显示为 `[gcp] Custom command from sync.toml`

### Agent 技能

_注意：这是一个实验性功能，通过 `experimental.skills` 启用。_

扩展可以捆绑 [Agent 技能](../cli/skills.md)
以提供按需专业知识和专门的工作流。要在扩展中包含技能，请将它们放置在扩展目录内的
`skills/` 子目录中。每个技能必须遵循
[Agent 技能结构](../cli/skills.md#folder-structure)，包括一个 `SKILL.md` 文件。

**示例**

一个名为 `security-toolkit` 的扩展，具有以下结构：

```
.gemini/extensions/security-toolkit/
├── gemini-extension.json
└── skills/
    ├── audit/
    │   ├── SKILL.md
    │   └── scripts/
    │       └── scan.py
    └── hardening/
        └── SKILL.md
```

安装后，Gemini
CLI 将发现这些技能，并且当模型识别出与其描述匹配的任务时，可以在会话期间激活这些技能。

扩展技能具有最低的优先级，并将被同名的用户或工作区技能覆盖。可以使用
[`/skills` 命令](../cli/skills.md#managing-skills)
查看和管理（启用或禁用）它们。

### Hooks

扩展可以提供 [hooks](../hooks/index.md)
以在特定生命周期事件中拦截和自定义 Gemini
CLI 行为。扩展提供的 Hooks 必须在扩展目录内的 `hooks/hooks.json` 文件中定义。

> [!IMPORTANT] Hooks 不直接在 `gemini-extension.json` 中定义。CLI 专门查找
> `hooks/hooks.json` 文件。

#### 目录结构

```
.gemini/extensions/my-extension/
├── gemini-extension.json
└── hooks/
    └── hooks.json
```

#### `hooks/hooks.json` 格式

`hooks.json` 文件包含一个 `hooks` 对象，其中键是
[事件名称](../hooks/reference.md#supported-events)，值是
[Hook 定义](../hooks/reference.md#hook-definition) 的数组。

```json
{
  "hooks": {
    "before_agent": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ${extensionPath}/scripts/setup.js",
            "name": "Extension Setup"
          }
        ]
      }
    ]
  }
}
```

#### 支持的变量

就像 `gemini-extension.json` 一样，`hooks/hooks.json` 文件支持
[变量替换](#variables)。这对于使用 `${extensionPath}`
引用扩展目录中的脚本特别有用。

### 冲突解决

扩展命令具有最低的优先级。当与用户或项目命令发生冲突时：

1. **无冲突**: 扩展命令使用其自然名称（例如 `/deploy`）
2. **有冲突**: 扩展命令使用扩展前缀重命名（例如 `/gcp.deploy`）

例如，如果用户和 `gcp` 扩展都定义了一个 `deploy` 命令：

- `/deploy` - 执行用户的 deploy 命令
- `/gcp.deploy` - 执行扩展的 deploy 命令（标记为 `[gcp]`）

### 变量

Gemini CLI 扩展允许在 `gemini-extension.json` 和 `hooks/hooks.json`
中进行变量替换。这很有用，例如，如果您需要当前目录来运行使用
`"cwd": "${extensionPath}${/}run.ts"` 的 MCP 服务器或 Hook 脚本。

**支持的变量:**

| 变量                         | 描述                                                                                                                |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `${extensionPath}`           | 用户文件系统中扩展的完全限定路径，例如 `/Users/username/.gemini/extensions/example-extension`。这不会解开符号链接。 |
| `${workspacePath}`           | 当前工作区的完全限定路径。                                                                                          |
| `${/}` 或 `${pathSeparator}` | 路径分隔符（因操作系统而异）。                                                                                      |
| `${process.execPath}`        | 执行 CLI 的 Node.js 二进制文件的路径。                                                                              |
