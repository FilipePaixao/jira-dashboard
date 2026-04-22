import { getMongoDb } from '@/infra/mongodb/client'
import type { SprintMetricsDocument } from '@/modules/metrics/types'
import { SPRINT_METRICS_COLLECTION } from '@/modules/metrics/repository'
import type { SprintSnapshotDocument } from './models'
import { SPRINT_SNAPSHOTS_COLLECTION } from './repository'

export type SprintOverviewEntry = {
  sprintId: string
  sprintName: string
  boardId: string | null
  syncedAt: string
  extractionStatus: string
  metrics: SprintMetricsDocument | null
}

/**
 * Lista todas as sprints com snapshot no MongoDB, enriquecidas com métricas quando existirem.
 * Ordenação: mais recentemente sincronizadas primeiro.
 */
export async function listSprintsOverview(): Promise<SprintOverviewEntry[]> {
  const db = await getMongoDb()
  const snaps = await db
    .collection<SprintSnapshotDocument>(SPRINT_SNAPSHOTS_COLLECTION)
    .find({})
    .project({
      sprintId: 1,
      sprintName: 1,
      boardId: 1,
      syncedAt: 1,
      extractionStatus: 1,
    })
    .sort({ syncedAt: -1 })
    .toArray()

  const metricsColl = db.collection<SprintMetricsDocument>(SPRINT_METRICS_COLLECTION)
  const out: SprintOverviewEntry[] = []
  for (const s of snaps) {
    const m = await metricsColl.findOne({ sprintId: s.sprintId })
    out.push({
      sprintId: s.sprintId,
      sprintName: s.sprintName,
      boardId: s.boardId,
      syncedAt: s.syncedAt,
      extractionStatus: s.extractionStatus,
      metrics: m,
    })
  }
  return out
}
