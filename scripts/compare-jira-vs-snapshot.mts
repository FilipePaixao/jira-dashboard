/**
 * Uso: na raiz do projeto, com .env.local carregado:
 *   set -a && source .env.local && set +a && npx --yes tsx scripts/compare-jira-vs-snapshot.mts [sprintId]
 *
 * Compara: métricas persistidas | recalculadas a partir do snapshot Mongo | cálculo sobre issues recém-lidas do Jira.
 */
import { loadSprintFromJira } from '../src/modules/jira-sync/load-sprint-from-jira'
import { calculateSprintMetrics } from '../src/modules/metrics/calculate-sprint-metrics'
import { getSprintMetricsBySprintId } from '../src/modules/metrics/repository'
import { getSprintSnapshotBySprintId } from '../src/modules/sprints/repository'
import type { SprintSnapshotDocument } from '../src/modules/sprints/models'
import type { SprintMetricsDocument } from '../src/modules/metrics/types'

const id = (process.argv[2] ?? '104').trim()

function pickPrevisFlowMix(m: SprintMetricsDocument) {
  return {
    previsibilidade: {
      storyPointsCommitted: m.storyPointsCommitted,
      storyPointsAddedDuringSprint: m.storyPointsAddedDuringSprint,
      storyPointsSpillover: m.storyPointsSpillover,
      scopeChangeRateStoryPoints: m.scopeChangeRateStoryPoints,
      spilloverRateStoryPoints: m.spilloverRateStoryPoints,
      plannedCompletionRate: m.plannedCompletionRate,
      stabilityIndex: m.stabilityIndex,
    },
    fluxoTempos: {
      leadTimeDaysAvg: m.leadTimeDaysAvg,
      leadTimeDaysMedian: m.leadTimeDaysMedian,
      leadTimeDaysP85: m.leadTimeDaysP85,
      cycleTimeDaysAvg: m.cycleTimeDaysAvg,
      cycleTimeDaysMedian: m.cycleTimeDaysMedian,
      cycleTimeDaysP85: m.cycleTimeDaysP85,
      flowEfficiency: m.flowEfficiency,
      wipAverage: m.wipAverage,
      wipPeak: m.wipPeak,
    },
    timeInStatusTop3: (m.timeInStatus ?? []).slice(0, 3),
    mixTop3: (m.deliveryMixByType ?? []).slice(0, 3),
    issuesInSprint: {
      total: m.committedCount,
      delivered: m.deliveredCount,
    },
  }
}

async function main() {
  const snap = await getSprintSnapshotBySprintId(id)
  const stored = await getSprintMetricsBySprintId(id)
  const fromSnapshot = snap ? calculateSprintMetrics(snap) : null

  let fromLive: SprintMetricsDocument | null = null
  let liveError: string | null = null
  try {
    const loaded = await loadSprintFromJira({ sprintId: id, sprintName: snap?.sprintName })
    const liveDoc: SprintSnapshotDocument = {
      sprintId: id,
      boardId: snap?.boardId ?? null,
      sprintName: loaded.sprintName,
      syncedAt: new Date().toISOString(),
      issues: loaded.issues,
      extractionStatus: loaded.issues.length > 0 ? 'complete' : 'partial',
    }
    fromLive = calculateSprintMetrics(liveDoc)
  } catch (e) {
    liveError = e instanceof Error ? e.message : String(e)
  }

  const out = {
    sprintId: id,
    storedSnapshotSyncedAt: snap?.syncedAt ?? null,
    sources: {
      persistido_mongo: stored ? pickPrevisFlowMix(stored) : null,
      recalculado_do_snapshot: fromSnapshot ? pickPrevisFlowMix(fromSnapshot) : null,
      jira_ao_vivo: fromLive ? pickPrevisFlowMix(fromLive) : null,
      jiraErro: liveError,
    },
    nota:
      'recalculado_do_snapshot deve coincidir com persistido_mongo (salvo diferenças de versão do cálculo). ' +
      'jira_ao_vivo difere se o Jira mudou após a última sincronização ou se o snapshot tem boardId/extração diferente.',
  }

  console.log(JSON.stringify(out, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
