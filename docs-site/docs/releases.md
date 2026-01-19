# Gemini CLI 发布

## `dev` vs `prod` 环境

我们的发布流程支持 `dev` 和 `prod` 环境。

`dev` 环境推送到私有的 Github 托管 NPM 仓库，包名以 `@google-gemini/**`
开头，而不是 `@google/**`。

`prod` 环境通过 Wombat Dressing
Room 推送到公共全局 NPM 注册表，这是 Google 用于管理 `@google/**`
命名空间中 NPM 包的系统。所有包都命名为 `@google/**`。

有关这些系统的更多信息，请参阅 [NPM 包概览](npm.md)。

### 包范围

| 包 (Package) | `prod` (Wombat Dressing Room) | `dev` (Github Private NPM Repo)           |
| ------------ | ----------------------------- | ----------------------------------------- |
| CLI          | @google/gemini-cli            | @google-gemini/gemini-cli                 |
| Core         | @google/gemini-cli-core       | @google-gemini/gemini-cli-core A2A Server |
| A2A Server   | @google/gemini-cli-a2a-server | @google-gemini/gemini-cli-a2a-server      |

## 发布节奏和标签

我们将尽可能紧密地遵循
https://semver.org/，但会在必须偏离时指出。我们的每周发布将是次要版本增量，发布之间的任何
bug 或热修复将作为最新发布的补丁版本发布。

每个星期二约 UTC 20:00 将发布新的 Stable 和 Preview 版本。提升流程如下：

- 代码每天晚上提交到 main 并推送到 nightly
- 在 main 上不超过 1 周后，代码被提升到 `preview` 频道
- 1 周后，最新的 `preview` 频道被提升到 `stable` 频道
- 根据需要针对 `preview` 和 `stable`
  生成补丁修复，每次最终 'patch' 版本号都会增加。

### Preview (预览版)

这些版本尚未经过全面审查，可能包含回归或其他未解决的问题。请帮助我们使用
`preview` 标签进行测试和安装。

```bash
npm install -g @google/gemini-cli@preview
```

### Stable (稳定版)

这将是上周发布的全面提升 + 任何 bug 修复和验证。使用 `latest` 标签。

```bash
npm install -g @google/gemini-cli@latest
```

### Nightly (每夜版)

- 新版本将在每天 UTC
  00:00 发布。这将是发布时 main 分支的所有更改。应假定存在待处理的验证和问题。使用
  `nightly` 标签。

```bash
npm install -g @google/gemini-cli@nightly
```

## 每周发布提升

每个星期二，值班工程师将触发 "Promote
Release" 工作流。这个单一操作自动化了整个每周发布过程：

1.  **将 preview 提升为 stable:** 工作流识别最新的 `preview` 版本并将其提升为
    `stable`。这成为 npm 上的新 `latest` 版本。
2.  **将 nightly 提升为 preview:** 最新的 `nightly` 版本随后被提升为新的
    `preview` 版本。
3.  **为下一个 nightly 做准备:** 自动创建并合并 Pull Request 以增加 `main`
    中的版本号，为下一个 nightly 发布做准备。

此过程确保了一致且可靠的发布节奏，只需最少的手动干预。

### 版本控制的真实来源

为了确保最高的可靠性，发布提升过程使用 **NPM 注册表作为单一真实来源**
来确定每个发布频道（`stable`, `preview` 和 `nightly`）的当前版本。

1.  **从 NPM 获取:** 工作流首先查询 NPM 的 `dist-tags` (`latest`, `preview`,
    `nightly`) 以获取当前可供用户使用的包的确切版本字符串。
2.  **完整性交叉检查:**
    对于从 NPM 检索到的每个版本，工作流执行关键的完整性检查：
    - 它验证仓库中是否存在相应的 **git tag**。
    - 它验证是否已创建相应的 **GitHub Release**。
3.  **差异时停止:** 如果 NPM 上列出的版本缺少 git tag 或 GitHub
    Release，工作流将立即失败。这种严格的检查可以防止从损坏或不完整的先前版本进行提升，并提醒值班工程师需要手动解决的发布状态不一致问题。
4.  **计算下一个版本:**
    只有在这些检查通过后，工作流才会继续根据从 NPM 检索到的受信任版本号计算下一个语义版本。

这种以 NPM 为先的方法，辅以完整性检查，使发布过程高度稳健，并防止仅依赖 git 历史记录或 API 输出可能产生的版本差异。

## 手动发布

对于需要在常规每夜和每周提升计划之外发布，且尚未被补丁流程覆盖的情况，您可以使用
`Release: Manual`
工作流。此工作流提供了一种从任何分支、标签或提交 SHA 发布特定版本的直接方式。

### 如何创建手动发布

1.  导航到仓库的 **Actions** 选项卡。
2.  从列表中选择 **Release: Manual** 工作流。
3.  点击 **Run workflow** 下拉按钮。
4.  填写所需的输入：
    - **Version**: 要发布的具体版本（例如 `v0.6.1`）。这必须是带有 `v`
      前缀的有效语义版本。
    - **Ref**: 要发布的分支、标签或完整提交 SHA。
    - **NPM Channel**: 要发布到的 npm 频道。选项包括 `preview`, `nightly`,
      `latest`（用于稳定版）和 `dev`。默认为 `dev`。
    - **Dry Run**: 保持为 `true` 以运行所有步骤而不发布，或设置为 `false`
      以执行实时发布。
    - **Force Skip Tests**: 设置为 `true` 以跳过测试套件。不建议用于生产发布。
    - **Skip GitHub Release**: 设置为 `true` 以跳过创建 GitHub
      Release 且仅创建 npm 发布。
    - **Environment**: 选择适当的环境。`dev` 环境用于测试。`prod`
      环境用于生产发布。`prod` 是默认值，需要发布管理员的授权。
5.  点击 **Run workflow**。

工作流随后将进行测试（如果未跳过）、构建并发布版本。如果在非试运行期间工作流失败，它将自动创建一个包含失败详细信息的 GitHub
Issue。

## 回滚/前滚

如果发布出现严重回归，您可以通过更改 npm `dist-tag`
快速回滚到以前的稳定版本或前滚到新补丁。`Release: Change Tags`
工作流为此提供了一种安全且受控的方式。

这是回滚和前滚的首选方法，因为它不需要完整的发布周期。

### 如何更改发布标签

1.  导航到仓库的 **Actions** 选项卡。
2.  从列表中选择 **Release: Change Tags** 工作流。
3.  点击 **Run workflow** 下拉按钮。
4.  填写所需的输入：
    - **Version**: 您想要标签指向的现有包版本（例如 `0.5.0-preview-2`）。此版本
      **必须** 已经发布到 npm 注册表。
    - **Channel**: 要应用的 npm `dist-tag`（例如 `preview`, `stable`）。
    - **Dry Run**: 保持为 `true` 以记录操作而不进行更改，或设置为 `false`
      以执行实时标签更改。
    - **Environment**: 选择适当的环境。`dev` 环境用于测试。`prod`
      环境用于生产发布。`prod` 是默认值，需要发布管理员的授权。
5.  点击 **Run workflow**。

工作流随后将为相应的 `gemini-cli`, `gemini-cli-core` 和 `gemini-cli-a2a-server`
包运行 `npm dist-tag add`，将指定频道指向指定版本。

## 补丁 (Patching)

如果需要在 `stable` 或 `preview` 版本上修复已经在 `main`
上修复的严重错误，该过程现在已高度自动化。

### 如何打补丁

#### 1. 创建补丁 Pull Request

有两种方法可以创建补丁 Pull Request：

**选项 A: 从 GitHub 评论（推荐）**

在包含修复的 Pull Request 合并后，维护者可以在同一个 PR 上添加格式如下的评论：

`/patch [channel]`

- **channel** (可选):
  - _无频道_ - 同时修补 stable 和 preview 频道（默认，推荐用于大多数修复）
  - `both` - 同时修补 stable 和 preview 频道（同默认）
  - `stable` - 仅修补 stable 频道
  - `preview` - 仅修补 preview 频道

示例：

- `/patch` (同时修补 stable 和 preview - 默认)
- `/patch both` (同时修补 stable 和 preview - 显式)
- `/patch stable` (仅修补 stable)
- `/patch preview` (仅修补 preview)

`Release: Patch from Comment` 工作流将自动找到合并提交 SHA 并触发
`Release: Patch (1) Create PR` 工作流。如果 PR 尚未合并，它将发布评论指示失败。

**选项 B: 手动触发工作流**

导航到 **Actions** 选项卡并运行 **Release: Patch (1) Create PR** 工作流。

- **Commit**: 您想要 cherry-pick 的 `main` 上的提交的完整 SHA。
- **Channel**: 您想要修补的频道（`stable` 或 `preview`）。

此工作流将自动：

1.  找到该频道的最新发布标签。
2.  如果不存在，则从该标签创建发布分支（例如 `release/v0.5.1-pr-12345`）。
3.  从发布分支创建一个新的热修复分支。
4.  将您指定的提交 cherry-pick 到热修复分支。
5.  创建从热修复分支回发布分支的 Pull Request。

#### 2. 审查并合并

审查自动创建的 Pull Request 以确保 cherry-pick 成功且更改正确。批准后，合并 Pull
Request。

**安全说明:** `release/*` 分支受分支保护规则保护。对这些分支之一的 Pull
Request 需要至少一位代码所有者的审查才能合并。这确保不会发布未经授权的代码。

#### 2.5. 向热修复添加多个提交（高级）

如果需要在单个补丁发布中包含多个修复，您可以在创建初始补丁 PR 后向热修复分支添加额外的提交：

1. **从主要修复开始**: 在最重要的 PR 上使用 `/patch`（或
   `/patch both`）来创建初始热修复分支和 PR。

2. **在本地检出热修复分支**:

   ```bash
   git fetch origin
   git checkout hotfix/v0.5.1/stable/cherry-pick-abc1234  # 使用 PR 中的实际分支名称
   ```

3. **Cherry-pick 额外的提交**:

   ```bash
   git cherry-pick <commit-sha-1>
   git cherry-pick <commit-sha-2>
   # 根据需要添加任意数量的提交
   ```

4. **推送更新的分支**:

   ```bash
   git push origin hotfix/v0.5.1/stable/cherry-pick-abc1234
   ```

5. **测试和审查**: 现有的补丁 PR 将自动使用您的额外提交进行更新。彻底测试，因为您现在正在一起发布多个更改。

6. **更新 PR 描述**: 考虑更新 PR 标题和描述，以反映它包含多个修复。

这种方法允许您将相关修复分组到单个补丁发布中，同时保持对包含内容和如何解决冲突的完全控制。

#### 3. 自动发布

合并 Pull Request 后，`Release: Patch (2) Trigger`
工作流会自动触发。然后它将启动 `Release: Patch (3) Release` 工作流，该工作流将：

1.  构建并测试修补后的代码。
2.  将新的补丁版本发布到 npm。
3.  创建带有补丁说明的新 GitHub Release。

这个完全自动化的过程确保补丁被一致且可靠地创建和发布。

#### 故障排除：旧分支工作流

**问题**: 如果补丁触发工作流失败，出现类似 "Resource not accessible by
integration" 的错误或引用不存在的工作流文件（例如
`patch-release.yml`），这表明热修复分支包含过时版本的工作流文件。

**根本原因**: 当 PR 合并时，GitHub Actions 运行
**源分支**（热修复分支）的工作流定义，而不是目标分支（发布分支）。如果热修复分支是从早于工作流改进的旧发布分支创建的，它将使用旧的工作流逻辑。

**解决方案**:

**选项 1: 手动触发（快速修复）**
从包含最新工作流代码的分支手动触发更新的工作流：

```bash
# 对于跳过测试的 preview 频道补丁
gh workflow run release-patch-2-trigger.yml --ref <branch-with-updated-workflow> \
  --field ref="hotfix/v0.6.0-preview.2/preview/cherry-pick-abc1234" \
  --field workflow_ref=<branch-with-updated-workflow> \
  --field dry_run=false \
  --field force_skip_tests=true

# 对于 stable 频道补丁
gh workflow run release-patch-2-trigger.yml --ref <branch-with-updated-workflow> \
  --field ref="hotfix/v0.5.1/stable/cherry-pick-abc1234" \
  --field workflow_ref=<branch-with-updated-workflow> \
  --field dry_run=false \
  --field force_skip_tests=false

# 使用 main 分支的示例（最常见的情况）
gh workflow run release-patch-2-trigger.yml --ref main \
  --field ref="hotfix/v0.6.0-preview.2/preview/cherry-pick-abc1234" \
  --field workflow_ref=main \
  --field dry_run=false \
  --field force_skip_tests=true
```

**注意**: 将 `<branch-with-updated-workflow>`
替换为包含最新工作流改进的分支（通常是
`main`，如果是测试更新，也可能是功能分支）。

**选项 2: 更新热修复分支**
将最新的 main 分支合并到您的热修复分支以获取更新的工作流：

```bash
git checkout hotfix/v0.6.0-preview.2/preview/cherry-pick-abc1234
git merge main
git push
```

然后关闭并重新打开 PR 以使用更新的版本重新触发工作流。

**选项 3: 直接发布触发** 完全跳过触发工作流并直接运行发布工作流：

```bash
# 将 channel 和 release_ref 替换为适当的值
gh workflow run release-patch-3-release.yml --ref main \
  --field type="preview" \
  --field dry_run=false \
  --field force_skip_tests=true \
  --field release_ref="release/v0.6.0-preview.2"
```

### Docker

我们还运行一个名为 [release-docker.yml](../.gcp/release-docker.yml) 的 Google
Cloud
Build。它发布与您的版本匹配的沙盒 Docker。一旦服务账号权限整理好，这也将移至 GH 并与主发布文件结合。

## 发布验证

推送新版本后，应执行冒烟测试以确保包按预期工作。这可以通过在本地安装包并运行一组测试来确保它们正常运行来完成。

- `npx -y @google/gemini-cli@latest --version`
  验证推送是否按预期工作（如果您没有做 rc 或 dev 标签）
- `npx -y @google/gemini-cli@<release tag> --version` 验证标签是否适当地推送
- _这在本地具有破坏性_
  `npm uninstall @google/gemini-cli && npm uninstall -g @google/gemini-cli && npm cache clean --force &&  npm install @google/gemini-cli@<version>`
- 建议对运行一些 llm 命令和工具进行基本运行的冒烟测试，以确保包按预期工作。以后我们会将其整理成文。

## 本地测试和验证：更改打包和发布流程

如果您需要在不实际发布到 NPM 或创建公共 GitHub
Release 的情况下测试发布流程，可以从 GitHub UI 手动触发工作流。

1.  转到仓库的
    [Actions 选项卡](https://github.com/google-gemini/gemini-cli/actions/workflows/release-manual.yml)。
2.  点击 "Run workflow" 下拉菜单。
3.  保持 `dry_run` 选项选中 (`true`)。
4.  点击 "Run workflow" 按钮。

这将运行整个发布过程，但会跳过 `npm publish` 和 `gh release create`
步骤。您可以检查工作流日志以确保一切按预期工作。

在提交代码之前，务必在本地测试对打包和发布流程的任何更改。这确保了包将被正确发布，并且在用户安装时按预期工作。

要验证您的更改，您可以执行发布流程的试运行。这将模拟发布流程，而无需实际将包发布到 npm 注册表。

```bash
npm_package_version=9.9.9 SANDBOX_IMAGE_REGISTRY="registry" SANDBOX_IMAGE_NAME="thename" npm run publish:npm --dry-run
```

此命令将执行以下操作：

1.  构建所有包。
2.  运行所有预发布脚本。
3.  创建将发布到 npm 的包 tarball。
4.  打印将发布的包的摘要。

然后您可以检查生成的 tarball，以确保它们包含正确的文件，并且 `package.json`
文件已正确更新。tarball 将在每个包目录的根目录中创建（例如
`packages/cli/google-gemini-cli-0.1.6.tgz`）。

通过执行试运行，您可以确信您对打包过程的更改是正确的，并且包将成功发布。

## 发布深入探讨

发布过程为不同的分发渠道创建两种不同类型的工件：用于 NPM 注册表的标准包和用于 GitHub
Releases 的单一、自包含的可执行文件。

以下是关键阶段：

**阶段 1: 预发布健全性检查和版本控制**

- **发生什么:**
  在移动任何文件之前，该过程确保项目处于良好状态。这涉及运行测试、linting 和类型检查 (`npm run preflight`)。根目录
  `package.json` 和 `packages/cli/package.json` 中的版本号更新为新的发布版本。

**阶段 2: 构建 NPM 源代码**

- **发生什么:** `packages/core/src` 和 `packages/cli/src`
  中的 TypeScript 源代码被编译成标准 JavaScript。
- **文件移动:**
  - `packages/core/src/**/*.ts` -> 编译为 -> `packages/core/dist/`
  - `packages/cli/src/**/*.ts` -> 编译为 -> `packages/cli/dist/`
- **原因:**
  开发期间编写的 TypeScript 代码需要转换为可由 Node.js 运行的普通 JavaScript。由于
  `cli` 包依赖于它，因此首先构建 `core` 包。

**阶段 3: 将标准包发布到 NPM**

- **发生什么:** 为 `@google/gemini-cli-core` 和 `@google/gemini-cli` 包运行
  `npm publish` 命令。
- **原因:** 这将它们作为标准 Node.js 包发布。通过
  `npm install -g @google/gemini-cli` 安装的用户将下载这些包，并且 `npm`
  将自动处理安装 `@google/gemini-cli-core`
  依赖项。这些包中的代码不会捆绑到单个文件中。

**阶段 4: 组装并创建 GitHub Release 资产**

此阶段发生在 NPM 发布 _之后_，并创建启用直接从 GitHub 仓库使用 `npx`
的单文件可执行文件。

1.  **创建 JavaScript 包:**
    - **发生什么:** 来自 `packages/core/dist` 和 `packages/cli/dist`
      的构建 JavaScript 以及所有第三方 JavaScript 依赖项，被 `esbuild`
      捆绑到一个单一的可执行 JavaScript 文件（例如 `gemini.js`）中。`node-pty`
      库被排除在此捆绑包之外，因为它包含本机二进制文件。
    - **原因:**
      这创建了一个包含所有必要应用程序代码的单个优化文件。它简化了不想进行完整
      `npm install` 的用户的执行，因为所有依赖项（包括 `core`
      包）都直接包含在内。

2.  **组装 `bundle` 目录:**
    - **发生什么:** 在项目根目录创建一个临时 `bundle` 文件夹。单个 `gemini.js`
      可执行文件与其它基本文件一起放置在其中。
    - **文件移动:**
      - `gemini.js` (来自 esbuild) -> `bundle/gemini.js`
      - `README.md` -> `bundle/README.md`
      - `LICENSE` -> `bundle/LICENSE`
      - `packages/cli/src/utils/*.sb` (沙盒配置文件) -> `bundle/`
    - **原因:**
      这创建了一个干净、自包含的目录，其中包含运行 CLI 以及了解其许可证和用法所需的一切。

3.  **创建 GitHub Release:**
    - **发生什么:** `bundle` 目录的内容，包括 `gemini.js`
      可执行文件，作为资产附加到新的 GitHub Release。
    - **原因:** 这使得 CLI 的单文件版本可直接下载，并启用
      `npx https://github.com/google-gemini/gemini-cli`
      命令，该命令下载并运行此特定捆绑资产。

**工件摘要**

- **NPM:** 发布标准的、未捆绑的 Node.js 包。主要工件是 `packages/cli/dist`
  中的代码，它依赖于 `@google/gemini-cli-core`。
- **GitHub Release:** 发布一个包含所有依赖项的单一、捆绑的 `gemini.js`
  文件，以便通过 `npx` 轻松执行。

这种双工件过程确保了传统 `npm` 用户和喜欢 `npx` 便利性的用户都能获得优化的体验。

## 通知

失败的发布工作流将自动创建带有标签 `release-failure` 的 Issue。

A notification will be posted to the maintainer's chat channel when issues with
this type are created.

### Modifying chat notifications

Notifications use
[GitHub for Google Chat](https://workspace.google.com/marketplace/app/github_for_google_chat/536184076190)。To
modify the notifications, use `/github-settings` within the chat space.

> [!WARNING] The following instructions describe a fragile workaround that
> depends on the internal structure of the chat application's UI. It is likely
> to break with future updates.

The list of available labels is not currently populated correctly. If you want
add a label that does not appear alphabetically in the first 30 labels in the
repo, you must use your browser's developer tools to manually modify the UI:

1. Open your browser's developer tools (e.g., Chrome DevTools).
2. In the `/github-settings` dialog, inspect the list of labels.
3. Locate one of the `<li>` elements representing a label.
4. In the HTML, modify the `data-option-value` attribute of that `<li>` element
   to the desired label name (e.g., `release-failure`).
5. Click on your modified label in the UI to select it, then save your settings.
