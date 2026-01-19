# 记忆工具 (`save_memory`)

本文档描述了 Gemini CLI 的 `save_memory` 工具。

## 描述

使用 `save_memory` 在您的 Gemini CLI 会话之间保存和调用信息。通过
`save_memory`，您可以指导 CLI 记住跨会话的关键细节，从而提供个性化和定向的帮助。

### 参数

`save_memory` 接受一个参数：

- `fact`
  (string, 必需): 要记住的具体事实或信息。这应该是一个用自然语言编写的清晰、独立的陈述。

## 如何在 Gemini CLI 中使用 `save_memory`

该工具将提供的 `fact` 追加到位于用户主目录 (`~/.gemini/GEMINI.md`) 中的特殊
`GEMINI.md` 文件中。此文件可以配置为具有不同的名称。

添加后，事实存储在 `## Gemini Added Memories`
部分下。此文件作为上下文加载到后续会话中，允许 CLI 调用已保存的信息。

用法:

```
save_memory(fact="Your fact here.")
```

### `save_memory` 示例

记住用户偏好：

```
save_memory(fact="My preferred programming language is Python.")
```

存储特定于项目的细节：

```
save_memory(fact="The project I'm currently working on is called 'gemini-cli'.")
```

## 重要说明

- **一般用法:**
  此工具应用于简洁、重要的事实。它不适用于存储大量数据或对话历史记录。
- **记忆文件:**
  记忆文件是一个纯文本 Markdown 文件，因此您可以根据需要手动查看和编辑它。
