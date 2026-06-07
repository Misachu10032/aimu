import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import zhCN from './locales/zh-CN'
import zhTW from './locales/zh-TW'
import ja from './locales/ja'
import ko from './locales/ko'
import th from './locales/th'

export const DEFAULT_LOCALE = 'en'

export const resources = {
  'en': { translation: en },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  'ja': { translation: ja },
  'ko': { translation: ko },
  'th': { translation: th },
}

function getInitialLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const raw = window.localStorage.getItem('option')
    if (raw) {
      const parsed = JSON.parse(raw)
      const locale = parsed?.state?.option?.i18n
      if (locale && resources[locale as keyof typeof resources]) {
        return locale
      }
    }
  }
  catch {
    // ignore malformed storage
  }
  return DEFAULT_LOCALE
}

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: getInitialLocale(),
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
  })
}

export default i18next
