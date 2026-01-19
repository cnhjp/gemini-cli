# 欢迎使用 Gemini CLI 文档

本文档提供了安装、使用和开发 Gemini CLI 的综合指南。Gemini
CLI 是一款允许您通过命令行界面与 Gemini 模型进行交互的工具。

## Gemini CLI 概览

Gemini
CLI 将 Gemini 模型的功能带到了您的终端，提供了一个交互式的“读取-求值-打印”循环（REPL）环境。Gemini
CLI 由一个客户端应用程序（`packages/cli`）组成，该程序与本地服务器（`packages/core`）通信，而本地服务器负责管理对 Gemini
API 及其 AI 模型的请求。Gemini
CLI 还包含各种工具，用于执行文件系统操作、运行 Shell 命令和网页获取等任务，这些工具均由
`packages/core` 管理。

## 浏览文档

本文档分为以下几个部分：

### 概览 (Overview)

- **[架构概览](./architecture.md):** 了解 Gemini
  CLI 的高层设计，包括其组件以及它们如何交互。
- **[贡献指南](../CONTRIBUTING.md):**
  针对贡献者和开发者的信息，包括设置、构建、测试和编码规范。

### 快速开始 (Get started)

- **[Gemini CLI 快速入门](./get-started/index.md):** 开始使用 Gemini CLI。
- **[Gemini 3 Pro on Gemini CLI](./get-started/gemini-3.md):**
  了解如何启用并使用 Gemini 3。
- **[身份验证](./get-started/authentication.md):** 向 Gemini CLI 进行身份验证。
- **[配置](./get-started/configuration.md):** 了解如何配置 CLI。
- **[安装](./get-started/installation.md):** 安装并运行 Gemini CLI。
- **[示例](./get-started/examples.md):** Gemini CLI 的使用示例。

### CLI

- **[简介: Gemini CLI](./cli/index.md):** 命令行界面概览。
- **[命令](./cli/commands.md):** 可用 CLI 命令的描述。
- **[检查点 (Checkpointing)](./cli/checkpointing.md):** 检查点功能的文档。
- **[自定义命令](./cli/custom-commands.md):**
  为常用提示词创建您自己的命令和快捷方式。
- **[企业版](./cli/enterprise.md):** 适用于企业的 Gemini CLI。
- **[无头模式](./cli/headless.md):** 以编程方式使用 Gemini
  CLI 进行脚本编写和自动化。
- **[快捷键](./cli/keyboard-shortcuts.md):**
  所有快捷键的参考，以提高您的工作效率。
- **[模型选择](./cli/model.md):** 使用 `/model` 选择用于处理命令的模型。
- **[沙盒](./cli/sandbox.md):** 在安全、容器化的环境中隔离工具执行。
- **[Agent 技能](./cli/skills.md):**
  (实验性) 使用专业知识和流程化工作流扩展 CLI。
- **[设置](./cli/settings.md):** 使用 `/settings`
  配置 CLI 行为和外观的各个方面。
- **[遥测](./cli/telemetry.md):** CLI 中的遥测概览。
- **[主题](./cli/themes.md):** Gemini CLI 的主题。
- **[Token 缓存](./cli/token-caching.md):** Token 缓存与优化。
- **[受信任文件夹](./cli/trusted-folders.md):** 受信任文件夹安全功能的概览。
- **[教程](./cli/tutorials.md):** Gemini CLI 教程。
- **[卸载](./cli/uninstall.md):** 卸载 Gemini CLI 的方法。

### 核心 (Core)

- **[简介: Gemini CLI Core](./core/index.md):** 关于 Gemini CLI 核心的信息。
- **[Memport](./core/memport.md):** 使用内存导入处理器 (Memory Import
  Processor)。
- **[工具 API](./core/tools-api.md):** 关于核心如何管理和暴露工具的信息。
- **[系统提示词覆盖](./cli/system-prompt.md):** 使用 `GEMINI_SYSTEM_MD`
  替换内置系统指令。
- **[策略引擎](./core/policy-engine.md):**
  使用策略引擎对工具执行进行细粒度控制。

### 工具 (Tools)

- **[简介: Gemini CLI Tools](./tools/index.md):** 关于 Gemini CLI 工具的信息。
- **[文件系统工具](./tools/file-system.md):** `read_file` 和 `write_file`
  工具的文档。
- **[Shell 工具](./tools/shell.md):** `run_shell_command` 工具的文档。
- **[Web 请求工具](./tools/web-fetch.md):** `web_fetch` 工具的文档。
- **[Web 搜索工具](./tools/web-search.md):** `google_web_search` 工具的文档。
- **[记忆工具](./tools/memory.md):** `save_memory` 工具的文档。
- **[待办工具](./tools/todos.md):** `write_todos` 工具的文档。
- **[MCP 服务器](./tools/mcp-server.md):** 在 Gemini CLI 中使用 MCP 服务器。

### 扩展 (Extensions)

- **[简介: 扩展](./extensions/index.md):** 如何通过新功能扩展 CLI。
- **[扩展开发入门](./extensions/getting-started-extensions.md):**
  学习如何构建您自己的扩展。
- **[发布扩展](./extensions/extension-releasing.md):** 如何发布 Gemini
  CLI 扩展。

### Hooks

- **[Hooks](./hooks/index.md):** 在关键生命周期点拦截并自定义 Gemini CLI 行为。
- **[编写 Hooks](./hooks/writing-hooks.md):**
  通过一个综合示例学习如何创建您的第一个 Hook。
- **[最佳实践](./hooks/best-practices.md):** Hooks 的安全、性能和调试指南。

### IDE 集成

- **[IDE 集成简介](./ide-integration/index.md):** 将 CLI 连接到您的编辑器。
- **[IDE 配套扩展规范](./ide-integration/ide-companion-spec.md):**
  构建 IDE 配套扩展的规范。

### 开发 (Development)

- **[NPM](./npm.md):** 项目包结构的详细信息。
- **[发布](./releases.md):** 关于项目发布和部署周期的信息。
- **[更新日志](./changelogs/index.md):** Gemini CLI 的亮点和重要变更。
- **[集成测试](./integration-tests.md):** 关于本项目中使用的集成测试框架的信息。
- **[Issue 和 PR 自动化](./issue-and-pr-automation.md):**
  我们用于管理和分类 Issue 及 Pull Request 的自动化流程的详细概览。

### 支持 (Support)

- **[FAQ](./faq.md):** 常见问题解答。
- **[故障排除指南](./troubleshooting.md):** 常见问题的解决方案。
- **[配额与定价](./quota-and-pricing.md):** 了解免费层级和付费选项。
- **[服务条款与隐私声明](./tos-privacy.md):** 适用于您使用 Gemini
  CLI 的服务条款和隐私声明信息。

希望本文档能帮助您充分利用 Gemini CLI！
