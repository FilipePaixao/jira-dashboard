# Guia Completo do Dashboard Jira

Este documento explica, de forma didática e detalhada:

- como executar o repositório;
- como a arquitetura funciona;
- como o fluxo Jira -> backend -> MongoDB -> dashboard foi desenhado;
- como interpretar **cada métrica** e **cada gráfico**;
- quais são os cuidados para uso gerencial (sem uso punitivo de métricas individuais).

---

## 1) Visão geral do sistema

O projeto é um monólito modular em Next.js (App Router), com backend e frontend no mesmo repositório:

- **Frontend**: páginas React/Next para dashboard, consolidado, análise individual, login e cadastro.
- **Backend (rotas internas)**: APIs em `src/app/api/**` para sync, leitura de métricas, autenticação e autorização.
- **Persistência**: MongoDB como fonte de verdade para leitura do dashboard.
- **Integração externa**: Jira via API (somente backend acessa Jira).

Princípio central: o frontend **não** consulta Jira diretamente; ele consome apenas `/api/*` internos.

---

## 2) Como executar o projeto

## 2.1 Pré-requisitos

- Node.js 20+ (recomendado)
- npm
- MongoDB acessível
- Credenciais Jira (URL, e-mail e API token)

## 2.2 Variáveis de ambiente

Crie/edite `.env.local` com:

```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=dash_jira

JIRA_BASE_URL=https://seu-dominio.atlassian.net
JIRA_EMAIL=seu-email@empresa.com
JIRA_API_TOKEN=seu_token

AUTH_SECRET=um_segredo_forte
NEXTAUTH_URL=http://localhost:3000
```

Observações:

- `MONGODB_DB` tem default `dash_jira` se omitido.
- Sem `NEXTAUTH_URL` em produção local, callbacks de autenticação podem redirecionar errado.

## 2.3 Instalação e execução

```bash
npm install
npm run dev
```

Aplicação local: `http://localhost:3000`

## 2.4 Build e validação (Ralph Loop)

Como prática obrigatória de fechamento de loop:

```bash
npm run lint
npm run test
npm run build
```

Também existe:

```bash
npm run validate:jira
```

para validação de paridade entre dados extraídos e snapshot interno.

---

## 3) Estrutura funcional do repositório

Principais áreas:

- `src/app/`:
  - páginas (`/dashboard`, `/dashboard/consolidado`, `/dashboard/pessoas`, `/login`, `/cadastro`, `/acesso-negado`)
  - rotas API (`src/app/api/**`)
- `src/modules/jira-sync/`:
  - cliente Jira, extração, normalização de issues/changelog, paridade
- `src/modules/metrics/`:
  - cálculo de métricas, tendências, análises individuais
- `src/modules/sprints/`:
  - sincronização e consultas de sprints
- `src/modules/auth/`:
  - autenticação por credencial, roles, guardas, token admin de autorização para cadastro
- `src/components/dashboard/`:
  - cards, gráficos, guia de métricas, modal explicativo
- `src/infra/mongodb/`:
  - conexão e env do MongoDB

---

## 4) Fluxo de dados ponta a ponta

## 4.1 Sincronização

1. Usuário seleciona sprint no dashboard.
2. Front chama `POST /api/sync/sprint`.
3. Backend consulta Jira (issues + changelog).
4. Backend calcula métricas (lead, cycle, throughput, WIP, estabilidade, etc.).
5. Backend persiste snapshot + métricas no MongoDB.
6. Front recarrega detalhes e gráficos via API interna.

## 4.2 Leitura do dashboard

- Lista e filtros: `GET /api/sprints`
- Série de velocidade: `GET /api/metrics/velocity-series`
- Detalhe de sprint: `GET /api/dashboard/sprint/[sprintId]`
- Visão consolidada: `GET /api/overview/sprints`
- Análise individual (admin): `GET /api/dashboard/pessoas`

## 4.3 Auth e autorização

- Login: NextAuth Credentials (e-mail/senha)
- Roles: `admin` e `user`
- Cadastro: requer token de autorização de 6 caracteres gerado por admin
- Token de cadastro é de uso único (inativado após consumo)
- Usuário não-admin não acessa `/dashboard/pessoas` nem API equivalente

---

## 5) Prints reais do sistema (Browser)

As imagens abaixo foram capturadas no dashboard em execução local, usando Browser MCP.

## 5.1 Visão geral e filtros

![Visão geral do dashboard](./images/01-dashboard-visao-geral.png)

![Série de velocidade e tabela de sprints](./images/02-indicadores-metricas.png)

## 5.2 Cards de indicadores

![Cards de indicadores](./images/04-cards-kpi-e-graficos.png)

## 5.3 Gráficos principais e avançados

![Início da visão gráfica](./images/05-graficos-principais.png)

![Comparativos e gráficos avançados](./images/06-graficos-avancados.png)

![Escopo + Lead/Cycle com média, mediana e P85](./images/07-tempo-coluna-e-mix.png)

![Tempo por coluna e mix por tipo](./images/08-tempo-por-coluna.png)

---

## 6) Métricas: definição, cálculo e interpretação

## 6.1 Métricas base de entrega

- **Story points entregues**  
  Soma de pontos das issues entregues na sprint.  
  Uso: capacidade em esforço entregue (não é volume de itens).

- **Issues entregues / Throughput**  
  Quantidade de itens concluídos no período.  
  Uso: vazão de entrega; interpretar junto com lead/cycle.

- **Velocidade (pts)**  
  Média histórica de pontos concluídos por sprint.  
  Uso: previsão de capacidade futura (não ranking entre times).

- **Committed / Entregues / Spillover / Escopo adicionado**  
  Mostram disciplina de planejamento e estabilidade de sprint.

## 6.2 Métricas de tempo e previsibilidade

- **Lead time**  
  Tempo da criação até resolução da issue entregue.

- **Cycle time**  
  Tempo da primeira entrada em trabalho (changelog) até resolução.

- **Mediana e P85 (Lead/Cycle)**  
  - Mediana: comportamento típico (menos sensível a outlier).
  - P85: limite onde 85% dos casos terminam; evidencia “cauda” de atraso.

- **Aging de abertas**  
  Idade média de itens ainda abertos; sinaliza risco de acúmulo.

## 6.3 Métricas de fluxo

- **WIP médio**: número médio de itens simultaneamente em progresso.
- **Pico de WIP**: maior simultaneidade observada.
- **WIP P85**: patamar alto recorrente de WIP (não apenas extremo pontual).
- **Eficiência de fluxo**: tempo ativo / tempo total no fluxo.
- **Tempo em review / por coluna**: onde o tempo está concentrado.

## 6.4 Métricas de qualidade

- **First Pass Yield (FPY)**  
  Percentual de itens sem reabertura/retrabalho no primeiro fluxo.

- **Reopen rate**  
  Percentual de entregas que reabriram; sugere fragilidade de resolução.

- **Bug rate / Hotfix rate (quando disponível)**  
  Pressão de correção versus evolução; estabilidade operacional.

## 6.5 Tendências

- **Velocity trend / Throughput trend / Predictability trend**  
  Variações contra sprint anterior para leitura de direção (melhora/piora).

---

## 7) Gráficos: como ler cada um

- **Velocidade ao longo do tempo (linha)**  
  Tendência de capacidade de entrega por sprint.

- **Pontos por pessoa / Issues por pessoa (barras horizontais)**  
  Distribuição de esforço e volume por responsável.  
  Importante: usar para diagnóstico de fluxo, nunca punição individual.

- **Distribuição de pontos (donut)**  
  Concentração da entrega no time (risco de sobrecarga em poucos nomes).

- **Comparativo de fluxo (colunas)**  
  `Committed x Entregues x Spillover x Escopo+` na mesma visão.

- **Tempo médio Lead x Cycle**  
  Gap alto sugere fila antes do início de execução.

- **Escopo (story points)**  
  Planejado vs adicionado vs spill em pontos.

- **Lead & Cycle com média/mediana/P85**  
  Mostra estabilidade e variabilidade do fluxo.

- **Tempo médio por coluna (workflow)**  
  Gargalos por estado do processo (baseado em changelog, não no desenho visual do board).

- **Mix de entregas por tipo**  
  Equilíbrio entre feature, bug, melhoria técnica, etc.

---

## 8) Fundamentos externos usados nas interpretações

As explicações acima são alinhadas às referências abaixo:

- Atlassian - Control Chart (lead/cycle):  
  <https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-control-chart>
- Atlassian - Velocity Chart:  
  <https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-velocity-chart/>
- Atlassian - 4 métricas Kanban (lead, cycle, WIP, throughput):  
  <https://www.atlassian.com/agile/project-management/kanban-metrics>
- Atlassian - WIP limits:  
  <https://www.atlassian.com/en/agile/kanban/wip-limits>
- Atlassian Analytics - flow metrics e flow efficiency:  
  <https://support.atlassian.com/analytics/docs/flow-metrics-jira-issue-types-view-dashboard-template>
- Little's Law (relação WIP, throughput, cycle):  
  <https://en.wikipedia.org/wiki/Little%27s_law>
- NIST - definição estatística de percentil:  
  <https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm>
- DORA - Change Failure Rate (analogia para estabilidade/hotfix):  
  <https://incident.io/hubs/dora/dora-metrics-change-failure-rate>

Observação: parte das métricas do sistema é customizada para o contexto de sprint/Jira da empresa; as referências externas servem como base conceitual para interpretação.

---

## 9) Boas práticas de uso gerencial

- Não comparar desenvolvedores por um único número.
- Ler métricas em conjunto (ex.: WIP + cycle + throughput).
- Usar tendências ao longo do tempo, não snapshots isolados.
- Tratar outliers de P85 como investigação de gargalo, não culpabilização.
- Combinar métricas de fluxo com contexto de negócio (incidentes, prioridades, mudanças urgentes).

---

## 10) Checklist rápido de operação

- [ ] `.env.local` preenchido (Mongo/Jira/Auth)
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] abrir `http://localhost:3000/dashboard`
- [ ] sincronizar sprint via botão "Sincronizar agora"
- [ ] abrir "Ver métricas" da sprint
- [ ] validar cards, gráficos e explicações (`?` / `Saiba mais`)

