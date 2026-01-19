# 扩展发布

向用户发布扩展主要有两种方式：

- [Git 仓库](#通过-git-仓库发布)
- [Github Releases](#通过-github-releases-发布)

Git 仓库发布往往是最简单和最灵活的方法，而 GitHub
Releases 在初始安装时可能更有效率，因为它们作为单个存档提供，而不是需要单独下载每个文件的 git
clone。如果您需要提供特定于平台的二进制文件，Github
Releases 还可以包含特定于平台的存档。

## 通过 Git 仓库发布

这是最灵活和简单的选择。您只需创建一个可公开访问的 git 仓库（例如公共 github 仓库），然后用户就可以使用
`gemini extensions install <your-repo-uri>` 安装您的扩展。他们可以使用
`--ref=<some-ref>`
参数选择性地依赖特定的 ref（分支/标签/提交），这默认为默认分支。

每当提交推送到用户依赖的 ref 时，都会提示他们更新扩展。请注意，这也允许轻松回滚，无论
`gemini-extension.json` 文件中的实际版本如何，HEAD 提交始终被视为最新版本。

### 使用 Git 仓库管理发布渠道

用户可以依赖您的 git 仓库中的任何 ref，例如分支或标签，这允许您管理多个发布渠道。

例如，您可以维护一个 `stable`
分支，用户可以通过这种方式安装：`gemini extensions install <your-repo-uri> --ref=stable`。或者，您可以通过将默认分支视为稳定发布分支，并在不同的分支（例如称为
`dev`）中进行开发，使其成为默认行为。您可以维护任意数量的分支或标签，为您和您的用户提供最大的灵活性。

请注意，这些 `ref`
参数可以是标签、分支甚至特定的提交，这允许用户依赖您的扩展的特定版本。您可以自行决定如何管理您的标签和分支。

### 使用 Git 仓库的示例发布流程

虽然对于如何使用 git 流程管理发布有很多选择，但我们建议将您的默认分支视为“稳定”发布分支。这意味着
`gemini extensions install <your-repo-uri>` 的默认行为是在稳定发布分支上。

假设您想维护三个标准发布渠道：`stable`, `preview` 和 `dev`。您将在 `dev`
分支中进行所有标准开发。当您准备好进行预览发布时，您将该分支合并到您的 `preview`
分支中。当您准备好将预览分支提升为稳定版时，您将 `preview`
合并到您的稳定分支（可能是您的默认分支或其他分支）中。

您还可以使用 `git cherry-pick`
将更改从一个分支挑选到另一个分支，但请注意，这将导致您的分支彼此具有略微不同的历史记录，除非您在每次发布时强制推送更改到您的分支以将历史记录恢复到干净的状态（根据您的仓库设置，默认分支可能无法这样做）。如果您计划进行 cherry
pick，您可能希望避免将默认分支作为稳定分支，以避免强制推送到默认分支，这通常应该避免。

## 通过 GitHub Releases 发布

Gemini CLI 扩展可以通过
[GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
分发。这为用户提供了更快、更可靠的初始安装体验，因为它避免了克隆仓库的需要。

每个版本都包含至少一个存档文件，其中包含与其链接的标签处的仓库的全部内容。如果您的扩展需要某些构建步骤或附带特定于平台的二进制文件，发布也可能包含
[预构建的存档](#自定义预构建存档)。

在检查更新时，gemini 将只在 github 上查找“最新”版本（您必须在创建发布时将其标记为最新），除非用户通过传递
`--ref=<some-release-tag>` 安装了特定版本。

您还可以使用 `--pre-release`
标志安装扩展，以便获取最新版本，无论它是否已标记为“最新”。这允许您在实际将其推送给所有用户之前测试您的发布是否有效。

### 自定义预构建存档

自定义存档必须作为资产直接附加到 github
release，并且必须完全自包含。这意味着它们应该包含整个扩展，请参阅
[存档结构](#存档结构)。

如果您的扩展是平台无关的，您可以提供单个通用资产。在这种情况下，应该只有一个资产附加到发布。

如果您想在更大的仓库中开发您的扩展，也可以使用自定义存档，您可以构建一个与仓库本身布局不同的存档（例如，它可能只是包含扩展的子目录的存档）。

#### 平台特定存档

为了确保 Gemini
CLI 可以自动找到每个平台的正确发布资产，您必须遵循此命名约定。CLI 将按以下顺序搜索资产：

1.  **平台和架构特定:** `{platform}.{arch}.{name}.{extension}`
2.  **平台特定:** `{platform}.{name}.{extension}`
3.  **通用:** 如果仅提供一个资产，它将用作通用回退。

- `{name}`: 您的扩展名称。
- `{platform}`: 操作系统。支持的值为：
  - `darwin` (macOS)
  - `linux`
  - `win32` (Windows)
- `{arch}`: 架构。支持的值为：
  - `x64`
  - `arm64`
- `{extension}`: 存档的文件扩展名（例如 `.tar.gz` 或 `.zip`）。

**示例:**

- `darwin.arm64.my-tool.tar.gz` (特定于 Apple Silicon Macs)
- `darwin.my-tool.tar.gz` (适用于所有 Mac)
- `linux.x64.my-tool.tar.gz`
- `win32.my-tool.zip`

#### 存档结构

存档必须是完全包含的扩展，并且具有所有标准要求 - 具体来说，`gemini-extension.json`
文件必须位于存档的根目录。

其余布局应该看起来与典型扩展完全相同，请参阅 [extensions.md](./index.md)。

#### GitHub Actions 工作流示例

这是一个 GitHub Actions 工作流示例，用于构建并为多个平台发布 Gemini CLI 扩展：

```yaml
name: Release Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build extension
        run: npm run build

      - name: Create release assets
        run: |
          npm run package -- --platform=darwin --arch=arm64
          npm run package -- --platform=linux --arch=x64
          npm run package -- --platform=win32 --arch=x64

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            release/darwin.arm64.my-tool.tar.gz
            release/linux.arm64.my-tool.tar.gz
            release/win32.arm64.my-tool.zip
```
