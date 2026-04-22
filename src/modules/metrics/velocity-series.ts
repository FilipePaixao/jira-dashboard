import { getMongoDb } from '@/infra/mongodb/client'
import { SPRINT_METRICS_COLLECTION } from '@/modules/metrics/repository'
import type { SprintSnapshotDocument } from '@/modules/sprints/models'
import { SPRINT_SNAPSHOTS_COLLECTION } from '@/modules/sprints/repository'
import { buildSnapshotMatch, type SprintListFilters } from '@/modules/sprints/sprint-list-query'

export type VelocitySeriesPoint = {
  sprintId: string
  sprintName: string
  syncedAt: string
  velocityStoryPoints: number
  issuesDelivered: number
}

const DEFAULT_MAX = 120
const ABS_MAX = 200

/**
 * Série cronológica de velocidade (story points entregues) por sprint sincronizada.
 * Respeita os mesmos filtros temporais / sprintId que a listagem paginada.
 */
export async function listVelocitySeries(
  filters: SprintListFilters,
  maxPoints = DEFAULT_MAX,
): Promise<VelocitySeriesPoint[]> {
  const cap = Math.min(ABS_MAX, Math.max(5, maxPoints))
  const db = await getMongoDb()
  const match = buildSnapshotMatch(filters)

  const pipeline = [
    { $match: match },
    { $sort: { syncedAt: 1 } },
    { $limit: cap },
    {
      $lookup: {
        from: SPRINT_METRICS_COLLECTION,
        localField: 'sprintId',
        foreignField: 'sprintId',
        as: 'm',
      },
    },
    {
      $addFields: {
        metrics: { $arrayElemAt: ['$m', 0] },
      },
    },
    {
      $project: {
        _id: 0,
        sprintId: 1,
        sprintName: 1,
        syncedAt: 1,
        velocityStoryPoints: {
          $ifNull: ['$metrics.velocityStoryPoints', 0],
        },
        issuesDelivered: {
          $ifNull: ['$metrics.issuesDelivered', 0],
        },
      },
    },
  ]

  const rows = await db
    .collection<SprintSnapshotDocument>(SPRINT_SNAPSHOTS_COLLECTION)
    .aggregate<VelocitySeriesPoint>(pipeline)
    .toArray()

  return rows.map((r) => ({
    sprintId: r.sprintId,
    sprintName: r.sprintName,
    syncedAt: r.syncedAt,
    velocityStoryPoints: r.velocityStoryPoints,
    issuesDelivered: r.issuesDelivered,
  }))
}
