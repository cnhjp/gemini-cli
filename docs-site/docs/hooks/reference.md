# Hooks 参考

本文档提供了 Gemini CLI Hooks 的技术规范，包括输入和输出的 JSON
schemas、退出代码行为以及稳定的模型 API。

## 通信协议

Hooks 通过标准流和退出代码与 Gemini CLI 通信：

- **输入**: Gemini CLI 将 JSON 对象发送到 Hook 的 `stdin`。
- **输出**: Hook 将 JSON 对象（或纯文本）发送到 `stdout`。
- **退出代码**: 用于表示成功或阻塞性错误。

### 退出代码行为

| 退出代码 | 含义           | 行为                                                               |
| :------- | :------------- | :----------------------------------------------------------------- |
| `0`      | **成功**       | `stdout` 被解析为 JSON。如果解析失败，则将其视为 `systemMessage`。 |
| `2`      | **阻塞性错误** | 中断当前操作。`stderr` 显示给代理（对于工具事件）或用户。          |
| 其他     | **警告**       | 继续执行。`stderr` 记录为非阻塞性警告。                            |

---

## 输入 Schema (`stdin`)

每个 Hook 都接收一个基本 JSON 对象。根据具体事件，会添加额外字段。

### 基本字段（所有事件）

| 字段              | 类型     | 描述                                  |
| :---------------- | :------- | :------------------------------------ |
| `session_id`      | `string` | 当前 CLI 会话的唯一标识符。           |
| `transcript_path` | `string` | 会话的 JSON 记录路径（如果可用）。    |
| `cwd`             | `string` | 当前工作目录。                        |
| `hook_event_name` | `string` | 触发事件的名称（例如 `BeforeTool`）。 |
| `timestamp`       | `string` | 事件的 ISO 8601 时间戳。              |

### 事件特定字段

#### 工具事件 (`BeforeTool`, `AfterTool`)

- `tool_name`: (`string`) 工具的内部名称（例如 `write_file`,
  `run_shell_command`）。
- `tool_input`: (`object`) 传递给工具的参数。
- `tool_response`: (`object`, **仅 AfterTool**) 工具执行的原始输出。
- `mcp_context`: (`object`,
  **可选**) 仅在 MCP 工具调用时出现。包含服务器标识信息：
  - `server_name`: (`string`) MCP 服务器的配置名称。
  - `tool_name`: (`string`) MCP 服务器的原始工具名称。
  - `command`: (`string`, 可选) 对于 stdio 传输，用于启动服务器的命令。
  - `args`: (`string[]`, 可选) 对于 stdio 传输，命令参数。
  - `cwd`: (`string`, 可选) 对于 stdio 传输，工作目录。
  - `url`: (`string`, 可选) 对于 SSE/HTTP 传输，服务器 URL。
  - `tcp`: (`string`, 可选) 对于 WebSocket 传输，TCP 地址。

#### 代理事件 (`BeforeAgent`, `AfterAgent`)

- `prompt`: (`string`) 用户提交的提示词。
- `prompt_response`: (`string`, **仅 AfterAgent**) 模型的最终响应文本。
- `stop_hook_active`: (`boolean`,
  **仅 AfterAgent**) 指示停止 Hook 是否已在处理继续。

#### 模型事件 (`BeforeModel`, `AfterModel`, `BeforeToolSelection`)

- `llm_request`: (`LLMRequest`) 发出请求的稳定表示。请参阅
  [稳定模型 API](#stable-model-api)。
- `llm_response`: (`LLMResponse`, **仅 AfterModel**) 传入响应的稳定表示。

#### 会话与通知事件

- `source`: (`startup` | `resume` | `clear`, **仅 SessionStart**) 触发源。
- `reason`: (`exit` | `clear` | `logout` | `prompt_input_exit` | `other`,
  **仅 SessionEnd**) 会话结束的原因。
- `trigger`: (`manual` | `auto`, **仅 PreCompress**) 触发压缩事件的原因。
- `notification_type`: (`ToolPermission`,
  **仅 Notification**) 正在触发的通知类型。
- `message`: (`string`, **仅 Notification**) 通知消息。
- `details`: (`object`, **仅 Notification**) 通知的特定于有效负载的详细信息。

---

## 输出 Schema (`stdout`)

如果 Hook 以 `0` 退出，CLI 尝试将 `stdout` 解析为 JSON。

### 公共输出字段

| 字段                 | 类型      | 描述                                                         |
| :------------------- | :-------- | :----------------------------------------------------------- |
| `decision`           | `string`  | 之一: `allow`, `deny`, `block`, `ask`, `approve`。           |
| `reason`             | `string`  | 当决策为 `deny` 或 `block` 时，显示给 **代理** 的解释。      |
| `systemMessage`      | `string`  | 显示在 Gemini CLI 终端中以向 **用户** 提供警告或上下文的消息 |
| `continue`           | `boolean` | 如果为 `false`，则立即终止本轮的代理循环。                   |
| `stopReason`         | `string`  | 当 `continue` 为 `false` 时显示给用户的消息。                |
| `suppressOutput`     | `boolean` | 如果为 `true`，则从 CLI 记录中隐藏 Hook 执行。               |
| `hookSpecificOutput` | `object`  | 事件特定数据的容器（见下文）。                               |

### `hookSpecificOutput` 参考

| 字段                | 支持的事件                                 | 描述                                                                 |
| :------------------ | :----------------------------------------- | :------------------------------------------------------------------- |
| `additionalContext` | `SessionStart`, `BeforeAgent`, `AfterTool` | 将文本直接追加到代理的上下文。                                       |
| `llm_request`       | `BeforeModel`                              | 一个 `Partial<LLMRequest>` 用于覆盖发出调用的参数。                  |
| `llm_response`      | `BeforeModel`                              | 一个 **完整** 的 `LLMResponse` 用于绕过模型并提供合成结果。          |
| `llm_response`      | `AfterModel`                               | 一个 `Partial<LLMResponse>` 用于在代理看到之前修改模型的响应。       |
| `toolConfig`        | `BeforeToolSelection`                      | 包含 `mode` (`AUTO`/`ANY`/`NONE`) 和 `allowedFunctionNames` 的对象。 |

---

## 稳定模型 API

Gemini CLI 对模型交互使用解耦格式，以确保即使底层 Gemini
SDK 发生更改，Hooks 也能保持稳定。

### `LLMRequest` 对象

用于 `BeforeModel` 和 `BeforeToolSelection`。

> 💡 **注意**: 在 v1 中，模型 Hooks 主要关注文本。`content`
> 数组中提供的非文本部分（如图像或函数调用）将被转换为其字符串表示形式。

```typescript
{
  "model": string,
  "messages": Array<{
    "role": "user" | "model" | "system",
    "content": string | Array<{ "type": string, [key: string]: any }>
  }>,
  "config"?: {
    "temperature"?: number,
    "maxOutputTokens"?: number,
    "topP"?: number,
    "topK"?: number
  },
  "toolConfig"?: {
    "mode"?: "AUTO" | "ANY" | "NONE",
    "allowedFunctionNames"?: string[]
  }
}
```

### `LLMResponse` 对象

用于 `AfterModel` 以及在 `BeforeModel` 中作为合成响应。

```typescript
{
  "text"?: string,
  "candidates": Array<{
    "content": {
      "role": "model",
      "parts": string[]
    },
    "finishReason"?: "STOP" | "MAX_TOKENS" | "SAFETY" | "RECITATION" | "OTHER",
    "index"?: number,
    "safetyRatings"?: Array<{
      "category": string,
      "probability": string,
      "blocked"?: boolean
    }>
  }>,
  "usageMetadata"?: {
    "promptTokenCount"?: number,
    "candidatesTokenCount"?: number,
    "totalTokenCount"?: number
  }
}
```
