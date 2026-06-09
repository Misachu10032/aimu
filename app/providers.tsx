'use client'

import { App, ConfigProvider, theme } from 'antd'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#502cab',
            colorBgContainer: '#161618',
            colorBgElevated: '#1d1e23',
            colorBorder: '#1d1e23',
            colorBorderSecondary: '#1d1e23',
            borderRadius: 2,
            fontSize: 13,
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </I18nextProvider>
  )
}
