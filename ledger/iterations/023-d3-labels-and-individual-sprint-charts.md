# Iteração 023 — D3: rótulos legíveis e gráficos individuais (pessoas)

## Objetivo

- Garantir que **gráficos D3** desenhem com o contentor correctamente medido (evitar `width: 0`) e que **eixos e legendas** sejam visíveis no tema claro/escuro.
- Clarificar no UI quando os **gráficos Atual vs Anterior** (sprint) não aparecem (modo consolidado ou sem linha de comparação no servidor).
- Cumprir Ralph: ledger, validações, teste de browser (`.cursor/rules/browser-testing-after-changes.mdc`).

## Escopo executado

- `useChartBox`: medição com `**useLayoutEffect`** (antes: `useEffect`, primeiro frame com `w: 0`).
- `chart-skin.ts`: `currentColor` / grelha; wrappers `text-slate-600 dark:text-slate-300` nos gráficos.
- Gráficos D3: eixos em grupos (`.axis--x` / `.axis--y`); `overflow-visible` no SVG; medição de **getBoundingClientRect** no efeito de desenho; margens (esq./baixo) para rótulos; rótulo X com rotação onde faz falta.
- `PessoasClient`: grelha com `min-w-0`, gráfico comparativo mais alto, rótulos mais curtos nas chaves, props `xLabelRotate` / `yGutter` / `xAxisHeight` coerentes; mensagens para **modo consolidado** (como desbloquear comparação) e para **sprint sem linha** de comparação.
- Grelha: opacidade ligeiramente maior (`CHART_GRID`).

## Validações

- `npm run test`, `npm run lint`, `npm run build` — sucesso.
- Browser (MCP): após `next dev`, `/dashboard/pessoas` e `/dashboard` carregam; sem overlay de erro.

## Próxima ação

- Opcional: afinar `D3ColumnChart` (rubricar rotação do eixo X consoante o comprimento dos rótulos).