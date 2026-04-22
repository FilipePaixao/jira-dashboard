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

function totalStoryPoints(issue: JiraIssueSnapshot): number {
  return (issue.storyPoints ?? 0) + (issue.subtaskStoryPoints ?? 0)
}

export function calculateSprintMetrics(snapshot: SprintSnapshotDocument): SprintMetricsDocument {
  const issues = snapshot.issues
  const delivered = issues.filter((i) => i.flags.delivered)
  const sumPoints = (list: JiraIssueSnapshot[]) =>
    list.reduce((acc, i) => acc + totalStoryPoints(i), 0)

  const leadSamples: number[] = []
  const cycleSamples: number[] = []
  for (const i of delivered) {
    if (!i.resolvedAt) {
      continue
    }
    leadSamples.push(daysBetween(i.createdAt, i.resolvedAt))

    const start = i.workStartedAt?.trim()
    if (start) {
      const ws = new Date(start).getTime()
      const res = new Date(i.resolvedAt).getTime()
      if (Number.isFinite(ws) && Number.isFinite(res) && ws <= res) {
        cycleSamples.push((res - ws) / 86_400_000)
      }
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
    byAssignee[key].storyPoints += totalStoryPoints(i)
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
    leadTimeSampleCount: leadSamples.length,
    cycleTimeSampleCount: cycleSamples.length,
    throughput: delivered.length,
    committedCount: issues.filter((i) => i.flags.committed).length,
    deliveredCount: delivered.length,
    spilloverCount: issues.filter((i) => i.flags.spillover).length,
    scopeAddedDuringSprint: issues.filter((i) => i.flags.addedDuringSprint).length,
    byAssignee,
  }
}
