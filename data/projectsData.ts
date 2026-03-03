interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Record<string, Project[]> = {
  en: [
    {
      title: 'A Search Engine',
      description: `What if you could look up any information in the world? Webpages, images, videos
      and more. Google has many features to help you find exactly what you're looking
      for.`,
      imgSrc: '/static/images/google.png',
      href: 'https://www.google.com',
    },
    {
      title: 'The Time Machine',
      description: `Imagine being able to travel back in time or to the future. Simple turn the knob
      to the desired date and press "Go". No more worrying about lost keys or
      forgotten headphones with this simple yet affordable solution.`,
      imgSrc: '/static/images/time-machine.jpg',
      href: '/blog/the-time-machine',
    },
  ],
  'zh-CN': [
    {
      title: '搜索引擎',
      description: `如果你可以查找世界上任何信息会怎样？网页、图像、视频等等。Google 具有许多功能，可帮助你准确找到所需内容。`,
      imgSrc: '/static/images/google.png',
      href: 'https://www.google.com',
    },
    {
      title: '时光机',
      description: `想象一下能够回到过去或前往未来。只需将旋钮转到所需日期并按“开始”即可。有了这个简单且经济实惠的解决方案，再也不用担心丢失钥匙或忘记耳机了。`,
      imgSrc: '/static/images/time-machine.jpg',
      href: '/blog/the-time-machine',
    },
  ],
}

export default projectsData
