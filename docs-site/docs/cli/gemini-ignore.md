# 忽略文件

本文档概述了 Gemini CLI 的 Gemini Ignore (`.geminiignore`) 功能。

Gemini CLI 包含自动忽略文件的能力，类似于 `.gitignore`（Git 使用）和
`.aiexclude`（Gemini Code Assist 使用）。将路径添加到您的 `.geminiignore`
文件会将它们从支持此功能的工具中排除，尽管它们对于其他服务（如 Git）仍然可见。

## 工作原理

当您向 `.geminiignore`
文件添加路径时，遵守此文件的工具将从其操作中排除匹配的文件和目录。例如，当您使用
`@` 命令共享文件时，`.geminiignore` 文件中的任何路径都将被自动排除。

在很大程度上，`.geminiignore` 遵循 `.gitignore` 文件的约定：

- 空行和以 `#` 开头的行被忽略。
- 支持标准 glob 模式（例如 `*`, `?`, 和 `[]`）。
- 在末尾加上 `/` 将仅匹配目录。
- 在开头加上 `/` 将路径锚定到相对于 `.geminiignore` 文件的位置。
- `!` 否定模式。

您可以随时更新您的 `.geminiignore` 文件。要应用更改，您必须重新启动 Gemini
CLI 会话。

## 如何使用 `.geminiignore`

要启用 `.geminiignore`:

1. 在项目目录的根目录中创建一个名为 `.geminiignore` 的文件。

要向 `.geminiignore` 添加文件或目录：

1. 打开您的 `.geminiignore` 文件。
2. 添加您要忽略的路径或文件，例如：`/archive/` 或 `apikeys.txt`。

### `.geminiignore` 示例

您可以使用 `.geminiignore` 忽略目录和文件：

```
# 排除您的 /packages/ 目录及其所有子目录
/packages/

# 排除您的 apikeys.txt 文件
apikeys.txt
```

您可以在 `.geminiignore` 文件中使用通配符 `*`：

```
# 排除所有 .md 文件
*.md
```

最后，您可以使用 `!` 将文件和目录从排除中排除（即包含它们）：

```
# 排除所有 .md 文件，除了 README.md
*.md
!README.md
```

要从 `.geminiignore` 文件中删除路径，请删除相关行。
