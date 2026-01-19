# Gemini CLI 示例

不知道从哪里开始使用 Gemini CLI？本文档涵盖了如何使用 Gemini
CLI 完成各种任务的示例。

**注意：** 结果仅为展示潜在用例的示例。您的实际结果可能会有所不同。

## 根据内容重命名照片

场景：您的文件夹包含以下文件：

```bash
photos/photo1.png
photos/photo2.png
photos/photo3.png
```

给 Gemini 发送以下提示词：

```cli
Rename the photos in my "photos" directory based on their contents.
```

结果：Gemini 将请求重命名文件的权限。

选择 **Allow once**（允许一次），您的文件将被重命名：

```bash
photos/yellow_flowers.png
photos/antique_dresser.png
photos/green_android_robot.png
```

## 通过阅读代码解释仓库

场景：您想通过检查代码而不仅仅是 README 来了解一个流行的开源实用程序是如何工作的。

给 Gemini CLI 发送以下提示词：

```cli
Clone the 'chalk' repository from https://github.com/chalk/chalk, read its key source files, and explain how it works.
```

结果：Gemini 将执行一系列操作来回答您的请求。

1.  首先，它会请求运行 `git clone` 以下载仓库的权限。
2.  接下来，它会找到重要的源文件并请求读取它们的权限。
3.  最后，在分析代码后，它将提供一个摘要。

Gemini CLI 将返回基于实际源代码的解释：

```markdown
`chalk`
库是一个流行的 npm 包，用于使用颜色设置终端输出样式。经过分析源代码，其工作原理如下：

- **核心功能：** 主文件设置了一个可链式调用的 API。每种颜色或修饰符（如 `bold`
  或 `italic`）都是一个 getter，它将相应的 ANSI 转义码附加到内部栈中。

- **链式 API：** 当您调用 `chalk.red.bold('Hello')` 时，您正在访问 getter。`red`
  getter 添加红色代码，`bold` getter 添加粗体代码。

- **输出生成：** 当链被视为字符串时（例如，在 `console.log` 中），会调用最终的
  `toString()`
  方法。此方法连接所有存储的 ANSI 代码，将它们包裹在输入字符串（'Hello'）周围，并在末尾添加重置代码。这生成了终端可以渲染的最终样式化字符串。
```

## 将两个电子表格合并为一个

场景：您有两个 .csv 文件：`Revenue - 2023.csv` 和
`Revenue - 2024.csv`。每个文件包含每月的收入数据，如下所示：

```csv
January,0
February,0
March,0
April,900
May,1000
June,1000
July,1200
August,1800
September,2000
October,2400
November,3400
December,2100
```

您想将这两个 .csv 文件合并为一个 .csv 文件。

给 Gemini CLI 发送以下提示词：

```cli
Combine the two .csv files into a single .csv file, with each year a different column.
```

结果：Gemini
CLI 将读取每个文件，然后请求写入新文件的权限。提供您的许可后，Gemini
CLI 将提供以下 .csv：

```csv
Month,2023,2024
January,0,1000
February,0,1200
March,0,2400
April,900,500
May,1000,800
June,1000,900
July,1200,1000
August,1800,400
September,2000,2000
October,2400,3400
November,3400,1800
December,2100,9000
```

## 运行单元测试

场景：您编写了一个简单的登录页面。您希望编写单元测试以确保您的登录页面具有代码覆盖率。

给 Gemini CLI 发送以下提示词：

```cli
Write unit tests for Login.js.
```

结果：Gemini CLI 将请求写入新文件的权限，并为您的登录页面创建一个测试。

```javascript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

// Mock the API call for login
jest.mock('./api', () => ({
  login: jest.fn(),
}));

describe('Login component', () => {
  it('renders the login form correctly', () => {
    const { getByLabelText, getByText } = render(<Login />);

    expect(getByLabelText('Username')).toBeInTheDocument();
    expect(getByLabelText('Password')).toBeInTheDocument();
    expect(getByText('Login')).toBeInTheDocument();
  });

  it('shows an error message with invalid credentials', async () => {
    const { getByLabelText, getByText, findByText } = render(<Login />);
    const usernameInput = getByLabelText('Username');
    const passwordInput = getByLabelText('Password');
    const loginButton = getByText('Login');

    // Mock the API to return an error
    require('./api').login.mockRejectedValue(new Error('Invalid credentials'));

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    const errorMessage = await findByText('Invalid credentials');
    expect(errorMessage).toBeInTheDocument();
  });

  it('logs in successfully with valid credentials', async () => {
    const onLoginSuccess = jest.fn();
    const { getByLabelText, getByText } = render(
      <Login onLoginSuccess={onLoginSuccess} />,
    );
    const usernameInput = getByLabelText('Username');
    const passwordInput = getByLabelText('Password');
    const loginButton = getByText('Login');

    // Mock the API to return a success message
    require('./api').login.mockResolvedValue({ success: true });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });

  it('disables the submit button while submitting', async () => {
    const { getByLabelText, getByText } = render(<Login />);
    const usernameInput = getByLabelText('Username');
    const passwordInput = getByLabelText('Password');
    const loginButton = getByText('Login');

    // Mock the API to have a delay
    require('./api').login.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 1000),
        ),
    );

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();

    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });
});
```
