# Iteração 012 — Série de velocidade + metadados no dashboard

## Objetivo

- **Velocidade histórica** no dashboard (série temporal de story points entregues por sprint sincronizada), alinhada aos filtros da lista.
- **Expor dados extraídos** (labels, componentes, épicos) agregados nas entregues da sprint selecionada.

## Escopo executado

- `summarizeDeliveredMetadata` em `snapshot-metadata-summary.ts` + testes.
- `listVelocitySeries` + `GET /api/metrics/velocity-series` (filtros `days`, `syncedAfter`/`syncedBefore`, `sprintId`, `max`).
- `GET /api/dashboard/sprint/[sprintId]` devolve `metadataSummary` e snapshot público sem array `issues` (inclui `issueCount`).
- `DashboardClient`: gráfico de série + painel de metadados; página RSC carrega série inicial.
- `toSprintListFilters` em `sprint-list-query.ts`.

## Validações

- `npm run test` — sucesso.
- `npm run lint` — sucesso.
- `npm run build` — sucesso.

## Próxima ação

- Drill-down por issue (tabela paginada) ou export CSV dos metadados.
