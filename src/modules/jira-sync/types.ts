/** Tipos mínimos para extração Jira → snapshot interno (evoluem nos próximos incrementos). */

export type JiraUserRef = {
  accountId?: string
  displayName?: string
  emailAddress?: string
}

export type JiraSprintMeta = {
  boardId: string
  sprintId: string
  sprintName: string
  startDate?: string
  endDate?: string
  completeDate?: string
}

export type JiraChangelogItem = {
  field: string
  from?: string | null
  to?: string | null
  at: string
}

export type JiraIssueSnapshot = {
  issueId: string
  issueKey: string
  summary: string
  issueType: string
  assignee?: JiraUserRef | null
  reporter?: JiraUserRef | null
  status: string
  createdAt: string
  updatedAt: string
  /** Primeira mudança de status no changelog (Jira expand=changelog); usado no cycle time. */
  workStartedAt?: string | null
  resolvedAt?: string | null
  storyPoints?: number | null
  /**
   * Soma de story points de subtasks associadas à issue principal que não vieram
   * como itens independentes no recorte da sprint.
   */
  subtaskStoryPoints?: number | null
  labels: string[]
  components: string[]
  epicKey?: string | null
  changelogStatus: JiraChangelogItem[]
  changelogSprint: JiraChangelogItem[]
  changelogAssignee: JiraChangelogItem[]
  flags: {
    committed: boolean
    delivered: boolean
    addedDuringSprint: boolean
    spillover: boolean
  }
}
