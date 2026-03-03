'use client'

import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'
import { SearchProvider, SearchConfig } from 'pliny/search'

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme} enableSystem>
      <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>{children}</SearchProvider>
    </ThemeProvider>
  )
}
