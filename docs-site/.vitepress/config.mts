import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Gemini CLI 中文文档",
  description: "Google Gemini CLI 的非官方中文文档与指南",
  lang: 'zh-CN',
  lastUpdated: true,
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/docs/get-started/' },
      { text: '变更日志', link: '/docs/changelogs/' },
      { text: 'GitHub', link: 'https://github.com/google/gemini-cli' }
    ],

    sidebar: [
      {
        text: "概览",
        items: [
          { text: "简介", link: "/docs/index" },
          { text: "架构概览", link: "/docs/architecture" },
          { text: "贡献指南", link: "/docs/CONTRIBUTING" }
        ]
      },
      {
        text: "变更日志",
        items: [
          { text: "发布说明", link: "/docs/changelogs/" },
          { text: "最新稳定版", link: "/docs/changelogs/latest" },
          { text: "预览版", link: "/docs/changelogs/preview" },
          { text: "完整日志", link: "/docs/changelogs/releases" }
        ]
      },
      {
        text: "快速开始",
        items: [
          { text: "Gemini CLI 快速入门", link: "/docs/get-started/index" },
          { text: "Gemini 3 与 Gemini CLI", link: "/docs/get-started/gemini-3" },
          { text: "身份验证", link: "/docs/get-started/authentication" },
          { text: "配置", link: "/docs/get-started/configuration" },
          { text: "安装", link: "/docs/get-started/installation" },
          { text: "示例", link: "/docs/get-started/examples" }
        ]
      },
      {
        text: "CLI",
        items: [
          { text: "简介", link: "/docs/cli/index" },
          { text: "命令", link: "/docs/cli/commands" },
          { text: "检查点 (Checkpointing)", link: "/docs/cli/checkpointing" },
          { text: "自定义命令", link: "/docs/cli/custom-commands" },
          { text: "企业版", link: "/docs/cli/enterprise" },
          { text: "无头模式 (Headless)", link: "/docs/cli/headless" },
          { text: "快捷键", link: "/docs/cli/keyboard-shortcuts" },
          { text: "模型选择", link: "/docs/cli/model" },
          { text: "沙盒", link: "/docs/cli/sandbox" },
          { text: "Agent 技能", link: "/docs/cli/skills" },
          { text: "设置", link: "/docs/cli/settings" },
          { text: "遥测", link: "/docs/cli/telemetry" },
          { text: "主题", link: "/docs/cli/themes" },
          { text: "Token 缓存", link: "/docs/cli/token-caching" },
          { text: "受信任文件夹", link: "/docs/cli/trusted-folders" },
          { text: "教程", link: "/docs/cli/tutorials" },
          { text: "卸载", link: "/docs/cli/uninstall" },
          { text: "系统提示词覆盖", link: "/docs/cli/system-prompt" }
        ]
      },
      {
        text: "核心 (Core)",
        items: [
          { text: "简介", link: "/docs/core/index" },
          { text: "工具 API", link: "/docs/core/tools-api" },
          { text: "内存导入 (Memport)", link: "/docs/core/memport" },
          { text: "策略引擎", link: "/docs/core/policy-engine" }
        ]
      },
      {
        text: "工具 (Tools)",
        items: [
          { text: "简介", link: "/docs/tools/index" },
          { text: "文件系统", link: "/docs/tools/file-system" },
          { text: "Shell", link: "/docs/tools/shell" },
          { text: "Web 请求", link: "/docs/tools/web-fetch" },
          { text: "Web 搜索", link: "/docs/tools/web-search" },
          { text: "记忆", link: "/docs/tools/memory" },
          { text: "待办事项", link: "/docs/tools/todos" },
          { text: "MCP 服务器", link: "/docs/tools/mcp-server" }
        ]
      },
      {
        text: "扩展 (Extensions)",
        items: [
          { text: "简介", link: "/docs/extensions/index" },
          { text: "扩展开发入门", link: "/docs/extensions/getting-started-extensions" },
          { text: "发布扩展", link: "/docs/extensions/extension-releasing" }
        ]
      },
      {
        text: "Hooks",
        items: [
          { text: "简介", link: "/docs/hooks/index" },
          { text: "编写 Hooks", link: "/docs/hooks/writing-hooks" },
          { text: "最佳实践", link: "/docs/hooks/best-practices" }
        ]
      },
      {
        text: "IDE 集成",
        items: [
          { text: "简介", link: "/docs/ide-integration/index" },
          { text: "IDE 配套扩展规范", link: "/docs/ide-integration/ide-companion-spec" }
        ]
      },
      {
        text: "开发 (Development)",
        items: [
          { text: "NPM 结构", link: "/docs/npm" },
          { text: "发布流程", link: "/docs/releases" },
          { text: "集成测试", link: "/docs/integration-tests" },
          { text: "Issue 与 PR 自动化", link: "/docs/issue-and-pr-automation" }
        ]
      },
      {
        text: "支持",
        items: [
          { text: "常见问题 (FAQ)", link: "/docs/faq" },
          { text: "故障排除", link: "/docs/troubleshooting" },
          { text: "配额与定价", link: "/docs/quota-and-pricing" },
          { text: "服务条款与隐私", link: "/docs/tos-privacy" }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/google/gemini-cli' }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    editLink: {
      pattern: 'https://github.com/google/gemini-cli/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
})