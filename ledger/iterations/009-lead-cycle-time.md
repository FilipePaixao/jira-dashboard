# Iteração 009 — Correção lead time / cycle time

## Problema

`leadTimeDaysAvg` e `cycleTimeDaysAvg` usavam a mesma janela (criação → resolução), logo o cycle time não refletia o fluxo de trabalho.

## Decisão

- **Lead time (média):** dias entre `createdAt` e `resolutiondate` em issues **entregues** com resolução.
- **Cycle time (média):** dias entre a **primeira mudança de `status` no changelog** e a resolução. Exige `expand=changelog` na listagem Agile e parsing em `extractWorkStartedAtFromChangelog`.
- Métricas passam a expor `leadTimeSampleCount` e `cycleTimeSampleCount` para transparência na UI.

## Validações

- `npm run test`, `npm run build`, `npm run lint` — sucesso.
- Após `POST /api/sync/sprint`, `GET /api/dashboard/sprint/:id` mostra lead ≠ cycle quando há histórico de status antes da resolução.

## Próxima ação

Refinar parsing se o time usar workflow onde a primeira mudança de status não representa “início de trabalho” (ex.: automações).
