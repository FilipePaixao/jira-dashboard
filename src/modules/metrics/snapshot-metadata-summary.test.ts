import { describe, expect, it } from 'vitest'
import type { JiraIssueSnapshot } from '@/modules/jira-sync/types'
import { summarizeDeliveredMetadata } from './snapshot-metadata-summary'

function issue(p: Partial<JiraIssueSnapshot> & Pick<JiraIssueSnapshot, 'issueId' | 'issueKey'>): JiraIssueSnapshot {
  return {
    summary: 's',
    issueType: 'Story',
    status: 'Done',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-02',
    labels: [],
    components: [],
    changelogStatus: [],
    changelogSprint: [],
    changelogAssignee: [],
    flags: { committed: true, delivered: false, addedDuringSprint: false, spillover: false },
    ...p,
  }
}

describe('summarizeDeliveredMetadata', () => {
  it('ignores non-delivered issues', () => {
    const s = summarizeDeliveredMetadata([
      issue({ issueId: '1', issueKey: 'A-1', flags: { committed: true, delivered: false, addedDuringSprint: false, spillover: false } }),
    ])
    expect(s.deliveredIssueCount).toBe(0)
    expect(s.topLabels.length).toBe(0)
  })

  it('aggregates labels components epics for delivered', () => {
    const s = summarizeDeliveredMetadata([
      issue({
        issueId: '1',
        issueKey: 'A-1',
        storyPoints: 3,
        subtaskStoryPoints: 5,
        labels: ['x', 'y'],
        components: ['api'],
        epicKey: 'E-1',
        flags: { committed: true, delivered: true, addedDuringSprint: false, spillover: false },
      }),
      issue({
        issueId: '2',
        issueKey: 'A-2',
        storyPoints: 2,
        labels: ['y'],
        components: ['api'],
        epicKey: null,
        flags: { committed: true, delivered: true, addedDuringSprint: false, spillover: false },
      }),
    ])
    expect(s.deliveredIssueCount).toBe(2)
    const y = s.topLabels.find((r) => r.name === 'y')
    expect(y?.issues).toBe(2)
    expect(y?.storyPoints).toBe(10)
    const story = s.topIssueTypes.find((r) => r.name === 'Story')
    expect(story?.issues).toBe(2)
    expect(story?.storyPoints).toBe(10)
    const api = s.topComponents.find((r) => r.name === 'api')
    expect(api?.issues).toBe(2)
    const epic = s.topEpics.find((r) => r.name === 'E-1')
    expect(epic?.issues).toBe(1)
    const sem = s.topEpics.find((r) => r.name === '(sem épico)')
    expect(sem?.issues).toBe(1)
  })
})
