import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { slug } from 'github-slugger'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import { Locale } from '@/dictionaries/i18n-config'
import { getDictionary } from '@/dictionaries/get-dictionary'

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params
  const { locale } = params
  const dict = await getDictionary(locale)
  return genPageMetadata({ title: dict.nav.tags, description: dict.nav.tags, locale })
}

export default async function Page(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params
  const { locale } = params
  const dict = await getDictionary(locale)

  const filteredPosts = allBlogs.filter((post) => post.language === locale)
  const tagCounts: Record<string, number> = {}
  filteredPosts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        const formattedTag = slug(tag)
        if (formattedTag in tagCounts) {
          tagCounts[formattedTag] += 1
        } else {
          tagCounts[formattedTag] = 1
        }
      })
    }
  })

  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  return (
    <>
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0 dark:divide-gray-700">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
            {dict.nav.tags}
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
          {tagKeys.length === 0 && dict.blog.no_posts}
          {sortedTags.map((t) => {
            return (
              <div key={t} className="mt-2 mr-5 mb-2">
                <Tag text={t} locale={locale} />
                <Link
                  href={`/${locale}/tags/${slug(t)}`}
                  className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
                  aria-label={`View posts tagged ${t}`}
                >
                  {` (${tagCounts[t]})`}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
