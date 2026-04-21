# Iteração 004 — Rota de sincronização

## Objetivo

Expor `POST /api/sync/sprint` e persistir cada execução em MongoDB, ainda em fase stub (sem busca Jira real).

## Escopo executado

- `syncSprintSnapshot` em `src/modules/sprints/sync-sprint.ts` — insere documento em `sync_runs`.
- Handler `src/app/api/sync/sprint/route.ts` com validação de JSON e `sprintId`.
- Testes unitários do serviço com `getMongoDb` mockado.

## Validações

- `npm run build`, `npm run test`, `npm run lint` — sucesso.

## Próxima ação

Incremento 05: documentos de snapshot de sprint/issues e repositórios de leitura/escrita.
