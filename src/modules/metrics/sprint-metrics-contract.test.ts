import { describe, expect, it } from 'vitest'
import type { SprintSnapshotDocument } from '@/modules/sprints/models'
import { calculateSprintMetrics } from './calculate-sprint-metrics'
import { SPRINT_METRICS_CORE_KEYS, type SprintMetricsDocument } from './types'

const emptySnapshot = (): SprintSnapshotDocument => ({
  sprintId: 'S1',
  boardId: '1',
  sprintName: 'Sprint 1',
  syncedAt: '2026-04-01T12:00:00.000Z',
  issues: [],
  extractionStatus: 'complete',
})

describe('Sprint metrics — contrato (Loop 1)', () => {
  it('calculateSprintMetrics expõe todas as chaves do núcleo documentado', () => {
    const m = calculateSprintMetrics(emptySnapshot())
    for (const key of SPRINT_METRICS_CORE_KEYS) {
      expect(m).toHaveProperty(key)
    }
  })

  it('o retorno do cálculo é atribuível a SprintMetricsDocument (retrocompat)', () => {
    const m: SprintMetricsDocument = calculateSprintMetrics(emptySnapshot())
    expect(m.sprintId).toBe('S1')
  })

  it('documento “futuro” com campos new-metrics permanece atribuível a SprintMetricsDocument', () => {
    const extended: SprintMetricsDocument = {
      ...calculateSprintMetrics(emptySnapshot()),
      storyPointsCommitted: 20,
      leadTimeDaysMedian: 4.2,
      flowEfficiency: 0.35,
      timeInStatus: [
        { status: 'In Progress', daysAvg: 2, totalPersonDays: 6, issueCount: 3 },
      ],
      deliveryMixByType: [
        { issueType: 'Story', storyPoints: 10, issues: 2, shareOfDelivered: 0.6 },
      ],
      stabilityIndex: 0.75,
    }
    expect(extended.storyPointsCommitted).toBe(20)
  })
})
