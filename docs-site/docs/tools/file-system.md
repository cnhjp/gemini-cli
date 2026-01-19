# Gemini CLI 文件系统工具

Gemini
CLI 提供了一套全面的工具，用于与本地文件系统进行交互。这些工具允许 Gemini 模型读取、写入、列出、搜索和修改文件和目录，所有这些都在您的控制之下，并且通常对于敏感操作需要确认。

**注意:** 为了安全起见，所有文件系统工具都在
`rootDirectory`（通常是您启动 CLI 的当前工作目录）内运行。提供给这些工具的路径通常应为绝对路径，或相对于此根目录进行解析。

## 1. `list_directory` (ReadFolder)

`list_directory`
列出指定目录路径内的文件和子目录的名称。它可以选择忽略与提供的 glob 模式匹配的条目。

- **工具名称:** `list_directory`
- **显示名称:** ReadFolder
- **文件:** `ls.ts`
- **参数:**
  - `path` (string, 必需): 要列出的目录的绝对路径。
  - `ignore` (array of strings, 可选): 要从列表中排除的 glob 模式列表（例如
    `["*.log", ".git"]`）。
  - `respect_git_ignore` (boolean, 可选): 列出文件时是否遵守 `.gitignore`
    模式。默认为 `true`。
- **行为:**
  - 返回文件和目录名称的列表。
  - 指示每个条目是否为目录。
  - 对条目进行排序，目录优先，然后按字母顺序排列。
- **输出 (`llmContent`):** 类似这样的字符串:
  `Directory listing for /path/to/your/folder:\n[DIR] subfolder1\nfile1.txt\nfile2.png`
- **确认:** 否。

## 2. `read_file` (ReadFile)

`read_file` 读取并返回指定文件的内容。此工具处理文本、图像 (PNG, JPG, GIF, WEBP,
SVG, BMP)、音频文件 (MP3, WAV, AIFF, AAC, OGG,
FLAC) 和 PDF 文件。对于文本文件，它可以读取特定的行范围。通常会跳过其他二进制文件类型。

- **工具名称:** `read_file`
- **显示名称:** ReadFile
- **文件:** `read-file.ts`
- **参数:**
  - `path` (string, 必需): 要读取的文件的绝对路径。
  - `offset` (number, 可选): 对于文本文件，开始读取的基于 0 的行号。需要设置
    `limit`。
  - `limit`
    (number, 可选): 对于文本文件，要读取的最大行数。如果省略，则读取默认最大值（例如 2000 行）或整个文件（如果可行）。
- **行为:**
  - 对于文本文件：返回内容。如果使用了 `offset` 和
    `limit`，则仅返回该行切片。指示内容是否因行数限制或行长限制而被截断。
  - 对于图像、音频和 PDF 文件：以适合模型使用的 base64 编码数据结构返回文件内容。
  - 对于其他二进制文件：尝试识别并跳过它们，返回一条指示它是通用二进制文件的消息。
- **输出:** (`llmContent`):
  - 对于文本文件：文件内容，可能带有截断消息前缀（例如，`[File content truncated: showing lines 1-100 of 500 total lines...] Actual file content...`）。
  - 对于图像/音频/PDF 文件：包含带有 `mimeType` 和 base64 `data` 的 `inlineData`
    的对象（例如，`{ inlineData: { mimeType: 'image/png', data: 'base64encodedstring' } }`）。
  - 对于其他二进制文件：类似
    `Cannot display content of binary file: /path/to/data.bin` 的消息。
- **确认:** 否。

## 3. `write_file` (WriteFile)

`write_file`
将内容写入指定文件。如果文件存在，它将被覆盖。如果文件不存在，将创建它（以及任何必要的父目录）。

- **工具名称:** `write_file`
- **显示名称:** WriteFile
- **文件:** `write-file.ts`
- **参数:**
  - `file_path` (string, 必需): 要写入的文件的绝对路径。
  - `content` (string, 必需): 要写入文件的内容。
- **行为:**
  - 将提供的 `content` 写入 `file_path`。
  - 如果父目录不存在，则创建它们。
- **输出 (`llmContent`):** 成功消息，例如
  `Successfully overwrote file: /path/to/your/file.txt` 或
  `Successfully created and wrote to new file: /path/to/new/file.txt`。
- **确认:** 是。显示更改的 diff 并在写入前请求用户批准。

## 4. `glob` (FindFiles)

`glob` 查找与特定 glob 模式（例如 `src/**/*.ts`,
`*.md`）匹配的文件，返回按修改时间排序（最新的优先）的绝对路径。

- **工具名称:** `glob`
- **显示名称:** FindFiles
- **文件:** `glob.ts`
- **参数:**
  - `pattern` (string, 必需): 要匹配的 glob 模式（例如 `
