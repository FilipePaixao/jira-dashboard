'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { axisBottom, axisLeft } from 'd3-axis'
import { select } from 'd3-selection'
import { scaleBand, scaleLinear } from 'd3-scale'
import { AXIS_STROKE, AXIS_TEXT, CHART_GRID } from './chart-skin'
import { useChartBox } from './useChartBox'

export type D3ColumnDatum = {
  x: string
  value: number
  color: string
}

type Props = {
  data: D3ColumnDatum[]
  height: number
  yLabel?: (v: number) => string
  maxBarWidth?: number
}

const margin = { top: 16, right: 12, bottom: 36, left: 44 }

export function D3ColumnChart({ data, height, yLabel, maxBarWidth = 56 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { ref: boxRef, w, h } = useChartBox(height)
  const [tip, setTip] = useState<{ x: number; y: number; xLab: string; v: string } | null>(null)

  useLayoutEffect(() => {
    const fmtY = yLabel ?? ((n: number) => `${n}`)
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

    const innerW = rw - margin.left - margin.right
    const innerH = rh - margin.top - margin.bottom
    if (innerW < 0 || innerH < 0) {
      return
    }

    const x = scaleBand()
      .domain(data.map((d) => d.x))
      .range([0, innerW])
      .padding(0.28)

    const yMax = Math.max(0.1, ...data.map((d) => d.value)) * 1.1
    const y = scaleLinear().domain([0, yMax]).nice().range([innerH, 0])

    const gRoot = select(svg)
    gRoot.selectAll('*').remove()
    gRoot.attr('width', rw).attr('height', rh)
    const g = gRoot.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks(5))
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', CHART_GRID)

    const gx = g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        axisBottom(x)
          .tickSizeOuter(0)
          .tickSizeInner(0),
      )
    gx.selectAll('.domain, .tick line').attr('stroke', AXIS_STROKE)
    gx.selectAll('.tick text')
      .attr('font-size', 11)
      .attr('font-weight', 500)
      .attr('fill', AXIS_TEXT)
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-18)')
      .attr('dx', '-0.2em')
      .attr('dy', '0.6em')

    const gy = g
      .append('g')
      .attr('class', 'axis axis--y')
      .call(
        axisLeft(y)
          .ticks(5)
          .tickSizeOuter(0)
          .tickFormat((d) => fmtY(Number(d))),
      )
    gy.selectAll('.domain, .tick line').attr('stroke', AXIS_STROKE)
    gy.selectAll('.tick text').attr('font-size', 12).attr('font-weight', 500).attr('fill', AXIS_TEXT)

    const bw = Math.min(x.bandwidth(), maxBarWidth)
    const off = (x.bandwidth() - bw) / 2

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => (x(d.x) ?? 0) + off)
      .attr('y', (d) => y(d.value))
      .attr('width', bw)
      .attr('height', (d) => innerH - y(d.value))
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', (d) => d.color)
      .attr('data-x', (d) => d.x)
      .style('pointer-events', 'all')
      .on('pointerenter', (event, d) => {
        const r = (event.target as SVGRectElement).getBoundingClientRect()
        const br = boxRef.current?.getBoundingClientRect()
        if (br) {
          setTip({ x: r.left - br.left + r.width / 2, y: r.top - br.top, xLab: d.x, v: fmtY(d.value) })
        }
      })
      .on('pointerleave', () => setTip(null))
  }, [data, w, h, height, maxBarWidth, yLabel, boxRef])

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
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          {tip.xLab}: {tip.v}
        </div>
      ) : null}
    </div>
  )
}
