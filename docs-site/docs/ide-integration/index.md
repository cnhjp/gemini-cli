# IDE 集成

Gemini
CLI 可以与您的 IDE 集成，提供更无缝和上下文感知的体验。这种集成允许 CLI 更好地了解您的工作区，并启用强大的功能，如原生编辑器内差异比较。

目前，支持的 IDE 有
[Antigravity](https://antigravity.google)、[Visual Studio Code](https://code.visualstudio.com/)
以及其他支持 VS Code 扩展的编辑器。要为其他编辑器构建支持，请参阅
[IDE 伴侣扩展规范](./ide-companion-spec.md)。

## 功能

- **工作区上下文:**
  CLI 自动获得对您工作区的感知，以提供更相关和准确的响应。此上下文包括：
  - 您工作区中 **最近访问的 10 个文件**。
  - 您的活动光标位置。
  - 您选择的任何文本（最多 16KB 限制；较长的选择将被截断）。

- **原生差异比较:**
  当 Gemini 建议代码修改时，您可以直接在 IDE 的原生差异查看器中查看更改。这允许您无缝地审查、编辑并接受或拒绝建议的更改。

- **VS Code 命令:** 您可以直接从 VS Code 命令面板 (`Cmd+Shift+P` 或
  `Ctrl+Shift+P`) 访问 Gemini CLI 功能：
  - `Gemini CLI: Run`: 在集成终端中启动新的 Gemini CLI 会话。
  - `Gemini CLI: Accept Diff`: 接受活动差异编辑器中的更改。
  - `Gemini CLI: Close Diff Editor`: 拒绝更改并关闭活动差异编辑器。
  - `Gemini CLI: View Third-Party Notices`: 显示扩展的第三方声明。

## 安装和设置

可以通过三种方式设置 IDE 集成：

### 1. 自动提示（推荐）

当您在受支持的编辑器中运行 Gemini
CLI 时，它会自动检测您的环境并提示您连接。回答 "Yes" 将自动运行必要的设置，包括安装伴侣扩展和启用连接。

### 2. 从 CLI 手动安装

如果您之前关闭了提示或想要手动安装扩展，可以在 Gemini CLI 中运行以下命令：

```
/ide install
```

这将找到适合您 IDE 的正确扩展并安装它。

### 3. 从市场手动安装

您也可以直接从市场安装扩展。

- **对于 Visual Studio Code:** 从
  [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=google.gemini-cli-vscode-ide-companion)
  安装。
- **对于 VS Code 分支:** 为了支持 VS Code 的分支，该扩展也在
  [Open VSX Registry](https://open-vsx.org/extension/google/gemini-cli-vscode-ide-companion)
  上发布。按照您的编辑器的说明从该注册表安装扩展。

> 注意: "Gemini CLI
> Companion" 扩展可能会出现在搜索结果的底部。如果您没有立即看到它，请尝试向下滚动或按“最新发布”排序。
>
> 手动安装扩展后，您必须在 CLI 中运行 `/ide enable` 才能激活集成。

## 用法

### 启用和禁用

您可以从 CLI 中控制 IDE 集成：

- 要启用与 IDE 的连接，请运行：
  ```
  /ide enable
  ```
- 要禁用连接，请运行：
  ```
  /ide disable
  ```

启用后，Gemini CLI 将自动尝试连接到 IDE 伴侣扩展。

### 检查状态

要检查连接状态并查看 CLI 从 IDE 接收到的上下文，请运行：

```
/ide status
```

如果已连接，此命令将显示它连接到的 IDE 以及它知道的最近打开的文件列表。

> [!NOTE]
> 文件列表仅限于您工作区内最近访问的 10 个文件，并且仅包括磁盘上的本地文件。

### 使用差异比较

当您要求 Gemini 修改文件时，它可以在您的编辑器中直接打开差异视图。

**要接受差异**，您可以执行以下任何操作：

- 点击差异编辑器标题栏中的 **复选标记图标**。
- 保存文件（例如，使用 `Cmd+S` 或 `Ctrl+S`）。
- 打开命令面板并运行 **Gemini CLI: Accept Diff**。
- 提示时在 CLI 中回复 `yes`。

**要拒绝差异**，您可以：

- 点击差异编辑器标题栏中的 **'x' 图标**。
- 关闭差异编辑器选项卡。
- 打开命令面板并运行 **Gemini CLI: Close Diff Editor**。
- 提示时在 CLI 中回复 `no`。

在接受更改之前，您还可以直接在差异视图中 **修改建议的更改**。

如果您在 CLI 中选择 ‘Allow for this
session’，更改将不再在 IDE 中显示，因为它们将被自动接受。

## 在沙盒中使用

如果您在沙盒中使用 Gemini CLI，请注意以下几点：

- **在 macOS 上:**
  IDE 集成需要网络访问权限才能与 IDE 伴侣扩展通信。您必须使用允许网络访问的 Seatbelt 配置文件。
- **在 Docker 容器中:** 如果您在 Docker (或 Podman) 容器中运行 Gemini
  CLI，IDE 集成仍然可以连接到在主机上运行的 VS Code 扩展。CLI 配置为在
  `host.docker.internal`
  上自动查找 IDE 服务器。通常不需要特殊配置，但您可能需要确保您的 Docker 网络设置允许从容器到主机的连接。

## 故障排除

如果您遇到 IDE 集成问题，这里有一些常见的错误消息及解决方法。

### 连接错误

- **消息:**
  `🔴 Disconnected: Failed to connect to IDE companion extension in [IDE Name]. Please ensure the extension is running. To install the extension, run /ide install.`
  - **原因:** Gemini CLI 找不到必要的环境变量 (`GEMINI_CLI_IDE_WORKSPACE_PATH`
    或
    `GEMINI_CLI_IDE_SERVER_PORT`) 来连接到 IDE。这通常意味着 IDE 伴侣扩展未运行或未正确初始化。
  - **解决方案:**
    1.  确保您已在 IDE 中安装了 **Gemini CLI Companion** 扩展并且它已启用。
    2.  在 IDE 中打开一个新的终端窗口，以确保它获取了正确的环境。

- **消息:**
  `🔴 Disconnected: IDE connection error. The connection was lost unexpectedly. Please try reconnecting by running /ide enable`
  - **原因:** 与 IDE 伴侣的连接丢失。
  - **解决方案:** 运行 `/ide enable`
    尝试重新连接。如果问题仍然存在，请打开一个新的终端窗口或重新启动您的 IDE。

### 配置错误

- **消息:**
  `🔴 Disconnected: Directory mismatch. Gemini CLI is running in a different location than the open workspace in [IDE Name]. Please run the CLI from one of the following directories: [List of directories]`
  - **原因:** CLI 的当前工作目录在您 IDE 中打开的工作区之外。
  - **解决方案:** `cd` 进入 IDE 中打开的同一目录并重新启动 CLI。

- **消息:**
  `🔴 Disconnected: To use this feature, please open a workspace folder in [IDE Name] and try again.`
  - **原因:** 您在 IDE 中没有打开工作区。
  - **解决方案:** 在 IDE 中打开一个工作区并重新启动 CLI。

### 一般错误

- **消息:**
  `IDE integration is not supported in your current environment. To use this feature, run Gemini CLI in one of these supported IDEs: [List of IDEs]`
  - **原因:** 您在非受支持 IDE 的终端或环境中运行 Gemini CLI。
  - **解决方案:** 从受支持 IDE（如 Antigravity 或 VS Code）的集成终端运行 Gemini
    CLI。

- **消息:**
  `No installer is available for IDE. Please install the Gemini CLI Companion extension manually from the marketplace.`
  - **原因:** 您运行了
    `/ide install`，但 CLI 没有针对您特定 IDE 的自动安装程序。
  - **解决方案:** 打开您的 IDE 扩展市场，搜索 "Gemini CLI Companion"，然后
    [手动安装](#3-manual-installation-from-a-marketplace)。
