# 使用 Gemini CLI 的 MCP 服务器

本文档提供了有关使用 Gemini CLI 配置和使用模型上下文协议 (MCP) 服务器的指南。

## 什么是 MCP 服务器？

MCP 服务器是一个应用程序，它通过模型上下文协议向 Gemini
CLI 公办公工具和资源，允许它与外部系统和数据源进行交互。MCP 服务器充当 Gemini 模型与您的本地环境或其他服务（如 API）之间的桥梁。

MCP 服务器使 Gemini CLI 能够：

- **发现工具:** 通过标准化 schema 定义列出可用工具、其描述和参数。
- **执行工具:** 使用定义的参数调用特定工具并接收结构化响应。
- **访问资源:** 从服务器公开的特定资源（文件、API 负载、报告等）读取数据。

使用 MCP 服务器，您可以扩展 Gemini
CLI 的功能以执行其内置功能之外的操作，例如与数据库、API、自定义脚本或专门的工作流进行交互。

## 核心集成架构

Gemini
CLI 通过内置于 Core 包 (`packages/core/src/tools/`) 中的复杂发现和执行系统与 MCP 服务器集成：

### 发现层 (`mcp-client.ts`)

发现过程由 `discoverMcpTools()` 编排，它：

1. **遍历配置的服务器**: 从您的 `settings.json` `mcpServers` 配置中遍历。
2. **建立连接**: 使用适当的传输机制（Stdio, SSE 或 Streamable HTTP）。
3. **获取工具定义**: 使用 MCP 协议从每个服务器获取。
4. **清理和验证**: 为了与 Gemini API 兼容，清理和验证工具 schema。
5. **注册工具**: 在全局工具注册表中注册工具并解决冲突。
6. **获取并注册资源**: 如果服务器公开了任何资源。

### 执行层 (`mcp-tool.ts`)

每个发现的 MCP 工具都包装在 `DiscoveredMCPTool` 实例中，该实例：

- **处理确认逻辑**: 基于服务器信任设置和用户偏好。
- **管理工具执行**: 通过使用适当的参数调用 MCP 服务器。
- **处理响应**: 为 LLM 上下文和用户显示处理响应。
- **维护连接状态**: 并处理超时。

### 传输机制

Gemini CLI 支持三种 MCP 传输类型：

- **Stdio 传输**: 生成子进程并通过 stdin/stdout 进行通信
- **SSE 传输**: 连接到 Server-Sent Events 端点
- **Streamable HTTP 传输**: 使用 HTTP 流进行通信

## 使用 MCP 资源

一些 MCP 服务器除了工具和提示词外，还公开上下文“资源”。Gemini
CLI 会自动发现这些资源，并允许您在聊天中引用它们。

### 发现和列出

- 当发现运行时，CLI 获取每个服务器的 `resources/list` 结果。
- `/mcp` 命令会在每个已连接服务器的工具和提示词旁边显示资源部分。

这返回一个简洁的、纯文本的 URI 列表加上元数据。

### 在对话中引用资源

您可以使用与引用本地文件已知的相同的 `@` 语法：

```
@server://resource/path
```

资源 URI 与文件系统路径一起出现在补全菜单中。当您提交消息时，CLI 调用
`resources/read` 并将内容注入对话中。

## 如何设置您的 MCP 服务器

Gemini CLI 使用您 `settings.json` 文件中的 `mcpServers`
配置来定位和连接到 MCP 服务器。此配置支持具有不同传输机制的多个服务器。

### 在 settings.json 中配置 MCP 服务器

您可以通过两种主要方式在 `settings.json` 文件中配置 MCP 服务器：通过顶级
`mcpServers` 对象进行特定服务器定义，以及通过 `mcp`
对象进行控制服务器发现和执行的全局设置。

#### 全局 MCP 设置 (`mcp`)

`settings.json` 中的 `mcp` 对象允许您为所有 MCP 服务器定义全局规则。

- **`mcp.serverCommand`** (string): 启动 MCP 服务器的全局命令。
- **`mcp.allowed`** (array of
  strings): 允许的 MCP 服务器名称列表。如果设置了此项，则仅连接来自此列表（与
  `mcpServers` 对象中的键匹配）的服务器。
- **`mcp.excluded`** (array of
  strings): 要排除的 MCP 服务器名称列表。此列表中的服务器将不会连接。

**示例:**

```json
{
  "mcp": {
    "allowed": ["my-trusted-server"],
    "excluded": ["experimental-server"]
  }
}
```

#### 特定于服务器的配置 (`mcpServers`)

`mcpServers` 对象是您定义要 CLI 连接的每个单独 MCP 服务器的地方。

### 配置结构

将 `mcpServers` 对象添加到您的 `settings.json` 文件中：

```json
{ ...文件包含其他配置对象
  "mcpServers": {
    "serverName": {
      "command": "path/to/server",
      "args": ["--arg1", "value1"],
      "env": {
        "API_KEY": "$MY_API_TOKEN"
      },
      "cwd": "./server-directory",
      "timeout": 30000,
      "trust": false
    }
  }
}
```

### 配置属性

每个服务器配置支持以下属性：

#### 必需（以下之一）

- **`command`** (string): Stdio 传输的可执行文件路径
- **`url`** (string): SSE 端点 URL (例如 `"http://localhost:8080/sse"`)
- **`httpUrl`** (string): HTTP 流式传输端点 URL

#### 可选

- **`args`** (string[]): Stdio 传输的命令行参数
- **`headers`** (object): 使用 `url` 或 `httpUrl` 时的自定义 HTTP 标头
- **`env`** (object): 服务器进程的环境变量。值可以使用 `$VAR_NAME` 或
  `${VAR_NAME}` 语法引用环境变量
- **`cwd`** (string): Stdio 传输的工作目录
- **`timeout`** (number): 请求超时（毫秒）（默认：600,000ms = 10 分钟）
- **`trust`** (boolean): 当为 `true`
  时，绕过此服务器的所有工具调用确认（默认：`false`）
- **`includeTools`**
  (string[]): 要从此 MCP 服务器包含的工具名称列表。指定后，仅此处列出的工具将从此服务器可用（白名单行为）。如果未指定，默认情况下启用服务器中的所有工具。
- **`excludeTools`**
  (string[]): 要从此 MCP 服务器排除的工具名称列表。此处列出的工具即使由服务器公开，也不会对模型可用。**注意:**
  `excludeTools` 优先于 `includeTools` - 如果工具在两个列表中，它将被排除。
- **`targetAudience`**
  (string): 您尝试访问的 IAP 保护应用程序上列入白名单的 OAuth 客户端 ID。与
  `authProviderType: 'service_account_impersonation'` 一起使用。
- **`targetServiceAccount`** (string): 要模拟的 Google
  Cloud 服务账号的电子邮件地址。与
  `authProviderType: 'service_account_impersonation'` 一起使用。

### 远程 MCP 服务器的 OAuth 支持

Gemini CLI 支持使用 SSE 或 HTTP 传输的远程 MCP 服务器的 OAuth
2.0 身份验证。这使得能够安全访问需要身份验证的 MCP 服务器。

#### 自动 OAuth 发现

对于支持 OAuth 发现的服务器，您可以省略 OAuth 配置并让 CLI 自动发现它：

```json
{
  "mcpServers": {
    "discoveredServer": {
      "url": "https://api.example.com/sse"
    }
  }
}
```

CLI 将自动：

- 检测服务器何时需要 OAuth 身份验证（401 响应）
- 从服务器元数据中发现 OAuth 端点
- 执行动态客户端注册（如果支持）
- 处理 OAuth 流程和令牌管理

#### 身份验证流程

连接到启用 OAuth 的服务器时：

1. **初始连接尝试** 失败，返回 401 Unauthorized
2. **OAuth 发现** 找到授权和令牌端点
3. **浏览器打开** 进行用户身份验证（需要本地浏览器访问权限）
4. **授权码** 交换访问令牌
5. **令牌被安全存储** 以备将来使用
6. **连接重试** 使用有效令牌成功

#### 浏览器重定向要求

**重要:** OAuth 身份验证要求您的本地机器可以：

- 打开 Web 浏览器进行身份验证
- 在 `http://localhost:7777/oauth/callback` 上接收重定向

此功能在以下情况下不起作用：

- 没有浏览器访问权限的无头环境
- 没有 X11 转发的远程 SSH 会话
- 没有浏览器支持的容器化环境

#### 管理 OAuth 身份验证

使用 `/mcp auth` 命令管理 OAuth 身份验证：

```bash
# 列出需要身份验证的服务器
/mcp auth

# 对特定服务器进行身份验证
/mcp auth serverName

# 如果令牌过期，重新进行身份验证
/mcp auth serverName
```

#### OAuth 配置属性

- **`enabled`** (boolean): 为此服务器启用 OAuth
- **`clientId`** (string): OAuth 客户端标识符（使用动态注册时可选）
- **`clientSecret`** (string): OAuth 客户端密钥（对于公共客户端可选）
- **`authorizationUrl`** (string): OAuth 授权端点（如果省略则自动发现）
- **`tokenUrl`** (string): OAuth 令牌端点（如果省略则自动发现）
- **`scopes`** (string[]): 必需的 OAuth 范围
- **`redirectUri`** (string): 自定义重定向 URI（默认为
  `http://localhost:7777/oauth/callback`）
- **`tokenParamName`** (string): SSE URL 中令牌的查询参数名称
- **`audiences`** (string[]): 令牌对其有效的受众

#### 令牌管理

OAuth 令牌自动：

- **安全存储** 在 `~/.gemini/mcp-oauth-tokens.json` 中
- **刷新** 当过期时（如果有刷新令牌）
- **验证** 在每次连接尝试之前
- **清理** 当无效或过期时

#### 身份验证提供商类型

您可以使用 `authProviderType` 属性指定身份验证提供商类型：

- **`authProviderType`** (string): 指定身份验证提供商。可以是以下之一：
  - **`dynamic_discovery`** (默认): CLI 将自动从服务器发现 OAuth 配置。
  - **`google_credentials`**:
    CLI 将使用 Google 应用程序默认凭据 (ADC) 向服务器进行身份验证。使用此提供商时，您必须指定所需的范围。
  - **`service_account_impersonation`**: CLI 将模拟 Google
    Cloud 服务账号向服务器进行身份验证。这对于访问受 IAP 保护的服务很有用（这是专门为 Cloud
    Run 服务设计的）。

#### Google 凭据

```json
{
  "mcpServers": {
    "googleCloudServer": {
      "httpUrl": "https://my-gcp-service.run.app/mcp",
      "authProviderType": "google_credentials",
      "oauth": {
        "scopes": ["https://www.googleapis.com/auth/userinfo.email"]
      }
    }
  }
}
```

#### 服务账号模拟

要使用服务账号模拟向服务器进行身份验证，必须将 `authProviderType` 设置为
`service_account_impersonation` 并提供以下属性：

- **`targetAudience`**
  (string): 您尝试访问的受 IAP 保护的应用程序上列入白名单的 OAuth 客户端 ID。
- **`targetServiceAccount`** (string): 要模拟的 Google
  Cloud 服务账号的电子邮件地址。

CLI 将使用您的本地应用程序默认凭据 (ADC) 为指定的服务账号和受众生成 OIDC
ID 令牌。然后将使用此令牌向 MCP 服务器进行身份验证。

#### 设置说明

1. **[创建](https://cloud.google.com/iap/docs/oauth-client-creation)
   或使用现有的 OAuth 2.0 客户端 ID。** 要使用现有的 OAuth 2.0 客户端 ID，请按照
   [如何共享 OAuth 客户端](https://cloud.google.com/iap/docs/sharing-oauth-clients)
   中的步骤操作。
2. **将 OAuth ID 添加到应用程序的
   [程序化访问](https://cloud.google.com/iap/docs/sharing-oauth-clients#programmatic_access)
   白名单中。** 由于 Cloud Run 尚不是 gcloud
   iap 中受支持的资源类型，因此必须在项目上将客户端 ID 列入白名单。
3. **创建服务账号。**
   [文档](https://cloud.google.com/iam/docs/service-accounts-create#creating)，[Cloud Console 链接](https://console.cloud.google.com/iam-admin/serviceaccounts)
4. **将服务账号和用户都添加到 IAP 策略中**，可以在 Cloud
   Run 服务本身的“安全性”选项卡中或通过 gcloud 添加。
5. **授予所有将访问 MCP 服务器的用户和组**
   [模拟服务账号](https://cloud.google.com/docs/authentication/use-service-account-impersonation)
   所需的权限（即 `roles/iam.serviceAccountTokenCreator`）。
6. 为您的项目
   **[启用](https://console.cloud.google.com/apis/library/iamcredentials.googleapis.com)
   IAM Credentials API**。

### 配置示例

#### Python MCP 服务器 (stdio)

```json
{
  "mcpServers": {
    "pythonTools": {
      "command": "python",
      "args": ["-m", "my_mcp_server", "--port", "8080"],
      "cwd": "./mcp-servers/python",
      "env": {
        "DATABASE_URL": "$DB_CONNECTION_STRING",
        "API_KEY": "${EXTERNAL_API_KEY}"
      },
      "timeout": 15000
    }
  }
}
```

#### Node.js MCP 服务器 (stdio)

```json
{
  "mcpServers": {
    "nodeServer": {
      "command": "node",
      "args": ["dist/server.js", "--verbose"],
      "cwd": "./mcp-servers/node",
      "trust": true
    }
  }
}
```

#### 基于 Docker 的 MCP 服务器

```json
{
  "mcpServers": {
    "dockerizedServer": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "API_KEY",
        "-v",
        "${PWD}:/workspace",
        "my-mcp-server:latest"
      ],
      "env": {
        "API_KEY": "$EXTERNAL_SERVICE_TOKEN"
      }
    }
  }
}
```

#### 基于 HTTP 的 MCP 服务器

```json
{
  "mcpServers": {
    "httpServer": {
      "httpUrl": "http://localhost:3000/mcp",
      "timeout": 5000
    }
  }
}
```

#### 带有自定义标头的基于 HTTP 的 MCP 服务器

```json
{
  "mcpServers": {
    "httpServerWithAuth": {
      "httpUrl": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer your-api-token",
        "X-Custom-Header": "custom-value",
        "Content-Type": "application/json"
      },
      "timeout": 5000
    }
  }
}
```

#### 带有工具过滤的 MCP 服务器

```json
{
  "mcpServers": {
    "filteredServer": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "includeTools": ["safe_tool", "file_reader", "data_processor"],
      // "excludeTools": ["dangerous_tool", "file_deleter"],
      "timeout": 30000
    }
  }
}
```

### 带有 SA 模拟的 SSE MCP 服务器

```json
{
  "mcpServers": {
    "myIapProtectedServer": {
      "url": "https://my-iap-service.run.app/sse",
      "authProviderType": "service_account_impersonation",
      "targetAudience": "YOUR_IAP_CLIENT_ID.apps.googleusercontent.com",
      "targetServiceAccount": "your-sa@your-project.iam.gserviceaccount.com"
    }
  }
}
```

## 发现过程深入探讨

当 Gemini CLI 启动时，它通过以下详细过程执行 MCP 服务器发现：

### 1. 服务器迭代和连接

对于 `mcpServers` 中配置的每个服务器：

1. **状态跟踪开始:** 服务器状态设置为 `CONNECTING`
2. **传输选择:** 基于配置属性：
   - `httpUrl` → `StreamableHTTPClientTransport`
   - `url` → `SSEClientTransport`
   - `command` → `StdioClientTransport`
3. **连接建立:** MCP 客户端尝试使用配置的超时连接
4. **错误处理:** 记录连接失败并将服务器状态设置为 `DISCONNECTED`

### 2. 工具发现

连接成功后：

1. **工具列表:** 客户端调用 MCP 服务器的工具列表端点
2. **Schema 验证:** 验证每个工具的函数声明
3. **工具过滤:** 根据 `includeTools` 和 `excludeTools` 配置过滤工具
4. **名称清理:** 清理工具名称以满足 Gemini API 要求：
   - 无效字符（非字母数字、下划线、点、连字符）替换为下划线
   - 超过 63 个字符的名称将被截断并进行中间替换 (`___`)

### 3. 冲突解决

当多个服务器公开具有相同名称的工具时：

1. **首次注册胜出:** 第一个注册工具名称的服务器获得无前缀名称
2. **自动加前缀:** 后续服务器获得带前缀的名称：`serverName__toolName`
3. **注册表跟踪:** 工具注册表维护服务器名称与其工具之间的映射

### 4. Schema 处理

工具参数 schema 经过清理以实现 Gemini API 兼容性：

- **删除 `$schema` 属性**
- **剥离 `additionalProperties`**
- **删除带有 `default` 的 `anyOf`** 的默认值（Vertex AI 兼容性）
- **递归处理** 应用于嵌套 schema

### 5. 连接管理

发现之后：

- **持久连接:** 成功注册工具的服务器保持连接
- **清理:** 不提供可用工具的服务器将关闭其连接
- **状态更新:** 最终服务器状态设置为 `CONNECTED` 或 `DISCONNECTED`

## 工具执行流程

当 Gemini 模型决定使用 MCP 工具时，会发生以下执行流程：

### 1. 工具调用

模型生成一个 `FunctionCall`，包含：

- **工具名称:** 注册的名称（可能有前缀）
- **参数:** 与工具参数 schema 匹配的 JSON 对象

### 2. 确认过程

每个 `DiscoveredMCPTool` 实现复杂的确认逻辑：

#### 基于信任的绕过

```typescript
if (this.trust) {
  return false; // 无需确认
}
```

#### 动态白名单

系统维护内部白名单：

- **服务器级:** `serverName` → 来自此服务器的所有工具都受信任
- **工具级:** `serverName.toolName` → 此特定工具受信任

#### 用户选择处理

当需要确认时，用户可以选择：

- **Proceed once (继续一次):** 仅执行这一次
- **Always allow this tool (始终允许此工具):** 添加到工具级白名单
- **Always allow this server (始终允许此服务器):** 添加到服务器级白名单
- **Cancel (取消):** 中止执行

### 3. 执行

确认（或信任绕过）后：

1. **参数准备:** 根据工具的 schema 验证参数
2. **MCP 调用:** 底层 `CallableTool` 调用服务器：

   ```typescript
   const functionCalls = [
     {
       name: this.serverToolName, // 原始服务器工具名称
       args: params,
     },
   ];
   ```

3. **响应处理:** 结果格式化为 LLM 上下文和用户显示

### 4. 响应处理

执行结果包含：

- **`llmContent`:** 语言模型上下文的原始响应部分
- **`returnDisplay`:** 用户显示的格式化输出（通常是 markdown 代码块中的 JSON）

## 如何与您的 MCP 服务器交互

### 使用 `/mcp` 命令

`/mcp` 命令提供有关您的 MCP 服务器设置的综合信息：

```bash
/mcp
```

这显示：

- **服务器列表:** 所有配置的 MCP 服务器
- **连接状态:** `CONNECTED`, `CONNECTING`, 或 `DISCONNECTED`
- **服务器详情:** 配置摘要（不包括敏感数据）
- **可用工具:** 来自每个服务器的工具列表及其描述
- **发现状态:** 整体发现过程状态

### 示例 `/mcp` 输出

```
MCP Servers Status:

📡 pythonTools (CONNECTED)
  Command: python -m my_mcp_server --port 8080
  Working Directory: ./mcp-servers/python
  Timeout: 15000ms
  Tools: calculate_sum, file_analyzer, data_processor

🔌 nodeServer (DISCONNECTED)
  Command: node dist/server.js --verbose
  Error: Connection refused

🐳 dockerizedServer (CONNECTED)
  Command: docker run -i --rm -e API_KEY my-mcp-server:latest
  Tools: docker__deploy, docker__status

Discovery State: COMPLETED
```

### 工具使用

一旦发现，MCP 工具就像内置工具一样可供 Gemini 模型使用。模型将自动：

1. **选择合适的工具** 根据您的请求
2. **显示确认对话框**（除非服务器受信任）
3. **执行工具** 使用适当的参数
4. **显示结果** 以用户友好的格式

## 状态监控和故障排除

### 连接状态

MCP 集成跟踪几种状态：

#### 服务器状态 (`MCPServerStatus`)

- **`DISCONNECTED`:** 服务器未连接或有错误
- **`CONNECTING`:** 连接尝试正在进行中
- **`CONNECTED`:** 服务器已连接并就绪

#### 发现状态 (`MCPDiscoveryState`)

- **`NOT_STARTED`:** 发现尚未开始
- **`IN_PROGRESS`:** 当前正在发现服务器
- **`COMPLETED`:** 发现完成（有或无错误）

### 常见问题和解决方案

#### 服务器无法连接

**症状:** 服务器显示 `DISCONNECTED` 状态

**故障排除:**

1. **检查配置:** 验证 `command`, `args`, 和 `cwd` 是否正确
2. **手动测试:** 直接运行服务器命令以确保其工作
3. **检查依赖项:** 确保安装了所有必需的包
4. **查看日志:** 在 CLI 输出中查找错误消息
5. **验证权限:** 确保 CLI 可以执行服务器命令

#### 未发现工具

**症状:** 服务器连接但没有可用工具

**故障排除:**

1. **验证工具注册:** 确保您的服务器实际上注册了工具
2. **检查 MCP 协议:** 确认您的服务器正确实现了 MCP 工具列表
3. **查看服务器日志:** 检查 stderr 输出以查找服务器端错误
4. **测试工具列表:** 手动测试您的服务器的工具发现端点

#### 工具未执行

**症状:** 发现了工具但在执行期间失败

**故障排除:**

1. **参数验证:** 确保您的工具接受预期的参数
2. **Schema 兼容性:** 验证您的输入 schema 是有效的 JSON Schema
3. **错误处理:** 检查您的工具是否抛出未处理的异常
4. **超时问题:** 考虑增加 `timeout` 设置

#### 沙盒兼容性

**症状:** 启用沙盒时 MCP 服务器失败

**解决方案:**

1. **基于 Docker 的服务器:** 使用包含所有依赖项的 Docker 容器
2. **路径可访问性:** 确保服务器可执行文件在沙盒中可用
3. **网络访问:** 配置沙盒以允许必要的网络连接
4. **环境变量:** 验证所需的的环境变量是否已传递

### 调试提示

1. **启用调试模式:** 使用 `--debug`
   运行 CLI 以获得详细输出（在交互模式下使用 F12 打开调试控制台）
2. **检查 stderr:** MCP 服务器 stderr 被捕获并记录（过滤 INFO 消息）
3. **测试隔离:** 在集成之前独立测试您的 MCP 服务器
4. **增量设置:** 在添加复杂功能之前从简单工具开始
5. **频繁使用 `/mcp`:** 在开发期间监控服务器状态

## 重要说明

### 安全注意事项

- **信任设置:** `trust`
  选项绕过所有确认对话框。谨慎使用，仅用于您完全控制的服务器
- **访问令牌:** 配置包含 API 密钥或令牌的环境变量时要注意安全
- **沙盒兼容性:** 使用沙盒时，确保 MCP 服务器在沙盒环境中可用
- **私人数据:** 使用范围广泛的个人访问令牌可能会导致仓库之间的信息泄露

### 性能和资源管理

- **连接持久性:** CLI 维护与成功注册工具的服务器的持久连接
- **自动清理:** 提供无工具的服务器的连接将自动关闭
- **超时管理:** 根据您的服务器响应特性配置适当的超时
- **资源监控:** MCP 服务器作为单独的进程运行并消耗系统资源

### Schema 兼容性

- **属性剥离:** 系统自动删除某些 schema 属性 (`$schema`,
  `additionalProperties`) 以实现 Gemini API 兼容性
- **名称清理:** 工具名称会自动清理以满足 API 要求
- **冲突解决:** 服务器之间的工具名称冲突通过自动前缀解决

这种全面的集成使 MCP 服务器成为扩展 Gemini
CLI 功能的强大方式，同时保持安全性、可靠性和易用性。

## 从工具返回丰富内容

MCP 工具不仅限于返回简单的文本。您可以在单个工具响应中返回丰富的多部分内容，包括文本、图像、音频和其他二进制数据。这允许您构建强大的工具，可以在单次轮次中向模型提供各种信息。

从工具返回的所有数据都经过处理并作为其下一次生成的上下文发送给模型，使其能够推理或总结提供的信息。

### 工作原理

要返回丰富内容，您的工具响应必须遵守
[`CallToolResult`](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result)
的 MCP 规范。结果的 `content` 字段应该是一个 `ContentBlock` 对象数组。Gemini
CLI 将正确处理此数组，将文本与二进制数据分离并将其打包给模型。

您可以在 `content` 数组中混合和匹配不同的内容块类型。支持的块类型包括：

- `text`
- `image`
- `audio`
- `resource` (嵌入内容)
- `resource_link`

### 示例：返回文本和图像

这是一个 MCP 工具的有效 JSON 响应示例，它返回文本描述和图像：

```json
{
  "content": [
    {
      "type": "text",
      "text": "Here is the logo you requested."
    },
    {
      "type": "image",
      "data": "BASE64_ENCODED_IMAGE_DATA_HERE",
      "mimeType": "image/png"
    },
    {
      "type": "text",
      "text": "The logo was created in 2025."
    }
  ]
}
```

当 Gemini CLI 收到此响应时，它将：

1.  提取所有文本并将其组合成模型的单个 `functionResponse` 部分。
2.  将图像数据呈现为单独的 `inlineData` 部分。
3.  在 CLI 中提供干净、用户友好的摘要，表明收到了文本和图像。

这使您能够构建复杂的工具，向 Gemini 模型提供丰富的多模态上下文。

## MCP 提示词作为斜杠命令

除了工具之外，MCP 服务器还可以公开预定义的提示词，这些提示词可以在 Gemini
CLI 中作为斜杠命令执行。这允许您为可以通过名称轻松调用的常见或复杂查询创建快捷方式。

### 在服务器上定义提示词

这是一个定义提示词的 stdio MCP 服务器的小示例：

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'prompt-server',
  version: '1.0.0',
});

server.registerPrompt(
  'poem-writer',
  {
    title: 'Poem Writer',
    description: 'Write a nice haiku',
    argsSchema: { title: z.string(), mood: z.string().optional() },
  },
  ({ title, mood }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Write a haiku${mood ? ` with the mood ${mood}` : ''} called ${title}. Note that a haiku is 5 syllables followed by 7 syllables followed by 5 syllables `,
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

这可以通过以下方式包含在 `settings.json` 的 `mcpServers` 下：

```json
{
  "mcpServers": {
    "nodeServer": {
      "command": "node",
      "args": ["filename.ts"]
    }
  }
}
```

### 调用提示词

一旦发现提示词，您就可以使用其名称作为斜杠命令来调用它。CLI 将自动处理解析参数。

```bash
/poem-writer --title="Gemini CLI" --mood="reverent"
```

或者，使用位置参数：

```bash
/poem-writer "Gemini CLI" reverent
```

当您运行此命令时，Gemini CLI 使用提供的参数执行 MCP 服务器上的 `prompts/get`
方法。服务器负责将参数替换到提示词模板中并返回最终的提示词文本。然后 CLI 将此提示词发送给模型执行。这为自动化和共享常见工作流提供了一种便捷的方式。

## 使用 `gemini mcp` 管理 MCP 服务器

虽然您始终可以通过手动编辑 `settings.json` 文件来配置 MCP 服务器，但 Gemini
CLI 提供了一组方便的命令来以编程方式管理您的服务器配置。这些命令简化了添加、列出和删除 MCP 服务器的过程，而无需直接编辑 JSON 文件。

### 添加服务器 (`gemini mcp add`)

`add` 命令在您的 `settings.json`
中配置新的 MCP 服务器。根据范围 (`-s, --scope`)，它将被添加到用户配置
`~/.gemini/settings.json` 或项目配置 `.gemini/settings.json` 文件中。

**命令:**

```bash
gemini mcp add [options] <name> <commandOrUrl> [args...]
```

- `<name>`: 服务器的唯一名称。
- `<commandOrUrl>`: 要执行的命令 (对于 `stdio`) 或 URL (对于 `http`/`sse`)。
- `[args...]`: `stdio` 命令的可选参数。

**选项 (标志):**

- `-s, --scope`: 配置范围（user 或 project）。[默认: "project"]
- `-t, --transport`: 传输类型 (stdio, sse, http)。[默认: "stdio"]
- `-e, --env`: 设置环境变量 (例如 -e KEY=value)。
- `-H, --header`: 设置 SSE 和 HTTP 传输的 HTTP 标头 (例如 -H "X-Api-Key: abc123"
  -H "Authorization: Bearer abc123")。
- `--timeout`: 设置连接超时（毫秒）。
- `--trust`: 信任服务器（绕过所有工具调用确认提示）。
- `--description`: 设置服务器的描述。
- `--include-tools`: 逗号分隔的要包含的工具列表。
- `--exclude-tools`: 逗号分隔的要排除的工具列表。

#### 添加 stdio 服务器

这是运行本地服务器的默认传输方式。

```bash
# 基本语法
gemini mcp add [options] <name> <command> [args...]

# 示例：添加本地服务器
gemini mcp add -e API_KEY=123 -e DEBUG=true my-stdio-server /path/to/server arg1 arg2 arg3

# 示例：添加本地 python 服务器
gemini mcp add python-server python server.py -- --server-arg my-value
```

#### 添加 HTTP 服务器

此传输用于使用可流式传输 HTTP 传输的服务器。

```bash
# 基本语法
gemini mcp add --transport http <name> <url>

# 示例：添加 HTTP 服务器
gemini mcp add --transport http http-server https://api.example.com/mcp/

# 示例：添加带有身份验证标头的 HTTP 服务器
gemini mcp add --transport http --header "Authorization: Bearer abc123" secure-http https://api.example.com/mcp/
```

#### 添加 SSE 服务器

此传输用于使用 Server-Sent Events (SSE) 的服务器。

```bash
# 基本语法
gemini mcp add --transport sse <name> <url>

# 示例：添加 SSE 服务器
gemini mcp add --transport sse sse-server https://api.example.com/sse/

# 示例：添加带有身份验证标头的 SSE 服务器
gemini mcp add --transport sse --header "Authorization: Bearer abc123" secure-sse https://api.example.com/sse/
```

### 列出服务器 (`gemini mcp list`)

要查看当前配置的所有 MCP 服务器，请使用 `list`
命令。它显示每个服务器的名称、配置详细信息和连接状态。此命令没有标志。

**命令:**

```bash
gemini mcp list
```

**示例输出:**

```sh
✓ stdio-server: command: python3 server.py (stdio) - Connected
✓ http-server: https://api.example.com/mcp (http) - Connected
✗ sse-server: https://api.example.com/sse (sse) - Disconnected
```

### 删除服务器 (`gemini mcp remove`)

要从配置中删除服务器，请使用带有服务器名称的 `remove` 命令。

**命令:**

```bash
gemini mcp remove <name>
```

**选项 (标志):**

- `-s, --scope`: 配置范围（user 或 project）。[默认: "project"]

**示例:**

```bash
gemini mcp remove my-server
```

这将根据范围 (`-s, --scope`) 在相应的 `settings.json` 文件中从 `mcpServers`
对象中查找并删除 "my-server" 条目。

## 指令

Gemini CLI 支持
[MCP 服务器指令](https://modelcontextprotocol.io/specification/2025-06-18/schema#initializeresult)，这些指令将附加到系统指令中。
