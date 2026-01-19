# Agent 技能

_注意：这是一个实验性功能，通过 `experimental.skills` 启用。您也可以在
`/settings` 交互式 UI 中搜索 "Skills" 来切换此功能并管理其他技能相关设置。_

Agent 技能允许您使用专业知识、流程化工作流和特定于任务的资源来扩展 Gemini
CLI。基于 [Agent Skills](https://agentskills.io)
开放标准，“技能”是一个自包含的目录，将说明和资产打包成可发现的功能。

## 概览

与提供持久工作区范围背景的一般上下文文件 ([`GEMINI.md`](./gemini-md.md)) 不同，技能代表
**按需专业知识**。这允许 Gemini 维护庞大的专业能力库——例如安全审计、云部署或代码库迁移——而不会弄乱模型的即时上下文窗口。

Gemini 根据您的请求和技能描述自主决定何时使用技能。当识别出相关技能时，模型使用
`activate_skill` 工具“提取”完成任务所需的完整说明和资源。

## 主要优势

- **共享专业知识:**
  将复杂的工作流（如特定团队的 PR 审查流程）打包到一个文件夹中，任何人都可以使用。
- **可重复的工作流:** 通过提供流程化框架，确保持续执行复杂的多步骤任务。
- **资源捆绑:** 将脚本、模板或示例数据与说明包含在一起，以便代理拥有所需的一切。
- **渐进式披露:**
  最初仅加载技能元数据（名称和描述）。详细说明和资源仅在模型显式激活技能时才披露，从而节省上下文 token。

## 技能发现层级

Gemini CLI 从三个主要位置发现技能：

1.  **工作区技能**
    (`.gemini/skills/`): 特定于工作区的技能，通常提交到版本控制并与团队共享。
2.  **用户技能** (`~/.gemini/skills/`): 跨所有工作区可用的个人技能。
3.  **扩展技能**: 捆绑在已安装的 [扩展](../extensions/index.md) 中的技能。

**优先级:**
如果多个技能共享相同的名称，较高优先级的位置会覆盖较低优先级的位置：**工作区 > 用户 > 扩展**。

## 管理技能

### 在交互式会话中

使用 `/skills` 斜杠命令查看和管理可用专业知识：

- `/skills list` (默认): 显示所有发现的技能及其状态。
- `/skills disable <name>`: 阻止使用特定技能。
- `/skills enable <name>`: 重新启用已禁用的技能。
- `/skills reload`: 刷新从所有层级发现的技能列表。

_注意：`/skills disable` 和 `/skills enable` 默认为 `user` 范围。使用
`--scope workspace` 管理特定于工作区的设置。_

### 从终端

`gemini skills` 命令提供管理实用程序：

```bash
# 列出所有发现的技能
gemini skills list

# 从 Git 仓库、本地目录或压缩的技能文件 (.skill) 安装技能
# 默认使用用户范围 (~/.gemini/skills)
gemini skills install https://github.com/user/repo.git
gemini skills install /path/to/local/skill
gemini skills install /path/to/local/my-expertise.skill

# 使用 --path 从 monorepo 或子目录安装特定技能
gemini skills install https://github.com/my-org/my-skills.git --path skills/frontend-design

# 安装到工作区范围 (.gemini/skills)
gemini skills install /path/to/skill --scope workspace

# 按名称卸载技能
gemini skills uninstall my-expertise --scope workspace

# 启用技能（全局）
gemini skills enable my-expertise

# 禁用技能。可以使用 --scope 指定工作区或用户（默认为工作区）
gemini skills disable my-expertise --scope workspace
```

## 创建技能

技能是一个在其根目录包含 `SKILL.md` 文件的目录。此文件使用 YAML
frontmatter 进行元数据，使用 Markdown 进行说明。

### 文件夹结构

技能是自包含的目录。技能至少需要一个 `SKILL.md` 文件，但可以包含其他资源：

```text
my-skill/
├── SKILL.md       (必需) 说明和元数据
├── scripts/       (可选) 可执行脚本/工具
├── references/    (可选) 静态文档和示例
└── assets/        (可选) 模板和二进制资源
```

### 基本结构 (SKILL.md)

```markdown
---
name: <unique-name>
description: <技能做什么以及 Gemini 何时应该使用它>
---

<关于代理应如何行为/使用技能的说明>
```

- **`name`**: 唯一标识符（小写、字母数字和破折号）。
- **`description`**: 最关键的字段。Gemini 使用它来决定技能何时相关。具体说明提供的专业知识。
- **主体**: 第二个 `---` 下面的所有内容都作为专家程序指南注入模型。

### 示例：团队代码审查员

创建 `~/.gemini/skills/code-reviewer/SKILL.md`:

```markdown
---
name: code-reviewer
description: 审查代码风格、安全性和性能的专业知识。当用户要求“反馈”、“审查”或“检查”他们的更改时使用。
---

# 代码审查员

您是一位专家代码审查员。在审查代码时，请遵循此工作流：

1.  **分析**: 审查暂存的更改或提供的特定文件。确保更改范围适当，并代表解决问题所需的最小更改。
2.  **风格**: 确保代码遵循 `GEMINI.md` 文件中描述的工作区约定和惯用模式。
3.  **安全**: 标记任何潜在的安全漏洞。
4.  **测试**: 验证新逻辑是否具有相应的测试覆盖率，并且测试覆盖率充分验证了更改。

以简明的“优势”和“机会”项目符号列表提供您的反馈。
```

### 资源约定

虽然您可以随意构建技能目录，但 Agent Skills 标准鼓励以下约定：

- **`scripts/`**: 代理可以运行的可执行脚本（bash, python, node）。
- **`references/`**: 供代理查阅的静态文档、模式或示例数据。
- **`assets/`**: 代码模板、样板或二进制资源。

激活技能时，Gemini
CLI 会向模型提供整个技能目录的树状视图，使其能够发现和利用这些资产。

## 工作原理（安全与隐私）

1.  **发现**: 在会话开始时，Gemini
    CLI 扫描发现层级，并将所有已启用技能的名称和描述注入系统提示词。
2.  **激活**: 当 Gemini 识别出与技能描述匹配的任务时，它会调用 `activate_skill`
    工具。
3.  **同意**: 您将在 UI 中看到确认提示，详细说明技能的名称、用途以及它将获得访问权限的目录路径。
4.  **注入**: 经您批准后：
    - `SKILL.md` 主体和文件夹结构被添加到对话历史记录中。
    - 技能的目录被添加到代理的允许文件路径中，授予其读取任何捆绑资产的权限。
5.  **执行**: 模型在专业知识处于活动状态下继续进行。它被指示在合理范围内优先考虑技能的程序指南。
