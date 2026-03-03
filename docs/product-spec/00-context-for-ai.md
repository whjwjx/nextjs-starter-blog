# AI 上下文指南 (AI Context Guide)

> **AI 助手指令**: 在开始任何新任务之前，请**首先**阅读此文件，以理解项目背景、约束条件和开发规范。

## 1. 项目概览
- **项目名称**: Hua Jiang Blog (基于 `tailwind-nextjs-starter-blog`)
- **项目类型**: 个人博客 / 作品集 / 技术文档
- **核心目标**:
  - 展示技术能力 (AI 全栈)。
  - 分享知识 (基于 Markdown/MDX)。
  - 高性能与 SEO 优化。

## 2. 核心技术栈
- **框架**: Next.js 15.5 (App Router)
- **i18n**: 动态路由 `[locale]` + 翻译字典 (dictionaries)
- **语言**: TypeScript 5.x
- **样式**: Tailwind CSS 4.x
- **内容处理**: Contentlayer2 (MDX 处理)
- **状态管理**: React Context / Hooks (极简全局状态)
- **包管理器**: Yarn 3.6.1 (使用方式: `node .yarn/releases/yarn-3.6.1.cjs`)

## 3. 关键配置文件
| 文件路径 | 用途 |
| :--- | :--- |
| `data/siteMetadata.js` | **全局配置**: 标题、作者、社交链接、分析、评论配置。 |
| `contentlayer.config.ts` | **内容模型**: 定义 MDX 文档类型 (Blog, Authors)。 |
| `next.config.js` | **构建配置**: CSP, Headers, Webpack 插件。 |
| `tailwind.config.js` | **样式配置**: 颜色、排版、插件 (v4 版本主要隐式处理或通过 postcss)。 |

## 4. 编码规范
- **语言**: 注释和文档必须使用 **简体中文 (zh-CN)**。
- **路径别名**: 使用绝对路径导入 (例如 `import X from '@/components/X'`)，如果未配置则遵循现有模式。
- **组件结构**:
  - `components/`: 可复用 UI 组件 (Card, Tag 等)。
  - `layouts/`: 页面布局 (ListLayout, PostLayout)。
  - `app/`: Next.js App Router 页面。
- **严格模式**: 不要抑制 ESLint 警告；必须修复它们。

## 5. 用户规则 (记忆库)
- **角色设定**: 谨慎、诚实、“不废话”的代码助手。
- **修改策略**: 最小改动 (Minimal Diff)。除非明确要求，否则不要重构。
- **验证**: 编辑前必须验证文件是否存在。
