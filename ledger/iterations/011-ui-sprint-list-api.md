# Iteração 011 — UI (guia Sauvvi) + lista paginada de sprints

## Objetivo

- Aplicar **STYLE_GUIDE.md** (tipografia, cor Sauvvi, cards, botões, mesh, tema claro/escuro).
- Substituir busca manual por **lista de sprints** com **filtros no backend** (`days`, `sprintId` parcial) e **paginação** (`GET /api/sprints`).
- Manter padrão Ralph: incremento verificável, testes e build.

## Escopo executado

- `@theme` em `globals.css` (sauvvi, surface, secondary, fontes); `mesh-page-bg`.
- `next/font`: Plus Jakarta Sans + Space Grotesk; `ThemeInit` + `ThemeToggle` (`localStorage.sauvvi-theme`).
- `GET /api/sprints` com `parseSprintListQuery` + `listSprintsPaginated` (Mongo `$facet`).
- Dashboard: RSC + `DashboardClient` com tabela, filtros, paginação, ação “Ver métricas”.
- Visão consolidada: mesmos filtros/paginação + série para gráficos.
- Testes: `sprint-list-query.test.ts` (match + parse).

## Validações

- `npm run test` — sucesso.
- `npm run lint` — sucesso.
- `npm run build` — sucesso.

## Próxima ação

- Logo `/public/sauvvi-logo.png` quando disponível; testes de integração da rota `/api/sprints`.
