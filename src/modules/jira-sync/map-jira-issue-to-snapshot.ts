import type { JiraIssueSnapshot } from './types'
import type { JiraIssueApiNode } from './jira-agile-types'
import { extractWorkStartedAtFromChangelog } from './work-started-from-changelog'

export type MapIssueContext = {
  storyPointsFieldId?: string
  sprintStartIso?: string
  subtaskStoryPoints?: number
}

function readUser(
  raw: unknown,
): { displayName?: string; accountId?: string; emailAddress?: string } | null {
  if (raw === null || raw === undefined) {
    return null
  }
  if (typeof raw !== 'object') {
    return null
  }
  const o = raw as Record<string, unknown>
  return {
    displayName: typeof o.displayName === 'string' ? o.displayName : undefined,
    accountId: typeof o.accountId === 'string' ? o.accountId : undefined,
    emailAddress: typeof o.emailAddress === 'string' ? o.emailAddress : undefined,
  }
}

function readStoryPoints(fields: Record<string, unknown>, fieldId?: string): number | null {
  if (!fieldId) {
    return null
  }
  const v = fields[fieldId]
  if (v === null || v === undefined) {
    return null
  }
  if (typeof v === 'number') {
    return v
  }
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function isDoneCategory(fields: Record<string, unknown>): boolean {
  const status = fields.status
  if (status && typeof status === 'object') {
    const sc = (status as Record<string, unknown>).statusCategory
    if (sc && typeof sc === 'object' && 'key' in sc) {
      return (sc as { key?: string }).key === 'done'
    }
  }
  return false
}

function isDelivered(fields: Record<string, unknown>): boolean {
  if (fields.resolution != null) {
    return true
  }
  return isDoneCategory(fields)
}

export function mapJiraIssueToSnapshot(
  node: JiraIssueApiNode,
  ctx: MapIssueContext,
): JiraIssueSnapshot {
  const { fields } = node
  const summary = typeof fields.summary === 'string' ? fields.summary : ''
  const statusObj = fields.status
  const statusName =
    statusObj && typeof statusObj === 'object' && 'name' in statusObj
      ? String((statusObj as { name?: string }).name ?? '')
      : ''

  const issuetypeObj = fields.issuetype
  const issueType =
    issuetypeObj && typeof issuetypeObj === 'object' && 'name' in issuetypeObj
      ? String((issuetypeObj as { name?: string }).name ?? 'Unknown')
      : 'Unknown'

  const createdAt = typeof fields.created === 'string' ? fields.created : new Date(0).toISOString()
  const updatedAt = typeof fields.updated === 'string' ? fields.updated : createdAt
  const resolvedAt = typeof fields.resolutiondate === 'string' ? fields.resolutiondate : null
  const workStartedAt = extractWorkStartedAtFromChangelog(node.changelog)

  const labels = Array.isArray(fields.labels)
    ? (fields.labels as unknown[]).filter((x): x is string => typeof x === 'string')
    : []

  const componentsRaw = fields.components
  const components =
    Array.isArray(componentsRaw)
      ? (componentsRaw as { name?: string }[])
          .map((c) => (typeof c?.name === 'string' ? c.name : ''))
          .filter(Boolean)
      : []

  let epicKey: string | null = null
  const parent = fields.parent
  if (parent && typeof parent === 'object' && 'key' in parent) {
    const k = (parent as { key?: string }).key
    if (typeof k === 'string') {
      epicKey = k
    }
  }

  const delivered = isDelivered(fields)
  const sprintStart = ctx.sprintStartIso
  let addedDuringSprint = false
  if (sprintStart) {
    try {
      addedDuringSprint = new Date(createdAt).getTime() > new Date(sprintStart).getTime()
    } catch {
      addedDuringSprint = false
    }
  }

  const spillover = !delivered

  return {
    issueId: node.id,
    issueKey: node.key,
    summary,
    issueType,
    assignee: readUser(fields.assignee),
    reporter: readUser(fields.reporter),
    status: statusName,
    createdAt,
    updatedAt,
    workStartedAt,
    resolvedAt,
    storyPoints: readStoryPoints(fields, ctx.storyPointsFieldId),
    subtaskStoryPoints: ctx.subtaskStoryPoints ?? 0,
    labels,
    components,
    epicKey,
    changelogStatus: [],
    changelogSprint: [],
    changelogAssignee: [],
    flags: {
      committed: true,
      delivered,
      addedDuringSprint,
      spillover,
    },
  }
}
