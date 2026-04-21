import { getMongoDb } from '@/infra/mongodb/client'

export const SYNC_RUNS_COLLECTION = 'sync_runs'

export type SyncSprintInput = {
  sprintId: string
  boardId?: string
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

  return {
    ok: true,
    sprintId,
    boardId,
    syncedAt,
    issuesFetched: 0,
    phase: 'stub',
  }
}
