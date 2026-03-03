import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from '../Main'
import { Locale } from '@/dictionaries/i18n-config'
import { genPageMetadata } from 'app/seo'
import { getDictionary } from '@/dictionaries/get-dictionary'

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params
  const { locale } = params
  const dict = await getDictionary(locale)
  return genPageMetadata({ title: dict.nav.home, locale })
}

export default async function Page(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params
  const { locale } = params
  const dict = await getDictionary(locale)
  const filteredPosts = allBlogs.filter((post) => post.language === locale)
  const sortedPosts = sortPosts(filteredPosts)
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} dict={dict} locale={locale} />
}
