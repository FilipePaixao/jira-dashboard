# Ledger do projeto — dash-jira

| Data       | Etapa | Status   | Próxima ação                          |
| ---------- | ----- | -------- | ------------------------------------- |
| 2026-04-21 | 01    | Concluída | Incremento 02 — infra MongoDB        |
| 2026-04-21 | 02    | Concluída | Incremento 03 — cliente Jira         |
| 2026-04-21 | 03    | Concluída | Incremento 04 — rota de sync         |
| 2026-04-21 | 04    | Concluída | Incremento 05 — modelagem MongoDB    |
| 2026-04-21 | 05    | Concluída | Incremento 06 — métricas            |
| 2026-04-21 | 06    | Concluída | Incremento 07 — API dashboard      |
| 2026-04-21 | 07–08 | Concluída | Evolução: extração Jira completa   |
| 2026-04-21 | 09    | Concluída | Refinos de métricas de tempo       |
| 2026-04-22 | 010   | Concluída | Evoluções opcionais (filtros/export) |
| 2026-04-22 | 011   | Concluída | Logo Sauvvi / testes integração API sprints |
| 2026-04-22 | 012   | Concluída | Drill-down issues / export metadados        |
| 2026-04-22 | 013   | Concluída | Transparência UI sobre pontos com subtasks  |
| 2026-04-22 | 014   | Concluída | Backend da análise individual por pessoa     |
| 2026-04-22 | 015   | Concluída | Página dedicada /dashboard/pessoas (UI)      |
| 2026-04-22 | 016   | Concluída | Visual analytics comparativo por dev          |
| 2026-04-22 | 017   | Concluída | Foco individual + comparação seletiva         |
| 2026-04-22 | 018   | Concluída | Busca por dev + selecionar todos/limpar       |
| 2026-04-22 | 019   | Concluída | Fix: selecionar todos / limpar seleção        |
| 2026-04-22 | 020   | Concluída | Dev individual: sprint atual vs anterior      |
| 2026-04-22 | 021   | Concluída | Migração Jira search/jql + paridade de dados  |
| 2026-04-22 | 022   | Concluída | Gráficos com D3.js (substitui Recharts)         |
| 2026-04-22 | 023   | Concluída | D3: rótulos visíveis + gráficos individuais     |
| 2026-04-22 | 024   | Concluída | D3 H-bar: nomes na coluna (sem clip) + trunc 28 |
| 2026-04-22 | 025   | Concluída | Pessoas: URL ?sprintId + gráficos individuais |
| 2026-04-22 | 026   | Concluída | Pessoas: gráficos D3 por desenvolvedor selecionado |
| 2026-04-22 | 027   | Concluída | New-metrics Loop 1: tipos + contrato; ver `iterations/027-new-metrics-loop-01-gap-and-types.md` |
| 2026-04-22 | 028   | Concluída | New-metrics loops 2–10: cálculo, API, D3, pessoas; ver `iterations/028-new-metrics-loops-2-10-implementation.md` |
| 2026-04-28 | 029   | Aberta (bloqueada) | Modernização UI + tema; aguardar estabilização de auth para fechar (`iterations/029-ui-modernization-theme.md`) |

## Pendências atuais

- Opcional: mapear colunas Jira por projeto para afinar review/QA/blocked e `flowEfficiency` (hoje com heurísticas de nome).
- Ajustar parsing de “início de trabalho” se o workflow Jira usar automações que distorcem a 1.ª mudança de status.
- Opcional: filtros por board na visão consolidada, export CSV.

## Riscos

- Dependência de credenciais Jira e URI MongoDB em ambientes locais/CI.
