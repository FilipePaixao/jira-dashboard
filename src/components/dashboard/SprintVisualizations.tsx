'use client'

import { useMemo, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Metrics = {
  velocityStoryPoints: number
  velocityIssues: number
  storyPointsDelivered: number
  issuesDelivered: number
  leadTimeDaysAvg: number | null
  cycleTimeDaysAvg: number | null
  throughput: number
  committedCount: number
  deliveredCount: number
  spilloverCount: number
  scopeAddedDuringSprint: number
  byAssignee: Record<string, { storyPoints: number; issues: number }>
}

const PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#64748b',
]

const CHART_AXIS = '#94a3b8'
const CHART_GRID = 'rgba(148, 163, 184, 0.25)'

type Props = {
  metrics: Metrics
}

export function SprintVisualizations({ metrics }: Props) {
  const byPerson = useMemo(() => {
    return Object.entries(metrics.byAssignee)
      .map(([name, v]) => ({
        nome: truncateLabel(name, 22),
        nomeCompleto: name,
        pontos: v.storyPoints,
        issues: v.issues,
      }))
      .sort((a, b) => b.pontos - a.pontos || b.issues - a.issues)
  }, [metrics.byAssignee])

  const donutData = useMemo(() => {
    const rows = Object.entries(metrics.byAssignee)
      .filter(([, v]) => v.storyPoints > 0)
      .map(([name, v]) => ({ name: truncateLabel(name, 18), value: v.storyPoints, full: name }))
    const sum = rows.reduce((s, r) => s + r.value, 0)
    if (sum === 0 && metrics.storyPointsDelivered > 0) {
      return [{ name: 'Sem atribuição', value: metrics.storyPointsDelivered, full: 'Sem atribuição' }]
    }
    return rows
  }, [metrics.byAssignee, metrics.storyPointsDelivered])

  const comparisonBars = useMemo(
    () => [
      { rotulo: 'Committed', valor: metrics.committedCount, fill: '#818cf8' },
      { rotulo: 'Entregues', valor: metrics.deliveredCount, fill: '#34d399' },
      { rotulo: 'Spillover', valor: metrics.spilloverCount, fill: '#fbbf24' },
      { rotulo: 'Escopo + na sprint', valor: metrics.scopeAddedDuringSprint, fill: '#f472b6' },
    ],
    [
      metrics.committedCount,
      metrics.deliveredCount,
      metrics.spilloverCount,
      metrics.scopeAddedDuringSprint,
    ],
  )

  const tempoData = useMemo(() => {
    const lead = metrics.leadTimeDaysAvg
    const cycle = metrics.cycleTimeDaysAvg
    const rows: { metrica: string; dias: number }[] = []
    if (lead !== null) {
      rows.push({ metrica: 'Lead time (d)', dias: Number(lead.toFixed(2)) })
    }
    if (cycle !== null) {
      rows.push({ metrica: 'Cycle time (d)', dias: Number(cycle.toFixed(2)) })
    }
    return rows
  }, [metrics.leadTimeDaysAvg, metrics.cycleTimeDaysAvg])

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Pontos por pessoa"
          subtitle="Comparativo de story points nas entregas atribuídas"
        >
          {byPerson.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(280, byPerson.length * 36)}>
              <BarChart
                data={byPerson}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" stroke={CHART_AXIS} fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={108}
                  stroke={CHART_AXIS}
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip content={<TooltipPts />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                <Bar dataKey="pontos" name="Story points" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {byPerson.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Issues entregues por pessoa"
          subtitle="Volume de itens concluídos por responsável"
        >
          {byPerson.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(280, byPerson.length * 36)}>
              <BarChart
                data={byPerson}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" stroke={CHART_AXIS} fontSize={11} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={108}
                  stroke={CHART_AXIS}
                  fontSize={11}
                />
                <Tooltip content={<TooltipIssues />} cursor={{ fill: 'rgba(6, 182, 212, 0.08)' }} />
                <Bar dataKey="issues" name="Issues" fill="#06b6d4" radius={[0, 6, 6, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Distribuição de pontos"
          subtitle="Proporção dos story points entre pessoas (entregas)"
        >
          {donutData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center sm:flex-row">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipDonut />} />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    wrapperStyle={{ fontSize: 12, paddingLeft: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Comparativo de fluxo"
          subtitle="Contagens para leitura gerencial (podem sobrepor-se conceitualmente)"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonBars} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="rotulo" stroke={CHART_AXIS} fontSize={11} tickLine={false} />
              <YAxis stroke={CHART_AXIS} fontSize={11} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [Number(v ?? 0), 'Quantidade']}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid rgb(226 232 240)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {comparisonBars.map((entry) => (
                  <Cell key={entry.rotulo} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {tempoData.length > 0 ? (
        <ChartCard
          title="Tempo médio (dias)"
          subtitle="Lead time e cycle time médios nas entregas (proxy created→resolvido)"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tempoData} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="metrica" stroke={CHART_AXIS} fontSize={12} />
              <YAxis stroke={CHART_AXIS} fontSize={11} />
              <Tooltip
                formatter={(v) => [`${Number(v ?? 0)} dias`, '']}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="dias" fill="#a78bfa" radius={[6, 6, 0, 0]} maxBarSize={72} name="Dias" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : null}
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
    <div className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-700/80 dark:from-slate-900/90 dark:to-slate-950/50">
      <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h3>
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

function truncateLabel(s: string, max: number) {
  if (s.length <= max) {
    return s
  }
  return `${s.slice(0, max - 1)}…`
}

function TooltipPts({ active, payload }: { active?: boolean; payload?: Array<{ payload: { nomeCompleto: string; pontos: number } }> }) {
  if (!active || !payload?.length) {
    return null
  }
  const p = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-600 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-slate-100">{p.nomeCompleto}</p>
      <p className="text-slate-600 dark:text-slate-300">{p.pontos} story points</p>
    </div>
  )
}

function TooltipIssues({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { nomeCompleto: string; issues: number } }>
}) {
  if (!active || !payload?.length) {
    return null
  }
  const p = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-600 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-slate-100">{p.nomeCompleto}</p>
      <p className="text-slate-600 dark:text-slate-300">{p.issues} issues entregues</p>
    </div>
  )
}

function TooltipDonut({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { full?: string } }>
}) {
  if (!active || !payload?.length) {
    return null
  }
  const p = payload[0]
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-600 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-slate-100">
        {p.payload?.full ?? p.name}
      </p>
      <p className="text-slate-600 dark:text-slate-300">{p.value} pts</p>
    </div>
  )
}
