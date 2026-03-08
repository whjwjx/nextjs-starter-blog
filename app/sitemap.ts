import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { i18n } from '@/dictionaries/i18n-config'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${post.language}/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const routes = i18n.locales.flatMap((locale) =>
    ['', 'blog', 'projects', 'tags'].map((route) => ({
      url: `${siteUrl}/${locale}${route ? `/${route}` : ''}`,
      lastModified: new Date().toISOString().split('T')[0],
    }))
  )

  return [...routes, ...blogRoutes]
}
