import type { JiraIssueSnapshot } from '@/modules/jira-sync/types'
import {
  type DwellSegment,
  computeWipMetricsForIssues,
  countReopenTransitions,
} from './build-status-dwell-segments'
import { medianOf } from './stat-helpers'
import type { AssigneeMetrics } from './types'

function assigneeKey(issue: JiraIssueSnapshot): string {
  return issue.assignee?.displayName ?? issue.assignee?.accountId ?? 'unassigned'
}

function totalStoryPoints(issue: JiraIssueSnapshot): number {
  return (issue.storyPoints ?? 0) + (issue.subtaskStoryPoints ?? 0)
}

function daysBetween(isoA: string, isoB: string): number {
  return (new Date(isoB).getTime() - new Date(isoA).getTime()) / 86_400_000
}

/**
 * Mapa por assignee: entregas + campos alinhados com `SprintMetricsDocument.byAssignee`.
 */
export function buildAssigneeMap(
  issues: JiraIssueSnapshot[],
  syncedAt: string,
  allDwells: DwellSegment[][],
): Record<string, AssigneeMetrics> {
  const byKey = new Map<string, { issues: JiraIssueSnapshot[]; indices: number[] }>()
  for (let j = 0; j < issues.length; j += 1) {
    const i = issues[j]!
    const k = assigneeKey(i)
    if (!byKey.has(k)) {
      byKey.set(k, { issues: [], indices: [] })
    }
    byKey.get(k)!.issues.push(i)
    byKey.get(k)!.indices.push(j)
  }
  const byAssignee: Record<string, AssigneeMetrics> = {}
  for (const [name, g] of byKey) {
    const rel = g.issues
    const dlv = rel.filter((x) => x.flags.delivered)
    const pts = dlv.reduce((a, d) => a + totalStoryPoints(d), 0)
    const issN = dlv.length
    const cPts = rel.filter((x) => !x.flags.addedDuringSprint).reduce((a, x) => a + totalStoryPoints(x), 0)
    const sPts = rel.filter((x) => x.flags.spillover).reduce((a, x) => a + totalStoryPoints(x), 0)
    const lS: number[] = []
    const cS: number[] = []
    for (const x of dlv) {
      if (x.resolvedAt) {
        lS.push(daysBetween(x.createdAt, x.resolvedAt))
      }
      const w = x.workStartedAt?.trim()
      if (x.resolvedAt && w) {
        const ws = new Date(w).getTime()
        const res = new Date(x.resolvedAt).getTime()
        if (Number.isFinite(ws) && Number.isFinite(res) && ws <= res) {
          cS.push((res - ws) / 86_400_000)
        }
      }
    }
    const segArr = g.indices.map((j) => allDwells[j]!)
    const { wipAverage: wA, wipPeak: wP, wipP85: w85 } = computeWipMetricsForIssues(segArr, rel, syncedAt)
    let reo = 0
    for (const x of rel) {
      reo += countReopenTransitions(x.changelogStatus)
    }
    byAssignee[name] = {
      storyPoints: pts,
      issues: issN,
      storyPointsCommitted: cPts,
      storyPointsSpillover: sPts,
      leadTimeDaysMedian: medianOf(lS),
      cycleTimeDaysMedian: medianOf(cS),
      wipAverage: wA,
      wipPeak: wP,
      wipP85: w85,
      reopenCount: reo,
      reopenRate: issN > 0 ? reo / issN : null,
      plannedDeliveredCount: rel.filter((x) => !x.flags.addedDuringSprint && x.flags.delivered).length,
      unplannedDeliveredCount: rel.filter((x) => x.flags.addedDuringSprint && x.flags.delivered).length,
    }
  }
  return byAssignee
}
