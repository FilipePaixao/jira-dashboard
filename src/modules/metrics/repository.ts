import { getMongoDb } from '@/infra/mongodb/client'
import { coerceSprintMetricsFromStorage } from './normalize-sprint-metrics'
import type { SprintMetricsDocument } from './types'

export const SPRINT_METRICS_COLLECTION = 'sprint_metrics'

export async function saveSprintMetrics(doc: SprintMetricsDocument): Promise<void> {
  const db = await getMongoDb()
  await db
    .collection<SprintMetricsDocument>(SPRINT_METRICS_COLLECTION)
    .replaceOne({ sprintId: doc.sprintId }, doc, { upsert: true })
}

export async function getSprintMetricsBySprintId(
  sprintId: string,
): Promise<SprintMetricsDocument | null> {
  const db = await getMongoDb()
  const raw = await db
    .collection<SprintMetricsDocument>(SPRINT_METRICS_COLLECTION)
    .findOne({ sprintId })
  return coerceSprintMetricsFromStorage(raw)
}
