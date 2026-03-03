/* eslint-disable jsx-a11y/anchor-has-content */
'use client'

import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { AnchorHTMLAttributes } from 'react'
import { useParams } from 'next/navigation'
import { Locale, i18n } from '@/dictionaries/i18n-config'

const CustomLink = ({ href, ...rest }: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const params = useParams()
  const locale = params?.locale as Locale
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  if (isInternalLink) {
    // Prefix internal links with locale if not already present
    let localizedHref = href as string
    if (locale && i18n.locales.includes(locale)) {
      const hasLocalePrefix = i18n.locales.some(
        (l) => localizedHref.startsWith(`/${l}/`) || localizedHref === `/${l}`
      )
      if (!hasLocalePrefix) {
        localizedHref = `/${locale}${localizedHref === '/' ? '' : localizedHref}`
      }
    }
    return <Link className="break-words" href={localizedHref} {...rest} />
  }

  if (isAnchorLink) {
    return <a className="break-words" href={href} {...rest} />
  }

  return (
    <a className="break-words" target="_blank" rel="noopener noreferrer" href={href} {...rest} />
  )
}

export default CustomLink
