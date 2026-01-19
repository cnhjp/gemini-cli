# Gemini CLI: 配额与定价

Gemini
CLI 提供了一个慷慨的免费层级，涵盖了许多个人开发者的用例。对于企业或专业用途，或者如果您需要更高的限制，根据您的身份验证账户类型，有多种选项可供选择。

有关隐私政策和服务条款的详细信息，请参阅 [隐私与条款](./tos-privacy.md)。

> **注意:** 公布的价格为标价；可能会适用额外的协商商业折扣。

本文概述了使用不同身份验证方法时适用于 Gemini CLI 的具体配额和定价。

一般来说，有三类可供选择：

- 免费使用 (Free Usage): 适合实验和轻度使用。
- 付费层级（固定价格）(Paid
  Tier): 适合需要更慷慨的每日配额和可预测成本的个人开发者或企业。
- 按量付费 (Pay-As-You-Go): 对于专业用途、长期运行的任务，或者当您需要完全控制您的使用情况时，这是最灵活的选项。

## 免费使用

您的旅程始于一个慷慨的免费层级，非常适合实验和轻度使用。

您的免费使用限制取决于您的授权类型。

### 使用 Google 登录 (Gemini Code Assist 个人版)

对于使用 Google 账号登录以访问 Gemini Code Assist 个人版的用户。这包括：

- 1000 次模型请求 / 用户 / 天
- 60 次模型请求 / 用户 / 分钟
- 模型请求将在 Gemini 模型系列中进行，由 Gemini CLI 决定。

了解更多信息：[Gemini Code Assist 个人版限制](https://developers.google.com/gemini-code-assist/resources/quotas#quotas-for-agent-mode-gemini-cli)。

### 使用 Gemini API 密钥登录 (免费)

如果您使用 Gemini API 密钥，也可以享受免费层级。这包括：

- 250 次模型请求 / 用户 / 天
- 10 次模型请求 / 用户 / 分钟
- 仅限 Flash 模型的模型请求。

了解更多信息：[Gemini API 速率限制](https://ai.google.dev/gemini-api/docs/rate-limits)。

### 使用 Vertex AI 登录 (Express 模式)

Vertex AI 提供无需启用计费的 Express 模式。这包括：

- 90 天的时间，之后需要启用计费。
- 配额和模型是可变的，并且特定于您的账户。

了解更多信息：[Vertex AI Express 模式限制](https://cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/overview#quotas)。

## 付费层级：固定成本的更高限制

如果您用完了初始请求数，您可以通过升级到以下订阅之一继续受益于 Gemini CLI：

- [Google AI Pro 和 AI Ultra](https://gemini.google/subscriptions/)。推荐给个人开发者。配额和定价基于固定价格订阅。

  为了可预测的成本，您可以使用 Google 登录。

  了解更多信息：[Gemini Code Assist 配额和限制](https://developers.google.com/gemini-code-assist/resources/quotas)

- 通过在 Google
  Cloud 控制台注册，[通过 Google Cloud 购买 Gemini Code Assist 订阅](https://cloud.google.com/gemini/docs/codeassist/overview)。了解更多信息：[设置 Gemini Code Assist](https://cloud.google.com/gemini/docs/discover/set-up-gemini)。

  配额和定价基于具有分配许可证席位的固定价格订阅。为了可预测的成本，您可以登录 Google。

  这包括：
  - Gemini Code Assist 标准版 (Standard edition):
    - 1500 次模型请求 / 用户 / 天
    - 120 次模型请求 / 用户 / 分钟
  - Gemini Code Assist 企业版 (Enterprise edition):
    - 2000 次模型请求 / 用户 / 天
    - 120 次模型请求 / 用户 / 分钟
  - 模型请求将在 Gemini 模型系列中进行，由 Gemini CLI 决定。

  [了解更多关于 Gemini Code Assist 标准版和企业版许可证限制的信息](https://developers.google.com/gemini-code-assist/resources/quotas#quotas-for-agent-mode-gemini-cli)。

## 按量付费

如果您达到了每日请求限制，或者即使在升级后也耗尽了您的 Gemini
Pro 配额，最灵活的解决方案是切换到按量付费模式，您只需为您使用的具体处理量付费。这是不间断访问的推荐路径。

为此，请使用 Gemini API 密钥或 Vertex AI 登录。

- Vertex AI (常规模式):
  - 配额: 由动态共享配额系统或预先购买的预配吞吐量管理。
  - 成本: 基于模型和 Token 使用量。

了解更多信息：[Vertex AI 动态共享配额](https://cloud.google.com/vertex-ai/generative-ai/docs/resources/dynamic-shared-quota)
和 [Vertex AI 定价](https://cloud.google.com/vertex-ai/pricing)。

- Gemini API 密钥:
  - 配额: 因定价层级而异。
  - 成本: 因定价层级和模型/Token 使用量而异。

了解更多信息：[Gemini API 速率限制](https://ai.google.dev/gemini-api/docs/rate-limits)，[Gemini API 定价](https://ai.google.dev/gemini-api/docs/pricing)

重要的是要强调，使用 API 密钥时，您是按 Token/调用付费的。对于许多 Token 很少的小型调用来说，这可能更昂贵，但这是确保您的工作流程不被配额限制中断的唯一方法。

## Gemini for Workspace 计划

这些计划目前仅适用于由基于 Google 的体验提供的 Gemini 基于网络的产品的使用（例如 Gemini 网络应用程序或 Flow 视频编辑器）。这些计划不适用于支持 Gemini
CLI 的 API 使用。支持这些计划正在积极考虑中，以供将来支持。

## 避免高成本的提示

使用按量付费 API 密钥时，请注意您的使用情况以避免意外成本。

- 不要盲目接受每一个建议，特别是对于像重构大型代码库这样的计算密集型任务。
- 有意地使用您的提示词和命令。您是按调用付费的，所以请考虑完成工作的最有效方式。

## Gemini API vs. Vertex

- Gemini API (gemini developer api): 这是直接使用 Gemini 模型的最快方式。
- Vertex
  AI: 这是用于构建、部署和管理具有特定安全和控制要求的 Gemini 模型的企业级平台。

## 了解您的使用情况

模型使用情况摘要可通过 `/stats` 命令获得，并在会话结束退出时显示。
