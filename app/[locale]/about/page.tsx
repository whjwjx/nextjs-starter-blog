import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import { Locale } from '@/dictionaries/i18n-config'
import { getDictionary } from '@/dictionaries/get-dictionary'
import { components } from '@/components/MDXComponents'

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params
  const { locale } = params
  const dict = await getDictionary(locale)
  return genPageMetadata({ title: dict.nav.about, locale })
}

export default async function Page(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params
  const { locale } = params
  const dict = await getDictionary(locale)

  // Find author for the specific language, fallback to 'default'
  const author =
    allAuthors.find((p) => p.slug === 'default' && p.language === locale) ||
    (allAuthors.find((p) => p.slug === 'default') as Authors)

  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent} title={dict.about.title}>
        <MDXLayoutRenderer code={author.body.code} components={components} />
      </AuthorLayout>
    </>
  )
}
