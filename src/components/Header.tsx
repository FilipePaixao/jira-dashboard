import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Dash Jira
        </Link>
        <nav className="flex gap-4 text-sm font-medium">
          <Link className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" href="/dashboard">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}
