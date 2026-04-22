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

## Pendências atuais

- Ajustar parsing de “início de trabalho” se o workflow Jira usar automações que distorcem a 1.ª mudança de status.

## Riscos

- Dependência de credenciais Jira e URI MongoDB em ambientes locais/CI.
