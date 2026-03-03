import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './dictionaries/i18n-config'

function getLocale(request: NextRequest): string | undefined {
  // Check for locale in cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && i18n.locales.includes(localeCookie as any)) {
    return localeCookie
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim())
      .find((lang) => i18n.locales.includes(lang as any))
    if (preferredLocale) return preferredLocale
  }

  return i18n.defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip if pathname is for static files or api
  if (
    [
      '/static',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
      '/feed.xml',
      '/manifest.json',
    ].some((path) => pathname.startsWith(path)) ||
    pathname.includes('.') // skip files like .png, .jpg, .css etc
  ) {
    return
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)

    // e.g. incoming is /products
    // The new URL is now /en/products
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    )
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
