'use client'

import { useTranslation } from 'react-i18next'

export function FooterTip() {
  const { t } = useTranslation()
  return (
    <div className="pointer-events-none absolute bottom-0.5 left-[2.5%] origin-left scale-90 text-xs text-white/20">
      {t('task.footerTip')}
    </div>
  )
}
