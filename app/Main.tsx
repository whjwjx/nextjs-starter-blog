'use client'

import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import { useParams } from 'next/navigation'
import { Locale } from '@/dictionaries/i18n-config'
import { getDictionary } from '@/dictionaries/get-dictionary'
import { Spotlight } from '@/components/ui/Spotlight'
import { GridBackground } from '@/components/ui/GridBackground'
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card'
import { OrbitingCircles } from '@/components/magicui/orbiting-circles'
import Image from '@/components/Image'
import {
  Trae,
  Dify,
  ClaudeCode,
  OpenClaw,
  Ollama,
  Gemini,
  DeepSeek,
  ModelScope,
  OpenAI,
  MCP,
} from '@lobehub/icons'

const MAX_DISPLAY = 5

export default function Home({ posts, dict, locale }) {
  if (!dict) return null

  return (
    <>
      <div className="relative min-h-[750px] overflow-hidden border-b border-gray-200 pt-12 pb-32 dark:border-gray-700">
        <GridBackground className="min-h-[750px]">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <OrbitingCircles iconSize={50} radius={260} speed={0.8} randomSpeed>
              <Trae.Color size={50} />
              <Dify.Color size={50} />
              <ClaudeCode.Color size={50} />
              <OpenClaw.Color size={50} />
            </OrbitingCircles>
            <OrbitingCircles iconSize={40} radius={400} reverse speed={1.5} randomSpeed>
              <Ollama size={40} />
              <Gemini.Color size={40} />
              <DeepSeek.Color size={40} />
              <ModelScope.Color size={40} />
              <OpenAI size={40} />
              <MCP size={40} />
            </OrbitingCircles>
          </div>
          <CardContainer className="inter-var" containerClassName="py-10">
            <CardBody className="group/card relative h-auto w-auto rounded-xl bg-transparent p-6 dark:bg-transparent">
              <CardItem translateZ="80" className="mb-6 flex w-full justify-center">
                <Image
                  src="/static/images/avatar.png"
                  alt="avatar"
                  width={140}
                  height={140}
                  className="rounded-full border-4 border-white/50 shadow-2xl backdrop-blur-sm transition-transform duration-500 group-hover/card:scale-110 dark:border-gray-800/50"
                />
              </CardItem>
              <CardItem translateZ="50" className="w-full text-center">
                <h1 className="bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-3xl font-extrabold tracking-tighter text-transparent sm:text-5xl md:text-6xl dark:from-gray-100 dark:to-gray-400">
                  {dict.site.title}
                </h1>
              </CardItem>
              <CardItem
                as="p"
                translateZ="60"
                className="mx-auto mt-4 max-w-2xl text-center text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-gray-400"
              >
                {dict.site.description}
              </CardItem>
              <CardItem translateZ="100" className="mt-4 flex w-full justify-center space-x-4 pt-4">
                <Link
                  href={`/${locale}/blog`}
                  className="bg-primary-500 hover:bg-primary-600 rounded-lg px-6 py-3 text-white transition-colors"
                >
                  {dict.nav.blog}
                </Link>
                <Link
                  href={`/${locale}/about`}
                  className="hover:border-primary-500 dark:hover:border-primary-400 rounded-lg border border-gray-200 px-6 py-3 transition-colors dark:border-gray-700"
                >
                  {dict.nav.about}
                </Link>
              </CardItem>
            </CardBody>
          </CardContainer>
        </GridBackground>
      </div>
      <div className="space-y-4">
        <div className="pt-12 pb-8 text-center md:space-y-5">
          <h2 className="text-2xl leading-9 font-bold tracking-tight text-gray-900 sm:text-3xl sm:leading-10 md:text-4xl dark:text-gray-100">
            {dict.blog.all_posts}
          </h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-1 md:gap-6">
          {!posts.length && dict.blog.no_posts}
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
                      <time dateTime={date}>{formatDate(date, locale)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-3">
                    <h2 className="text-2xl leading-8 font-bold tracking-tight">
                      <Link
                        href={`/${locale}/blog/${slug}`}
                        className="text-gray-900 dark:text-gray-100"
                      >
                        {title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} locale={locale} />
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
        <div className="flex justify-center text-base leading-6 font-medium">
          <Link
            href={`/${locale}/blog`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={dict.blog.all_posts}
          >
            {dict.blog.all_posts} &rarr;
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
