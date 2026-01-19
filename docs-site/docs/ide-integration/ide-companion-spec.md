# Gemini CLI 伴侣插件：接口规范

> 最后更新：2025 年 9 月 15 日

本文档定义了构建伴侣插件以启用 Gemini CLI IDE 模式的契约。对于 VS
Code，这些功能（原生差异比较、上下文感知）由官方扩展 ([marketplace](https://marketplace.visualstudio.com/items?itemName=Google.gemini-cli-vscode-ide-companion)) 提供。本规范适用于希望将类似功能引入其他编辑器（如 JetBrains
IDEs、Sublime Text 等）的贡献者。

## I. 通信接口

Gemini CLI 和 IDE 插件通过本地通信通道进行通信。

### 1. 传输层：MCP over HTTP

插件 **必须** 运行一个实现 **模型上下文协议 (MCP)** 的本地 HTTP 服务器。

- **协议:**
  服务器必须是有效的 MCP 服务器。如果有的话，我们建议使用您选择的语言的现有 MCP
  SDK。
- **端点:** 服务器应公开单个端点（例如 `/mcp`）用于所有 MCP 通信。
- **端口:** 服务器 **必须** 监听动态分配的端口（即监听端口 `0`）。

### 2. 发现机制：端口文件

为了让 Gemini
CLI 连接，它需要发现它在哪个 IDE 实例中运行以及您的服务器使用的端口。插件
**必须** 通过创建“发现文件”来促进这一点。

- **CLI 如何找到文件:** CLI 通过遍历进程树来确定它正在其中运行的 IDE 的进程 ID
  (PID)。然后，它查找名称中包含此 PID 的发现文件。
- **文件位置:**
  文件必须在特定目录中创建：`os.tmpdir()/gemini/ide/`。如果此目录不存在，您的插件必须创建它。
- **文件命名约定:** 文件名至关重要，**必须**
  遵循模式：`gemini-ide-server-${PID}-${PORT}.json`
  - `${PID}`: 父 IDE 进程的进程 ID。您的插件必须确定此 PID 并将其包含在文件名中。
  - `${PORT}`: 您的 MCP 服务器正在监听的端口。
- **文件内容和工作区验证:** 文件 **必须** 包含具有以下结构的 JSON 对象：

  ```json
  {
    "port": 12345,
    "workspacePath": "/path/to/project1:/path/to/project2",
    "authToken": "a-very-secret-token",
    "ideInfo": {
      "name": "vscode",
      "displayName": "VS Code"
    }
  }
  ```
  - `port` (number, 必需): MCP 服务器的端口。
  - `workspacePath`
    (string, 必需): 所有打开的工作区根路径的列表，由操作系统特定的路径分隔符分隔（Linux/macOS 为
    `:`，Windows 为
    `;`）。CLI 使用此路径来确保它在 IDE 中打开的同一个项目文件夹中运行。如果 CLI 的当前工作目录不是
    `workspacePath` 的子目录，连接将被拒绝。您的插件 **必须**
    提供打开工作区根目录的正确绝对路径。
  - `authToken` (string, 必需): 用于保护连接的秘密令牌。CLI 将在所有请求的
    `Authorization: Bearer <token>` 标头中包含此令牌。
  - `ideInfo` (object, 必需): 有关 IDE 的信息。
    - `name` (string, 必需): IDE 的简短小写标识符（例如 `vscode`,
      `jetbrains`）。
    - `displayName` (string, 必需): IDE 的用户友好名称（例如 `VS Code`,
      `JetBrains IDE`）。

- **身份验证:** 为了保护连接，插件 **必须**
  生成一个唯一的秘密令牌并将其包含在发现文件中。CLI 随后将在对 MCP 服务器的所有请求的
  `Authorization` 标头中包含此令牌（例如
  `Authorization: Bearer a-very-secret-token`）。您的服务器 **必须**
  验证每个请求上的此令牌并拒绝任何未经授权的请求。
- **使用环境变量进行决胜（推荐）:** 为了获得最可靠的体验，您的插件 **应该**
  同时创建发现文件并在集成终端中设置 `GEMINI_CLI_IDE_SERVER_PORT`
  环境变量。文件用作主要发现机制，但环境变量对于决胜至关重要。如果用户为同一工作区打开了多个 IDE 窗口，CLI 使用
  `GEMINI_CLI_IDE_SERVER_PORT` 变量来识别并连接到正确窗口的服务器。

## II. 上下文接口

为了启用上下文感知，插件 **可以** 向 CLI 提供有关用户在 IDE 中活动的实时信息。

### `ide/contextUpdate` 通知

每当用户的上下文发生变化时，插件 **可以** 向 CLI 发送 `ide/contextUpdate`
[通知](https://modelcontextprotocol.io/specification/2025-06-18/basic/index#notifications)。

- **触发事件:** 应该在以下情况下发送此通知（建议去抖动时间为 50ms）：
  - 打开、关闭或聚焦文件。
  - 用户在活动文件中的光标位置或文本选择发生变化。
- **有效负载 (`IdeContext`):** 通知参数 **必须** 是一个 `IdeContext` 对象：

  ```typescript
  interface IdeContext {
    workspaceState?: {
      openFiles?: File[];
      isTrusted?: boolean;
    };
  }

  interface File {
    // 文件的绝对路径
    path: string;
    // 上次聚焦的 Unix 时间戳（用于排序）
    timestamp: number;
    // 如果这是当前聚焦的文件，则为 true
    isActive?: boolean;
    cursor?: {
      // 基于 1 的行号
      line: number;
      // 基于 1 的字符号
      character: number;
    };
    // 用户当前选择的文本
    selectedText?: string;
  }
  ```

  **注意:** `openFiles`
  列表应仅包含磁盘上存在的文件。虚拟文件（例如，没有路径的未保存文件、编辑器设置页面）**必须**
  被排除。

### CLI 如何使用此上下文

收到 `IdeContext` 对象后，CLI 在将信息发送给模型之前执行几个标准化和截断步骤。

- **文件排序:** CLI 使用 `timestamp` 字段来确定最近使用的文件。它根据此值对
  `openFiles` 列表进行排序。因此，您的插件 **必须**
  提供文件上次聚焦时的准确 Unix 时间戳。
- **活动文件:**
  CLI 仅将（排序后的）最近文件视为“活动”文件。它将忽略所有其他文件上的
  `isActive` 标志，并清除它们的 `cursor` 和 `selectedText`
  字段。您的插件应专注于设置 `isActive: true`
  并仅为当前聚焦的文件提供光标/选择详细信息。
- **截断:** 为了管理 token 限制，CLI 会截断文件列表（最多 10 个文件）和
  `selectedText`（最多 16KB）。

虽然 CLI 处理最终截断，但强烈建议您的插件也限制其发送的上下文量。

## III. 差异比较接口

为了启用交互式代码修改，插件 **可以**
公办公差异比较接口。这允许 CLI 请求 IDE 打开差异视图，显示对文件的建议更改。用户随后可以直接在 IDE 中查看、编辑并最终接受或拒绝这些更改。

### `openDiff` 工具

插件 **必须** 在其 MCP 服务器上注册一个 `openDiff` 工具。

- **描述:** 此工具指示 IDE 为特定文件打开可修改的差异视图。
- **请求 (`OpenDiffRequest`):** 该工具通过 `tools/call` 请求调用。请求的
  `params` 中的 `arguments` 字段 **必须** 是一个 `OpenDiffRequest` 对象。

  ```typescript
  interface OpenDiffRequest {
    // 要进行差异比较的文件的绝对路径。
    filePath: string;
    // 文件的建议新内容。
    newContent: string;
  }
  ```

- **响应 (`CallToolResult`):** 该工具 **必须** 立即返回一个 `CallToolResult`
  以确认请求并报告差异视图是否已成功打开。
  - 成功时：如果差异视图已成功打开，响应 **必须** 包含空内容（即
    `content: []`）。
  - 失败时：如果错误阻止差异视图打开，响应 **必须** 具有 `isError: true` 并在
    `content` 数组中包含描述错误的 `TextContent` 块。

  差异的实际结果（接受或拒绝）通过通知异步传达。

### `closeDiff` 工具

插件 **必须** 在其 MCP 服务器上注册一个 `closeDiff` 工具。

- **描述:** 此工具指示 IDE 关闭特定文件的打开的差异视图。
- **请求 (`CloseDiffRequest`):** 该工具通过 `tools/call` 请求调用。请求的
  `params` 中的 `arguments` 字段 **必须** 是一个 `CloseDiffRequest` 对象。

  ```typescript
  interface CloseDiffRequest {
    // 其差异视图应关闭的文件的绝对路径。
    filePath: string;
  }
  ```

- **响应 (`CallToolResult`):** 该工具 **必须** 返回一个 `CallToolResult`。
  - 成功时：如果差异视图已成功关闭，响应 **必须** 在 `content`
    数组中包含一个包含关闭前文件最终内容的 **TextContent** 块。
  - 失败时：如果错误阻止差异视图关闭，响应 **必须** 具有 `isError: true` 并在
    `content` 数组中包含描述错误的 `TextContent` 块。

### `ide/diffAccepted` 通知

当用户接受差异视图中的更改时（例如，通过单击“应用”或“保存”按钮），插件 **必须**
向 CLI 发送 `ide/diffAccepted` 通知。

- **有效负载:** 通知参数 **必须**
  包括文件路径和文件的最终内容。如果用户在差异视图中进行了手动编辑，则内容可能与原始
  `newContent` 不同。

  ```typescript
  {
    // 被差异比较的文件的绝对路径。
    filePath: string;
    // 接受后的文件完整内容。
    content: string;
  }
  ```

### `ide/diffRejected` 通知

当用户拒绝更改时（例如，通过关闭差异视图而不接受），插件 **必须** 向 CLI 发送
`ide/diffRejected` 通知。

- **有效负载:** 通知参数 **必须** 包括被拒绝差异的文件路径。

  ```typescript
  {
    // 被差异比较的文件的绝对路径。
    filePath: string;
  }
  ```

## IV. 生命周期接口

插件 **必须** 根据 IDE 的生命周期正确管理其资源和发现文件。

- **激活时（IDE 启动/插件启用）:**
  1.  启动 MCP 服务器。
  2.  创建发现文件。
- **停用时（IDE 关闭/插件禁用）:**
  1.  停止 MCP 服务器。
  2.  删除发现文件。
