# Iteração 005 — Modelagem e repositórios

## Objetivo

Formalizar o documento `SprintSnapshotDocument` e o repositório da collection `sprint_snapshots`, integrados ao fluxo de sync.

## Escopo executado

- `src/modules/sprints/models.ts` com referência a `JiraIssueSnapshot`.
- `saveSprintSnapshot` / `getSprintSnapshotBySprintId` em `repository.ts` (upsert por `sprintId`).
- `syncSprintSnapshot` grava `sync_runs` e o snapshot (issues vazias, `extractionStatus: pending`).
- API aceita `sprintName` opcional.
- Testes do repositório e ajuste dos testes de sync (mock de `replaceOne`).

## Validações

- `npm run build`, `npm run test`, `npm run lint` — sucesso.

## Próxima ação

Incremento 06: motor de métricas e collection `sprint_metrics`.
