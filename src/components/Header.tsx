import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="border-b border-secondary-light/90 bg-white/90 backdrop-blur-md dark:border-secondary-dark/80 dark:bg-[#1E1E1E]/90">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="font-brand text-lg font-semibold tracking-tight text-neutral-900 transition-colors hover:text-sauvvi dark:text-white dark:hover:text-sauvvi"
        >
          Dash Jira
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
            <Link
              className="text-neutral-600 transition-colors duration-200 hover:text-sauvvi dark:text-neutral-300 dark:hover:text-sauvvi"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="text-neutral-600 transition-colors duration-200 hover:text-sauvvi dark:text-neutral-300 dark:hover:text-sauvvi"
              href="/dashboard/consolidado"
            >
              Visão consolidada
            </Link>
            <Link
              className="text-neutral-600 transition-colors duration-200 hover:text-sauvvi dark:text-neutral-300 dark:hover:text-sauvvi"
              href="/dashboard/pessoas"
            >
              Análise individual
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
