import { calculateSprintMetrics } from '@/modules/metrics/calculate-sprint-metrics'
import { saveSprintMetrics } from '@/modules/metrics/repository'
import { getMongoDb } from '@/infra/mongodb/client'
import type { SprintSnapshotDocument } from './models'
import { saveSprintSnapshot } from './repository'

export const SYNC_RUNS_COLLECTION = 'sync_runs'

export type SyncSprintInput = {
  sprintId: string
  boardId?: string
  sprintName?: string
}

export type SyncSprintResult = {
  ok: true
  sprintId: string
  boardId: string | null
  syncedAt: string
  issuesFetched: number
  phase: 'stub'
}

export async function syncSprintSnapshot(input: SyncSprintInput): Promise<SyncSprintResult> {
  const sprintId = input.sprintId.trim()
  if (!sprintId) {
    throw new Error('sprintId é obrigatório')
  }

  const boardId = input.boardId?.trim() || null
  const sprintName = input.sprintName?.trim() || sprintId
  const syncedAt = new Date().toISOString()

  const db = await getMongoDb()
  await db.collection(SYNC_RUNS_COLLECTION).insertOne({
    sprintId,
    boardId,
    syncedAt,
    issuesFetched: 0,
    phase: 'stub',
    createdAt: syncedAt,
  })

  const snapshotDoc: SprintSnapshotDocument = {
    sprintId,
    boardId,
    sprintName,
    syncedAt,
    issues: [],
    extractionStatus: 'pending',
  }

  await saveSprintSnapshot(snapshotDoc)
  const metrics = calculateSprintMetrics(snapshotDoc)
  await saveSprintMetrics(metrics)

  return {
    ok: true,
    sprintId,
    boardId,
    syncedAt,
    issuesFetched: 0,
    phase: 'stub',
  }
}
