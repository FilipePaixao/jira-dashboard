'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'

const inputClass =
  'w-full rounded-lg border border-[#e8e8ef] bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-sauvvi dark:border-[#3a3d4a] dark:text-neutral-100 dark:placeholder:text-neutral-500'

export function LoginClient({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })
    setLoading(false)
    if (!res || res.error) {
      setError('Credenciais inválidas')
      return
    }
    router.push(res.url ?? callbackUrl)
  }

  return (
    <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-[#ececf2] bg-[#fff8f8] dark:border-[#2a2d38] dark:bg-[#12131a]">
      <div className="grid min-h-[620px] lg:grid-cols-[1fr_1.25fr]">
        <aside className="hidden border-r border-[#f0e7e7] bg-[#fff8f8] px-10 py-10 dark:border-[#2a2d38] dark:bg-[#12131a] lg:flex lg:flex-col">
          <Image
            src="/sauvvi-logo.png"
            alt="SauvviTech"
            width={168}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />

          <h2 className="mt-10 max-w-sm text-4xl font-semibold tracking-tight text-[#1f2233] dark:text-[#f1f3fb]">
            Visibilidade de sprint para decisões mais rápidas no Jira.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#646b7a] dark:text-[#a5adbf]">
            Acompanhe entrega, fluxo, previsibilidade e gargalos em um painel único para gestão de engenharia.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-[#3d4454] dark:text-[#c2c8d8]">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-sauvvi" />
              Lead time, cycle time e throughput por sprint.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-sauvvi" />
              Confiabilidade de planejamento: committed vs entregue.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-sauvvi" />
              Leitura por pessoa para identificar gargalos de fluxo.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-sauvvi" />
              Sincronização manual da sprint direto pela API interna.
            </li>
          </ul>

          <span className="mt-auto inline-flex w-fit rounded-md border border-[#f3d4d4] bg-transparent px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#bc5b5b] dark:border-[#553038] dark:text-[#f09b9b]">
            Ambiente staging
          </span>
        </aside>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-2xl border border-[#ececf2] bg-[#fff8f8] px-7 py-8 dark:border-[#2a2d38] dark:bg-[#12131a]">
            <h1 className="font-brand text-3xl font-semibold tracking-tight text-[#1f2233] dark:text-[#f1f3fb]">
              Acesso ao painel
            </h1>
            <p className="mt-2 text-sm text-[#646b7a] dark:text-[#a5adbf]">
              Use seu e-mail e senha para acessar o dashboard de métricas Jira.
            </p>

            <form className="mt-7 space-y-4" onSubmit={(e) => void onSubmit(e)}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#2f3648] dark:text-[#dce1ef]">E-mail</label>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#2f3648] dark:text-[#dce1ef]">Senha</label>
                <input
                  className={inputClass}
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error ? <p className="text-sm text-amber-700">{error}</p> : null}

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-sauvvi px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d42820] disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Entrando…' : 'Continuar'}
              </button>
            </form>

            <p className="mt-5 text-xs text-[#767d8c] dark:text-[#8f97ab]">
              Conexão segura para acesso aos dados analíticos de sprint.
            </p>

            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              Nao tem conta?{' '}
              <Link className="font-semibold text-sauvvi hover:underline" href="/cadastro">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
