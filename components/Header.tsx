import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Image from './Image'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LanguageSwitch from './LanguageSwitch'
import { TypingAnimation } from './magicui/typing-animation'
import { Locale, Dictionary } from '@/dictionaries/i18n-config'

const Header = ({ dict, locale }: { dict: Dictionary; locale: Locale }) => {
  let headerClass = 'flex items-center w-full bg-white dark:bg-gray-950 justify-between py-10'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      <Link href={`/${locale}`} aria-label={siteMetadata.headerTitle}>
        <div className="flex items-center justify-between group">
          <div className="mr-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/static/images/avatar.png"
              alt="logo"
              width={42}
              height={42}
              className="rounded-full border-2 border-primary-500/20 p-0.5 dark:border-primary-400/20"
            />
          </div>
          {typeof siteMetadata.headerTitle === 'string' ? (
            <TypingAnimation
              as="div"
              cursorStyle="underscore"
              className="hidden h-6 text-2xl font-bold tracking-tight sm:block transition-colors group-hover:text-primary-500 dark:group-hover:text-primary-400"
              loop={false}
              duration={150}
            >
              {siteMetadata.headerTitle}
            </TypingAnimation>
          ) : (
            siteMetadata.headerTitle
          )}
        </div>
      </Link>
      <div className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6">
        <div className="no-scrollbar hidden max-w-40 items-center gap-x-4 overflow-x-auto sm:flex md:max-w-72 lg:max-w-96">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => {
              const href = link.href === '/' ? `/${locale}` : `/${locale}${link.href}`
              // Map the href to dictionary key
              const navKey = link.href.replace('/', '') || 'home'
              const title = dict.nav[navKey] || link.title

              return (
                <Link
                  key={link.title}
                  href={href}
                  className="hover:text-primary-500 dark:hover:text-primary-400 m-1 font-medium text-gray-900 dark:text-gray-100"
                >
                  {title}
                </Link>
              )
            })}
        </div>
        <SearchButton />
        <LanguageSwitch />
        <ThemeSwitch />
        <MobileNav dict={dict} locale={locale} />
      </div>
    </header>
  )
}

export default Header
