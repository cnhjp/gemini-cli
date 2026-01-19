# 在 Gemini CLI 上使用 Gemini 3 Pro 和 Gemini 3 Flash

Gemini 3 Pro 和 Gemini 3 Flash 现已在 Gemini CLI 上面向所有用户可用！

## 如何在 Gemini CLI 上开始使用 Gemini 3

首先将 Gemini CLI 升级到最新版本：

```bash
npm install -g @google/gemini-cli@latest
```

确认您的版本为 0.21.1 或更高版本后：

1. 在 Gemini CLI 中使用 `/settings` 命令。
2. 将 **Preview Features**（预览功能）切换为 `true`。
3. 运行 `/model` 并选择 **Auto (Gemini 3)**。

有关更多信息，请参阅 [Gemini CLI 模型选择](../cli/model.md)。

### 使用限制与回退

当您达到 Gemini 3 Pro 的每日使用限制时，Gemini
CLI 会通知您。此时，您可以选择切换到 Gemini 2.5
Pro、升级以获得更高限制，或者停止使用。系统也会告知您限制重置的时间，届时您可以再次使用 Gemini
3 Pro。

同样，当您达到 Gemini 2.5
Pro 的每日使用限制时，您会看到一条消息提示回退到 Gemini 2.5 Flash。

### 容量错误

有时 Gemini 3 Pro 模型可能会过载。发生这种情况时，Gemini
CLI 会询问您是继续尝试 Gemini 3 Pro 还是回退到 Gemini 2.5 Pro。

> **注意：\*\***Keep
> trying\*\*（继续尝试）选项使用指数退避策略，即系统繁忙时，Gemini
> CLI 会在每次重试之间等待更长时间。如果重试没有立即发生，请等待几分钟以便请求处理。

### 模型选择与路由类型

使用 Gemini CLI 时，您可能希望控制请求在模型之间的路由方式。默认情况下，Gemini
CLI 使用 **Auto**（自动）路由。

使用 Gemini 3 Pro 时，您可以使用 Auto 路由或 Pro 路由来管理您的使用限制：

- **Auto 路由：**
  Auto 路由首先确定提示词涉及的是复杂操作还是简单操作。对于简单提示词，它会自动使用 Gemini
  2.5 Flash。对于复杂提示词，如果启用了 Gemini 3 Pro，它将使用 Gemini 3
  Pro；否则，将使用 Gemini 2.5 Pro。
- **Pro 路由：** 如果您希望确保任务由最强大的模型处理，请使用 `/model` 并选择
  **Pro**。Gemini CLI 将优先使用可用的最强模型，包括已启用的 Gemini 3 Pro。

要了解有关选择模型和路由的更多信息，请参阅
[Gemini CLI 模型选择](../cli/model.md)。

## 如何在 Gemini Code Assist 上启用 Gemini 3

如果您正在使用 Gemini Code Assist Standard 或 Gemini Code Assist
Enterprise，要在 Gemini CLI 上启用 Gemini 3
Pro，需要配置您的发布渠道。使用 Gemini 3
Pro 需要两个步骤：管理员启用和用户启用。

要了解有关这些设置的更多信息，请参阅
[配置 Gemini Code Assist 发布渠道](https://developers.google.com/gemini-code-assist/docs/configure-release-channels)。

### 管理员说明

具有 **Google Cloud Settings Admin** 权限的管理员必须按照以下说明操作：

- 导航到您在 Gemini CLI for Code Assist 中使用的 Google Cloud 项目。
- 转到 **Admin for Gemini** > **Settings**。
- 在 **Release channels for Gemini Code Assist in local IDEs** 下选择
  **Preview**。
- 点击 **Save changes**。

### 用户说明

在管理员启用 **Preview** 后等待两到三分钟，然后：

- 打开 Gemini CLI。
- 使用 `/settings` 命令。
- 将 **Preview Features** 设置为 `true`。

重启 Gemini CLI，您应该就能访问 Gemini 3 了。

## 需要帮助？

如果您需要帮助，我们建议搜索现有的
[GitHub issue](https://github.com/google-gemini/gemini-cli/issues)。如果您找不到符合您问题的 GitHub
issue，可以
[创建一个新 issue](https://github.com/google-gemini/gemini-cli/issues/new/choose)。对于评论和反馈，请考虑开启一个
[GitHub discussion](https://github.com/google-gemini/gemini-cli/discussions)。
