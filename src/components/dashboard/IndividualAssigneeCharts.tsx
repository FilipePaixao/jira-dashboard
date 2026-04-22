'use client'

import { useMemo, type ReactNode } from 'react'
import { D3ColumnChart, type D3ColumnDatum } from '@/components/charts/d3/d3-column-chart'
import { D3HorizontalBarChart, type D3HBarRow } from '@/components/charts/d3/d3-horizontal-bars'
import type { IndividualAssigneeRow } from '@/modules/metrics/individual-analysis'

const PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#64748b',
]

function trunc(s: string, max: number): string {
  const t = s.trim()
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

type Props = {
  row: IndividualAssigneeRow
}

export function IndividualAssigneeCharts({ row }: Props) {
  const categoryRows: D3HBarRow[] = useMemo(
    () =>
      row.topCategories.map((c, i) => ({
        yLabel: trunc(c.name, 26),
        value: c.storyPoints,
        fullName: c.name,
        detail: `${c.storyPoints} pts · ${c.issues} issues`,
        color: PALETTE[i % PALETTE.length]!,
      })),
    [row.topCategories],
  )

  const tempoColumns: D3ColumnDatum[] = useMemo(() => {
    const out: D3ColumnDatum[] = []
    if (row.leadTimeDaysAvg !== null) {
      out.push({
        x: 'Lead (d)',
        value: Number(row.leadTimeDaysAvg.toFixed(2)),
        color: '#a78bfa',
      })
    }
    if (row.cycleTimeDaysAvg !== null) {
      out.push({
        x: 'Cycle (d)',
        value: Number(row.cycleTimeDaysAvg.toFixed(2)),
        color: '#818cf8',
      })
    }
    return out
  }, [row.leadTimeDaysAvg, row.cycleTimeDaysAvg])

  const fluxoColumns: D3ColumnDatum[] = useMemo(
    () => [
      { x: 'Spillover', value: row.spilloverCount, color: '#fbbf24' },
      { x: 'Escopo +', value: row.scopeAddedCount, color: '#f472b6' },
    ],
    [row.spilloverCount, row.scopeAddedCount],
  )

  const catHeight = Math.max(200, categoryRows.length * 34 + 24)

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        Métricas em gráfico (recorte atual)
      </h4>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Leitura de diagnóstico: combinação de entrega (tipos), tempo médio e sinais de risco de fluxo.
      </p>

      {categoryRows.length > 0 ? (
        <ChartCard
          title="Story points por tipo de issue"
          subtitle="Tipos com mais pontos entregues neste recorte (até 5)."
        >
          <D3HorizontalBarChart
            data={categoryRows}
            height={catHeight}
            xInteger
            hoverTint="rgba(99, 102, 241, 0.08)"
          />
        </ChartCard>
      ) : (
        <p className="rounded-xl border border-secondary-light/70 bg-surface-light/30 px-4 py-3 text-sm text-neutral-500 dark:border-secondary-dark dark:bg-[#1a1a1a]/60">
          Sem tipos de issue com pontos neste recorte — não há gráfico de categorias.
        </p>
      )}

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {tempoColumns.length > 0 ? (
          <ChartCard
            title="Tempos médios (dias)"
            subtitle={`Lead: criação → resolução (n=${row.leadSampleCount}) · Cycle: 1.º trabalho → resolução (n=${row.cycleSampleCount})`}
          >
            <D3ColumnChart
              data={tempoColumns}
              height={240}
              yLabel={(n) => `${n} d`}
              maxBarWidth={64}
            />
          </ChartCard>
        ) : (
          <div className="rounded-xl border border-dashed border-secondary-light/80 bg-surface-light/30 px-4 py-6 text-sm text-neutral-500 dark:border-secondary-dark dark:bg-[#1a1a1a]/50">
            Tempos médios indisponíveis: sem amostras suficientes de lead/cycle no recorte.
          </div>
        )}

        <ChartCard
          title="Spillover e escopo adicionado"
          subtitle="Contagens de issues (sinais de pressão de fluxo — interpretar em contexto)."
        >
          <D3ColumnChart data={fluxoColumns} height={240} maxBarWidth={72} />
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-secondary-light/80 bg-surface-light/40 p-4 dark:border-secondary-dark dark:bg-[#252525]/50">
      <h5 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{title}</h5>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
      <div className="mt-3 min-h-[120px] min-w-0">{children}</div>
    </div>
  )
}
