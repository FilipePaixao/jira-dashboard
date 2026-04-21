import { describe, expect, it } from 'vitest'
import { mapJiraIssueToSnapshot } from './map-jira-issue-to-snapshot'
import type { JiraIssueApiNode } from './jira-agile-types'

describe('mapJiraIssueToSnapshot', () => {
  it('mapeia issue mínima e flags de entrega', () => {
    const node: JiraIssueApiNode = {
      id: '100',
      key: 'DEMO-1',
      fields: {
        summary: 'Item',
        status: { name: 'Done', statusCategory: { key: 'done' } },
        issuetype: { name: 'Story' },
        created: '2026-01-01T10:00:00.000Z',
        updated: '2026-01-02T10:00:00.000Z',
        resolution: { name: 'Done' },
        resolutiondate: '2026-01-02T12:00:00.000Z',
        labels: ['a'],
        components: [{ name: 'API' }],
        assignee: { displayName: 'Ana', accountId: 'acc' },
        customfield_10016: 5,
      },
    }
    const snap = mapJiraIssueToSnapshot(node, {
      storyPointsFieldId: 'customfield_10016',
      sprintStartIso: '2025-12-01T00:00:00.000Z',
    })
    expect(snap.issueKey).toBe('DEMO-1')
    expect(snap.storyPoints).toBe(5)
    expect(snap.flags.delivered).toBe(true)
    expect(snap.flags.spillover).toBe(false)
  })
})
