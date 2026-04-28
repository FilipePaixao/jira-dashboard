import type { ReactNode } from 'react'
import { Header } from './Header'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="mesh-page-bg animate-theme-veil flex min-h-svh flex-col bg-background-light text-neutral-900 app-theme-transition dark:bg-background-dark dark:text-white">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  )
}
