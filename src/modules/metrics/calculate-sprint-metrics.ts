import type { JiraIssueSnapshot } from '@/modules/jira-sync/types'
import type { SprintSnapshotDocument } from '@/modules/sprints/models'
import type { SprintMetricsDocument } from './types'

function daysBetween(isoA: string, isoB: string): number {
  const a = new Date(isoA).getTime()
  const b = new Date(isoB).getTime()
  return (b - a) / (86_400_000)
}

function assigneeKey(issue: JiraIssueSnapshot): string {
  return issue.assignee?.displayName ?? issue.assignee?.accountId ?? 'unassigned'
}

export function calculateSprintMetrics(snapshot: SprintSnapshotDocument): SprintMetricsDocument {
  const issues = snapshot.issues
  const delivered = issues.filter((i) => i.flags.delivered)
  const sumPoints = (list: JiraIssueSnapshot[]) =>
    list.reduce((acc, i) => acc + (i.storyPoints ?? 0), 0)

  const leadSamples: number[] = []
  const cycleSamples: number[] = []
  for (const i of delivered) {
    if (i.resolvedAt) {
      leadSamples.push(daysBetween(i.createdAt, i.resolvedAt))
      cycleSamples.push(daysBetween(i.createdAt, i.resolvedAt))
    }
  }

  const avg = (xs: number[]) =>
    xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length

  const byAssignee: SprintMetricsDocument['byAssignee'] = {}
  for (const i of delivered) {
    const key = assigneeKey(i)
    if (!byAssignee[key]) {
      byAssignee[key] = { storyPoints: 0, issues: 0 }
    }
    byAssignee[key].issues += 1
    byAssignee[key].storyPoints += i.storyPoints ?? 0
  }

  return {
    sprintId: snapshot.sprintId,
    syncedAt: snapshot.syncedAt,
    velocityStoryPoints: sumPoints(delivered),
    velocityIssues: delivered.length,
    storyPointsDelivered: sumPoints(delivered),
    issuesDelivered: delivered.length,
    leadTimeDaysAvg: avg(leadSamples),
    cycleTimeDaysAvg: avg(cycleSamples),
    throughput: delivered.length,
    committedCount: issues.filter((i) => i.flags.committed).length,
    deliveredCount: delivered.length,
    spilloverCount: issues.filter((i) => i.flags.spillover).length,
    scopeAddedDuringSprint: issues.filter((i) => i.flags.addedDuringSprint).length,
    byAssignee,
  }
}
