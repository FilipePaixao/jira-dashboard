import type { Metadata } from 'next'
import { Layout } from '@/components/Layout'
import './globals.css'

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
    <html lang="pt-BR">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
