# Gemini CLI 扩展入门

本指南将指导您创建第一个 Gemini
CLI 扩展。您将学习如何设置新扩展、通过 MCP 服务器添加自定义工具、创建自定义命令以及使用
`GEMINI.md` 文件为模型提供上下文。

## 先决条件

在开始之前，请确保您已安装 Gemini CLI，并对 Node.js 和 TypeScript 有基本的了解。

## 第 1 步：创建一个新扩展

最简单的方法是使用内置模板之一。我们将使用 `mcp-server` 示例作为基础。

运行以下命令以创建一个名为 `my-first-extension` 的新目录，其中包含模板文件：

```bash
gemini extensions new my-first-extension mcp-server
```

这将创建一个具有以下结构的新目录：

```
my-first-extension/
├── example.ts
├── gemini-extension.json
├── package.json
└── tsconfig.json
```

## 第 2 步：了解扩展文件

让我们看看新扩展中的关键文件。

### `gemini-extension.json`

这是扩展的清单文件。它告诉 Gemini CLI 如何加载和使用您的扩展。

```json
{
  "name": "my-first-extension",
  "version": "1.0.0",
  "mcpServers": {
    "nodeServer": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}example.js"],
      "cwd": "${extensionPath}"
    }
  }
}
```

- `name`: 您扩展的唯一名称。
- `version`: 您扩展的版本。
- `mcpServers`: 此部分定义了一个或多个模型上下文协议 (MCP) 服务器。MCP 服务器是您为模型添加新工具的方式。
  - `command`, `args`, `cwd`: 这些字段指定如何启动您的服务器。注意
    `${extensionPath}` 变量的使用，Gemini
    CLI 会将其替换为您扩展安装目录的绝对路径。这允许您的扩展无论安装在哪里都能工作。

### `example.ts`

此文件包含 MCP 服务器的源代码。这是一个使用 `@modelcontextprotocol/sdk`
的简单 Node.js 服务器。

```typescript
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'prompt-server',
  version: '1.0.0',
});

// 注册一个名为 'fetch_posts' 的新工具
server.registerTool(
  'fetch_posts',
  {
    description: 'Fetches a list of posts from a public API.',
    inputSchema: z.object({}).shape,
  },
  async () => {
    const apiResponse = await fetch(
      'https://jsonplaceholder.typicode.com/posts',
    );
    const posts = await apiResponse.json();
    const response = { posts: posts.slice(0, 5) };
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response),
        },
      ],
    };
  },
);

// ... (省略提示词注册以求简洁)

const transport = new StdioServerTransport();
await server.connect(transport);
```

此服务器定义了一个名为 `fetch_posts` 的工具，该工具从公共 API 获取数据。

### `package.json` 和 `tsconfig.json`

这些是 TypeScript 项目的标准配置文件。`package.json` 文件定义了依赖项和 `build`
脚本，`tsconfig.json` 配置了 TypeScript 编译器。

## 第 3 步：构建和链接您的扩展

在使用扩展之前，您需要编译 TypeScript 代码并将扩展链接到您的 Gemini
CLI 安装以进行本地开发。

1.  **安装依赖项:**

    ```bash
    cd my-first-extension
    npm install
    ```

2.  **构建服务器:**

    ```bash
    npm run build
    ```

    这将把 `example.ts` 编译成 `dist/example.js`，这正是 `gemini-extension.json`
    中引用的文件。

3.  **链接扩展:**

    `link` 命令创建一个从 Gemini
    CLI 扩展目录到您的开发目录的符号链接。这意味着您所做的任何更改都将立即反映出来，无需重新安装。

    ```bash
    gemini extensions link .
    ```

现在，重新启动您的 Gemini CLI 会话。新的 `fetch_posts`
工具将可用。您可以通过询问 "fetch posts" 来测试它。

## 第 4 步：添加自定义命令

自定义命令提供了一种为复杂提示词创建快捷方式的方法。让我们添加一个在代码中搜索模式的命令。

1.  创建一个 `commands` 目录和一个用于命令组的子目录：

    ```bash
    mkdir -p commands/fs
    ```

2.  创建一个名为 `commands/fs/grep-code.toml` 的文件：

    ```toml
    prompt = """
    Please summarize the findings for the pattern `{{args}}`.

    Search Results:
    !{grep -r {{args}} .}
    """
    ```

    此命令 `/fs:grep-code` 将接受一个参数，使用它运行 `grep`
    shell 命令，并将结果通过管道传输到提示词中进行总结。

保存文件后，重新启动 Gemini CLI。您现在可以运行 `/fs:grep-code "some pattern"`
来使用您的新命令。

## 第 5 步：添加自定义 `GEMINI.md`

您可以通过向扩展添加 `GEMINI.md`
文件来为模型提供持久上下文。这对于给模型关于如何行为或有关扩展工具的信息非常有用。请注意，对于旨在公开命令和提示词的扩展，您可能并不总是需要这样做。

1.  在扩展目录的根目录中创建一个名为 `GEMINI.md` 的文件：

    ```markdown
    # 我的第一个扩展说明

    您是一位专家开发人员助手。当用户要求您获取帖子时，请使用 `fetch_posts`
    工具。在您的回答中要简洁。
    ```

2.  更新您的 `gemini-extension.json` 以告诉 CLI 加载此文件：

    ```json
    {
      "name": "my-first-extension",
      "version": "1.0.0",
      "contextFileName": "GEMINI.md",
      "mcpServers": {
        "nodeServer": {
          "command": "node",
          "args": ["${extensionPath}${/}dist${/}example.js"],
          "cwd": "${extensionPath}"
        }
      }
    }
    ```

再次重新启动 CLI。现在，在扩展处于活动状态的每个会话中，模型都将拥有来自
`GEMINI.md` 文件的上下文。

## (可选) 第 6 步：添加 Agent 技能

_注意：这是一个实验性功能，通过 `experimental.skills` 启用。_

[Agent 技能](../cli/skills.md)
让您捆绑专业知识和流程化工作流。与提供持久上下文的 `GEMINI.md`
不同，技能仅在需要时激活，从而节省上下文 token。

1.  创建一个 `skills` 目录和一个用于您的技能的子目录：

    ```bash
    mkdir -p skills/security-audit
    ```

2.  创建一个 `skills/security-audit/SKILL.md` 文件：

    ```markdown
    ---
    name: security-audit
    description: 审计代码安全漏洞的专业知识。当用户要求“检查安全问题”或“审计”他们的更改时使用。
    ---

    # 安全审计员

    您是一位专家安全研究员。在审计代码时：

    1. 寻找常见漏洞 (OWASP Top 10)。
    2. 检查硬编码的秘密或 API 密钥。
    3. 为任何发现建议补救措施。
    ```

捆绑在您的扩展中的技能会被自动发现，并且当模型识别出相关任务时，可以在会话期间激活它们。

## 第 7 步：发布您的扩展

一旦您对您的扩展感到满意，就可以与他人分享。发布扩展的两种主要方式是通过 Git 仓库或通过 GitHub
Releases。使用公共 Git 仓库是最简单的方法。

有关这两种方法的详细说明，请参阅 [扩展发布指南](./extension-releasing.md)。

## 结论

您已成功创建了一个 Gemini CLI 扩展！您学到了如何：

- 从模板引导新扩展。
- 使用 MCP 服务器添加自定义工具。
- 创建方便的自定义命令。
- 为模型提供持久上下文。
- 捆绑专门的 Agent 技能。
- 链接您的扩展以进行本地开发。

从这里开始，您可以探索更多高级功能并在 Gemini CLI 中构建强大的新功能。
