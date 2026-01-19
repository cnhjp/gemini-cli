# 发布信心策略

本文档概述了对 Gemini
CLI 每次发布获得信心的策略。它是发布经理的检查清单和质量门槛，以确保我们交付高质量的产品。

## 目标

基于对自动化信号、手动验证和数据的全面评估，以高度的信心回答这个问题：“此版本
_真的_ 准备好供用户使用了吗？”

## 级别 1: 自动化门槛 (必须通过)

这些是基准要求。如果其中任何一项失败，发布即告终止。

### 1. CI/CD 健康状况

`.github/workflows/ci.yml` 中的所有工作流必须在 `main`
分支（对于 nightly 版）或 release 分支（对于 preview/stable 版）上通过。

- **平台:** 测试必须在 **Linux 和 macOS** 上通过。
  - _注意:_ Windows 测试目前使用 `continue-on-error: true`
    运行。虽然这里的失败在技术上不会阻止发布，但应该进行调查。
- **检查:**
  - **Linting:** 无 linting 错误 (ESLint, Prettier 等)。
  - **类型检查:** 无 TypeScript 错误。
  - **单元测试:** `packages/core` 和 `packages/cli` 中的所有单元测试必须通过。
  - **构建:** 项目必须成功构建和打包。

### 2. 端到端 (E2E) 测试

`.github/workflows/chained_e2e.yml` 中的所有工作流必须通过。

- **平台:** **Linux, macOS 和 Windows**。
- **沙盒:** 测试必须在 Linux 上以 `sandbox:none` 和 `sandbox:docker` 通过。

### 3. 部署后冒烟测试

发布到 npm 后，`smoke-test.yml`
工作流运行。这必须通过以确​​认包可安装且二进制文件可执行。

- **命令:** `npx -y @google/gemini-cli@<tag> --version`
  必须无错误地返回正确的版本。
- **平台:** 目前在 `ubuntu-latest` 上运行。

## 级别 2: 手动验证和内部测试 (Dogfooding)

自动化测试无法捕捉所有问题，特别是 UX 问题。

### 1. 通过 `preview` 标签进行内部测试

每周发布节奏将代码从 `main` -> `nightly` -> `preview` -> `stable` 推进。

- **要求:** `preview` 版本必须由维护者使用至少 **一周**，然后才能提升为
  `stable`。
- **行动:** 维护者应在本地安装预览版：
  ```bash
  npm install -g @google/gemini-cli@preview
  ```
- **目标:** 在日常使用中捕捉回归和 UX 问题，以免影响广大用户群。

### 2. 关键用户旅程 (CUJ) 检查清单

在将 `preview` 版本提升为 `stable` 之前，发布经理必须手动运行此检查清单。

- **设置:**
  - [ ] 卸载任何现有的全局版本： `npm uninstall -g @google/gemini-cli`
  - [ ] 清除 npx 缓存（可选但推荐）：`npm cache clean --force`
  - [ ] 安装预览版本：`npm install -g @google/gemini-cli@preview`
  - [ ] 验证版本：`gemini --version`

- **身份验证:**
  - [ ] 在交互模式下运行 `/auth` 并验证所有登录流程均有效：
    - [ ] 使用 Google 登录
    - [ ] API 密钥
    - [ ] Vertex AI

- **基本提示:**
  - [ ] 运行 `gemini "Tell me a joke"` 并验证响应是否合理。
  - [ ] 在交互模式下运行：`gemini`。问一个后续问题以测试上下文。

- **管道输入:**
  - [ ] 运行 `echo "Summarize this" | gemini` 并验证它处理 stdin。

- **上下文管理:**
  - [ ] 在交互模式下，使用 `@file` 将本地文件添加到上下文。问一个关于它的问题。

- **设置:**
  - [ ] 在交互模式下运行 `/settings` 并进行修改
  - [ ] 验证设置已更改

- **函数调用:**
  - [ ] 在交互模式下，要求 gemini “创建一个名为 hello.md 的文件，内容为 'hello
        world'”，并验证文件创建正确。

如果任何这些 CUJ 失败，发布将终止，直到补丁应用到 `preview` 频道。

### 3. 发布前 Bug Bash (第 1 和 2 层发布)

对于高影响力的发布，需要组织 Bug
Bash 以确保更高水平的质量，并捕捉更广泛环境和用例中的问题。

**层级定义:**

- **第 1 层:** 行业动向新闻 🚀
- **第 2 层:** 对用户的重要新闻 📣
- **第 3 层:** 相关，但非改变生活 💡
- **第 4 层:** Bug 修复 ⚒️

**要求:**

对于任何第 1 层或第 2 层发布，必须至少在 **72 小时前** 安排一次 Bug Bash。

**经验法则:**

对于涉及以下任何内容的发布，应考虑进行 Bug Bash：

- 博客文章
- 协调的社交媒体公告
- 媒体关系或新闻外联
- "Turbo" 发布活动

## 级别 3: 遥测和数据审查

### 仪表板健康状况

- [ ] 转到 `go/gemini-cli-dash`。
- [ ] 导航到 "Tool Call" 选项卡。
- [ ] 验证您想要提升的版本没有错误激增。

### 模型评估

- [ ] 转到 `go/gemini-cli-offline-evals-dash`。
- [ ] 确保您想要提升的版本的定期运行在平均评估运行范围内。

## "Go/No-Go" 决策

在触发 `Release: Promote` 工作流以将 `preview` 移动到 `stable` 之前：

1.  [ ] **级别 1:** 对于对应于当前 `preview`
        标签的提交，CI 和 E2E 工作流为绿色。
2.  [ ] **级别 2:** `preview`
        版本已发布一周，并且发布经理已成功完成 CUJ 检查清单。未报告阻塞性问题。
3.  [ ] **级别 3:** 仪表板健康状况和模型评估检查已完成且未显示回归。

如果所有检查通过，继续进行提升。
