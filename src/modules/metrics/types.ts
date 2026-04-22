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
  /** Issues entregues com data de resolução (amostra do lead time) */
  leadTimeSampleCount?: number
  /** Issues com workStartedAt + resolução (amostra do cycle time) */
  cycleTimeSampleCount?: number
  throughput: number
  committedCount: number
  deliveredCount: number
  spilloverCount: number
  scopeAddedDuringSprint: number
  /** Contexto: diagnóstico, não ranking simplista */
  byAssignee: Record<string, AssigneeMetrics>
}
