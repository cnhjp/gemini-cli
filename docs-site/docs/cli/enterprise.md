# 企业版 Gemini CLI

本文档概述了在企业环境中部署和管理 Gemini
CLI 的配置模式和最佳实践。通过利用系统级设置，管理员可以强制执行安全策略、管理工具访问并确保所有用户的一致体验。

> **关于安全性的说明：**
> 本文档中描述的模式旨在帮助管理员创建一个更可控和安全的 Gemini
> CLI 使用环境。但是，它们不应被视为万无一失的安全边界。拥有足够本地机器权限的坚定用户可能仍然能够规避这些配置。这些措施旨在防止意外滥用并在受管环境中强制执行公司策略，而不是防御具有本地管理权限的恶意行为者。

## 集中配置：系统设置文件

企业管理最强大的工具是系统范围的设置文件。这些文件允许您定义基线配置 (`system-defaults.json`) 和一组适用于机器上所有用户的覆盖 (`settings.json`)。有关配置选项的完整概述，请参阅
[配置文档](../get-started/configuration.md)。

设置从四个文件合并。单值设置（如 `theme`）的优先级顺序为：

1. 系统默认值 (`system-defaults.json`)
2. 用户设置 (`~/.gemini/settings.json`)
3. 工作区设置 (`<project>/.gemini/settings.json`)
4. 系统覆盖 (`settings.json`)

这意味着系统覆盖文件具有最终决定权。对于数组 (`includeDirectories`) 或对象 (`mcpServers`) 设置，值将被合并。

**合并和优先级示例:**

以下是来自不同级别的设置如何组合的。

- **系统默认值 `system-defaults.json`:**

  ```json
  {
    "ui": {
      "theme": "default-corporate-theme"
    },
    "context": {
      "includeDirectories": ["/etc/gemini-cli/common-context"]
    }
  }
  ```

- **用户 `settings.json` (`~/.gemini/settings.json`):**

  ```json
  {
    "ui": {
      "theme": "user-preferred-dark-theme"
    },
    "mcpServers": {
      "corp-server": {
        "command": "/usr/local/bin/corp-server-dev"
      },
      "user-tool": {
        "command": "npm start --prefix ~/tools/my-tool"
      }
    },
    "context": {
      "includeDirectories": ["~/gemini-context"]
    }
  }
  ```

- **工作区 `settings.json` (`<project>/.gemini/settings.json`):**

  ```json
  {
    "ui": {
      "theme": "project-specific-light-theme"
    },
    "mcpServers": {
      "project-tool": {
        "command": "npm start"
      }
    },
    "context": {
      "includeDirectories": ["./project-context"]
    }
  }
  ```

- **系统覆盖 `settings.json`:**
  ```json
  {
    "ui": {
      "theme": "system-enforced-theme"
    },
    "mcpServers": {
      "corp-server": {
        "command": "/usr/local/bin/corp-server-prod"
      }
    },
    "context": {
      "includeDirectories": ["/etc/gemini-cli/global-context"]
    }
  }
  ```

这将产生以下合并配置：

- **最终合并配置:**
  ```json
  {
    "ui": {
      "theme": "system-enforced-theme"
    },
    "mcpServers": {
      "corp-server": {
        "command": "/usr/local/bin/corp-server-prod"
      },
      "user-tool": {
        "command": "npm start --prefix ~/tools/my-tool"
      },
      "project-tool": {
        "command": "npm start"
      }
    },
    "context": {
      "includeDirectories": [
        "/etc/gemini-cli/common-context",
        "~/gemini-context",
        "./project-context",
        "/etc/gemini-cli/global-context"
      ]
    }
  }
  ```

**原因:**

- **`theme`**: 使用来自系统覆盖的值 (`system-enforced-theme`)，因为它具有最高优先级。
- **`mcpServers`**: 对象被合并。来自系统覆盖的 `corp-server`
  定义优先于用户的定义。包含唯一的 `user-tool` 和 `project-tool`。
- **`includeDirectories`**: 数组按系统默认值、用户、工作区、然后是系统覆盖的顺序连接。

- **位置**:
  - **Linux**: `/etc/gemini-cli/settings.json`
  - **Windows**: `C:\ProgramData\gemini-cli\settings.json`
  - **macOS**: `/Library/Application Support/GeminiCli/settings.json`
  - 路径可以使用 `GEMINI_CLI_SYSTEM_SETTINGS_PATH` 环境变量覆盖。
- **控制**: 此文件应由系统管理员管理，并受适当的文件权限保护，以防止用户未经授权的修改。

通过使用系统设置文件，您可以强制执行下述安全和配置模式。

### 使用包装脚本强制执行系统设置

虽然 `GEMINI_CLI_SYSTEM_SETTINGS_PATH`
环境变量提供了灵活性，但用户可能会覆盖它以指向不同的设置文件，从而绕过集中管理的配置。为了缓解这种情况，企业可以部署包装脚本或别名，以确保环境变量始终设置为企业控制的路径。

这种方法确保无论用户如何调用 `gemini` 命令，企业设置始终以最高优先级加载。

**示例包装脚本:**

管理员可以创建一个名为 `gemini` 的脚本，并将其放置在用户 `PATH` 中比实际 Gemini
CLI 二进制文件更早出现的目录中（例如 `/usr/local/bin/gemini`）。

```bash
#!/bin/bash

# 强制执行公司系统设置文件的路径。
# 这确保始终应用公司的配置。
export GEMINI_CLI_SYSTEM_SETTINGS_PATH="/etc/gemini-cli/settings.json"

# 查找原始 gemini 可执行文件。
# 这是一个简单的示例；根据安装方法，可能需要更强大的解决方案。
REAL_GEMINI_PATH=$(type -aP gemini | grep -v "^$(type -P gemini)$" | head -n 1)

if [ -z "$REAL_GEMINI_PATH" ]; then
  echo "Error: The original 'gemini' executable was not found." >&2
  exit 1
fi

# 将所有参数传递给真正的 Gemini CLI 可执行文件。
exec "$REAL_GEMINI_PATH" "$@"
```

通过部署此脚本，`GEMINI_CLI_SYSTEM_SETTINGS_PATH` 在脚本的环境中设置，并且
`exec` 命令用实际的 Gemini
CLI 进程替换脚本进程，后者继承了环境变量。这使得用户绕过强制设置变得更加困难。

## 限制工具访问

通过控制 Gemini 模型可以使用的工具，您可以显着增强安全性。这是通过 `tools.core`
和 `tools.exclude` 设置实现的。有关可用工具的列表，请参阅
[工具文档](../tools/index.md)。

### 使用 `coreTools` 进行白名单控制

最安全的方法是将用户允许执行的工具和命令明确添加到白名单中。这可以防止使用任何不在批准列表中的工具。

**示例:** 仅允许安全的只读文件操作和列出文件。

```json
{
  "tools": {
    "core": ["ReadFileTool", "GlobTool", "ShellTool(ls)"]
  }
}
```

### 使用 `excludeTools` 进行黑名单控制

或者，您可以将您环境中被视为危险的特定工具添加到黑名单中。

**示例:** 防止使用 shell 工具删除文件。

```json
{
  "tools": {
    "exclude": ["ShellTool(rm -rf)"]
  }
}
```

**安全说明:** 使用 `excludeTools` 进行黑名单控制不如使用 `coreTools`
进行白名单控制安全，因为它依赖于阻止已知的恶意命令，聪明的用户可能会找到绕过简单基于字符串的阻止的方法。**推荐使用白名单方法。**

### 禁用 YOLO 模式

为了确保用户无法绕过工具执行的确认提示，您可以在策略级别禁用 YOLO 模式。这增加了一层关键的安全性，因为它可以防止模型在没有用户明确批准的情况下执行工具。

**示例:** 强制所有工具执行都需要用户确认。

```json
{
  "security": {
    "disableYoloMode": true
  }
}
```

在企业环境中强烈建议使用此设置，以防止意外的工具执行。

## 管理自定义工具 (MCP 服务器)

如果您的组织通过 [模型上下文协议 (MCP) 服务器](../core/tools-api.md)
使用自定义工具，了解如何管理服务器配置以有效应用安全策略至关重要。

### MCP 服务器配置如何合并

Gemini CLI 从三个级别加载 `settings.json` 文件：系统、工作区和用户。当涉及到
`mcpServers` 对象时，这些配置是 **合并** 的：

1.  **合并:** 来自所有三个级别的服务器列表被组合成一个列表。
2.  **优先级:** 如果在多个级别定义了具有 **相同名称** 的服务器（例如，名为
    `corp-api`
    的服务器同时存在于系统和用户设置中），则使用最高优先级级别的定义。优先级顺序为：**系统 > 工作区 > 用户**。

这意味着用户 **不能** 覆盖已在系统级设置中定义的服务器的定义。但是，他们
**可以** 添加具有唯一名称的新服务器。

### 强制执行工具目录

您的 MCP 工具生态系统的安全性取决于定义规范服务器并将它们的名称添加到白名单的组合。

### 限制 MCP 服务器内的工具

为了获得更高的安全性，尤其是在处理第三方 MCP 服务器时，您可以限制服务器中的哪些特定工具暴露给模型。这是使用服务器定义中的
`includeTools` 和 `excludeTools`
属性完成的。这允许您使用服务器中的一部分工具，而不允许潜在危险的工具。

遵循最小特权原则，强烈建议使用 `includeTools` 创建仅包含必要工具的白名单。

**示例:** 仅允许来自第三方 MCP 服务器的 `code-search` 和 `get-ticket-details`
工具，即使该服务器提供其他工具（如 `delete-ticket`）。

```json
{
  "mcp": {
    "allowed": ["third-party-analyzer"]
  },
  "mcpServers": {
    "third-party-analyzer": {
      "command": "/usr/local/bin/start-3p-analyzer.sh",
      "includeTools": ["code-search", "get-ticket-details"]
    }
  }
}
```

#### 更安全的模式：在系统设置中定义并添加到白名单

要创建安全、集中管理的工具目录，系统管理员 **必须** 在系统级 `settings.json`
文件中执行以下两项操作：

1.  在 `mcpServers` 对象中为每个批准的服务器
    **定义完整配置**。这确保即使其实用户定义了同名服务器，安全的系统级定义也将优先。
2.  使用 `mcp.allowed` 设置将这些服务器的
    **名称添加到白名单**。这是一个关键的安全步骤，可防止用户运行任何不在此列表中的服务器。如果省略此设置，CLI 将合并并允许用户定义的任何服务器。

**示例系统 `settings.json`:**

1. 将所有批准服务器的 _名称_ 添加到白名单。这将防止用户添加自己的服务器。

2. 为白名单上的每个服务器提供规范 _定义_。

```json
{
  "mcp": {
    "allowed": ["corp-data-api", "source-code-analyzer"]
  },
  "mcpServers": {
    "corp-data-api": {
      "command": "/usr/local/bin/start-corp-api.sh",
      "timeout": 5000
    },
    "source-code-analyzer": {
      "command": "/usr/local/bin/start-analyzer.sh"
    }
  }
}
```

这种模式更安全，因为它同时使用了定义和白名单。用户定义的任何服务器要么被系统定义覆盖（如果名称相同），要么因为其名称不在
`mcp.allowed` 列表中而被阻止。

### 不太安全的模式：省略白名单

如果管理员定义了 `mcpServers` 对象但未同时指定 `mcp.allowed`
白名单，用户可以添加自己的服务器。

**示例系统 `settings.json`:**

此配置定义了服务器但未强制执行白名单。管理员未包含 "mcp.allowed" 设置。

```json
{
  "mcpServers": {
    "corp-data-api": {
      "command": "/usr/local/bin/start-corp-api.sh"
    }
  }
}
```

在这种情况下，用户可以在其本地 `settings.json` 中添加自己的服务器。因为没有
`mcp.allowed`
列表来过滤合并结果，用户的服务器将被添加到可用工具列表中并允许运行。

## 强制执行沙盒以确保安全性

为了减轻潜在有害操作的风险，您可以强制对所有工具执行使用沙盒。沙盒在容器化环境中隔离工具执行。

**示例:** 强制所有工具执行在 Docker 沙盒内发生。

```json
{
  "tools": {
    "sandbox": "docker"
  }
}
```

您还可以通过构建自定义 `sandbox.Dockerfile`
来指定用于沙盒的自定义、强化的 Docker 镜像，如 [沙盒文档](./sandbox.md) 所述。

## 通过代理控制网络访问

在具有严格网络策略的企业环境中，您可以配置 Gemini
CLI 以通过企业代理路由所有出站流量。这可以通过环境变量进行设置，也可以通过
`mcpServers` 配置强制执行自定义工具。

**示例（针对 MCP 服务器）:**

```json
{
  "mcpServers": {
    "proxied-server": {
      "command": "node",
      "args": ["mcp_server.js"],
      "env": {
        "HTTP_PROXY": "http://proxy.example.com:8080",
        "HTTPS_PROXY": "http://proxy.example.com:8080"
      }
    }
  }
}
```

## 遥测和审计

为了审计和监控目的，您可以配置 Gemini
CLI 将遥测数据发送到中心位置。这允许您跟踪工具使用情况和其他事件。有关更多信息，请参阅
[遥测文档](./telemetry.md)。

**示例:** 启用遥测并将其发送到本地 OTLP 收集器。如果未指定
`otlpEndpoint`，它默认为 `http://localhost:4317`。

```json
{
  "telemetry": {
    "enabled": true,
    "target": "gcp",
    "logPrompts": false
  }
}
```

**注意:** 确保在企业设置中将 `logPrompts` 设置为
`false`，以避免从用户提示词中收集潜在的敏感信息。

## 身份验证

您可以通过在系统级 `settings.json` 文件中设置 `enforcedAuthType`
来强制所有用户使用特定的身份验证方法。这可以防止用户选择不同的身份验证方法。有关更多详细信息，请参阅
[身份验证文档](./authentication.md)。

**示例:** 强制所有用户使用 Google 登录。

```json
{
  "enforcedAuthType": "oauth-personal"
}
```

如果用户配置了不同的身份验证方法，系统将提示他们切换到强制的方法。在非交互模式下，如果配置的身份验证方法与强制的方法不匹配，CLI 将退出并显示错误。

### 限制登录到企业域

对于使用 Google
Workspace 的企业，您可以强制用户仅使用其企业 Google 账号进行身份验证。这是在代理服务器上配置的网络级控制，而不是在 Gemini
CLI 本身中配置。它的工作原理是拦截对 Google 的身份验证请求并添加特殊的 HTTP 标头。

此策略阻止用户使用个人 Gmail 账号或其他非企业 Google 账号登录。

有关详细说明，请参阅 Google Workspace 管理员帮助文章
[阻止访问消费者账号](https://support.google.com/a/answer/1668854?hl=zh-Hans#zippy=%2C%E6%AD%A5%E9%AA%A4%E9%80%89%E6%8B%A9%E4%B8%80%E4%B8%AA%E7%BD%91%E7%BB%9C%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8%2C%E6%AD%A5%E9%AA%A4%E9%85%8D%E7%BD%AE%E7%BD%91%E7%BB%9C%E4%BB%A5%E5%B1%8F%E8%94%BD%E7%89%B9%E5%AE%9A%E8%B4%A6%E5%8F%B7)。

一般步骤如下：

1.  **拦截请求**: 配置您的 Web 代理以拦截所有对 `google.com` 的请求。
2.  **添加 HTTP 标头**: 对于每个拦截的请求，添加 `X-GoogApps-Allowed-Domains`
    HTTP 标头。
3.  **指定域**: 标头的值应为您批准的 Google Workspace 域名的逗号分隔列表。

**示例标头:**

```
X-GoogApps-Allowed-Domains: my-corporate-domain.com, secondary-domain.com
```

当存在此标头时，Google 的身份验证服务将只允许属于指定域的账号登录。

## 综合示例：系统 `settings.json`

这是一个系统 `settings.json` 文件的示例，它结合了上面讨论的几种模式，为 Gemini
CLI 创建了一个安全、受控的环境。

```json
{
  "tools": {
    "sandbox": "docker",
    "core": [
      "ReadFileTool",
      "GlobTool",
      "ShellTool(ls)",
      "ShellTool(cat)",
      "ShellTool(grep)"
    ]
  },
  "mcp": {
    "allowed": ["corp-tools"]
  },
  "mcpServers": {
    "corp-tools": {
      "command": "/opt/gemini-tools/start.sh",
      "timeout": 5000
    }
  },
  "telemetry": {
    "enabled": true,
    "target": "gcp",
    "otlpEndpoint": "https://telemetry-prod.example.com:4317",
    "logPrompts": false
  },
  "advanced": {
    "bugCommand": {
      "urlTemplate": "https://servicedesk.example.com/new-ticket?title={title}&details={info}"
    }
  },
  "privacy": {
    "usageStatisticsEnabled": false
  }
}
```

此配置：

- 强制所有工具执行进入 Docker 沙盒。
- 严格使用一小组安全 shell 命令和文件工具的白名单。
- 为自定义工具定义并允许单个企业 MCP 服务器。
- 启用遥测以进行审计，但不记录提示词内容。
- 将 `/bug` 命令重定向到内部票务系统。
- 禁用一般使用情况统计信息收集。
