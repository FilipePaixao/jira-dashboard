# Iteração 014 — Backend da análise individual

## Objetivo

- Criar base de backend para análise individual por desenvolvedor, com recorte por sprint específica ou consolidado (últimos N dias), incluindo `unassigned`.

## Escopo executado

- Módulo novo `src/modules/metrics/individual-analysis.ts`:
  - agregação por pessoa com ordenação por story points entregues;
  - suporte a pontos de subtasks (`storyPoints + subtaskStoryPoints`);
  - lead/cycle time por pessoa com amostras (`n`);
  - contagens de spillover e escopo adicionado;
  - top categorias por pessoa (tipo de issue).
- API nova `GET /api/dashboard/pessoas` em `src/app/api/dashboard/pessoas/route.ts`.
- Teste unitário em `src/modules/metrics/individual-analysis.test.ts`.

## Decisões tomadas

- Filtro `sprintId` tem prioridade sobre `days` (quando presente, usa apenas a sprint).
- Consolidado padrão usa `days=30` quando não informado.
- Inclusão explícita de `unassigned` no resultado.

## Pendências

- Expandir para drill-down de issues por pessoa (opcional, próximo loop).

## Riscos

- Dependência da qualidade de `assignee` e `changelog` no snapshot para leitura de tempos por pessoa.

## Status

- Concluída.

## Validações executadas

- `npm run test`
- `npm run lint`
- `npm run build`

## Resultado do build

- Aprovado.

## Resultado dos testes

- Aprovado.

## Próxima ação

- Entregar página dedicada `/dashboard/pessoas` consumindo a nova API.
