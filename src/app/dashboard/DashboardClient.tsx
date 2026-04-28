'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import type { SnapshotMetadataSummary } from '@/modules/metrics/snapshot-metadata-summary'
import type { SprintMetricsDocument } from '@/modules/metrics/types'
import type { VelocitySeriesPoint } from '@/modules/metrics/velocity-series'
import type { SprintOverviewEntry } from '@/modules/sprints/overview-list'
import { ExplainModal } from '@/components/dashboard/ExplainModal'

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

const SprintAdvancedCharts = dynamic(
  () => import('@/components/dashboard/SprintAdvancedCharts').then((m) => m.SprintAdvancedCharts),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">A carregar gráficos adicionais…</p>
    ),
  },
)

const MetricsGuideTab = dynamic(
  () => import('@/components/dashboard/MetricsGuideTab').then((m) => m.MetricsGuideTab),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">A carregar guia de métricas…</p>
    ),
  },
)

const btnPrimary =
  'app-theme-transition inline-flex items-center justify-center gap-2 rounded-full bg-sauvvi px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(238,46,36,0.45),0_2px_6px_-2px_rgba(0,0,0,0.08)] transition-[colors,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#d42820] hover:shadow active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauvvi'

const btnSecondary =
  'app-theme-transition inline-flex items-center justify-center rounded-full border border-secondary-light/90 bg-white/95 px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-sauvvi/35 hover:text-sauvvi disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauvvi dark:border-secondary-dark dark:bg-[#1E1E1E]/90 dark:text-neutral-100 dark:hover:border-sauvvi/50'

const inputClass =
  'app-theme-transition w-full min-w-0 rounded-xl border border-secondary-light/90 bg-surface-light/40 px-3 py-2.5 text-sm text-neutral-900 outline-none ring-0 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-neutral-400 focus:border-sauvvi focus:ring-0 dark:border-secondary-dark dark:bg-[#1a1a1a]/80 dark:text-white dark:placeholder:text-neutral-500'

const cardClass =
  'app-theme-transition animate-fade-up rounded-2xl border border-secondary-light/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-secondary-dark dark:bg-[#1a1a1a]/95 sm:p-6'

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
  metrics: SprintMetricsDocument | null
  disclaimer: string
  error?: string
}

type SprintsApiResponse = {
  sprints: SprintOverviewEntry[]
  pagination: SprintListPagination
  error?: string
}

const EXPLAINERS: Record<string, string> = {
  'Lead & cycle (dias)':
    'O que mede:\n- Lead time: criação da issue até resolução.\n- Cycle time: primeira mudança de status (início de trabalho) até resolução.\n\nComo ler média/mediana/P85:\n- Média: visão geral, mas sensível a poucos casos muito lentos.\n- Mediana: valor central (50% abaixo / 50% acima), melhor leitura do dia a dia.\n- P85: prazo que cobre 85% das issues; mostra a cauda dos casos lentos.\n\nSinais práticos:\n- Média perto da mediana = fluxo estável.\n- Média muito acima da mediana = outliers puxando o tempo.\n- P85 muito alto = parte relevante das issues demora demais.\n- Lead >> Cycle = espera antes de começar a executar.\n\nAção:\n- atacar handoffs e fila de entrada quando Lead estiver alto;\n- atacar gargalos/retrabalho quando P85 estiver alto.',
  'Lead time médio (dias)':
    'O que mede:\n- Tempo total de ponta a ponta, da criação até a resolução.\n\nComo é calculado:\n- Média dos dias entre createdAt e resolvedAt das issues entregues.\n\nComo interpretar:\n- Quanto menor e mais estável, maior previsibilidade.\n- Se subir e cycle não subir, o problema tende a estar antes do início de execução.\n\nLimite:\n- Depende da qualidade de datas de criação/resolução no Jira.',
  'Cycle time médio (dias)':
    'O que mede:\n- Tempo de execução, do início do trabalho até a resolução.\n\nComo é calculado:\n- Média entre a primeira transição de status (changelog) e resolvedAt.\n\nComo interpretar:\n- Sobe quando há bloqueio, revisão lenta, retrabalho ou WIP alto.\n\nLimite:\n- Sem changelog completo, a amostra pode ficar baixa.',
  'Tempo médio (Lead x Cycle)':
    'O que mede:\n- Compara os dois relógios principais: Lead (fim a fim) e Cycle (execução).\n\nLeitura rápida:\n- Gap alto entre Lead e Cycle = espera/fila antes de iniciar.\n- Ambos altos = gargalo no fluxo de execução.',
  'Tempo médio por coluna (dias)':
    'O que mede:\n- Tempo médio por status de workflow com base no changelog.\n\nImportante:\n- Não é mapeamento 1:1 das colunas visuais do board.\n- Reflete estados de workflow pelos quais as issues passaram.\n\nComo usar:\n- Identificar onde o tempo está concentrado (review, qa, blocked, backlog).',
  'Velocidade ao longo do tempo':
    'O que mede:\n- Evolução de pontos entregues por sprint.\n\nComo interpretar:\n- tendência de alta/queda de capacidade;\n- estabilidade entre sprints.\n\nEvitar:\n- comparar sprint isolada sem contexto de escopo e tipo de demanda.',
  'Comparativo de fluxo':
    'O que mede:\n- Committed, entregues, spillover e escopo adicionado na mesma visão.\n\nComo interpretar:\n- entregues < committed + escopo alto = sprint pressionada por mudança.\n- spillover alto recorrente = risco de planejamento/capacidade.',
  'Eficiência de fluxo':
    'O que mede:\n- Percentual do tempo gasto em trabalho ativo vs tempo total em estados.\n\nComo interpretar:\n- valor baixo indica muita espera/bloqueio/retrabalho.\n\nAção:\n- reduzir filas e limitar WIP em etapas com mais espera.',
  'WIP médio':
    'O que mede:\n- Quantidade média de issues em progresso ao longo do tempo.\n\nComo interpretar:\n- WIP alto tende a aumentar cycle e variabilidade.\n\nAção:\n- limitar trabalho em paralelo e finalizar antes de puxar novos itens.',
  'WIP P85':
    'O que mede:\n- Nível de WIP que cobre 85% do tempo observado.\n\nComo interpretar:\n- Se WIP P85 for alto, o time passou grande parte da sprint operando com muitas issues em paralelo.\n\nDiferença para pico:\n- Pico é um extremo pontual.\n- P85 mostra o patamar recorrente (mais útil para gestão de capacidade).',
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
  const [detailTab, setDetailTab] = useState<'painel' | 'guia'>('painel')
  const [explain, setExplain] = useState<{ title: string; description: string } | null>(null)

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
    setDetailTab('painel')
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

  function openExplain(title: string, description: string) {
    setExplain({ title, description: EXPLAINERS[title] ?? description })
  }

  return (
    <>
      <div className="space-y-8 lg:space-y-10">
      <div className="animate-fade-up">
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

        <div className="app-theme-transition mt-8 rounded-2xl border border-secondary-light/80 bg-surface-light/30 p-4 shadow-inner sm:p-5 dark:border-secondary-dark dark:bg-[#252525]/40">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-brand text-sm font-semibold text-neutral-900 dark:text-white">
              Velocidade ao longo do tempo
            </h3>
            <button
              type="button"
              className="rounded-md border border-secondary-light/80 px-2 py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:border-secondary-dark dark:text-neutral-300 dark:hover:text-white"
              onClick={() =>
                openExplain(
                  'Velocidade ao longo do tempo',
                  'Série histórica de story points entregues por sprint.\n\nPermite acompanhar tendência de capacidade ao longo das últimas sincronizações e com os filtros aplicados.',
                )
              }
            >
              Saiba mais
            </button>
          </div>
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

        <div className="app-theme-transition mt-6 overflow-x-auto rounded-2xl border border-secondary-light/80 bg-white/70 shadow-sm dark:border-secondary-dark dark:bg-[#1a1a1a]/60">
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
                      className={`app-theme-transition group border-b border-secondary-light/70 transition duration-200 last:border-0 dark:border-secondary-dark/80 ${
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

      {!data?.metrics ? (
        <section className={cardClass}>
          <h2 className="font-brand text-lg font-semibold text-neutral-900 dark:text-white">Guia de métricas</h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            As explicações detalhadas ficam disponíveis mesmo sem sprint carregada. Quando você abrir uma sprint,
            também poderá alternar entre <strong className="font-medium text-neutral-700 dark:text-neutral-300">Painel</strong> e{' '}
            <strong className="font-medium text-neutral-700 dark:text-neutral-300">Guia de métricas</strong> na seção de indicadores.
          </p>
          <div className="mt-6">
            <MetricsGuideTab />
          </div>
        </section>
      ) : null}

      {data ? (
          <div className="animate-fade-up space-y-6">
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
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-secondary-light/80 pb-4 dark:border-secondary-dark">
                <h2 className="font-brand text-lg font-semibold text-neutral-900 dark:text-white">Indicadores</h2>
                <div
                  className="inline-flex rounded-xl border border-secondary-light/90 bg-surface-light/40 p-1 dark:border-secondary-dark dark:bg-[#252525]/60"
                  role="tablist"
                  aria-label="Abas de detalhe da sprint"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === 'painel'}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      detailTab === 'painel'
                        ? 'bg-white text-neutral-900 shadow-sm dark:bg-[#1a1a1a] dark:text-white'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                    }`}
                    onClick={() => setDetailTab('painel')}
                  >
                    Painel
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === 'guia'}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      detailTab === 'guia'
                        ? 'bg-white text-neutral-900 shadow-sm dark:bg-[#1a1a1a] dark:text-white'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                    }`}
                    onClick={() => setDetailTab('guia')}
                  >
                    Guia de métricas
                  </button>
                </div>
              </div>

              {detailTab === 'guia' ? <div className="mt-6"><MetricsGuideTab /></div> : null}
              {detailTab === 'painel' ? (
                <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Metric
                  label="Story points entregues"
                  value={data.metrics.storyPointsDelivered}
                  onExplain={() =>
                    openExplain(
                      'Story points entregues',
                      'Soma de story points das issues marcadas como entregues na sprint. Representa esforço entregue.',
                    )
                  }
                />
                <Metric
                  label="Issues entregues"
                  value={data.metrics.issuesDelivered}
                  onExplain={() =>
                    openExplain(
                      'Issues entregues',
                      'Quantidade de itens entregues na sprint. Complementa leitura de pontos com volume de itens.',
                    )
                  }
                />
                <Metric
                  label="Velocidade (pts)"
                  value={data.metrics.velocityStoryPoints}
                  onExplain={() =>
                    openExplain(
                      'Velocidade (pts)',
                      'Velocidade da sprint em pontos entregues. Use principalmente para tendência entre sprints, não como número isolado.',
                    )
                  }
                />
                <Metric
                  label="Throughput"
                  value={data.metrics.throughput}
                  onExplain={() =>
                    openExplain(
                      'Throughput',
                      'Vazão de entrega em quantidade de issues concluídas no recorte da sprint.',
                    )
                  }
                />
                <Metric
                  label="Lead time médio (dias)"
                  value={
                    data.metrics.leadTimeDaysAvg === null ? '—' : data.metrics.leadTimeDaysAvg.toFixed(1)
                  }
                  onExplain={() =>
                    openExplain(
                      'Lead time médio (dias)',
                      'Média de dias entre criação e resolução das issues entregues. Mede tempo total de ponta a ponta.',
                    )
                  }
                />
                <Metric
                  label="Cycle time médio (dias)"
                  value={
                    data.metrics.cycleTimeDaysAvg === null ? '—' : data.metrics.cycleTimeDaysAvg.toFixed(1)
                  }
                  onExplain={() =>
                    openExplain(
                      'Cycle time médio (dias)',
                      'Média de dias entre a primeira transição de status e a resolução. Mede eficiência durante execução.',
                    )
                  }
                />
                <Metric
                  label="Committed"
                  value={data.metrics.committedCount}
                  onExplain={() =>
                    openExplain('Committed', 'Quantidade de issues que estavam no compromisso inicial da sprint.')
                  }
                />
                <Metric
                  label="Entregues"
                  value={data.metrics.deliveredCount}
                  onExplain={() => openExplain('Entregues', 'Quantidade final de issues entregues na sprint.')}
                />
                <Metric
                  label="Spillover"
                  value={data.metrics.spilloverCount}
                  onExplain={() =>
                    openExplain(
                      'Spillover',
                      'Itens que atravessaram a sprint sem entrega. Ajuda a identificar risco de capacidade/plano.',
                    )
                  }
                />
                <Metric
                  label="Escopo adicionado na sprint"
                  value={data.metrics.scopeAddedDuringSprint}
                  onExplain={() =>
                    openExplain(
                      'Escopo adicionado na sprint',
                      'Itens adicionados após início da sprint. Mede pressão de mudança de escopo.',
                    )
                  }
                />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.metrics.storyPointsCommitted != null ? (
                  <Metric
                    label="SP planejado (não adicionado na sprint)"
                    value={data.metrics.storyPointsCommitted}
                    onExplain={() =>
                      openExplain(
                        'SP planejado',
                        'Soma dos story points das issues que já estavam planejadas no início da sprint.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.plannedCompletionRate != null ? (
                  <Metric
                    label="Taxa de conclusão planejada (pts)"
                    value={`${(data.metrics.plannedCompletionRate * 100).toFixed(0)} %`}
                    onExplain={() =>
                      openExplain(
                        'Taxa de conclusão planejada (pts)',
                        'Percentual dos pontos planejados que foram efetivamente entregues.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.stabilityIndex != null ? (
                  <Metric
                    label="Índice de estabilidade (0–1)"
                    value={data.metrics.stabilityIndex.toFixed(2)}
                    onExplain={() =>
                      openExplain(
                        'Índice de estabilidade (0–1)',
                        'Índice sintético baseado em variação de escopo e spillover. Mais próximo de 1 indica maior estabilidade.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.firstPassYield != null ? (
                  <Metric
                    label="First pass yield (sem reabertura)"
                    value={`${(data.metrics.firstPassYield * 100).toFixed(0)} %`}
                    onExplain={() =>
                      openExplain(
                        'First pass yield',
                        'Percentual de entregas sem reabertura de status após estado concluído.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.bugRate != null ? (
                  <Metric
                    label="Bug rate (heur. tipo)"
                    value={`${(data.metrics.bugRate * 100).toFixed(0)} %`}
                    onExplain={() =>
                      openExplain(
                        'Bug rate',
                        'Proporção de itens entregues classificados como bug/defect por heurística do tipo da issue.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.flowEfficiency != null ? (
                  <Metric
                    label="Eficiência de fluxo (trabalho / tempo total coluna)"
                    value={`${(data.metrics.flowEfficiency * 100).toFixed(0)} %`}
                    onExplain={() =>
                      openExplain(
                        'Eficiência de fluxo',
                        'Razão entre tempo em trabalho ativo e tempo total em estados. Quanto maior, melhor fluidez.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.wipAverage != null ? (
                  <Metric
                    label="WIP médio (issues em progresso, série temporal)"
                    value={data.metrics.wipAverage.toFixed(1)}
                    onExplain={() =>
                      openExplain(
                        'WIP médio',
                        'Média temporal de issues em progresso. WIP alto sustentado tende a aumentar cycle time.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.wipPeak != null ? (
                  <Metric
                    label="Pico de WIP"
                    value={data.metrics.wipPeak}
                    onExplain={() =>
                      openExplain(
                        'Pico de WIP',
                        'Maior quantidade de issues simultaneamente em progresso no período observado.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.wipP85 != null ? (
                  <Metric
                    label="WIP P85"
                    value={data.metrics.wipP85.toFixed(0)}
                    onExplain={() =>
                      openExplain(
                        'WIP P85',
                        'Patamar de WIP que cobre 85% do tempo observado na sprint.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.reviewTimeDaysAvg != null ? (
                  <Metric
                    label="Tempo em review (média/ issue com review, d)"
                    value={data.metrics.reviewTimeDaysAvg.toFixed(2)}
                    onExplain={() =>
                      openExplain(
                        'Tempo em review',
                        'Média de dias em review para issues que passaram por review. Ajuda a detectar gargalo nessa etapa.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.velocityTrend != null ? (
                  <Metric
                    label="Tendência velocidade vs sprint ant."
                    value={formatTrend(data.metrics.velocityTrend)}
                    onExplain={() =>
                      openExplain(
                        'Tendência de velocidade',
                        'Variação percentual da velocidade em relação à sprint anterior.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.throughputTrend != null ? (
                  <Metric
                    label="Tendência throughput vs sprint ant."
                    value={formatTrend(data.metrics.throughputTrend)}
                    onExplain={() =>
                      openExplain(
                        'Tendência de throughput',
                        'Variação percentual do throughput em relação à sprint anterior.',
                      )
                    }
                  />
                ) : null}
                {data.metrics.agingDaysAvgOpenIssues != null ? (
                  <Metric
                    label="Aging médio issues abertas (d)"
                    value={data.metrics.agingDaysAvgOpenIssues.toFixed(1)}
                    onExplain={() =>
                      openExplain(
                        'Aging médio de abertas',
                        'Idade média das issues ainda abertas no momento da sincronização.',
                      )
                    }
                  />
                ) : null}
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
                <SprintVisualizations metrics={data.metrics} onExplainRequest={openExplain} />
                <SprintAdvancedCharts metrics={data.metrics} onExplainRequest={openExplain} />
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
                </>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}
      </div>
      <ExplainModal
        open={Boolean(explain)}
        title={explain?.title ?? ''}
        description={explain?.description ?? ''}
        onClose={() => setExplain(null)}
      />
    </>
  )
}

function formatTrend(n: number): string {
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(0)} %`
}

function Metric({
  label,
  value,
  onExplain,
}: {
  label: string
  value: string | number
  onExplain?: () => void
}) {
  return (
    <div className="app-theme-transition rounded-2xl border border-secondary-light/80 bg-surface-light/40 px-4 py-3 shadow-sm dark:border-secondary-dark dark:bg-[#252525]/50">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        <span>{label}</span>
        {onExplain ? (
          <button
            type="button"
            className="app-theme-transition rounded-md border border-secondary-light/80 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:border-secondary-dark dark:text-neutral-300 dark:hover:text-white"
            onClick={onExplain}
          >
            ?
          </button>
        ) : null}
      </div>
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
