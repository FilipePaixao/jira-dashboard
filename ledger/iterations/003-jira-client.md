# Iteração 003 — Cliente Jira

## Objetivo

Introduzir tipos de snapshot de issue/sprint e um cliente HTTP Jira testável (fetch injetado), sem integração de negócio completa ainda.

## Escopo executado

- `src/modules/jira-sync/types.ts` com estrutura alinhada ao plano de extração.
- `JiraClient` + `createJiraAuthorizationHeader` em `jira-client.ts`.
- `getJiraClientConfigFromEnv()` com `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`.
- Testes para env e para o cliente com `fetch` mockado.
- `.env.example` atualizado.

## Validações

- `npm run build`, `npm run test`, `npm run lint` — sucesso.

## Próxima ação

Incremento 04: `POST /api/sync/sprint` persistindo execução e preparando snapshot.
