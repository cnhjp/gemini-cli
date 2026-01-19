# Shell 工具 (`run_shell_command`)

本文档描述了 Gemini CLI 的 `run_shell_command` 工具。

## 描述

使用 `run_shell_command`
与底层系统交互、运行脚本或执行命令行操作。`run_shell_command`
执行给定的 shell 命令，如果 `tools.shell.enableInteractiveShell` 设置为
`true`，则包括需要用户输入的交互式命令（例如 `vim`, `git rebase -i`）。

在 Windows 上，命令使用 `powershell.exe -NoProfile -Command`
执行（除非您显式地将 `ComSpec` 指向另一个 shell）。在其他平台上，它们使用
`bash -c` 执行。

### 参数

`run_shell_command` 接受以下参数：

- `command` (string, 必需): 要执行的确切 shell 命令。
- `description` (string, 可选): 命令用途的简短描述，将显示给用户。
- `directory`
  (string, 可选): 执行命令的目录（相对于项目根目录）。如果未提供，命令在项目根目录中运行。

## 如何在 Gemini CLI 中使用 `run_shell_command`

使用 `run_shell_command` 时，命令作为子进程执行。`run_shell_command` 可以使用
`&` 启动后台进程。该工具返回有关执行的详细信息，包括：

- `Command`: 执行的命令。
- `Directory`: 运行命令的目录。
- `Stdout`: 来自标准输出流的输出。
- `Stderr`: 来自标准错误流的输出。
- `Error`: 子进程报告的任何错误消息。
- `Exit Code`: 命令的退出代码。
- `Signal`: 如果命令被信号终止，则为信号编号。
- `Background PIDs`: 启动的任何后台进程的 PID 列表。

用法:

```
run_shell_command(command="Your commands.", description="Your description of the command.", directory="Your execution directory.")
```

## `run_shell_command` 示例

列出当前目录中的文件：

```
run_shell_command(command="ls -la")
```

在特定目录中运行脚本：

```
run_shell_command(command="./my_script.sh", directory="scripts", description="Run my custom script")
```

启动后台服务器：

```
run_shell_command(command="npm run dev &", description="Start development server in background")
```

## 配置

您可以通过修改 `settings.json` 文件或在 Gemini CLI 中使用 `/settings` 命令来配置
`run_shell_command` 工具的行为。

### 启用交互式命令

要启用交互式命令，您需要将 `tools.shell.enableInteractiveShell` 设置为
`true`。这将使用 `node-pty` 执行 shell 命令，从而允许交互式会话。如果 `node-pty`
不可用，它将回退到 `child_process` 实现，该实现不支持交互式命令。

**`settings.json` 示例:**

```json
{
  "tools": {
    "shell": {
      "enableInteractiveShell": true
    }
  }
}
```

### 在输出中显示颜色

要在 shell 输出中显示颜色，您需要将 `tools.shell.showColor` 设置为
`true`。**注意：此设置仅在启用 `tools.shell.enableInteractiveShell` 时适用。**

**`settings.json` 示例:**

```json
{
  "tools": {
    "shell": {
      "showColor": true
    }
  }
}
```

### 设置分页器

您可以通过设置 `tools.shell.pager`
设置为 shell 输出设置自定义分页器。默认分页器是 `cat`。**注意：此设置仅在启用
`tools.shell.enableInteractiveShell` 时适用。**

**`settings.json` 示例:**

```json
{
  "tools": {
    "shell": {
      "pager": "less"
    }
  }
}
```

## 交互式命令

`run_shell_command`
工具现在通过集成伪终端 (pty) 支持交互式命令。这允许您运行需要实时用户输入的命令，例如文本编辑器 (`vim`,
`nano`)、基于终端的 UI (`htop`) 和交互式版本控制操作 (`git rebase -i`)。

当交互式命令运行时，您可以从 Gemini CLI 向其发送输入。要聚焦交互式 shell，请按
`Tab`。终端输出（包括复杂的 TUI）将被正确渲染。

## 重要说明

- **安全性:** 执行命令（尤其是由用户输入构成的命令）时要小心，以防止安全漏洞。
- **错误处理:** 检查 `Stderr`, `Error`, 和 `Exit Code`
  字段以确定命令是否成功执行。
- **后台进程:** 当命令使用 `&`
  在后台运行时，该工具将立即返回，进程将继续在后台运行。`Background PIDs`
  字段将包含后台进程的进程 ID。

## 环境变量

当 `run_shell_command` 执行命令时，它会在子进程的环境中设置 `GEMINI_CLI=1`
环境变量。这允许脚本或工具检测它们是否在 Gemini CLI 内部运行。

## 命令限制

您可以通过在配置文件中使用 `tools.core` 和 `tools.exclude` 设置来限制
`run_shell_command` 工具可以执行的命令。

- `tools.core`: 要将 `run_shell_command` 限制为一组特定命令，请在 `tools`
  类别下的 `core` 列表中添加格式为 `run_shell_command(<command>)`
  的条目。例如，`"tools": {"core": ["run_shell_command(git)"]}` 将仅允许 `git`
  命令。包含通用的 `run_shell_command` 充当通配符，允许任何未明确阻止的命令。
- `tools.exclude`: 要阻止特定命令，请在 `tools` 类别下的 `exclude`
  列表中添加格式为 `run_shell_command(<command>)`
  的条目。例如，`"tools": {"exclude": ["run_shell_command(rm)"]}` 将阻止 `rm`
  命令。

验证逻辑设计得既安全又灵活：

1.  **禁用命令链**: 工具会自动拆分用 `&&`, `||`, 或 `;`
    链接的命令，并分别验证每个部分。如果链的任何部分被禁止，整个命令将被阻止。
2.  **前缀匹配**: 工具使用前缀匹配。例如，如果您允许 `git`，您可以运行
    `git status` 或 `git log`。
3.  **黑名单优先**: 始终首先检查 `tools.exclude`
    列表。如果命令匹配被阻止的前缀，它将被拒绝，即使它也匹配 `tools.core`
    中的允许前缀。

### 命令限制示例

**仅允许特定命令前缀**

要仅允许 `git` 和 `npm` 命令，并阻止所有其他命令：

```json
{
  "tools": {
    "core": ["run_shell_command(git)", "run_shell_command(npm)"]
  }
}
```

- `git status`: 允许
- `npm install`: 允许
- `ls -l`: 阻止

**阻止特定命令前缀**

要阻止 `rm` 并允许所有其他命令：

```json
{
  "tools": {
    "core": ["run_shell_command"],
    "exclude": ["run_shell_command(rm)"]
  }
}
```

- `rm -rf /`: 阻止
- `git status`: 允许
- `npm install`: 允许

**黑名单优先**

如果命令前缀同时在 `tools.core` 和 `tools.exclude` 中，它将被阻止。

```json
{
  "tools": {
    "core": ["run_shell_command(git)"],
    "exclude": ["run_shell_command(git push)"]
  }
}
```

- `git push origin main`: 阻止
- `git status`: 允许

**阻止所有 shell 命令**

要阻止所有 shell 命令，请将 `run_shell_command` 通配符添加到 `tools.exclude`：

```json
{
  "tools": {
    "exclude": ["run_shell_command"]
  }
}
```

- `ls -l`: 阻止
- `any other command`: 阻止

## `excludeTools` 的安全说明

`run_shell_command` 在 `excludeTools`
中的特定于命令的限制基于简单的字符串匹配，很容易被绕过。此功能
**不是安全机制**，不应依赖它来安全执行不受信任的代码。建议使用 `coreTools`
显式选择可以执行的命令。
