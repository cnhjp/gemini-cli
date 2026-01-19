# 系统提示词覆盖 (GEMINI_SYSTEM_MD)

指导 Gemini CLI 的核心系统指令可以完全替换为您自己的 Markdown 文件。此功能通过
`GEMINI_SYSTEM_MD` 环境变量控制。

## 概览

`GEMINI_SYSTEM_MD`
变量指示 CLI 使用外部 Markdown 文件作为其系统提示词，完全覆盖内置默认值。这是完全替换，而不是合并。如果您使用自定义文件，除非您自己包含它们，否则原始核心指令均不适用。

此功能面向需要强制执行严格的、特定于项目的行为或创建自定义角色的高级用户。

> 提示：您可以先将当前默认系统提示词导出到文件，查看它，然后有选择地修改或替换它（请参阅
> [“导出默认提示词”](#export-the-default-prompt-recommended)）。

## 如何启用

您可以在 shell 中临时设置环境变量，或通过 `.gemini/.env` 文件持久化它。请参阅
[持久化环境变量](../get-started/authentication.md#persisting-environment-variables)。

- 使用项目默认路径 (`.gemini/system.md`):
  - `GEMINI_SYSTEM_MD=true` 或 `GEMINI_SYSTEM_MD=1`
  - CLI 读取 `./.gemini/system.md`（相对于您当前的项目目录）。

- 使用自定义文件路径:
  - `GEMINI_SYSTEM_MD=/absolute/path/to/my-system.md`
  - 支持相对路径并从当前工作目录解析。
  - 支持波浪号扩展（例如 `~/my-system.md`）。

- 禁用覆盖（使用内置提示词）:
  - `GEMINI_SYSTEM_MD=false` 或 `GEMINI_SYSTEM_MD=0` 或取消设置变量。

如果启用了覆盖但目标文件不存在，CLI 将报错：`missing system prompt file '<path>'`。

## 快速示例

- 使用项目文件的一次性会话:
  - `GEMINI_SYSTEM_MD=1 gemini`
- 为项目持久化（使用 `.gemini/.env`）:
  - 创建 `.gemini/system.md`，然后添加到 `.gemini/.env`:
    - `GEMINI_SYSTEM_MD=1`
- 使用主目录下的自定义文件:
  - `GEMINI_SYSTEM_MD=~/prompts/SYSTEM.md gemini`

## UI 指示器

当 `GEMINI_SYSTEM_MD` 处于活动状态时，CLI 在 UI 中显示 `|⌐■_■|`
指示器以发出自定义系统提示词模式的信号。

## 导出默认提示词（推荐）

在覆盖之前，导出当前默认提示词，以便您可以查看所需的安全和工作流规则。

- 将内置提示词写入项目默认路径:
  - `GEMINI_WRITE_SYSTEM_MD=1 gemini`
- 或写入自定义路径:
  - `GEMINI_WRITE_SYSTEM_MD=~/prompts/DEFAULT_SYSTEM.md gemini`

这将创建文件并将当前内置系统提示词写入其中。

## 最佳实践：SYSTEM.md vs GEMINI.md

- SYSTEM.md (固件):
  - 不可协商的操作规则：安全性、工具使用协议、批准以及保持 CLI 可靠的机制。
  - 跨任务和项目稳定（或在需要时按项目）。
- GEMINI.md (策略):
  - 角色、目标、方法论和项目/领域上下文。
  - 随任务演变；依靠 SYSTEM.md 进行安全执行。

保持 SYSTEM.md 最小化但完整，以确保安全和工具操作。保持 GEMINI.md 专注于高级指导和项目细节。

## 故障排除

- 错误: `missing system prompt file '…'`
  - 确保引用的路径存在且可读。
  - 对于 `GEMINI_SYSTEM_MD=1|true`，在您的项目中创建 `./.gemini/system.md`。
- 覆盖未生效
  - 确认变量已加载（使用 `.gemini/.env` 或在 shell 中导出）。
  - 路径是从当前工作目录解析的；尝试绝对路径。
- 恢复默认值
  - 取消设置 `GEMINI_SYSTEM_MD` 或将其设置为 `0`/`false`。
