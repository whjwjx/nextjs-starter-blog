import type { Locale } from './i18n-config'

const dictionaries = {
  en: () => import('./en.json').then((module) => module.default),
  'zh-CN': () => import('./zh-CN.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en()
