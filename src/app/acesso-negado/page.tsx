import Link from 'next/link'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstString(v: string | string[] | undefined): string {
  if (typeof v === 'string') {
    return v
  }
  if (Array.isArray(v) && v[0] !== undefined) {
    return String(v[0])
  }
  return ''
}

export default async function AcessoNegadoPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const from = firstString(sp.from)

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4">
      <div className="w-full rounded-3xl border border-secondary-light/90 bg-white/95 p-8 text-center shadow-sm dark:border-secondary-dark dark:bg-[#1a1a1a]/95">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-amber-300/70 bg-amber-50 dark:border-amber-800/70 dark:bg-amber-950/35">
          <span className="animate-denied-lock text-3xl" aria-hidden>
            🔒
          </span>
        </div>

        <h1 className="font-brand text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Acesso negado
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          Sua conta não possui autorização para acessar esta área.
        </p>
        {from ? (
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Recurso solicitado: <code className="rounded bg-surface-light px-1 py-0.5 dark:bg-[#252525]">{from}</code>
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-sauvvi px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d42820]"
          >
            Voltar ao dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-secondary-light/90 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:text-sauvvi dark:border-secondary-dark dark:text-neutral-200 dark:hover:text-sauvvi"
          >
            Trocar usuário
          </Link>
        </div>
      </div>
    </section>
  )
}
