# Iteração 021 — Migração Jira search/jql + paridade de números

## Objetivo

- Corrigir falha de sincronização Jira (HTTP 410) e restabelecer paridade entre Jira e dashboard local.

## Escopo executado

- Ajuste em `src/modules/jira-sync/load-sprint-from-jira.ts`:
  - troca do endpoint antigo `/rest/api/3/search` para `/rest/api/3/search/jql`.
- Revalidação do fluxo completo:
  - sincronização `POST /api/sync/sprint` para sprint `104`;
  - comparação direta Jira vs API local da análise individual.

## Decisões tomadas

- Manter semântica atual de cálculo (`delivered` e story points) e corrigir apenas integração quebrada da API Jira.

## Status

- Concluída.

## Validações executadas

- `npm run test`
- `npm run lint`
- `npm run build`
- Verificação de paridade:
  - Jira (Filipe, sprint 104): `4 issues`, `12 pts`;
  - Sistema local (API `/api/dashboard/pessoas?sprintId=104`): `4 issues`, `12 pts`.

## Resultado do build

- Aprovado.

## Resultado dos testes

- Aprovado.

## Próxima ação

- Opcional: adicionar teste de integração da rota de sync cobrindo endpoint `/search/jql`.
