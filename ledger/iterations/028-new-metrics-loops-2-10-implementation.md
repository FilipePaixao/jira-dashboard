# Iteração 028 — New-metrics: loops 2–10 (cálculo, API, D3, pessoas, hardening)

Seguindo `docs/new-metrics.md`, após o **Loop 1** (027). Esta iteração agrega os restantes loops com uma única entrega coerente, com gates verificados.

## Loops cobertos (resumo)

| Loop | Conteúdo |
|------|-----------|
| **2** | `coerceSprintMetricsFromStorage` + leitura no repositório; teste de normalização `byAssignee`. |
| **3** | Previsibilidade: SP committed/added/spill, taxas, `plannedCompletionRate`, `stabilityIndex`. |
| **4** | Medianas, P85, aging de issues abertas. |
| **5** | `changelogStatus` preenchido no map Jira; segmentos de coluna; `timeInStatus`, review/QA/blocked, `flowEfficiency` (heurística de nomes), WIP médio/pico. |
| **6** | `buildAssigneeMap`: medians, WIP, reopens, planned/unplanned por pessoa. |
| **7** | `reopenCount`/`reopenRate`, `firstPassYield`, `bugRate`, `hotfixRate`, `escapedDefects` (labels), `deliveryMixByType`. |
| **8** | `findPreviousSnapshotOnSameBoard`, `enrichMetricsWithTrends` na rota GET dashboard sprint; resumo executivo alargado. |
| **9** | `SprintAdvancedCharts` (D3): escopo em pts, lead/cycle profundidade, tempo em coluna, mix por tipo. |
| **10** | Cartões extra no `DashboardClient` e em `/dashboard/pessoas`; testes novos; lint; browser HTTP 200. |

## Ficheiros principais

- Jira: `extract-changelog-status.ts`, `map-jira-issue-to-snapshot.ts`
- Métricas: `calculate-sprint-metrics.ts`, `build-status-dwell-segments.ts`, `build-assignee-map.ts`, `stat-helpers.ts`, `normalize-sprint-metrics.ts`, `enrich-metrics-trends.ts`, `repository.ts`
- Sprints: `repository.ts` (`findPreviousSnapshotOnSameBoard`)
- API: `app/api/dashboard/sprint/[sprintId]/route.ts`
- UI: `DashboardClient.tsx`, `SprintAdvancedCharts.tsx`, `SprintVisualizations.tsx`, `PessoasClient.tsx`
- Resumo: `executive-summary.ts`
- Testes: `extract-changelog-status.test.ts`, `stat-helpers.test.ts`, `normalize-sprint-metrics.test.ts`, ajuste `map-jira-issue-to-snapshot.test.ts`

## Decisões e limitações

- **Heurísticas** de nomes de coluna (review, QA, bloqueado, WIP) — ajustáveis por workflow.
- **Tendências** (`velocityTrend`, etc.): só quando existe snapshot com `boardId` e sprint anterior no mesmo board.
- **Changelog** vazio em snapshots antigos: métricas de tempo em coluna e WIP podem ser planas.
- **Métricas por pessoa**: contexto de diagnóstico; texto de aviso mantido no disclaimer.

## Validações (Ralph)

- [x] `npm run build`
- [x] `npm run test` (17 ficheiros, 42 testes)
- [x] `npm run lint`
- [x] Browser smoke: `GET /`, `/dashboard`, `/dashboard/pessoas` → 200

## Próxima ação

- Opcional: mapeamento de colunas por projeto (UI ou env) para refinar review/QA/blocked e flow efficiency.
- Opcional: testes E2E com Mongo em memória para `findPreviousSnapshotOnSameBoard`.
