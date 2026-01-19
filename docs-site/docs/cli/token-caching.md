# Token 缓存和成本优化

使用 API 密钥身份验证（Gemini API 密钥或 Vertex AI）时，Gemini
CLI 通过 token 缓存自动优化 API 成本。此功能重用先前的系统指令和上下文，以减少后续请求中处理的 token 数量。

**Token 缓存适用于:**

- API 密钥用户 (Gemini API 密钥)
- Vertex AI 用户 (已设置项目和位置)

**Token 缓存不适用于:**

- OAuth 用户 (Google 个人/企业账号) - Code Assist API 目前不支持创建缓存内容

您可以使用 `/stats`
命令查看您的 token 使用情况和缓存 token 节省情况。当缓存 token 可用时，它们将显示在统计输出中。
