# 本地开发指南

本指南提供了有关设置和使用本地开发功能（例如开发跟踪）的说明。

## 开发跟踪 (Development tracing)

开发跟踪 (dev traces) 是 OpenTelemetry
(OTel) 跟踪，通过检测模型调用、工具调度程序、工具调用等有趣事件来帮助您调试代码。

开发跟踪非常详细，专门用于理解代理行为和调试问题。它们默认是禁用的。

要启用开发跟踪，请在运行 Gemini CLI 时设置 `GEMINI_DEV_TRACING=true` 环境变量。

### 查看开发跟踪

您可以使用 Jaeger 或 Genkit 开发者 UI 查看开发跟踪。

#### 使用 Genkit

Genkit 提供了一个基于 Web 的 UI，用于查看跟踪和其他遥测数据。

1.  **启动 Genkit 遥测服务器:**

    运行以下命令以启动 Genkit 服务器：

    ```bash
    npm run telemetry -- --target=genkit
    ```

    脚本将输出 Genkit 开发者 UI 的 URL，例如：

    ```
    Genkit Developer UI: http://localhost:4000
    ```

2.  **运行带有开发跟踪的 Gemini CLI:**

    在单独的终端中，使用 `GEMINI_DEV_TRACING` 环境变量运行您的 Gemini CLI 命令：

    ```bash
    GEMINI_DEV_TRACING=true gemini
    ```

3.  **查看跟踪:**

    在浏览器中打开 Genkit 开发者 UI URL，然后导航到 **Traces**
    选项卡以查看跟踪。

#### 使用 Jaeger

您可以在 Jaeger UI 中查看开发跟踪。首先，请按照以下步骤操作：

1.  **启动遥测收集器:**

    在终端中运行以下命令以下载并启动 Jaeger 和 OTEL 收集器：

    ```bash
    npm run telemetry -- --target=local
    ```

    此命令还会为本地遥测配置您的工作区，并提供 Jaeger UI 的链接（通常为
    `http://localhost:16686`）。

2.  **运行带有开发跟踪的 Gemini CLI:**

    在单独的终端中，使用 `GEMINI_DEV_TRACING` 环境变量运行您的 Gemini CLI 命令：

    ```bash
    GEMINI_DEV_TRACING=true gemini
    ```

3.  **查看跟踪:**

    运行命令后，在浏览器中打开 Jaeger UI 链接以查看跟踪。

有关遥测的更多详细信息，请参阅 [遥测文档](./cli/telemetry.md)。

### 使用开发跟踪检测代码

您可以向自己的代码添加开发跟踪，以进行更详细的检测。这对于调试和理解执行流程非常有用。

使用 `runInDevTraceSpan` 函数将任何代码段包装在跟踪 span 中。

这是一个基本示例：

```typescript
import { runInDevTraceSpan } from '@google/gemini-cli-core';

await runInDevTraceSpan({ name: 'my-custom-span' }, async ({ metadata }) => {
  // `metadata` 对象允许您记录操作的输入和输出以及其他属性。
  metadata.input = { key: 'value' };
  // 设置自定义属性。
  metadata.attributes['gen_ai.request.model'] = 'gemini-4.0-mega';

  // 您的跟踪代码放在这里
  try {
    const output = await somethingRisky();
    metadata.output = output;
    return output;
  } catch (e) {
    metadata.error = e;
    throw e;
  }
});
```

在此示例中：

- `name`: span 的名称，将显示在跟踪中。
- `metadata.input`: (可选) 包含被跟踪操作的输入数据的对象。
- `metadata.output`: (可选) 包含被跟踪操作的输出数据的对象。
- `metadata.attributes`: (可选) 要添加到 span 的自定义属性记录。
- `metadata.error`: (可选) 如果操作失败，要记录的错误对象。
