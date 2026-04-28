import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import { getServerAuthSession } from '@/auth'
import { Layout } from '@/components/Layout'
import { SessionProviderClient } from '@/components/SessionProviderClient'
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerAuthSession()
  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className={`${plusJakarta.className} min-h-svh antialiased`}>
        <ThemeInit />
        <SessionProviderClient session={session}>
          <Layout>{children}</Layout>
        </SessionProviderClient>
      </body>
    </html>
  )
}
