# 无头模式 (Headless mode)

无头模式允许您从命令行脚本和自动化工具以编程方式运行 Gemini
CLI，而无需任何交互式 UI。这对于脚本编写、自动化、CI/CD 管道和构建 AI 驱动的工具非常理想。

- [无头模式](#headless-mode)
  - [概览](#overview)
  - [基本用法](#basic-usage)
    - [直接提示](#direct-prompts)
    - [Stdin 输入](#stdin-input)
    - [结合文件输入](#combining-with-file-input)
  - [输出格式](#output-formats)
    - [文本输出（默认）](#text-output-default)
    - [JSON 输出](#json-output)
      - [响应 Schema](#response-schema)
      - [用法示例](#example-usage)
    - [流式 JSON 输出](#streaming-json-output)
      - [何时使用流式 JSON](#when-to-use-streaming-json)
      - [事件类型](#event-types)
      - [基本用法](#basic-usage-1)
      - [输出示例](#example-output)
      - [处理流事件](#processing-stream-events)
      - [实际示例](#real-world-examples)
    - [文件重定向](#file-redirection)
  - [配置选项](#configuration-options)
  - [示例](#examples)
    - [代码审查](#code-review)
    - [生成提交消息](#generate-commit-messages)
    - [API 文档](#api-documentation)
    - [批量代码分析](#batch-code-analysis)
    - [日志分析](#log-analysis)
    - [发布说明生成](#release-notes-generation)
    - [模型和工具使用情况跟踪](#model-and-tool-usage-tracking)
  - [资源](#resources)

## 概览

无头模式为 Gemini CLI 提供了一个无头接口，该接口：

- 通过命令行参数或 stdin 接受提示词
- 返回结构化输出（文本或 JSON）
- 支持文件重定向和管道
- 启用自动化和脚本工作流
- 为错误处理提供一致的退出代码

## 基本用法

### 直接提示

使用 `--prompt` (或 `-p`) 标志以无头模式运行：

```bash
gemini --prompt "What is machine learning?"
```

### Stdin 输入

从终端将输入通过管道传输到 Gemini CLI：

```bash
echo "Explain this code" | gemini
```

### 结合文件输入

从文件读取并使用 Gemini 处理：

```bash
cat README.md | gemini --prompt "Summarize this documentation"
```

## 输出格式

### 文本输出（默认）

标准的人类可读输出：

```bash
gemini -p "What is the capital of France?"
```

响应格式：

```
The capital of France is Paris.
```

### JSON 输出

返回包括响应、统计信息和元数据在内的结构化数据。此格式非常适合程序化处理和自动化脚本。

#### 响应 Schema

JSON 输出遵循以下高级结构：

```json
{
  "response": "string", // AI 生成的回答您提示的主要内容
  "stats": {
    // 使用指标和性能数据
    "models": {
      // 每个模型的 API 和 token 使用统计
      "[model-name]": {
        "api": {
          /* 请求计数、错误、延迟 */
        },
        "tokens": {
          /* 提示词、响应、缓存、总计数 */
        }
      }
    },
    "tools": {
      // 工具执行统计
      "totalCalls": "number",
      "totalSuccess": "number",
      "totalFail": "number",
      "totalDurationMs": "number",
      "totalDecisions": {
        /* 接受、拒绝、修改、自动接受计数 */
      },
      "byName": {
        /* 每个工具的详细统计 */
      }
    },
    "files": {
      // 文件修改统计
      "totalLinesAdded": "number",
      "totalLinesRemoved": "number"
    }
  },
  "error": {
    // 仅当发生错误时出现
    "type": "string", // 错误类型 (例如 "ApiError", "AuthError")
    "message": "string", // 人类可读的错误描述
    "code": "number" // 可选的错误代码
  }
}
```

#### 用法示例

```bash
gemini -p "What is the capital of France?" --output-format json
```

响应：

```json
{
  "response": "The capital of France is Paris.",
  "stats": {
    "models": {
      "gemini-2.5-pro": {
        "api": {
          "totalRequests": 2,
          "totalErrors": 0,
          "totalLatencyMs": 5053
        },
        "tokens": {
          "prompt": 24939,
          "candidates": 20,
          "total": 25113,
          "cached": 21263,
          "thoughts": 154,
          "tool": 0
        }
      },
      "gemini-2.5-flash": {
        "api": {
          "totalRequests": 1,
          "totalErrors": 0,
          "totalLatencyMs": 1879
        },
        "tokens": {
          "prompt": 8965,
          "candidates": 10,
          "total": 9033,
          "cached": 0,
          "thoughts": 30,
          "tool": 28
        }
      }
    },
    "tools": {
      "totalCalls": 1,
      "totalSuccess": 1,
      "totalFail": 0,
      "totalDurationMs": 1881,
      "totalDecisions": {
        "accept": 0,
        "reject": 0,
        "modify": 0,
        "auto_accept": 1
      },
      "byName": {
        "google_web_search": {
          "count": 1,
          "success": 1,
          "fail": 0,
          "durationMs": 1881,
          "decisions": {
            "accept": 0,
            "reject": 0,
            "modify": 0,
            "auto_accept": 1
          }
        }
      }
    },
    "files": {
      "totalLinesAdded": 0,
      "totalLinesRemoved": 0
    }
  }
}
```

### 流式 JSON 输出

以换行符分隔的 JSON
(JSONL) 形式返回实时事件。每个重要的动作（初始化、消息、工具调用、结果）在发生时立即发出。此格式非常适合监控长时间运行的操作、构建具有实时进度的 UI 以及创建对事件做出反应的自动化管道。

#### 何时使用流式 JSON

在以下情况下使用 `--output-format stream-json`：

- **实时进度监控** - 在工具调用和响应发生时查看它们
- **事件驱动的自动化** - 对特定事件（例如工具故障）做出反应
- **实时 UI 更新** - 构建实时显示 AI 代理活动的界面
- **详细的执行日志** - 捕获带有时间戳的完整交互历史记录
- **管道集成** - 将事件流式传输到日志记录/监控系统

#### 事件类型

流式格式发出 6 种事件类型：

1. **`init`** - 会话开始（包括 session_id, model）
2. **`message`** - 用户提示词和助手响应
3. **`tool_use`** - 带有参数的工具调用请求
4. **`tool_result`** - 工具执行结果（成功/错误）
5. **`error`** - 非致命错误和警告
6. **`result`** - 带有聚合统计信息的最终会话结果

#### 基本用法

```bash
# 将事件流式传输到控制台
gemini --output-format stream-json --prompt "What is 2+2?"

# 将事件流保存到文件
gemini --output-format stream-json --prompt "Analyze this code" > events.jsonl

# 使用 jq 解析
gemini --output-format stream-json --prompt "List files" | jq -r '.type'
```

#### 输出示例

每一行都是一个完整的 JSON 事件：

```jsonl
{"type":"init","timestamp":"2025-10-10T12:00:00.000Z","session_id":"abc123","model":"gemini-2.0-flash-exp"}
{"type":"message","role":"user","content":"List files in current directory","timestamp":"2025-10-10T12:00:01.000Z"}
{"type":"tool_use","tool_name":"Bash","tool_id":"bash-123","parameters":{"command":"ls -la"},"timestamp":"2025-10-10T12:00:02.000Z"}
{"type":"tool_result","tool_id":"bash-123","status":"success","output":"file1.txt\nfile2.txt","timestamp":"2025-10-10T12:00:03.000Z"}
{"type":"message","role":"assistant","content":"Here are the files...","delta":true,"timestamp":"2025-10-10T12:00:04.000Z"}
{"type":"result","status":"success","stats":{"total_tokens":250,"input_tokens":50,"output_tokens":200,"duration_ms":3000,"tool_calls":1},"timestamp":"2025-10-10T12:00:05.000Z"}
```

### 文件重定向

将输出保存到文件或通过管道传输到其他命令：

```bash
# 保存到文件
gemini -p "Explain Docker" > docker-explanation.txt
gemini -p "Explain Docker" --output-format json > docker-explanation.json

# 追加到文件
gemini -p "Add more details" >> docker-explanation.txt

# 管道传输到其他工具
gemini -p "What is Kubernetes?" --output-format json | jq '.response'
gemini -p "Explain microservices" | wc -w
gemini -p "List programming languages" | grep -i "python"
```

## 配置选项

无头使用的关键命令行选项：

| 选项                    | 描述                      | 示例                                               |
| :---------------------- | :------------------------ | :------------------------------------------------- |
| `--prompt`, `-p`        | 以无头模式运行            | `gemini -p "query"`                                |
| `--output-format`       | 指定输出格式 (text, json) | `gemini -p "query" --output-format json`           |
| `--model`, `-m`         | 指定 Gemini 模型          | `gemini -p "query" -m gemini-2.5-flash`            |
| `--debug`, `-d`         | 启用调试模式              | `gemini -p "query" --debug`                        |
| `--include-directories` | 包含其他目录              | `gemini -p "query" --include-directories src,docs` |
| `--yolo`, `-y`          | 自动批准所有操作          | `gemini -p "query" --yolo`                         |
| `--approval-mode`       | 设置批准模式              | `gemini -p "query" --approval-mode auto_edit`      |

有关所有可用配置选项、设置文件和环境变量的完整详细信息，请参阅
[配置指南](../get-started/configuration.md)。

## 示例

#### 代码审查

```bash
cat src/auth.py | gemini -p "Review this authentication code for security issues" > security-review.txt
```

#### 生成提交消息

```bash
result=$(git diff --cached | gemini -p "Write a concise commit message for these changes" --output-format json)
echo "$result" | jq -r '.response'
```

#### API 文档

```bash
result=$(cat api/routes.js | gemini -p "Generate OpenAPI spec for these routes" --output-format json)
echo "$result" | jq -r '.response' > openapi.json
```

#### 批量代码分析

```bash
for file in src/*.py; do
    echo "Analyzing $file..."
    result=$(cat "$file" | gemini -p "Find potential bugs and suggest improvements" --output-format json)
    echo "$result" | jq -r '.response' > "reports/$(basename "$file").analysis"
    echo "Completed analysis for $(basename "$file")" >> reports/progress.log
done
```

#### 日志分析

```bash
grep "ERROR" /var/log/app.log | tail -20 | gemini -p "Analyze these errors and suggest root cause and fixes" > error-analysis.txt
```

#### 发布说明生成

```bash
result=$(git log --oneline v1.0.0..HEAD | gemini -p "Generate release notes from these commits" --output-format json)
response=$(echo "$result" | jq -r '.response')
echo "$response"
echo "$response" >> CHANGELOG.md
```

#### 模型和工具使用情况跟踪

```bash
result=$(gemini -p "Explain this database schema" --include-directories db --output-format json)
total_tokens=$(echo "$result" | jq -r '.stats.models // {} | to_entries | map(.value.tokens.total) | add // 0')
models_used=$(echo "$result" | jq -r '.stats.models // {} | keys | join(", ") | if . == "" then "none" else . end')
tool_calls=$(echo "$result" | jq -r '.stats.tools.totalCalls // 0')
tools_used=$(echo "$result" | jq -r '.stats.tools.byName // {} | keys | join(", ") | if . == "" then "none" else . end')
echo "$(date): $total_tokens tokens, $tool_calls tool calls ($tools_used) used with models: $models_used" >> usage.log
echo "$result" | jq -r '.response' > schema-docs.md
echo "Recent usage trends:"
tail -5 usage.log
```

## 资源

- [CLI 配置](../get-started/configuration.md) - 完整配置指南
- [身份验证](../get-started/authentication.md) - 设置身份验证
- [命令](./commands.md) - 交互式命令参考
- [教程](./tutorials.md) - 分步自动化指南
