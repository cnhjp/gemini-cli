# Gemini CLI 验证设置

要使用 Gemini
CLI，您需要向 Google 进行验证。本指南帮助您根据您的账号类型和使用 CLI 的方式，快速找到最佳的登录方法。

对于大多数用户，我们建议启动 Gemini CLI 并使用您的个人 Google 账号登录。

## 选择您的验证方法 <a id="auth-methods"></a>

在下表中选择符合您情况的验证方法：

| 用户类型 / 场景                                  | 推荐的验证方法                                                     | 是否需要 Google Cloud 项目                                    |
| :----------------------------------------------- | :----------------------------------------------------------------- | :------------------------------------------------------------ |
| 个人 Google 账号                                 | [使用 Google 登录](#login-google)                                  | 否，有例外                                                    |
| 拥有公司、学校或 Google Workspace 账号的组织用户 | [使用 Google 登录](#login-google)                                  | [是](#set-gcp)                                                |
| 拥有 Gemini API 密钥的 AI Studio 用户            | [使用 Gemini API 密钥](#gemini-api)                                | 否                                                            |
| Google Cloud Vertex AI 用户                      | [Vertex AI](#vertex-ai)                                            | [是](#set-gcp)                                                |
| [无头模式](#headless)                            | [使用 Gemini API 密钥](#gemini-api) 或<br> [Vertex AI](#vertex-ai) | 否 (对于 Gemini API 密钥)<br> [是](#set-gcp) (对于 Vertex AI) |

### 我的 Google 账号是什么类型？

- **个人 Google 账号：** 包括所有
  [免费层级账号](../quota-and-pricing/#free-usage)（如 Gemini Code
  Assist 个人版），以及
  [Google AI Pro 和 Ultra](https://gemini.google/subscriptions/) 的付费订阅。

- **组织账号：** 通过公司、学校或
  [Google Workspace](https://workspace.google.com/)
  等组织使用付费许可证的账号。包括
  [Google AI Ultra 商业版](https://support.google.com/a/answer/16345165) 订阅。

## (推荐) 使用 Google 登录 <a id="login-google"></a>

如果您在本地机器上运行 Gemini
CLI，最简单的验证方法是使用 Google 账号登录。此方法需要在能与运行 Gemini
CLI 的终端通信的机器（例如您的本地机器）上使用网络浏览器。

> **重要：** 如果您是 **Google AI Pro** 或 **Google AI Ultra**
> 订阅者，请使用与您的订阅关联的 Google 账号。

要验证并使用 Gemini CLI：

1. 启动 CLI：

   ```bash
   gemini
   ```

2. 选择 **Login with Google**（使用 Google 登录）。Gemini
   CLI 将使用您的网络浏览器打开登录提示。按照屏幕上的说明操作。您的凭据将在本地缓存以供将来的会话使用。

### 我需要设置我的 Google Cloud 项目吗？

大多数个人 Google 账号（免费和付费）不需要 Google
Cloud 项目进行验证。但是，如果您满足以下至少一个条件，则需要设置 Google
Cloud 项目：

- 您正在使用公司、学校或 Google Workspace 账号。
- 您正在使用来自 Google Developer Program 的 Gemini Code Assist 许可证。
- 您正在使用来自 Gemini Code Assist 订阅的许可证。

有关说明，请参阅 [设置您的 Google Cloud 项目](#set-gcp)。

## 使用 Gemini API 密钥 <a id="gemini-api"></a>

如果您不想使用 Google 账号进行验证，可以使用来自 Google AI Studio 的 API 密钥。

要使用 Gemini API 密钥验证并使用 Gemini CLI：

1. 从 [Google AI Studio](https://aistudio.google.com/app/apikey)
   获取您的 API 密钥。

2. 将 `GEMINI_API_KEY` 环境变量设置为您的密钥。例如：

   ```bash
   # 将 YOUR_GEMINI_API_KEY 替换为来自 AI Studio 的密钥
   export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```

   要使此设置持久化，请参阅 [持久化环境变量](#persisting-vars)。

3. 启动 CLI：

   ```bash
   gemini
   ```

4. 选择 **Use Gemini API key**（使用 Gemini API 密钥）。

> **警告：**
> 请将 API 密钥（尤其是针对 Gemini 等服务的密钥）视为敏感凭据。保护它们以防止未经授权的访问以及在您的账号下滥用服务。

## 使用 Vertex AI <a id="vertex-ai"></a>

要将 Gemini CLI 与 Google Cloud 的 Vertex
AI 平台一起使用，请从以下验证选项中进行选择：

- A. 使用 `gcloud` 的应用程序默认凭据 (ADC)。
- B. 服务账号 JSON 密钥。
- C. Google Cloud API 密钥。

无论您使用哪种 Vertex AI 验证方法，都需要将 `GOOGLE_CLOUD_PROJECT`
设置为您启用了 Vertex AI API 的 Google Cloud 项目 ID，并将
`GOOGLE_CLOUD_LOCATION` 设置为您的 Vertex
AI 资源所在的位置或您希望运行作业的位置。

例如：

```bash
# 替换为您的项目 ID 和所需位置（例如 us-central1）
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export GOOGLE_CLOUD_LOCATION="YOUR_PROJECT_LOCATION"
```

要使任何 Vertex AI 环境变量设置持久化，请参阅
[持久化环境变量](#persisting-vars)。

#### A. Vertex AI - 使用 `gcloud` 的应用程序默认凭据 (ADC)

如果您安装了 Google Cloud CLI，请考虑使用此验证方法。

> **注意：** 如果您之前设置了 `GOOGLE_API_KEY` 或
> `GEMINI_API_KEY`，则必须取消设置它们才能使用 ADC：
>
> ```bash
> unset GOOGLE_API_KEY GEMINI_API_KEY
> ```

1. 验证您拥有 Google Cloud 项目且已启用 Vertex AI API。

2. 登录 Google Cloud：

   ```bash
   gcloud auth application-default login
   ```

3. [配置您的 Google Cloud 项目](#set-gcp)。

4. 启动 CLI：

   ```bash
   gemini
   ```

5. 选择 **Vertex AI**。

#### B. Vertex AI - 服务账号 JSON 密钥

在非交互式环境、CI/CD 管道中，或者如果您的组织限制基于用户的 ADC 或 API 密钥创建，请考虑使用此验证方法。

> **注意：** 如果您之前设置了 `GOOGLE_API_KEY` 或
> `GEMINI_API_KEY`，则必须取消设置它们：
>
> ```bash
> unset GOOGLE_API_KEY GEMINI_API_KEY
> ```

1.  [创建服务账号和密钥](https://cloud.google.com/iam/docs/keys-create-delete)
    并下载提供的 JSON 文件。为服务账号分配 "Vertex AI User" 角色。

2.  将 `GOOGLE_APPLICATION_CREDENTIALS`
    环境变量设置为 JSON 文件的绝对路径。例如：

    ```bash
    # 将 /path/to/your/keyfile.json 替换为实际路径
    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/keyfile.json"
    ```

3.  [配置您的 Google Cloud 项目](#set-gcp)。

4.  启动 CLI：

    ```bash
    gemini
    ```

5.  选择 **Vertex AI**。
    > **警告：** 保护您的服务账号密钥文件，因为它提供对您资源的访问权限。

#### C. Vertex AI - Google Cloud API 密钥

1.  获取 Google Cloud API 密钥：
    [获取 API 密钥](https://cloud.google.com/vertex-ai/generative-ai/docs/start/api-keys?usertype=newuser)。

2.  设置 `GOOGLE_API_KEY` 环境变量：

    ```bash
    # 将 YOUR_GOOGLE_API_KEY 替换为您的 Vertex AI API 密钥
    export GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
    ```

    > **注意：** 如果您看到类似 `"API keys are not supported by this API..."`
    > 的错误，您的组织可能限制了此服务的 API 密钥使用。请尝试其他 Vertex
    > AI 验证方法。

3.  [配置您的 Google Cloud 项目](#set-gcp)。

4.  启动 CLI：

    ```bash
    gemini
    ```

5.  选择 **Vertex AI**。

## 设置您的 Google Cloud 项目 <a id="set-gcp"></a>

> **重要：** 大多数个人 Google 账号（免费和付费）不需要 Google
> Cloud 项目进行验证。

当您使用 Google 账号登录时，您可能需要配置 Google Cloud 项目供 Gemini
CLI 使用。这适用于您满足以下至少一个条件的情况：

- 您正在使用公司、学校或 Google Workspace 账号。
- 您正在使用来自 Google Developer Program 的 Gemini Code Assist 许可证。
- 您正在使用来自 Gemini Code Assist 订阅的许可证。

要配置 Gemini CLI 使用 Google Cloud 项目，请执行以下操作：

1.  [查找您的 Google Cloud 项目 ID](https://support.google.com/googleapi/answer/7014113)。

2.  [启用 Gemini for Cloud API](https://cloud.google.com/gemini/docs/discover/set-up-gemini#enable-api)。

3.  [配置必要的 IAM 访问权限](https://cloud.google.com/gemini/docs/discover/set-up-gemini#grant-iam)。

4.  配置您的环境变量。设置 `GOOGLE_CLOUD_PROJECT` 或 `GOOGLE_CLOUD_PROJECT_ID`
    变量为要与 Gemini CLI 一起使用的项目 ID。Gemini CLI 首先检查
    `GOOGLE_CLOUD_PROJECT`，然后回退到 `GOOGLE_CLOUD_PROJECT_ID`。

    例如，要设置 `GOOGLE_CLOUD_PROJECT_ID` 变量：

    ```bash
    # 将 YOUR_PROJECT_ID 替换为您实际的 Google Cloud 项目 ID
    export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
    ```

    要使此设置持久化，请参阅 [持久化环境变量](#persisting-vars)。

## 持久化环境变量 <a id="persisting-vars"></a>

为避免每次终端会话都设置环境变量，您可以使用以下方法将它们持久化：

1.  **将您的环境变量添加到 shell 配置文件：** 将 `export ...`
    命令追加到 shell 的启动文件（例如 `~/.bashrc`, `~/.zshrc`, 或
    `~/.profile`）并重新加载 shell（例如 `source ~/.bashrc`）。

    ```bash
    # .bashrc 示例
    echo 'export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"' >> ~/.bashrc
    source ~/.bashrc
    ```

    > **警告：**
    > 请注意，当您在 shell 配置文件中导出 API 密钥或服务账号路径时，从该 shell 启动的任何进程都可以读取它们。

2.  **使用 `.env` 文件：** 在您的项目目录或主目录中创建一个 `.gemini/.env`
    文件。Gemini CLI 自动从找到的第一个 `.env`
    文件加载变量，从当前目录向上搜索，然后在 `~/.gemini/.env` 或 `~/.env`
    中搜索。推荐使用 `.gemini/.env`。

    用户范围设置示例：

    ```bash
    mkdir -p ~/.gemini
    cat >> ~/.gemini/.env <<'EOF'
    GOOGLE_CLOUD_PROJECT="your-project-id"
    # 根据需要添加其他变量，如 GEMINI_API_KEY
    EOF
    ```

变量从找到的第一个文件加载，不会合并。

## 在 Google Cloud 环境中运行 <a id="cloud-env"></a>

在某些 Google Cloud 环境中运行 Gemini CLI 时，验证是自动的。

在 Google Cloud Shell 环境中，Gemini CLI 通常使用您的 Cloud
Shell 凭据自动进行验证。在 Compute Engine 环境中，Gemini
CLI 自动使用环境元数据服务器中的应用程序默认凭据 (ADC)。

如果自动验证失败，请使用本页描述的交互式方法之一。

## 在无头模式下运行 <a id="headless"></a>

如果已缓存现有的验证凭据，[无头模式](../cli/headless) 将使用您现有的验证方法。

如果您尚未登录验证凭据，必须使用环境变量配置验证：

- [使用 Gemini API 密钥](#gemini-api)
- [Vertex AI](#vertex-ai)

## 下一步是什么？

您的验证方法会影响您的配额、定价、服务条款和隐私声明。请查看以下页面以了解更多信息：

- [Gemini CLI: 配额与定价](../quota-and-pricing.md)。
- [Gemini CLI: 服务条款与隐私声明](../tos-privacy.md)。
