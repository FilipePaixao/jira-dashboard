'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import type { SnapshotMetadataSummary } from '@/modules/metrics/snapshot-metadata-summary'
import type { VelocitySeriesPoint } from '@/modules/metrics/velocity-series'
import type { SprintOverviewEntry } from '@/modules/sprints/overview-list'

const SprintVisualizations = dynamic(
  () =>
    import('@/components/dashboard/SprintVisualizations').then((m) => m.SprintVisualizations),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Carregando gráficos…</p>
    ),
  },
)

const VelocitySeriesChart = dynamic(
  () => import('@/components/dashboard/VelocitySeriesChart').then((m) => m.VelocitySeriesChart),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">A carregar série…</p>
    ),
  },
)

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-sauvvi px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(238,46,36,0.45)] transition-[colors,transform,box-shadow] duration-200 ease-out hover:bg-[#d42820] hover:shadow disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauvvi active:scale-[0.99]'

const btnSecondary =
  'inline-flex items-center justify-center rounded-full border border-secondary-light/90 bg-white/95 px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition-colors duration-200 hover:border-sauvvi/35 hover:text-sauvvi disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauvvi dark:border-secondary-dark dark:bg-[#1E1E1E]/90 dark:text-neutral-100 dark:hover:border-sauvvi/50'

const inputClass =
  'w-full min-w-0 rounded-xl border border-secondary-light/90 bg-surface-light/40 px-3 py-2.5 text-sm text-neutral-900 outline-none ring-0 transition-colors placeholder:text-neutral-400 focus:border-sauvvi focus:ring-0 dark:border-secondary-dark dark:bg-[#1a1a1a]/80 dark:text-white dark:placeholder:text-neutral-500'

const cardClass =
  'rounded-2xl border border-secondary-light/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-secondary-dark dark:bg-[#1a1a1a]/95 sm:p-6'

export type SprintListPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type Props = {
  initialVelocitySeries: VelocitySeriesPoint[]
  initialSprints: SprintOverviewEntry[]
  initialPagination: SprintListPagination
}

type DashboardResponse = {
  snapshot: {
    sprintId: string
    sprintName: string
    syncedAt: string
    extractionStatus: string
    issueCount?: number
  } | null
  metadataSummary?: SnapshotMetadataSummary | null
  executiveSummary?: string | null
  metrics: {
    velocityStoryPoints: number
    velocityIssues: number
    storyPointsDelivered: number
    issuesDelivered: number
    leadTimeDaysAvg: number | null
    cycleTimeDaysAvg: number | null
    leadTimeSampleCount?: number
    cycleTimeSampleCount?: number
    throughput: number
    committedCount: number
    deliveredCount: number
    spilloverCount: number
    scopeAddedDuringSprint: number
    byAssignee: Record<string, { storyPoints: number; issues: number }>
  } | null
  disclaimer: string
  error?: string
}

type SprintsApiResponse = {
  sprints: SprintOverviewEntry[]
  pagination: SprintListPagination
  error?: string
}

export function DashboardClient({
  initialVelocitySeries,
  initialSprints,
  initialPagination,
}: Props) {
  const [velocitySeries, setVelocitySeries] = useState(initialVelocitySeries)
  const [velocityLoading, setVelocityLoading] = useState(false)
  const [sprints, setSprints] = useState(initialSprints)
  const [pagination, setPagination] = useState(initialPagination)
  const [listPage, setListPage] = useState(initialPagination.page)
  const listLimit = initialPagination.limit

  const [draftDays, setDraftDays] = useState<string>('')
  const [appliedDays, setAppliedDays] = useState<string>('')
  const [draftSprintId, setDraftSprintId] = useState('')
  const [appliedSprintId, setAppliedSprintId] = useState('')

  const [selectedSprintId, setSelectedSprintId] = useState('')
  const [sprintNameOverride, setSprintNameOverride] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadVelocitySeries = useCallback(async (days: string, sprintIdFilter: string) => {
    setVelocityLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('max', '120')
      if (days) {
        params.set('days', days)
      }
      if (sprintIdFilter.trim()) {
        params.set('sprintId', sprintIdFilter.trim())
      }
      const res = await fetch(`/api/metrics/velocity-series?${params.toString()}`)
      const json = (await res.json()) as { series?: VelocitySeriesPoint[]; error?: string }
      if (res.ok && json.series) {
        setVelocitySeries(json.series)
      }
    } catch {
      /* série é opcional; erros já aparecem na lista */
    } finally {
      setVelocityLoading(false)
    }
  }, [])

  const fetchSprints = useCallback(
    async (opts?: { page?: number; resetPage?: boolean }) => {
      setListLoading(true)
      setError(null)
      try {
        const page = opts?.resetPage ? 1 : (opts?.page ?? listPage)
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(listLimit))
        params.set('includeChartSeries', 'false')
        if (appliedDays) {
          params.set('days', appliedDays)
        }
        if (appliedSprintId.trim()) {
          params.set('sprintId', appliedSprintId.trim())
        }
        const res = await fetch(`/api/sprints?${params.toString()}`)
        const json = (await res.json()) as SprintsApiResponse & { error?: string }
        if (!res.ok) {
          setError(json.error ?? 'Falha ao listar sprints')
          return
        }
        setSprints(json.sprints)
        setPagination(json.pagination)
        setListPage(json.pagination.page)
      } catch {
        setError('Não foi possível conectar ao servidor')
      } finally {
        setListLoading(false)
      }
    },
    [appliedDays, appliedSprintId, listLimit, listPage],
  )

  async function applyFilters() {
    const nextDays = draftDays
    const nextId = draftSprintId.trim()
    setAppliedDays(nextDays)
    setAppliedSprintId(nextId)
    setListLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', String(listLimit))
      params.set('includeChartSeries', 'false')
      if (nextDays) {
        params.set('days', nextDays)
      }
      if (nextId) {
        params.set('sprintId', nextId)
      }
      const res = await fetch(`/api/sprints?${params.toString()}`)
      const json = (await res.json()) as SprintsApiResponse & { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'Falha ao listar sprints')
        return
      }
      setSprints(json.sprints)
      setPagination(json.pagination)
      setListPage(1)
      await loadVelocitySeries(nextDays, nextId)
    } catch {
      setError('Não foi possível conectar ao servidor')
    } finally {
      setListLoading(false)
    }
  }

  async function loadDetail(forcedId?: string) {
    const id = (forcedId ?? selectedSprintId).trim()
    if (!id) {
      setError('Selecione uma sprint na lista ou informe o ID.')
      return
    }
    setDetailLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/dashboard/sprint/${encodeURIComponent(id)}`)
      const json = (await res.json()) as DashboardResponse & { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'Falha ao carregar')
        return
      }
      setData(json)
    } catch {
      setError('Não foi possível conectar ao servidor')
    } finally {
      setDetailLoading(false)
    }
  }

  async function runSync() {
    const id = selectedSprintId.trim()
    if (!id) {
      setSyncMessage(null)
      setError('Selecione uma sprint na lista para sincronizar.')
      return
    }
    setSyncing(true)
    setSyncMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/sync/sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId: id,
          sprintName: sprintNameOverride.trim() || undefined,
        }),
      })
      const json = (await res.json()) as {
        ok?: boolean
        issuesFetched?: number
        error?: string
        phase?: string
      }
      if (!res.ok) {
        setSyncMessage(null)
        setError(json.error ?? `Sync falhou (${res.status})`)
        return
      }
      setSyncMessage(
        `Sincronizado: ${json.issuesFetched ?? 0} issues (${json.phase ?? 'live'}). Métricas atualizadas.`,
      )
      await loadDetail(id)
      await fetchSprints({ resetPage: true })
      await loadVelocitySeries(appliedDays, appliedSprintId)
    } catch {
      setSyncMessage(null)
      setError('Não foi possível conectar ao servidor para sincronizar')
    } finally {
      setSyncing(false)
    }
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

  return (
    <div className="space-y-8 lg:space-y-10">
      <div>
        <h1 className="font-brand text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Dashboard da sprint
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Escolha uma sprint sincronizada na lista (filtros e paginação no servidor). Depois pode
          atualizar do Jira ou ver métricas — tudo via API interna.
        </p>
      </div>

      <section className={`${cardClass} border-sauvvi/15 bg-gradient-to-b from-surface-light/80 to-white/95 dark:from-[#1E1E1E]/80 dark:to-[#1a1a1a]/95`}>
        <h2 className="font-brand text-sm font-semibold uppercase tracking-wide text-sauvvi">
          Sincronizar do Jira
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          A sprint alvo é a linha <strong className="font-medium text-neutral-800 dark:text-neutral-200">selecionada</strong> na
          tabela abaixo (ID Agile).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Nome (opcional)
            <input
              className={inputClass}
              name="dash-jira-sprint-name-override"
              autoComplete="off"
              value={sprintNameOverride}
              onChange={(e) => setSprintNameOverride(e.target.value)}
              placeholder="Sobrescrever nome vindo do Jira"
              suppressHydrationWarning
            />
          </label>
          <button type="button" className={btnPrimary} onClick={() => void runSync()} disabled={syncing || detailLoading}>
            {syncing ? 'Sincronizando…' : 'Sincronizar agora'}
          </button>
        </div>
        {syncMessage ? (
          <p
            className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800"
            role="status"
          >
            {syncMessage}
          </p>
        ) : null}
      </section>

      <section className={cardClass}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-brand text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
              Sprints no repositório
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Filtros aplicados no servidor. Sem filtros, a lista completa é paginada.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <label className="flex min-w-[160px] flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Período (últimos…)
            <select
              className={inputClass}
              value={draftDays}
              onChange={(e) => setDraftDays(e.target.value)}
              aria-label="Filtro de tempo: dias desde a última sincronização"
            >
              <option value="">Todos (paginado)</option>
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
            </select>
          </label>
          <label className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Filtro por ID (contém)
            <input
              className={`${inputClass} font-mono`}
              value={draftSprintId}
              onChange={(e) => setDraftSprintId(e.target.value)}
              placeholder="ex.: 104"
              inputMode="numeric"
              autoComplete="off"
              suppressHydrationWarning
              aria-label="Filtrar por sprint ID"
            />
          </label>
          <button type="button" className={btnPrimary} onClick={() => void applyFilters()} disabled={listLoading}>
            {listLoading ? 'A aplicar…' : 'Aplicar filtros'}
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-secondary-light/80 bg-surface-light/30 p-4 sm:p-5 dark:border-secondary-dark dark:bg-[#252525]/40">
          <h3 className="font-brand text-sm font-semibold text-neutral-900 dark:text-white">
            Velocidade ao longo do tempo
          </h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Story points entregues por sprint (ordem cronológica da sincronização). Usa os mesmos
            filtros de período e ID que a tabela abaixo.
          </p>
          <div className="relative mt-4">
            {velocityLoading ? (
              <p className="text-sm text-neutral-500">A atualizar série…</p>
            ) : (
              <VelocitySeriesChart series={velocitySeries} />
            )}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-secondary-light/80 dark:border-secondary-dark">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gradient-to-b from-surface-light/90 to-surface-light/50 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:from-[#252525] dark:to-[#1E1E1E] dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3">Sprint</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Sincronizado</th>
                <th className="px-4 py-3 text-right">Pts</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {sprints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    Nenhuma sprint encontrada com estes filtros.
                  </td>
                </tr>
              ) : (
                sprints.map((s) => {
                  const active = selectedSprintId === s.sprintId
                  return (
                    <tr
                      key={s.sprintId}
                      className={`group border-b border-secondary-light/70 transition-colors last:border-0 dark:border-secondary-dark/80 ${
                        active ? 'bg-sauvvi/[0.06] dark:bg-sauvvi/10' : 'hover:bg-surface-light/70 dark:hover:bg-[#252525]/80'
                      }`}
                    >
                      <td className="max-w-[220px] px-4 py-3 font-medium text-neutral-900 dark:text-white">
                        {s.sprintName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-300">{s.sprintId}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-600 dark:text-neutral-400">
                        {formatSyncedAt(s.syncedAt)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-neutral-800 dark:text-neutral-200">
                        {s.metrics?.velocityStoryPoints ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className={`${btnSecondary} px-3 py-1.5 text-xs ${
                            active ? 'border-sauvvi/50 text-sauvvi' : ''
                          }`}
                          onClick={() => {
                            setSelectedSprintId(s.sprintId)
                            void loadDetail(s.sprintId)
                          }}
                          disabled={detailLoading}
                        >
                          {detailLoading && active ? 'A carregar…' : 'Ver métricas'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600 dark:text-neutral-400">
          <span>
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} sprint(s)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className={btnSecondary}
              disabled={!pagination.hasPrevPage || listLoading}
              onClick={() => void fetchSprints({ page: pagination.page - 1 })}
            >
              Anterior
            </button>
            <button
              type="button"
              className={btnSecondary}
              disabled={!pagination.hasNextPage || listLoading}
              onClick={() => void fetchSprints({ page: pagination.page + 1 })}
            >
              Seguinte
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <p
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {data ? (
        <div className="space-y-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{data.disclaimer}</p>

          {data.executiveSummary ? (
            <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/95 p-4 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/35 sm:p-6">
              <h2 className="font-brand text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                Resumo executivo
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-950/95 dark:text-emerald-50/95">
                {data.executiveSummary}
              </p>
            </section>
          ) : null}

          {data.snapshot ? (
            <section className={cardClass}>
              <h2 className="font-brand text-lg font-semibold text-neutral-900 dark:text-white">
                {data.snapshot.sprintName}
              </h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Sprint ID</dt>
                  <dd className="mt-1 font-mono text-neutral-900 dark:text-white">{data.snapshot.sprintId}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Sincronizado em</dt>
                  <dd className="mt-1 text-neutral-800 dark:text-neutral-200">{formatSyncedAt(data.snapshot.syncedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Extração</dt>
                  <dd className="mt-1">
                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-600">
                      {data.snapshot.extractionStatus}
                    </span>
                  </dd>
                </div>
                {data.snapshot.issueCount != null ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Issues no snapshot</dt>
                    <dd className="mt-1 tabular-nums text-neutral-900 dark:text-white">{data.snapshot.issueCount}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          {data.metadataSummary && data.metadataSummary.deliveredIssueCount > 0 ? (
            <section className={cardClass}>
              <h2 className="font-brand text-lg font-semibold text-neutral-900 dark:text-white">
                Dados das entregues
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                Categorias (tipo da issue), labels, componentes e épicos extraídos do Jira (issues
                com flag{' '}
                <strong className="text-neutral-700 dark:text-neutral-300">entregue</strong>). Story
                points por linha somam a mesma issue em cada label/componente onde aparece.
              </p>
              <div className="mt-6 grid gap-6 lg:grid-cols-4">
                <MetadataTable title="Categorias" rows={data.metadataSummary.topIssueTypes} />
                <MetadataTable title="Labels" rows={data.metadataSummary.topLabels} />
                <MetadataTable title="Componentes" rows={data.metadataSummary.topComponents} />
                <MetadataTable title="Épicos" rows={data.metadataSummary.topEpics} />
              </div>
            </section>
          ) : null}

          {data.metrics ? (
            <section className={cardClass}>
              <h2 className="font-brand text-lg font-semibold text-neutral-900 dark:text-white">Indicadores</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Metric label="Story points entregues" value={data.metrics.storyPointsDelivered} />
                <Metric label="Issues entregues" value={data.metrics.issuesDelivered} />
                <Metric label="Velocidade (pts)" value={data.metrics.velocityStoryPoints} />
                <Metric label="Throughput" value={data.metrics.throughput} />
                <Metric
                  label="Lead time médio (dias)"
                  value={
                    data.metrics.leadTimeDaysAvg === null ? '—' : data.metrics.leadTimeDaysAvg.toFixed(1)
                  }
                />
                <Metric
                  label="Cycle time médio (dias)"
                  value={
                    data.metrics.cycleTimeDaysAvg === null ? '—' : data.metrics.cycleTimeDaysAvg.toFixed(1)
                  }
                />
                <Metric label="Committed" value={data.metrics.committedCount} />
                <Metric label="Entregues" value={data.metrics.deliveredCount} />
                <Metric label="Spillover" value={data.metrics.spilloverCount} />
                <Metric label="Escopo adicionado na sprint" value={data.metrics.scopeAddedDuringSprint} />
              </div>

              <p className="mt-6 max-w-3xl text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                <strong className="font-medium text-neutral-700 dark:text-neutral-300">Lead time</strong> médio:
                dias entre criação da issue e resolução (amostra: entregues com data de resolução
                {data.metrics.leadTimeSampleCount !== undefined ? `, n=${data.metrics.leadTimeSampleCount}` : ''}
                ).{' '}
                <strong className="font-medium text-neutral-700 dark:text-neutral-300">Cycle time</strong> médio:
                dias entre a <strong>primeira transição de status</strong> registada no changelog do Jira e a
                resolução
                {data.metrics.cycleTimeSampleCount !== undefined ? ` (n=${data.metrics.cycleTimeSampleCount})` : ''}.
                Se o cycle aparecer vazio ou com n baixo, sincronize com changelog (
                <code className="rounded bg-neutral-100 px-1 font-mono text-[0.7rem] dark:bg-neutral-800">
                  expand=changelog
                </code>
                ).
              </p>

              <div className="mt-10 border-t border-secondary-light pt-10 dark:border-secondary-dark">
                <h3 className="font-brand mb-4 text-base font-semibold text-neutral-900 dark:text-white">
                  Visão gráfica
                </h3>
                <SprintVisualizations metrics={data.metrics} />
              </div>

              <div className="mt-10">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Detalhe por pessoa</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {Object.entries(data.metrics.byAssignee).map(([name, v]) => (
                    <li
                      key={name}
                      className="flex justify-between rounded-xl border border-secondary-light/60 bg-surface-light/50 px-4 py-2.5 dark:border-secondary-dark dark:bg-[#252525]/60"
                    >
                      <span className="text-neutral-900 dark:text-white">{name}</span>
                      <span className="tabular-nums text-neutral-600 dark:text-neutral-300">
                        {v.storyPoints} pts · {v.issues} issues
                      </span>
                    </li>
                  ))}
                  {Object.keys(data.metrics.byAssignee).length === 0 ? (
                    <li className="text-neutral-500">Nenhuma entrega atribuída.</li>
                  ) : null}
                </ul>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-secondary-light/80 bg-surface-light/40 px-4 py-3 dark:border-secondary-dark dark:bg-[#252525]/50">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-white">{value}</div>
    </div>
  )
}

function MetadataTable({
  title,
  rows,
}: {
  title: string
  rows: { name: string; issues: number; storyPoints: number }[]
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
      <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto text-sm">
        {rows.map((r) => (
          <li
            key={r.name}
            className="flex justify-between gap-2 rounded-lg border border-secondary-light/50 bg-white/80 px-2.5 py-1.5 dark:border-secondary-dark dark:bg-[#1a1a1a]/80"
          >
            <span className="min-w-0 truncate text-neutral-900 dark:text-white" title={r.name}>
              {r.name}
            </span>
            <span className="shrink-0 tabular-nums text-neutral-600 dark:text-neutral-300">
              {r.issues} · {r.storyPoints} pts
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
