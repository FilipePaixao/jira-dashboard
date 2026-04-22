# Iteração 022 — Gráficos com D3.js

## Objetivo

- Usar a biblioteca **D3** (d3) para os gráficos do dashboard, em substituição de **Recharts**, mantendo o mesmo recorte de dados e UX aproximada (linhas, barras, donut, comparação agrupada).
- Completar o loop Ralph: ficheiros documentados, validações, teste de browser (regra `browser-testing-after-changes.mdc`).

## Escopo executado

- Dependência `d3` e `@types/d3` em `package.json`; **remoção** de `recharts` (e dependências transativas).
- Novos módulos em `src/components/charts/d3/`:
  - `useChartBox` — `ResizeObserver` + dimensão para SVG responsivo
  - `d3-line-chart` — tendência (velocidade, consolidado)
  - `d3-horizontal-bars` — barras horizontais (pontos / issues por pessoa na sprint)
  - `d3-column-chart` — colunas (fluxo, tempo médio)
  - `d3-grouped-bar-chart` — séries agrupadas (consolidado; sprint atual vs anterior em `/dashboard/pessoas`)
  - `d3-donut-chart` — distribuição de story points
- Ficheiros de dashboard actualizados: `VelocitySeriesChart.tsx`, `SprintVisualizations.tsx`, `ConsolidatedVisualizations.tsx`, `PessoasClient.tsx` (comparação sprint).

## Decisões

- SVG + `useLayoutEffect` para desenho imperativo, alinhado à utilização idiomática do D3 com React 19.
- Controlo de responsividade com medidas reais do contentor (evita `ResponsiveContainer` do ecossistema Recharts).

## Validações

- `npm run test` — sucesso.
- `npm run lint` — sucesso.
- `npm run build` — sucesso.
- **Browser (MCP)**: com `next dev` em `http://localhost:3001/` (porta 3000 ocupada noutro processo; equivalente a `http://localhost:3000/`), `GET /`, `/dashboard`, `/dashboard/consolidado`, `/dashboard/pessoas` carregam sem overlay de erro; visão consolidada apresenta secções "Tendência" e "Comparativo".

## Nota operacional

- Se aparecer `Cannot find module './…js'` ou ficheiro em falta em `.next/`, fazer `rm -rf .next` e reiniciar `npm run dev` (já prática recomendada na regra de browser do projecto).

## Próxima ação

- Opcional: afinar legendas do eixo X (rótulo longo) em ecrãs estreitos; reutilizar a mesma paleta/legenda noutros incrementos de analytics.
