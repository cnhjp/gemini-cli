# 自定义命令

自定义命令允许您将最喜欢或最常用的提示词保存为 Gemini
CLI 中的个人快捷方式并重复使用。您可以创建特定于单个项目的命令，或者跨所有项目全局可用的命令，从而简化工作流程并确保一致性。

## 文件位置和优先级

Gemini CLI 从两个位置发现命令，并按特定顺序加载：

1.  **用户命令（全局）:** 位于
    `~/.gemini/commands/`。这些命令在您处理的任何项目中都可用。
2.  **项目命令（本地）:** 位于
    `<your-project-root>/.gemini/commands/`。这些命令特定于当前项目，并且可以检入版本控制以便与您的团队共享。

如果项目目录中的命令与用户目录中的命令同名，**将始终使用项目命令**。这允许项目使用特定于项目的版本覆盖全局命令。

## 命名和命名空间

命令的名称由其相对于 `commands`
目录的文件路径决定。子目录用于创建命名空间命令，路径分隔符（`/` 或
`\`）转换为冒号 (`:`)。

- 位于 `~/.gemini/commands/test.toml` 的文件变为命令 `/test`。
- 位于 `<project>/.gemini/commands/git/commit.toml` 的文件变为命名空间命令
  `/git:commit`。

## TOML 文件格式 (v1)

您的命令定义文件必须以 TOML 格式编写并使用 `.toml` 文件扩展名。

### 必填字段

- `prompt`
  (String): 执行命令时将发送给 Gemini 模型的提示词。这可以是单行或多行字符串。

### 可选字段

- `description` (String): 命令功能的简短单行描述。此文本将显示在 `/help`
  菜单中的命令旁边。**如果省略此字段，将从文件名生成通用描述。**

## 处理参数

自定义命令支持两种强大的参数处理方法。CLI 根据命令 `prompt`
的内容自动选择正确的方法。

### 1. 使用 `{{args}}` 进行上下文感知注入

如果您的 `prompt` 包含特殊占位符
`{{args}}`，CLI 将用用户在命令名后输入的文本替换该占位符。

这种注入的行为取决于它的使用位置：

**A. 原始注入（在 shell 命令之外）**

当在提示词的主体中使用时，参数将完全按照用户输入的方式注入。

**示例 (`git/fix.toml`):**

```toml
# 调用方式: /git:fix "Button is misaligned"

description = "针对给定问题生成修复。"
prompt = "Please provide a code fix for the issue described here: {{args}}."
```

模型接收到：
`Please provide a code fix for the issue described here: "Button is misaligned".`

**B. 在 shell 命令中使用参数（在 `!{...}` 块内）**

当您在 shell 注入块 (`!{...}`) 内使用 `{{args}}` 时，参数在替换前会自动进行
**shell 转义**。这允许您安全地将参数传递给 shell 命令，确保生成的命令在语法上正确且安全，同时防止命令注入漏洞。

**示例 (`/grep-code.toml`):**

```toml
prompt = """
Please summarize the findings for the pattern `{{args}}`.

Search Results:
!{grep -r {{args}} .}
"""
```

当您运行 `/grep-code It's complicated` 时：

1. CLI 看到 `{{args}}` 同时在 `!{...}` 之外和之内使用。
2. 外部：第一个 `{{args}}` 被原始替换为 `It's complicated`。
3. 内部：第二个 `{{args}}`
   被替换为转义版本（例如，在 Linux 上：`"It\'s complicated"`）。
4. 执行的命令是 `grep -r "It's complicated" .`。
5. CLI 会提示您在执行前确认此确切、安全的命令。
6. 发送最终提示词。

### 2. 默认参数处理

如果您的 `prompt` **不**包含特殊占位符 `{{args}}`，CLI 使用默认行为处理参数。

如果您为命令提供参数（例如
`/mycommand arg1`），CLI 会将您输入的完整命令追加到提示词的末尾，并用两个换行符分隔。这允许模型看到原始说明和您刚刚提供的具体参数。

如果您**不**提供任何参数（例如
`/mycommand`），提示词将完全按原样发送给模型，不追加任何内容。

**示例 (`changelog.toml`):**

此示例展示了如何通过定义模型角色、解释在哪里查找用户输入以及指定预期的格式和行为来创建健壮的命令。

```toml
# 文件位置: <project>/.gemini/commands/changelog.toml
# 调用方式: /changelog 1.2.0 added "Support for default argument parsing."

description = "向项目的 CHANGELOG.md 文件添加新条目。"
prompt = """
# Task: Update Changelog

You are an expert maintainer of this software project. A user has invoked a command to add a new entry to the changelog.

**The user's raw command is appended below your instructions.**

Your task is to parse the `<version>`, `<change_type>`, and `<message>` from their input and use the `write_file` tool to correctly update the `CHANGELOG.md` file.

## Expected Format
The command follows this format: `/changelog <version> <type> <message>`
- `<type>` must be one of: "added", "changed", "fixed", "removed".

## Behavior
1. Read the `CHANGELOG.md` file.
2. Find the section for the specified `<version>`.
3. Add the `<message>` under the correct `<type>` heading.
4. If the version or type section doesn't exist, create it.
5. Adhere strictly to the "Keep a Changelog" format.
"""
```

当您运行 `/changelog 1.2.0 added "New feature"`
时，发送给模型的最终文本将是原始提示词，后跟两个换行符和您输入的命令。

### 3. 使用 `!{...}` 执行 shell 命令

您可以通过直接在 `prompt`
中执行 shell 命令并注入其输出来使您的命令动态化。这非常适合从本地环境收集上下文，例如读取文件内容或检查 Git 状态。

当自定义命令尝试执行 shell 命令时，Gemini
CLI 现在会在继续之前提示您确认。这是一项安全措施，以确保只能运行预期的命令。

**工作原理:**

1.  **注入命令:** 使用 `!{...}` 语法。
2.  **参数替换:** 如果块内存在 `{{args}}`，它将自动进行 shell 转义（见上文
    [上下文感知注入](#1-context-aware-injection-with-args)）。
3.  **强大的解析:**
    解析器正确处理包含嵌套大括号的复杂 shell 命令，例如 JSON 负载。**注意:**
    `!{...}` 内的内容必须具有平衡的大括号（`{` 和
    `}`）。如果您需要执行包含不平衡大括号的命令，请考虑将其包装在外部脚本文件中，并在
    `!{...}` 块内调用该脚本。
4.  **安全检查和确认:**
    CLI 对最终解析的命令（在参数转义和替换之后）执行安全检查。将出现一个对话框，显示要执行的确切命令。
5.  **执行和错误报告:**
    执行命令。如果命令失败，注入到提示词中的输出将包含错误消息 (stderr)，后跟状态行，例如
    `[Shell command exited with code 1]`。这有助于模型了解失败的上下文。

**示例 (`git/commit.toml`):**

此命令获取暂存的 git diff，并使用它要求模型编写提交消息。

````toml
# 文件位置: <project>/.gemini/commands/git/commit.toml
# 调用方式: /git:commit

description = "根据暂存的更改生成 Git 提交消息。"

# 提示词使用 !{...} 执行命令并注入其输出。
prompt = """
Please generate a Conventional Commit message based on the following git diff:

```diff
!{git diff --staged}
```

"""

````

当您运行 `/git:commit` 时，CLI 首先执行 `git diff --staged`，然后将
`!{git diff --staged}` 替换为该命令的输出，然后再将最终完整的提示词发送给模型。

### 4. 使用 `@{...}` 注入文件内容

您可以使用 `@{...}`
语法直接将文件内容或目录列表嵌入到您的提示词中。这对于创建对特定文件进行操作的命令非常有用。

**工作原理:**

- **文件注入**: `@{path/to/file.txt}` 被 `file.txt` 的内容替换。
- **多模态支持**: 如果路径指向受支持的图像（例如 PNG,
  JPEG）、PDF、音频或视频文件，它将被正确编码并作为多模态输入注入。其他二进制文件将被优雅地处理并跳过。
- **目录列表**: `@{path/to/dir}`
  会被遍历，并且目录及其所有子目录中存在的每个文件都会插入到提示词中。如果启用了，这将遵守
  `.gitignore` 和 `.geminiignore`。
- **工作区感知**: 命令在当前目录和任何其他工作区目录中搜索路径。如果在工作区内，允许使用绝对路径。
- **处理顺序**: 文件内容注入 `@{...}`
  在 shell 命令 (`!{...}`) 和参数替换 (`{{args}}`) _之前_ 处理。
- **解析**: 解析器要求 `@{...}` 内的内容（路径）具有平衡的大括号（`{` 和 `}`）。

**示例 (`review.toml`):**

此命令注入 _固定_
的最佳实践文件 (`docs/best-practices.md`) 的内容，并使用用户的参数为审查提供上下文。

```toml
# 文件位置: <project>/.gemini/commands/review.toml
# 调用方式: /review FileCommandLoader.ts

description = "使用最佳实践指南审查提供的上下文。"
prompt = """
You are an expert code reviewer.

Your task is to review {{args}}.

Use the following best practices when providing your review:

@{docs/best-practices.md}
"""
```

当您运行 `/review FileCommandLoader.ts`
时，在将最终提示词发送给模型之前，`@{docs/best-practices.md}`
占位符将被该文件的内容替换，并且 `{{args}}` 将被您提供的文本替换。

---

## 示例：一个 "纯函数" 重构命令

让我们创建一个全局命令，要求模型重构一段代码。

**1. 创建文件和目录:**

首先，确保用户命令目录存在，然后创建一个 `refactor`
子目录用于组织和最终的 TOML 文件。

```bash
mkdir -p ~/.gemini/commands/refactor
touch ~/.gemini/commands/refactor/pure.toml
```

**2. 向文件添加内容:**

在编辑器中打开 `~/.gemini/commands/refactor/pure.toml`
并添加以下内容。为了最佳实践，我们包括可选的 `description`。

```toml
# 文件位置: ~/.gemini/commands/refactor/pure.toml
# 此命令将通过以下方式调用: /refactor:pure

description = "要求模型将当前上下文重构为纯函数。"

prompt = """
Please analyze the code I've provided in the current context.
Refactor it into a pure function.

Your response should include:
1. The refactored, pure function code block.
2. A brief explanation of the key changes you made and why they contribute to purity.
"""
```

**3. 运行命令:**

就是这样！您现在可以在 CLI 中运行您的命令。首先，您可能会将文件添加到上下文，然后调用您的命令：

```
> @my-messy-function.js
> /refactor:pure
```

Gemini CLI 随后将执行您在 TOML 文件中定义的多行提示词。

```

```
