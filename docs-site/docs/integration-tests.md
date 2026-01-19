# 集成测试

本文档提供了有关本项目中使用的集成测试框架的信息。

## 概览

集成测试旨在验证 Gemini
CLI 的端到端功能。它们在受控环境中执行构建的二进制文件，并验证其在与文件系统交互时的行为是否符合预期。

这些测试位于 `integration-tests` 目录中，并使用自定义测试运行器运行。

## 构建测试

在运行任何集成测试之前，您需要创建一个实际要测试的发布包：

```bash
npm run bundle
```

在对 CLI 源代码进行任何更改后，您必须重新运行此命令，但在更改测试后无需重新运行。

## 运行测试

集成测试不作为默认 `npm run test` 命令的一部分运行。它们必须使用
`npm run test:integration:all` 脚本显式运行。

集成测试也可以使用以下快捷方式运行：

```bash
npm run test:e2e
```

## 运行特定的一组测试

要运行测试文件的子集，您可以使用
`npm run <integration test command> <file_name1> ....`，其中 &lt;integration
test command&gt; 是 `test:e2e` 或 `test:integration*`，而 `<file_name>` 是
`integration-tests/` 目录中的任何 `.test.js` 文件。例如，以下命令运行
`list_directory.test.js` 和 `write_file.test.js`：

```bash
npm run test:e2e list_directory write_file
```

### 按名称运行单个测试

要按名称运行单个测试，请使用 `--test-name-pattern` 标志：

```bash
npm run test:e2e -- --test-name-pattern "reads a file"
```

### 重新生成模型响应

一些集成测试使用伪造的模型响应，随着实现的更改，这些响应可能需要不时重新生成。

要重新生成这些黄金文件 (golden files)，请在运行测试时将
`REGENERATE_MODEL_GOLDENS` 环境变量设置为 "true"，例如：

**警告**：如果在本地运行，您应该检查这些更新后的响应，以确保 Gemini 在这些响应中没有包含任何关于您或您的系统的信息。

```bash
REGENERATE_MODEL_GOLDENS="true" npm run test:e2e
```

**警告**：确保在测试结束时运行 **await rig.cleanup()**，否则黄金文件将不会更新。

### 去除测试的不稳定性 (Deflaking)

在添加**新**集成测试之前，您应该使用去不稳定性脚本或工作流对其进行至少 5 次测试，以确保其不包含不稳定性。

### 去不稳定性脚本

```bash
npm run deflake -- --runs=5 --command="npm run test:e2e -- -- --test-name-pattern '<your-new-test-name>'"
```

#### 去不稳定性工作流

```bash
gh workflow run deflake.yml --ref <your-branch> -f test_name_pattern="<your-test-name-pattern>"
```

### 运行所有测试

要运行整套集成测试，请使用以下命令：

```bash
npm run test:integration:all
```

### 沙盒矩阵

`all` 命令将针对 `无沙盒`、`docker` 和 `podman`
运行测试。每种单独的类型都可以使用以下命令运行：

```bash
npm run test:integration:sandbox:none
```

```bash
npm run test:integration:sandbox:docker
```

```bash
npm run test:integration:sandbox:podman
```

## 诊断

集成测试运行器提供了几个诊断选项，以帮助追踪测试失败。

### 保留测试输出

您可以保留测试运行期间创建的临时文件以供检查。这对于调试文件系统操作问题非常有用。

要保留测试输出，请将 `KEEP_OUTPUT` 环境变量设置为 `true`。

```bash
KEEP_OUTPUT=true npm run test:integration:sandbox:none
```

当保留输出时，测试运行器将打印测试运行的唯一目录的路径。

### 详细输出

要进行更详细的调试，请将 `VERBOSE` 环境变量设置为 `true`。

```bash
VERBOSE=true npm run test:integration:sandbox:none
```

当在同一命令中使用 `VERBOSE=true` 和 `KEEP_OUTPUT=true`
时，输出将流式传输到控制台，并保存到测试临时目录中的日志文件中。

详细输出经过格式化，以清楚地识别日志来源：

```
--- TEST: <log dir>:<test-name> ---
... output from the gemini command ...
--- END TEST: <log dir>:<test-name> ---
```

## Linting 和格式化

为了确保代码质量和一致性，作为主要构建过程的一部分，会对集成测试文件进行 lint 检查。您也可以手动运行 linter 和自动修复程序。

### 运行 Linter

要检查 lint 错误，请运行以下命令：

```bash
npm run lint
```

您可以在命令中包含 `:fix` 标志以自动修复任何可修复的 lint 错误：

```bash
npm run lint:fix
```

## 目录结构

集成测试在 `.integration-tests`
目录中为每个测试运行创建一个唯一的目录。在此目录中，为每个测试文件创建一个子目录，并在其中为每个单独的测试用例创建一个子目录。

这种结构使得查找特定测试运行、文件或用例的工件变得容易。

```
.integration-tests/
└── <run-id>/
    └── <test-file-name>.test.js/
        └── <test-case-name>/
            ├── output.log
            └── ...other test artifacts...
```

## 持续集成

为了确保始终运行集成测试，在 `.github/workflows/chained_e2e.yml`
中定义了一个 GitHub Actions 工作流。此工作流会自动针对 `main` 分支的 Pull
Request 运行集成测试，或者当 Pull Request 添加到合并队列时运行。

工作流在不同的沙盒环境中运行测试，以确保 Gemini CLI 在每个环境中都经过测试：

- `sandbox:none`: 在没有任何沙盒的情况下运行测试。
- `sandbox:docker`: 在 Docker 容器中运行测试。
- `sandbox:podman`: 在 Podman 容器中运行测试。
