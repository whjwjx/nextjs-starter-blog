import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { Locale, i18n } from '@/dictionaries/i18n-config'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  const paths: { locale: string; tag: string; page: string }[] = []

  i18n.locales.forEach((locale) => {
    const filteredPosts = allBlogs.filter((post) => post.language === locale)
    const tagCounts: Record<string, number> = {}
    filteredPosts.forEach((post) => {
      if (post.tags) {
        post.tags.forEach((tag) => {
          const formattedTag = slug(tag)
          tagCounts[formattedTag] = (tagCounts[formattedTag] || 0) + 1
        })
      }
    })

    Object.keys(tagCounts).forEach((tag) => {
      const postCount = tagCounts[tag]
      const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE))
      for (let i = 1; i <= totalPages; i++) {
        paths.push({
          locale,
          tag: encodeURI(tag),
          page: (i + 1).toString(),
        })
      }
    })
  })

  return paths
}

export default async function TagPage(props: {
  params: Promise<{ locale: Locale; tag: string; page: string }>
}) {
  const params = await props.params
  const { locale, tag: tagParam, page } = params
  const tag = decodeURI(tagParam)
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  const pageNumber = parseInt(page)
  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) =>
          post.language === locale && post.tags && post.tags.map((t) => slug(t)).includes(tag)
      )
    )
  )
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)

  // Return 404 for invalid page numbers or empty pages
  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }
  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={filteredPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={title}
    />
  )
}
