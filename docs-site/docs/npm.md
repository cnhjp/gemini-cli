# 包概览

此 monorepo 包含两个主要包：`@google/gemini-cli` 和 `@google/gemini-cli-core`。

## `@google/gemini-cli`

这是 Gemini CLI 的主包。它负责用户界面、命令解析和所有其他面向用户的功能。

发布此包时，它会被捆绑到一个可执行文件中。此捆绑包包含包的所有依赖项，包括
`@google/gemini-cli-core`。这意味着无论用户是使用
`npm install -g @google/gemini-cli` 安装包，还是直接使用
`npx @google/gemini-cli` 运行包，他们都在使用这个单一的、自包含的可执行文件。

## `@google/gemini-cli-core`

此包包含与 Gemini
API 交互的核心逻辑。它负责进行 API 请求、处理身份验证和管理本地缓存。

此包未被捆绑。发布时，它作为具有自己依赖项的标准 Node.js 包发布。这允许它在需要时作为独立包在其他项目中使用。`dist`
文件夹中的所有转译 js 代码都包含在包中。

## NPM 工作区

本项目使用 [NPM Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
来管理此 monorepo 中的包。这简化了开发，允许我们管理依赖项并从项目根目录跨多个包运行脚本。

### 工作原理

根目录下的 `package.json` 文件定义了此项目的工作区：

```json
{
  "workspaces": ["packages/*"]
}
```

这告诉 NPM，`packages`
目录内的任何文件夹都是一个单独的包，应作为工作区的一部分进行管理。

### 工作区的优势

- **简化的依赖项管理**: 从项目根目录运行 `npm install`
  将安装工作区中所有包的所有依赖项并将它们链接在一起。这意味着您无需在每个包的目录中运行
  `npm install`。
- **自动链接**: 工作区内的包可以相互依赖。当您运行 `npm install`
  时，NPM 会自动在包之间创建符号链接。这意味着当您对一个包进行更改时，这些更改立即对依赖它的其他包可用。
- **简化的脚本执行**: 您可以使用 `--workspace`
  标志从项目根目录运行任何包中的脚本。例如，要在 `cli` 包中运行 `build`
  脚本，您可以运行 `npm run build --workspace @google/gemini-cli`。
