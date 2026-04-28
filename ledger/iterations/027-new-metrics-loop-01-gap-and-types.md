# Iteração 027 — Loop 1: gap, contrato e tipos (new-metrics)

## Objetivo (new-metrics.md — «Loop 1»)

- Mapear métricas atuais vs faltantes.
- Definir contrato TypeScript para **todas** as métricas novas (campos opcionais, retrocompat).
- Criar testes de contrato que garantem que o cálculo existente continua a expor o núcleo documentado.

## Análise de gap (resumo)

| Área | Já existia | Passa a existir no contrato (tipos) |
|------|------------|--------------------------------------|
| Previsibilidade / estabilidade | `committedCount`, `scopeAddedDuringSprint` (count), spillover count | `storyPointsCommitted`, `storyPointsAddedDuringSprint`, `storyPointsSpillover`, taxas de commitment/scope/spillover, `plannedCompletionRate` |
| Fluxo profundo | médias lead/cycle | medianas, P85, aging, `timeInStatus`, review/QA/blocked, `flowEfficiency`, WIP |
| Qualidade | — | reopen, FPY, bug rate, escaped/hotfix (quando dados existirem) |
| Por assignee | pts + issues | campos adicionais alinhados ao doc |
| Executivo | texto `buildExecutiveSummary` | `stabilityIndex`, `deliveryMixByType`, tendências numéricas |

**Dados Jira atuais** (`JiraIssueSnapshot`): changelog de status, `workStartedAt`, flags. Métricas que dependem de mapeamento de colunas (review/QA/blocked) e WIP exigirão **loops posteriores** de cálculo e possivelmente enriquecimento de extração.

## Implementação

- `src/modules/metrics/types.ts`: tipos auxiliares `TimeInStatusEntry`, `DeliveryMixByTypeRow`; extensão de `AssigneeMetrics` e `SprintMetricsDocument` com campos opcionais; constante `SPRINT_METRICS_CORE_KEYS`.
- `src/modules/metrics/sprint-metrics-contract.test.ts`: verificação de chaves do núcleo e atribuição de tipos.

## O que **não** entrou neste loop

- Cálculo real das novas métricas.
- Persistência de novos campos preenchidos.
- APIs e UI/D3.

## Testes

- `npm run build` — sucesso.
- `npm run test` — sucesso (14 ficheiros, 39 testes).

## Browser

- Servidor dev: `npm run dev`.
- Verificação HTTP: `GET /` e `GET /dashboard` → 200 (smoke; sem regressão de rota).

## Checklist Ralph (Loop 1)

- [x] Escopo do loop implementado
- [x] Build passando
- [x] Testes automatizados passando
- [x] Browser: smoke HTTP 200 em rotas principais
- [x] Ledger atualizado
- [x] Loop pronto para encerramento

## Próxima ação

- **Loop 2** (new-metrics): evolução de documentos persistidos / retrocompat explícita se necessário, ou iniciar **Loop 3** (cálculo de previsibilidade) conforme plano em `docs/new-metrics.md`.
