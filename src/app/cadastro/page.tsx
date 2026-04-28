'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

const inputClass =
  'w-full rounded-lg border border-[#e8e8ef] bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-sauvvi dark:border-[#3a3d4a] dark:text-neutral-100 dark:placeholder:text-neutral-500'

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'Falha ao cadastrar')
        return
      }
      router.push('/login')
    } catch {
      setError('Não foi possível conectar ao servidor')
    } finally {
      setLoading(false)
    }
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
            Crie seu acesso para operar com seguranca no ecossistema Sauvvi.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#646b7a] dark:text-[#a5adbf]">
            Cadastro rapido para equipes credenciadas acompanharem atendimentos e indicadores em um unico painel.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-[#3d4454] dark:text-[#c2c8d8]">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-sauvvi" />
              Acesso controlado por perfil de usuario.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-sauvvi" />
              Dados de saude com camadas de protecao.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-sauvvi" />
              Painel unificado para acompanhamento operacional.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-sauvvi" />
              Navegacao simples em tema claro e escuro.
            </li>
          </ul>
        </aside>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-2xl border border-[#ececf2] bg-[#fff8f8] px-7 py-8 dark:border-[#2a2d38] dark:bg-[#12131a]">
            <h1 className="font-brand text-3xl font-semibold tracking-tight text-[#1f2233] dark:text-[#f1f3fb]">
              Criar conta
            </h1>
            <p className="mt-2 text-sm text-[#646b7a] dark:text-[#a5adbf]">
              Cadastro padrão cria usuario com perfil nao-admin.
            </p>

            <form className="mt-7 space-y-4" onSubmit={(e) => void onSubmit(e)}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#2f3648] dark:text-[#dce1ef]">Nome</label>
                <input
                  className={inputClass}
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                  placeholder="Minimo de 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              {error ? <p className="text-sm text-amber-700">{error}</p> : null}
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-sauvvi px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d42820] disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Cadastrando…' : 'Criar conta'}
              </button>
            </form>

            <p className="mt-5 text-xs text-[#767d8c] dark:text-[#8f97ab]">
              Conexao segura. Credenciais protegidas durante toda a transmissao.
            </p>

            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              Ja tem conta?{' '}
              <Link className="font-semibold text-sauvvi hover:underline" href="/login">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
