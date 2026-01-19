# 为 Gemini CLI 编写 Hooks

本指南将指导您为 Gemini
CLI 创建 Hooks，从简单的日志 Hook 到演示所有 Hook 事件协同工作的综合工作流助手。

## 先决条件

在开始之前，请确保您拥有：

- 已安装并配置 Gemini CLI
- 对 Shell 脚本或 JavaScript/Node.js 的基本了解
- 熟悉用于 Hook 输入/输出的 JSON

## 快速入门

让我们创建一个简单的 Hook 来记录所有工具执行，以了解基础知识。

### 步骤 1: 创建您的 Hook 脚本

创建一个用于 Hooks 的目录和一个简单的日志脚本：

```bash
mkdir -p .gemini/hooks
cat > .gemini/hooks/log-tools.sh << 'EOF'
#!/usr/bin/env bash
# 从 stdin 读取 Hook 输入
input=$(cat)

# 提取工具名称
tool_name=$(echo "$input" | jq -r '.tool_name')

# 记录到文件
echo "[$(date)] Tool executed: $tool_name" >> .gemini/tool-log.txt

# 返回成功 (exit 0) - 输出在记录模式下显示给用户
echo "Logged: $tool_name"
EOF

chmod +x .gemini/hooks/log-tools.sh
```

### 步骤 2: 配置 Hook

将 Hook 配置添加到 `.gemini/settings.json`：

```json
{
  "hooks": {
    "AfterTool": [
      {
        "matcher": "*",
        "hooks": [
          {
            "name": "tool-logger",
            "type": "command",
            "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/log-tools.sh",
            "description": "Log all tool executions"
          }
        ]
      }
    ]
  }
}
```

### 步骤 3: 测试您的 Hook

运行 Gemini CLI 并执行任何使用工具的命令：

```
> Read the README.md file

[Agent uses read_file tool]

Logged: read_file
```

检查 `.gemini/tool-log.txt` 以查看记录的工具执行。

## 实际示例

### 安全：阻止提交中的秘密

防止提交包含 API 密钥或密码的文件。

**`.gemini/hooks/block-secrets.sh`:**

```bash
#!/usr/bin/env bash
input=$(cat)

# 提取正在写入的内容
content=$(echo "$input" | jq -r '.tool_input.content // .tool_input.new_string // ""')

# 检查秘密
if echo "$content" | grep -qE 'api[_-]?key|password|secret'; then
  echo '{"decision":"deny","reason":"Potential secret detected"}' >&2
  exit 2
fi

exit 0
```

**`.gemini/settings.json`:**

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
            "description": "Prevent committing secrets"
          }
        ]
      }
    ]
  }
}
```

### 代码更改后自动测试

当代码文件被修改时自动运行测试。

**`.gemini/hooks/auto-test.sh`:**

```bash
#!/usr/bin/env bash
input=$(cat)

file_path=$(echo "$input" | jq -r '.tool_input.file_path')

# 仅测试 .ts 文件
if [[ ! "$file_path" =~ \.ts$ ]]; then
  exit 0
fi

# 查找相应的测试文件
test_file="${file_path%.ts}.test.ts"

if [ ! -f "$test_file" ]; then
  echo "⚠️ No test file found"
  exit 0
fi

# 运行测试
if npx vitest run "$test_file" --silent 2>&1 | head -20; then
  echo "✅ Tests passed"
else
  echo "❌ Tests failed"
fi

exit 0
```

**`.gemini/settings.json`:**

```json
{
  "hooks": {
    "AfterTool": [
      {
        "matcher": "write_file|replace",
        "hooks": [
          {
            "name": "auto-test",
            "type": "command",
            "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/auto-test.sh",
            "description": "Run tests after code changes"
          }
        ]
      }
    ]
  }
}
```

### 动态上下文注入

在每次代理交互之前添加相关的项目上下文。

**`.gemini/hooks/inject-context.sh`:**

```bash
#!/usr/bin/env bash

# 获取最近的 git 提交作为上下文
context=$(git log -5 --oneline 2>/dev/null || echo "No git history")

# 作为 JSON 返回
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "BeforeAgent",
    "additionalContext": "Recent commits:\n$context"
  }
}
EOF
```

**`.gemini/settings.json`:**

```json
{
  "hooks": {
    "BeforeAgent": [
      {
        "matcher": "*",
        "hooks": [
          {
            "name": "git-context",
            "type": "command",
            "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/inject-context.sh",
            "description": "Inject git commit history"
          }
        ]
      }
    ]
  }
}
```

## 高级功能

### 基于 RAG 的工具过滤

使用 `BeforeToolSelection`
根据当前任务智能减少工具空间。不要将所有 100+ 个工具发送给模型，而是使用语义搜索或关键字匹配过滤到最相关的约 15 个工具。

这改进了：

- **模型准确性:** 较少的相似工具减少混淆
- **响应速度:** 较小的工具空间处理速度更快
- **成本效率:** 每个请求使用的 token 更少

### 跨会话记忆

使用 `SessionStart` 和 `SessionEnd` Hooks 在会话之间维护持久知识：

- **SessionStart:** 加载以前会话的相关记忆
- **AfterModel:** 记录会话期间的重要交互
- **SessionEnd:** 提取学习内容并存储以备将来使用

这使助手能够学习项目约定、记住重要决策并在团队成员之间共享知识。

### Hook 链

同一事件的多个 Hooks 按声明的顺序运行。每个 Hook 都可以建立在先前 Hooks 的输出之上：

```json
{
  "hooks": {
    "BeforeAgent": [
      {
        "matcher": "*",
        "hooks": [
          {
            "name": "load-memories",
            "type": "command",
            "command": "./hooks/load-memories.sh"
          },
          {
            "name": "analyze-sentiment",
            "type": "command",
            "command": "./hooks/analyze-sentiment.sh"
          }
        ]
      }
    ]
  }
}
```

## 完整示例：智能开发工作流助手

这个综合示例演示了所有 Hook 事件如何与两个高级功能协同工作：

- **基于 RAG 的工具选择:** 每个任务将 100+ 个工具减少到约 15 个相关工具
- **跨会话记忆:** 学习并持久化项目知识

### 架构

```
SessionStart → 初始化记忆 & 索引工具
     ↓
BeforeAgent → 注入相关记忆
     ↓
BeforeModel → 添加系统说明
     ↓
BeforeToolSelection → 通过 RAG 过滤工具
     ↓
BeforeTool → 验证安全性
     ↓
AfterTool → 运行自动测试
     ↓
AfterModel → 记录交互
     ↓
SessionEnd → 提取并存储记忆
```

### 安装

**先决条件:**

- Node.js 18+
- 已安装 Gemini CLI

**设置:**

```bash
# 创建 hooks 目录
mkdir -p .gemini/hooks .gemini/memory

# 安装依赖项
npm install --save-dev chromadb @google/generative-ai

# 复制 Hook 脚本（如下所示）
# 使它们可执行
chmod +x .gemini/hooks/*.js
```

### 配置

**`.gemini/settings.json`:**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "name": "init-assistant",
            "type": "command",
            "command": "node $GEMINI_PROJECT_DIR/.gemini/hooks/init.js",
            "description": "Initialize Smart Workflow Assistant"
          }
        ]
      }
    ],
    "BeforeAgent": [
      {
        "matcher": "*",
        "hooks": [
          {
            "name": "inject-memories",
            "type": "command",
            "command": "node $GEMINI_PROJECT_DIR/.gemini/hooks/inject-memories.js",
            "description": "Inject relevant project memories"
          }
        ]
      }
    ],
    "BeforeToolSelection": [
      {
        "matcher": "*",
        "hooks": [
          {
            "name": "rag-filter",
            "type": "command",
            "command": "node $GEMINI_PROJECT_DIR/.gemini/hooks/rag-filter.js",
            "description": "Filter tools using RAG"
          }
        ]
      }
    ],
    "BeforeTool": [
      {
        "matcher": "write_file|replace",
        "hooks": [
          {
            "name": "security-check",
            "type": "command",
            "command": "node $GEMINI_PROJECT_DIR/.gemini/hooks/security.js",
            "description": "Prevent committing secrets"
          }
        ]
      }
    ],
    "AfterTool": [
      {
        "matcher": "write_file|replace",
        "hooks": [
          {
            "name": "auto-test",
            "type": "command",
            "command": "node $GEMINI_PROJECT_DIR/.gemini/hooks/auto-test.js",
            "description": "Run tests after code changes"
          }
        ]
      }
    ],
    "AfterModel": [
      {
        "matcher": "*",
        "hooks": [
          {
            "name": "record-interaction",
            "type": "command",
            "command": "node $GEMINI_PROJECT_DIR/.gemini/hooks/record.js",
            "description": "Record interaction for learning"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "exit|logout",
        "hooks": [
          {
            "name": "consolidate-memories",
            "type": "command",
            "command": "node $GEMINI_PROJECT_DIR/.gemini/hooks/consolidate.js",
            "description": "Extract and store session learnings"
          }
        ]
      }
    ]
  }
}
```

### Hook 脚本

#### 1. 初始化 (SessionStart)

**`.gemini/hooks/init.js`:**

```javascript
#!/usr/bin/env node
const { ChromaClient } = require('chromadb');
const path = require('path');
const fs = require('fs');

async function main() {
  const projectDir = process.env.GEMINI_PROJECT_DIR;
  const chromaPath = path.join(projectDir, '.gemini', 'chroma');

  // 确保 chroma 目录存在
  fs.mkdirSync(chromaPath, { recursive: true });

  const client = new ChromaClient({ path: chromaPath });

  // 初始化记忆集合
  await client.getOrCreateCollection({
    name: 'project_memories',
    metadata: { 'hnsw:space': 'cosine' },
  });

  // 计数现有记忆
  const collection = await client.getCollection({ name: 'project_memories' });
  const memoryCount = await collection.count();

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: `Smart Workflow Assistant initialized with ${memoryCount} project memories.`,
      },
      systemMessage: `🧠 ${memoryCount} memories loaded`,
    }),
  );
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

readStdin().then(main).catch(console.error);
```

#### 2. 注入记忆 (BeforeAgent)

**`.gemini/hooks/inject-memories.js`:**

```javascript
#!/usr/bin/env node
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChromaClient } = require('chromadb');
const path = require('path');

async function main() {
  const input = JSON.parse(await readStdin());
  const { prompt } = input;

  if (!prompt?.trim()) {
    console.log(JSON.stringify({}));
    return;
  }

  // 嵌入提示词
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genai.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(prompt);

  // 搜索记忆
  const projectDir = process.env.GEMINI_PROJECT_DIR;
  const client = new ChromaClient({
    path: path.join(projectDir, '.gemini', 'chroma'),
  });

  try {
    const collection = await client.getCollection({ name: 'project_memories' });
    const results = await collection.query({
      queryEmbeddings: [result.embedding.values],
      nResults: 3,
    });

    if (results.documents[0]?.length > 0) {
      const memories = results.documents[0]
        .map((doc, i) => {
          const meta = results.metadatas[0][i];
          return `- [${meta.category}] ${meta.summary}`;
        })
        .join('\n');

      console.log(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: 'BeforeAgent',
            additionalContext: `\n## Relevant Project Context\n\n${memories}\n`,
          },
          systemMessage: `💭 ${results.documents[0].length} memories recalled`,
        }),
      );
    } else {
      console.log(JSON.stringify({}));
    }
  } catch (error) {
    console.log(JSON.stringify({}));
  }
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

readStdin().then(main).catch(console.error);
```

#### 3. RAG 工具过滤器 (BeforeToolSelection)

**`.gemini/hooks/rag-filter.js`:**

```javascript
#!/usr/bin/env node
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  const input = JSON.parse(await readStdin());
  const { llm_request } = input;
  const candidateTools =
    llm_request.toolConfig?.functionCallingConfig?.allowedFunctionNames || [];

  // 如果已过滤则跳过
  if (candidateTools.length <= 20) {
    console.log(JSON.stringify({}));
    return;
  }

  // 提取最近的用户消息
  const recentMessages = llm_request.messages
    .slice(-3)
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join('\n');

  // 使用快速模型提取任务关键字
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const result = await model.generateContent(
    `Extract 3-5 keywords describing needed tool capabilities from this request:\n\n${recentMessages}\n\nKeywords (comma-separated):`,
  );

  const keywords = result.response
    .text()
    .toLowerCase()
    .split(',')
    .map((k) => k.trim());

  // 基于关键字的简单过滤 + 核心工具
  const coreTools = ['read_file', 'write_file', 'replace', 'run_shell_command'];
  const filtered = candidateTools.filter((tool) => {
    if (coreTools.includes(tool)) return true;
    const toolLower = tool.toLowerCase();
    return keywords.some(
      (kw) => toolLower.includes(kw) || kw.includes(toolLower),
    );
  });

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'BeforeToolSelection',
        toolConfig: {
          functionCallingConfig: {
            mode: 'ANY',
            allowedFunctionNames: filtered.slice(0, 20),
          },
        },
      },
      systemMessage: `🎯 Filtered ${candidateTools.length} → ${Math.min(filtered.length, 20)} tools`,
    }),
  );
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

readStdin().then(main).catch(console.error);
```

#### 4. 安全验证 (BeforeTool)

**`.gemini/hooks/security.js`:**

```javascript
#!/usr/bin/env node

const SECRET_PATTERNS = [
  /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,
  /password\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/i,
  /secret\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,
  /AKIA[0-9A-Z]{16}/, // AWS
  /ghp_[a-zA-Z0-9]{36}/, // GitHub
];

async function main() {
  const input = JSON.parse(await readStdin());
  const { tool_input } = input;

  const content = tool_input.content || tool_input.new_string || '';

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      console.log(
        JSON.stringify({
          decision: 'deny',
          reason:
            'Potential secret detected in code. Please remove sensitive data.',
          systemMessage: '🚨 Secret scanner blocked operation',
        }),
      );
      process.exit(2);
    }
  }

  console.log(JSON.stringify({ decision: 'allow' }));
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

readStdin().then(main).catch(console.error);
```

#### 5. 自动测试 (AfterTool)

**`.gemini/hooks/auto-test.js`:**

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  const input = JSON.parse(await readStdin());
  const { tool_input } = input;
  const filePath = tool_input.file_path;

  if (!filePath?.match(/\.(ts|js|tsx|jsx)$/)) {
    console.log(JSON.stringify({}));
    return;
  }

  // 查找测试文件
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  const testFile = `${base}.test${ext}`;

  if (!fs.existsSync(testFile)) {
    console.log(
      JSON.stringify({
        systemMessage: `⚠️ No test file: ${path.basename(testFile)}`,
      }),
    );
    return;
  }

  // 运行测试
  try {
    execSync(`npx vitest run ${testFile} --silent`, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000,
    });

    console.log(
      JSON.stringify({
        systemMessage: `✅ Tests passed: ${path.basename(filePath)}`,
      }),
    );
  } catch (error) {
    console.log(
      JSON.stringify({
        systemMessage: `❌ Tests failed: ${path.basename(filePath)}`,
      }),
    );
  }
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

readStdin().then(main).catch(console.error);
```

#### 6. 记录交互 (AfterModel)

**`.gemini/hooks/record.js`:**

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function main() {
  const input = JSON.parse(await readStdin());
  const { llm_request, llm_response } = input;
  const projectDir = process.env.GEMINI_PROJECT_DIR;
  const sessionId = process.env.GEMINI_SESSION_ID;

  const tempFile = path.join(
    projectDir,
    '.gemini',
    'memory',
    `session-${sessionId}.jsonl`,
  );

  fs.mkdirSync(path.dirname(tempFile), { recursive: true });

  // 提取用户消息和模型响应
  const userMsg = llm_request.messages
    ?.filter((m) => m.role === 'user')
    .slice(-1)[0]?.content;

  const modelMsg = llm_response.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .filter(Boolean)
    .join('');

  if (userMsg && modelMsg) {
    const interaction = {
      timestamp: new Date().toISOString(),
      user: process.env.USER || 'unknown',
      request: userMsg.slice(0, 500), // 为存储截断
      response: modelMsg.slice(0, 500),
    };

    fs.appendFileSync(tempFile, JSON.stringify(interaction) + '\n');
  }

  console.log(JSON.stringify({}));
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

readStdin().then(main).catch(console.error);
```

#### 7. 巩固记忆 (SessionEnd)

````javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChromaClient } = require('chromadb');

async function main() {
  const input = JSON.parse(await readStdin());
  const projectDir = process.env.GEMINI_PROJECT_DIR;
  const sessionId = process.env.GEMINI_SESSION_ID;

  const tempFile = path.join(
    projectDir,
    '.gemini',
    'memory',
    `session-${sessionId}.jsonl`,
  );

  if (!fs.existsSync(tempFile)) {
    console.log(JSON.stringify({}));
    return;
  }

  // 读取交互
  const interactions = fs
    .readFileSync(tempFile, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  if (interactions.length === 0) {
    fs.unlinkSync(tempFile);
    console.log(JSON.stringify({}));
    return;
  }

  // 使用 LLM 提取记忆
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Extract important project learnings from this session.
Focus on: decisions, conventions, gotchas, patterns.
Return JSON array with: category, summary, keywords

Session interactions:
${JSON.stringify(interactions, null, 2)}

JSON:`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '');
    const memories = JSON.parse(text);

    // 存储在 ChromaDB 中
    const client = new ChromaClient({
      path: path.join(projectDir, '.gemini', 'chroma'),
    });
    const collection = await client.getCollection({ name: 'project_memories' });
    const embedModel = genai.getGenerativeModel({
      model: 'text-embedding-004',
    });

    for (const memory of memories) {
      const memoryText = `${memory.category}: ${memory.summary}`;
      const embedding = await embedModel.embedContent(memoryText);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await collection.add({
        ids: [id],
        embeddings: [embedding.embedding.values],
        documents: [memoryText],
        metadatas: [
          {
            category: memory.category || 'general',
            summary: memory.summary,
            keywords: (memory.keywords || []).join(','),
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }

    fs.unlinkSync(tempFile);

    console.log(
      JSON.stringify({
        systemMessage: `🧠 ${memories.length} new learnings saved for future sessions`,
      }),
    );
  } catch (error) {
    console.error('Error consolidating memories:', error);
    fs.unlinkSync(tempFile);
    console.log(JSON.stringify({}));
  }
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

readStdin().then(main).catch(console.error);
````

### 会话示例

```
> gemini

🧠 3 memories loaded

> Fix the authentication bug in login.ts

💭 2 memories recalled:
  - [convention] Use middleware pattern for auth
  - [gotcha] Remember to update token types

🎯 Filtered 127 → 15 tools

[Agent reads login.ts and proposes fix]

✅ Tests passed: login.ts

---

> Add error logging to API endpoints

💭 3 memories recalled:
  - [convention] Use middleware pattern for auth
  - [pattern] Centralized error handling in middleware
  - [decision] Log errors to CloudWatch

🎯 Filtered 127 → 18 tools

[Agent implements error logging]

> /exit

🧠 2 new learnings saved for future sessions
```

### 为什么这个例子很特别

**基于 RAG 的工具选择:**

- 传统: 发送所有 100+ 个工具，导致混淆和上下文溢出
- 此示例: 提取意图，过滤到约 15 个相关工具
- 优势: 响应更快，选择更好，成本更低

**跨会话记忆:**

- 传统: 每个会话重新开始
- 此示例: 学习约定、决策、陷阱、模式
- 优势: 团队成员共享知识，持久学习

**所有 Hook 事件集成:**

在统一的工作流中演示每个 Hook 事件及其具体用例。

### 成本效率

- 使用 `gemini-2.0-flash-exp` 进行意图提取（快速，便宜）
- 使用 `text-embedding-004` 进行 RAG（便宜）
- 缓存工具描述（一次性成本）
- 每个请求的开销极小（通常 <500ms）

### 自定义

**调整记忆相关性:**

```javascript
// 在 inject-memories.js 中，更改 nResults
const results = await collection.query({
  queryEmbeddings: [result.embedding.values],
  nResults: 5, // 更多记忆
});
```

**修改工具过滤计数:**

```javascript
// 在 rag-filter.js 中，调整限制
allowedFunctionNames: filtered.slice(0, 30), // 更多工具
```

**添加自定义安全模式:**

```javascript
// 在 security.js 中，添加模式
const SECRET_PATTERNS = [
  // ... 现有模式
  /private[_-]?key/i,
  /auth[_-]?token/i,
];
```

## 打包为扩展

虽然项目级 Hooks 非常适合特定仓库，但您可能希望跨多个项目或其他用户共享您的 Hooks。您可以通过将 Hooks 打包为
[Gemini CLI 扩展](../extensions/index.md) 来实现这一点。

打包为扩展提供：

- **轻松分发:** 通过 git 仓库或 GitHub Release 共享 Hooks。
- **集中管理:** 使用 `gemini extensions` 命令安装、更新和禁用 Hooks。
- **版本控制:** 独立于项目代码管理 Hook 版本。
- **变量替换:** 使用 `${extensionPath}` 和 `${process.execPath}`
  实现可移植的跨平台脚本。

要将 Hooks 打包为扩展，请遵循 [扩展 Hook 文档](../extensions/index.md#hooks)。

## 了解更多

- [Hooks 参考](index.md) - 完整 API 参考和配置
- [最佳实践](best-practices.md) - 安全性、性能和调试
- [配置](../get-started/configuration.md) - Gemini CLI 设置
- [自定义命令](../cli/custom-commands.md) - 创建自定义命令
