import type { JiraIssueSnapshot } from '@/modules/jira-sync/types'

export type SprintSnapshotDocument = {
  sprintId: string
  boardId: string | null
  sprintName: string
  syncedAt: string
  issues: JiraIssueSnapshot[]
  /** Indica que issues ainda não foram preenchidas pela integração Jira completa */
  extractionStatus: 'pending' | 'partial' | 'complete'
}
