import { describe, expect, it } from 'vitest'
import {
  buildSnapshotMatch,
  parseSprintListQuery,
  SPRINT_LIST_DEFAULT_LIMIT,
  SPRINT_LIST_MAX_LIMIT,
} from './sprint-list-query'

describe('buildSnapshotMatch', () => {
  it('returns empty object when no filters', () => {
    expect(buildSnapshotMatch({})).toEqual({})
  })

  it('adds syncedAt range', () => {
    const a = new Date('2026-01-01T00:00:00.000Z')
    const b = new Date('2026-01-31T23:59:59.000Z')
    const m = buildSnapshotMatch({ syncedAfter: a, syncedBefore: b })
    expect(m.syncedAt).toEqual({
      $gte: a.toISOString(),
      $lte: b.toISOString(),
    })
  })

  it('escapes regex for sprintIdContains', () => {
    const m = buildSnapshotMatch({ sprintIdContains: '10.4' })
    expect(m.sprintId).toEqual({ $regex: '10\\.4', $options: 'i' })
  })
})

describe('parseSprintListQuery', () => {
  it('defaults page and limit', () => {
    const q = parseSprintListQuery(new URLSearchParams())
    expect(q.page).toBe(1)
    expect(q.limit).toBe(SPRINT_LIST_DEFAULT_LIMIT)
    expect(q.includeChartSeries).toBe(false)
  })

  it('caps limit', () => {
    const q = parseSprintListQuery(new URLSearchParams(`limit=${SPRINT_LIST_MAX_LIMIT + 10}`))
    expect(q.limit).toBe(SPRINT_LIST_MAX_LIMIT)
  })

  it('parses days as syncedAfter window', () => {
    const q = parseSprintListQuery(new URLSearchParams('days=7'))
    expect(q.syncedAfter).toBeDefined()
    expect(q.syncedBefore).toBeUndefined()
  })

  it('uses explicit syncedAfter over days when both present', () => {
    const q = parseSprintListQuery(
      new URLSearchParams('days=7&syncedAfter=2026-03-01T00:00:00.000Z'),
    )
    expect(q.syncedAfter?.toISOString()).toBe('2026-03-01T00:00:00.000Z')
  })

  it('parses includeChartSeries', () => {
    expect(parseSprintListQuery(new URLSearchParams('includeChartSeries=1')).includeChartSeries).toBe(
      true,
    )
    expect(
      parseSprintListQuery(new URLSearchParams('includeChartSeries=true')).includeChartSeries,
    ).toBe(true)
  })

  it('parses sprintId filter', () => {
    const q = parseSprintListQuery(new URLSearchParams('sprintId=104'))
    expect(q.sprintIdContains).toBe('104')
  })
})
