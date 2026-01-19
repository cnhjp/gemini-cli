# Todo 工具 (`write_todos`)

本文档描述了 Gemini CLI 的 `write_todos` 工具。

## 描述

`write_todos`
工具允许 Gemini 代理为复杂的用户请求创建和管理子任务列表。这为您（用户）提供了对代理计划及其当前进度的更大可见性。它还有助于对齐，使代理不太可能忘记其当前目标。

### 参数

`write_todos` 接受一个参数：

- `todos` (对象数组, 必需): 完整的待办事项列表。这将替换现有列表。每个项目包括：
  - `description` (string): 任务描述。
  - `status` (string): 当前状态 (`pending`, `in_progress`, `completed`, 或
    `cancelled`)。

## 行为

代理使用此工具将复杂的多步骤请求分解为清晰的计划。

- **进度跟踪:** 代理在工作时更新此列表，完成时将任务标记为 `completed`。
- **单一焦点:** 一次只有一个任务会被标记为
  `in_progress`，准确指示代理当前正在做什么。
- **动态更新:**
  随着代理发现新信息，计划可能会演变，导致添加新任务或取消不必要的任务。

激活时，当前的 `in_progress`
任务显示在输入框上方，让您随时了解立即采取的行动。您可以随时按 `Ctrl+T`
切换待办事项列表的完整视图。

用法示例（内部表示）：

```javascript
write_todos({
  todos: [
    { description: 'Initialize new React project', status: 'completed' },
    { description: 'Implement state management', status: 'in_progress' },
    { description: 'Create API service', status: 'pending' },
  ],
});
```

## 重要说明

- **启用:** 此工具默认启用。您可以通过设置 `"useWriteTodos": false` 在您的
  `settings.json` 文件中禁用它。

- **预期用途:** 此工具主要由代理用于复杂的多轮任务。它通常不用于简单的单轮问题。
