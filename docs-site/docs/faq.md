# 常见问题 (FAQ)

本页提供了有关使用 Gemini CLI 时遇到的常见问题的解答和解决方案。

## 一般问题

### 为什么我会收到 `API error: 429 - Resource exhausted` 错误？

此错误表明您已超过 API 请求限制。Gemini
API 设有速率限制以防止滥用并确保公平使用。

要解决此问题，您可以：

- **检查您的使用情况:** 在 Google AI Studio 或您的 Google
  Cloud 项目仪表板中查看您的 API 使用情况。
- **优化您的提示词:**
  如果您在短时间内发出大量请求，请尝试分批处理提示词或在请求之间引入延迟。
- **申请增加配额:** 如果您持续需要更高的限制，可以向 Google 申请增加配额。

### 为什么我在运行 `npm run start` 时收到 `ERR_REQUIRE_ESM` 错误？

此错误通常发生在 Node.js 项目中，当 CommonJS 和 ES Modules 之间存在不匹配时。

这通常是由于您的 `package.json` 或 `tsconfig.json` 配置错误造成的。请确保：

1.  您的 `package.json` 包含 `"type": "module"`。
2.  您的 `tsconfig.json` 在 `compilerOptions` 中包含 `"module": "NodeNext"`
    或兼容的设置。

如果问题仍然存在，请尝试删除您的 `node_modules` 目录和 `package-lock.json`
文件，然后再次运行 `npm install`。

### 为什么我在统计输出中看不到缓存的 token 计数？

缓存的 token 信息仅在使用缓存 token 时显示。此功能适用于 API 密钥用户（Gemini
API 密钥或 Google Cloud Vertex
AI），但不适用于 OAuth 用户（例如 Google 个人/企业账号，如 Google
Gmail 或 Google Workspace）。这是因为 Gemini Code Assist
API 不支持创建缓存内容。您仍然可以使用 Gemini CLI 中的 `/stats`
命令查看总 token 使用情况。

## 安装和更新

### 如何将 Gemini CLI 更新到最新版本？

如果您通过 `npm` 全局安装了它，请使用命令
`npm install -g @google/gemini-cli@latest`
进行更新。如果您是从源代码编译的，请从仓库拉取最新更改，然后使用命令
`npm run build` 重新构建。

## 平台特定问题

### 为什么当我在 Windows 上运行像 `chmod +x` 这样的命令时 CLI 会崩溃？

像 `chmod` 这样的命令特定于类 Unix 操作系统（Linux,
macOS）。默认情况下，它们在 Windows 上不可用。

要解决此问题，您可以：

- **使用 Windows 等效命令:** 代替 `chmod`，您可以使用 `icacls`
  在 Windows 上修改文件权限。
- **使用兼容层:** 像 Git Bash 或 Windows Subsystem for Linux
  (WSL) 这样的工具在 Windows 上提供了类 Unix 环境，这些命令将在其中工作。

## 配置

### 如何配置我的 `GOOGLE_CLOUD_PROJECT`？

您可以使用环境变量配置您的 Google Cloud 项目 ID。

在您的 shell 中设置 `GOOGLE_CLOUD_PROJECT` 环境变量：

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

要使此设置永久生效，请将此行添加到您的 shell 启动文件（例如 `~/.bashrc`,
`~/.zshrc`）。

### 安全存储 API 密钥的最佳方式是什么？

在脚本中暴露 API 密钥或将其检入源代码控制存在安全风险。

要安全地存储您的 API 密钥，您可以：

- **使用 `.env` 文件:** 在项目的 `.gemini` 目录中创建一个 `.env`
  文件 (`.gemini/.env`) 并将密钥存储在那里。Gemini CLI 将自动加载这些变量。
- **使用系统的密钥环:** 为了最安全的存储，请使用操作系统的机密管理工具（如 macOS
  Keychain, Windows Credential
  Manager 或 Linux 上的机密管理器）。然后，您可以让脚本或环境在运行时从安全存储加载密钥。

### Gemini CLI 配置和设置文件存储在哪里？

Gemini CLI 配置存储在两个 `settings.json` 文件中：

1.  在您的主目录中：`~/.gemini/settings.json`。
2.  在您的项目根目录中：`./.gemini/settings.json`。

有关更多详细信息，请参阅 [Gemini CLI 配置](./get-started/configuration.md)。

## Google AI Pro/Ultra 和订阅常见问题解答

### 我可以在哪里了解有关我的 Google AI Pro 或 Google AI Ultra 订阅的更多信息？

要了解有关您的 Google AI Pro 或 Google AI Ultra 订阅的更多信息，请访问
[订阅设置](https://one.google.com) 中的 **管理订阅**。

### 我如何知道我是否拥有 Google AI Pro 或 Ultra 的更高限制？

如果您订阅了 Google AI Pro 或 Ultra，您将自动拥有更高的 Gemini Code
Assist 和 Gemini CLI 限制。这些限制在 Gemini
CLI 和 IDE 中的代理模式之间共享。您可以通过在 [订阅设置](https://one.google.com)
中检查您是否仍订阅了 Google AI Pro 或 Ultra 来确认您拥有更高的限制。

### 如果我订阅了 Google AI Pro 或 Ultra，使用 Gemini Code Assist 或 Gemini CLI 的隐私政策是什么？

要了解有关由您的订阅管辖的隐私政策和服务条款的更多信息，请访问
[Gemini Code Assist：服务条款和隐私政策](https://developers.google.com/gemini-code-assist/resources/privacy-notices)。

### 我已升级到 Google AI Pro 或 Ultra，但它仍然说我达到了配额限制。这是一个 bug 吗？

您的 Google AI Pro 或 Ultra 订阅中的更高限制适用于 Gemini 2.5
Pro 和 Flash 上的 Gemini 2.5。它们是 Gemini CLI 和 Gemini Code Assist
IDE 扩展中的代理模式之间的共享配额。您可以在
[配额和限制](https://developers.google.com/gemini-code-assist/resources/quotas)
中了解有关 Gemini CLI、Gemini Code Assist 和 Gemini Code
Assist 中的代理模式的配额限制的更多信息。

### 如果我通过购买 Google AI Pro 或 Ultra 订阅升级到 Gemini CLI 和 Gemini Code Assist 的更高限制，Gemini 会开始使用我的数据来改进其机器学习模型吗？

如果您购买了付费计划，Google 不会使用您的数据来改进 Google 的机器学习模型。注意：如果您决定保留使用 Gemini
Code Assist 免费版本（Gemini Code
Assist 个人版），您也可以选择退出使用您的数据来改进 Google 的机器学习模型。有关更多信息，请参阅
[Gemini Code Assist 个人版隐私声明](https://developers.google.com/gemini-code-assist/resources/privacy-notice-gemini-code-assist-individuals)。

## 没有看到您的问题？

搜索
[GitHub 上的 Gemini CLI 问答讨论](https://github.com/google-gemini/gemini-cli/discussions/categories/q-a)
或
[在 GitHub 上发起新讨论](https://github.com/google-gemini/gemini-cli/discussions/new?category=q-a)
