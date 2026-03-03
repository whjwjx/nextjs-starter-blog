import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { Locale } from '@/dictionaries/i18n-config'
import { getDictionary } from '@/dictionaries/get-dictionary'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params
  const { locale } = params
  const dict = await getDictionary(locale)
  return genPageMetadata({ title: dict.nav.blog, locale })
}

export default async function BlogPage(props: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ page: string }>
}) {
  const params = await props.params
  const { locale } = params
  const dict = await getDictionary(locale)
  const filteredPosts = allBlogs.filter((post) => post.language === locale)
  const posts = allCoreContent(sortPosts(filteredPosts))
  const pageNumber = 1
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
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
      dict={dict}
      locale={locale}
    />
  )
}
