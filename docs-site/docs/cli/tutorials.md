# 教程

本页包含与 Gemini CLI 交互的教程。

## Agent 技能

- [Agent 技能入门](./tutorials/skills-getting-started.md)

## 设置模型上下文协议 (MCP) 服务器

> [!CAUTION]
> 在使用第三方 MCP 服务器之前，请确保您信任其来源并了解其提供的工具。使用第三方服务器的风险由您自行承担。

本教程演示如何设置 MCP 服务器，以
[GitHub MCP 服务器](https://github.com/github/github-mcp-server) 为例。GitHub
MCP 服务器提供用于与 GitHub 仓库交互的工具，例如创建 Issue 和评论 Pull Request。

### 先决条件

在开始之前，请确保您已安装并配置以下内容：

- **Docker:** 安装并运行 [Docker]。
- **GitHub 个人访问令牌 (PAT):** 创建一个新的 [classic] 或 [fine-grained]
  PAT，并具有必要的范围。

[Docker]: https://www.docker.com/
[classic]: https://github.com/settings/tokens/new
[fine-grained]: https://github.com/settings/personal-access-tokens/new

### 指南

#### 在 `settings.json` 中配置 MCP 服务器

在您的项目根目录中，创建或打开
[`.gemini/settings.json` 文件](../get-started/configuration.md)。在文件中，添加
`mcpServers` 配置块，该块提供有关如何启动 GitHub MCP 服务器的说明。

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

#### 设置您的 GitHub 令牌

> [!CAUTION]
> 使用具有访问个人和私有仓库权限的广泛范围的个人访问令牌可能会导致私有仓库中的信息泄露到公共仓库中。我们建议使用不共享对公共和私有仓库访问权限的细粒度访问令牌。

使用环境变量存储您的 GitHub PAT：

```bash
GITHUB_PERSONAL_ACCESS_TOKEN="pat_YourActualGitHubTokenHere"
```

Gemini CLI 使用您在 `settings.json` 文件中定义的 `mcpServers` 配置中的此值。

#### 启动 Gemini CLI 并验证连接

启动 Gemini CLI 时，它会自动读取您的配置并在后台启动 GitHub
MCP 服务器。然后，您可以使用自然语言提示词要求 Gemini
CLI 执行 GitHub 操作。例如：

```bash
"获取 'foo/bar' 仓库中分配给我的所有未解决 Issue 并确定其优先级"
```
