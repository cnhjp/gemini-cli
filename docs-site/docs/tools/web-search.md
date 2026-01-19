# Web 搜索工具 (`google_web_search`)

本文档描述了 `google_web_search` 工具。

## 描述

使用 `google_web_search` 通过 Gemini
API 使用 Google 搜索执行网络搜索。`google_web_search`
工具返回带有来源的网络结果摘要。

### 参数

`google_web_search` 接受一个参数：

- `query` (string, 必需): 搜索查询。

## 如何在 Gemini CLI 中使用 `google_web_search`

`google_web_search` 工具向 Gemini
API 发送查询，然后执行网络搜索。`google_web_search`
将返回基于搜索结果生成的响应，包括引用和来源。

用法:

```
google_web_search(query="Your query goes here.")
```

## `google_web_search` 示例

获取有关主题的信息：

```
google_web_search(query="latest advancements in AI-powered code generation")
```

## 重要说明

- **返回的响应:** `google_web_search`
  工具返回处理后的摘要，而不是原始的搜索结果列表。
- **引用:** 响应包含对用于生成摘要的来源的引用。
