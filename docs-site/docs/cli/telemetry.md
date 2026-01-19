# 使用 OpenTelemetry 进行可观测性

了解如何为 Gemini CLI 启用和设置 OpenTelemetry。

- [使用 OpenTelemetry 进行可观测性](#observability-with-opentelemetry)
  - [主要优势](#key-benefits)
  - [OpenTelemetry 集成](#opentelemetry-integration)
  - [配置](#configuration)
  - [Google Cloud 遥测](#google-cloud-telemetry)
    - [先决条件](#prerequisites)
    - [使用 CLI 凭据进行身份验证](#authenticating-with-cli-credentials)
    - [直接导出（推荐）](#direct-export-recommended)
    - [基于收集器的导出（高级）](#collector-based-export-advanced)
    - [监控仪表板](#monitoring-dashboards)
  - [本地遥测](#local-telemetry)
    - [基于文件的输出（推荐）](#file-based-output-recommended)
    - [基于收集器的导出（高级）](#collector-based-export-advanced-1)
  - [日志和指标](#logs-and-metrics)
    - [日志](#logs)
      - [会话 (Sessions)](#sessions)
      - [工具 (Tools)](#tools)
      - [文件 (Files)](#files)
      - [API](#api)
      - [模型路由 (Model routing)](#model-routing)
      - [聊天与流式传输 (Chat and streaming)](#chat-and-streaming)
      - [弹性 (Resilience)](#resilience)
      - [扩展 (Extensions)](#extensions)
      - [代理运行 (Agent runs)](#agent-runs)
      - [IDE](#ide)
      - [UI](#ui)
    - [指标](#metrics)
      - [自定义 (Custom)](#custom)
        - [会话 (Sessions)](#sessions-1)
        - [工具 (Tools)](#tools-1)
        - [API](#api-1)
        - [Token 使用 (Token usage)](#token-usage)
        - [文件 (Files)](#files-1)
        - [聊天与流式传输 (Chat and streaming)](#chat-and-streaming-1)
        - [模型路由 (Model routing)](#model-routing-1)
        - [代理运行 (Agent runs)](#agent-runs-1)
        - [UI](#ui-1)
        - [性能 (Performance)](#performance)
      - [GenAI 语义约定](#genai-semantic-convention)

## 主要优势

- **🔍 使用情况分析**: 了解团队中的交互模式和功能采用情况
- **⚡ 性能监控**: 跟踪响应时间、Token 消耗和资源利用率
- **🐛 实时调试**: 实时识别瓶颈、故障和错误模式
- **📊 工作流优化**: 做出明智决策以改进配置和流程
- **🏢 企业治理**: 监控跨团队的使用情况、跟踪成本、确保合规性并与现有监控基础设施集成

## OpenTelemetry 集成

Gemini CLI 的可观测性系统基于
**[OpenTelemetry]**（供应商中立的行业标准可观测性框架）构建，提供：

- **通用兼容性**: 导出到任何 OpenTelemetry 后端（Google Cloud, Jaeger,
  Prometheus, Datadog 等）
- **标准化数据**: 在整个工具链中使用一致的格式和收集方法
- **面向未来的集成**: 连接现有和未来的可观测性基础设施
- **无供应商锁定**: 在不更改仪器的情况下切换后端

[OpenTelemetry]: https://opentelemetry.io/

## 配置

所有遥测行为都通过您的 `.gemini/settings.json`
文件控制。可以使用环境变量覆盖文件中的设置。

| 设置           | 环境变量                         | 描述                                    | 值                | 默认值                  |
| :------------- | :------------------------------- | :-------------------------------------- | :---------------- | :---------------------- |
| `enabled`      | `GEMINI_TELEMETRY_ENABLED`       | 启用或禁用遥测                          | `true`/`false`    | `false`                 |
| `target`       | `GEMINI_TELEMETRY_TARGET`        | 发送遥测数据的位置                      | `"gcp"`/`"local"` | `"local"`               |
| `otlpEndpoint` | `GEMINI_TELEMETRY_OTLP_ENDPOINT` | OTLP 收集器端点                         | URL 字符串        | `http://localhost:4317` |
| `otlpProtocol` | `GEMINI_TELEMETRY_OTLP_PROTOCOL` | OTLP 传输协议                           | `"grpc"`/`"http"` | `"grpc"`                |
| `outfile`      | `GEMINI_TELEMETRY_OUTFILE`       | 将遥测保存到文件（覆盖 `otlpEndpoint`） | 文件路径          | -                       |
| `logPrompts`   | `GEMINI_TELEMETRY_LOG_PROMPTS`   | 在遥测日志中包含提示词                  | `true`/`false`    | `true`                  |
| `useCollector` | `GEMINI_TELEMETRY_USE_COLLECTOR` | 使用外部 OTLP 收集器（高级）            | `true`/`false`    | `false`                 |
| `useCliAuth`   | `GEMINI_TELEMETRY_USE_CLI_AUTH`  | 使用 CLI 凭据进行遥测（仅限 GCP 目标）  | `true`/`false`    | `false`                 |

**关于布尔环境变量的说明：** 对于布尔设置（`enabled`, `logPrompts`,
`useCollector`），将相应的环境变量设置为 `true` 或 `1`
将启用该功能。任何其他值都将禁用它。

有关所有配置选项的详细信息，请参阅 [配置指南](../get-started/configuration.md)。

## Google Cloud 遥测

### 先决条件

在使用以下任一方法之前，请完成这些步骤：

1. 设置您的 Google Cloud 项目 ID：
   - 对于与推理分离项目的遥测：
     ```bash
     export OTLP_GOOGLE_CLOUD_PROJECT="your-telemetry-project-id"
     ```
   - 对于与推理在同一项目中的遥测：
     ```bash
     export GOOGLE_CLOUD_PROJECT="your-project-id"
     ```

2. 使用 Google Cloud 进行身份验证：
   - 如果使用用户账号：
     ```bash
     gcloud auth application-default login
     ```
   - 如果使用服务账号：
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account.json"
     ```
3. 确保您的账号或服务账号具有这些 IAM 角色：
   - Cloud Trace Agent
   - Monitoring Metric Writer
   - Logs Writer

4. 启用所需的 Google Cloud API（如果尚未启用）：
   ```bash
   gcloud services enable \
     cloudtrace.googleapis.com \
     monitoring.googleapis.com \
     logging.googleapis.com \
     --project="$OTLP_GOOGLE_CLOUD_PROJECT"
   ```

### 使用 CLI 凭据进行身份验证

默认情况下，Google
Cloud 的遥测收集器使用应用程序默认凭据 (ADC)。但是，您可以配置它使用与登录 Gemini
CLI 相同的 OAuth 凭据。这在未设置 ADC 的环境中很有用。

要启用此功能，请将 `telemetry` 设置中的 `useCliAuth` 属性设置为 `true`：

```json
{
  "telemetry": {
    "enabled": true,
    "target": "gcp",
    "useCliAuth": true
  }
}
```

**重要：**

- 此设置需要使用 **直接导出 (Direct Export)**（进程内导出器）。
- 它 **不能** 与 `useCollector: true`
  一起使用。如果同时启用，遥测将被禁用并记录错误。
- CLI 将自动使用您的凭据向 Google Cloud Trace, Metrics 和 Logging
  API 进行身份验证。

### 直接导出（推荐）

直接将遥测发送到 Google Cloud 服务。无需收集器。

1. 在您的 `.gemini/settings.json` 中启用遥测：
   ```json
   {
     "telemetry": {
       "enabled": true,
       "target": "gcp"
     }
   }
   ```
2. 运行 Gemini CLI 并发送提示词。
3. 查看日志和指标：
   - 发送提示词后在浏览器中打开 Google Cloud 控制台：
     - 日志: https://console.cloud.google.com/logs/
     - 指标: https://console.cloud.google.com/monitoring/metrics-explorer
     - 跟踪: https://console.cloud.google.com/traces/list

### 基于收集器的导出（高级）

对于自定义处理、过滤或路由，请使用 OpenTelemetry 收集器将数据转发到 Google
Cloud。

1. 配置您的 `.gemini/settings.json`：
   ```json
   {
     "telemetry": {
       "enabled": true,
       "target": "gcp",
       "useCollector": true
     }
   }
   ```
2. 运行自动化脚本：
   ```bash
   npm run telemetry -- --target=gcp
   ```
   这将：
   - 启动转发到 Google Cloud 的本地 OTEL 收集器
   - 配置您的工作区
   - 提供在 Google Cloud 控制台中查看跟踪、指标和日志的链接
   - 将收集器日志保存到 `~/.gemini/tmp/<projectHash>/otel/collector-gcp.log`
   - 退出时停止收集器（例如 `Ctrl+C`）
3. 运行 Gemini CLI 并发送提示词。
4. 查看日志和指标：
   - 发送提示词后在浏览器中打开 Google Cloud 控制台：
     - 日志: https://console.cloud.google.com/logs/
     - 指标: https://console.cloud.google.com/monitoring/metrics-explorer
     - 跟踪: https://console.cloud.google.com/traces/list
   - 打开 `~/.gemini/tmp/<projectHash>/otel/collector-gcp.log`
     查看本地收集器日志。

### 监控仪表板

Gemini CLI 提供了一个预配置的
[Google Cloud Monitoring](https://cloud.google.com/monitoring)
仪表板来可视化您的遥测数据。

此仪表板可以在 **Google Cloud Monitoring Dashboard Templates**
下找到，名称为 "**Gemini CLI Monitoring**"。

![Gemini CLI Monitoring Dashboard Overview](/assets/monitoring-dashboard-overview.png)

![Gemini CLI Monitoring Dashboard Metrics](/assets/monitoring-dashboard-metrics.png)

![Gemini CLI Monitoring Dashboard Logs](/assets/monitoring-dashboard-logs.png)

要了解更多信息，请查看这篇博客文章：[即时洞察：Gemini CLI 新的预配置监控仪表板](https://cloud.google.com/blog/topics/developers-practitioners/instant-insights-gemini-clis-new-pre-configured-monitoring-dashboards/)。

## 本地遥测

对于本地开发和调试，您可以在本地捕获遥测数据：

### 基于文件的输出（推荐）

1. 在您的 `.gemini/settings.json` 中启用遥测：
   ```json
   {
     "telemetry": {
       "enabled": true,
       "target": "local",
       "otlpEndpoint": "",
       "outfile": ".gemini/telemetry.log"
     }
   }
   ```
2. 运行 Gemini CLI 并发送提示词。
3. 在指定文件中查看日志和指标（例如 `.gemini/telemetry.log`）。

### 基于收集器的导出（高级）

1. 运行自动化脚本：
   ```bash
   npm run telemetry -- --target=local
   ```
   这将：
   - 下载并启动 Jaeger 和 OTEL 收集器
   - 为本地遥测配置您的工作区
   - 在 http://localhost:16686 提供 Jaeger UI
   - 将日志/指标保存到 `~/.gemini/tmp/<projectHash>/otel/collector.log`
   - 退出时停止收集器（例如 `Ctrl+C`）
2. 运行 Gemini CLI 并发送提示词。
3. 在 http://localhost:16686 查看跟踪，并在收集器日志文件中查看日志/指标。

## 日志和指标

以下部分描述了为 Gemini CLI 生成的日志和指标的结构。

`session.id`, `installation.id` 和
`user.email`（仅在使用 Google 账号验证时可用）作为公共属性包含在所有日志和指标中。

### 日志

日志是特定事件的带时间戳记录。Gemini CLI 记录以下事件，按类别分组。

#### 会话 (Sessions)

捕获启动配置和用户提示词提交。

- `gemini_cli.config`: 启动时发出一次，包含 CLI 配置。
  - **属性**:
    - `model` (string)
    - `embedding_model` (string)
    - `sandbox_enabled` (boolean)
    - `core_tools_enabled` (string)
    - `approval_mode` (string)
    - `api_key_enabled` (boolean)
    - `vertex_ai_enabled` (boolean)
    - `log_user_prompts_enabled` (boolean)
    - `file_filtering_respect_git_ignore` (boolean)
    - `debug_mode` (boolean)
    - `mcp_servers` (string)
    - `mcp_servers_count` (int)
    - `extensions` (string)
    - `extension_ids` (string)
    - `extension_count` (int)
    - `mcp_tools` (string, 如果适用)
    - `mcp_tools_count` (int, 如果适用)
    - `output_format` ("text", "json", 或 "stream-json")

- `gemini_cli.user_prompt`: 当用户提交提示词时发出。
  - **属性**:
    - `prompt_length` (int)
    - `prompt_id` (string)
    - `prompt` (string; 如果 `telemetry.logPrompts` 为 `false` 则排除)
    - `auth_type` (string)

#### 工具 (Tools)

捕获工具执行、输出截断和编辑行为。

- `gemini_cli.tool_call`: 为每个工具（函数）调用发出。
  - **属性**:
    - `function_name`
    - `function_args`
    - `duration_ms`
    - `success` (boolean)
    - `decision` ("accept", "reject", "auto_accept", 或 "modify", 如果适用)
    - `error` (如果适用)
    - `error_type` (如果适用)
    - `prompt_id` (string)
    - `tool_type` ("native" 或 "mcp")
    - `mcp_server_name` (string, 如果适用)
    - `extension_name` (string, 如果适用)
    - `extension_id` (string, 如果适用)
    - `content_length` (int, 如果适用)
    - `metadata` (如果适用)

- `gemini_cli.tool_output_truncated`: 工具调用的输出被截断。
  - **属性**:
    - `tool_name` (string)
    - `original_content_length` (int)
    - `truncated_content_length` (int)
    - `threshold` (int)
    - `lines` (int)
    - `prompt_id` (string)

- `gemini_cli.edit_strategy`: 选择的编辑策略。
  - **属性**:
    - `strategy` (string)

- `gemini_cli.edit_correction`: 编辑修正结果。
  - **属性**:
    - `correction` ("success" | "failure")

- `gen_ai.client.inference.operation.details`: 此事件提供有关 GenAI 操作的详细信息，与
  [OpenTelemetry GenAI 事件语义约定] 一致。
  - **属性**:
    - `gen_ai.request.model` (string)
    - `gen_ai.provider.name` (string)
    - `gen_ai.operation.name` (string)
    - `gen_ai.input.messages` (json string)
    - `gen_ai.output.messages` (json string)
    - `gen_ai.response.finish_reasons` (array of strings)
    - `gen_ai.usage.input_tokens` (int)
    - `gen_ai.usage.output_tokens` (int)
    - `gen_ai.request.temperature` (float)
    - `gen_ai.request.top_p` (float)
    - `gen_ai.request.top_k` (int)
    - `gen_ai.request.max_tokens` (int)
    - `gen_ai.system_instructions` (json string)
    - `server.address` (string)
    - `server.port` (int)

#### 文件 (Files)

跟踪工具执行的文件操作。

- `gemini_cli.file_operation`: 为每个文件操作发出。
  - **属性**:
    - `tool_name` (string)
    - `operation` ("create" | "read" | "update")
    - `lines` (int, 可选)
    - `mimetype` (string, 可选)
    - `extension` (string, 可选)
    - `programming_language` (string, 可选)

#### API

捕获 Gemini API 请求、响应和错误。

- `gemini_cli.api_request`: 发送到 Gemini API 的请求。
  - **属性**:
    - `model` (string)
    - `prompt_id` (string)
    - `request_text` (string, 可选)

- `gemini_cli.api_response`: 从 Gemini API 接收到的响应。
  - **属性**:
    - `model` (string)
    - `status_code` (int|string)
    - `duration_ms` (int)
    - `input_token_count` (int)
    - `output_token_count` (int)
    - `cached_content_token_count` (int)
    - `thoughts_token_count` (int)
    - `tool_token_count` (int)
    - `total_token_count` (int)
    - `response_text` (string, 可选)
    - `prompt_id` (string)
    - `auth_type` (string)
    - `finish_reasons` (array of strings)

- `gemini_cli.api_error`: API 请求失败。
  - **属性**:
    - `model` (string)
    - `error` (string)
    - `error_type` (string)
    - `status_code` (int|string)
    - `duration_ms` (int)
    - `prompt_id` (string)
    - `auth_type` (string)

- `gemini_cli.malformed_json_response`: `generateJson` 响应无法解析。
  - **属性**:
    - `model` (string)

#### 模型路由 (Model routing)

- `gemini_cli.slash_command`: 执行了斜杠命令。
  - **属性**:
    - `command` (string)
    - `subcommand` (string, 可选)
    - `status` ("success" | "error")

- `gemini_cli.slash_command.model`: 通过斜杠命令选择了模型。
  - **属性**:
    - `model_name` (string)

- `gemini_cli.model_routing`: 模型路由器做出了决定。
  - **属性**:
    - `decision_model` (string)
    - `decision_source` (string)
    - `routing_latency_ms` (int)
    - `reasoning` (string, 可选)
    - `failed` (boolean)
    - `error_message` (string, 可选)

#### 聊天与流式传输 (Chat and streaming)

- `gemini_cli.chat_compression`: 聊天上下文被压缩。
  - **属性**:
    - `tokens_before` (int)
    - `tokens_after` (int)

- `gemini_cli.chat.invalid_chunk`: 从流中接收到无效块。
  - **属性**:
    - `error.message` (string, 可选)

- `gemini_cli.chat.content_retry`: 由于内容错误触发重试。
  - **属性**:
    - `attempt_number` (int)
    - `error_type` (string)
    - `retry_delay_ms` (int)
    - `model` (string)

- `gemini_cli.chat.content_retry_failure`: 所有内容重试均失败。
  - **属性**:
    - `total_attempts` (int)
    - `final_error_type` (string)
    - `total_duration_ms` (int, 可选)
    - `model` (string)

- `gemini_cli.conversation_finished`: 对话会话结束。
  - **属性**:
    - `approvalMode` (string)
    - `turnCount` (int)

- `gemini_cli.next_speaker_check`: 下一位发言者确定。
  - **属性**:
    - `prompt_id` (string)
    - `finish_reason` (string)
    - `result` (string)

#### 弹性 (Resilience)

记录模型和网络操作的回退机制。

- `gemini_cli.flash_fallback`: 切换到 Flash 模型作为回退。
  - **属性**:
    - `auth_type` (string)

- `gemini_cli.ripgrep_fallback`: 切换到 grep 作为文件搜索的回退。
  - **属性**:
    - `error` (string, 可选)

- `gemini_cli.web_fetch_fallback_attempt`: 尝试 web-fetch 回退。
  - **属性**:
    - `reason` ("private_ip" | "primary_failed")

#### 扩展 (Extensions)

跟踪扩展生命周期和设置更改。

- `gemini_cli.extension_install`: 安装了扩展。
  - **属性**:
    - `extension_name` (string)
    - `extension_version` (string)
    - `extension_source` (string)
    - `status` (string)

- `gemini_cli.extension_uninstall`: 卸载了扩展。
  - **属性**:
    - `extension_name` (string)
    - `status` (string)

- `gemini_cli.extension_enable`: 启用了扩展。
  - **属性**:
    - `extension_name` (string)
    - `setting_scope` (string)

- `gemini_cli.extension_disable`: 禁用了扩展。
  - **属性**:
    - `extension_name` (string)
    - `setting_scope` (string)

- `gemini_cli.extension_update`: 更新了扩展。
  - **属性**:
    - `extension_name` (string)
    - `extension_version` (string)
    - `extension_previous_version` (string)
    - `extension_source` (string)
    - `status` (string)

#### 代理运行 (Agent runs)

- `gemini_cli.agent.start`: 代理运行开始。
  - **属性**:
    - `agent_id` (string)
    - `agent_name` (string)

- `gemini_cli.agent.finish`: 代理运行结束。
  - **属性**:
    - `agent_id` (string)
    - `agent_name` (string)
    - `duration_ms` (int)
    - `turn_count` (int)
    - `terminate_reason` (string)

#### IDE

捕获 IDE 连接和对话生命周期事件。

- `gemini_cli.ide_connection`: IDE 伴侣连接。
  - **属性**:
    - `connection_type` (string)

#### UI

跟踪终端渲染问题和相关信号。

- `kitty_sequence_overflow`: 终端 Kitty 控制序列溢出。
  - **属性**:
    - `sequence_length` (int)
    - `truncated_sequence` (string)

### 指标

指标是一段时间内行为的数值度量。

#### 自定义 (Custom)

##### 会话 (Sessions)

启动时计数 CLI 会话。

- `gemini_cli.session.count` (Counter, Int): 每次 CLI 启动递增一次。

##### 工具 (Tools)

测量工具使用情况和延迟。

- `gemini_cli.tool.call.count` (Counter, Int): 计数工具调用。
  - **属性**:
    - `function_name`
    - `success` (boolean)
    - `decision` (string: "accept", "reject",
      "modify", 或 "auto_accept", 如果适用)
    - `tool_type` (string: "mcp" 或 "native", 如果适用)

- `gemini_cli.tool.call.latency` (Histogram, ms): 测量工具调用延迟。
  - **属性**:
    - `function_name`

##### API

跟踪 API 请求量和延迟。

- `gemini_cli.api.request.count` (Counter, Int): 计数所有 API 请求。
  - **属性**:
    - `model`
    - `status_code`
    - `error_type` (如果适用)

- `gemini_cli.api.request.latency` (Histogram, ms): 测量 API 请求延迟。
  - **属性**:
    - `model`
  - 注意: 与 `gen_ai.client.operation.duration` (GenAI 约定) 重叠。

##### Token 使用 (Token usage)

跟踪按模型和类型使用的 token。

- `gemini_cli.token.usage` (Counter, Int): 计数使用的 token。
  - **属性**:
    - `model`
    - `type` ("input", "output", "thought", "cache", 或 "tool")
  - 注意: 与 `gen_ai.client.token.usage` 的 `input`/`output` 重叠。

##### 文件 (Files)

计数带有基本上下文的文件操作。

- `gemini_cli.file.operation.count` (Counter, Int): 计数文件操作。
  - **属性**:
    - `operation` ("create", "read", "update")
    - `lines` (Int, 可选)
    - `mimetype` (string, 可选)
    - `extension` (string, 可选)
    - `programming_language` (string, 可选)

- `gemini_cli.lines.changed` (Counter, Int): 更改的行数（来自文件差异）。
  - **属性**:
    - `function_name`
    - `type` ("added" 或 "removed")

##### 聊天与流式传输 (Chat and streaming)

压缩、无效块和重试的弹性计数器。

- `gemini_cli.chat_compression` (Counter, Int): 计数聊天压缩操作。
  - **属性**:
    - `tokens_before` (Int)
    - `tokens_after` (Int)

- `gemini_cli.chat.invalid_chunk.count` (Counter, Int): 计数来自流的无效块。

- `gemini_cli.chat.content_retry.count` (Counter,
  Int): 计数由于内容错误导致的重试。

- `gemini_cli.chat.content_retry_failure.count` (Counter,
  Int): 计数所有内容重试均失败的请求。

##### 模型路由 (Model routing)

路由延迟/故障和斜杠命令选择。

- `gemini_cli.slash_command.model.call_count` (Counter,
  Int): 计数通过斜杠命令选择的模型。
  - **属性**:
    - `slash_command.model.model_name` (string)

- `gemini_cli.model_routing.latency` (Histogram, ms): 模型路由决策延迟。
  - **属性**:
    - `routing.decision_model` (string)
    - `routing.decision_source` (string)

- `gemini_cli.model_routing.failure.count` (Counter, Int): 计数模型路由故障。
  - **属性**:
    - `routing.decision_source` (string)
    - `routing.error_message` (string)

##### 代理运行 (Agent runs)

代理生命周期指标：运行、持续时间和轮数。

- `gemini_cli.agent.run.count` (Counter, Int): 计数代理运行。
  - **属性**:
    - `agent_name` (string)
    - `terminate_reason` (string)

- `gemini_cli.agent.duration` (Histogram, ms): 代理运行持续时间。
  - **属性**:
    - `agent_name` (string)

- `gemini_cli.agent.turns` (Histogram, turns): 每次代理运行的轮数。
  - **属性**:
    - `agent_name` (string)

##### UI

UI 稳定性信号，例如闪烁计数。

- `gemini_cli.ui.flicker.count` (Counter,
  Int): 计数闪烁的 UI 帧（渲染高度超过终端）。

##### 性能 (Performance)

针对启动、CPU/内存和阶段计时的可选性能监控。

- `gemini_cli.startup.duration` (Histogram, ms): 按阶段划分的 CLI 启动时间。
  - **属性**:
    - `phase` (string)
    - `details` (map, 可选)

- `gemini_cli.memory.usage` (Histogram, bytes): 内存使用情况。
  - **属性**:
    - `memory_type` ("heap_used", "heap_total", "external", "rss")
    - `component` (string, 可选)

- `gemini_cli.cpu.usage` (Histogram, percent): CPU 使用率百分比。
  - **属性**:
    - `component` (string, 可选)

- `gemini_cli.tool.queue.depth` (Histogram, count): 执行队列中的工具数量。

- `gemini_cli.tool.execution.breakdown` (Histogram, ms): 按阶段划分的工具时间。
  - **属性**:
    - `function_name` (string)
    - `phase` ("validation", "preparation", "execution", "result_processing")

- `gemini_cli.api.request.breakdown` (Histogram,
  ms): 按阶段划分的 API 请求时间。
  - **属性**:
    - `model` (string)
    - `phase` ("request_preparation", "network_latency", "response_processing",
      "token_processing")

- `gemini_cli.token.efficiency` (Histogram, ratio): Token 效率指标。
  - **属性**:
    - `model` (string)
    - `metric` (string)
    - `context` (string, 可选)

- `gemini_cli.performance.score` (Histogram, score): 综合性能得分。
  - **属性**:
    - `category` (string)
    - `baseline` (number, 可选)

- `gemini_cli.performance.regression` (Counter, Int): 回归检测事件。
  - **属性**:
    - `metric` (string)
    - `severity` ("low", "medium", "high")
    - `current_value` (number)
    - `baseline_value` (number)

- `gemini_cli.performance.regression.percentage_change` (Histogram,
  percent): 检测到回归时与基线的百分比变化。
  - **属性**:
    - `metric` (string)
    - `severity` ("low", "medium", "high")
    - `current_value` (number)
    - `baseline_value` (number)

- `gemini_cli.performance.baseline.comparison` (Histogram,
  percent): 与基线的比较。
  - **属性**:
    - `metric` (string)
    - `category` (string)
    - `current_value` (number)
    - `baseline_value` (number)

#### GenAI 语义约定

以下指标符合 [OpenTelemetry GenAI
语义约定]，用于跨 GenAI 应用程序的标准化可观测性：

- `gen_ai.client.token.usage` (Histogram,
  token): 每次操作使用的输入和输出 token 数。
  - **属性**:
    - `gen_ai.operation.name` (string): 操作类型 (例如 "generate_content",
      "chat")
    - `gen_ai.provider.name` (string):
      GenAI 提供商 ("gcp.gen_ai" 或 "gcp.vertex_ai")
    - `gen_ai.token.type` (string): token 类型 ("input" 或 "output")
    - `gen_ai.request.model` (string, 可选): 请求使用的模型名称
    - `gen_ai.response.model` (string, 可选): 生成响应的模型名称
    - `server.address` (string, 可选): GenAI 服务器地址
    - `server.port` (int, 可选): GenAI 服务器端口

- `gen_ai.client.operation.duration` (Histogram, s): GenAI 操作持续时间（秒）。
  - **属性**:
    - `gen_ai.operation.name` (string): 操作类型 (例如 "generate_content",
      "chat")
    - `gen_ai.provider.name` (string):
      GenAI 提供商 ("gcp.gen_ai" 或 "gcp.vertex_ai")
    - `gen_ai.request.model` (string, 可选): 请求使用的模型名称
    - `gen_ai.response.model` (string, 可选): 生成响应的模型名称
    - `server.address` (string, 可选): GenAI 服务器地址
    - `server.port` (int, 可选): GenAI 服务器端口
    - `error.type` (string, 可选): 如果操作失败的错误类型

[OpenTelemetry GenAI semantic conventions]:
  https://github.com/open-telemetry/semantic-conventions/blob/main/docs/gen-ai/gen-ai-metrics.md
[OpenTelemetry GenAI semantic conventions for events]:
  https://github.com/open-telemetry/semantic-conventions/blob/8b4f210f43136e57c1f6f47292eb6d38e3bf30bb/docs/gen-ai/gen-ai-events.md
