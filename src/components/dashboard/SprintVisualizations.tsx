'use client'

import { useMemo, type ReactNode } from 'react'
import { D3ColumnChart, type D3ColumnDatum } from '@/components/charts/d3/d3-column-chart'
import { D3DonutChart, type D3DonutSlice } from '@/components/charts/d3/d3-donut-chart'
import { D3HorizontalBarChart, type D3HBarRow } from '@/components/charts/d3/d3-horizontal-bars'
import type { SprintMetricsDocument } from '@/modules/metrics/types'

type Metrics = Pick<
  SprintMetricsDocument,
  | 'velocityStoryPoints'
  | 'velocityIssues'
  | 'storyPointsDelivered'
  | 'issuesDelivered'
  | 'leadTimeDaysAvg'
  | 'cycleTimeDaysAvg'
  | 'leadTimeSampleCount'
  | 'cycleTimeSampleCount'
  | 'throughput'
  | 'committedCount'
  | 'deliveredCount'
  | 'spilloverCount'
  | 'scopeAddedDuringSprint'
  | 'byAssignee'
>

const PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#64748b',
]

type Props = {
  metrics: Metrics
  onExplainRequest?: (title: string, description: string) => void
}

export function SprintVisualizations({ metrics, onExplainRequest }: Props) {
  const byPerson = useMemo(() => {
    return Object.entries(metrics.byAssignee)
      .map(([name, v]) => ({
        nome: truncateLabel(name, 28),
        nomeCompleto: name,
        pontos: v.storyPoints,
        issues: v.issues,
      }))
      .sort((a, b) => b.pontos - a.pontos || b.issues - a.issues)
  }, [metrics.byAssignee])

  const ptsRows: D3HBarRow[] = useMemo(
    () =>
      byPerson.map((p, i) => ({
        yLabel: p.nome,
        value: p.pontos,
        fullName: p.nomeCompleto,
        detail: `${p.pontos} story points`,
        color: PALETTE[i % PALETTE.length]!,
      })),
    [byPerson],
  )

  const issuesRows: D3HBarRow[] = useMemo(
    () =>
      byPerson.map((p) => ({
        yLabel: p.nome,
        value: p.issues,
        fullName: p.nomeCompleto,
        detail: `${p.issues} issues entregues`,
        color: '#06b6d4',
      })),
    [byPerson],
  )

  const donutData: D3DonutSlice[] = useMemo(() => {
    const rows = Object.entries(metrics.byAssignee)
      .filter(([, v]) => v.storyPoints > 0)
      .map(([name, v], i) => ({
        name: truncateLabel(name, 18),
        value: v.storyPoints,
        full: name,
        color: PALETTE[i % PALETTE.length]!,
      }))
    const sum = rows.reduce((s, r) => s + r.value, 0)
    if (sum === 0 && metrics.storyPointsDelivered > 0) {
      return [
        {
          name: 'Sem atribuição',
          value: metrics.storyPointsDelivered,
          full: 'Sem atribuição',
          color: PALETTE[0]!,
        },
      ]
    }
    return rows
  }, [metrics.byAssignee, metrics.storyPointsDelivered])

  const comparisonBars: D3ColumnDatum[] = useMemo(
    () => [
      { x: 'Committed', value: metrics.committedCount, color: '#818cf8' },
      { x: 'Entregues', value: metrics.deliveredCount, color: '#34d399' },
      { x: 'Spillover', value: metrics.spilloverCount, color: '#fbbf24' },
      { x: 'Escopo +', value: metrics.scopeAddedDuringSprint, color: '#f472b6' },
    ],
    [
      metrics.committedCount,
      metrics.deliveredCount,
      metrics.spilloverCount,
      metrics.scopeAddedDuringSprint,
    ],
  )

  const tempoData: D3ColumnDatum[] = useMemo(() => {
    const lead = metrics.leadTimeDaysAvg
    const cycle = metrics.cycleTimeDaysAvg
    const rows: D3ColumnDatum[] = []
    if (lead !== null) {
      rows.push({ x: 'Lead (d)', value: Number(lead.toFixed(2)), color: '#a78bfa' })
    }
    if (cycle !== null) {
      rows.push({ x: 'Cycle (d)', value: Number(cycle.toFixed(2)), color: '#a78bfa' })
    }
    return rows
  }, [metrics.leadTimeDaysAvg, metrics.cycleTimeDaysAvg])

  const h = Math.max(280, byPerson.length * 36)

  return (
    <div className="animate-fade-up space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Pontos por pessoa"
          subtitle="Comparativo de story points nas entregas atribuídas"
          onExplain={
            onExplainRequest
              ? () =>
                  onExplainRequest(
                    'Pontos por pessoa',
                    'Compara a soma de story points entregues por responsável nesta sprint.\n\nUse para entender distribuição de esforço entregue e concentração de capacidade. Não é métrica de performance individual isolada.',
                  )
              : undefined
          }
        >
          {byPerson.length === 0 ? (
            <EmptyChart />
          ) : (
            <D3HorizontalBarChart
              data={ptsRows}
              height={h}
              xInteger
              hoverTint="rgba(99, 102, 241, 0.08)"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Issues entregues por pessoa"
          subtitle="Volume de itens concluídos por responsável"
          onExplain={
            onExplainRequest
              ? () =>
                  onExplainRequest(
                    'Issues entregues por pessoa',
                    'Mostra quantidade de issues entregues por pessoa.\n\nAjuda a ler volume de entrega em itens, complementar ao gráfico de pontos.',
                  )
              : undefined
          }
        >
          {byPerson.length === 0 ? (
            <EmptyChart />
          ) : (
            <D3HorizontalBarChart
              data={issuesRows}
              height={h}
              xInteger
              hoverTint="rgba(6, 182, 212, 0.08)"
            />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Distribuição de pontos"
          subtitle="Proporção dos story points entre pessoas (entregas)"
          onExplain={
            onExplainRequest
              ? () =>
                  onExplainRequest(
                    'Distribuição de pontos',
                    'Mostra participação relativa de cada pessoa no total de pontos entregues.\n\nÚtil para visualizar concentração de esforço na sprint.',
                  )
              : undefined
          }
        >
          {donutData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="flex min-h-[300px] min-w-0 flex-col items-stretch justify-center sm:flex-row">
              <D3DonutChart data={donutData} height={280} />
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Comparativo de fluxo"
          subtitle="Contagens para leitura gerencial (podem sobrepor-se conceitualmente)"
          onExplain={
            onExplainRequest
              ? () =>
                  onExplainRequest(
                    'Comparativo de fluxo',
                    'Compara committed, entregues, spillover e escopo adicionado.\n\nServe para discutir aderência ao plano e mudanças de escopo durante a sprint.',
                  )
              : undefined
          }
        >
          <D3ColumnChart data={comparisonBars} height={300} />
        </ChartCard>
      </div>

      {tempoData.length > 0 ? (
        <ChartCard
          title="Tempo médio (dias)"
          subtitle={tempoSubtitle(metrics)}
          onExplain={
            onExplainRequest
              ? () =>
                  onExplainRequest(
                    'Tempo médio (Lead x Cycle)',
                    'Lead time: criação até resolução.\nCycle time: primeira transição de status (changelog) até resolução.\n\nGap grande entre os dois costuma indicar espera antes de iniciar execução.',
                  )
              : undefined
          }
        >
          <D3ColumnChart
            data={tempoData}
            height={260}
            yLabel={(n) => `${n} dias`}
            maxBarWidth={72}
          />
        </ChartCard>
      ) : null}
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
  onExplain,
}: {
  title: string
  subtitle: string
  children: ReactNode
  onExplain?: () => void
}) {
  return (
    <div className="app-theme-transition rounded-2xl border border-secondary-light/90 bg-gradient-to-b from-white to-surface-light/70 p-4 shadow-sm backdrop-blur-sm dark:border-secondary-dark dark:from-[#1a1a1a]/95 dark:to-[#121212]/80">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-brand text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
        {onExplain ? (
          <button
            type="button"
            className="app-theme-transition rounded-md border border-secondary-light/80 px-2 py-1 text-xs font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:border-secondary-dark dark:text-neutral-300 dark:hover:text-neutral-100"
            onClick={onExplain}
          >
            Saiba mais
          </button>
        ) : null}
      </div>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
      Sem dados para exibir o gráfico.
    </div>
  )
}

function tempoSubtitle(m: Metrics): string {
  const leadN = m.leadTimeSampleCount
  const cycleN = m.cycleTimeSampleCount
  const parts = [
    'Lead: média da criação até a resolução',
    leadN !== undefined ? `(n=${leadN})` : '',
    '· Cycle: média da 1.ª mudança de status (changelog) até a resolução',
    cycleN !== undefined ? `(n=${cycleN})` : '',
  ]
  return parts.filter(Boolean).join(' ')
}

function truncateLabel(s: string, max: number) {
  if (s.length <= max) {
    return s
  }
  return `${s.slice(0, max - 1)}…`
}
