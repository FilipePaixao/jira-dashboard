import { NextResponse } from 'next/server'
import { buildExecutiveSummary } from '@/modules/metrics/executive-summary'
import { getSprintMetricsBySprintId } from '@/modules/metrics/repository'
import { summarizeDeliveredMetadata } from '@/modules/metrics/snapshot-metadata-summary'
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

  const executiveSummary =
    snapshot || metrics
      ? buildExecutiveSummary(
          snapshot?.sprintName ?? `Sprint ${sprintId}`,
          metrics,
          snapshot?.extractionStatus ?? 'unknown',
        )
      : null

  const metadataSummary =
    snapshot?.issues?.length ? summarizeDeliveredMetadata(snapshot.issues) : null

  const snapshotPublic = snapshot
    ? {
        sprintId: snapshot.sprintId,
        boardId: snapshot.boardId,
        sprintName: snapshot.sprintName,
        syncedAt: snapshot.syncedAt,
        extractionStatus: snapshot.extractionStatus,
        issueCount: snapshot.issues.length,
      }
    : null

  return NextResponse.json({
    snapshot: snapshotPublic,
    metrics,
    metadataSummary,
    executiveSummary,
    disclaimer: DISCLAIMER,
  })
}
