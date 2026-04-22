import type { JiraIssueSnapshot } from '@/modules/jira-sync/types'

export type MetadataCountRow = {
  name: string
  issues: number
  storyPoints: number
}

export type SnapshotMetadataSummary = {
  /** Issues com flag delivered. */
  deliveredIssueCount: number
  /** Tipo/categoria da issue no Jira (Story, Task, Bug, ...). */
  topIssueTypes: MetadataCountRow[]
  topLabels: MetadataCountRow[]
  topComponents: MetadataCountRow[]
  /** Chave do épico ou «(sem épico)». */
  topEpics: MetadataCountRow[]
}

const TOP_N = 12

function sortAndTrim(rows: Map<string, { issues: number; storyPoints: number }>): MetadataCountRow[] {
  return [...rows.entries()]
    .map(([name, v]) => ({ name, issues: v.issues, storyPoints: v.storyPoints }))
    .sort((a, b) => b.issues - a.issues || b.storyPoints - a.storyPoints)
    .slice(0, TOP_N)
}

/**
 * Agrega labels, componentes e épicos nas **entregues** da sprint (flags.delivered).
 * Story points somam por linha de agregação (uma issue com várias labels conta em cada).
 */
export function summarizeDeliveredMetadata(issues: JiraIssueSnapshot[]): SnapshotMetadataSummary {
  const delivered = issues.filter((i) => i.flags.delivered)

  const labels = new Map<string, { issues: number; storyPoints: number }>()
  const components = new Map<string, { issues: number; storyPoints: number }>()
  const epics = new Map<string, { issues: number; storyPoints: number }>()
  const issueTypes = new Map<string, { issues: number; storyPoints: number }>()

  for (const issue of delivered) {
    const pts = (issue.storyPoints ?? 0) + (issue.subtaskStoryPoints ?? 0)
    const issueType = issue.issueType?.trim() ? issue.issueType.trim() : '(sem categoria)'
    const ik = issueType.slice(0, 64)
    const curType = issueTypes.get(ik) ?? { issues: 0, storyPoints: 0 }
    curType.issues += 1
    curType.storyPoints += pts
    issueTypes.set(ik, curType)

    const labelList = issue.labels?.length ? issue.labels : ['(sem label)']
    for (const raw of labelList) {
      const name = (raw?.trim() || '(sem label)').slice(0, 120)
      const cur = labels.get(name) ?? { issues: 0, storyPoints: 0 }
      cur.issues += 1
      cur.storyPoints += pts
      labels.set(name, cur)
    }

    const compList = issue.components?.length ? issue.components : ['(sem componente)']
    for (const raw of compList) {
      const name = (raw?.trim() || '(sem componente)').slice(0, 120)
      const cur = components.get(name) ?? { issues: 0, storyPoints: 0 }
      cur.issues += 1
      cur.storyPoints += pts
      components.set(name, cur)
    }

    const epicKey = issue.epicKey?.trim() ? issue.epicKey.trim() : '(sem épico)'
    const ek = epicKey.slice(0, 64)
    const curE = epics.get(ek) ?? { issues: 0, storyPoints: 0 }
    curE.issues += 1
    curE.storyPoints += pts
    epics.set(ek, curE)
  }

  return {
    deliveredIssueCount: delivered.length,
    topIssueTypes: sortAndTrim(issueTypes),
    topLabels: sortAndTrim(labels),
    topComponents: sortAndTrim(components),
    topEpics: sortAndTrim(epics),
  }
}
