'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'

export interface PaginationProps {
  totalPages: number
  currentPage: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any
}
export interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any
  locale?: string
}

function Pagination({ totalPages, currentPage, dict }: PaginationProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const lastSegment = segments[segments.length - 1]
  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, '') // Remove trailing slash
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  const prevText = dict?.common?.prev || '上一页'
  const nextText = dict?.common?.next || '下一页'
  const pageText = dict?.common?.page_x_of_y
    ? dict.common.page_x_of_y.replace('{current}', currentPage).replace('{total}', totalPages)
    : `第 ${currentPage} 页 / 共 ${totalPages} 页`

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            {prevText}
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            {prevText}
          </Link>
        )}
        <span>{pageText}</span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            {nextText}
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            {nextText}
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  dict,
  locale = 'en',
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)

  // Filter tags by current locale (tags are stored as "locale-tagSlug")
  const localeTagKeys = tagKeys.filter((key) => key.startsWith(`${locale}-`))
  const sortedTags = localeTagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <div>
        <div className="pt-6 pb-6">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
        </div>
        <div className="flex sm:space-x-12 xl:space-x-16">
          <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-xl bg-gray-50/50 pt-5 shadow-sm sm:flex dark:bg-gray-900/30 dark:shadow-none">
            <div className="px-6 py-4">
              {pathname.startsWith(`/${locale}/blog`) || pathname === `/${locale}/blog` ? (
                <h3 className="text-primary-500 font-bold uppercase">
                  {dict?.blog?.all_posts || 'All Posts'}
                </h3>
              ) : (
                <Link
                  href={`/${locale}/blog`}
                  className="hover:text-primary-500 dark:hover:text-primary-500 font-bold text-gray-700 uppercase dark:text-gray-300"
                >
                  {dict?.blog?.all_posts || 'All Posts'}
                </Link>
              )}
              <ul>
                {sortedTags.map((t) => {
                  // Extract raw tag name from "locale-tagSlug"
                  // Actually t is just the key. The tag name is part of the key.
                  // But wait, the key is constructed from slug(tag).
                  // We need to display the original tag text?
                  // tagData keys are slugs. The original text is lost in tag-data.json.
                  // But usually tags are displayed as slugs or capitalised slugs.
                  // Let's check how it was done before.
                  // Before: {sortedTags.map((t) => <Tag key={t} text={t} />)}
                  // So `t` was the tag string.
                  // In `createTagCount`, we used `slug(tag)`. So `t` is a slug.

                  // Now `t` is `locale-slug`. We need to extract `slug`.
                  const tagSlug = t.replace(`${locale}-`, '')

                  return (
                    <li key={t} className="my-3">
                      {decodeURI(pathname.split('/tags/')[1]) === tagSlug ? (
                        <h3 className="text-primary-500 inline px-3 py-2 text-sm font-bold uppercase">
                          {`${tagSlug} (${tagCounts[t]})`}
                        </h3>
                      ) : (
                        <Link
                          href={`/${locale}/tags/${tagSlug}`}
                          className="hover:text-primary-500 dark:hover:text-primary-500 px-3 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                          aria-label={`View posts tagged ${tagSlug}`}
                        >
                          {`${tagSlug} (${tagCounts[t]})`}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <div className="flex-1">
            <ul className="space-y-4">
              {displayPosts.map((post) => {
                const { path, date, title, summary, tags } = post
                return (
                  <li key={path}>
                    <article className="group flex flex-col space-y-3 rounded-2xl p-6 transition-all hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                      <dl>
                        <dt className="sr-only">Published on</dt>
                        <dd className="text-sm leading-6 font-medium text-gray-500 dark:text-gray-400">
                          <time dateTime={date} suppressHydrationWarning>
                            {formatDate(date, locale)}
                          </time>
                        </dd>
                      </dl>
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/${locale}/${path}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {tags?.map((tag) => (
                              <Tag key={tag} text={tag} locale={locale} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-600 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                dict={dict}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
