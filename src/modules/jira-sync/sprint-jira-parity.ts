import { getJiraClientConfigFromEnv } from './env'
import { JiraClient } from './jira-client'
import {
  buildJiraSprintFieldsParam,
  fetchIssuesByJql,
  fetchSprintBoardIssueNodes,
  loadSprintFromJira,
} from './load-sprint-from-jira'
import { calculateSprintMetrics } from '../metrics/calculate-sprint-metrics'
import type { SprintSnapshotDocument } from '../sprints/models'

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

/** Alinhado a `map-jira-issue-to-snapshot` / cálculo de entrega. */
function isDeliveredRaw(fields: Record<string, unknown>): boolean {
  if (fields.resolution != null || fields.resolutiondate != null) {
    return true
  }
  return isDoneCategory(fields)
}

function sortedKeys(set: Set<string>): string[] {
  return [...set].sort()
}

/**
 * Compara a extração usada no dash com **duas fontes diretas** do Jira:
 * 1) `GET /rest/agile/1.0/sprint/{id}/issue` (board) — a que o `sync` usa
 * 2) `GET /rest/api/3/search/jql` com JQL de sprint (lista alternativa, deve coincidir em tamanho/chaves)
 *
 * e valida o pipeline: `loadSprintFromJira` → `calculateSprintMetrics` (contagens básicas e entregas).
 */
export type SprintJiraParityResult = {
  ok: boolean
  sprintId: string
  /** Board Agile: contagem e total de issue keys */
  boardApi: { issueCount: number; totalReported: number; keys: string[] }
  /** JQL: mesmo conjunto? */
  jql: {
    jqlTried: string
    issueCount: number
    totalReported: number
    keys: string[] | null
    error?: string
  } | null
  /** Só deverá falhar com bugs ou com mudanças de API entre as duas chamadas. */
  setParity: {
    jqlKeysMatchAgile: boolean
    onlyInAgile: string[]
    onlyInJql: string[]
  } | null
  /** A partir de `loadSprintFromJira` + cálculo */
  pipeline: {
    issuesInSnapshot: number
    issuesDeliveredMetrics: number
    deliveredByRawFieldsOnAgile: number
    sameDelivered: boolean
    storyPointsDeliveredMetrics: number
  }
  messages: string[]
}

export async function runSprintJiraParityCheck(sprintIdRaw: string): Promise<SprintJiraParityResult> {
  const sprintId = sprintIdRaw.trim()
  const config = getJiraClientConfigFromEnv()
  const client = new JiraClient(config)
  const storyPointsFieldId = process.env.JIRA_STORY_POINTS_FIELD?.trim() || 'customfield_10016'
  const fields = buildJiraSprintFieldsParam(storyPointsFieldId)
  const messages: string[] = []

  const { nodes, total: totalReported } = await fetchSprintBoardIssueNodes({ client, sprintId, fields })
  const boardKeys = new Set(nodes.map((n) => n.key))
  if (boardKeys.size !== nodes.length) {
    messages.push('Aviso: a API do board devolveu keys duplicadas; investigar.')
  }
  let rawDelivered = 0
  for (const n of nodes) {
    if (isDeliveredRaw(n.fields)) {
      rawDelivered += 1
    }
  }

  const loaded = await loadSprintFromJira({ sprintId })
  if (nodes.length !== loaded.issues.length) {
    messages.push(
      `Atenção: entre duas chamadas ao Jira o n.º de issues do board difere: ${nodes.length} (1.ª) vs ${loaded.issues.length} (sync) — re-sincronize se precisar de uma única fotografia coerente.`,
    )
  }
  const snap: SprintSnapshotDocument = {
    sprintId,
    boardId: null,
    sprintName: loaded.sprintName,
    syncedAt: new Date().toISOString(),
    issues: loaded.issues,
    extractionStatus: loaded.issues.length > 0 ? 'complete' : 'partial',
  }
  const m = calculateSprintMetrics(snap)
  const deliveredFlags = loaded.issues.filter((i) => i.flags.delivered).length
  if (rawDelivered !== m.issuesDelivered) {
    messages.push(
      `Divergência: entregues por campos Jira (resolution/status) = ${rawDelivered} vs issuesDelivered nas métricas = ${m.issuesDelivered} (mapeamento de flags).`,
    )
  }
  if (deliveredFlags !== m.issuesDelivered) {
    messages.push(
      `Divergência: flags.delivered = ${deliveredFlags} vs metrics.issuesDelivered = ${m.issuesDelivered}.`,
    )
  }
  if (rawDelivered !== deliveredFlags) {
    messages.push(
      `Divergência: entregas por ` + '`fields` cru' + ` = ${rawDelivered} vs flags = ${deliveredFlags}.`,
    )
  }

  const pipeline = {
    issuesInSnapshot: loaded.issues.length,
    issuesDeliveredMetrics: m.issuesDelivered,
    deliveredByRawFieldsOnAgile: rawDelivered,
    sameDelivered: rawDelivered === m.issuesDelivered && deliveredFlags === m.issuesDelivered,
    storyPointsDeliveredMetrics: m.storyPointsDelivered,
  }

  let jql: SprintJiraParityResult['jql'] = null
  let setParity: SprintJiraParityResult['setParity'] = null
  const jqlErrors: string[] = []
  const jqlCandidates = [`Sprint = ${sprintId}`, `sprint = ${sprintId}`, `Sprint in (${sprintId})`]
  for (const jqlTried of jqlCandidates) {
    try {
      const r = await fetchIssuesByJql(client, jqlTried, fields)
      const jset = new Set(r.issues.map((i) => i.key))
      const onlyInAgile = sortedKeys(
        new Set([...boardKeys].filter((k) => !jset.has(k))),
      )
      const onlyInJql = sortedKeys(
        new Set([...jset].filter((k) => !boardKeys.has(k))),
      )
      jql = {
        jqlTried,
        issueCount: r.issues.length,
        totalReported: r.total,
        keys: sortedKeys(jset),
      }
      if (jset.size !== r.total) {
        messages.push(
          `Aviso JQL: tamanho da página acumulada (${jset.size}) ≠ total reportado (${r.total}) — verificar paginação da API Jira.`,
        )
      }
      setParity = {
        jqlKeysMatchAgile: onlyInAgile.length === 0 && onlyInJql.length === 0,
        onlyInAgile,
        onlyInJql,
      }
      if (onlyInAgile.length > 0 || onlyInJql.length > 0) {
        messages.push(
          `Diferença de conjuntos JQL «${jqlTried}» vs board Agile. No board, não JQL: ${onlyInAgile.length}; no JQL, não no board: ${onlyInJql.length}.`,
        )
      } else {
        messages.push(
          `Chaves: JQL «${jqlTried}» bate com o board Agile (mesmas ${jset.size} issues).`,
        )
      }
      break
    } catch (e) {
      jqlErrors.push(
        e instanceof Error ? e.message : String(e),
      )
    }
  }
  if (jql === null) {
    jql = {
      jqlTried: jqlCandidates.join(' | '),
      issueCount: 0,
      totalReported: 0,
      keys: null,
      error: jqlErrors.length ? jqlErrors.join(' ·· ') : 'Falha desconhecida na JQL',
    }
  }

  const boardTotalMatches = boardKeys.size === totalReported
  const jqlKeysOk = jql?.keys != null && setParity !== null && setParity.jqlKeysMatchAgile
  const ok = boardTotalMatches && pipeline.sameDelivered && jqlKeysOk

  if (boardKeys.size !== totalReported) {
    messages.push(
      `Aviso: nós acumulados (${boardKeys.size}) ≠ total reportado pela API Agile (${totalReported}) — re-verificar paginação.`,
    )
  }

  return {
    ok,
    sprintId,
    boardApi: {
      issueCount: boardKeys.size,
      totalReported,
      keys: sortedKeys(boardKeys),
    },
    jql: jql.keys ? jql : { ...jql, keys: null },
    setParity,
    pipeline,
    messages,
  }
}
