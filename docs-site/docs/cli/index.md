# Gemini CLI

在 Gemini CLI 中，`packages/cli` 是用户与 Gemini
AI 模型及其相关工具发送和接收提示词的前端。关于 Gemini CLI 的总体概览，请参阅
[主文档页面](../index.md)。

## 基本功能

- **[命令 (Commands)](./commands.md):** 所有内置斜杠命令的参考。
- **[自定义命令 (Custom commands)](./custom-commands.md):**
  为常用提示词创建您自己的命令和快捷方式。
- **[无头模式 (Headless mode)](./headless.md):** 以编程方式使用 Gemini
  CLI 进行脚本编写和自动化。
- **[模型选择 (Model selection)](./model.md):** 配置 CLI 使用的 Gemini AI 模型。
- **[设置 (Settings)](./settings.md):** 配置 CLI 行为和外观的各个方面。
- **[主题 (Themes)](./themes.md):** 使用不同的主题自定义 CLI 的外观。
- **[快捷键 (Keyboard shortcuts)](./keyboard-shortcuts.md):**
  所有快捷键的参考，以提高您的工作效率。
- **[教程 (Tutorials)](./tutorials.md):** 常见任务的分步指南。

## 高级功能

- **[检查点 (Checkpointing)](./checkpointing.md):**
  自动保存和恢复会话及文件的快照。
- **[企业配置 (Enterprise configuration)](./enterprise.md):**
  在企业环境中部署和管理 Gemini CLI。
- **[沙盒 (Sandboxing)](./sandbox.md):** 在安全、容器化的环境中隔离工具执行。
- **[Agent 技能 (Agent Skills)](./skills.md):**
  (实验性) 使用专业知识和流程化工作流扩展 CLI。
- **[遥测 (Telemetry)](./telemetry.md):** 配置可观测性以监控使用情况和性能。
- **[Token 缓存 (Token caching)](./token-caching.md):**
  通过缓存 Token 优化 API 成本。
- **[受信任文件夹 (Trusted folders)](./trusted-folders.md):**
  控制哪些项目可以使用 CLI 全部功能的安全特性。
- **[忽略文件 (.geminiignore)](./gemini-ignore.md):**
  将特定文件和目录排除在工具访问之外。
- **[上下文文件 (GEMINI.md)](./gemini-md.md):** 为模型提供持久的、分层的上下文。
- **[系统提示词覆盖 (System prompt override)](./system-prompt.md):** 使用
  `GEMINI_SYSTEM_MD` 替换内置系统指令。

## 非交互模式

Gemini
CLI 可以在非交互模式下运行，这对于脚本编写和自动化非常有用。在此模式下，您将输入通过管道传递给 CLI，CLI 执行命令，然后退出。

以下示例将命令从终端通过管道传递给 Gemini CLI：

```bash
echo "What is fine tuning?" | gemini
```

您也可以使用 `--prompt` 或 `-p` 标志：

```bash
gemini -p "What is fine tuning?"
```

有关无头使用、脚本编写、自动化和高级示例的综合文档，请参阅
**[无头模式](./headless.md)** 指南。
