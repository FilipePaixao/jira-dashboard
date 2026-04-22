'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { axisBottom, axisLeft } from 'd3-axis'
import { pointer, select } from 'd3-selection'
import { scaleLinear, scalePoint } from 'd3-scale'
import { line as d3Line, curveMonotoneX } from 'd3-shape'
import { AXIS_STROKE, AXIS_TEXT, CHART_GRID } from './chart-skin'
import { useChartBox } from './useChartBox'

export type D3LineChartPoint = {
  x: string
  y: number
  /** Tooltip: título (ex. nome da sprint) e linha secundária opcional. */
  tooltipTitle: string
  tooltipLine?: string
}

type Props = {
  data: D3LineChartPoint[]
  height: number
  lineColor: string
  yTickFormat?: (n: number) => string
  xAxisAngle?: number
  /** margem extra em baixo se os rótulos do X forem longos/rotacionados */
  marginBottom?: number
}

const defaultMargin = { top: 8, right: 12, bottom: 60, left: 44 }

export function D3LineChart({
  data,
  height,
  lineColor,
  yTickFormat = String,
  xAxisAngle = -22,
  marginBottom: marginBottomOverride,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { ref: boxRef, w, h } = useChartBox(height)
  const margin = useMemo(
    () => ({ ...defaultMargin, bottom: marginBottomOverride ?? defaultMargin.bottom }),
    [marginBottomOverride],
  )
  const [tip, setTip] = useState<{
    left: number
    top: number
    title: string
    line?: string
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

    const innerW = rw - margin.left - margin.right
    const innerH = rh - margin.top - margin.bottom
    if (innerW < 0 || innerH < 0) {
      return
    }

    const gRoot = select(svg)
    gRoot.selectAll('*').remove()
    gRoot.attr('width', rw).attr('height', rh)
    const g = gRoot.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = scalePoint<string>()
      .domain(data.map((d) => d.x))
      .range([0, innerW])
      .padding(0.5)

    const yMax = Math.max(1, d3Max(data, (d) => d.y) * 1.05)
    const y = scaleLinear().domain([0, yMax]).nice().range([innerH, 0])

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
      .attr('stroke-width', 1)

    const gx = g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        axisBottom(xScale)
          .tickSizeOuter(0)
          .tickSizeInner(0),
      )
    gx.selectAll('.domain, .tick line').attr('stroke', AXIS_STROKE)
    gx.selectAll('.tick text')
      .attr('font-size', 11)
      .attr('fill', AXIS_TEXT)
      .attr('transform', `rotate(${xAxisAngle})`)
      .style('text-anchor', 'end')
      .attr('dx', '-0.35em')
      .attr('dy', '0.65em')

    const gy = g.append('g').attr('class', 'axis axis--y').call(
      axisLeft(y)
        .ticks(5)
        .tickSizeOuter(0)
        .tickFormat((d) => yTickFormat(Number(d)) as string),
    )
    gy.selectAll('.domain, .tick line').attr('stroke', AXIS_STROKE)
    gy.selectAll('.tick text').attr('font-size', 12).attr('fill', AXIS_TEXT)

    const pathLine = d3Line<D3LineChartPoint>()
      .x((d) => xScale(d.x) ?? 0)
      .y((d) => y(d.y))
      .curve(curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', pathLine)

    g.selectAll('circle.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.x) ?? 0)
      .attr('cy', (d) => y(d.y))
      .attr('r', 4)
      .attr('fill', lineColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('pointer-events', 'all')

    const overlay = g
      .append('rect')
      .attr('width', innerW)
      .attr('height', innerH)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')

    const updateTip = (event: PointerEvent) => {
      const [mx] = pointer(event, g.node()! as SVGGElement)
      let best = 0
      let bestD = Number.POSITIVE_INFINITY
      data.forEach((d, i) => {
        const cx = xScale(d.x) ?? 0
        const dist = Math.abs(cx - mx)
        if (dist < bestD) {
          bestD = dist
          best = i
        }
      })
      const d = data[best]!
      const cx = (xScale(d.x) ?? 0) + margin.left
      const cy = (y(d.y) ?? 0) + margin.top
      setTip({
        left: Math.min(rw - 160, Math.max(8, cx - 80)),
        top: Math.max(8, cy - 64),
        title: d.tooltipTitle,
        line: d.tooltipLine,
      })
    }

    overlay.on('pointermove', updateTip).on('pointerleave', () => setTip(null))
  }, [data, w, h, height, lineColor, margin, xAxisAngle, yTickFormat, boxRef])

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
          className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-slate-600 dark:bg-slate-800"
          style={{ left: tip.left, top: tip.top, maxWidth: 220 }}
        >
          <p className="font-medium text-slate-900 dark:text-slate-100">{tip.title}</p>
          {tip.line ? <p className="text-slate-600 dark:text-slate-300">{tip.line}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

function d3Max<T>(arr: T[], acc: (d: T) => number): number {
  return Math.max(...arr.map(acc), 0)
}
