'use client'

import { useMemo } from 'react'
import { D3LineChart, type D3LineChartPoint } from '@/components/charts/d3/d3-line-chart'
import { D3GroupedBarChart, type D3SeriesKey } from '@/components/charts/d3/d3-grouped-bar-chart'

type Row = {
  label: string
  sprintId: string
  velocityPts: number
  issuesOut: number
  committed: number
  delivered: number
  spillover: number
}

const commitmentSeries: D3SeriesKey[] = [
  { key: 'Committed', label: 'Committed', color: '#818cf8' },
  { key: 'Entregues', label: 'Entregues', color: '#34d399' },
  { key: 'Spillover', label: 'Spillover', color: '#fbbf24' },
]

type Props = {
  chronological: Row[]
}

export function ConsolidatedVisualizations({ chronological }: Props) {
  const lineData: D3LineChartPoint[] = useMemo(
    () =>
      chronological.map((r) => ({
        x: r.label,
        y: r.velocityPts,
        tooltipTitle: `Sprint: ${r.label}`,
        tooltipLine: `${r.velocityPts} story points entregues`,
      })),
    [chronological],
  )

  const barRows = useMemo(
    () =>
      chronological.map((r) => ({
        sprint: r.label,
        Committed: r.committed,
        Entregues: r.delivered,
        Spillover: r.spillover,
      })),
    [chronological],
  )

  if (chronological.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-700/80 dark:from-slate-900/90 dark:to-slate-950/50">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Tendência — story points entregues
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Ordem cronológica pela data de sincronização no MongoDB (proxy da sequência de sprints
          sincronizadas).
        </p>
        <div className="mt-4 h-[300px] w-full min-w-0">
          <D3LineChart
            data={lineData}
            height={300}
            lineColor="#6366f1"
            yTickFormat={(n) => String(Math.round(n))}
            marginBottom={70}
            xAxisAngle={-25}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-700/80 dark:from-slate-900/90 dark:to-slate-950/50">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Comparativo — committed, entregues e spillover
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Contagens por sprint; categorias podem sobrepor-se conceitualmente (leitura gerencial).
        </p>
        <div className="mt-4 h-[320px] w-full min-w-0">
          <D3GroupedBarChart
            rows={barRows}
            categoryKey="sprint"
            series={commitmentSeries}
            height={320}
            xLabelRotate={-25}
            xAxisHeight={70}
          />
        </div>
      </div>
    </div>
  )
}
