import type { JiraIssueSnapshot } from '@/modules/jira-sync/types'
import type { SprintSnapshotDocument } from '@/modules/sprints/models'
import {
  buildStatusDwellSegments,
  computeWipMetricsForIssues,
  countReopenTransitions,
  ESCAPED_RE,
  HOTFIX_RE,
  sumDwellDaysByStatusName,
  sumDwellDaysInCategories,
} from './build-status-dwell-segments'
import { buildAssigneeMap } from './build-assignee-map'
import { medianOf, p85Of } from './stat-helpers'
import type { DeliveryMixByTypeRow, SprintMetricsDocument, TimeInStatusEntry } from './types'

function daysBetween(isoA: string, isoB: string): number {
  return (new Date(isoB).getTime() - new Date(isoA).getTime()) / 86_400_000
}

function totalStoryPoints(issue: JiraIssueSnapshot): number {
  return (issue.storyPoints ?? 0) + (issue.subtaskStoryPoints ?? 0)
}

function dwellEndAt(issue: JiraIssueSnapshot, syncedAt: string): string {
  if (issue.resolvedAt) {
    const r = new Date(issue.resolvedAt).getTime()
    const s = new Date(syncedAt).getTime()
    if (Number.isFinite(r) && Number.isFinite(s) && r < s) {
      return issue.resolvedAt
    }
  }
  return syncedAt
}

export function calculateSprintMetrics(snapshot: SprintSnapshotDocument): SprintMetricsDocument {
  const issues = snapshot.issues
  const syncedAt = snapshot.syncedAt
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

  const avg = (xs: number[]) => (xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length)

  const plannedIssues = issues.filter((i) => !i.flags.addedDuringSprint)
  const unplannedIssues = issues.filter((i) => i.flags.addedDuringSprint)
  const storyPointsCommitted = sumPoints(plannedIssues)
  const storyPointsAddedDuringSprint = sumPoints(unplannedIssues)
  const spillList = issues.filter((i) => i.flags.spillover)
  const storyPointsSpillover = sumPoints(spillList)

  const plannedCount = plannedIssues.length
  const unplannedCount = unplannedIssues.length
  const totalIssues = issues.length

  const scopeChangeRateIssues = plannedCount > 0 ? unplannedCount / plannedCount : null
  const scopeChangeRateStoryPoints =
    storyPointsCommitted > 0 ? storyPointsAddedDuringSprint / storyPointsCommitted : null
  const spilloverRateIssues = totalIssues > 0 ? issues.filter((i) => i.flags.spillover).length / totalIssues : null
  const totalScopePts = storyPointsCommitted + storyPointsAddedDuringSprint
  const spilloverRateStoryPoints =
    totalScopePts > 0 ? storyPointsSpillover / totalScopePts : null

  const deliveredPlanned = plannedIssues.filter((i) => i.flags.delivered)
  const plannedDeliveredCount = deliveredPlanned.length
  const committedPtsDelivered = sumPoints(deliveredPlanned)
  const commitmentReliabilityIssues = plannedCount > 0 ? plannedDeliveredCount / plannedCount : null
  const commitmentReliabilityStoryPoints = storyPointsCommitted > 0 ? committedPtsDelivered / storyPointsCommitted : null
  const plannedCompletionRate = commitmentReliabilityStoryPoints

  const agingByOpen: number[] = []
  for (const i of issues) {
    if (!i.flags.delivered) {
      agingByOpen.push(daysBetween(i.createdAt, syncedAt))
    }
  }

  const allDwells = issues.map((i) =>
    buildStatusDwellSegments({
      createdAt: i.createdAt,
      endAt: dwellEndAt(i, syncedAt),
      currentStatus: i.status,
      statusTransitions: i.changelogStatus,
    }),
  )

  let wSum = 0
  let rSum = 0
  let qSum = 0
  let bSum = 0
  let tSum = 0
  let rN = 0
  let qN = 0
  let bN = 0
  for (const segs of allDwells) {
    const c = sumDwellDaysInCategories(segs)
    tSum += c.allDays
    wSum += c.workDays
    if (c.reviewDays > 0) {
      rN += 1
      rSum += c.reviewDays
    }
    if (c.qaDays > 0) {
      qN += 1
      qSum += c.qaDays
    }
    if (c.blockedDays > 0) {
      bN += 1
      bSum += c.blockedDays
    }
  }
  const feNum = wSum
  const feDen = tSum
  const flowEfficiencyMetric = feDen > 0 ? feNum / feDen : null

  const { wipAverage, wipPeak, wipP85 } = computeWipMetricsForIssues(allDwells, issues, syncedAt)

  const statusAgg = new Map<string, { days: number; idSet: Set<string> }>()
  for (let idx = 0; idx < issues.length; idx += 1) {
    const m = sumDwellDaysByStatusName(allDwells[idx] ?? [])
    const i = issues[idx]!
    for (const [st, v] of m) {
      const cur = statusAgg.get(st) ?? { days: 0, idSet: new Set<string>() }
      cur.days += v.days
      cur.idSet.add(i.issueId)
      statusAgg.set(st, cur)
    }
  }
  const timeInStatus: TimeInStatusEntry[] = [...statusAgg.entries()]
    .map(([status, v]) => ({
      status,
      daysAvg: v.idSet.size > 0 ? v.days / v.idSet.size : 0,
      totalPersonDays: v.days,
      issueCount: v.idSet.size,
    }))
    .sort((a, b) => b.totalPersonDays - a.totalPersonDays)
    .slice(0, 32)

  let reopenTotal = 0
  for (const i of issues) {
    reopenTotal += countReopenTransitions(i.changelogStatus)
  }
  const firstPass = delivered.filter((i) => countReopenTransitions(i.changelogStatus) === 0).length
  const firstPassYield = delivered.length > 0 ? firstPass / delivered.length : null
  const reopenRate = delivered.length > 0 ? reopenTotal / delivered.length : null

  const bugDelivered = delivered.filter((i) => /bug|defect|incidente/i.test(i.issueType))
  const bugRate = delivered.length > 0 ? bugDelivered.length / delivered.length : null

  let hotfixN = 0
  let escapedN = 0
  for (const d of delivered) {
    for (const lab of d.labels) {
      if (HOTFIX_RE.test(lab)) {
        hotfixN += 1
        break
      }
    }
    for (const lab of d.labels) {
      if (ESCAPED_RE.test(lab)) {
        escapedN += 1
        break
      }
    }
  }
  const hotfixRate = delivered.length > 0 ? hotfixN / delivered.length : null
  const escapedDefects = delivered.length > 0 ? escapedN : null

  const mix = new Map<string, { sp: number; n: number }>()
  for (const d of delivered) {
    const t = d.issueType.trim() || '(outro)'
    const cur = mix.get(t) ?? { sp: 0, n: 0 }
    cur.sp += totalStoryPoints(d)
    cur.n += 1
    mix.set(t, cur)
  }
  const spDel = sumPoints(delivered) || 1
  const deliveryMixByType: DeliveryMixByTypeRow[] = [...mix.entries()]
    .map(([issueType, v]) => ({
      issueType,
      storyPoints: v.sp,
      issues: v.n,
      shareOfDelivered: v.sp / spDel,
    }))
    .sort((a, b) => b.storyPoints - a.storyPoints)

  const sIdx = 1 - Math.min(1, (spilloverRateStoryPoints ?? 0) + (scopeChangeRateStoryPoints ?? 0)) / 2
  const stabilityIndex = Math.max(0, Math.min(1, sIdx))

  const byAssignee = buildAssigneeMap(issues, syncedAt, allDwells)

  return {
    sprintId: snapshot.sprintId,
    syncedAt,
    velocityStoryPoints: sumPoints(delivered),
    velocityIssues: delivered.length,
    storyPointsDelivered: sumPoints(delivered),
    issuesDelivered: delivered.length,
    leadTimeDaysAvg: avg(leadSamples),
    cycleTimeDaysAvg: avg(cycleSamples),
    leadTimeSampleCount: leadSamples.length,
    cycleTimeSampleCount: cycleSamples.length,
    leadTimeDaysMedian: medianOf(leadSamples),
    cycleTimeDaysMedian: medianOf(cycleSamples),
    leadTimeDaysP85: p85Of(leadSamples),
    cycleTimeDaysP85: p85Of(cycleSamples),
    agingDaysAvgOpenIssues: agingByOpen.length > 0 ? agingByOpen.reduce((a, b) => a + b, 0) / agingByOpen.length : null,
    agingDaysP85OpenIssues: p85Of(agingByOpen),
    throughput: delivered.length,
    committedCount: issues.filter((i) => i.flags.committed).length,
    deliveredCount: delivered.length,
    spilloverCount: issues.filter((i) => i.flags.spillover).length,
    scopeAddedDuringSprint: unplannedCount,
    storyPointsCommitted,
    storyPointsAddedDuringSprint,
    storyPointsSpillover,
    commitmentReliabilityIssues,
    commitmentReliabilityStoryPoints,
    scopeChangeRateIssues,
    scopeChangeRateStoryPoints,
    spilloverRateIssues,
    spilloverRateStoryPoints,
    plannedCompletionRate,
    timeInStatus: timeInStatus.length ? timeInStatus : null,
    reviewTimeDaysAvg: rN > 0 ? rSum / rN : null,
    qaTimeDaysAvg: qN > 0 ? qSum / qN : null,
    blockedTimeDaysAvg: bN > 0 ? bSum / bN : null,
    flowEfficiency: flowEfficiencyMetric,
    wipAverage,
    wipPeak,
    wipP85,
    reopenCount: reopenTotal,
    reopenRate,
    firstPassYield,
    bugRate,
    hotfixRate,
    escapedDefects,
    byAssignee,
    stabilityIndex,
    deliveryMixByType,
    velocityTrend: null,
    throughputTrend: null,
    predictabilityTrend: null,
  }
}
