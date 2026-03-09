interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Record<string, Project[]> = {
  en: [
    {
      title: 'AI-Native Developer Showcase',
      description: `A showcase of real-world AI-collaborative development, featuring engineering practices, performance data, and methodology summaries in collaboration with AI tools (Trae, OpenCode, Claude, Gemini).`,
      imgSrc: '/static/images/ai-showcase-cover.png',
      href: 'https://github.com/whjwjx/ai_showcase1',
    },
    {
      title: 'StepOne',
      description: `An AI-powered personal productivity platform that integrates note-taking and task management, aiming to reduce the cognitive cost of breaking down complex tasks.`,
      imgSrc: '/static/images/stepone-cover.png',
      href: 'https://stepone.huajiang.wang',
    },
  ],
  'zh-CN': [
    {
      title: 'AI 协同开发实战录',
      description: `本仓库是一个 AI 协同开发的展示空间，记录了与 AI（Trae, OpenCode, Claude, Gemini）深度协同的工程实践、效能数据及方法论沉淀。`,
      imgSrc: '/static/images/ai-showcase-cover.png',
      href: 'https://github.com/whjwjx/ai_showcase1',
    },
    {
      title: 'StepOne',
      description: `一款融合了“类 Flomo 笔记”与“象限清单”的个人效率工具，旨在通过 AI 技术降低用户拆解复杂任务的认知成本。`,
      imgSrc: '/static/images/stepone-cover.png',
      href: 'https://stepone.huajiang.wang',
    },
  ],
}

export default projectsData
