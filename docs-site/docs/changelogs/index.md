# Gemini CLI 发布说明

Gemini
CLI 有三个主要的发布渠道：nightly（每夜版）、preview（预览版）和 stable（稳定版）。对于大多数用户，我们推荐使用稳定版。

在此页面上，您可以找到有关当前发布的信息以及每个发布的公告。

有关完整的变更日志，请参阅 GitHub 上的
[Releases - google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli/releases)。

## 当前发布

| 发布渠道                       | 说明                             |
| :----------------------------- | :------------------------------- |
| Nightly                        | 包含最新更改的每夜发布。         |
| [Preview (预览版)](preview.md) | 准备好接受早期反馈的实验性功能。 |
| [Stable (稳定版)](latest.md)   | 稳定，推荐一般使用。             |

## 公告: v0.23.0 - 2026-01-07

- 🎉 **预览版支持实验性 Agent 技能:** Gemini CLI 现在我们的预览版构建中支持
  [Agent Skills](https://agentskills.io/home)。这是一个早期预览，我们要征求反馈！
  - 安装预览版: `npm install -g @google/gemini-cli@preview`
  - 在 `/settings` 中启用
  - 文档:
    [https://geminicli.com/docs/cli/skills/](https://geminicli.com/docs/cli/skills/)
- **Gemini CLI wrapped:** 运行 `npx gemini-wrapped`
  来可视化您的使用统计、顶级模型、语言等！
- **Windows 剪贴板图像支持:** Windows 用户现在可以使用 `Alt`+`V`
  直接将剪贴板中的图像粘贴到 CLI 中。([pr](https://github.com/google-gemini/gemini-cli/pull/13997)
  by [@sgeraldes](https://github.com/sgeraldes))
- **终端背景颜色检测:**
  自动优化终端的背景颜色以选择兼容的主题并提供可访问性警告。([pr](https://github.com/google-gemini/gemini-cli/pull/15132)
  by [@jacob314](https://github.com/jacob314))
- **会话注销:** 使用新的 `/logout`
  命令即时清除凭据并重置您的身份验证状态，以便无缝切换帐户。([pr](https://github.com/google-gemini/gemini-cli/pull/13383)
  by [@CN-Scars](https://github.com/CN-Scars))

## 公告: v0.22.0 - 2025-12-22

- 🎉**免费层级 + Gemini 3:** 免费层级用户现在都可以访问 Gemini 3 Pro &
  Flash。通过将 "Preview Features" 切换为 `true` 在 `/settings` 中启用。
- 🎉**Gemini CLI + Colab:** Gemini
  CLI 现在已预安装。可以在笔记本单元格中无头使用，或在内置终端中交互式使用 ([pic](https://imgur.com/a/G0Tn7vi))
- 🎉**Gemini CLI 扩展:**
  - **Conductor:** Planning++,
    Gemini 与您一起制定详细计划，根据需要提取额外细节，最终为 LLM 提供带有工件的护栏。三思而后行！

    `gemini extensions install https://github.com/gemini-cli-extensions/conductor`

    博客:
    [https://developers.googleblog.com/conductor-introducing-context-driven-development-for-gemini-cli/](https://developers.googleblog.com/conductor-introducing-context-driven-development-for-gemini-cli/)

  - **Endor Labs:** 使用自然语言执行代码分析、漏洞扫描和依赖项检查。

    `gemini extensions install https://github.com/endorlabs/gemini-extension`

## 公告: v0.21.0 - 2025-12-15

- **⚡️⚡️⚡️ Gemini 3 Flash + Gemini CLI:** 比 2.5
  Pro 更好、更快、更便宜 - 在某些情况下甚至优于 3
  Pro！对于付费层级 + 等待名单上的免费层级用户，请在 `/settings` 中启用
  **Preview Features**。
- 更多信息:
  [Gemini 3 Flash is now available in Gemini CLI](https://developers.googleblog.com/gemini-3-flash-is-now-available-in-gemini-cli/).
- 🎉 Gemini CLI 扩展:
  - Rill: 使用自然语言分析 Rill 数据，无需手动查询即可探索指标和趋势。
    `gemini extensions install https://github.com/rilldata/rill-gemini-extension`
  - Browserbase: 与网页交互、截图、提取信息并以原子精度执行自动化操作。
    `gemini extensions install https://github.com/browserbase/mcp-server-browserbase`
- 配额可见性: `/stats`
  命令现在显示所有可用模型的配额信息，包括当前会话中未使用的模型。 (@sehoon38)
- 模糊设置搜索: 用户现在可以在设置对话框中使用模糊搜索快速查找设置。 (@sehoon38)
- MCP 资源支持: 用户现在可以使用 @ 命令发现、查看和搜索资源。 (@MrLesk)
- 自动执行简单斜杠命令: 简单的斜杠命令现在在回车时立即执行。 (@jackwotherspoon)

## 公告: v0.20.0 - 2025-12-01

- **多文件拖放:**
  用户现在可以将多个文件拖放到终端中，CLI 会自动为每个有效路径加上 `@`
  前缀。([pr](https://github.com/google-gemini/gemini-cli/pull/14832) by
  [@jackwotherspoon](https://github.com/jackwotherspoon))
- **持久化 "Always Allow" 策略:** 用户现在可以保存工具执行的 "Always
  Allow"（始终允许）决定，并对特定 shell 命令和多云平台工具进行细粒度控制。([pr](https://github.com/google-gemini/gemini-cli/pull/14737)
  by [@allenhutchison](https://github.com/allenhutchison))

## 公告: v0.19.0 - 2025-11-24

- 🎉 **新扩展:**
  - **Eleven Labs:** 使用 Eleven Labs Gemini
    CLI 扩展创建、播放、管理您的音频播放轨道：
    `gemini extensions install https://github.com/elevenlabs/elevenlabs-mcp`
- **Zed 集成:** 用户在 CLI 的 `/settings` 中启用 "Preview
  Features" 后，现在可以在 Zed 集成中利用 Gemini
  3。([pr](https://github.com/google-gemini/gemini-cli/pull/13398) by
  [@benbrandt](https://github.com/benbrandt))
- **交互式 Shell:**
  - **点击聚焦:** 当启用 "Use Alternate
    Buffer"（使用备用缓冲区）设置时，用户可以点击嵌入式 shell 输出以聚焦输入。([pr](https://github.com/google-gemini/gemini-cli/pull/13341)
    by [@galz10](https://github.com/galz10))
  - **加载短语:**
    清楚地指示交互式 shell 何时等待用户输入。([vid](https://imgur.com/a/kjK8bUK),
    [pr](https://github.com/google-gemini/gemini-cli/pull/12535) by
    [@jackwotherspoon](https://github.com/jackwotherspoon))

## 公告: v0.18.0 - 2025-11-17

- 🎉 **新扩展:**
  - **Google Workspace**: 将 Gemini
    CLI 与您的 Workspace 数据集成。编写文档、构建幻灯片、与他人聊天，甚至在表格中进行计算：
    `gemini extensions install https://github.com/gemini-cli-extensions/workspace`
    - 博客:
      [https://allen.hutchison.org/2025/11/19/bringing-the-office-to-the-terminal/](https://allen.hutchison.org/2025/11/19/bringing-the-office-to-the-terminal/)
  - **Redis:** 使用自然语言管理和搜索 Redis 中的数据：
    `gemini extensions install https://github.com/redis/mcp-redis`
  - **Anomalo:** 通过命令和自然语言查询您的数据仓库表元数据和质量状态：
    `gemini extensions install https://github.com/datagravity-ai/anomalo-gemini-extension`
- **实验性权限改进:** 我们现在正在 Gemini
  CLI 中试验新的策略引擎。这允许用户和管理员为工具调用创建细粒度的策略。目前位于标志后面。有关更多信息，请参阅
  [策略引擎文档](../core/policy-engine.md)。
  - 博客:
    [https://allen.hutchison.org/2025/11/26/the-guardrails-of-autonomy/](https://allen.hutchison.org/2025/11/26/the-guardrails-of-autonomy/)
- **付费用户的 Gemini 3 支持:** Gemini 3 支持已向所有 API 密钥、Google AI
  Pro 或 Google AI Ultra（针对个人，非企业）和 Gemini Code Assist
  Enterprise 用户推出。通过 `/settings` 并切换 **Preview Features** 来启用它。
- **更新的 UI 回滚:**
  我们暂时回滚了更新的 UI，以便给它更多的时间来完善。这意味着暂时您将没有嵌入式滚动或鼠标支持。您可以通过
  `/settings` -> **Use Alternate Screen Buffer** -> `true` 重新启用。
- **历史记录中的模型:** 用户现在可以在 `/settings`
  中切换以在聊天历史记录中显示模型。([gif](https://imgur.com/a/uEmNKnQ),
  [pr](https://github.com/google-gemini/gemini-cli/pull/13034) by
  [@scidomino](https://github.com/scidomino))
- **批量卸载:**
  用户现在可以使用单个命令卸载多个扩展。([pic](https://imgur.com/a/9Dtq8u2),
  [pr](https://github.com/google-gemini/gemini-cli/pull/13016) by
  [@JayadityaGit](https://github.com/JayadityaGit))

## 公告: v0.16.0 - 2025-11-10

- **Gemini 3 + Gemini CLI:** 启动 🚀🚀🚀
- **Data Commons Gemini CLI 扩展** - 一个新的 Data Commons Gemini
  CLI 扩展，允许您从 datacommons.org 查询开源统计数据。**要开始使用，您需要 Data
  Commons API 密钥并安装 uv**。这些以及其他入门详情可以在
  [https://github.com/gemini-cli-extensions/datacommons](https://github.com/gemini-cli-extensions/datacommons)
  找到。

## 公告: v0.15.0 - 2025-11-03

- **🎉 无缝滚动 UI 和鼠标支持:** 我们对 Gemini
  CLI 进行了重大改版，使您的终端体验更加流畅和完善。您现在可以获得无闪烁的显示，带有粘性标题以保持重要上下文可见，以及不会到处跳动的稳定输入提示。我们甚至添加了鼠标支持，因此您可以点击您需要输入的地方！([gif](https://imgur.com/a/O6qc7bx),
  [@jacob314](https://github.com/jacob314))。
  - **公告:**
    [https://developers.googleblog.com/en/making-the-terminal-beautiful-one-pixel-at-a-time/](https://developers.googleblog.com/en/making-the-terminal-beautiful-one-pixel-at-a-time/)
- **🎉 新合作伙伴扩展:**
  - **Arize:** 使用 Arize
    AX 无缝检测 AI 应用程序并授予直接访问 Arize 支持的权限：
    `gemini extensions install https://github.com/Arize-ai/arize-tracing-assistant`
  - **Chronosphere:** 检索日志、指标、跟踪、事件和特定实体：
    `gemini extensions install https://github.com/chronosphereio/chronosphere-mcp`
  - **Transmit:**
    用于创建生产就绪的身份验证和身份工作流的综合上下文、验证和自动化修复：
    `gemini extensions install https://github.com/TransmitSecurity/transmit-security-journey-builder`
- **待办事项规划 (Todo planning):**
  复杂问题现在被分解为模型可以管理和检查的待办事项列表。([gif](https://imgur.com/a/EGDfNlZ),
  [pr](https://github.com/google-gemini/gemini-cli/pull/12905) by
  [@anj-s](https://github.com/anj-s))
- **禁用 GitHub 扩展:**
  用户现在可以阻止从 GitHub 安装和加载扩展。([pr](https://github.com/google-gemini/gemini-cli/pull/12838)
  by [@kevinjwang1](https://github.com/kevinjwang1))。
- **扩展重启:** 用户现在可以使用 `/extensions restart`
  命令显式重启扩展。([pr](https://github.com/google-gemini/gemini-cli/pull/12739)
  by [@jakemac53](https://github.com/jakemac53))。
- **更好的 Angular 支持:**
  Angular 工作流现在应该更加无缝 ([pr](https://github.com/google-gemini/gemini-cli/pull/10252)
  by [@MarkTechson](https://github.com/MarkTechson))。
- **验证命令:**
  用户现在可以检查本地扩展是否格式正确。([pr](https://github.com/google-gemini/gemini-cli/pull/12186)
  by [@kevinjwang1](https://github.com/kevinjwang1))。

(更早的公告省略)
