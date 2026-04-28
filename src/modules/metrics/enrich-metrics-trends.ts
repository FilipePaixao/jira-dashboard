import type { SprintMetricsDocument } from './types'

/**
 * Tendências normalizadas face à sprint anterior do mesmo board (se existir).
 * Valores ~relativos: variação de velocidade/throughput; delta de `stabilityIndex` para previsibilidade.
 */
export function enrichMetricsWithTrends(
  current: SprintMetricsDocument,
  previous: SprintMetricsDocument | null,
): SprintMetricsDocument {
  if (!previous) {
    return {
      ...current,
      velocityTrend: null,
      throughputTrend: null,
      predictabilityTrend: null,
    }
  }
  const vPrev = Math.max(0.0001, previous.velocityStoryPoints)
  const tPrev = Math.max(0.0001, previous.throughput)
  const sPrev = previous.stabilityIndex ?? 0
  const sCur = current.stabilityIndex ?? 0
  return {
    ...current,
    velocityTrend: (current.velocityStoryPoints - previous.velocityStoryPoints) / vPrev,
    throughputTrend: (current.throughput - previous.throughput) / tPrev,
    predictabilityTrend: sCur - sPrev,
  }
}
