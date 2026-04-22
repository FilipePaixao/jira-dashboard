import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import { Layout } from '@/components/Layout'
import { ThemeInit } from '@/components/ThemeInit'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans-app',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-brand',
  weight: ['500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dash Jira',
  description: 'Dashboard gerencial de sprints Jira',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className={`${plusJakarta.className} min-h-svh antialiased`}>
        <ThemeInit />
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
