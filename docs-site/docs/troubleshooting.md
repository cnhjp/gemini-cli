# 故障排除指南

本指南提供了常见问题的解决方案和调试技巧，包括以下主题：

- 身份验证或登录错误
- 常见问题解答 (FAQs)
- 调试技巧
- 现有的类似 GitHub Issue 或创建新 Issue

## 身份验证或登录错误

- **错误:
  `You must be a named user on your organization's Gemini Code Assist Standard edition subscription to use this service. Please contact your administrator to request an entitlement to Gemini Code Assist Standard edition.`**
  - **原因:** 如果 Gemini CLI 检测到定义了 `GOOGLE_CLOUD_PROJECT` 或
    `GOOGLE_CLOUD_PROJECT_ID`
    环境变量，可能会出现此错误。设置这些变量会强制进行组织订阅检查。如果您使用的是未链接到组织订阅的个人 Google 账号，这可能会是一个问题。

  - **解决方案:**
    - **个人用户:** 取消设置 `GOOGLE_CLOUD_PROJECT` 和 `GOOGLE_CLOUD_PROJECT_ID`
      环境变量。检查并从您的 shell 配置文件（例如 `.bashrc`, `.zshrc`）和任何
      `.env`
      文件中删除这些变量。如果这不能解决问题，请尝试使用不同的 Google 账号。

    - **组织用户:** 联系您的 Google Cloud 管理员，请求添加到您组织的 Gemini Code
      Assist 订阅中。

- **错误:
  `Failed to login. Message: Your current account is not eligible... because it is not currently available in your location.`**
  - **原因:** Gemini
    CLI 目前不支持您所在的位置。有关支持位置的完整列表，请参阅以下页面：
    - Gemini Code Assist 个人版：
      [可用位置](https://developers.google.com/gemini-code-assist/resources/available-locations#americas)
    - Google AI Pro 和 Ultra (Gemini Code Assist 和 Gemini CLI 也可用)：
      [可用位置](https://developers.google.com/gemini-code-assist/resources/locations-pro-ultra)

- **错误: `Failed to login. Message: Request contains an invalid argument`**
  - **原因:** 拥有 Google Workspace 账号或与其 Gmail 账号关联的 Google
    Cloud 账号的用户可能无法激活 Google Code Assist 计划的免费层级。
  - **解决方案:** 对于 Google Cloud 账号，您可以通过将 `GOOGLE_CLOUD_PROJECT`
    设置为您的项目 ID 来解决此问题。或者，您可以从
    [Google AI Studio](http://aistudio.google.com/app/apikey) 获取 Gemini
    API 密钥，其中也包含单独的免费层级。

- **错误: `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` 或
  `unable to get local issuer certificate`**
  - **原因:**
    您可能处于拦截和检查 SSL/TLS 流量的防火墙后的企业网络中。这通常需要 Node.js 信任自定义根 CA 证书。
  - **解决方案:** 首先尝试设置 `NODE_USE_SYSTEM_CA`；如果这不能解决问题，请设置
    `NODE_EXTRA_CA_CERTS`。
    - 设置 `NODE_USE_SYSTEM_CA=1`
      环境变量，告诉 Node.js 使用操作系统的本机证书存储（通常已安装企业证书）。
      - 示例: `export NODE_USE_SYSTEM_CA=1`
    - 将 `NODE_EXTRA_CA_CERTS` 环境变量设置为您的企业根 CA 证书文件的绝对路径。
      - 示例: `export NODE_EXTRA_CA_CERTS=/path/to/your/corporate-ca.crt`

## 常见错误消息和解决方案

- **错误: `EADDRINUSE` (Address already in use) 启动 MCP 服务器时。**
  - **原因:** 另一个进程已经使用了 MCP 服务器尝试绑定的端口。
  - **解决方案:** 停止使用该端口的其他进程，或配置 MCP 服务器使用不同的端口。

- **错误: Command not found (尝试使用 `gemini` 运行 Gemini CLI 时)。**
  - **原因:** Gemini CLI 未正确安装，或者它不在您系统的 `PATH` 中。
  - **解决方案:** 更新取决于您安装 Gemini CLI 的方式：
    - 如果您全局安装了 `gemini`，请检查您的 `npm` 全局二进制目录是否在您的
      `PATH` 中。您可以使用命令 `npm install -g @google/gemini-cli@latest`
      更新 Gemini CLI。
    - 如果您从源代码运行 `gemini`，请确保使用正确的命令调用它（例如
      `node packages/cli/dist/index.js ...`）。要更新 Gemini
      CLI，请从仓库拉取最新更改，然后使用命令 `npm run build` 重新构建。

- **错误: `MODULE_NOT_FOUND` 或 import 错误。**
  - **原因:** 依赖项未正确安装，或者项目尚未构建。
  - **解决方案:**
    1.  运行 `npm install` 确保所有依赖项都存在。
    2.  运行 `npm run build` 编译项目。
    3.  使用 `npm run start` 验证构建是否成功完成。

- **错误: "Operation not permitted", "Permission denied" 或类似错误。**
  - **原因:** 启用沙盒时，Gemini
    CLI 可能尝试受沙盒配置限制的操作，例如在项目目录或系统临时目录之外写入。
  - **解决方案:** 请参阅 [配置：沙盒](./cli/sandbox.md)
    文档以获取更多信息，包括如何自定义您的沙盒配置。

- **Gemini CLI 在 "CI" 环境中未以交互模式运行**
  - **问题:** 如果设置了以 `CI_` 开头的环境变量（例如 `CI_TOKEN`），Gemini
    CLI 不会进入交互模式（不出现提示）。这是因为底层 UI 框架使用的 `is-in-ci`
    包检测到这些变量并假设是非交互式 CI 环境。
  - **原因:** `is-in-ci` 包检查是否存在 `CI`, `CONTINUOUS_INTEGRATION`
    或任何带有 `CI_`
    前缀的环境变量。当发现任何这些变量时，它表示环境是非交互式的，这会阻止 Gemini
    CLI 以其交互模式启动。
  - **解决方案:** 如果 CLI 运行不需要 `CI_`
    前缀的变量，您可以为该命令临时取消设置它。例如 `env -u CI_TOKEN gemini`

- **DEBUG 模式从项目 .env 文件不起作用**
  - **问题:** 在项目的 `.env` 文件中设置 `DEBUG=true`
    不会为 gemini-cli 启用调试模式。
  - **原因:** `DEBUG` 和 `DEBUG_MODE` 变量会自动从项目 `.env`
    文件中排除，以防止干扰 gemini-cli 行为。
  - **解决方案:** 使用 `.gemini/.env` 文件代替，或者在 `settings.json` 中配置
    `advanced.excludedEnvVars` 设置以排除更少的变量。

## 退出代码

Gemini CLI 使用特定的退出代码来指示终止原因。这对脚本编写和自动化特别有用。

| 退出代码 | 错误类型                   | 描述                                                  |
| :------- | :------------------------- | :---------------------------------------------------- |
| 41       | `FatalAuthenticationError` | 身份验证过程中发生错误。                              |
| 42       | `FatalInputError`          | 向 CLI 提供了无效或缺失的输入。（仅限非交互模式）     |
| 44       | `FatalSandboxError`        | 沙盒环境（例如 Docker, Podman 或 Seatbelt）发生错误。 |
| 52       | `FatalConfigError`         | 配置文件 (`settings.json`) 无效或包含错误。           |
| 53       | `FatalTurnLimitedError`    | 达到会话的最大对话轮数。（仅限非交互模式）            |

## 调试技巧

- **CLI 调试:**
  - 使用 `--debug` 标志以获得更详细的输出。在交互模式下，按 F12 查看调试控制台。
  - 检查 CLI 日志，通常在特定于用户的配置或缓存目录中找到。

- **Core 调试:**
  - 检查服务器控制台输出是否有错误消息或堆栈跟踪。
  - 如果可配置，增加日志详细程度。例如，将 `DEBUG_MODE` 环境变量设置为 `true` 或
    `1`。
  - 如果需要单步执行服务器端代码，请使用 Node.js 调试工具（例如
    `node --inspect`）。

- **工具问题:**
  - 如果特定工具失败，请尝试通过运行该工具执行的最简单版本的命令或操作来隔离问题。
  - 对于 `run_shell_command`，首先检查该命令是否可以直接在您的 shell 中工作。
  - 对于 _文件系统工具_，验证路径是否正确并检查权限。

- **预检检查:**
  - 在提交代码之前始终运行
    `npm run preflight`。这可以捕捉许多与格式化、linting 和类型错误相关的常见问题。

## 现有的类似 GitHub Issue 或创建新 Issue

如果您遇到的问题未在此 _故障排除指南_ 中涵盖，请考虑搜索
[GitHub 上的 Gemini CLI Issue 跟踪器](https://github.com/google-gemini/gemini-cli/issues)。如果您找不到类似的问题，请考虑创建一个带有详细描述的新 GitHub
Issue。也欢迎提交 Pull Request！

> **注意:** 标记为 "🔒Maintainers
> only" 的 Issue 仅供项目维护者使用。我们将不接受与这些 Issue 相关的 Pull
> Request。
