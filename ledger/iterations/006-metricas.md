# Iteração 006 — Métricas

## Objetivo

Calcular indicadores gerenciais a partir de um snapshot de sprint e persistir em `sprint_metrics`, integrados ao fluxo de sync.

## Escopo executado

- `calculateSprintMetrics` com agregações por flags, médias de lead/cycle (proxy created→resolved) e `byAssignee`.
- `saveSprintMetrics` / `getSprintMetricsBySprintId`.
- Sync grava métricas após o snapshot (issues vazias → indicadores zerados).
- Testes unitários com issues sintéticas.

## Validações

- `npm run build`, `npm run test`, `npm run lint` — sucesso.

## Próxima ação

Incremento 07: rota GET agregando snapshot + métricas para o frontend.
