# Iteração 025 — Gráficos individuais (sprint) e query string

## Problema

- A página `/dashboard/pessoas` carregava **sempre** análise consolidada (30 dias) no servidor, sem `sprintComparison` — os gráficos **Atual vs Anterior** só existiam após “Aplicar análise”, e um **refresh** perdia o filtro.
- Possível falha de correspondência assinante ↔ linha de comparação por espaços em branco.

## Solução

- **Server `page.tsx`**: lê `searchParams` (`sprintId`, `days`); se `sprintId` presente, chama `getIndividualAnalysis({ sprintId })` e passa `sprintComparison` no `initialData`; se a sprint não existir, mensagem e fallback consolidado 30 dias.
- **`PessoasClient`**: props `initialSprintId`, `initialDays`, `loadNote`; estado inicial alinhado; após fetch com sucesso, `router.replace` para `?sprintId=` ou `?days=`.
- **`normName`**: comparação `assignee` com `trim()` entre `byAssignee`, `sprintComparison.rows` e selecção.
- **`D3GroupedBarChart`**: `key` no `ComparisonChart` para re-montar ao mudar a pessoa/métricas.
- Texto de apoio no cartão de filtros sobre URL e Aplicar análise.

## Validações

- `npm run test` — sucesso.
- `npm run lint` — sucesso.
- `npm run build` — sucesso.
- Browser (MCP): com `next dev` activo, abrir `http://localhost:3000/dashboard/pessoas?sprintId=…` (ID existente) e confirmar o bloco “Sprint atual vs sprint anterior” e gráficos; `?days=7` no consolidado.
