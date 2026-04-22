# Iteração 016 — Visual analytics por desenvolvedor

## Objetivo

- Enriquecer a análise individual com gráficos comparativos de produtividade, tempo e risco de fluxo para comparação entre devs com leitura gerencial.

## Escopo executado

- Novo componente `src/components/dashboard/IndividualDeveloperVisualizations.tsx` com:
  - **Produtividade comparativa**: pontos, issues e razão `pts/issue` por dev.
  - **Tempo de entrega por dev**: lead e cycle time médios (dias) com amostras no tooltip.
  - **Risco de fluxo**: spillover e escopo adicionado por dev.
- Integração na página `src/app/dashboard/pessoas/PessoasClient.tsx` em seção dedicada:
  - “Comparativos visuais por desenvolvedor”.
  - Texto de contexto diagnóstico (não punitivo).

## Decisões tomadas

- Limitar gráficos ao top 12 por story points para preservar legibilidade.
- Manter tabela detalhada existente como fonte completa, usando os gráficos como leitura comparativa rápida.

## Pendências

- Opcional: alternar ordenação dos gráficos (pts/issues/alfabética) e export de imagem/CSV.

## Riscos

- Em bases muito grandes, maior custo de render no cliente (Recharts); mitigado por recorte top 12.

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

- Opcional: drill-down por dev com timeline de issues e fases de workflow.
