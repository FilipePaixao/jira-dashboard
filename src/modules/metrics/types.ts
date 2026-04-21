export type AssigneeMetrics = {
  storyPoints: number
  issues: number
}

export type SprintMetricsDocument = {
  sprintId: string
  syncedAt: string
  velocityStoryPoints: number
  velocityIssues: number
  storyPointsDelivered: number
  issuesDelivered: number
  leadTimeDaysAvg: number | null
  cycleTimeDaysAvg: number | null
  throughput: number
  committedCount: number
  deliveredCount: number
  spilloverCount: number
  scopeAddedDuringSprint: number
  /** Contexto: diagnóstico, não ranking simplista */
  byAssignee: Record<string, AssigneeMetrics>
}
