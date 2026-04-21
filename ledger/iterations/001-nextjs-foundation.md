# Iteração 001 — Fundação Next.js

## Objetivo

Substituir o bootstrap Vite por Next.js (App Router), estabelecer estrutura modular mínima e uma rota de health verificável com testes.

## Escopo executado

- Next.js 15 + TypeScript, Tailwind v4 via `@tailwindcss/postcss`.
- Pastas: `modules/{jira-sync,sprints,metrics,dashboard}`, `infra/mongodb`.
- `GET /api/health` delegando a `src/shared/health.ts`.
- Vitest com um teste unitário do payload de health.
- ESLint com `eslint-config-next`.

## Decisões

- Monólito com código de app em `src/app` e alias `@/*` → `src/*`.
- Métricas e integrações futuras em `modules/` na raiz do repositório.

## Validações

- `npm run build` — sucesso.
- `npm run test` — sucesso.
- `npm run lint` — sucesso (sem erros).

## Próxima ação

Incremento 02: cliente MongoDB, `MONGODB_URI`, helper `getMongoClient` / `getDb`.
