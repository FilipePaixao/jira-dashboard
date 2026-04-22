# Iteração 017 — Foco individual + comparação seletiva

## Objetivo

- Melhorar a usabilidade da análise de desenvolvedores, priorizando:
  1. clique no nome para ver visão individual completa;
  2. visão geral comparativa separada com modo “todos” ou “selecionados”.

## Escopo executado

- Refatoração de `src/app/dashboard/pessoas/PessoasClient.tsx`:
  - bloco **Visão individual (clique no nome)** com lista de nomes clicável;
  - painel de detalhes do dev selecionado (pontos, issues, pts/issue, lead, cycle, spillover, escopo+ e categorias);
  - bloco separado **Visão geral comparativa**;
  - alternância entre “Comparar todos” e “Comparar selecionados”;
  - checklist para montar subconjunto de devs na comparação.
- Remoção do componente de gráficos anterior que dificultava leitura:
  - `src/components/dashboard/IndividualDeveloperVisualizations.tsx` (removido).

## Decisões tomadas

- Trocar densidade de gráficos por leitura orientada a decisão (nome -> detalhe imediato).
- Manter comparação em tabela para facilitar análise lado a lado com filtros explícitos.

## Pendências

- Opcional: adicionar pequenos sparklines por linha da tabela para tendência temporal.

## Riscos

- Com muitos devs, a lista de seleção pode crescer; mitigado por área scrollável.

## Status

- Concluída.

## Validações executadas

- `npm run test`
- `npm run lint`
- `npm run build`
- Teste funcional no Browser em `/dashboard/pessoas`.

## Resultado do build

- Aprovado.

## Resultado dos testes

- Aprovado.

## Próxima ação

- Opcional: exportar comparação filtrada (selecionados) em CSV.
