# Gemini CLI core: 工具 API

Gemini CLI core
(`packages/core`) 具有用于定义、注册和执行工具的强大系统。这些工具扩展了 Gemini 模​​型的功能，使其能够与本地环境交互、获取 Web 内容以及执行除简单文本生成之外的各种操作。

## 核心概念

- **工具 (`tools.ts`):**
  定义所有工具契约的接口和基类 (`BaseTool`)。每个工具必须具有：
  - `name`: 唯一的内部名称（用于对 Gemini 的 API 调用）。
  - `displayName`: 用户友好的名称。
  - `description`: 对工具功能的清晰解释，提供给 Gemini 模型。
  - `parameterSchema`: 定义工具接受参数的 JSON
    schema。这对于 Gemini 模型了解如何正确调用工具至关重要。
  - `validateToolParams()`: 验证传入参数的方法。
  - `getDescription()`: 在执行之前提供关于工具将使用特定参数做什么的人类可读描述的方法。
  - `shouldConfirmExecute()`: 确定在执行之前是否需要用户确认（例如，对于潜在的破坏性操作）的方法。
  - `execute()`: 执行工具操作并返回 `ToolResult` 的核心方法。

- **`ToolResult` (`tools.ts`):** 定义工具执行结果结构的接口：
  - `llmContent`: 包含在发回给 LLM 以作为上下文的历史记录中的事实内容。这可以是简单字符串或用于丰富内容的
    `PartListUnion`（`Part` 对象和字符串的数组）。
  - `returnDisplay`: 用户友好的字符串（通常是 Markdown）或特殊对象（如
    `FileDiff`），用于在 CLI 中显示。

- **返回丰富内容:** 工具不仅限于返回简单文本。`llmContent` 可以是一个
  `PartListUnion`，它可以包含 `Part` 对象（用于图像、音频等）和 `string`
  的混合数组。这允许单个工具执行返回多条丰富内容。

- **工具注册表 (`tool-registry.ts`):** 一个类 (`ToolRegistry`) 负责：
  - **注册工具:** 持有所有可用内置工具（例如 `ReadFileTool`,
    `ShellTool`）的集合。
  - **发现工具:** 它还可以动态发现工具：
    - **基于命令的发现:** 如果在设置中配置了
      `tools.discoveryCommand`，则执行此命令。它应该输出描述自定义工具的 JSON，然后将其注册为
      `DiscoveredTool` 实例。
    - **基于 MCP 的发现:** 如果配置了
      `mcp.serverCommand`，注册表可以连接到模型上下文协议 (MCP) 服务器以列出和注册工具 (`DiscoveredMCPTool`)。
  - **提供 Schemas:** 向 Gemini 模型公开所有已注册工具的 `FunctionDeclaration`
    schema，以便它知道哪些工具可用以及如何使用它们。
  - **检索工具:** 允许 core 按名称获取特定工具以供执行。

## 内置工具

Core 附带一套预定义的工具，通常位于 `packages/core/src/tools/` 中。这些包括：

- **文件系统工具:**
  - `LSTool` (`ls.ts`): 列出目录内容。
  - `ReadFileTool` (`read-file.ts`): 读取单个文件的内容。
  - `WriteFileTool` (`write-file.ts`): 将内容写入文件。
  - `GrepTool` (`grep.ts`): 在文件中搜索模式。
  - `GlobTool` (`glob.ts`): 查找与 glob 模式匹配的文件。
  - `EditTool` (`edit.ts`): 执行文件的就地修改（通常需要确认）。
  - `ReadManyFilesTool`
    (`read-many-files.ts`): 从多个文件或 glob 模式读取和连接内容（由 CLI 中的
    `@` 命令使用）。
- **执行工具:**
  - `ShellTool` (`shell.ts`): 执行任意 shell 命令（需要仔细的沙盒和用户确认）。
- **Web 工具:**
  - `WebFetchTool` (`web-fetch.ts`): 从 URL 获取内容。
  - `WebSearchTool` (`web-search.ts`): 执行 Web 搜索。
- **记忆工具:**
  - `MemoryTool` (`memoryTool.ts`): 与 AI 的记忆交互。

这些工具中的每一个都扩展了 `BaseTool` 并实现了其特定功能所需的方法。

## 工具执行流程

1.  **模型请求:**
    Gemini 模型根据用户的提示词和提供的工具 schema，决定使用工具并在其响应中返回一个
    `FunctionCall` 部分，指定工具名称和参数。
2.  **Core 接收请求:** Core 解析此 `FunctionCall`。
3.  **工具检索:** 它在 `ToolRegistry` 中查找请求的工具。
4.  **参数验证:** 调用工具的 `validateToolParams()` 方法。
5.  **确认（如果需要）:**
    - 调用工具的 `shouldConfirmExecute()` 方法。
    - 如果它返回确认详情，Core 将其传回 CLI，CLI 提示用户。
    - 用户的决定（例如，继续、取消）被发回 Core。
6.  **执行:** 如果验证通过并确认（或不需要确认），Core 将使用提供的参数和
    `AbortSignal`（用于潜在的取消）调用工具的 `execute()` 方法。
7.  **结果处理:** Core 接收来自 `execute()` 的 `ToolResult`。
8.  **响应模型:** 来自 `ToolResult` 的 `llmContent` 被打包为 `FunctionResponse`
    并发回 Gemini 模型，以便它可以继续生成面向用户的响应。
9.  **显示给用户:** 来自 `ToolResult` 的 `returnDisplay`
    被发送到 CLI 以向用户显示工具做了什么。

## 使用自定义工具扩展

虽然在提供的文件中并未明确详细说明普通最终用户直接以编程方式注册新工具是主要工作流程，但该架构通过以下方式支持扩展：

- **基于命令的发现:** 高级用户或项目管理员可以在 `settings.json` 中定义
  `tools.discoveryCommand`。当 Gemini CLI core 运行此命令时，它应输出
  `FunctionDeclaration` 对象的 JSON 数组。Core 然后将这些作为 `DiscoveredTool`
  实例提供。相应的 `tools.callCommand` 将负责实际执行这些自定义工具。
- **MCP 服务器:** 对于更复杂的场景，可以通过 `settings.json` 中的 `mcpServers`
  设置来设置和配置一个或多个 MCP 服务器。Gemini CLI
  core 随后可以发现和使用这些服务器公开的工具。如前所述，如果您有多个 MCP 服务器，工具名称将以配置中的服务器名称为前缀（例如
  `serverAlias__actualToolName`）。

此工具系统提供了一种灵活而强大的方式来增强 Gemini 模型的功能，使 Gemini
CLI 成为适用于各种任务的多功能助手。
