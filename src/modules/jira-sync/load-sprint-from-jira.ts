import { getJiraClientConfigFromEnv } from './env'
import type { JiraSprintApiResponse, JiraSprintIssuesPage } from './jira-agile-types'
import { JiraClient } from './jira-client'
import { mapJiraIssueToSnapshot } from './map-jira-issue-to-snapshot'
import type { JiraIssueSnapshot } from './types'

const DEFAULT_FIELDS = [
  'summary',
  'status',
  'assignee',
  'reporter',
  'issuetype',
  'created',
  'updated',
  'resolution',
  'resolutiondate',
  'labels',
  'components',
  'parent',
  'subtasks',
]

type JiraSubtaskRef = {
  key?: string
}

type JiraSearchIssue = {
  key?: string
  fields?: Record<string, unknown>
}

type JiraSearchResponse = {
  issues?: JiraSearchIssue[]
}

function buildFieldsParam(storyPointsFieldId?: string): string {
  const set = new Set(DEFAULT_FIELDS)
  if (storyPointsFieldId) {
    set.add(storyPointsFieldId)
  }
  return [...set].join(',')
}

function readStoryPoints(fields: Record<string, unknown>, fieldId?: string): number {
  if (!fieldId) {
    return 0
  }
  const v = fields[fieldId]
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v
  }
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
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
  if (fields.resolution != null || fields.resolutiondate != null) {
    return true
  }
  return isDoneCategory(fields)
}

function collectSubtaskKeys(fields: Record<string, unknown>): string[] {
  const subtasksRaw = fields.subtasks
  if (!Array.isArray(subtasksRaw)) {
    return []
  }
  return subtasksRaw
    .map((sub) => (sub && typeof sub === 'object' ? (sub as JiraSubtaskRef).key : undefined))
    .filter((k): k is string => typeof k === 'string' && k.trim() !== '')
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

async function loadSubtaskPointsMap(input: {
  client: JiraClient
  storyPointsFieldId?: string
  keys: string[]
}): Promise<Map<string, number>> {
  const { client, storyPointsFieldId, keys } = input
  const out = new Map<string, number>()
  if (!storyPointsFieldId || keys.length === 0) {
    return out
  }

  const batches = chunk(keys, 50)
  for (const batch of batches) {
    const quotedKeys = batch.map((k) => `"${k.replaceAll('"', '\\"')}"`).join(',')
    const jql = `issuekey in (${quotedKeys})`
    const qs = new URLSearchParams({
      jql,
      maxResults: String(batch.length),
      fields: `key,status,resolution,resolutiondate,${storyPointsFieldId}`,
    })
    const res = await client.jiraFetch(`/rest/api/3/search/jql?${qs.toString()}`)
    if (!res.ok) {
      const detail = await res.text()
      throw new Error(
        `Falha ao carregar subtasks no Jira (${res.status}). ${detail.slice(0, 500)}`,
      )
    }

    const payload = (await res.json()) as JiraSearchResponse
    for (const issue of payload.issues ?? []) {
      const key = issue.key?.trim()
      const fields = issue.fields
      if (!key || !fields) {
        continue
      }
      if (!isDelivered(fields)) {
        out.set(key, 0)
        continue
      }
      out.set(key, readStoryPoints(fields, storyPointsFieldId))
    }
  }

  return out
}

export type LoadSprintFromJiraResult = {
  issues: JiraIssueSnapshot[]
  sprintName: string
  sprintStartIso?: string
  sprintEndIso?: string
}

export async function loadSprintFromJira(input: {
  sprintId: string
  sprintName?: string
}): Promise<LoadSprintFromJiraResult> {
  const config = getJiraClientConfigFromEnv()
  const client = new JiraClient(config)
  /** Team-managed costuma usar customfield_10016; sobrescreva com JIRA_STORY_POINTS_FIELD se for diferente. */
  const storyPointsFieldId =
    process.env.JIRA_STORY_POINTS_FIELD?.trim() || 'customfield_10016'
  const sprintId = input.sprintId.trim()

  const metaRes = await client.jiraFetch(
    `/rest/agile/1.0/sprint/${encodeURIComponent(sprintId)}`,
  )
  if (!metaRes.ok) {
    const detail = await metaRes.text()
    throw new Error(
      `Falha ao ler sprint ${sprintId} no Jira (${metaRes.status}). ${detail.slice(0, 500)}`,
    )
  }

  const meta = (await metaRes.json()) as JiraSprintApiResponse
  const sprintName = input.sprintName?.trim() || meta.name
  const sprintStartIso = meta.startDate
  const sprintEndIso = meta.endDate ?? meta.completeDate

  const fields = buildFieldsParam(storyPointsFieldId)
  const issues: JiraIssueSnapshot[] = []
  const nodes: JiraSprintIssuesPage['issues'] = []
  let startAt = 0
  let total = Number.POSITIVE_INFINITY
  const maxResults = 100

  while (startAt < total) {
    const qs = new URLSearchParams({
      startAt: String(startAt),
      maxResults: String(maxResults),
      fields,
      expand: 'changelog',
    })
    const path = `/rest/agile/1.0/sprint/${encodeURIComponent(sprintId)}/issue?${qs.toString()}`
    const pageRes = await client.jiraFetch(path)
    if (!pageRes.ok) {
      const detail = await pageRes.text()
      throw new Error(
        `Falha ao listar issues da sprint ${sprintId} (${pageRes.status}). ${detail.slice(0, 500)}`,
      )
    }

    const page = (await pageRes.json()) as JiraSprintIssuesPage
    total = typeof page.total === 'number' ? page.total : 0

    for (const node of page.issues ?? []) {
      nodes.push(node)
    }

    const batch = page.issues?.length ?? 0
    if (batch === 0) {
      break
    }
    startAt += batch
  }

  const issueKeySet = new Set(nodes.map((node) => node.key))
  const subtaskKeysByIssue = new Map<string, string[]>()
  const missingSubtaskKeys = new Set<string>()

  for (const node of nodes) {
    const parentSubtaskKeys = collectSubtaskKeys(node.fields).filter((k) => !issueKeySet.has(k))
    subtaskKeysByIssue.set(node.key, parentSubtaskKeys)
    for (const key of parentSubtaskKeys) {
      missingSubtaskKeys.add(key)
    }
  }

  const subtaskPointsMap = await loadSubtaskPointsMap({
    client,
    storyPointsFieldId,
    keys: [...missingSubtaskKeys],
  })

  for (const node of nodes) {
    const inheritedSubtaskPoints = (subtaskKeysByIssue.get(node.key) ?? []).reduce(
      (acc, subtaskKey) => acc + (subtaskPointsMap.get(subtaskKey) ?? 0),
      0,
    )
    issues.push(
      mapJiraIssueToSnapshot(node, {
        storyPointsFieldId,
        sprintStartIso,
        subtaskStoryPoints: inheritedSubtaskPoints,
      }),
    )
  }

  return {
    issues,
    sprintName,
    sprintStartIso,
    sprintEndIso,
  }
}
