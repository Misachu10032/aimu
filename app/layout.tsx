import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aimu - Online Subtitle Editor',
  description: 'Aimu is a free online subtitle editor that allows you to create, edit, and translate subtitles.',
  keywords: 'subtitle, editor, translate, create, edit, online, free',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark overflow-hidden">
      <head>
        <meta name="theme-color" content="#0e0e0e" />
        <link rel="stylesheet" href="/fontawesome/css/fontawesome.css" />
        <link rel="stylesheet" href="/fontawesome/css/solid.css" />
      </head>
      <body className="h-screen overflow-hidden bg-[#0e0e0e] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
