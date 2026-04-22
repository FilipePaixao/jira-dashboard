import { describe, expect, it } from 'vitest'
import type { SprintSnapshotDocument } from '@/modules/sprints/models'
import { __private__ } from './individual-analysis'

function mkSnapshot(
  sprintId: string,
  syncedAt: string,
  issues: SprintSnapshotDocument['issues'],
): SprintSnapshotDocument {
  return {
    sprintId,
    boardId: '1',
    sprintName: sprintId,
    syncedAt,
    issues,
    extractionStatus: 'complete',
  }
}

describe('individual analysis', () => {
  it('agrega pontos, categorias e ordena por story points', () => {
    const r = __private__.buildIndividualAnalysisFromSnapshots(
      [
        mkSnapshot('S1', '2026-04-20T10:00:00.000Z', [
          {
            issueId: '1',
            issueKey: 'A-1',
            summary: 'a',
            issueType: 'Task',
            status: 'Done',
            createdAt: '2026-04-10T10:00:00.000Z',
            updatedAt: '2026-04-20T10:00:00.000Z',
            resolvedAt: '2026-04-20T10:00:00.000Z',
            workStartedAt: '2026-04-18T10:00:00.000Z',
            storyPoints: 3,
            subtaskStoryPoints: 2,
            labels: [],
            components: [],
            changelogStatus: [],
            changelogSprint: [],
            changelogAssignee: [],
            assignee: { displayName: 'Ana' },
            flags: { committed: true, delivered: true, addedDuringSprint: false, spillover: false },
          },
          {
            issueId: '2',
            issueKey: 'A-2',
            summary: 'b',
            issueType: 'Bug',
            status: 'Done',
            createdAt: '2026-04-11T10:00:00.000Z',
            updatedAt: '2026-04-20T10:00:00.000Z',
            resolvedAt: '2026-04-20T10:00:00.000Z',
            storyPoints: 1,
            labels: [],
            components: [],
            changelogStatus: [],
            changelogSprint: [],
            changelogAssignee: [],
            assignee: null,
            flags: { committed: true, delivered: true, addedDuringSprint: true, spillover: true },
          },
        ]),
      ],
      'consolidated',
      undefined,
      30,
    )

    expect(r.summary.storyPointsDelivered).toBe(6)
    expect(r.byAssignee[0]?.assignee).toBe('Ana')
    expect(r.byAssignee[0]?.storyPointsDelivered).toBe(5)
    expect(r.byAssignee[0]?.topCategories[0]?.name).toBe('Task')
    const unassigned = r.byAssignee.find((x) => x.assignee === 'unassigned')
    expect(unassigned?.issuesDelivered).toBe(1)
    expect(unassigned?.spilloverCount).toBe(1)
    expect(unassigned?.scopeAddedCount).toBe(1)
  })

  it('builds sprint comparison with current and previous rows', () => {
    const current = mkSnapshot('S2', '2026-04-21T10:00:00.000Z', [
      {
        issueId: '3',
        issueKey: 'A-3',
        summary: 'c',
        issueType: 'Task',
        status: 'Done',
        createdAt: '2026-04-20T10:00:00.000Z',
        updatedAt: '2026-04-21T10:00:00.000Z',
        resolvedAt: '2026-04-21T10:00:00.000Z',
        storyPoints: 5,
        labels: [],
        components: [],
        changelogStatus: [],
        changelogSprint: [],
        changelogAssignee: [],
        assignee: { displayName: 'Ana' },
        flags: { committed: true, delivered: true, addedDuringSprint: false, spillover: false },
      },
    ])
    const previous = mkSnapshot('S1', '2026-04-20T10:00:00.000Z', [
      {
        issueId: '4',
        issueKey: 'A-4',
        summary: 'd',
        issueType: 'Bug',
        status: 'Done',
        createdAt: '2026-04-18T10:00:00.000Z',
        updatedAt: '2026-04-20T10:00:00.000Z',
        resolvedAt: '2026-04-20T10:00:00.000Z',
        storyPoints: 2,
        labels: [],
        components: [],
        changelogStatus: [],
        changelogSprint: [],
        changelogAssignee: [],
        assignee: { displayName: 'Ana' },
        flags: { committed: true, delivered: true, addedDuringSprint: false, spillover: false },
      },
    ])
    const cmp = __private__.buildSprintComparison(current, previous)
    expect(cmp.currentSprintId).toBe('S2')
    expect(cmp.previousSprintId).toBe('S1')
    const ana = cmp.rows.find((r) => r.assignee === 'Ana')
    expect(ana?.current.storyPointsDelivered).toBe(5)
    expect(ana?.previous.storyPointsDelivered).toBe(2)
  })
})
