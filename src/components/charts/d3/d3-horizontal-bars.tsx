'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { axisBottom } from 'd3-axis'
import { select } from 'd3-selection'
import { scaleBand, scaleLinear } from 'd3-scale'
import { AXIS_STROKE, AXIS_TEXT, CHART_GRID } from './chart-skin'
import { useChartBox } from './useChartBox'

export type D3HBarRow = {
  yLabel: string
  value: number
  fullName: string
  /** Texto de detalhe no tooltip, ex. "3 story points" */
  detail: string
  color: string
}

type Props = {
  data: D3HBarRow[]
  height: number
  xInteger?: boolean
  /** Cor do highlight ao pairar, ex. rgba(99, 102, 241, 0.08) */
  hoverTint?: string
}

const yPad = 0.12
const PAD_X = 8
const FONT = 12
/** Largura mín. da coluna de nomes (px) */
const LABEL_COL_MIN = 100
const LABEL_COL_MAX = 300

/**
 * Largura estimada para a coluna de rótulos (nomes) sem usar coord. negativas
 * (evita corte do SVG, que só mostra [0, width[ por defeito).
 */
function labelColumnWidthPx(labels: string[]): number {
  const maxLen = Math.max(1, ...labels.map((s) => s.length))
  const ch = 6.2 * (FONT / 12)
  const w = Math.ceil(PAD_X + maxLen * ch + 8)
  return Math.max(LABEL_COL_MIN, Math.min(LABEL_COL_MAX, w))
}

export function D3HorizontalBarChart({ data, height, xInteger, hoverTint }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const m = { top: 8, right: 16, bottom: 8, left: 8 }
  const { ref: boxRef, w, h } = useChartBox(height)
  const [tip, setTip] = useState<{
    left: number
    top: number
    title: string
    line: string
  } | null>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    const elBox = boxRef.current
    if (!svg || !elBox || data.length < 1) {
      return
    }
    const rect = elBox.getBoundingClientRect()
    const rw = Math.floor(rect.width)
    const rh = Math.max(1, Math.floor(rect.height) || height)
    if (rw < 8 || rh < 8) {
      return
    }

    const yLabels = data.map((d) => d.yLabel)
    const labelW = labelColumnWidthPx(yLabels)
    const innerLeft = m.left + labelW
    const innerW = rw - innerLeft - m.right
    const innerH = rh - m.top - m.bottom
    if (innerW < 40 || innerH < 0) {
      return
    }

    const yScale = scaleBand()
      .domain(data.map((d) => d.yLabel))
      .range([0, innerH])
      .padding(yPad)

    const xMax = Math.max(1, ...data.map((d) => d.value)) * 1.02
    const x = scaleLinear().domain([0, xMax]).range([0, innerW])

    const gRoot = select(svg)
    gRoot.selectAll('*').remove()
    gRoot.attr('width', rw).attr('height', rh)

    /** Nomes: só coordenadas x &gt; 0 — à direita do bloco de etiquetas */
    const gLabels = gRoot.append('g').attr('class', 'hbar-labels').attr('transform', `translate(${m.left},${m.top})`)
    yLabels.forEach((lab) => {
      const y0 = yScale(lab) ?? 0
      const yc = y0 + yScale.bandwidth() / 2
      gLabels
        .append('text')
        .attr('x', labelW - 4)
        .attr('y', yc)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', FONT)
        .attr('font-weight', 500)
        .attr('fill', AXIS_TEXT)
        .text(lab)
    })

    const g = gRoot.append('g').attr('transform', `translate(${innerLeft},${m.top})`)

    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(x.ticks(5))
      .join('line')
      .attr('x1', (d) => x(d))
      .attr('x2', (d) => x(d))
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', CHART_GRID)

    const gx = g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        axisBottom(x)
          .ticks(5)
          .tickSizeOuter(0)
          .tickFormat((d) => (xInteger ? String(Math.round(Number(d))) : String(d))),
      )
    gx.selectAll('.domain, .tick line').attr('stroke', AXIS_STROKE)
    gx.selectAll('.tick text').attr('font-size', 11).attr('font-weight', 500).attr('fill', AXIS_TEXT)

    const rowH = yScale.bandwidth()
    const maxBarH = Math.min(28, rowH - 2)

    g.selectAll('rect.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => (yScale(d.yLabel) ?? 0) + (rowH - maxBarH) / 2)
      .attr('width', (d) => x(d.value))
      .attr('height', maxBarH)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', (d) => d.color)
      .style('pointer-events', 'none')

    g.selectAll('rect.hit')
      .data(data)
      .join('rect')
      .attr('class', 'hit')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.yLabel) ?? 0)
      .attr('width', innerW)
      .attr('height', rowH)
      .attr('fill', 'transparent')
      .style('cursor', 'default')
      .on('pointerenter', (event, d) => {
        g.selectAll('rect.tint').remove()
        if (hoverTint) {
          g.append('rect')
            .attr('class', 'tint')
            .attr('x', 0)
            .attr('y', yScale(d.yLabel) ?? 0)
            .attr('width', innerW)
            .attr('height', rowH)
            .attr('fill', hoverTint)
            .lower()
        }
        const box = elBox.getBoundingClientRect()
        setTip({
          left: event.clientX - box.left - 100,
          top: event.clientY - box.top - 56,
          title: d.fullName,
          line: d.detail,
        })
      })
      .on('pointermove', (event) => {
        const box = elBox.getBoundingClientRect()
        setTip((prev) =>
          prev
            ? {
                ...prev,
                left: event.clientX - box.left - 100,
                top: event.clientY - box.top - 56,
              }
            : null,
        )
      })
      .on('pointerleave', () => {
        g.selectAll('rect.tint').remove()
        setTip(null)
      })
  }, [data, w, h, height, xInteger, hoverTint, m.top, m.right, m.bottom, m.left, boxRef])

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
          className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-600 dark:bg-slate-800"
          style={{ left: tip.left, top: tip.top, maxWidth: 240 }}
        >
          <p className="font-medium text-slate-900 dark:text-slate-100">{tip.title}</p>
          <p className="text-slate-600 dark:text-slate-300">{tip.line}</p>
        </div>
      ) : null}
    </div>
  )
}
