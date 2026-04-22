# Iteração 020 — Dev individual: sprint atual vs anterior

## Objetivo

- Na seleção individual de desenvolvedor, exibir gráficos comparando **sprint atual vs sprint anterior**.

## Escopo executado

- Backend (`src/modules/metrics/individual-analysis.ts`):
  - novo bloco `sprintComparison` no resultado da análise quando o modo é `sprint`;
  - busca da sprint anterior pela ordenação de `syncedAt`;
  - composição por desenvolvedor com métricas atual/anterior:
    - points, issues, lead, cycle, spillover, escopo adicionado.
- Frontend (`src/app/dashboard/pessoas/PessoasClient.tsx`):
  - nova seção visual “Sprint atual vs sprint anterior” dentro da visão individual;
  - dois gráficos por dev selecionado:
    - **Produtividade** (points/issues);
    - **Fluxo e tempo** (lead/cycle/spillover/escopo+).
- Testes:
  - `src/modules/metrics/individual-analysis.test.ts` com caso de comparação atual/anterior.

## Decisões tomadas

- A comparação é exibida apenas quando o recorte está em modo sprint (não consolidado).
- Ausência de dados na sprint anterior vira `0` ou `null` conforme o tipo de métrica.

## Status

- Concluída.

## Validações executadas

- `npm run test`
- `npm run lint`
- `npm run build`
- Teste Browser em `/dashboard/pessoas` com `sprintId=104`.

## Resultado do build

- Aprovado.

## Resultado dos testes

- Aprovado.

## Próxima ação

- Opcional: destacar variação percentual (delta) entre atual vs anterior por métrica.
