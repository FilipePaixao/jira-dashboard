/**
 * Modelo persistido de métricas de sprint (Mongo + tipos de API).
 * Campos adicionais desde a evolução "new-metrics" são opcionais para retrocompatibilidade
 * até serem preenchidos pelo pipeline de cálculo em loops posteriores.
 */

/** Núcleo histórico sempre calculado hoje; usado em testes de contrato. */
export const SPRINT_METRICS_CORE_KEYS = [
  'sprintId',
  'syncedAt',
  'velocityStoryPoints',
  'velocityIssues',
  'storyPointsDelivered',
  'issuesDelivered',
  'leadTimeDaysAvg',
  'cycleTimeDaysAvg',
  'leadTimeSampleCount',
  'cycleTimeSampleCount',
  'throughput',
  'committedCount',
  'deliveredCount',
  'spilloverCount',
  'scopeAddedDuringSprint',
  'byAssignee',
] as const

export type SprintMetricsCoreKey = (typeof SPRINT_METRICS_CORE_KEYS)[number]

/** Resumo de tempo agregado por coluna/estado (fluxo / time in status). */
export type TimeInStatusEntry = {
  status: string
  /** Média de dias em que issues “tocaram” este estado no recorte. */
  daysAvg: number
  /** Soma de dias*issue usada para auditoria. */
  totalPersonDays: number
  issueCount: number
}

export type DeliveryMixByTypeRow = {
  issueType: string
  storyPoints: number
  issues: number
  /** Parte das entregas em pts (0–1). */
  shareOfDelivered: number
}

export type AssigneeMetrics = {
  storyPoints: number
  issues: number
  // --- new-metrics: previsibilidade e fluxo por pessoa (opcionais) ---
  storyPointsCommitted?: number
  storyPointsSpillover?: number
  wipAverage?: number | null
  wipPeak?: number | null
  wipP85?: number | null
  leadTimeDaysMedian?: number | null
  cycleTimeDaysMedian?: number | null
  reopenCount?: number
  reopenRate?: number | null
  plannedDeliveredCount?: number
  unplannedDeliveredCount?: number
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

  // --- 1) Previsibilidade e estabilidade ---
  storyPointsCommitted?: number
  storyPointsAddedDuringSprint?: number
  storyPointsSpillover?: number
  commitmentReliabilityIssues?: number | null
  commitmentReliabilityStoryPoints?: number | null
  scopeChangeRateIssues?: number | null
  scopeChangeRateStoryPoints?: number | null
  spilloverRateIssues?: number | null
  spilloverRateStoryPoints?: number | null
  plannedCompletionRate?: number | null

  // --- 2) Fluxo: medianas, percentis, aging, estágios, WIP ---
  leadTimeDaysMedian?: number | null
  cycleTimeDaysMedian?: number | null
  leadTimeDaysP85?: number | null
  cycleTimeDaysP85?: number | null
  agingDaysAvgOpenIssues?: number | null
  agingDaysP85OpenIssues?: number | null
  timeInStatus?: TimeInStatusEntry[] | null
  reviewTimeDaysAvg?: number | null
  qaTimeDaysAvg?: number | null
  blockedTimeDaysAvg?: number | null
  flowEfficiency?: number | null
  wipAverage?: number | null
  wipPeak?: number | null
  wipP85?: number | null

  // --- 3) Qualidade ---
  reopenCount?: number
  reopenRate?: number | null
  firstPassYield?: number | null
  bugRate?: number | null
  /** Preenchido quando o snapshot permitir detetar fugas a produção. */
  escapedDefects?: number | null
  hotfixRate?: number | null

  // --- 4) Leitura executiva derivada ---
  stabilityIndex?: number | null
  deliveryMixByType?: DeliveryMixByTypeRow[] | null
  /** Tendências: valores normalizados (ex. variação vs sprint anterior) ou null se indisponível. */
  velocityTrend?: number | null
  throughputTrend?: number | null
  predictabilityTrend?: number | null
}
