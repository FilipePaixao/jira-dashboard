'use client'

function GuideItem({
  title,
  description,
  formula,
  interpretation,
}: {
  title: string
  description: string
  formula?: string
  interpretation: string
}) {
  return (
    <article className="rounded-xl border border-secondary-light/80 bg-surface-light/40 p-4 dark:border-secondary-dark dark:bg-[#252525]/50">
      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{description}</p>
      {formula ? (
        <p className="mt-2 rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {formula}
        </p>
      ) : null}
      <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{interpretation}</p>
    </article>
  )
}

export function MetricsGuideTab() {
  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-sauvvi/20 bg-sauvvi/5 p-4 text-sm text-neutral-700 dark:text-neutral-200">
        Este guia detalha as métricas e gráficos do painel com foco gerencial. As leituras apoiam diagnóstico de
        fluxo e previsibilidade, não ranking punitivo de pessoas.
      </div>

      <div className="space-y-3">
        <h3 className="font-brand text-base font-semibold text-neutral-900 dark:text-white">Métricas principais</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <GuideItem
            title="Story points entregues"
            description="Total de pontos de issues entregues na sprint."
            formula="storyPointsDelivered = soma(points das entregues)"
            interpretation="Indica capacidade efetiva entregue em esforço, não necessariamente volume de itens."
          />
          <GuideItem
            title="Issues entregues"
            description="Quantidade de issues com flag de entregue."
            formula="issuesDelivered = contagem(issues entregues)"
            interpretation="Ajuda a ler throughput em unidades de trabalho."
          />
          <GuideItem
            title="Velocidade (pts)"
            description="Velocidade da sprint em story points entregues."
            formula="velocityStoryPoints = storyPointsDelivered"
            interpretation="Comparar tendência entre sprints é mais útil do que valor isolado."
          />
          <GuideItem
            title="Throughput"
            description="Quantidade de itens concluídos no recorte da sprint."
            formula="throughput = issuesDelivered"
            interpretation="Mede vazão de itens; use junto com lead/cycle para evitar conclusões rasas."
          />
          <GuideItem
            title="Lead time médio (dias)"
            description="Tempo médio da criação até resolução das issues entregues."
            formula="avg(resolvedAt - createdAt)"
            interpretation="Quanto menor e estável, maior previsibilidade de ponta a ponta."
          />
          <GuideItem
            title="Cycle time médio (dias)"
            description="Tempo médio da primeira mudança de status (changelog) até resolução."
            formula="avg(resolvedAt - workStartedAt)"
            interpretation="Mede eficiência no período de execução; depende de changelog completo."
          />
          <GuideItem
            title="Committed / Entregues / Spillover / Escopo adicionado"
            description="Contadores de compromisso inicial, entrega final, itens que vazaram e itens adicionados durante a sprint."
            interpretation="Conjunto usado para ler disciplina de planejamento e estabilidade de escopo."
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-brand text-base font-semibold text-neutral-900 dark:text-white">Métricas avançadas</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <GuideItem
            title="Taxa de conclusão planejada (pts)"
            description="Percentual de pontos planejados que foram efetivamente entregues."
            formula="plannedCompletionRate = pontos_planejados_entregues / storyPointsCommitted"
            interpretation="Mostra confiabilidade do plano em termos de esforço."
          />
          <GuideItem
            title="Índice de estabilidade (0–1)"
            description="Indicador sintético considerando mudança de escopo e spillover."
            interpretation="Mais perto de 1 tende a indicar sprint mais estável."
          />
          <GuideItem
            title="First pass yield"
            description="Percentual de entregas sem reabertura de workflow."
            formula="firstPassYield = entregues_sem_reopen / entregues"
            interpretation="Maior valor sugere melhor qualidade de fluxo."
          />
          <GuideItem
            title="Bug rate"
            description="Proporção de itens entregues classificados como bug/defect (heurística por tipo)."
            interpretation="Útil para monitorar pressão de correção versus entrega de valor novo."
          />
          <GuideItem
            title="Eficiência de fluxo"
            description="Razão entre tempo de trabalho e tempo total em coluna."
            formula="flowEfficiency = workDays / allDays"
            interpretation="Quanto maior, menor parcela relativa em espera/bloqueio/retrabalho."
          />
          <GuideItem
            title="WIP médio e pico de WIP"
            description="Número médio e máximo de issues em progresso na janela observada."
            interpretation="WIP alto e persistente costuma aumentar cycle time e variabilidade."
          />
          <GuideItem
            title="Tempo em review / Aging aberto / Tendências"
            description="Tempo médio em review, idade média de abertas e variação de velocidade/throughput versus sprint anterior."
            interpretation="Apoia diagnóstico de gargalos e sinais de risco operacional."
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-brand text-base font-semibold text-neutral-900 dark:text-white">Gráficos do painel</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <GuideItem
            title="Velocidade ao longo do tempo (linha)"
            description="Mostra story points entregues por sprint na ordem de sincronização."
            interpretation="Usa os filtros de período/ID da lista para leitura de tendência histórica."
          />
          <GuideItem
            title="Pontos por pessoa / Issues por pessoa (barras horizontais)"
            description="Distribuição de pontos e volume de entregas por responsável."
            interpretation="Leitura contextual de carga e contribuição; não usar isoladamente como ranking."
          />
          <GuideItem
            title="Distribuição de pontos (donut)"
            description="Participação relativa de story points entregues por pessoa."
            interpretation="Mostra concentração da entrega na sprint."
          />
          <GuideItem
            title="Comparativo de fluxo (colunas)"
            description="Committed, Entregues, Spillover e Escopo + em uma visão única."
            interpretation="Ajuda a discutir aderência ao plano e mudanças durante execução."
          />
          <GuideItem
            title="Tempo médio (dias) — Lead x Cycle"
            description="Comparativo direto entre lead e cycle médio."
            interpretation="Gap alto entre lead e cycle sugere esperas antes de iniciar execução."
          />
          <GuideItem
            title="Escopo (story points)"
            description="Planejado, escopo adicionado e spillover em pontos."
            interpretation="Evidencia pressão de mudança de escopo ao longo da sprint."
          />
          <GuideItem
            title="Lead & cycle (dias) — média, mediana e P85"
            description="Distribuição estatística de tempos com visão de cauda (P85)."
            interpretation="P85 alto sinaliza variabilidade e casos extremos que afetam previsibilidade."
          />
          <GuideItem
            title="Tempo médio por coluna (dias)"
            description="Tempo médio por estado de workflow (changelog), com normalização de backlog."
            interpretation="Não é mapeamento 1:1 das colunas do board; usa histórico de status da issue."
          />
          <GuideItem
            title="Mix de entregas por tipo (donut)"
            description="Proporção de entregas por tipo de issue em story points."
            interpretation="Equilibra leitura entre evolução de produto e esforço corretivo."
          />
        </div>
      </div>
    </section>
  )
}
