# Iteração 029 — Modernização de UI, tema e motion (sem conflito com auth/roles)

## Objetivo

Modernizar a interface para maior legibilidade e percepção de qualidade, alinhando os componentes ao `STYLE_GUIDE.md` (tokens, tipografia, radius, sombras, transições suaves) e reforçando suporte a tema claro/escuro.

## Escopo executado

- Atualização de tokens globais de UI em `src/app/globals.css`:
  - cores de `background/surface/text` para light/dark
  - easing de marca `cubic-bezier(0.22, 1, 0.36, 1)`
  - utilitários de transição (`app-theme-transition`)
  - animações suaves (`fade-up`, `pop-in`, `theme-veil`)
- Ajustes de composição visual em `src/components/Layout.tsx`:
  - aplicação de transição de tema no shell da app
  - ampliação do container principal (`max-w-6xl`) para melhor respiro
- Refino visual e de motion na área de dashboard:
  - `src/app/dashboard/DashboardClient.tsx`
  - `src/components/dashboard/SprintVisualizations.tsx`
- Refino visual e de motion na análise por pessoa:
  - `src/app/dashboard/pessoas/PessoasClient.tsx`
  - `src/components/dashboard/IndividualAssigneeCharts.tsx`
- Ajuste de usabilidade do toggle de tema em `src/components/ThemeToggle.tsx`.

## Decisões tomadas

- Escopo isolado apenas em frontend e estilo para não conflitar com o outro agente que atua em autenticação/roles.
- Reuso de classes utilitárias (`app-theme-transition` e `animate-*`) para reduzir divergência visual entre páginas.
- Manutenção da semântica e fluxos existentes; mudanças focadas em apresentação e microinteração.

## Pendências

- Revalidar smoke browser completo quando o fluxo de auth/roles estiver estável.
- Reexecutar `npm run build` quando a integração de auth estiver concluída (erro atual é externo a este loop).

## Riscos

- Risco de regressão visual baixo (mudanças majoritariamente em classes CSS e utilitários).
- Dependência temporária do branch/estado de auth para validação fim a fim do dashboard.

## Status

Aberto (bloqueado por integração de auth em paralelo).

## Validações executadas

- [x] `npm run lint`
- [x] `npm run test` (21 arquivos / 52 testes)
- [ ] `npm run build` (bloqueado por erro em `/api/auth/[...nextauth]`)
- [ ] Browser smoke completo em `/` e `/dashboard` (bloqueado por erro runtime em `auth()`)

## Evidências de bloqueio

- Build: `Failed to collect page data for /api/auth/[...nextauth]`.
- Browser: runtime error `(0, _auth__WEBPACK_IMPORTED_MODULE_4__.auth) is not a function` em `src/components/Header.tsx`.

## Próxima ação

Após o outro agente estabilizar auth/roles:

1. executar `npm run build`
2. executar smoke browser em `/`, `/dashboard` e `/dashboard/pessoas`
3. se tudo verde, fechar iteração e marcar no ledger principal como concluída
