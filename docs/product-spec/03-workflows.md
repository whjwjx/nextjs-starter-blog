# 开发与运维手册 (Workflows)

## 1. 开发环境 (Development)

### 常用命令
> **注意**: 本项目使用 Yarn 3.6.1，需通过 `node .yarn/releases/yarn-3.6.1.cjs` 调用。

```bash
# 启动开发服务器
node .yarn/releases/yarn-3.6.1.cjs dev

# 构建生产版本
node .yarn/releases/yarn-3.6.1.cjs build

> **注意 (Windows PowerShell)**: 如果遇到 Unbound variable "PWD" 错误，请先执行：
> ```powershell
> $env:PWD = $(Get-Location).Path
> ```
> 然后再运行构建命令。

# 运行代码检查
node .yarn/releases/yarn-3.6.1.cjs lint

# 安装依赖
node .yarn/releases/yarn-3.6.1.cjs install
```

### 端口配置
- 默认端口: `3000`
- 访问地址: `http://localhost:3000`

## 2. 内容创作流程 (Writing)

1. **新建文章**:
   在 `data/blog/` 目录下创建 `.md` 或 `.mdx` 文件。
   
2. **Frontmatter 模板 (多语言支持)**:
   ```yaml
   ---
   title: '文章标题'
   date: '2026-03-03'
   tags: ['Next.js', 'Guide']
   draft: false
   summary: '文章摘要...'
   language: 'zh-CN'  # 必填: 'en' 或 'zh-CN'
   ---
   ```

3. **多语言文章创作策略**:
   - **单文件多版本**: 在 `data/blog/` 下为同一篇文章创建不同语言版本（如 `my-post.en.mdx` 和 `my-post.zh-CN.mdx`）。
   - **Slug 匹配**: 确保同一篇文章的不同语言版本具有相同的标识符（通过 Frontmatter 字段或文件名逻辑关联）。

4. **添加图片**:
   将图片放入 `public/static/images/`，引用路径为 `/static/images/filename.png`。

## 3. 运维部署 (Operations)

### 环境变量
在 `.env` 文件中配置：
- `NEXT_PUBLIC_GISCUS_REPO`: 评论系统仓库
- `NEXT_UMAMI_ID`: 统计 ID

### Docker 部署 (可选)
参考 `faq/deploy-with-docker.md`。
