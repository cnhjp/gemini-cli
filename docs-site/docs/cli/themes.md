# 主题

Gemini CLI 支持多种主题以自定义其配色方案和外观。您可以通过 `/theme` 命令或
`"theme":` 配置设置来更改主题以适应您的偏好。

## 可用主题

Gemini CLI 附带了一系列预定义的主题，您可以在 Gemini CLI 中使用 `/theme`
命令列出这些主题：

- **深色主题:**
  - `ANSI`
  - `Atom One`
  - `Ayu`
  - `Default`
  - `Dracula`
  - `GitHub`
- **浅色主题:**
  - `ANSI Light`
  - `Ayu Light`
  - `Default Light`
  - `GitHub Light`
  - `Google Code`
  - `Xcode`

### 更改主题

1.  在 Gemini CLI 中输入 `/theme`。
2.  将出现一个对话框或选择提示，列出可用主题。
3.  使用箭头键选择一个主题。某些界面可能会在您选择时提供实时预览或高亮显示。
4.  确认您的选择以应用主题。

**注意:** 如果主题在您的 `settings.json`
文件中定义（通过名称或文件路径），您必须先从文件中删除 `"theme"`
设置，然后才能使用 `/theme` 命令更改主题。

### 主题持久化

所选主题保存在 Gemini CLI 的 [配置](../get-started/configuration.md)
中，因此您的偏好在会话之间会被记住。

---

## 自定义颜色主题

Gemini CLI 允许您通过在 `settings.json`
文件中指定它们来创建自己的自定义颜色主题。这使您可以完全控制 CLI 中使用的调色板。

### 如何定义自定义主题

将 `customThemes` 块添加到您的用户、项目或系统 `settings.json`
文件中。每个自定义主题都定义为一个具有唯一名称和一组颜色键的对象。例如：

```json
{
  "ui": {
    "customThemes": {
      "MyCustomTheme": {
        "name": "MyCustomTheme",
        "type": "custom",
        "Background": "#181818",
        ...
      }
    }
  }
}
```

**颜色键:**

- `Background`
- `Foreground`
- `LightBlue`
- `AccentBlue`
- `AccentPurple`
- `AccentCyan`
- `AccentGreen`
- `AccentYellow`
- `AccentRed`
- `Comment`
- `Gray`
- `DiffAdded` (可选，用于 diff 中的添加行)
- `DiffRemoved` (可选，用于 diff 中的删除行)
- `DiffModified` (可选，用于 diff 中的修改行)

您还可以通过添加嵌套的 `text` 对象来覆盖单个 UI 文本角色。此对象支持键
`primary`, `secondary`, `link`, `accent`, 和 `response`。当提供 `text.response`
时，它优先于 `text.primary` 用于在聊天中渲染模型响应。

**必填属性:**

- `name` (必须与 `customThemes` 对象中的键匹配且为字符串)
- `type` (必须是字符串 `"custom"`)
- `Background`
- `Foreground`
- `LightBlue`
- `AccentBlue`
- `AccentPurple`
- `AccentCyan`
- `AccentGreen`
- `AccentYellow`
- `AccentRed`
- `Comment`
- `Gray`

您可以对任何颜色值使用十六进制代码（例如 `#FF0000`）**或**
标准 CSS 颜色名称（例如 `coral`, `teal`, `blue`）。请参阅
[CSS 颜色名称](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#color_keywords)
获取支持名称的完整列表。

您可以通过向 `customThemes` 对象添加更多条目来定义多个自定义主题。

### 从文件加载主题

除了在 `settings.json` 中定义自定义主题外，您还可以通过在 `settings.json`
中指定文件路径直接从 JSON 文件加载主题。这对共享主题或将它们与主配置分开很有用。

要从文件加载主题，请将 `settings.json` 中的 `theme` 属性设置为主题文件的路径：

```json
{
  "ui": {
    "theme": "/path/to/your/theme.json"
  }
}
```

主题文件必须是有效的 JSON 文件，其结构与 `settings.json`
中定义的自定义主题相同。

**示例 `my-theme.json`:**

```json
{
  "name": "My File Theme",
  "type": "custom",
  "Background": "#282A36",
  "Foreground": "#F8F8F2",
  "LightBlue": "#82AAFF",
  "AccentBlue": "#61AFEF",
  "AccentPurple": "#BD93F9",
  "AccentCyan": "#8BE9FD",
  "AccentGreen": "#50FA7B",
  "AccentYellow": "#F1FA8C",
  "AccentRed": "#FF5555",
  "Comment": "#6272A4",
  "Gray": "#ABB2BF",
  "DiffAdded": "#A6E3A1",
  "DiffRemoved": "#F38BA8",
  "DiffModified": "#89B4FA",
  "GradientColors": ["#4796E4", "#847ACE", "#C3677F"]
}
```

**安全说明:** 为了您的安全，Gemini
CLI 只会加载位于您的主目录中的主题文件。如果您尝试从主目录外部加载主题，将显示警告并且不会加载主题。这是为了防止从不受信任的来源加载潜在的恶意主题文件。

### 自定义主题示例

<img src="/assets/theme-custom.png" alt="Custom theme example" width="600" />

### 使用您的自定义主题

- 在 Gemini CLI 中使用 `/theme`
  命令选择您的自定义主题。您的自定义主题将出现在主题选择对话框中。
- 或者，通过将 `"theme": "MyCustomTheme"` 添加到 `settings.json` 中的 `ui`
  对象将其设置为默认值。
- 自定义主题可以在用户、项目或系统级别设置，并遵循与其他设置相同的
  [配置优先级](../get-started/configuration.md)。

---

## 深色主题

### ANSI

<img src="/assets/theme-ansi.png" alt="ANSI theme" width="600" />

### Atom OneDark

<img src="/assets/theme-atom-one.png" alt="Atom One theme" width="600">

### Ayu

<img src="/assets/theme-ayu.png" alt="Ayu theme" width="600">

### Default

<img src="/assets/theme-default.png" alt="Default theme" width="600">

### Dracula

<img src="/assets/theme-dracula.png" alt="Dracula theme" width="600">

### GitHub

<img src="/assets/theme-github.png" alt="GitHub theme" width="600">

## 浅色主题

### ANSI Light

<img src="/assets/theme-ansi-light.png" alt="ANSI Light theme" width="600">

### Ayu Light

<img src="/assets/theme-ayu-light.png" alt="Ayu Light theme" width="600">

### Default Light

<img src="/assets/theme-default-light.png" alt="Default Light theme" width="600">

### GitHub Light

<img src="/assets/theme-github-light.png" alt="GitHub Light theme" width="600">

### Google Code

<img src="/assets/theme-google-light.png" alt="Google Code theme" width="600">

### Xcode

<img src="/assets/theme-xcode-light.png" alt="Xcode Light theme" width="600">
