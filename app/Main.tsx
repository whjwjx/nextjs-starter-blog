import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  return (
    <>
      <div className="border-b border-gray-200 py-12 dark:border-gray-700">
        <div className="space-y-4 md:space-y-6">
          <h1 className="from-primary-600 to-primary-400 dark:from-primary-400 dark:to-primary-200 bg-linear-to-r bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl md:text-7xl">
            {siteMetadata.title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
            {siteMetadata.description}
          </p>
          <div className="flex space-x-4 pt-4">
            <Link
              href="/blog"
              className="bg-primary-500 hover:bg-primary-600 rounded-lg px-6 py-3 text-white transition-colors"
            >
              浏览文章
            </Link>
            <Link
              href="/about"
              className="border-gray-200 hover:border-primary-500 dark:border-gray-700 dark:hover:border-primary-400 rounded-lg border px-6 py-3 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="pt-12 pb-8 md:space-y-5">
          <h2 className="text-2xl leading-9 font-bold tracking-tight text-gray-900 sm:text-3xl sm:leading-10 md:text-4xl dark:text-gray-100">
            最新发布
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-1 md:gap-6">
          {!posts.length && '未发现任何文章。'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <article
                key={slug}
                className="group relative flex flex-col space-y-2 rounded-2xl p-6 transition-all hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              >
                <div className="flex flex-col space-y-3">
                  <dl>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-sm leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-3">
                    <h2 className="text-2xl leading-8 font-bold tracking-tight">
                      <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                        {title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                    <div className="prose max-w-none text-gray-600 dark:text-gray-400">
                      {summary}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="所有文章"
          >
            所有文章 &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
