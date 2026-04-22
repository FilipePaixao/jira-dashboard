import { describe, expect, it } from 'vitest'
import type { SprintSnapshotDocument } from '@/modules/sprints/models'
import { calculateSprintMetrics } from './calculate-sprint-metrics'

const baseSnapshot = (issues: SprintSnapshotDocument['issues']): SprintSnapshotDocument => ({
  sprintId: 'S1',
  boardId: '1',
  sprintName: 'Sprint 1',
  syncedAt: '2026-04-01T12:00:00.000Z',
  issues,
  extractionStatus: 'complete',
})

describe('calculateSprintMetrics', () => {
  it('retorna zeros quando não há issues', () => {
    const m = calculateSprintMetrics(baseSnapshot([]))
    expect(m.velocityStoryPoints).toBe(0)
    expect(m.issuesDelivered).toBe(0)
    expect(m.leadTimeDaysAvg).toBeNull()
    expect(Object.keys(m.byAssignee)).toHaveLength(0)
  })

  it('agrega entregas e flags', () => {
    const m = calculateSprintMetrics(
      baseSnapshot([
        {
          issueId: '1',
          issueKey: 'X-1',
          summary: 'a',
          issueType: 'Story',
          status: 'Done',
          createdAt: '2026-03-01T10:00:00.000Z',
          updatedAt: '2026-04-01T10:00:00.000Z',
          resolvedAt: '2026-04-01T11:00:00.000Z',
          labels: [],
          components: [],
          changelogStatus: [],
          changelogSprint: [],
          changelogAssignee: [],
          storyPoints: 3,
          assignee: { displayName: 'Ana' },
          workStartedAt: null,
          flags: {
            committed: true,
            delivered: true,
            addedDuringSprint: false,
            spillover: false,
          },
        },
        {
          issueId: '2',
          issueKey: 'X-2',
          summary: 'b',
          issueType: 'Bug',
          status: 'To Do',
          createdAt: '2026-03-10T10:00:00.000Z',
          updatedAt: '2026-03-10T10:00:00.000Z',
          labels: [],
          components: [],
          changelogStatus: [],
          changelogSprint: [],
          changelogAssignee: [],
          storyPoints: 1,
          flags: {
            committed: true,
            delivered: false,
            addedDuringSprint: true,
            spillover: true,
          },
        },
      ]),
    )
    expect(m.storyPointsDelivered).toBe(3)
    expect(m.deliveredCount).toBe(1)
    expect(m.scopeAddedDuringSprint).toBe(1)
    expect(m.spilloverCount).toBe(1)
    expect(m.byAssignee.Ana?.storyPoints).toBe(3)
    expect(m.leadTimeDaysAvg).toBeGreaterThan(30)
    expect(m.cycleTimeDaysAvg).toBeNull()
    expect(m.leadTimeSampleCount).toBe(1)
    expect(m.cycleTimeSampleCount).toBe(0)
  })

  it('lead time (criação→resolução) difere de cycle time (início do trabalho→resolução)', () => {
    const m = calculateSprintMetrics(
      baseSnapshot([
        {
          issueId: '1',
          issueKey: 'X-1',
          summary: 'a',
          issueType: 'Story',
          status: 'Done',
          createdAt: '2026-03-01T10:00:00.000Z',
          updatedAt: '2026-04-01T10:00:00.000Z',
          workStartedAt: '2026-03-28T10:00:00.000Z',
          resolvedAt: '2026-04-01T11:00:00.000Z',
          labels: [],
          components: [],
          changelogStatus: [],
          changelogSprint: [],
          changelogAssignee: [],
          storyPoints: 2,
          flags: {
            committed: true,
            delivered: true,
            addedDuringSprint: false,
            spillover: false,
          },
        },
      ]),
    )
    expect(m.leadTimeDaysAvg).toBeCloseTo(31.04, 1)
    expect(m.cycleTimeDaysAvg).toBeCloseTo(4.04, 1)
    expect(m.leadTimeSampleCount).toBe(1)
    expect(m.cycleTimeSampleCount).toBe(1)
  })
})
