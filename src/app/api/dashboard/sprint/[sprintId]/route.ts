import { NextResponse } from 'next/server'
import { getSprintMetricsBySprintId } from '@/modules/metrics/repository'
import { getSprintSnapshotBySprintId } from '@/modules/sprints/repository'

const DISCLAIMER =
  'Métricas individuais exigem contexto; use para diagnóstico e fluxo, não para ranking punitivo.'

export async function GET(
  _request: Request,
  context: { params: Promise<{ sprintId: string }> },
) {
  const { sprintId: raw } = await context.params
  const sprintId = decodeURIComponent(raw)

  const [snapshot, metrics] = await Promise.all([
    getSprintSnapshotBySprintId(sprintId),
    getSprintMetricsBySprintId(sprintId),
  ])

  if (!snapshot && !metrics) {
    return NextResponse.json({ error: 'Sprint não encontrada' }, { status: 404 })
  }

  return NextResponse.json({
    snapshot,
    metrics,
    disclaimer: DISCLAIMER,
  })
}
