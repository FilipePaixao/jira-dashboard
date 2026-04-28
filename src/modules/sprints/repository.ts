import { getMongoDb } from '@/infra/mongodb/client'
import type { SprintSnapshotDocument } from './models'

export const SPRINT_SNAPSHOTS_COLLECTION = 'sprint_snapshots'

export async function saveSprintSnapshot(
  doc: SprintSnapshotDocument,
): Promise<{ upserted: boolean }> {
  const db = await getMongoDb()
  const result = await db
    .collection<SprintSnapshotDocument>(SPRINT_SNAPSHOTS_COLLECTION)
    .replaceOne({ sprintId: doc.sprintId }, doc, { upsert: true })
  return { upserted: result.upsertedCount > 0 || result.modifiedCount > 0 }
}

export async function getSprintSnapshotBySprintId(
  sprintId: string,
): Promise<SprintSnapshotDocument | null> {
  const db = await getMongoDb()
  return db
    .collection<SprintSnapshotDocument>(SPRINT_SNAPSHOTS_COLLECTION)
    .findOne({ sprintId })
}

/**
 * Sprint anterior no mesmo board, com `syncedAt` estritamente anterior.
 */
export async function findPreviousSnapshotOnSameBoard(input: {
  boardId: string | null
  beforeSyncedAt: string
  currentSprintId: string
}): Promise<SprintSnapshotDocument | null> {
  const { boardId, beforeSyncedAt, currentSprintId } = input
  if (!boardId) {
    return null
  }
  const db = await getMongoDb()
  return db
    .collection<SprintSnapshotDocument>(SPRINT_SNAPSHOTS_COLLECTION)
    .findOne(
      {
        boardId,
        sprintId: { $ne: currentSprintId },
        syncedAt: { $lt: beforeSyncedAt },
      },
      { sort: { syncedAt: -1 } },
    )
}
