import Link from 'next/link'

const linkBtn = `inline-flex items-center justify-center rounded-full bg-sauvvi px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(238,46,36,0.45)] transition hover:bg-[#d42820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauvvi`

const linkBtnMuted = `inline-flex items-center justify-center rounded-full border border-secondary-light/90 bg-white/95 px-6 py-3 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-sauvvi/40 hover:text-sauvvi focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauvvi dark:border-secondary-dark dark:bg-[#1E1E1E]/90 dark:text-neutral-100`

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-brand text-[2.125rem] font-semibold leading-[1.15] tracking-tight text-neutral-900 dark:text-white">
          Dash Jira
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Dashboard gerencial — dados de sprint Jira via backend e MongoDB. Escolha uma sprint na
          lista ou explore a visão consolidada.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/dashboard" className={linkBtn}>
          Dashboard da sprint
        </Link>
        <Link href="/dashboard/consolidado" className={linkBtnMuted}>
          Visão consolidada
        </Link>
        <Link href="/dashboard/pessoas" className={linkBtnMuted}>
          Análise individual
        </Link>
      </div>
    </div>
  )
}
