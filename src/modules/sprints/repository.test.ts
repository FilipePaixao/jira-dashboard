import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSprintSnapshotBySprintId, saveSprintSnapshot } from './repository'

const replaceOne = vi.fn().mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 })
const findOne = vi.fn().mockResolvedValue(null)

vi.mock('@/infra/mongodb/client', () => ({
  getMongoDb: vi.fn().mockResolvedValue({
    collection: () => ({
      replaceOne,
      findOne,
    }),
  }),
}))

describe('saveSprintSnapshot / getSprintSnapshotBySprintId', () => {
  beforeEach(() => {
    replaceOne.mockClear()
    findOne.mockClear()
  })

  it('faz upsert por sprintId', async () => {
    const doc = {
      sprintId: 'S1',
      boardId: '9',
      sprintName: 'Sprint A',
      syncedAt: '2026-01-01T00:00:00.000Z',
      issues: [],
      extractionStatus: 'pending' as const,
    }
    const { upserted } = await saveSprintSnapshot(doc)
    expect(upserted).toBe(true)
    expect(replaceOne).toHaveBeenCalledWith({ sprintId: 'S1' }, doc, { upsert: true })
  })

  it('lê snapshot por sprintId', async () => {
    findOne.mockResolvedValueOnce({
      sprintId: 'S1',
      boardId: null,
      sprintName: 'X',
      syncedAt: '2026-01-01T00:00:00.000Z',
      issues: [],
      extractionStatus: 'pending',
    })
    const row = await getSprintSnapshotBySprintId('S1')
    expect(row?.sprintName).toBe('X')
  })
})
