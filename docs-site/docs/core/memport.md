# 记忆导入处理器

记忆导入处理器是一项功能，允许您通过使用 `@file.md`
语法从其他文件导入内容来模块化您的 GEMINI.md 文件。

## 概览

此功能使您能够将大型 GEMINI.md 文件分解为更小、更易于管理的组件，这些组件可以在不同上下文中重用。导入处理器支持相对路径和绝对路径，并具有内置的安全功能，以防止循环导入并确保文件访问安全。

## 语法

使用 `@` 符号后跟您要导入的文件的路径：

```markdown
# 主 GEMINI.md 文件

这是主要内容。

@./components/instructions.md

更多内容在这里。

@./shared/configuration.md
```

## 支持的路径格式

### 相对路径

- `@./file.md` - 从同一目录导入
- `@../file.md` - 从父目录导入
- `@./components/file.md` - 从子目录导入

### 绝对路径

- `@/absolute/path/to/file.md` - 使用绝对路径导入

## 示例

### 基本导入

```markdown
# 我的 GEMINI.md

欢迎来到我的项目！

@./get-started.md

## 功能

@./features/overview.md
```

### 嵌套导入

导入的文件本身可以包含导入，从而创建嵌套结构：

```markdown
# main.md

@./header.md @./content.md @./footer.md
```

```markdown
# header.md

# 项目标题

@./shared/title.md
```

## 安全功能

### 循环导入检测

处理器自动检测并防止循环导入：

```markdown
# file-a.md

@./file-b.md
```

```markdown
# file-b.md

@./file-a.md <!-- 这将被检测并阻止 -->
```

### 文件访问安全

`validateImportPath`
函数确保仅允许从指定目录导入，防止访问允许范围之外的敏感文件。

### 最大导入深度

为了防止无限递归，有一个可配置的最大导入深度（默认：5 层）。

## 错误处理

### 缺少文件

如果引用的文件不存在，导入将优雅地失败，并在输出中带有错误注释。

### 文件访问错误

权限问题或其他文件系统错误通过适当的错误消息优雅地处理。

## 代码区域检测

导入处理器使用 `marked` 库来检测代码块和内联代码范围，确保这些区域内的 `@`
导入被正确忽略。这为嵌套代码块和复杂的 Markdown 结构提供了强大的处理能力。

## 导入树结构

处理器返回一个显示导入文件层级的导入树，类似于 Claude 的 `/memory`
功能。这通过显示哪些文件被读取及其导入关系，帮助用户调试 GEMINI.md 文件的问题。

示例树结构：

```
Memory Files
 L project: GEMINI.md
            L a.md
              L b.md
                L c.md
              L d.md
                L e.md
                  L f.md
            L included.md
```

该树保留了文件导入的顺序，并显示完整的导入链以进行调试。

## 与 Claude Code 的 `/memory` (`claude.md`) 方法的比较

Claude Code 的 `/memory` 功能（见于
`claude.md`）通过连接所有包含的文件生成一个平坦的线性文档，始终用清晰的注释和路径名标记文件边界。它没有显式呈现导入层级，但 LLM 接收所有文件内容和路径，这足以在需要时重建层级。

> [!NOTE] 导入树主要是为了开发期间的清晰度，与 LLM 消费的相关性有限。

## API 参考

### `processImports(content, basePath, debugMode?, importState?)`

处理 GEMINI.md 内容中的导入语句。

**参数:**

- `content` (string): 要处理导入的内容
- `basePath` (string): 当前文件所在的目录路径
- `debugMode` (boolean, 可选): 是否启用调试日志记录（默认：false）
- `importState` (ImportState, 可选): 用于循环导入预防的状态跟踪

**返回:** Promise&lt;ProcessImportsResult&gt; - 包含处理后的内容和导入树的对象

### `ProcessImportsResult`

```typescript
interface ProcessImportsResult {
  content: string; // 已解析导入的处理后内容
  importTree: MemoryFile; // 显示导入层级的树结构
}
```

### `MemoryFile`

```typescript
interface MemoryFile {
  path: string; // 文件路径
  imports?: MemoryFile[]; // 直接导入，按导入顺序排列
}
```

### `validateImportPath(importPath, basePath, allowedDirectories)`

验证导入路径以确保它们是安全的并且在允许的目录内。

**参数:**

- `importPath` (string): 要验证的导入路径
- `basePath` (string): 用于解析相对路径的基本目录
- `allowedDirectories` (string[]): 允许的目录路径数组

**返回:** boolean - 导入路径是否有效

### `findProjectRoot(startDir)`

通过从给定的起始目录向上搜索 `.git`
目录来查找项目根目录。使用非阻塞文件系统 API 实现为 **async**
函数，以避免阻塞 Node.js 事件循环。

**参数:**

- `startDir` (string): 开始搜索的目录

**返回:** Promise&lt;string&gt; - 项目根目录（如果未找到 `.git`，则为起始目录）

## 最佳实践

1. **使用描述性文件名** 用于导入的组件
2. **保持导入浅层** - 避免深度嵌套的导入链
3. **记录您的结构** - 保持清晰的导入文件层级
4. **测试您的导入** - 确保所有引用的文件都存在且可访问
5. **尽可能使用相对路径** 以获得更好的可移植性

## 故障排除

### 常见问题

1. **导入不起作用**: 检查文件是否存在且路径正确
2. **循环导入警告**: 检查您的导入结构是否存在循环引用
3. **权限错误**: 确保文件可读且在允许的目录内
4. **路径解析问题**: 如果相对路径无法正确解析，请使用绝对路径

### 调试模式

启用调试模式以查看导入过程的详细日志记录：

```typescript
const result = await processImports(content, basePath, true);
```
