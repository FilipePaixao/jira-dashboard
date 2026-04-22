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
]

function buildFieldsParam(storyPointsFieldId?: string): string {
  const set = new Set(DEFAULT_FIELDS)
  if (storyPointsFieldId) {
    set.add(storyPointsFieldId)
  }
  return [...set].join(',')
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
      issues.push(
        mapJiraIssueToSnapshot(node, {
          storyPointsFieldId,
          sprintStartIso,
        }),
      )
    }

    const batch = page.issues?.length ?? 0
    if (batch === 0) {
      break
    }
    startAt += batch
  }

  return {
    issues,
    sprintName,
    sprintStartIso,
    sprintEndIso,
  }
}
