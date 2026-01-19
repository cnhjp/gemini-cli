# Gemini CLI 中的沙盒

本文档提供了 Gemini CLI 中沙盒的指南，包括先决条件、快速入门和配置。

## 先决条件

在使用沙盒之前，您需要安装并设置 Gemini CLI：

```bash
npm install -g @google/gemini-cli
```

要验证安装：

```bash
gemini --version
```

## 沙盒概览

沙盒将潜在危险的操作（如 shell 命令或文件修改）与您的主机系统隔离，在 AI 操作和您的环境之间提供安全屏障。

沙盒的好处包括：

- **安全性**: 防止意外的系统损坏或数据丢失。
- **隔离性**: 将文件系统访问限制在项目目录中。
- **一致性**: 确保跨不同系统的可重现环境。
- **安全性**: 在处理不受信任的代码或实验性命令时降低风险。

## 沙盒方法

您理想的沙盒方法可能会因您的平台和首选容器解决方案而异。

### 1. macOS Seatbelt (仅限 macOS)

使用 `sandbox-exec` 的轻量级内置沙盒。

**默认配置文件**:
`permissive-open` - 限制在项目目录之外写入，但允许大多数其他操作。

### 2. 基于容器 (Docker/Podman)

具有完全进程隔离的跨平台沙盒。

**注意**: 需要在本地构建沙盒镜像或使用组织注册表中的已发布镜像。

## 快速入门

```bash
# 使用命令标志启用沙盒
gemini -s -p "analyze the code structure"

# 使用环境变量
export GEMINI_SANDBOX=true
gemini -p "run the test suite"

# 在 settings.json 中配置
{
  "tools": {
    "sandbox": "docker"
  }
}
```

## 配置

### 启用沙盒（按优先级顺序）

1. **命令标志**: `-s` 或 `--sandbox`
2. **环境变量**: `GEMINI_SANDBOX=true|docker|podman|sandbox-exec`
3. **设置文件**: `settings.json` 文件 `tools` 对象中的
   `"sandbox": true`（例如，`{"tools": {"sandbox": true}}`）。

### macOS Seatbelt 配置文件

内置配置文件（通过 `SEATBELT_PROFILE` 环境变量设置）：

- `permissive-open` (默认): 写入限制，允许网络
- `permissive-closed`: 写入限制，无网络
- `permissive-proxied`: 写入限制，通过代理的网络
- `restrictive-open`: 严格限制，允许网络
- `restrictive-closed`: 最大限制

### 自定义沙盒标志

对于基于容器的沙盒，您可以使用 `SANDBOX_FLAGS` 环境变量将自定义标志注入 `docker`
或 `podman` 命令。这对于高级配置非常有用，例如针对特定用例禁用安全功能。

**示例 (Podman)**:

要禁用卷挂载的 SELinux 标签，您可以设置以下内容：

```bash
export SANDBOX_FLAGS="--security-opt label=disable"
```

可以作为空格分隔的字符串提供多个标志：

```bash
export SANDBOX_FLAGS="--flag1 --flag2=value"
```

## Linux UID/GID 处理

沙盒自动处理 Linux 上的用户权限。使用以下命令覆盖这些权限：

```bash
export SANDBOX_SET_UID_GID=true   # 强制主机 UID/GID
export SANDBOX_SET_UID_GID=false  # 禁用 UID/GID 映射
```

## 故障排除

### 常见问题

**"Operation not permitted"**

- 操作需要访问沙盒外部。
- 尝试更宽松的配置文件或添加挂载点。

**缺少命令**

- 添加到自定义 Dockerfile。
- 通过 `sandbox.bashrc` 安装。

**网络问题**

- 检查沙盒配置文件是否允许网络。
- 验证代理配置。

### 调试模式

```bash
DEBUG=1 gemini -s -p "debug command"
```

**注意:** 如果您在项目的 `.env` 文件中有
`DEBUG=true`，由于自动排除，它不会影响 gemini-cli。使用 `.gemini/.env`
文件进行 gemini-cli 特定的调试设置。

### 检查沙盒

```bash
# 检查环境
gemini -s -p "run shell command: env | grep SANDBOX"

# 列出挂载
gemini -s -p "run shell command: mount | grep workspace"
```

## 安全说明

- 沙盒减少但不能消除所有风险。
- 使用允许您工作的最严格的配置文件。
- 首次构建后容器开销极小。
- GUI 应用程序可能无法在沙盒中工作。

## 相关文档

- [配置](../get-started/configuration.md): 完整配置选项。
- [命令](./commands.md): 可用命令。
- [故障排除](../troubleshooting.md): 一般故障排除。
