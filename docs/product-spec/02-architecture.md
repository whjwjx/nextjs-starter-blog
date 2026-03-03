# 架构设计 (Architecture)

## 1. 目录结构解析

```text
root/
├── app/                 # Next.js App Router (路由定义)
│   ├── [locale]/        # 多语言根路由 (i18n 模式)
│   │   ├── blog/        # 博客详情页与列表页
│   │   ├── tags/        # 标签聚合页
│   │   └── layout.tsx   # 语言感知布局 (Header, Footer)
│   ├── api/             # 后端 API (如 Newsletter)
│   └── middleware.ts    # 语言检测与重定向中间件
├── dictionaries/        # i18n 翻译字典 (en.json, zh-CN.json)
├── components/          # 通用 UI 组件 (原子组件)
├── data/                # 静态数据源 (Markdown 文件, JSON 配置)
│   ├── blog/            # 文章存放处 (支持子目录或 Frontmatter 语言标识)
│   └── siteMetadata.js  # 站点核心配置
├── layouts/             # 页面级布局模板 (复用性高)
├── public/              # 静态资源 (图片, favicon)
└── contentlayer.config.ts # 内容模型定义 (需增加 language 字段)
```

## 2. 数据流向 (Data Flow)

### 2.1 博客文章渲染流程 (i18n 增强版)
1. **源文件 (Source)**: 作者在 `data/blog/*.mdx` 编写文章，并在 Frontmatter 指定 `language` (如 `zh-CN`)。
2. **构建 (Build)**: `contentlayer` 监听文件变化，解析 Frontmatter 和 MDX 内容。
3. **生成 (Generate)**: 生成包含语言元数据的 JSON 数据。
4. **导入 (Import)**: Next.js 页面 (`app/[locale]/blog/[...slug]/page.tsx`) 根据当前 `[locale]` 过滤并导入对应的文章。
5. **渲染 (Render)**: 加载对应的语言字典，通过 `<MDXLayoutRenderer>` 组件渲染最终 HTML。

### 2.2 搜索机制
- 构建时生成 `search.json`，需支持按语言过滤搜索结果。
- 客户端加载 JSON，通过 `kbar` 实现前端模糊搜索。

## 3. i18n 核心机制
- **路由转换**: 根路径 `/` 通过 `middleware.ts` 自动分流至 `/en` 或 `/zh-CN`。
- **状态同步**: 语言切换组件通过路由跳转 (`/zh-CN` -> `/en`) 实现，无需复杂的全局状态管理。
- **内容匹配**: 优先显示当前语言内容；若无对应翻译，可选择回退至默认语言 (English)。

## 4. 部署架构
- **平台**: Vercel (推荐) 或 静态服务器 (Docker/Nginx)。
- **CI/CD**: GitHub Actions (`.github/workflows/pages.yml`) 负责构建和部署到 GitHub Pages (当前配置)。
