# Iteração 008 — Dashboard UI

## Objetivo

Página gerencial simples e responsiva que consulta apenas a API interna, com aviso sobre uso de métricas individuais.

## Escopo executado

- `src/app/dashboard/page.tsx` (client) com busca por sprintId e cartões de indicadores.
- Links no `Header` e na home para `/dashboard`.

## Validações

- `npm run build`, `npm run test`, `npm run lint` — sucesso.

## Próxima ação

Evoluir extração Jira real, preenchimento de `issues` no snapshot e refinamento de métricas conforme dados de produção.
