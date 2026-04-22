'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { axisBottom, axisLeft } from 'd3-axis'
import { select } from 'd3-selection'
import { scaleBand, scaleLinear } from 'd3-scale'
import { AXIS_STROKE, AXIS_TEXT, CHART_GRID } from './chart-skin'
import { useChartBox } from './useChartBox'

export type D3SeriesKey = { key: string; label: string; color: string }

type Row = Record<string, string | number>

type Props = {
  rows: Row[]
  categoryKey: string
  series: D3SeriesKey[]
  height: number
  xLabelRotate?: number
  xAxisHeight?: number
  /** Largura reservada para o eixo Y (valores numéricos) */
  yGutter?: number
}

const sideBase = { top: 32, right: 14, left: 8, bottom: 8 }

export function D3GroupedBarChart({
  rows,
  categoryKey,
  series,
  height,
  xLabelRotate = -25,
  xAxisHeight = 70,
  yGutter = 48,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { ref: boxRef, w, h } = useChartBox(height)
  const [tip, setTip] = useState<{
    x: number
    y: number
    text: string
  } | null>(null)

  const xAxisH = useMemo(() => Math.max(32, xAxisHeight), [xAxisHeight])
  const margin = useMemo(
    () => ({ ...sideBase, left: yGutter, bottom: xAxisH }),
    [xAxisH, yGutter],
  )

  useLayoutEffect(() => {
    const svg = svgRef.current
    const box = boxRef.current
    if (!svg || !box || rows.length < 1) {
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

    const categories = rows.map((r) => String(r[categoryKey] ?? ''))
    const x0 = scaleBand().domain(categories).range([0, innerW]).padding(0.2)
    const x1 = scaleBand()
      .domain(series.map((s) => s.key))
      .range([0, x0.bandwidth()])
      .padding(0.1)

    const yMax = Math.max(
      0.1,
      ...rows.flatMap((r) => series.map((s) => Number(r[s.key] ?? 0))),
    ) * 1.08
    const y = scaleLinear().domain([0, yMax]).nice().range([innerH, 0])

    const gRoot = select(svg)
    gRoot.selectAll('*').remove()
    gRoot.attr('width', rw).attr('height', rh)
    const g = gRoot.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const leg = g.append('g').attr('class', 'legend')
    series.forEach((s, i) => {
      const lx = i * 128
      leg.append('rect').attr('x', lx).attr('y', -24).attr('width', 10).attr('height', 10).attr('fill', s.color).attr('rx', 2)
      leg
        .append('text')
        .attr('x', lx + 14)
        .attr('y', -16)
        .attr('font-size', 12)
        .attr('font-weight', 500)
        .attr('fill', AXIS_TEXT)
        .text(s.label)
    })

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
        axisBottom(x0)
          .tickSizeOuter(0)
          .tickSizeInner(0),
      )
    gx.selectAll('.domain, .tick line').attr('stroke', AXIS_STROKE)
    const xText = gx.selectAll('.tick text')
    xText
      .attr('font-size', 11)
      .attr('font-weight', 500)
      .attr('fill', AXIS_TEXT)
    if (xLabelRotate) {
      xText
        .attr('transform', `rotate(${xLabelRotate})`)
        .style('text-anchor', 'end')
        .attr('dx', '-0.35em')
        .attr('dy', '0.65em')
    } else {
      xText.style('text-anchor', 'middle').attr('dy', '0.9em')
    }

    const gy = g
      .append('g')
      .attr('class', 'axis axis--y')
      .call(
        axisLeft(y)
          .ticks(5)
          .tickSizeOuter(0)
          .tickFormat((d) => String(Math.round(Number(d)))),
      )
    gy.selectAll('.domain, .tick line').attr('stroke', AXIS_STROKE)
    gy.selectAll('.tick text').attr('font-size', 12).attr('font-weight', 500).attr('fill', AXIS_TEXT)

    const barLayer = g.append('g').attr('class', 'bars')
    const cellData = rows.flatMap((d) => series.map((s) => ({ d, s })))
    barLayer
      .selectAll('rect')
      .data(cellData)
      .join('rect')
      .attr('x', ({ d, s }) => (x0(String(d[categoryKey] ?? '')) ?? 0) + (x1(s.key) ?? 0))
      .attr('y', ({ d, s }) => y(Number(d[s.key] ?? 0)))
      .attr('width', x1.bandwidth())
      .attr('height', ({ d, s }) => innerH - y(Number(d[s.key] ?? 0)))
      .attr('fill', ({ s }) => s.color)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', 'default')
      .on('pointerenter', (event, { d, s }) => {
        const r = (event.target as SVGRectElement).getBoundingClientRect()
        const br = boxRef.current?.getBoundingClientRect()
        if (br) {
          setTip({
            x: r.left - br.left + r.width / 2,
            y: r.top - br.top,
            text: `${s.label}: ${Number(d[s.key] ?? 0)}`,
          })
        }
      })
      .on('pointerleave', () => setTip(null))
  }, [rows, categoryKey, series, w, h, height, xLabelRotate, margin, boxRef])

  if (rows.length < 1) {
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
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          {tip.text}
        </div>
      ) : null}
    </div>
  )
}
