import ListLayout from '@/layouts/ListLayoutWithTags'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { Locale, i18n } from '@/dictionaries/i18n-config'
import { getDictionary } from '@/dictionaries/get-dictionary'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  const paths: { locale: string; page: string }[] = []

  i18n.locales.forEach((locale) => {
    const filteredPosts = allBlogs.filter((post) => post.language === locale)
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
    for (let i = 1; i <= totalPages; i++) {
      paths.push({ locale, page: i.toString() })
    }
  })

  return paths
}

export default async function Page(props: { params: Promise<{ locale: Locale; page: string }> }) {
  const params = await props.params
  const { locale, page } = params
  const dict = await getDictionary(locale)
  const filteredPosts = allBlogs.filter((post) => post.language === locale)
  const posts = allCoreContent(sortPosts(filteredPosts))
  const pageNumber = parseInt(page)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  // Return 404 for invalid page numbers or empty pages
  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={dict.blog.all_posts}
    />
  )
}
