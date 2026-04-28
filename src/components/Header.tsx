'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role
  const isLogged = Boolean(session?.user)
  const isAdmin = role === 'admin'

  function navClass(href: string) {
    const active = pathname === href || pathname.startsWith(`${href}/`)
    return `rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
      active
        ? 'bg-sauvvi/10 text-sauvvi dark:bg-sauvvi/20 dark:text-sauvvi'
        : 'text-neutral-600 hover:text-sauvvi dark:text-neutral-300 dark:hover:text-sauvvi'
    }`
  }

  return (
    <header className="sticky top-0 z-40 border-b border-secondary-light/90 bg-white/88 backdrop-blur-md dark:border-secondary-dark/80 dark:bg-[#1E1E1E]/88">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="font-brand text-lg font-semibold tracking-tight text-neutral-900 transition-colors hover:text-sauvvi dark:text-white dark:hover:text-sauvvi"
        >
          Dash Jira
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-x-1 gap-y-1">
            {isLogged ? (
              <>
                <Link className={navClass('/dashboard')} href="/dashboard">
                  Dashboard
                </Link>
                <Link className={navClass('/dashboard/consolidado')} href="/dashboard/consolidado">
                  Visão consolidada
                </Link>
                {isAdmin ? (
                  <Link className={navClass('/dashboard/pessoas')} href="/dashboard/pessoas">
                    Análise individual
                  </Link>
                ) : null}
              </>
            ) : null}
          </nav>
          {isLogged ? (
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: '/login' })}
              className="rounded-full border border-secondary-light/90 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:text-sauvvi dark:border-secondary-dark dark:text-neutral-200 dark:hover:text-sauvvi"
            >
              Sair
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-secondary-light/90 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:text-sauvvi dark:border-secondary-dark dark:text-neutral-200 dark:hover:text-sauvvi"
            >
              Entrar
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
