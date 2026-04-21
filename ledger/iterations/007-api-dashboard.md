# Iteração 007 — API do dashboard

## Objetivo

Expor leitura consolidada de snapshot e métricas por `sprintId` para consumo exclusivo do frontend.

## Escopo executado

- `GET /api/dashboard/sprint/[sprintId]` retorna `snapshot`, `metrics` e texto de disclaimer gerencial.
- 404 quando não há dados no MongoDB para o id informado.

## Validações

- `npm run build`, `npm run test`, `npm run lint` — sucesso.

## Próxima ação

Incremento 08: interface do dashboard consumindo a rota.
