# 高级模型配置

本指南详细介绍了 Gemini
CLI 中的模型配置系统。该系统专为研究人员、AI 质量工程师和高级用户设计，为管理生成式模型超参数和行为提供了严格的框架。

> **警告**: 这是一项高级用户功能。配置值将以极少的验证直接传递给模型提供商。不正确的设置（例如，不兼容的参数组合）可能会导致 API 运行时错误。

## 1. 系统概览

模型配置系统 (`ModelConfigService`) 实现了对模型生成的确定性控制。它将请求的模型标识符（例如，CLI 标志或代理请求）与底层的 API 配置解耦。这允许：

- **精确的超参数调整**: 直接控制 `temperature`, `topP`, `thinkingBudget`
  和其他 SDK 级别的参数。
- **特定于环境的行为**: 针对不同操作上下文（例如，测试与生产）的不同配置。
- **代理范围的自定义**: 仅在特定代理处于活动状态时应用特定设置。

该系统基于两个核心原语运行：**别名 (Aliases)** 和 **覆盖 (Overrides)**。

## 2. 配置原语

这些设置位于配置文件的 `modelConfigs` 键下。

### 别名 (`customAliases`)

别名是命名的、可重用的配置预设。用户应在 `customAliases`
映射中定义自己的别名（或覆盖系统默认值）。

- **继承**: 别名可以 `extends`（继承）另一个别名（包括像 `chat-base`
  这样的系统默认值），继承其 `modelConfig`。子别名可以覆盖或扩充继承的设置。
- **抽象别名**: 如果别名仅用作其他别名的基础，则无需指定具体的 `model`。

**层级示例**:

```json
"modelConfigs": {
  "customAliases": {
    "base": {
      "modelConfig": {
        "generateContentConfig": { "temperature": 0.0 }
      }
    },
    "chat-base": {
      "extends": "base",
      "modelConfig": {
        "generateContentConfig": { "temperature": 0.7 }
      }
    }
  }
}
```

### 覆盖 (`overrides`)

覆盖是根据运行时上下文注入配置的条件规则。它们针对每个模型请求动态评估。

- **匹配标准**: 当请求上下文匹配指定的 `match` 属性时，应用覆盖。
  - `model`: 匹配请求的模型名称或别名。
  - `overrideScope`: 匹配请求的不同范围（通常是代理名称，例如
    `codebaseInvestigator`）。

**覆盖示例**:

```json
"modelConfigs": {
  "overrides": [
    {
      "match": {
        "overrideScope": "codebaseInvestigator"
      },
      "modelConfig": {
        "generateContentConfig": { "temperature": 0.1 }
      }
    }
  ]
}
```

## 3. 解析策略

`ModelConfigService` 通过两步过程解析最终配置：

### 步骤 1: 别名解析

在系统 `aliases` 和用户 `customAliases` 的合并映射中查找请求的模型字符串。

1.  如果找到，系统递归解析 `extends` 链。
2.  设置从父级合并到子级（子级胜出）。
3.  这会产生一个基本的 `ResolvedModelConfig`。
4.  如果未找到，请求的字符串将被视为原始模型名称。

### 步骤 2: 覆盖应用

系统根据请求上下文（`model` 和 `overrideScope`）评估 `overrides` 列表。

1.  **过滤**: 识别所有匹配的覆盖。
2.  **排序**: 匹配项按 **特异性**（`match` 对象中匹配键的数量）优先排序。
    - 具体匹配（例如 `model` + `overrideScope`）覆盖广泛匹配（例如仅 `model`）。
    - 平局决胜：如果特异性相等，则保留 `overrides`
      数组中的定义顺序（最后一个胜出）。
3.  **合并**: 来自排序覆盖的配置按顺序合并到基本配置上。

## 4. 配置参考

配置遵循 `ModelConfigServiceConfig` 接口。

### `ModelConfig` 对象

定义模型的实际参数。

| 属性                    | 类型     | 描述                                            |
| :---------------------- | :------- | :---------------------------------------------- |
| `model`                 | `string` | 要调用的模型的标识符（例如 `gemini-2.5-pro`）。 |
| `generateContentConfig` | `object` | 传递给 `@google/genai` SDK 的配置对象。         |

### `GenerateContentConfig` (通用参数)

直接映射到 SDK 的 `GenerateContentConfig`。常见参数包括：

- **`temperature`**:
  (`number`) 控制输出的随机性。较低的值 (0.0) 是确定性的；较高的值 (>0.7) 是创造性的。
- **`topP`**: (`number`) 核采样概率。
- **`maxOutputTokens`**: (`number`) 生成响应长度的限制。
- **`thinkingConfig`**: (`object`) 具有推理能力的模型的配置（例如
  `thinkingBudget`, `includeThoughts`）。

## 5. 实际示例

### 定义确定性基线

为需要高精度的任务创建一个别名，扩展标准聊天配置但强制零温度。

```json
"modelConfigs": {
  "customAliases": {
    "precise-mode": {
      "extends": "chat-base",
      "modelConfig": {
        "generateContentConfig": {
          "temperature": 0.0,
          "topP": 1.0
        }
      }
    }
  }
}
```

### 特定于代理的参数注入

强制特定代理（例如
`codebaseInvestigator`）使用扩展的思考预算，而不更改全局默认值。

```json
"modelConfigs": {
  "overrides": [
    {
      "match": {
        "overrideScope": "codebaseInvestigator"
      },
      "modelConfig": {
        "generateContentConfig": {
          "thinkingConfig": { "thinkingBudget": 4096 }
        }
      }
    }
  ]
}
```

### 实验性模型评估

将特定别名的流量路由到预览模型以进行 A/B 测试，而无需更改客户端代码。

```json
"modelConfigs": {
  "overrides": [
    {
      "match": {
        "model": "gemini-2.5-pro"
      },
      "modelConfig": {
        "model": "gemini-2.5-pro-experimental-001"
      }
    }
  ]
}
```
