'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { D3GroupedBarChart, type D3SeriesKey } from '@/components/charts/d3/d3-grouped-bar-chart'
import type { IndividualAnalysisResult, SprintComparisonRow } from '@/modules/metrics/individual-analysis'

const compareSeries: D3SeriesKey[] = [
  { key: 'Atual', label: 'Atual', color: '#6366f1' },
  { key: 'Anterior', label: 'Anterior', color: '#f59e0b' },
]

const inputClass =
  'w-full min-w-0 rounded-xl border border-secondary-light/90 bg-surface-light/40 px-3 py-2.5 text-sm text-neutral-900 outline-none ring-0 transition-colors placeholder:text-neutral-400 focus:border-sauvvi focus:ring-0 dark:border-secondary-dark dark:bg-[#1a1a1a]/80 dark:text-white dark:placeholder:text-neutral-500'

const cardClass =
  'rounded-2xl border border-secondary-light/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-secondary-dark dark:bg-[#1a1a1a]/95 sm:p-6'

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-sauvvi px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(238,46,36,0.45)] transition-[colors,transform,box-shadow] duration-200 ease-out hover:bg-[#d42820] hover:shadow disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauvvi active:scale-[0.99]'

type ApiResponse = {
  analysis?: IndividualAnalysisResult
  disclaimer?: string
  error?: string
}

function normName(s: string): string {
  return s.trim()
}

type Props = {
  initialData: IndividualAnalysisResult
  /** ID da sprint na query (?sprintId=) — com dados de comparação Atual/Anterior */
  initialSprintId?: string
  initialDays?: string
  /** Aviso quando a sprint do URL não existe */
  loadNote?: string | null
}

export function PessoasClient({
  initialData,
  initialSprintId = '',
  initialDays: initialDaysProp,
  loadNote: loadNoteProp = null,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [analysis, setAnalysis] = useState(initialData)
  const [days, setDays] = useState(initialDaysProp ?? String(initialData.days ?? 30))
  const [sprintId, setSprintId] = useState(initialSprintId)
  const [loadNote, setLoadNote] = useState<string | null>(loadNoteProp)
  const [nameSearch, setNameSearch] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<string>(
    initialData.byAssignee[0]?.assignee ?? '',
  )
  const [compareMode, setCompareMode] = useState<'all' | 'selected'>('all')
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(
    initialData.byAssignee.slice(0, 4).map((r) => r.assignee),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disclaimer, setDisclaimer] = useState(
    'Leitura individual é gerencial e contextual: use para diagnóstico de fluxo, não para ranking punitivo.',
  )

  const safeSelectedAssignee = useMemo(() => {
    const s = selectedAssignee
    if (s && analysis.byAssignee.some((r) => normName(r.assignee) === normName(s))) {
      return analysis.byAssignee.find((r) => normName(r.assignee) === normName(s))?.assignee ?? s
    }
    return analysis.byAssignee[0]?.assignee ?? ''
  }, [analysis.byAssignee, selectedAssignee])

  const safeSelectedForComparison = useMemo(() => {
    const valid = selectedForComparison.filter((name) =>
      analysis.byAssignee.some((r) => r.assignee === name),
    )
    return valid
  }, [analysis.byAssignee, selectedForComparison])

  const selectedRow = useMemo(
    () =>
      analysis.byAssignee.find((r) => normName(r.assignee) === normName(safeSelectedAssignee)) ?? null,
    [analysis.byAssignee, safeSelectedAssignee],
  )

  const comparisonRows = useMemo(() => {
    if (compareMode === 'all') {
      return analysis.byAssignee
    }
    return analysis.byAssignee.filter((r) => safeSelectedForComparison.includes(r.assignee))
  }, [analysis.byAssignee, compareMode, safeSelectedForComparison])

  const filteredByName = useMemo(() => {
    const q = nameSearch.trim().toLowerCase()
    if (!q) {
      return analysis.byAssignee
    }
    return analysis.byAssignee.filter((r) => r.assignee.toLowerCase().includes(q))
  }, [analysis.byAssignee, nameSearch])

  const selectedSprintComparison = useMemo(() => {
    if (!analysis.sprintComparison || !safeSelectedAssignee) {
      return null
    }
    return (
      analysis.sprintComparison.rows.find(
        (r) => normName(r.assignee) === normName(safeSelectedAssignee),
      ) ?? null
    )
  }, [analysis.sprintComparison, safeSelectedAssignee])

  async function applyFilters() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (sprintId.trim()) {
        params.set('sprintId', sprintId.trim())
      } else {
        params.set('days', days || '30')
      }
      const res = await fetch(`/api/dashboard/pessoas?${params.toString()}`)
      const json = (await res.json()) as ApiResponse
      if (!res.ok || !json.analysis) {
        setError(json.error ?? 'Falha ao carregar análise individual')
        return
      }
      setAnalysis(json.analysis)
      setDisclaimer(json.disclaimer ?? disclaimer)
      setLoadNote(null)
      const next = new URLSearchParams()
      if (sprintId.trim()) {
        next.set('sprintId', sprintId.trim())
      } else {
        next.set('days', days || '30')
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    } catch {
      setError('Não foi possível conectar ao servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <div>
        <h1 className="font-brand text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Análise individual por desenvolvedor
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Visão por pessoa com contexto de fluxo. Ordenação padrão por story points entregues
          (decrescente), incluindo <strong>unassigned</strong> quando existir.
        </p>
      </div>

      <section className={cardClass}>
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Sprint ID (opcional)
            <input
              className={`${inputClass} font-mono`}
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
              placeholder="ex.: 104"
              aria-label="Filtro por sprint ID"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Consolidado (últimos N dias)
            <input
              className={inputClass}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="30"
              inputMode="numeric"
              disabled={sprintId.trim().length > 0}
              aria-label="Filtro por dias"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => void applyFilters()}
              disabled={loading}
            >
              {loading ? 'A carregar…' : 'Aplicar análise'}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          Os gráficos <strong>Atual</strong> / <strong>Anterior</strong> (sprint) só carregam com um{' '}
          <span className="font-mono">Sprint ID</span> (ou o URL{' '}
          <code className="rounded bg-surface-light px-1 py-0.5 font-mono text-[11px] dark:bg-[#252525]">
            /dashboard/pessoas?sprintId=ID
          </code>
          ). O botão Aplicar análise regista o filtro na barra de endereço.
        </p>
      </section>

      {loadNote ? (
        <p
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {loadNote}
        </p>
      ) : null}

      {error ? (
        <p
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section className={cardClass}>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{disclaimer}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Pessoas" value={analysis.summary.people} />
          <Metric label="Story points" value={analysis.summary.storyPointsDelivered} />
          <Metric label="Issues entregues" value={analysis.summary.issuesDelivered} />
          <Metric label="Amostra lead (n)" value={analysis.summary.leadSampleCount} />
          <Metric label="Amostra cycle (n)" value={analysis.summary.cycleSampleCount} />
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="font-brand text-lg font-semibold text-neutral-900 dark:text-white">
          Visão individual (clique no nome)
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          Selecione um desenvolvedor para ver detalhes completos no recorte atual.
        </p>
        <div className="mt-4">
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Buscar desenvolvedor
            <input
              className={inputClass}
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="ex.: filipe, lucas, unassigned..."
              aria-label="Buscar desenvolvedor por nome"
            />
          </label>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-secondary-light/80 bg-surface-light/40 p-3 dark:border-secondary-dark dark:bg-[#252525]/50">
            <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {filteredByName.map((r) => {
                const active = r.assignee === safeSelectedAssignee
                return (
                  <li key={r.assignee}>
                    <button
                      type="button"
                      onClick={() => setSelectedAssignee(r.assignee)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                        active
                          ? 'bg-sauvvi/15 text-sauvvi ring-1 ring-sauvvi/30'
                          : 'bg-white/85 text-neutral-800 hover:bg-white dark:bg-[#1f1f1f] dark:text-neutral-200 dark:hover:bg-[#262626]'
                      }`}
                    >
                      <div className="font-medium">{r.assignee}</div>
                      <div className="text-xs opacity-80">
                        {r.storyPointsDelivered} pts · {r.issuesDelivered} issues
                      </div>
                    </button>
                  </li>
                )
              })}
              {filteredByName.length === 0 ? (
                <li className="rounded-lg bg-white/85 px-3 py-2 text-sm text-neutral-500 dark:bg-[#1f1f1f]">
                  Nenhum desenvolvedor encontrado para &quot;{nameSearch}&quot;.
                </li>
              ) : null}
            </ul>
          </div>

          <div className="lg:col-span-2">
            {selectedRow ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-secondary-light/80 bg-surface-light/40 p-4 dark:border-secondary-dark dark:bg-[#252525]/50">
                  <h3 className="font-brand text-base font-semibold text-neutral-900 dark:text-white">
                    {selectedRow.assignee}
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Metric label="Story points entregues" value={selectedRow.storyPointsDelivered} />
                    <Metric label="Issues entregues" value={selectedRow.issuesDelivered} />
                    <Metric
                      label="Pts por issue"
                      value={
                        selectedRow.issuesDelivered > 0
                          ? (selectedRow.storyPointsDelivered / selectedRow.issuesDelivered).toFixed(2)
                          : '0.00'
                      }
                    />
                    <Metric
                      label="Lead médio (dias)"
                      value={
                        selectedRow.leadTimeDaysAvg === null ? '—' : selectedRow.leadTimeDaysAvg.toFixed(1)
                      }
                    />
                    <Metric
                      label="Cycle médio (dias)"
                      value={
                        selectedRow.cycleTimeDaysAvg === null ? '—' : selectedRow.cycleTimeDaysAvg.toFixed(1)
                      }
                    />
                    <Metric label="Spillover / Escopo +" value={`${selectedRow.spilloverCount} / ${selectedRow.scopeAddedCount}`} />
                  </div>
                </div>

                <div className="rounded-xl border border-secondary-light/80 bg-surface-light/40 p-4 dark:border-secondary-dark dark:bg-[#252525]/50">
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    Categorias deste desenvolvedor
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm">
                    {selectedRow.topCategories.length === 0 ? (
                      <li className="text-neutral-500">Sem categorias no recorte.</li>
                    ) : (
                      selectedRow.topCategories.map((c) => (
                        <li
                          key={`${selectedRow.assignee}-${c.name}`}
                          className="flex justify-between rounded-lg border border-secondary-light/60 bg-white/80 px-3 py-2 dark:border-secondary-dark dark:bg-[#1a1a1a]/80"
                        >
                          <span>{c.name}</span>
                          <span className="tabular-nums text-neutral-600 dark:text-neutral-300">
                            {c.storyPoints} pts · {c.issues} issues
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {analysis.mode === 'sprint' && selectedSprintComparison ? (
                  <div className="rounded-xl border border-secondary-light/80 bg-surface-light/40 p-4 dark:border-secondary-dark dark:bg-[#252525]/50">
                    <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                      Sprint atual vs sprint anterior
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Atual: {analysis.sprintComparison?.currentSprintId ?? '-'} · Anterior:{' '}
                      {analysis.sprintComparison?.previousSprintId ?? '—'}
                    </p>
                    <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
                      <ComparisonChart
                        title="Produtividade"
                        row={selectedSprintComparison}
                        keys={[
                          ['storyPointsDelivered', 'Story points'],
                          ['issuesDelivered', 'Issues'],
                        ]}
                      />
                      <ComparisonChart
                        title="Fluxo e tempo"
                        row={selectedSprintComparison}
                        keys={[
                          ['leadTimeDaysAvg', 'Lead (d)'],
                          ['cycleTimeDaysAvg', 'Cycle (d)'],
                          ['spilloverCount', 'Spillover'],
                          ['scopeAddedCount', 'Escopo +'],
                        ]}
                      />
                    </div>
                  </div>
                ) : null}
                {analysis.mode === 'sprint' && selectedRow && !selectedSprintComparison && analysis.sprintComparison ? (
                  <p
                    className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
                    role="status"
                  >
                    Não há comparação sprint a sprint no servidor para{' '}
                    <strong className="font-medium">{selectedRow.assignee}</strong> neste recorte. Os
                    gráficos Atual/Anterior só aparecem quando existem ambas as sprints.
                  </p>
                ) : null}
                {analysis.mode === 'consolidated' && selectedRow ? (
                  <p
                    className="rounded-xl border border-dashed border-secondary-light/90 bg-surface-light/30 px-4 py-3 text-sm text-neutral-600 dark:border-secondary-dark dark:bg-[#252525]/50 dark:text-neutral-300"
                    role="note"
                  >
                    <strong className="font-medium text-neutral-800 dark:text-white">
                      Comparação sprint a sprint
                    </strong>
                    : indique um <strong className="font-mono">Sprint ID</strong> (opcional) e clique
                    em <strong>Aplicar análise</strong> para carregar a sprint alvo. Nesse modo, os
                    gráficos <em>Atual</em> vs <em>Anterior</em> passam a ser exibidos aqui.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Nenhum desenvolvedor no recorte atual.</p>
            )}
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="font-brand text-lg font-semibold text-neutral-900 dark:text-white">Visão geral comparativa</h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Recorte:{' '}
          {analysis.mode === 'sprint'
            ? `sprint ${analysis.referenceSprintId ?? '-'}`
            : `consolidado ${analysis.days ?? '-'} dias`}
          .
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCompareMode('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              compareMode === 'all'
                ? 'bg-sauvvi text-white'
                : 'border border-secondary-light text-neutral-700 dark:border-secondary-dark dark:text-neutral-200'
            }`}
          >
            Comparar todos
          </button>
          <button
            type="button"
            onClick={() => setCompareMode('selected')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              compareMode === 'selected'
                ? 'bg-sauvvi text-white'
                : 'border border-secondary-light text-neutral-700 dark:border-secondary-dark dark:text-neutral-200'
            }`}
          >
            Comparar selecionados
          </button>
        </div>

        {compareMode === 'selected' ? (
          <div className="mt-3 rounded-xl border border-secondary-light/80 bg-surface-light/40 p-3 dark:border-secondary-dark dark:bg-[#252525]/50">
            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-secondary-light/80 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 dark:border-secondary-dark dark:bg-[#1f1f1f] dark:text-neutral-200"
                onClick={() => setSelectedForComparison(analysis.byAssignee.map((r) => r.assignee))}
              >
                Selecionar todos
              </button>
              <button
                type="button"
                className="rounded-full border border-secondary-light/80 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 dark:border-secondary-dark dark:bg-[#1f1f1f] dark:text-neutral-200"
                onClick={() => setSelectedForComparison([])}
              >
                Limpar seleção
              </button>
            </div>
            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
            {analysis.byAssignee.map((r) => {
              const checked = safeSelectedForComparison.includes(r.assignee)
              return (
                <label
                  key={`cmp-${r.assignee}`}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-secondary-light/80 bg-white px-3 py-1 text-xs dark:border-secondary-dark dark:bg-[#1f1f1f]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setSelectedForComparison((cur) =>
                        e.target.checked
                          ? [...cur, r.assignee]
                          : cur.filter((name) => name !== r.assignee),
                      )
                    }}
                  />
                  <span>{r.assignee}</span>
                </label>
              )
            })}
            </div>
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-secondary-light/80 dark:border-secondary-dark">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-gradient-to-b from-surface-light/90 to-surface-light/50 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:from-[#252525] dark:to-[#1E1E1E] dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3">Pessoa</th>
                <th className="px-4 py-3 text-right">Pts</th>
                <th className="px-4 py-3 text-right">Issues</th>
                <th className="px-4 py-3 text-right">Lead (dias)</th>
                <th className="px-4 py-3 text-right">Cycle (dias)</th>
                <th className="px-4 py-3 text-right">Spillover</th>
                <th className="px-4 py-3 text-right">Escopo add.</th>
                <th className="px-4 py-3">Categorias topo</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                    Nenhum desenvolvedor selecionado para comparação.
                  </td>
                </tr>
              ) : (
                comparisonRows.map((row) => (
                  <tr
                    key={row.assignee}
                    className="border-b border-secondary-light/70 last:border-0 dark:border-secondary-dark/80"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{row.assignee}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.storyPointsDelivered}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.issuesDelivered}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.leadTimeDaysAvg === null ? '—' : row.leadTimeDaysAvg.toFixed(1)} ({row.leadSampleCount})
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.cycleTimeDaysAvg === null ? '—' : row.cycleTimeDaysAvg.toFixed(1)} ({row.cycleSampleCount})
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.spilloverCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.scopeAddedCount}</td>
                    <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-300">
                      {row.topCategories.length === 0
                        ? '—'
                        : row.topCategories.map((c) => `${c.name} (${c.storyPoints} pts)`).join(' · ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
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

function ComparisonChart({
  title,
  row,
  keys,
}: {
  title: string
  row: SprintComparisonRow
  keys: Array<[keyof SprintComparisonRow['current'], string]>
}) {
  const data = keys.map(([key, label]) => ({
    categoria: label,
    Atual: normalizeNum(row.current[key]),
    Anterior: normalizeNum(row.previous[key]),
  }))
  return (
    <div className="min-w-0 rounded-xl border border-secondary-light/70 bg-white/80 p-3 dark:border-secondary-dark dark:bg-[#1a1a1a]/80">
      <h5 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </h5>
      <div className="mt-2 h-72 w-full min-w-0">
        <D3GroupedBarChart
          key={`${row.assignee}-${title}-${data.map((d) => d.categoria).join()}`}
          rows={data}
          categoryKey="categoria"
          series={compareSeries}
          height={288}
          xLabelRotate={-20}
          xAxisHeight={52}
          yGutter={44}
        />
      </div>
    </div>
  )
}

function normalizeNum(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return Number(v.toFixed(2))
  }
  return 0
}
