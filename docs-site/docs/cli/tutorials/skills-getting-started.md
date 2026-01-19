# Agent 技能入门

Agent 技能允许您使用专业知识扩展 Gemini
CLI。本教程将指导您创建第一个技能，启用它并在会话中使用它。

## 1. 启用 Agent 技能

Agent 技能目前是一项实验性功能，必须在您的设置中启用。

### 通过交互式 UI

1.  运行 `gemini` 启动 Gemini CLI 会话。
2.  输入 `/settings` 打开交互式设置对话框。
3.  搜索 "Skills"。
4.  将 **Agent Skills** 切换为 `true`。
5.  按 `Esc` 保存并退出。您可能需要重新启动 CLI 才能使更改生效。

### 通过 `settings.json`

或者，您可以手动编辑位于 `~/.gemini/settings.json`
的全局设置文件（如果不存在则创建它）：

```json
{
  "experimental": {
    "skills": true
  }
}
```

## 2. 创建您的第一个技能

技能是一个包含 `SKILL.md` 文件的目录。让我们创建一个 **API 审计员 (API
Auditor)** 技能，帮助您验证本地或远程端点是否正确响应。

1.  **创建技能目录结构:**

    ```bash
    mkdir -p .gemini/skills/api-auditor/scripts
    ```

2.  **创建 `SKILL.md` 文件:** 在 `.gemini/skills/api-auditor/SKILL.md`
    创建一个文件，内容如下：

    ```markdown
    ---
    name: api-auditor
    description:
      审计和测试 API 端点的专业知识。当用户要求“检查”、“测试”或“审计” URL 或 API
      时使用。
    ---

    # API 审计员说明

    您充当专门从事 API 可靠性的 QA 工程师。当此技能处于活动状态时，您必须：

    1.  **审计**: 使用捆绑的 `scripts/audit.js` 实用程序检查提供的 URL 的状态。
    2.  **报告**: 分析输出（状态代码、延迟）并用通俗易懂的语言解释任何故障。
    3.  **安全**: 提醒用户是否正在测试没有 `https://` 协议的敏感端点。
    ```

3.  **创建捆绑的 Node.js 脚本:** 在
    `.gemini/skills/api-auditor/scripts/audit.js`
    创建一个文件。该脚本将被代理用于执行实际检查：

    ```javascript
    // .gemini/skills/api-auditor/scripts/audit.js
    const url = process.argv[2];

    if (!url) {
      console.error('Usage: node audit.js <url>');
      process.exit(1);
    }

    console.log(`Auditing ${url}...`);
    fetch(url, { method: 'HEAD' })
      .then((r) => console.log(`Result: Success (Status ${r.status})`))
      .catch((e) => console.error(`Result: Failed (${e.message})`));
    ```

## 3. 验证技能是否被发现

使用 `/skills` 斜杠命令（或从终端使用 `gemini skills list`）查看 Gemini
CLI 是否找到了您的新技能。

在 Gemini CLI 会话中：

```
/skills list
```

您应该会在可用技能列表中看到 `api-auditor`。

## 4. 在聊天中使用技能

现在，让我们看看技能的实际效果。开始一个新会话并询问有关端点的问题。

**用户:** "你能审计 http://geminili.com 吗"

Gemini 将识别出该请求与 `api-auditor` 描述匹配，并将请求您的许可来激活它。

**模型:** (调用 `activate_skill` 后) "我已激活 **api-auditor**
技能。我现在将运行审计脚本..."

然后，Gemini 将使用 `run_shell_command` 工具执行您捆绑的 Node 脚本：

`node .gemini/skills/api-auditor/scripts/audit.js http://geminili.com`

## 下一步

- 探索 [Agent 技能创作指南](../skills.md#creating-a-skill)
  了解更多高级技能功能。
- 学习如何通过 [扩展](../../extensions/index.md) 共享技能。
