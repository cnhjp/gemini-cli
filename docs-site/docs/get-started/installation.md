# Gemini CLI 安装、执行与部署

安装并运行 Gemini CLI。本文档概述了 Gemini CLI 的安装方法和部署架构。

## 如何安装和/或运行 Gemini CLI

运行 Gemini CLI 有几种方式。推荐的选项取决于您打算如何使用 Gemini CLI。

- 作为标准安装。这是使用 Gemini CLI 最直接的方法。
- 在沙盒中运行。这种方法提供了更高的安全性和隔离性。
- 从源码运行。推荐给项目贡献者使用。

### 1. 标准安装（推荐给普通用户）

这是最终用户安装 Gemini CLI 的推荐方式。它涉及从 NPM 注册表下载 Gemini CLI 包。

- **全局安装：**

  ```bash
  npm install -g @google/gemini-cli
  ```

  然后，在任何地方运行 CLI：

  ```bash
  gemini
  ```

- **NPX 执行：**

  ```bash
  # 不进行全局安装，直接从 NPM 执行最新版本
  npx @google/gemini-cli
  ```

### 2. 在沙盒中运行 (Docker/Podman)

为了安全和隔离，Gemini
CLI 可以在容器内运行。这是 CLI 执行可能产生副作用的工具时的默认方式。

- **直接从注册表运行：**
  您可以直接运行已发布的沙盒镜像。这对于只有 Docker 且只想运行 CLI 的环境非常有用。
  ```bash
  # 运行已发布的沙盒镜像
  docker run --rm -it us-docker.pkg.dev/gemini-code-dev/gemini-cli/sandbox:0.1.1
  ```
- **使用 `--sandbox` 标志：** 如果您已在本地安装了 Gemini
  CLI（使用上述标准安装），您可以指示它在沙盒容器内运行。
  ```bash
  gemini --sandbox -y -p "your prompt here"
  ```

### 3. 从源码运行（推荐给 Gemini CLI 贡献者）

项目的贡献者会希望直接从源代码运行 CLI。

- **开发模式：** 此方法提供热重载，适用于活跃开发。
  ```bash
  # 从仓库根目录运行
  npm run start
  ```
- **类生产模式（链接包）：**
  此方法通过链接您的本地包来模拟全局安装。这对于在生产工作流中测试本地构建非常有用。

  ```bash
  # 将本地 cli 包链接到您的全局 node_modules
  npm link packages/cli

  # 现在您可以使用 `gemini` 命令运行您的本地版本
  gemini
  ```

---

### 4. 从 GitHub 运行最新的 Gemini CLI 提交

您可以直接从 GitHub 仓库运行 Gemini
CLI 的最新提交版本。这对于测试仍在开发中的功能非常有用。

```bash
# 直接从 GitHub 上的 main 分支执行 CLI
npx https://github.com/google-gemini/gemini-cli
```

## 部署架构

上述执行方法是通过以下架构组件和流程实现的：

**NPM 包**

Gemini CLI 项目是一个 monorepo，向 NPM 注册表发布两个核心包：

- `@google/gemini-cli-core`: 后端，处理逻辑和工具执行。
- `@google/gemini-cli`: 面向用户的前端。

在执行标准安装和从源码运行 Gemini CLI 时会使用这些包。

**构建和打包流程**

根据分发渠道的不同，使用两种不同的构建流程：

- **NPM 发布：** 为了发布到 NPM 注册表，`@google/gemini-cli-core` 和
  `@google/gemini-cli`
  中的 TypeScript 源代码使用 TypeScript 编译器 (`tsc`) 转译为标准 JavaScript。生成的
  `dist/` 目录即为 NPM 包中发布的内容。这是 TypeScript 库的标准做法。

- **GitHub `npx` 执行：** 当直接从 GitHub 运行最新版本的 Gemini
  CLI 时，`package.json` 中的 `prepare` 脚本会触发不同的流程。此脚本使用
  `esbuild`
  将整个应用程序及其依赖项打包成一个独立的 JavaScript 文件。此包在用户机器上即时创建，并未检入仓库。

**Docker 沙盒镜像**

基于 Docker 的执行方法由 `gemini-cli-sandbox`
容器镜像支持。此镜像发布到容器注册表，并包含预安装的全局版本 Gemini CLI。

## 发布流程

发布流程通过 GitHub Actions 自动化。发布工作流执行以下操作：

1.  使用 `tsc` 构建 NPM 包。
2.  将 NPM 包发布到制品库。
3.  创建包含打包资源的 GitHub Release。
