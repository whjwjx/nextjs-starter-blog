import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
  locale?: string
}

const Tag = ({ text, locale }: Props) => {
  const href = locale ? `/${locale}/tags/${slug(text)}` : `/tags/${slug(text)}`
  return (
    <Link
      href={href}
      className="bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 mr-3 mb-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase transition-colors"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
