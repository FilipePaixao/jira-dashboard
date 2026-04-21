# Iteração 002 — Infra MongoDB

## Objetivo

Conectar o monólito ao MongoDB via driver oficial, com variáveis de ambiente documentadas e testes que não exigem instância real.

## Escopo executado

- Pacote `mongodb` e helpers `getMongoClient` / `getMongoDb` em `src/infra/mongodb/client.ts`.
- Leitura de `MONGODB_URI` (obrigatória) e `MONGODB_DB` (default `dash_jira`) em `env.ts`.
- Testes Vitest para `env.ts` com `vi.stubEnv`.
- `.env.example` e regras de ignore para `.env*`.

## Validações

- `npm run build` — sucesso.
- `npm run test` — sucesso.
- `npm run lint` — sucesso.

## Próxima ação

Incremento 03: tipos de domínio e cliente Jira (fetch configurável, mocks nos testes).
