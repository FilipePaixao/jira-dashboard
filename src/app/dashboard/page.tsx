'use client'

import { useState } from 'react'

type DashboardResponse = {
  snapshot: {
    sprintId: string
    sprintName: string
    syncedAt: string
    extractionStatus: string
  } | null
  metrics: {
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
  } | null
  disclaimer: string
  error?: string
}

export default function DashboardPage() {
  const [sprintId, setSprintId] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const id = sprintId.trim()
    if (!id) {
      setError('Informe o ID da sprint')
      return
    }
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/dashboard/sprint/${encodeURIComponent(id)}`)
      const json = (await res.json()) as DashboardResponse & { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'Falha ao carregar')
        return
      }
      setData(json)
    } catch {
      setError('Não foi possível conectar ao servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard da sprint</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Dados lidos apenas do backend (MongoDB). Informe o mesmo sprintId usado na sincronização.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Sprint ID</span>
          <input
            className="min-w-[240px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={sprintId}
            onChange={(e) => setSprintId(e.target.value)}
            placeholder="ex.: 42 ou chave interna"
          />
        </label>
        <button
          type="button"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? 'Carregando…' : 'Carregar'}
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {error}
        </p>
      ) : null}

      {data ? (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">{data.disclaimer}</p>

          {data.snapshot ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <h2 className="text-lg font-semibold">{data.snapshot.sprintName}</h2>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Sprint ID</dt>
                  <dd className="font-mono">{data.snapshot.sprintId}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Sincronizado em</dt>
                  <dd>{new Date(data.snapshot.syncedAt).toLocaleString('pt-BR')}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Extração</dt>
                  <dd>{data.snapshot.extractionStatus}</dd>
                </div>
              </dl>
            </section>
          ) : null}

          {data.metrics ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <h2 className="text-lg font-semibold">Indicadores</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Metric label="Story points entregues" value={data.metrics.storyPointsDelivered} />
                <Metric label="Issues entregues" value={data.metrics.issuesDelivered} />
                <Metric label="Velocidade (pts)" value={data.metrics.velocityStoryPoints} />
                <Metric label="Throughput" value={data.metrics.throughput} />
                <Metric
                  label="Lead time médio (dias)"
                  value={
                    data.metrics.leadTimeDaysAvg === null
                      ? '—'
                      : data.metrics.leadTimeDaysAvg.toFixed(1)
                  }
                />
                <Metric
                  label="Cycle time médio (dias)"
                  value={
                    data.metrics.cycleTimeDaysAvg === null
                      ? '—'
                      : data.metrics.cycleTimeDaysAvg.toFixed(1)
                  }
                />
                <Metric label="Committed" value={data.metrics.committedCount} />
                <Metric label="Entregues" value={data.metrics.deliveredCount} />
                <Metric label="Spillover" value={data.metrics.spilloverCount} />
                <Metric label="Escopo adicionado na sprint" value={data.metrics.scopeAddedDuringSprint} />
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Por pessoa (contextualizado)
                </h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {Object.entries(data.metrics.byAssignee).map(([name, v]) => (
                    <li
                      key={name}
                      className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
                    >
                      <span>{name}</span>
                      <span>
                        {v.storyPoints} pts · {v.issues} issues
                      </span>
                    </li>
                  ))}
                  {Object.keys(data.metrics.byAssignee).length === 0 ? (
                    <li className="text-slate-500">Nenhuma entrega atribuída.</li>
                  ) : null}
                </ul>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  )
}
