# Gemini CLI 入门

欢迎使用 Gemini CLI！本指南将帮助您安装、配置并开始使用 Gemini
CLI，直接在终端中提升您的工作效率。

## 快速入门：安装、验证、配置和使用 Gemini CLI

Gemini
CLI 将先进语言模型的强大功能直接带到了您的命令行界面。作为基于 AI 的助手，Gemini
CLI 可以帮助您完成各种任务，从理解和生成代码到审查和编辑文档。

## 安装

安装和运行 Gemini CLI 的标准方法是使用 `npm`：

```bash
npm install -g @google/gemini-cli
```

安装完成后，从命令行运行 Gemini CLI：

```bash
gemini
```

更多安装选项，请参阅 [Gemini CLI 安装](./installation.md)。

## 验证

要开始使用 Gemini
CLI，您必须通过 Google 服务进行验证。在大多数情况下，您可以使用现有的 Google 账号登录：

1. 安装后运行 Gemini CLI：

   ```bash
   gemini
   ```

2. 当被问及“您希望如何为此项目进行验证？”时，选择 **1. Login with
   Google**（使用 Google 登录）。

3. 选择您的 Google 账号。

4. 点击 **Sign in**（登录）。

某些账号类型可能需要您配置 Google
Cloud 项目。有关更多信息（包括其他验证方法），请参阅
[Gemini CLI 验证设置](./authentication.md)。

## 配置

Gemini CLI 提供了多种配置行为的方式，包括环境变量、命令行参数和设置文件。

要探索您的配置选项，请参阅 [Gemini CLI 配置](./configuration.md)。

## 使用

安装并验证后，您可以通过在终端中输入命令和提示词来开始使用 Gemini
CLI。您可以让它生成代码、解释文件等等。

要探索 Gemini CLI 的强大功能，请参阅 [Gemini CLI 示例](./examples.md)。

## 下一步是什么？

- 了解更多关于 [Gemini CLI 工具](../tools/index.md) 的信息。
- 查看 [Gemini CLI 命令](../cli/commands.md)。
- 学习如何 [开始使用 Gemini 3](./gemini-3.md)。
