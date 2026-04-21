import { calculateSprintMetrics } from '@/modules/metrics/calculate-sprint-metrics'
import { saveSprintMetrics } from '@/modules/metrics/repository'
import { getMongoDb } from '@/infra/mongodb/client'
import { loadSprintFromJira } from '@/modules/jira-sync/load-sprint-from-jira'
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
  phase: 'live'
}

export async function syncSprintSnapshot(input: SyncSprintInput): Promise<SyncSprintResult> {
  const sprintId = input.sprintId.trim()
  if (!sprintId) {
    throw new Error('sprintId é obrigatório')
  }

  const boardId = input.boardId?.trim() || null
  const syncedAt = new Date().toISOString()

  const loaded = await loadSprintFromJira({
    sprintId,
    sprintName: input.sprintName,
  })

  const extractionStatus = loaded.issues.length > 0 ? 'complete' : 'partial'

  const db = await getMongoDb()
  await db.collection(SYNC_RUNS_COLLECTION).insertOne({
    sprintId,
    boardId,
    syncedAt,
    issuesFetched: loaded.issues.length,
    phase: 'live',
    createdAt: syncedAt,
  })

  const snapshotDoc: SprintSnapshotDocument = {
    sprintId,
    boardId,
    sprintName: loaded.sprintName,
    syncedAt,
    issues: loaded.issues,
    extractionStatus,
  }

  await saveSprintSnapshot(snapshotDoc)
  const metrics = calculateSprintMetrics(snapshotDoc)
  await saveSprintMetrics(metrics)

  return {
    ok: true,
    sprintId,
    boardId,
    syncedAt,
    issuesFetched: loaded.issues.length,
    phase: 'live',
  }
}
