import type { ReactNode } from 'react'
import { Header } from './Header'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="mesh-page-bg flex min-h-svh flex-col bg-white text-neutral-900 dark:bg-[#121212] dark:text-white">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  )
}
