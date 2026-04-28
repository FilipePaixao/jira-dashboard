import { getMongoDb } from '@/infra/mongodb/client'
import {
  buildStatusDwellSegments,
  computeWipMetricsForIssues,
  countReopenTransitions,
} from '@/modules/metrics/build-status-dwell-segments'
import type { JiraIssueSnapshot } from '@/modules/jira-sync/types'
import type { SprintSnapshotDocument } from '@/modules/sprints/models'
import { SPRINT_SNAPSHOTS_COLLECTION } from '@/modules/sprints/repository'
import { medianOf } from '@/modules/metrics/stat-helpers'

export type IndividualCategoryRow = {
  name: string
  issues: number
  storyPoints: number
}

export type IndividualAssigneeRow = {
  assignee: string
  storyPointsDelivered: number
  issuesDelivered: number
  /** Média de tarefas simultâneas em progresso no recorte da pessoa. */
  wipAverage?: number | null
  wipPeak?: number | null
  leadTimeDaysAvg: number | null
  cycleTimeDaysAvg: number | null
  leadTimeDaysMedian?: number | null
  cycleTimeDaysMedian?: number | null
  leadSampleCount: number
  cycleSampleCount: number
  spilloverCount: number
  scopeAddedCount: number
  storyPointsCommitted?: number
  storyPointsSpillover?: number
  reopenCount?: number
  reopenRate?: number | null
  plannedDeliveredCount?: number
  unplannedDeliveredCount?: number
  topCategories: IndividualCategoryRow[]
}

export type IndividualAnalysisSummary = {
  people: number
  storyPointsDelivered: number
  issuesDelivered: number
  leadSampleCount: number
  cycleSampleCount: number
}

export type IndividualAnalysisResult = {
  mode: 'sprint' | 'consolidated'
  referenceSprintId?: string
  days?: number
  fromSyncedAt?: string
  toSyncedAt?: string
  summary: IndividualAnalysisSummary
  byAssignee: IndividualAssigneeRow[]
  sprintComparison?: SprintComparison | null
}

export type SprintComparisonRow = {
  assignee: string
  current: Omit<IndividualAssigneeRow, 'assignee'>
  previous: Omit<IndividualAssigneeRow, 'assignee'>
}

export type SprintComparison = {
  currentSprintId: string
  previousSprintId: string | null
  rows: SprintComparisonRow[]
}

type IndividualAccumulator = {
  storyPointsDelivered: number
  issuesDelivered: number
  leadSamples: number[]
  cycleSamples: number[]
  spilloverCount: number
  scopeAddedCount: number
  storyPointsCommitted: number
  storyPointsSpill: number
  reopens: number
  plannedDelivered: number
  unplannedDelivered: number
  wipWeightedSum: number
  wipWeight: number
  wipPeak: number
  categories: Map<string, { issues: number; storyPoints: number }>
}

function assigneeKey(issue: JiraIssueSnapshot): string {
  return issue.assignee?.displayName ?? issue.assignee?.accountId ?? 'unassigned'
}

function issuePoints(issue: JiraIssueSnapshot): number {
  return (issue.storyPoints ?? 0) + (issue.subtaskStoryPoints ?? 0)
}

function daysBetween(isoA: string, isoB: string): number {
  const a = new Date(isoA).getTime()
  const b = new Date(isoB).getTime()
  return (b - a) / 86_400_000
}

function avg(list: number[]): number | null {
  if (list.length === 0) {
    return null
  }
  return list.reduce((a, b) => a + b, 0) / list.length
}

function toCategoryRows(
  rows: Map<string, { issues: number; storyPoints: number }>,
): IndividualCategoryRow[] {
  return [...rows.entries()]
    .map(([name, v]) => ({ name, issues: v.issues, storyPoints: v.storyPoints }))
    .sort((a, b) => b.storyPoints - a.storyPoints || b.issues - a.issues || a.name.localeCompare(b.name))
    .slice(0, 5)
}

function buildIndividualAnalysisFromSnapshots(
  snapshots: SprintSnapshotDocument[],
  mode: 'sprint' | 'consolidated',
  referenceSprintId?: string,
  days?: number,
): IndividualAnalysisResult {
  const byAssignee = new Map<string, IndividualAccumulator>()

  for (const snapshot of snapshots) {
    for (const issue of snapshot.issues) {
      const assignee = assigneeKey(issue)
      const acc: IndividualAccumulator =
        byAssignee.get(assignee) ??
        {
          storyPointsDelivered: 0,
          issuesDelivered: 0,
          leadSamples: [] as number[],
          cycleSamples: [] as number[],
          spilloverCount: 0,
          scopeAddedCount: 0,
          storyPointsCommitted: 0,
          storyPointsSpill: 0,
          reopens: 0,
          plannedDelivered: 0,
          unplannedDelivered: 0,
          wipWeightedSum: 0,
          wipWeight: 0,
          wipPeak: 0,
          categories: new Map(),
        }
      if (issue.flags.spillover) {
        acc.spilloverCount += 1
        acc.storyPointsSpill += issuePoints(issue)
      }
      if (issue.flags.addedDuringSprint) {
        acc.scopeAddedCount += 1
      }
      if (!issue.flags.addedDuringSprint) {
        acc.storyPointsCommitted += issuePoints(issue)
      }
      acc.reopens += countReopenTransitions(issue.changelogStatus)
      if (issue.flags.delivered) {
        const pts = issuePoints(issue)
        acc.storyPointsDelivered += pts
        acc.issuesDelivered += 1
        if (issue.flags.addedDuringSprint) {
          acc.unplannedDelivered += 1
        } else {
          acc.plannedDelivered += 1
        }

        if (issue.resolvedAt) {
          acc.leadSamples.push(daysBetween(issue.createdAt, issue.resolvedAt))
        }
        if (issue.resolvedAt && issue.workStartedAt?.trim()) {
          const ws = new Date(issue.workStartedAt).getTime()
          const res = new Date(issue.resolvedAt).getTime()
          if (Number.isFinite(ws) && Number.isFinite(res) && ws <= res) {
            acc.cycleSamples.push((res - ws) / 86_400_000)
          }
        }

        const category = issue.issueType?.trim() ? issue.issueType.trim() : '(sem categoria)'
        const curCat = acc.categories.get(category) ?? { issues: 0, storyPoints: 0 }
        curCat.issues += 1
        curCat.storyPoints += pts
        acc.categories.set(category, curCat)
      }

      byAssignee.set(assignee, acc)
    }
  }

  // WIP individual por snapshot (média de tarefas simultâneas em progresso por pessoa).
  for (const snapshot of snapshots) {
    const byAssigneeIssues = new Map<string, JiraIssueSnapshot[]>()
    for (const issue of snapshot.issues) {
      const k = assigneeKey(issue)
      const arr = byAssigneeIssues.get(k) ?? []
      arr.push(issue)
      byAssigneeIssues.set(k, arr)
    }
    for (const [assignee, list] of byAssigneeIssues) {
      const acc = byAssignee.get(assignee)
      if (!acc || list.length === 0) {
        continue
      }
      const dwells = list.map((i) =>
        buildStatusDwellSegments({
          createdAt: i.createdAt,
          endAt: i.resolvedAt && new Date(i.resolvedAt).getTime() < new Date(snapshot.syncedAt).getTime()
            ? i.resolvedAt
            : snapshot.syncedAt,
          currentStatus: i.status,
          statusTransitions: i.changelogStatus,
        }),
      )
      const { wipAverage, wipPeak } = computeWipMetricsForIssues(dwells, list, snapshot.syncedAt)
      acc.wipWeightedSum += wipAverage * list.length
      acc.wipWeight += list.length
      acc.wipPeak = Math.max(acc.wipPeak, wipPeak)
    }
  }

  const rows: IndividualAssigneeRow[] = [...byAssignee.entries()]
    .map(([assignee, acc]) => ({
      assignee,
      storyPointsDelivered: acc.storyPointsDelivered,
      issuesDelivered: acc.issuesDelivered,
      wipAverage: acc.wipWeight > 0 ? acc.wipWeightedSum / acc.wipWeight : null,
      wipPeak: acc.wipWeight > 0 ? acc.wipPeak : null,
      leadTimeDaysAvg: avg(acc.leadSamples),
      cycleTimeDaysAvg: avg(acc.cycleSamples),
      leadTimeDaysMedian: medianOf(acc.leadSamples),
      cycleTimeDaysMedian: medianOf(acc.cycleSamples),
      leadSampleCount: acc.leadSamples.length,
      cycleSampleCount: acc.cycleSamples.length,
      spilloverCount: acc.spilloverCount,
      scopeAddedCount: acc.scopeAddedCount,
      storyPointsCommitted: acc.storyPointsCommitted,
      storyPointsSpillover: acc.storyPointsSpill,
      reopenCount: acc.reopens,
      reopenRate: acc.issuesDelivered > 0 ? acc.reopens / acc.issuesDelivered : null,
      plannedDeliveredCount: acc.plannedDelivered,
      unplannedDeliveredCount: acc.unplannedDelivered,
      topCategories: toCategoryRows(acc.categories),
    }))
    .sort(
      (a, b) =>
        b.storyPointsDelivered - a.storyPointsDelivered ||
        b.issuesDelivered - a.issuesDelivered ||
        a.assignee.localeCompare(b.assignee),
    )

  const summary: IndividualAnalysisSummary = {
    people: rows.length,
    storyPointsDelivered: rows.reduce((acc, r) => acc + r.storyPointsDelivered, 0),
    issuesDelivered: rows.reduce((acc, r) => acc + r.issuesDelivered, 0),
    leadSampleCount: rows.reduce((acc, r) => acc + r.leadSampleCount, 0),
    cycleSampleCount: rows.reduce((acc, r) => acc + r.cycleSampleCount, 0),
  }

  const sortedSyncedAt = snapshots.map((s) => s.syncedAt).sort()
  return {
    mode,
    referenceSprintId,
    days,
    fromSyncedAt: sortedSyncedAt[0],
    toSyncedAt: sortedSyncedAt.at(-1),
    summary,
    byAssignee: rows,
  }
}

function emptyAssigneeMetrics(): Omit<IndividualAssigneeRow, 'assignee'> {
  return {
    storyPointsDelivered: 0,
    issuesDelivered: 0,
    wipAverage: null,
    wipPeak: null,
    leadTimeDaysAvg: null,
    cycleTimeDaysAvg: null,
    leadTimeDaysMedian: null,
    cycleTimeDaysMedian: null,
    leadSampleCount: 0,
    cycleSampleCount: 0,
    spilloverCount: 0,
    scopeAddedCount: 0,
    storyPointsCommitted: 0,
    storyPointsSpillover: 0,
    reopenCount: 0,
    reopenRate: null,
    plannedDeliveredCount: 0,
    unplannedDeliveredCount: 0,
    topCategories: [],
  }
}

function buildSprintComparison(
  currentSnapshot: SprintSnapshotDocument,
  previousSnapshot: SprintSnapshotDocument | null,
): SprintComparison {
  const currentRows = buildIndividualAnalysisFromSnapshots(
    [currentSnapshot],
    'sprint',
    currentSnapshot.sprintId,
  ).byAssignee
  const previousRows = previousSnapshot
    ? buildIndividualAnalysisFromSnapshots([previousSnapshot], 'sprint', previousSnapshot.sprintId).byAssignee
    : []

  const currentMap = new Map(currentRows.map((r) => [r.assignee, r]))
  const previousMap = new Map(previousRows.map((r) => [r.assignee, r]))
  const allAssignees = [...new Set([...currentMap.keys(), ...previousMap.keys()])]

  const rowBody = (r: IndividualAssigneeRow): Omit<IndividualAssigneeRow, 'assignee'> => {
    const { assignee: _a, ...rest } = r
    return rest
  }

  const rows: SprintComparisonRow[] = allAssignees
    .map((assignee) => ({
      assignee,
      current: currentMap.get(assignee) ? rowBody(currentMap.get(assignee)!) : emptyAssigneeMetrics(),
      previous: previousMap.get(assignee) ? rowBody(previousMap.get(assignee)!) : emptyAssigneeMetrics(),
    }))
    .sort(
      (a, b) =>
        b.current.storyPointsDelivered - a.current.storyPointsDelivered ||
        b.current.issuesDelivered - a.current.issuesDelivered ||
        a.assignee.localeCompare(b.assignee),
    )

  return {
    currentSprintId: currentSnapshot.sprintId,
    previousSprintId: previousSnapshot?.sprintId ?? null,
    rows,
  }
}

export async function getIndividualAnalysis(input: {
  sprintId?: string
  days?: number
}): Promise<IndividualAnalysisResult> {
  const db = await getMongoDb()
  const coll = db.collection<SprintSnapshotDocument>(SPRINT_SNAPSHOTS_COLLECTION)

  const sprintId = input.sprintId?.trim()
  if (sprintId) {
    const snapshot = await coll.findOne({ sprintId })
    if (!snapshot) {
      throw new Error('Sprint não encontrada')
    }
    const previous = await coll
      .find({ syncedAt: { $lt: snapshot.syncedAt } })
      .sort({ syncedAt: -1 })
      .limit(1)
      .next()

    const result = buildIndividualAnalysisFromSnapshots([snapshot], 'sprint', sprintId)
    return {
      ...result,
      sprintComparison: buildSprintComparison(snapshot, previous),
    }
  }

  const daysRaw = input.days ?? 30
  const days = Math.min(365 * 5, Math.max(1, Math.floor(daysRaw)))
  const from = new Date(Date.now() - days * 86_400_000).toISOString()
  const snapshots = await coll.find({ syncedAt: { $gte: from } }).sort({ syncedAt: -1 }).toArray()

  const result = buildIndividualAnalysisFromSnapshots(snapshots, 'consolidated', undefined, days)
  return { ...result, sprintComparison: null }
}

export const __private__ = {
  buildIndividualAnalysisFromSnapshots,
  buildSprintComparison,
}
