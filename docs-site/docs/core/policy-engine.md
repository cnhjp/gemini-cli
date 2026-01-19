# 策略引擎 (Policy engine)

Gemini
CLI 包含一个强大的策略引擎，可对工具执行进行细粒度控制。它允许用户和管理员定义规则，以确定工具调用应该是允许、拒绝还是需要用户确认。

## 快速入门

要创建您的第一个策略：

1.  **创建策略目录**（如果不存在）：
    ```bash
    mkdir -p ~/.gemini/policies
    ```
2.  **创建一个新的策略文件**（例如
    `~/.gemini/policies/my-rules.toml`）。您可以使用任何以 `.toml`
    结尾的文件名；此目录中的所有此类文件都将被加载并组合：
    ```toml
    [[rule]]
    toolName = "run_shell_command"
    commandPrefix = "git status"
    decision = "allow"
    priority = 100
    ```
3.  **运行触发策略的命令**（例如，要求 Gemini CLI 执行
    `git status`）。该工具现在将自动执行，无需提示确认。

## 核心概念

策略引擎基于一组规则运行。每条规则都是条件和结果决策的组合。当大型语言模型想要执行工具时，策略引擎会评估所有规则，以找到与工具调用匹配的最高优先级规则。

一条规则由以下主要组件组成：

- **条件 (Conditions)**: 工具调用必须满足的标准，以便规则适用。这可以包括工具的名称、提供给它的参数或当前的批准模式。
- **决策 (Decision)**: 如果规则匹配要采取的操作（`allow` (允许)、`deny`
  (拒绝) 或 `ask_user` (询问用户)）。
- **优先级 (Priority)**: 决定规则优先级的数字。数字越高优先级越高。

例如，此规则将在执行任何 `git` 命令之前要求用户确认。

```toml
[[rule]]
toolName = "run_shell_command"
commandPrefix = "git "
decision = "ask_user"
priority = 100
```

### 条件

条件是工具调用必须满足的标准，以便规则适用。主要条件是工具的名称及其参数。

#### 工具名称 (Tool Name)

规则中的 `toolName` 必须与被调用的工具名称匹配。

- **通配符**: 对于模型托管协议 (MCP) 服务器，您可以使用通配符。`toolName` 为
  `my-server__*` 将匹配来自 `my-server` MCP 的任何工具。

#### 参数模式 (Arguments pattern)

如果指定了
`argsPattern`，则工具的参数将转换为稳定的 JSON 字符串，然后针对提供的正则表达式进行测试。如果参数与模式不匹配，则规则不适用。

### 决策

规则可以强制执行三种可能的决策：

- `allow`: 工具调用自动执行，无需用户交互。
- `deny`: 工具调用被阻止且不执行。
- `ask_user`: 提示用户批准或拒绝工具调用。（在非交互模式下，这被视为 `deny`。）

### 优先级系统和层级

当多个规则匹配单个工具调用时，策略引擎使用复杂的优先级系统来解决冲突。核心原则很简单：**具有最高优先级的规则获胜**。

为了提供清晰的层级结构，策略分为三个层级。每个层级都有一个指定的数字，构成最终优先级计算的基础。

| 层级           | 基数 | 描述                                     |
| :------------- | :--- | :--------------------------------------- |
| Default (默认) | 1    | Gemini CLI 附带的内置策略。              |
| User (用户)    | 2    | 用户定义的自定义策略。                   |
| Admin (管理员) | 3    | 管理员管理的策略（例如，在企业环境中）。 |

在 TOML 策略文件中，您分配一个从 **0 到 999**
的优先级值。引擎使用以下公式将其转换为最终优先级：

`final_priority = tier_base + (toml_priority / 1000)`

该系统保证：

- Admin 策略始终覆盖 User 和 Default 策略。
- User 策略始终覆盖 Default 策略。
- 您仍然可以在单个层级内对规则进行排序，并进行细粒度控制。

例如：

- Default 策略文件中的 `priority: 50` 规则变为 `1.050`。
- User 策略文件中的 `priority: 100` 规则变为 `2.100`。
- Admin 策略文件中的 `priority: 20` 规则变为 `3.020`。

### 批准模式

批准模式允许策略引擎根据 CLI 的操作模式应用不同的规则集。规则可以与一种或多种模式相关联（例如
`yolo`,
`autoEdit`）。只有当 CLI 在其指定模式之一中运行时，该规则才会处于活动状态。如果规则没有指定模式，则它始终处于活动状态。

## 规则匹配

当进行工具调用时，引擎会针对所有活动规则进行检查，从最高优先级开始。第一个匹配的规则决定结果。

如果满足所有条件，则规则与工具调用匹配：

1.  **工具名称**: 规则中的 `toolName` 必须与被调用的工具名称匹配。
    - **通配符**: 对于模型托管协议 (MCP) 服务器，您可以使用通配符。`toolName` 为
      `my-server__*` 将匹配来自 `my-server` MCP 的任何工具。
2.  **参数模式**: 如果指定了
    `argsPattern`，则工具的参数将转换为稳定的 JSON 字符串，然后针对提供的正则表达式进行测试。如果参数与模式不匹配，则规则不适用。

## 配置

策略在 `.toml`
文件中定义。CLI 从 Default、User 和（如果已配置）Admin 目录加载这些文件。

### TOML 规则 Schema

这是 TOML 策略规则中可用字段的细分：

```toml
[[rule]]
# 工具的唯一名称，或名称数组。
toolName = "run_shell_command"

# (可选) MCP 服务器的名称。可以与 toolName 结合
# 形成复合名称，如 "mcpName__toolName"。
mcpName = "my-custom-server"

# (可选) 针对工具参数进行匹配的正则表达式。
argsPattern = '"command":"(git|npm)'

# (可选) shell 命令必须以其开头的字符串或字符串数组。
# 这是 `toolName = "run_shell_command"` 和 `argsPattern` 的语法糖。
commandPrefix = "git "

# (可选) 针对整个 shell 命令进行匹配的正则表达式。
# 这也是 `toolName = "run_shell_command"` 的语法糖。
# 注意：此模式针对参数的 JSON 表示（例如 `{"command":"<your_command>"}`）进行测试，因此像 `^` 或 `$` 这样的锚点将应用于完整的 JSON 字符串，而不仅仅是命令文本。
# 您不能在同一规则中使用 commandPrefix 和 commandRegex。
commandRegex = "^git (commit|push)"

# 要采取的决策。必须是 "allow", "deny", 或 "ask_user"。
decision = "ask_user"

# 规则的优先级，从 0 到 999。
priority = 10

# (可选) 此规则处于活动状态的批准模式数组。
modes = ["autoEdit"]
```

### 使用数组（列表）

要将同一规则应用于多个工具或命令前缀，您可以为 `toolName` 和 `commandPrefix`
字段提供字符串数组。

**示例:**

此单条规则将同时应用于 `write_file` 和 `replace` 工具。

```toml
[[rule]]
toolName = ["write_file", "replace"]
decision = "ask_user"
priority = 10
```

### `run_shell_command` 的特殊语法

为了简化 `run_shell_command` 的策略编写，您可以使用 `commandPrefix` 或
`commandRegex` 代替更复杂的 `argsPattern`。

- `commandPrefix`: 如果 `command` 参数以给定字符串开头，则匹配。
- `commandRegex`: 如果 `command` 参数与给定的正则表达式匹配，则匹配。

**示例:**

此规则将在执行任何 `git` 命令之前要求用户确认。

```toml
[[rule]]
toolName = "run_shell_command"
commandPrefix = "git "
decision = "ask_user"
priority = 100
```

### MCP 工具的特殊语法

您可以使用 `mcpName`
字段或通配符模式创建针对模型托管协议 (MCP) 服务器工具的规则。

**1. 使用 `mcpName`**

要针对特定服务器中的特定工具，请组合 `mcpName` 和 `toolName`。

```toml
# 允许 `my-jira-server` MCP 上的 `search` 工具
[[rule]]
mcpName = "my-jira-server"
toolName = "search"
decision = "allow"
priority = 200
```

**2. 使用通配符**

要创建适用于特定 MCP 服务器上 _所有_ 工具的规则，请仅指定 `mcpName`。

```toml
# 拒绝来自 `untrusted-server` MCP 的所有工具
[[rule]]
mcpName = "untrusted-server"
decision = "deny"
priority = 500
```

## 默认策略

Gemini CLI 附带一套默认策略，以提供开箱即用的安全体验。

- **只读工具**（如 `read_file`, `glob`）通常 **允许 (allowed)**。
- **代理委派**（如 `delegate_to_agent`）默认为
  **`ask_user`**，以确保远程代理可以提示确认，但本地子代理操作以静默方式执行并单独检查。
- **写入工具**（如 `write_file`, `run_shell_command`）默认为 **`ask_user`**。
- 在 **`yolo`** 模式下，一条高优先级规则允许所有工具。
- 在 **`autoEdit`** 模式下，规则允许某些写入操作在不提示的情况下发生。
