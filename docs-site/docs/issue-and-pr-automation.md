# 自动化和分类流程

本文档详细概述了我们用于管理和分类 Issue (问题) 和 Pull Request
(PR) 的自动化流程。我们的目标是提供及时的反馈，并确保贡献得到有效的审查和整合。了解此自动化将有助于您作为贡献者知道该期待什么，以及如何最好地与我们的仓库机器人互动。

## 指导原则：Issue 和 Pull Request

首先也是最重要的是，几乎每个 Pull Request
(PR) 都应该链接到相应的 Issue。Issue 描述“什么”和“为什么”（错误或功能），而 PR 是“如何”（实现）。这种分离有助于我们跟踪工作、确定功能的优先级并保持清晰的历史背景。我们的自动化是围绕这一原则建立的。

> **注意:** 标记为 "🔒Maintainers
> only" 的 Issue 仅供项目维护者使用。我们将不接受与这些 Issue 相关的 Pull
> Request。

---

## 详细的自动化工作流

以下是在我们的仓库中运行的具体自动化工作流的细分。

### 1. 当您打开一个 Issue 时：`Automated Issue Triage` (自动化 Issue 分类)

这是您创建 Issue 时与之交互的第一个机器人。它的工作是执行初步分析并应用正确的标签。

- **工作流文件**: `.github/workflows/gemini-automated-issue-triage.yml`
- **运行时机**: 创建或重新打开 Issue 后立即运行。
- **它做什么**:
  - 它使用 Gemini 模型根据一套详细的指导方针分析 Issue 的标题和正文。
  - **应用一个 `area/*` 标签**: 将 Issue 分类到项目的功能区域（例如 `area/ux`,
    `area/models`, `area/platform`）。
  - **应用一个 `kind/*` 标签**: 识别 Issue 的类型（例如 `kind/bug`,
    `kind/enhancement`, `kind/question`）。
  - **应用一个 `priority/*`
    标签**: 根据描述的影响分配从 P0（严重）到 P3（低）的优先级。
  - **可能应用
    `status/need-information`**: 如果 Issue 缺少关键细节（如日志或复现步骤），它将被标记以获取更多信息。
  - **可能应用
    `status/need-retesting`**: 如果 Issue 引用了超过六个版本之前的 CLI 版本，它将被标记以在当前版本上重新测试。
- **您应该做什么**:
  - 尽可能完整地填写 Issue 模板。您提供的细节越多，分类就越准确。
  - 如果添加了 `status/need-information` 标签，请在评论中提供请求的详细信息。

### 2. 当您打开一个 Pull Request 时：`Continuous Integration (CI)` (持续集成)

此工作流确保所有更改在合并之前符合我们的质量标准。

- **工作流文件**: `.github/workflows/ci.yml`
- **运行时机**: 对 Pull Request 的每次推送。
- **它做什么**:
  - **Lint**: 检查您的代码是否符合我们项目的格式和样式规则。
  - **Test**: 在 macOS、Windows 和 Linux 以及多个 Node.js 版本上运行我们的全套自动化测试。这是 CI 过程中最耗时的部分。
  - **发布覆盖率评论**: 所有测试成功通过后，机器人将在您的 PR 上发布评论。此评论提供了您的更改被测试覆盖程度的摘要。
- **您应该做什么**:
  - 确保所有 CI 检查通过。一切成功时，您的提交旁边会出现一个绿色的对勾 ✅。
  - 如果检查失败（红色的 "X"
    ❌），请点击失败检查旁边的 "Details" 链接查看日志，找出问题并推送修复。

### 3. Pull Request 的持续分类：`PR Auditing and Label Sync` (PR 审计和标签同步)

此工作流定期运行，以确保所有打开的 PR 都正确链接到 Issue 并具有一致的标签。

- **工作流文件**: `.github/workflows/gemini-scheduled-pr-triage.yml`
- **运行时机**: 每 15 分钟对所有打开的 Pull Request 运行一次。
- **它做什么**:
  - **检查链接的 Issue**: 机器人扫描您的 PR 描述，查找将其链接到 Issue 的关键字（例如
    `Fixes #123`, `Closes #456`）。
  - **添加 `status/need-issue`**: 如果未找到链接的 Issue，机器人将向您的 PR 添加
    `status/need-issue` 标签。这是一个明确的信号，表明需要创建并链接 Issue。
  - **同步标签**: 如果 _确实_
    链接了 Issue，机器人会确保 PR 的标签与 Issue 的标签完全匹配。它将添加任何缺失的标签并删除任何不属于的标签，如果存在
    `status/need-issue` 标签，它将将其删除。
- **您应该做什么**:
  - **始终将您的 PR 链接到 Issue。**
    这是最重要的一步。在您的 PR 描述中添加一行，如 `Resolves #<issue-number>`。
  - 这将确保您的 PR 被正确分类并在审查过程中顺利进行。

### 4. Issue 的持续分类：`Scheduled Issue Triage` (计划 Issue 分类)

这是一个回退工作流，以确保分类过程不会遗漏任何 Issue。

- **工作流文件**: `.github/workflows/gemini-scheduled-issue-triage.yml`
- **运行时机**: 每小时对所有打开的 Issue 运行一次。
- **它做什么**:
  - 它主动寻找完全没有标签或仍有 `status/need-triage` 标签的 Issue。
  - 然后，它触发与初始分类机器人相同的强大的基于 Gemini 的分析，以应用正确的标签。
- **您应该做什么**:
  - 您通常不需要做任何事情。此工作流是一个安全网，确保即使初始分类失败，每个 Issue 最终也会被分类。

### 5. 发布自动化

此工作流处理打包和发布新版本 Gemini CLI 的过程。

- **工作流文件**: `.github/workflows/release-manual.yml`
- **运行时机**: 按每日计划进行“每夜版 (nightly)”发布，并针对正式的补丁/次要版本进行手动发布。
- **它做什么**:
  - 自动构建项目，提升版本号，并将包发布到 npm。
  - 在 GitHub 上创建相应的发布版本并生成发布说明。
- **您应该做什么**:
  - 作为贡献者，您不需要为此过程做任何事情。您可以确信，一旦您的 PR 合并到
    `main` 分支，您的更改将包含在下一个每夜版中。

我们希望这个详细的概述对您有所帮助。如果您对我们的自动化或流程有任何疑问，请随时提问！
