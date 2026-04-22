'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import type { SprintOverviewEntry } from '@/modules/sprints/overview-list'

const ConsolidatedVisualizations = dynamic(
  () =>
    import('@/components/dashboard/ConsolidatedVisualizations').then((m) => m.ConsolidatedVisualizations),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Carregando gráficos…</p>
    ),
  },
)

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-sauvvi px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(238,46,36,0.45)] transition-[colors,transform] duration-200 hover:bg-[#d42820] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauvvi'

const btnSecondary =
  'inline-flex items-center justify-center rounded-full border border-secondary-light/90 bg-white/95 px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:border-sauvvi/35 hover:text-sauvvi disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-dark dark:bg-[#1E1E1E]/90 dark:text-neutral-100'

const inputClass =
  'w-full min-w-0 rounded-xl border border-secondary-light/90 bg-surface-light/40 px-3 py-2.5 text-sm outline-none transition-colors focus:border-sauvvi dark:border-secondary-dark dark:bg-[#1a1a1a]/80 dark:text-white'

const cardClass =
  'rounded-2xl border border-secondary-light/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-secondary-dark dark:bg-[#1a1a1a]/95 sm:p-6'

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type Props = {
  initialSprints: SprintOverviewEntry[]
  initialChartSeries: SprintOverviewEntry[]
  initialPagination: Pagination
  disclaimer: string
}

type SprintsApiResponse = {
  sprints: SprintOverviewEntry[]
  chartSeries: SprintOverviewEntry[] | null
  pagination: Pagination
  error?: string
}

function shortLabel(name: string, id: string, max = 22): string {
  const s = name.trim() || id
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`
}

function formatSyncedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function ConsolidadoClient({
  initialSprints,
  initialChartSeries,
  initialPagination,
  disclaimer,
}: Props) {
  const [sprints, setSprints] = useState(initialSprints)
  const [chartSeries, setChartSeries] = useState(initialChartSeries)
  const [pagination, setPagination] = useState(initialPagination)
  const listLimit = initialPagination.limit

  const [draftDays, setDraftDays] = useState('')
  const [appliedDays, setAppliedDays] = useState('')
  const [draftSprintId, setDraftSprintId] = useState('')
  const [appliedSprintId, setAppliedSprintId] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPage = useCallback(
    async (opts: { page: number; days: string; sprintId: string }) => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('page', String(opts.page))
        params.set('limit', String(listLimit))
        params.set('includeChartSeries', 'true')
        if (opts.days) {
          params.set('days', opts.days)
        }
        if (opts.sprintId) {
          params.set('sprintId', opts.sprintId)
        }
        const res = await fetch(`/api/sprints?${params.toString()}`)
        const json = (await res.json()) as SprintsApiResponse & { error?: string }
        if (!res.ok) {
          setError(json.error ?? 'Falha ao carregar')
          return
        }
        setSprints(json.sprints)
        setPagination(json.pagination)
        if (json.chartSeries != null) {
          setChartSeries(json.chartSeries)
        }
      } catch {
        setError('Não foi possível conectar ao servidor')
      } finally {
        setLoading(false)
      }
    },
    [listLimit],
  )

  async function applyFilters() {
    const d = draftDays
    const id = draftSprintId.trim()
    setAppliedDays(d)
    setAppliedSprintId(id)
    await fetchPage({ page: 1, days: d, sprintId: id })
  }

  const chronological = useMemo(() => {
    if (!chartSeries.length) {
      return []
    }
    const sorted = [...chartSeries].sort(
      (a, b) => new Date(a.syncedAt).getTime() - new Date(b.syncedAt).getTime(),
    )
    return sorted.map((s) => ({
      label: shortLabel(s.sprintName, s.sprintId),
      sprintId: s.sprintId,
      velocityPts: s.metrics?.velocityStoryPoints ?? 0,
      issuesOut: s.metrics?.issuesDelivered ?? 0,
      committed: s.metrics?.committedCount ?? 0,
      delivered: s.metrics?.deliveredCount ?? 0,
      spillover: s.metrics?.spilloverCount ?? 0,
    }))
  }, [chartSeries])

  return (
    <div className="space-y-8 lg:space-y-10">
      <div>
        <h1 className="font-brand text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Visão consolidada
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Todas as sprints no MongoDB — filtros e paginação no servidor. Gráficos usam até 60 pontos
          cronológicos com os mesmos filtros.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/dashboard"
            className="font-medium text-sauvvi underline-offset-4 transition-colors hover:underline"
          >
            ← Voltar ao dashboard da sprint
          </Link>
        </div>
      </div>

      <section className={cardClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[160px] flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Período
            <select className={inputClass} value={draftDays} onChange={(e) => setDraftDays(e.target.value)}>
              <option value="">Todos (paginado)</option>
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
            </select>
          </label>
          <label className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            ID (contém)
            <input
              className={`${inputClass} font-mono`}
              value={draftSprintId}
              onChange={(e) => setDraftSprintId(e.target.value)}
              placeholder="ex.: 104"
              autoComplete="off"
              suppressHydrationWarning
            />
          </label>
          <button type="button" className={btnPrimary} onClick={() => void applyFilters()} disabled={loading}>
            {loading ? 'A aplicar…' : 'Aplicar filtros'}
          </button>
          <button
            type="button"
            className={btnSecondary}
            onClick={() =>
              void fetchPage({
                page: pagination.page,
                days: appliedDays,
                sprintId: appliedSprintId,
              })
            }
            disabled={loading}
          >
            Atualizar
          </button>
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-sm text-neutral-600 dark:text-neutral-400">{disclaimer}</p>

      {sprints.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nenhuma sprint encontrada. Sincronize em{' '}
          <Link href="/dashboard" className="font-medium text-sauvvi hover:underline">
            Dashboard
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-secondary-light/90 bg-white/95 shadow-sm dark:border-secondary-dark dark:bg-[#1a1a1a]/95">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gradient-to-b from-surface-light/90 to-surface-light/40 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:from-[#252525] dark:to-[#1E1E1E] dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Sprint</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Sincronizado</th>
                  <th className="px-4 py-3 text-right">Pts</th>
                  <th className="px-4 py-3 text-right">Issues</th>
                  <th className="px-4 py-3 text-right">Committed</th>
                  <th className="px-4 py-3 text-right">Entregues</th>
                  <th className="px-4 py-3 text-right">Spillover</th>
                  <th className="px-4 py-3 text-right">Lead</th>
                  <th className="px-4 py-3 text-right">Cycle</th>
                </tr>
              </thead>
              <tbody>
                {sprints.map((s) => (
                  <tr
                    key={s.sprintId}
                    className="group border-b border-secondary-light/70 transition-colors last:border-0 hover:bg-surface-light/60 dark:border-secondary-dark/80 dark:hover:bg-[#252525]/70"
                  >
                    <td className="max-w-[200px] px-4 py-3 font-medium text-neutral-900 dark:text-white">
                      {s.sprintName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-300">{s.sprintId}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {formatSyncedAt(s.syncedAt)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.metrics?.velocityStoryPoints ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.metrics?.issuesDelivered ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.metrics?.committedCount ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.metrics?.deliveredCount ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.metrics?.spilloverCount ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-600 dark:text-neutral-300">
                      {s.metrics?.leadTimeDaysAvg != null ? s.metrics.leadTimeDaysAvg.toFixed(1) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-600 dark:text-neutral-300">
                      {s.metrics?.cycleTimeDaysAvg != null ? s.metrics.cycleTimeDaysAvg.toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <span>
              Página {pagination.page} de {pagination.totalPages} · {pagination.total} sprint(s)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className={btnSecondary}
                disabled={!pagination.hasPrevPage || loading}
                onClick={() =>
                  void fetchPage({
                    page: pagination.page - 1,
                    days: appliedDays,
                    sprintId: appliedSprintId,
                  })
                }
              >
                Anterior
              </button>
              <button
                type="button"
                className={btnSecondary}
                disabled={!pagination.hasNextPage || loading}
                onClick={() =>
                  void fetchPage({
                    page: pagination.page + 1,
                    days: appliedDays,
                    sprintId: appliedSprintId,
                  })
                }
              >
                Seguinte
              </button>
            </div>
          </div>

          {chronological.length >= 2 ? (
            <div className="space-y-3">
              <h2 className="font-brand text-sm font-semibold text-neutral-900 dark:text-white">
                Tendência e comparação
              </h2>
              <ConsolidatedVisualizations chronological={chronological} />
            </div>
          ) : chronological.length === 1 ? (
            <p className="text-sm text-neutral-500">Sincronize pelo menos duas sprints para gráficos comparativos.</p>
          ) : null}
        </>
      )}
    </div>
  )
}
