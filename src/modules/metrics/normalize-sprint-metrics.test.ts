import { describe, expect, it } from 'vitest'
import { coerceSprintMetricsFromStorage } from './normalize-sprint-metrics'
import type { SprintMetricsDocument } from './types'

describe('coerceSprintMetricsFromStorage', () => {
  it('preenche story points / issues mínimos em byAssignee', () => {
    const raw = {
      sprintId: '1',
      syncedAt: '2026-01-01T00:00:00.000Z',
      velocityStoryPoints: 0,
      velocityIssues: 0,
      storyPointsDelivered: 0,
      issuesDelivered: 0,
      leadTimeDaysAvg: null,
      cycleTimeDaysAvg: null,
      throughput: 0,
      committedCount: 0,
      deliveredCount: 0,
      spilloverCount: 0,
      scopeAddedDuringSprint: 0,
      byAssignee: { A: { storyPoints: 2, issues: 1 } as SprintMetricsDocument['byAssignee'][string] },
    } as SprintMetricsDocument
    const c = coerceSprintMetricsFromStorage(raw)
    expect(c?.byAssignee.A?.storyPoints).toBe(2)
    expect(c?.byAssignee.A?.issues).toBe(1)
  })
})
