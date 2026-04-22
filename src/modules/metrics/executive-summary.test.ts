import { describe, expect, it } from 'vitest'
import { buildExecutiveSummary } from './executive-summary'
import type { SprintMetricsDocument } from './types'

function baseMetrics(over: Partial<SprintMetricsDocument> = {}): SprintMetricsDocument {
  return {
    sprintId: '104',
    syncedAt: '2026-01-01T00:00:00.000Z',
    velocityStoryPoints: 10,
    velocityIssues: 2,
    storyPointsDelivered: 10,
    issuesDelivered: 2,
    leadTimeDaysAvg: 5,
    cycleTimeDaysAvg: 3,
    leadTimeSampleCount: 2,
    cycleTimeSampleCount: 2,
    throughput: 2,
    committedCount: 5,
    deliveredCount: 2,
    spilloverCount: 0,
    scopeAddedDuringSprint: 0,
    byAssignee: {},
    ...over,
  }
}

describe('buildExecutiveSummary', () => {
  it('returns null-safe text when metrics are missing', () => {
    const t = buildExecutiveSummary('Sprint 6', null, 'partial')
    expect(t).toContain('Resumo executivo')
    expect(t).toContain('partial')
  })

  it('mentions entregas, committed, spillover and times when metrics exist', () => {
    const t = buildExecutiveSummary('Quadro X', baseMetrics(), 'complete')
    expect(t).toContain('Quadro X')
    expect(t).toContain('2 entrega')
    expect(t).toContain('committed')
    expect(t).toContain('lead time')
    expect(t).toContain('cycle time')
  })

  it('highlights spillover and scope when non-zero', () => {
    const t = buildExecutiveSummary('S', baseMetrics({ spilloverCount: 2, scopeAddedDuringSprint: 1 }), 'complete')
    expect(t).toContain('spillover')
    expect(t).toContain('escopo')
  })
})
