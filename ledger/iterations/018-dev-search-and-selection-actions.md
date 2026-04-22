# Iteração 018 — Busca por dev + ações de seleção

## Objetivo

- Melhorar a usabilidade da página `/dashboard/pessoas` com:
  - busca por nome de desenvolvedor na lista;
  - ações rápidas de comparação: “Selecionar todos” e “Limpar seleção”.

## Escopo executado

- `src/app/dashboard/pessoas/PessoasClient.tsx`:
  - campo de busca `Buscar desenvolvedor` para filtrar a lista clicável de nomes;
  - estado vazio quando não há correspondência de busca;
  - no modo “Comparar selecionados”, botões:
    - **Selecionar todos**
    - **Limpar seleção**

## Decisões tomadas

- A busca filtra apenas a lista da visão individual (não altera o dataset base).
- Ações de seleção atuam sobre o conjunto total de devs do recorte atual.

## Pendências

- Opcional: adicionar indicador visual de “N selecionados” no cabeçalho da comparação.

## Riscos

- Em recortes muito grandes, lista filtrada pode exigir paginação local futura.

## Status

- Concluída.

## Validações executadas

- `npm run test`
- `npm run lint`
- `npm run build`
- Teste no Browser em `/dashboard/pessoas`.

## Resultado do build

- Aprovado.

## Resultado dos testes

- Aprovado.

## Próxima ação

- Opcional: “Selecionar visíveis” para combinar com o filtro de busca.
