'use client'

import { useMemo } from 'react'
import { D3ColumnChart, type D3ColumnDatum } from '@/components/charts/d3/d3-column-chart'
import { D3DonutChart, type D3DonutSlice } from '@/components/charts/d3/d3-donut-chart'
import { D3HorizontalBarChart, type D3HBarRow } from '@/components/charts/d3/d3-horizontal-bars'
import type { SprintMetricsDocument } from '@/modules/metrics/types'

type Props = {
  metrics: SprintMetricsDocument
  onExplainRequest?: (title: string, description: string) => void
}

const PALETTE = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#64748b']
const BACKLOG_STATUS_RE = /(to do|to-do|backlog|triage|new|open|pendente|tarefas pendentes)/i

function normalizeWorkflowStatusLabel(status: string): string {
  const s = status.trim()
  if (BACKLOG_STATUS_RE.test(s)) {
    return 'Backlog'
  }
  return s || '—'
}

export function SprintAdvancedCharts({ metrics, onExplainRequest }: Props) {
  const scopeCols: D3ColumnDatum[] = useMemo(
    () => [
      {
        x: 'Planejado (pts)',
        value: Math.round((metrics.storyPointsCommitted ?? 0) * 10) / 10,
        color: '#818cf8',
      },
      {
        x: 'Escopo + (pts)',
        value: Math.round((metrics.storyPointsAddedDuringSprint ?? 0) * 10) / 10,
        color: '#f472b6',
      },
      {
        x: 'Spill (pts)',
        value: Math.round((metrics.storyPointsSpillover ?? 0) * 10) / 10,
        color: '#fbbf24',
      },
    ],
    [metrics.storyPointsAddedDuringSprint, metrics.storyPointsCommitted, metrics.storyPointsSpillover],
  )

  const depthCols: D3ColumnDatum[] = useMemo(() => {
    const rows: D3ColumnDatum[] = []
    const L = (a: number | null | undefined, label: string, c: string) => {
      if (a != null && Number.isFinite(a)) {
        rows.push({ x: label, value: Number(a.toFixed(2)), color: c })
      }
    }
    L(metrics.leadTimeDaysAvg, 'Lead μ', '#a78bfa')
    L(metrics.leadTimeDaysMedian, 'Lead med', '#8b5cf6')
    L(metrics.leadTimeDaysP85, 'Lead P85', '#c4b5fd')
    L(metrics.cycleTimeDaysAvg, 'Cycle μ', '#34d399')
    L(metrics.cycleTimeDaysMedian, 'Cycle med', '#10b981')
    L(metrics.cycleTimeDaysP85, 'Cycle P85', '#6ee7b7')
    return rows
  }, [
    metrics.cycleTimeDaysAvg,
    metrics.cycleTimeDaysMedian,
    metrics.cycleTimeDaysP85,
    metrics.leadTimeDaysAvg,
    metrics.leadTimeDaysMedian,
    metrics.leadTimeDaysP85,
  ])

  const timeInRows: D3HBarRow[] = useMemo(() => {
    const list = metrics.timeInStatus ?? []
    return list.slice(0, 10).map((t, i) => {
      const label = normalizeWorkflowStatusLabel(t.status)
      return {
        yLabel: label.length > 32 ? `${label.slice(0, 31)}…` : label,
        value: Math.round(t.daysAvg * 100) / 100,
        fullName: label,
        detail: `${t.daysAvg.toFixed(2)} d · ${t.issueCount} issues`,
        color: PALETTE[i % PALETTE.length]!,
      }
    })
  }, [metrics.timeInStatus])

  const mix: D3DonutSlice[] = useMemo(() => {
    const rows = metrics.deliveryMixByType ?? []
    return rows.slice(0, 8).map((r, i) => ({
      name: r.issueType.length > 16 ? `${r.issueType.slice(0, 15)}…` : r.issueType,
      value: r.storyPoints,
      full: r.issueType,
      color: PALETTE[i % PALETTE.length]!,
    }))
  }, [metrics.deliveryMixByType])

  const h = Math.max(220, timeInRows.length * 32)

  if (
    scopeCols.every((c) => c.value === 0) &&
    depthCols.length === 0 &&
    timeInRows.length === 0 &&
    mix.length === 0
  ) {
    return null
  }

  return (
    <div className="mt-10 space-y-8 border-t border-secondary-light pt-10 dark:border-secondary-dark">
      <h3 className="font-brand text-base font-semibold text-neutral-900 dark:text-white">
        Previsibilidade, fluxo e mix
      </h3>
      <p className="max-w-3xl text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        Heurísticas de colunas/labels; lead/cycle com mediana e P85; tempo em coluna a partir de histórico de
        transições de status. Leitura gerencial, não comparação punitiva entre pessoas.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {scopeCols.some((c) => c.value > 0) ? (
          <div className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-700/80 dark:from-slate-900/90 dark:to-slate-950/50">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Escopo (story points)</h4>
            {onExplainRequest ? (
              <button
                type="button"
                className="mt-2 rounded-md border border-slate-300/80 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
                onClick={() =>
                  onExplainRequest(
                    'Escopo (story points)',
                    'Mostra pontos planejados, pontos adicionados durante a sprint e spillover.\n\nUse para avaliar estabilidade de escopo e disciplina de planejamento.',
                  )
                }
              >
                Saiba mais
              </button>
            ) : null}
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Planejado = sem flag «adicionada na sprint»; escopo + e spill conforme flags.
            </p>
            <div className="mt-4 min-h-[260px]">
              <D3ColumnChart data={scopeCols} height={240} yLabel={(n) => String(n)} />
            </div>
          </div>
        ) : null}

        {depthCols.length > 0 ? (
          <div className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-700/80 dark:from-slate-900/90 dark:to-slate-950/50">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lead & cycle (dias)</h4>
            {onExplainRequest ? (
              <button
                type="button"
                className="mt-2 rounded-md border border-slate-300/80 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
                onClick={() =>
                  onExplainRequest(
                    'Lead & cycle (dias)',
                    'Este gráfico compara dois tempos das issues entregues:\n\n• Lead time: da criação até a resolução.\n• Cycle time: do início do trabalho (1ª mudança de status no changelog) até a resolução.\n\nPara cada um deles mostramos 3 visões:\n\n1) Média (μ)\nÉ o valor médio geral. Boa para noção rápida, mas pode subir bastante se poucas issues demorarem muito.\n\n2) Mediana (med)\nÉ o valor do “meio” (50% das issues ficaram abaixo e 50% acima). Normalmente é a leitura mais estável do dia a dia.\n\n3) P85\nÉ o tempo em que 85% das issues terminaram até aquele ponto. Mostra a “cauda” dos casos mais lentos.\n\nComo interpretar de forma simples:\n\n• Média perto da mediana: fluxo mais previsível.\n• Média muito acima da mediana: existem outliers puxando para cima.\n• P85 muito acima da mediana: parte relevante das issues está demorando bem mais que o normal.\n• Lead muito maior que cycle: muita espera antes de começar o trabalho.\n\nExemplo rápido:\nSe o cycle mediano for 3 dias e o P85 for 9 dias, o time geralmente entrega em ~3 dias, mas há um grupo importante que leva até ~9 dias.',
                  )
                }
              >
                Saiba mais
              </button>
            ) : null}
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Média, mediana e P85 (entregues).</p>
            <div className="mt-4 min-h-[280px]">
              <D3ColumnChart
                data={depthCols}
                height={260}
                yLabel={(n) => `${n} d`}
                maxBarWidth={40}
              />
            </div>
          </div>
        ) : null}
      </div>

      {timeInRows.length > 0 ? (
        <div className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-700/80 dark:from-slate-900/90 dark:to-slate-950/50">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tempo médio por coluna (dias)</h4>
          {onExplainRequest ? (
            <button
              type="button"
              className="mt-2 rounded-md border border-slate-300/80 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
              onClick={() =>
                onExplainRequest(
                  'Tempo médio por coluna (dias)',
                  'Mede tempo médio por estado de workflow com base no changelog das issues.\n\nNão representa exatamente as colunas visuais do board; representa os status do workflow.',
                )
              }
            >
              Saiba mais
            </button>
          ) : null}
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Rótulos = <strong className="font-medium text-slate-600 dark:text-slate-300">estados de workflow</strong> do Jira
            (changelog), não as colunas do teu board — o projeto pode ter estados fora do quadro. Soma o tempo
            <strong className="font-medium text-slate-600 dark:text-slate-300"> em todo o histórico</strong> da issue até
            resolução ou sincronização, não só o tempo dentro desta sprint.
          </p>
          <div className="mt-4 min-w-0">
            <D3HorizontalBarChart data={timeInRows} height={h} hoverTint="rgba(99, 102, 241, 0.08)" />
          </div>
        </div>
      ) : null}

      {mix.length > 0 ? (
        <div className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-700/80 dark:from-slate-900/90 dark:to-slate-950/50">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Mix de entregas por tipo</h4>
          {onExplainRequest ? (
            <button
              type="button"
              className="mt-2 rounded-md border border-slate-300/80 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
              onClick={() =>
                onExplainRequest(
                  'Mix de entregas por tipo',
                  'Mostra a distribuição do esforço entregue por tipo de issue (em story points).\n\nAjuda a equilibrar leitura entre evolução de produto, bugs e melhorias técnicas.',
                )
              }
            >
              Saiba mais
            </button>
          ) : null}
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Proporção em story points (entregues).</p>
          <div className="mt-4 flex min-h-[280px] items-center justify-center">
            <D3DonutChart data={mix} height={280} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
