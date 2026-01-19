# Gemini CLI Hooks

Hooks 是 Gemini
CLI 在代理循环中的特定点执行的脚本或程序，允许您拦截和自定义行为，而无需修改 CLI 的源代码。

> **注意：Hooks 目前是一项实验性功能。**
>
> 要使用 Hooks，您必须在 `settings.json` 中显式启用它们：
>
> ```json
> {
>   "tools": { "enableHooks": true },
>   "hooks": { "enabled": true }
> }
> ```
>
> 在这个实验阶段，两者都是必需的。

请参阅 [编写 Hooks 指南](writing-hooks.md)
获取创建您的第一个 Hook 的教程和综合示例。

请参阅 [Hooks 参考](reference.md) 获取 I/O schema 的技术规范。

请参阅 [最佳实践](best-practices.md) 获取有关安全性、性能和调试的指南。

## 什么是 Hooks？

使用 Hooks，您可以：

- **添加上下文:** 在模型处理请求之前注入相关信息
- **验证操作:** 审查并阻止潜在危险的操作
- **强制执行策略:** 实施安全和合规性要求
- **记录交互:** 跟踪工具使用和模型响应
- **优化行为:** 动态调整工具选择或模型参数

Hooks 作为代理循环的一部分同步运行——当 Hook 事件触发时，Gemini
CLI 等待所有匹配的 Hooks 完成后再继续。

## 安全与风险

> **警告：Hooks 以您的用户权限执行任意代码。**
>
> 通过配置 Hooks，您明确允许 Gemini
> CLI 在您的机器上运行 shell 命令。恶意或配置不当的 Hooks 可能会：

- **窃取数据**: 读取敏感文件（`.env`, ssh 密钥）并将其发送到远程服务器。
- **修改系统**: 删除文件、安装恶意软件或更改系统设置。
- **消耗资源**: 运行无限循环或导致系统崩溃。

**项目级 Hooks**（在 `.gemini/settings.json` 中）和 **扩展 Hooks**
在打开第三方项目或来自不受信任作者的扩展时风险特别大。Gemini
CLI 在首次检测到新的项目 Hook（通过其名称和命令识别）时会
**警告您**，但在信任它们之前审查这些 Hooks（以及任何已安装的扩展）是
**您的责任**。

> **注意：**
> 如果检测到 Hooks，扩展 Hooks 在安装或更新扩展期间会受到强制性安全警告和同意流程的约束。您必须明确批准安装或更新任何包含 Hooks 的扩展。

请参阅 [安全注意事项](best-practices.md#using-hooks-securely)
获取详细的威胁模型和缓解策略。

## 核心概念

### Hook 事件

Hooks 由 Gemini CLI 生命周期中的特定事件触发。下表列出了所有可用的 Hook 事件：

| 事件                  | 触发时机                            | 常见用例               |
| :-------------------- | :---------------------------------- | :--------------------- |
| `SessionStart`        | 会话开始时                          | 初始化资源，加载上下文 |
| `SessionEnd`          | 会话结束时                          | 清理，保存状态         |
| `BeforeAgent`         | 用户提交提示词后，规划前            | 添加上下文，验证提示词 |
| `AfterAgent`          | 代理循环结束时                      | 审查输出，强制继续     |
| `BeforeModel`         | 向 LLM 发送请求前                   | 修改提示词，添加说明   |
| `AfterModel`          | 收到 LLM 响应后                     | 过滤响应，记录交互     |
| `BeforeToolSelection` | LLM 选择工具之前 (BeforeModel 之后) | 过滤可用工具，优化选择 |
| `BeforeTool`          | 工具执行前                          | 验证参数，阻止危险操作 |
| `AfterTool`           | 工具执行后                          | 处理结果，运行测试     |
| `PreCompress`         | 上下文压缩前                        | 保存状态，通知用户     |
| `Notification`        | 发生通知时（例如权限）              | 自动批准，记录决策     |

### Hook 类型

Gemini CLI 目前支持运行 shell 命令或脚本的 **命令 Hooks**：

```json
{
  "type": "command",
  "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/my-hook.sh",
  "timeout": 30000
}
```

**注意：** 插件 Hooks (npm 包) 计划在未来版本中发布。

### 匹配器 (Matchers)

对于与工具相关的事件（`BeforeTool`, `AfterTool`），您可以过滤触发 Hook 的工具：

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file|replace",
        "hooks": [
          /* 针对写入操作的 Hooks */
        ]
      }
    ]
  }
}
```

**匹配器模式:**

- **精确匹配:** `"read_file"` 仅匹配 `read_file`
- **正则表达式:** `"write_.*|replace"` 匹配 `write_file`, `replace`
- **通配符:** `"*"` 或 `""` 匹配所有工具

**会话事件匹配器:**

- **SessionStart:** `startup`, `resume`, `clear`
- **SessionEnd:** `exit`, `clear`, `logout`, `prompt_input_exit`
- **PreCompress:** `manual`, `auto`
- **Notification:** `ToolPermission`

## Hook 输入/输出契约

### 命令 Hook 通信

Hooks 通过以下方式通信：

- **输入:** stdin 上的 JSON
- **输出:** 退出代码 + stdout/stderr

### 退出代码

- **0:** 成功 - stdout 显示给用户（或作为某些事件的上下文注入）
- **2:** 阻塞性错误 - stderr 显示给代理/用户，操作可能被阻止
- **其他:** 非阻塞性警告 - 记录日志但继续执行

### 公共输入字段

每个 Hook 都接收这些基本字段：

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/path/to/project",
  "hook_event_name": "BeforeTool",
  "timestamp": "2025-12-01T10:30:00Z"
  // ... 事件特定字段
}
```

### 事件特定字段

#### BeforeTool

**输入:**

```json
{
  "tool_name": "write_file",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "content": "..."
  }
}
```

**输出 (stdout 上的 JSON):**

```json
{
  "decision": "allow|deny|ask|block",
  "reason": "显示给代理的解释",
  "systemMessage": "显示给用户的消息"
}
```

或简单的退出代码：

- 退出 0 = 允许 (stdout 显示给用户)
- 退出 2 = 拒绝 (stderr 显示给代理)

#### AfterTool

**输入:**

```json
{
  "tool_name": "read_file",
  "tool_input": { "file_path": "..." },
  "tool_response": "文件内容..."
}
```

**输出:**

```json
{
  "decision": "allow|deny",
  "hookSpecificOutput": {
    "hookEventName": "AfterTool",
    "additionalContext": "给代理的额外上下文"
  }
}
```

#### BeforeAgent

**输入:**

```json
{
  "prompt": "修复身份验证错误"
}
```

**输出:**

```json
{
  "decision": "allow|deny",
  "hookSpecificOutput": {
    "hookEventName": "BeforeAgent",
    "additionalContext": "最近的项目决策：..."
  }
}
```

#### BeforeModel

**输入:**

```json
{
  "llm_request": {
    "model": "gemini-2.0-flash-exp",
    "messages": [{ "role": "user", "content": "Hello" }],
    "config": { "temperature": 0.7 },
    "toolConfig": {
      "functionCallingConfig": {
        "mode": "AUTO",
        "allowedFunctionNames": ["read_file", "write_file"]
      }
    }
  }
}
```

**输出:**

```json
{
  "decision": "allow",
  "hookSpecificOutput": {
    "hookEventName": "BeforeModel",
    "llm_request": {
      "messages": [
        { "role": "system", "content": "额外说明..." },
        { "role": "user", "content": "Hello" }
      ]
    }
  }
}
```

#### AfterModel

**输入:**

```json
{
  "llm_request": {
    "model": "gemini-2.0-flash-exp",
    "messages": [
      /* ... */
    ],
    "config": {
      /* ... */
    },
    "toolConfig": {
      /* ... */
    }
  },
  "llm_response": {
    "text": "string",
    "candidates": [
      {
        "content": {
          "role": "model",
          "parts": ["内容部分数组"]
        },
        "finishReason": "STOP"
      }
    ]
  }
}
```

**输出:**

```json
{
  "hookSpecificOutput": {
    "hookEventName": "AfterModel",
    "llm_response": {
      "candidate": {
        /* 修改后的响应 */
      }
    }
  }
}
```

#### BeforeToolSelection

**输入:**

```json
{
  "llm_request": {
    "model": "gemini-2.0-flash-exp",
    "messages": [
      /* ... */
    ],
    "toolConfig": {
      "functionCallingConfig": {
        "mode": "AUTO",
        "allowedFunctionNames": [
          /* 100+ 个工具 */
        ]
      }
    }
  }
}
```

**输出:**

```json
{
  "hookSpecificOutput": {
    "hookEventName": "BeforeToolSelection",
    "toolConfig": {
      "functionCallingConfig": {
        "mode": "ANY",
        "allowedFunctionNames": ["read_file", "write_file", "replace"]
      }
    }
  }
}
```

或简单输出（逗号分隔的工具名称将模式设置为 ANY）：

```bash
echo "read_file,write_file,replace"
```

#### SessionStart

**输入:**

```json
{
  "source": "startup|resume|clear"
}
```

**输出:**

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "加载了 5 个项目记忆"
  }
}
```

#### SessionEnd

**输入:**

```json
{
  "reason": "exit|clear|logout|prompt_input_exit|other"
}
```

不预期结构化输出（但记录 stdout/stderr）。

#### PreCompress

**输入:**

```json
{
  "trigger": "manual|auto"
}
```

**输出:**

```json
{
  "systemMessage": "压缩开始..."
}
```

#### Notification

**输入:**

```json
{
  "notification_type": "ToolPermission",
  "message": "string",
  "details": {
    /* 通知详情 */
  }
}
```

**输出:**

```json
{
  "systemMessage": "通知已记录"
}
```

## 配置

Hook 定义在 `settings.json` 文件中使用 `hooks`
对象进行配置。可以在多个级别指定配置，并具有定义的优先级规则。

### 配置层级

Hook 配置按以下执行顺序应用（较低的数字先运行）：

1.  **项目设置:** 您项目目录中的 `.gemini/settings.json`（最高优先级）
2.  **用户设置:** `~/.gemini/settings.json`
3.  **系统设置:** `/etc/gemini-cli/settings.json`
4.  **扩展:**
    已安装扩展定义的内部 Hooks（最低优先级）。有关扩展如何定义和配置 Hooks 的详细信息，请参阅
    [扩展文档](../extensions/index.md#hooks)。

#### 重复数据删除和遮蔽

如果在不同的配置层中发现具有相同 **名称** 和 **命令** 的多个 Hooks，Gemini
CLI 会对它们进行重复数据删除。来自较高优先级层（例如项目）的 Hook 将被保留，其他将被忽略。

在每个级别内，Hooks 按它们在配置中声明的顺序运行。

### 配置 Schema

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "pattern",
        "hooks": [
          {
            "name": "hook-identifier",
            "type": "command",
            "command": "./path/to/script.sh",
            "description": "What this hook does",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

**配置属性:**

- **`name`** (string, 推荐): 用于 `/hooks enable/disable`
  命令的 Hook 唯一标识符。如果省略，则使用 `command` 路径作为标识符。
- **`type`** (string, 必需): Hook 类型 - 目前仅支持 `"command"`
- **`command`** (string, 必需): 要执行的脚本或命令的路径
- **`description`** (string, 可选): 在 `/hooks panel` 中显示的人类可读描述
- **`timeout`** (number, 可选): 超时时间（毫秒）（默认：60000）
- **`matcher`** (string, 可选): Hook 运行时过滤的模式（仅限事件匹配器）

### 环境变量

Hooks 可以访问：

- `GEMINI_PROJECT_DIR`: 项目根目录
- `GEMINI_SESSION_ID`: 当前会话 ID
- `GEMINI_API_KEY`: Gemini API 密钥（如果已配置）
- 父进程的所有其他环境变量

## 管理 Hooks

### 查看已注册的 Hooks

使用 `/hooks panel` 命令查看所有已注册的 Hooks：

```bash
/hooks panel
```

此命令显示：

- 按事件组织的所有已配置 Hooks
- Hook 来源（用户、项目、系统）
- Hook 类型（命令或插件）
- 单个 Hook 状态（启用/禁用）

### 一次性启用和禁用所有 Hooks

您可以使用命令一次性启用或禁用所有 Hooks：

```bash
/hooks enable-all
/hooks disable-all
```

这些命令提供了启用或禁用所有已配置 Hooks 的快捷方式，而无需单独管理它们。`enable-all`
命令从 `hooks.disabled` 数组中删除所有 Hooks，而 `disable-all`
将所有已配置的 Hooks 添加到禁用列表中。更改立即生效，无需重启。

### 启用和禁用单个 Hooks

您可以使用命令启用或禁用单个 Hooks：

```bash
/hooks enable hook-name
/hooks disable hook-name
```

这些命令允许您控制 Hook 执行而无需编辑配置文件。Hook 名称应与 Hook 配置中的
`name`
字段匹配。通过这些命令所做的更改会持久保存到您的设置中。如果可用，设置将保存到工作区范围，否则保存到您的全局用户设置 (`~/.gemini/settings.json`)。

### 禁用 Hooks 配置

要永久禁用 Hooks，请将它们添加到 `settings.json` 中的 `hooks.disabled` 数组：

```json
{
  "hooks": {
    "disabled": ["secret-scanner", "auto-test"]
  }
}
```

**注意：** `hooks.disabled`
数组使用 UNION 合并策略。来自所有配置级别（用户、项目、系统）的禁用 Hooks 被组合并去重，这意味着在任何级别禁用的 Hook 都将保持禁用状态。

## 从 Claude Code 迁移

如果您为 Claude Code 配置了 Hooks，您可以迁移它们：

```bash
gemini hooks migrate --from-claude
```

此命令：

- 读取 `.claude/settings.json`
- 转换事件名称（`PreToolUse` → `BeforeTool` 等）
- 翻译工具名称（`Bash` → `run_shell_command`, `replace` → `replace`）
- 更新匹配器模式
- 写入 `.gemini/settings.json`

### 事件名称映射

| Claude Code        | Gemini CLI     |
| :----------------- | :------------- |
| `PreToolUse`       | `BeforeTool`   |
| `PostToolUse`      | `AfterTool`    |
| `UserPromptSubmit` | `BeforeAgent`  |
| `Stop`             | `AfterAgent`   |
| `Notification`     | `Notification` |
| `SessionStart`     | `SessionStart` |
| `SessionEnd`       | `SessionEnd`   |
| `PreCompact`       | `PreCompress`  |

### 工具名称映射

| Claude Code | Gemini CLI            |
| :---------- | :-------------------- |
| `Bash`      | `run_shell_command`   |
| `Edit`      | `replace`             |
| `Read`      | `read_file`           |
| `Write`     | `write_file`          |
| `Glob`      | `glob`                |
| `Grep`      | `search_file_content` |
| `LS`        | `list_directory`      |

## 工具和事件匹配器参考

### 可用于匹配器的工具名称

以下内置工具可用于 `BeforeTool` 和 `AfterTool` Hook 匹配器：

#### 文件操作

- `read_file` - 读取单个文件
- `read_many_files` - 一次读取多个文件
- `write_file` - 创建或覆盖文件
- `replace` - 使用查找/替换编辑文件内容

#### 文件系统

- `list_directory` - 列出目录内容
- `glob` - 查找与模式匹配的文件
- `search_file_content` - 在文件内容中搜索

#### 执行

- `run_shell_command` - 执行 shell 命令

#### Web 和外部

- `google_web_search` - 具有 grounding 的 Google 搜索
- `web_fetch` - 获取网页内容

#### 代理功能

- `write_todos` - 管理 TODO 项目
- `save_memory` - 将信息保存到记忆
- `delegate_to_agent` - 将任务委派给子代理

#### 示例匹配器

```json
{
  "matcher": "write_file|replace" // 文件编辑工具
}
```

```json
{
  "matcher": "read_.*" // 所有读取操作
}
```

```json
{
  "matcher": "run_shell_command" // 仅 shell 命令
}
```

```json
{
  "matcher": "*" // 所有工具
}
```

### 事件特定匹配器

#### SessionStart 事件匹配器

- `startup` - 新会话开始
- `resume` - 恢复以前的会话
- `clear` - 会话已清除

#### SessionEnd 事件匹配器

- `exit` - 正常退出
- `clear` - 会话已清除
- `logout` - 用户已注销
- `prompt_input_exit` - 从提示词输入退出
- `other` - 其他原因

#### PreCompress 事件匹配器

- `manual` - 手动触发的压缩
- `auto` - 自动触发的压缩

#### Notification 事件匹配器

- `ToolPermission` - 工具权限通知

## 了解更多

- [编写 Hooks](writing-hooks.md) - 教程和综合示例
- [最佳实践](best-practices.md) - 安全性、性能和调试
- [自定义命令](../cli/custom-commands.md) - 创建可重用的提示词快捷方式
- [配置](../get-started/configuration.md) - Gemini CLI 配置选项
- [Hooks 设计文档](../hooks-design.md) - 技术架构细节
