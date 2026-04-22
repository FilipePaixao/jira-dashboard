# Iteração 015 — Página dedicada /dashboard/pessoas

## Objetivo

- Entregar sessão dedicada de análise individual em rota própria (`/dashboard/pessoas`), mantendo leitura gerencial simples e responsiva.

## Escopo executado

- Página nova `src/app/dashboard/pessoas/page.tsx`.
- Cliente novo `src/app/dashboard/pessoas/PessoasClient.tsx` com:
  - filtros `sprintId` e `days`;
  - resumo de totais e amostras;
  - tabela por pessoa (ordenada por story points);
  - categorias topo por pessoa;
  - linha `unassigned` quando aplicável.
- Navegação atualizada:
  - `src/components/Header.tsx` (link “Análise individual”);
  - `src/app/page.tsx` (atalho para a nova página).

## Decisões tomadas

- Página dedicada para reduzir ruído no dashboard principal.
- Prioridade de uso: sprint específica quando `sprintId` for preenchido; caso contrário, consolidado por `days`.
- Disclaimer gerencial fixo na tela para evitar leitura punitiva.

## Pendências

- Opcional: persistir filtros na URL e adicionar export CSV por pessoa.

## Riscos

- Se a base tiver muitos snapshots no consolidado, pode exigir paginação/caching na API.

## Status

- Concluída.

## Validações executadas

- `npm run test`
- `npm run lint`
- `npm run build`
- Teste funcional no Browser em `/` e `/dashboard/pessoas`.

## Resultado do build

- Aprovado.

## Resultado dos testes

- Aprovado.

## Próxima ação

- Opcional: drill-down por pessoa com lista de issues entregues.
