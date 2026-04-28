import type { SprintMetricsDocument } from './types'

/**
 * Parágrafo sintético para gestão: diagnóstico, sem tom punitivo.
 * Gerado no backend para manter uma única fonte de texto.
 */
export function buildExecutiveSummary(
  sprintName: string,
  metrics: SprintMetricsDocument | null,
  extractionStatus: string,
): string | null {
  const name = sprintName.trim() || 'Sprint'

  if (!metrics) {
    if (extractionStatus === 'complete') {
      return `Resumo executivo — «${name}»: dados da sprint estão no repositório, mas as métricas agregadas ainda não estão disponíveis. Volte a carregar após sincronizar.`
    }
    return `Resumo executivo — «${name}»: sincronização com extração «${extractionStatus}». Valide os dados no Jira antes de usar estes números em decisões.`
  }

  const pts = metrics.storyPointsDelivered
  const iss = metrics.issuesDelivered
  const committed = metrics.committedCount
  const delivered = metrics.deliveredCount
  const spill = metrics.spilloverCount
  const added = metrics.scopeAddedDuringSprint
  const lead = metrics.leadTimeDaysAvg
  const cycle = metrics.cycleTimeDaysAvg
  const leadN = metrics.leadTimeSampleCount ?? 0
  const cycleN = metrics.cycleTimeSampleCount ?? 0

  const parts: string[] = []

  parts.push(
    `Na «${name}», a equipa registrou ${delivered} entrega(s) contabilizada(s) (${pts} story points e ${iss} issues), face a ${committed} item(ns) em committed.`,
  )

  if (spill > 0 || added > 0) {
    parts.push(
      `Houve ${spill} spillover e ${added} item(ns) de escopo acrescentado durante a sprint — convém rever planeamento e previsibilidade.`,
    )
  } else {
    parts.push('Não há spillover nem escopo adicionado registado neste recorte, o que simplifica a leitura do compromisso vs entrega.')
  }

  if (lead !== null && cycle !== null) {
    parts.push(
      `Tempos médios: lead time ${lead.toFixed(1)} d (amostra n=${leadN}) e cycle time ${cycle.toFixed(1)} d (n=${cycleN}); usados para diagnóstico de fluxo, não para ranking entre pessoas.`,
    )
  } else if (lead !== null) {
    parts.push(
      `Lead time médio ${lead.toFixed(1)} d (n=${leadN}). Cycle time depende de changelog completo na sincronização.`,
    )
  } else {
    parts.push('Tempos médios não estão disponíveis (faltam datas de resolução ou amostra vazia).')
  }

  const si = metrics.stabilityIndex
  if (si != null) {
    parts.push(
      `Índice de estabilidade de escopo (0–1) ≈ ${si.toFixed(2)} — combina spillover e alteração de escopo; não mede desempenho individual.`,
    )
  }
  const fpy = metrics.firstPassYield
  if (fpy != null) {
    parts.push(
      `First pass yield (entregas sem reabertura de workflow) ≈ ${(fpy * 100).toFixed(0)} % — reaberturas dependem de regras de coluna e changelog.`,
    )
  }
  const br = metrics.bugRate
  if (br != null) {
    parts.push(
      `Proporção de entregas classificadas como bug/tipo similar (leitura heurística) ≈ ${(br * 100).toFixed(0)} %.`,
    )
  }

  parts.push(
    'Esta leitura é gerencial: combine com contexto de negócio e riscos antes de decisões.',
  )

  return parts.join(' ')
}
