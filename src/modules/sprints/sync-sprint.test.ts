import { beforeEach, describe, expect, it, vi } from 'vitest'
import { syncSprintSnapshot } from './sync-sprint'

const insertOne = vi.fn().mockResolvedValue({ insertedId: 'mock' })
const replaceOne = vi.fn().mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 })

const { mockLoadSprint } = vi.hoisted(() => ({
  mockLoadSprint: vi.fn().mockResolvedValue({
    issues: [],
    sprintName: 'Sprint mock',
    sprintStartIso: undefined,
    sprintEndIso: undefined,
  }),
}))

vi.mock('@/modules/jira-sync/load-sprint-from-jira', () => ({
  loadSprintFromJira: mockLoadSprint,
}))

vi.mock('@/infra/mongodb/client', () => ({
  getMongoDb: vi.fn().mockResolvedValue({
    collection: () => ({ insertOne, replaceOne }),
  }),
}))

describe('syncSprintSnapshot', () => {
  beforeEach(() => {
    insertOne.mockClear()
    replaceOne.mockClear()
    mockLoadSprint.mockClear()
  })

  it('rejeita sprintId vazio', async () => {
    await expect(syncSprintSnapshot({ sprintId: '  ' })).rejects.toThrow(/sprintId/)
  })

  it('persiste execução e retorna resultado', async () => {
    const result = await syncSprintSnapshot({ sprintId: 'SPR-1', boardId: '42' })
    expect(result.ok).toBe(true)
    expect(result.sprintId).toBe('SPR-1')
    expect(result.boardId).toBe('42')
    expect(result.issuesFetched).toBe(0)
    expect(result.phase).toBe('live')
    expect(insertOne).toHaveBeenCalledTimes(1)
    expect(replaceOne).toHaveBeenCalledTimes(2)
  })
})
