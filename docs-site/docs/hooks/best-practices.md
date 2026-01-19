# Gemini CLI 上的 Hooks: 最佳实践

本指南涵盖了在 Gemini
CLI 中开发和部署 Hooks 的安全注意事项、性能优化、调试技术和隐私注意事项。

## 性能

### 保持 Hooks 快速

Hooks 是同步运行的——慢的 Hooks 会延迟代理循环。通过使用并行操作来优化速度：

```javascript
// 顺序操作较慢
const data1 = await fetch(url1).then((r) => r.json());
const data2 = await fetch(url2).then((r) => r.json());
const data3 = await fetch(url3).then((r) => r.json());

// 首选并行操作以获得更好的性能
// 并发启动请求
const p1 = fetch(url1).then((r) => r.json());
const p2 = fetch(url2).then((r) => r.json());
const p3 = fetch(url3).then((r) => r.json());

// 等待所有结果
const [data1, data2, data3] = await Promise.all([p1, p2, p3]);
```

### 缓存昂贵操作

在调用之间存储结果以避免重复计算：

```javascript
const fs = require('fs');
const path = require('path');

const CACHE_FILE = '.gemini/hook-cache.json';

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeCache(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

async function main() {
  const cache = readCache();
  const cacheKey = `tool-list-${(Date.now() / 3600000) | 0}`; // 每小时缓存

  if (cache[cacheKey]) {
    console.log(JSON.stringify(cache[cacheKey]));
    return;
  }

  // 昂贵操作
  const result = await computeExpensiveResult();
  cache[cacheKey] = result;
  writeCache(cache);

  console.log(JSON.stringify(result));
}
```

### 使用适当的事件

选择与您的用例匹配的 Hook 事件，以避免不必要的执行。`AfterAgent`
每次代理循环完成触发一次，而 `AfterModel`
每次 LLM 调用触发一次（每次循环可能多次）：

```json
// 如果检查最终完成，使用 AfterAgent 而不是 AfterModel
{
  "hooks": {
    "AfterAgent": [
      {
        "matcher": "*",
        "hooks": [
          {
            "name": "final-checker",
            "command": "./check-completion.sh"
          }
        ]
      }
    ]
  }
}
```

### 使用匹配器过滤

使用特定的匹配器来避免不必要的 Hook 执行。不要用 `*`
匹配所有工具，而是仅指定您需要的工具：

```json
{
  "matcher": "write_file|replace",
  "hooks": [
    {
      "name": "validate-writes",
      "command": "./validate.sh"
    }
  ]
}
```

### 优化 JSON 解析

对于大型输入，使用流式 JSON 解析器以避免将所有内容加载到内存中：

```javascript
// 标准方法：解析整个输入
const input = JSON.parse(await readStdin());
const content = input.tool_input.content;

// 对于非常大的输入：流式传输并仅提取所需字段
const { createReadStream } = require('fs');
const JSONStream = require('JSONStream');

const stream = createReadStream(0).pipe(JSONStream.parse('tool_input.content'));
let content = '';
stream.on('data', (chunk) => {
  content += chunk;
});
```

## 调试

### 记录到文件

将调试信息写入专用日志文件：

```bash
#!/usr/bin/env bash
LOG_FILE=".gemini/hooks/debug.log"

// 带时间戳记录
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

input=$(cat)
log "Received input: ${input:0:100}..."

# Hook 逻辑在这里

log "Hook completed successfully"
```

### 使用 stderr 进行错误处理

stderr 上的错误消息会根据退出代码适当地显示：

```javascript
try {
  const result = dangerousOperation();
  console.log(JSON.stringify({ result }));
} catch (error) {
  console.error(`Hook error: ${error.message}`);
  process.exit(2); // 阻塞性错误
}
```

### 独立测试 Hooks

使用示例 JSON 输入手动运行 Hook 脚本：

```bash
# 创建测试输入
cat > test-input.json << 'EOF'
{
  "session_id": "test-123",
  "cwd": "/tmp/test",
  "hook_event_name": "BeforeTool",
  "tool_name": "write_file",
  "tool_input": {
    "file_path": "test.txt",
    "content": "Test content"
  }
}
EOF

# 测试 Hook
cat test-input.json | .gemini/hooks/my-hook.sh

# 检查退出代码
echo "Exit code: $?"
```

### 检查退出代码

确保您的脚本返回正确的退出代码：

```bash
#!/usr/bin/env bash
set -e  # 出错时退出

# Hook 逻辑
process_input() {
  # ...
}

if process_input; then
  echo "Success message"
  exit 0
else
  echo "Error message" >&2
  exit 2
fi
```

### 启用遥测

当启用 `telemetry.logPrompts` 时，Hook 执行会被记录：

```json
{
  "telemetry": {
    "logPrompts": true
  }
}
```

在日志中查看 Hook 遥测以调试执行问题。

### 使用 Hook 面板

`/hooks panel` 命令显示执行状态和最近的输出：

```bash
/hooks panel
```

检查：

- Hook 执行计数
- 最近的成功/失败
- 错误消息
- 执行时间

## 开发

### 从简单开始

在实施复杂逻辑之前，先从基本的日志 Hook 开始：

```bash
#!/usr/bin/env bash
# 用于理解输入结构的简单日志 Hook
input=$(cat)
echo "$input" >> .gemini/hook-inputs.log
echo "Logged input"
```

### 使用 JSON 库

使用适当的库而不是文本处理来解析 JSON：

**坏:**

```bash
# 脆弱的文本解析
tool_name=$(echo "$input" | grep -oP '"tool_name":\s*"\K[^"]+')
```

**好:**

```bash
# 健壮的 JSON 解析
tool_name=$(echo "$input" | jq -r '.tool_name')
```

### 使脚本可执行

始终使 Hook 脚本可执行：

```bash
chmod +x .gemini/hooks/*.sh
chmod +x .gemini/hooks/*.js
```

### 版本控制

提交 Hooks 以与您的团队共享：

```bash
git add .gemini/hooks/
git add .gemini/settings.json
git commit -m "Add project hooks for security and testing"
```

**`.gitignore` 注意事项:**

```gitignore
# 忽略 Hook 缓存和日志
.gemini/hook-cache.json
.gemini/hook-debug.log
.gemini/memory/session-*.jsonl

# 保留 Hook 脚本
!.gemini/hooks/*.sh
!.gemini/hooks/*.js
```

### 记录行为

添加描述以帮助他人理解您的 Hooks：

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file|replace",
        "hooks": [
          {
            "name": "secret-scanner",
            "type": "command",
            "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/block-secrets.sh",
            "description": "Scans code changes for API keys, passwords, and other secrets before writing"
          }
        ]
      }
    ]
  }
}
```

在 Hook 脚本中添加注释：

```javascript
#!/usr/bin/env node
/**
 * RAG Tool Filter Hook
 *
 * This hook reduces the tool space from 100+ tools to ~15 relevant ones
 * by extracting keywords from the user's request and filtering tools
 * based on semantic similarity.
 *
 * Performance: ~500ms average, cached tool embeddings
 * Dependencies: @google/generative-ai
 */
```

## 故障排除

### Hook 未执行

**在 `/hooks panel` 中检查 Hook 名称:**

```bash
/hooks panel
```

验证 Hook 是否出现在列表中且已启用。

**验证匹配器模式:**

```bash
# 测试正则表达式模式
echo "write_file|replace" | grep -E "write_.*|replace"
```

**检查禁用列表:**

```json
{
  "hooks": {
    "disabled": ["my-hook-name"]
  }
}
```

**确保脚本可执行:**

```bash
ls -la .gemini/hooks/my-hook.sh
chmod +x .gemini/hooks/my-hook.sh
```

**验证脚本路径:**

```bash
# 检查路径扩展
echo "$GEMINI_PROJECT_DIR/.gemini/hooks/my-hook.sh"

# 验证文件是否存在
test -f "$GEMINI_PROJECT_DIR/.gemini/hooks/my-hook.sh" && echo "File exists"
```

### Hook 超时

**检查配置的超时:**

```json
{
  "name": "slow-hook",
  "timeout": 60000
}
```

**优化慢速操作:**

```javascript
// Before: 顺序操作（慢）
for (const item of items) {
  await processItem(item);
}

// After: 并行操作（快）
await Promise.all(items.map((item) => processItem(item)));
```

**使用缓存:**

```javascript
const cache = new Map();

async function getCachedData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetchData(key);
  cache.set(key, data);
  return data;
}
```

**考虑拆分为多个更快的 Hooks:**

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file",
        "hooks": [
          {
            "name": "quick-check",
            "command": "./quick-validation.sh",
            "timeout": 1000
          }
        ]
      },
      {
        "matcher": "write_file",
        "hooks": [
          {
            "name": "deep-check",
            "command": "./deep-analysis.sh",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

### 无效的 JSON 输出

**在输出前验证 JSON:**

```bash
#!/usr/bin/env bash
output='{"decision": "allow"}'

# 验证 JSON
if echo "$output" | jq empty 2>/dev/null; then
  echo "$output"
else
  echo "Invalid JSON generated" >&2
  exit 1
fi
```

**确保正确的引用和转义:**

```javascript
// Bad: 未转义的字符串插值
const message = `User said: ${userInput}`;
console.log(JSON.stringify({ message }));

// Good: 自动转义
console.log(JSON.stringify({ message: `User said: ${userInput}` }));
```

**检查二进制数据或控制字符:**

```javascript
function sanitizeForJSON(str) {
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // 删除控制字符
}

const cleanContent = sanitizeForJSON(content);
console.log(JSON.stringify({ content: cleanContent }));
```

### 退出代码问题

**验证脚本返回正确的代码:**

```bash
#!/usr/bin/env bash
set -e  # 出错时退出

# 处理逻辑
if validate_input; then
  echo "Success"
  exit 0
else
  echo "Validation failed" >&2
  exit 2
fi
```

**检查意外错误:**

```bash
#!/usr/bin/env bash
# 如果您想显式处理错误，请不要使用 'set -e'
# set -e

if ! command_that_might_fail; then
  # 处理错误
  echo "Command failed but continuing" >&2
fi

# 始终显式退出
exit 0
```

**使用 trap 进行清理:**

```bash
#!/usr/bin/env bash

cleanup() {
  # 清理逻辑
  rm -f /tmp/hook-temp-*
}

trap cleanup EXIT

# Hook 逻辑在这里
```

### 环境变量不可用

**检查变量是否设置:**

```bash
#!/usr/bin/env bash

if [ -z "$GEMINI_PROJECT_DIR" ]; then
  echo "GEMINI_PROJECT_DIR not set" >&2
  exit 1
fi

if [ -z "$CUSTOM_VAR" ]; then
  echo "Warning: CUSTOM_VAR not set, using default" >&2
  CUSTOM_VAR="default-value"
fi
```

**调试可用变量:**

```bash
#!/usr/bin/env bash

# 列出所有环境变量
env > .gemini/hook-env.log

# 检查特定变量
echo "GEMINI_PROJECT_DIR: $GEMINI_PROJECT_DIR" >> .gemini/hook-env.log
echo "GEMINI_SESSION_ID: $GEMINI_SESSION_ID" >> .gemini/hook-env.log
echo "GEMINI_API_KEY: ${GEMINI_API_KEY:+<set>}" >> .gemini/hook-env.log
```

**使用 .env 文件:**

```bash
#!/usr/bin/env bash

# 如果存在 .env 文件，加载它
if [ -f "$GEMINI_PROJECT_DIR/.env" ]; then
  source "$GEMINI_PROJECT_DIR/.env"
fi
```

## 安全地使用 Hooks

### 威胁模型

了解 Hooks 来自何处以及它们能做什么对于安全使用至关重要。

| Hook 来源                            | 描述                                                                                            |
| :----------------------------------- | :---------------------------------------------------------------------------------------------- |
| **系统 (System)**                    | 由系统管理员配置（例如 `/etc/gemini-cli/settings.json`, `/Library/...`）。假定是 **最安全的**。 |
| **用户 (User)** (`~/.gemini/...`)    | 由您配置。您负责确保它们是安全的。                                                              |
| **扩展 (Extensions)**                | 您明确批准并安装这些。安全性取决于扩展来源（完整性）。                                          |
| **项目 (Project)** (`./.gemini/...`) | **默认不受信任。** 在受信任的内部仓库中最安全；在第三方/公共仓库中风险较高。                    |

#### 项目 Hook 安全性

当您打开一个在 `.gemini/settings.json` 中定义了 Hooks 的项目时：

1. **检测**: Gemini CLI 检测到 Hooks。
2. **识别**: 根据其 `name` 和 `command` 为每个 Hook 生成唯一身份。
3. **警告**: 如果以前从未见过此特定 Hook 身份，则会显示 **警告**。
4. **执行**: 执行 Hook（除非特定安全设置阻止它）。
5. **信任**: 该 Hook 被标记为该项目的“受信任”。

> [!IMPORTANT] **修改检测**: 如果项目 Hook 的 `command` 字符串被更改（例如，通过
> `git pull`），其身份也会更改。Gemini CLI 将将其视为 **新的、不受信任的 Hook**
> 并再次警告您。这可以防止恶意行为者悄悄地用恶意命令替换已验证的命令。

### 风险

| 风险             | 描述                                                                                                |
| :--------------- | :-------------------------------------------------------------------------------------------------- |
| **任意代码执行** | Hooks 以您的用户身份运行。它们可以做任何您能做的事情（删除文件、安装软件）。                        |
| **数据泄露**     | Hook 可以读取您的输入（提示词）、输出（代码）或环境变量 (`GEMINI_API_KEY`) 并将其发送到远程服务器。 |
| **提示词注入**   | 文件或网页中的恶意内容可能会诱骗 LLM 运行以意外方式触发 Hook 的工具。                               |

### 缓解策略

#### 验证来源

在启用它们之前，**验证**任何项目 Hooks 或扩展的**来源**。

- 对于开源项目，建议快速审查 Hook 脚本。
- 对于扩展，确保您信任作者或发布者（例如，经过验证的发布者，知名的社区成员）。
- 对来自未知来源的混淆脚本或编译二进制文件保持谨慎。

#### 清理环境

Hooks 继承 Gemini CLI 进程的环境，其中可能包括敏感的 API 密钥。Gemini
CLI 尝试清理敏感变量，但您应保持谨慎。

- **避免将环境变量打印** 到 stdout/stderr，除非必要。
- **使用 `.env` 文件** 安全地管理敏感变量，确保它们从版本控制中排除。

**系统管理员:** 您可以在系统配置（例如
`/etc/gemini-cli/settings.json`）中默认强制执行环境变量修订：

```json
{
  "security": {
    "environmentVariableRedaction": {
      "enabled": true,
      "blocked": ["MY_SECRET_KEY"],
      "allowed": ["SAFE_VAR"]
    }
  }
}
```

## 编写安全的 Hooks

在编写自己的 Hooks 时，请遵循这些实践以确保它们健壮且安全。

### 验证所有输入

永远不要信任来自 Hooks 的数据而不进行验证。Hook 输入通常来自 LLM 或用户提示词，这些可以被操纵。

```bash
#!/usr/bin/env bash
input=$(cat)

# 验证 JSON 结构
if ! echo "$input" | jq empty 2>/dev/null; then
  echo "Invalid JSON input" >&2
  exit 1
fi

# 显式验证 tool_name
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
if [[ "$tool_name" != "write_file" && "$tool_name" != "read_file" ]]; then
  echo "Unexpected tool: $tool_name" >&2
  exit 1
fi
```

### 使用超时

通过强制执行超时来防止拒绝服务（挂起的代理）。Gemini
CLI 默认为 60 秒，但您应为快速 Hooks 设置更严格的限制。

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "*",
        "hooks": [
          {
            "name": "fast-validator",
            "command": "./hooks/validate.sh",
            "timeout": 5000 // 5 seconds
          }
        ]
      }
    ]
  }
}
```

### 限制权限

以所需的最低权限运行 Hooks：

```bash
#!/usr/bin/env bash
# 不要以 root 身份运行
if [ "$EUID" -eq 0 ]; then
  echo "Hook should not run as root" >&2
  exit 1
fi

# 写入前检查文件权限
if [ -w "$file_path" ]; then
  # Safe to write
else
  echo "Insufficient permissions" >&2
  exit 1
fi
```

### 示例：秘密扫描器

使用 `BeforeTool` Hooks 防止提交敏感数据。这是增强工作流安全性的强大模式。

```javascript
const SECRET_PATTERNS = [
  /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,
  /password\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/i,
  /secret\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,
  /AKIA[0-9A-Z]{16}/, // AWS access key
  /ghp_[a-zA-Z0-9]{36}/, // GitHub personal access token
  /sk-[a-zA-Z0-9]{48}/, // OpenAI API key
];

function containsSecret(content) {
  return SECRET_PATTERNS.some((pattern) => pattern.test(content));
}
```

## 隐私注意事项

Hook 输入和输出可能包含敏感信息。Gemini CLI 遵守 `telemetry.logPrompts`
设置以进行 Hook 数据记录。

### 收集什么数据

Hook 遥测可能包括：

- **Hook 输入:** 用户提示词、工具参数、文件内容
- **Hook 输出:** Hook 响应、决策原因、添加的上下文
- **标准流:** 来自 Hook 进程的 stdout 和 stderr
- **执行元数据:** Hook 名称、事件类型、持续时间、成功/失败

### 隐私设置

**启用（默认）:**

完整的 Hook I/O 被记录到遥测。在以下情况使用：

- 开发和调试 Hooks
- 遥测重定向到受信任的企业系统
- 您了解并接受隐私影响

**禁用:**

仅记录元数据（事件名称、持续时间、成功/失败）。Hook 输入和输出被排除。在以下情况使用：

- 发送遥测到第三方系统
- 处理敏感数据
- 隐私法规要求最小化数据收集

### 配置

**在设置中禁用 PII 记录:**

```json
{
  "telemetry": {
    "logPrompts": false
  }
}
```

**通过环境变量禁用:**

```bash
export GEMINI_TELEMETRY_LOG_PROMPTS=false
```

### Hooks 中的敏感数据

如果您的 Hooks 处理敏感数据：

1. **最小化日志记录:** 不要将敏感数据写入日志文件
2. **清理输出:** 输出前删除敏感数据
3. **使用安全存储:** 静态加密敏感数据
4. **限制访问:** 限制 Hook 脚本权限

**清理示例:**

```javascript
function sanitizeOutput(data) {
  const sanitized = { ...data };

  // 删除敏感字段
  delete sanitized.apiKey;
  delete sanitized.password;

  // 修订敏感字符串
  if (sanitized.content) {
    sanitized.content = sanitized.content.replace(
      /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/gi,
      '[REDACTED]',
    );
  }

  return sanitized;
}

console.log(JSON.stringify(sanitizeOutput(hookOutput)));
```

## 了解更多

- [Hooks 参考](index.md) - 完整 API 参考
- [编写 Hooks](writing-hooks.md) - 教程和示例
- [配置](../get-started/configuration.md) - Gemini CLI 设置
- [Hooks 设计文档](../hooks-design.md) - 技术架构
