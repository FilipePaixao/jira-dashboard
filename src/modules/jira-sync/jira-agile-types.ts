/** Respostas parciais da REST API Agile/ Jira usadas na extração. */

export type JiraSprintApiResponse = {
  id: number
  name: string
  state?: string
  startDate?: string
  endDate?: string
  completeDate?: string
  originBoardId?: number
}

export type JiraSprintIssuesPage = {
  expand?: string
  startAt: number
  maxResults: number
  total: number
  issues: JiraIssueApiNode[]
}

export type JiraIssueApiNode = {
  id: string
  key: string
  fields: Record<string, unknown>
}
