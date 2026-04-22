'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { arc, pie, type PieArcDatum } from 'd3-shape'
import { select } from 'd3-selection'
import { AXIS_TEXT } from './chart-skin'
import { useChartBox } from './useChartBox'

export type D3DonutSlice = { name: string; value: number; full: string; color: string }

type Props = {
  data: D3DonutSlice[]
  height: number
}

const innerR = 0.45
const pad = 0.02

export function D3DonutChart({ data, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { ref: boxRef, w, h } = useChartBox(height)
  const [tip, setTip] = useState<{
    x: number
    y: number
    title: string
    value: string
  } | null>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    const box = boxRef.current
    if (!svg || !box || data.length < 1) {
      return
    }
    const rect = box.getBoundingClientRect()
    const rw = Math.floor(rect.width)
    const rh = Math.max(1, Math.floor(rect.height) || height)
    if (rw < 8 || rh < 8) {
      return
    }

    const gRoot = select(svg)
    gRoot.selectAll('*').remove()
    gRoot.attr('width', rw).attr('height', rh)

    const legW = Math.min(200, Math.max(120, Math.floor(rw * 0.38)))
    const chartW = rw - legW - 12
    const r = Math.max(4, Math.min(chartW, rh) / 2 - 6)
    const cx = chartW / 2
    const cy = rh / 2
    if (r < 6) {
      return
    }

    const p = pie<D3DonutSlice>()
      .value((d) => d.value)
      .padAngle(pad * Math.PI * 2)

    const a = arc<PieArcDatum<D3DonutSlice>>()
      .innerRadius(r * innerR)
      .outerRadius(r)
      .cornerRadius(1)

    const g = gRoot.append('g').attr('transform', `translate(${cx},${cy})`)

    const slices = p(data)

    g.selectAll('path')
      .data(slices)
      .join('path')
      .attr('d', a)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', 'none')
      .style('cursor', 'default')
      .on('pointerenter', (event, s) => {
        const b = (event.target as SVGPathElement).getBoundingClientRect()
        const br = boxRef.current?.getBoundingClientRect()
        if (br) {
          setTip({
            x: b.left - br.left + b.width / 2,
            y: b.top - br.top + b.height / 2,
            title: s.data.full,
            value: `${s.data.value} pts`,
          })
        }
      })
      .on('pointerleave', () => setTip(null))

    const legX = chartW + 8
    const leg = gRoot.append('g').attr('transform', `translate(${legX}, 20)`)
    data.forEach((d, i) => {
      const y = i * 24
      leg.append('rect').attr('x', 0).attr('y', y - 9).attr('width', 10).attr('height', 10).attr('fill', d.color).attr('rx', 2)
      leg
        .append('text')
        .attr('x', 16)
        .attr('y', y)
        .attr('font-size', 12)
        .attr('font-weight', 500)
        .attr('fill', AXIS_TEXT)
        .text(d.name.length > 22 ? `${d.name.slice(0, 21)}…` : d.name)
    })
  }, [data, w, h, height, boxRef])

  if (data.length < 1) {
    return null
  }

  return (
    <div
      ref={boxRef}
      className="relative w-full min-w-0 text-slate-600 dark:text-slate-300"
      style={{ height, minHeight: height }}
    >
      <svg ref={svgRef} className="h-full w-full max-w-full overflow-visible" role="img" aria-hidden />
      {tip ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-slate-600 dark:bg-slate-800"
          style={{ left: tip.x, top: tip.y }}
        >
          <p className="font-medium text-slate-900 dark:text-slate-100">{tip.title}</p>
          <p className="text-slate-600 dark:text-slate-300">{tip.value}</p>
        </div>
      ) : null}
    </div>
  )
}
