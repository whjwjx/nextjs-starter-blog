'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { i18n, Locale } from '@/dictionaries/i18n-config'

const LanguageSwitch = () => {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as Locale

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return

    // Replace the locale in the pathname
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPathname = segments.join('/')

    // Set cookie for middleware
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`

    router.push(newPathname)
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`text-sm font-medium ${
          locale === 'en' ? 'text-primary-500' : 'hover:text-primary-500 text-gray-500'
        }`}
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => handleLanguageChange('zh-CN')}
        className={`text-sm font-medium ${
          locale === 'zh-CN' ? 'text-primary-500' : 'hover:text-primary-500 text-gray-500'
        }`}
      >
        中文
      </button>
    </div>
  )
}

export default LanguageSwitch
