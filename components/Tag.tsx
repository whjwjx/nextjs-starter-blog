import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/tags/${slug(text)}`}
      className="bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 mr-3 mb-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
