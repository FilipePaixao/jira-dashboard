'use client'

import { useMemo } from 'react'
import type { VelocitySeriesPoint } from '@/modules/metrics/velocity-series'
import { D3LineChart, type D3LineChartPoint } from '@/components/charts/d3/d3-line-chart'

function shortName(name: string, id: string, max = 18): string {
  const s = name.trim() || id
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`
}

type Props = {
  series: VelocitySeriesPoint[]
}

export function VelocitySeriesChart({ series }: Props) {
  const data: D3LineChartPoint[] = useMemo(
    () =>
      series.map((p) => {
        const label = shortName(p.sprintName, p.sprintId)
        return {
          x: label,
          y: p.velocityStoryPoints,
          tooltipTitle: `${p.sprintName} (ID ${p.sprintId})`,
          tooltipLine: `${p.velocityStoryPoints} story points entregues`,
        }
      }),
    [series],
  )

  if (data.length < 2) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Sincronize pelo menos duas sprints para ver a tendência de velocidade (story points entregues).
      </p>
    )
  }

  return (
    <div className="h-[300px] w-full min-w-0">
      <D3LineChart
        data={data}
        height={300}
        lineColor="#ee2e24"
        yTickFormat={(n) => String(Math.round(n))}
        marginBottom={64}
      />
    </div>
  )
}
