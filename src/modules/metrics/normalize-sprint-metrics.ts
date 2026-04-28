import type { AssigneeMetrics, SprintMetricsDocument } from './types'

/**
 * Garante shape mínimo ao ler documentos antigos do Mongo (campos em falta).
 */
export function coerceSprintMetricsFromStorage(
  raw: SprintMetricsDocument | null,
): SprintMetricsDocument | null {
  if (!raw) {
    return null
  }
  const byAssignee: Record<string, AssigneeMetrics> = {}
  for (const [k, v] of Object.entries(raw.byAssignee ?? {})) {
    byAssignee[k] = {
      ...v,
      storyPoints: v.storyPoints ?? 0,
      issues: v.issues ?? 0,
    }
  }
  return { ...raw, byAssignee }
}
