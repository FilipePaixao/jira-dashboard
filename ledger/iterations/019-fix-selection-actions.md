# Iteração 019 — Correção dos botões de seleção

## Objetivo

- Corrigir comportamento dos botões **Selecionar todos** e **Limpar seleção** na comparação de devs.

## Escopo executado

- Ajuste em `src/app/dashboard/pessoas/PessoasClient.tsx`:
  - removido fallback automático que repopulava seleção quando ficava vazia;
  - agora `Limpar seleção` mantém estado vazio corretamente;
  - `Selecionar todos` passa a preencher todos os nomes de forma consistente.

## Decisões tomadas

- Manter fallback automático apenas para seleção de foco individual, não para comparação.

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

- Opcional: exibir contador de selecionados na UI.
