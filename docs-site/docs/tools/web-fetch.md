# Web fetch 工具 (`web_fetch`)

本文档描述了 Gemini CLI 的 `web_fetch` 工具。

## 描述

使用 `web_fetch` 总结、比较或提取网页中的信息。`web_fetch`
工具处理嵌入在提示词中的一个或多个 URL（最多 20 个）的内容。`web_fetch`
接受自然语言提示词并返回生成的响应。

### 参数

`web_fetch` 接受一个参数：

- `prompt`
  (string, 必需): 一个综合提示词，包括要获取的 URL（最多 20 个）以及有关如何处理其内容的具体说明。例如：
  `"Summarize https://example.com/article and extract key points from https://another.com/data"`。提示词必须包含至少一个以
  `http://` 或 `https://` 开头的 URL。

## 如何在 Gemini CLI 中使用 `web_fetch`

要在 Gemini CLI 中使用
`web_fetch`，请提供包含 URL 的自然语言提示词。该工具在获取任何 URL 之前会要求确认。确认后，该工具将通过 Gemini
API 的 `urlContext` 处理 URL。

如果 Gemini
API 无法访问该 URL，该工具将回退到直接从本地机器获取内容。该工具将格式化响应，包括来源归属和可能的引用。然后，该工具将向用户提供响应。

用法:

```
web_fetch(prompt="Your prompt, including a URL such as https://google.com.")
```

## `web_fetch` 示例

总结单篇文章：

```
web_fetch(prompt="Can you summarize the main points of https://example.com/news/latest")
```

比较两篇文章：

```
web_fetch(prompt="What are the differences in the conclusions of these two papers: https://arxiv.org/abs/2401.0001 and https://arxiv.org/abs/2401.0002?")
```

## 重要说明

- **URL 处理:** `web_fetch` 依赖于 Gemini API 访问和处理给定 URL 的能力。
- **输出质量:** 输出质量将取决于提示词中说明的清晰度。
