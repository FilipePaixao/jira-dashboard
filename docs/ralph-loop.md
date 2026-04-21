# Prompt de Implementação — Padrão Ralph Loop

Quero que você atue como **arquiteto de software, engenheiro de produto sênior e executor disciplinado**, seguindo rigorosamente o padrão **Ralph Loop** para planejar e implementar um sistema interno de engenharia.

---

## Objetivo do sistema

Desejo criar um sistema **monolítico modular** utilizando:

- **Next.js**
- **TypeScript**
- **MongoDB**
- **React.js no frontend**
- **Rotas de backend no próprio Next.js**

O sistema terá como objetivo:

1. Permitir a **extração manual dos dados do Jira ao final de cada sprint**
2. Processar e transformar esses dados no backend
3. Atualizar collections no MongoDB por meio de uma **rota manual de update**
4. Exibir um **dashboard gerencial simples, claro, objetivo, responsivo e com UX muito simples**
5. Utilizar o MongoDB como fonte de verdade para leitura do dashboard
6. Garantir evolução incremental, rastreável e segura seguindo o padrão **Ralph Loop**

---

## Contexto funcional

A aplicação deve funcionar da seguinte forma:

- Ao final de cada sprint, eu chamarei manualmente uma rota HTTP de sincronização
- Essa rota deverá buscar os dados da sprint no Jira
- O backend será responsável por:
  - integração com Jira
  - transformação e normalização dos dados
  - cálculo de métricas gerenciais
  - persistência no MongoDB
  - exposição dos dados para o dashboard
- O frontend **não deve acessar o Jira diretamente**
- O frontend deve consumir **apenas as rotas internas do backend**
- **Não será necessário autenticação**

---

## Resultado esperado

Ao final, quero um sistema que permita visualizar com clareza o resumo gerencial do trabalho por sprint, incluindo indicadores como:

- velocidade por sprint
- velocidade por desenvolvedor
- quantidade de tasks entregues
- story points entregues
- lead time
- cycle time
- throughput
- planned vs done
- spillover
- escopo adicionado durante a sprint
- resumo executivo por sprint

O foco deve ser **gerencial**, com leitura simples, rápida e útil para tomada de decisão.

---

## Exigência principal de execução

Quero que o trabalho seja estruturado no padrão **Ralph Loop**, com:

- loops curtos
- progresso incremental
- entregas pequenas e verificáveis
- contexto persistido em arquivo
- decisões registradas em ledger
- retomada facilitada entre ciclos
- execução disciplinada por etapas

---

# Regras obrigatórias do Ralph Loop

## 1. Cada loop deve ter escopo pequeno e verificável
Cada loop deve atacar um objetivo específico, pequeno o suficiente para ser validado com clareza.

## 2. Cada loop deve registrar sua evolução em ledger
Deve existir um arquivo de ledger versionado no repositório, atualizado a cada loop, contendo:

- etapa atual
- objetivo do loop
- escopo executado
- decisões tomadas
- pendências
- riscos
- status atual
- próxima ação

## 3. Cada loop deve terminar com validação técnica explícita
**Regra obrigatória e inegociável: ao final de cada loop e ao final de cada etapa, o build e os testes devem passar.**

Isso deve ser tratado como critério formal de conclusão.

### Exigência obrigatória
Para **cada loop** e para **cada etapa interna do loop**, deve ser garantido que:

- o projeto continua compilando corretamente
- o build está passando
- os testes automatizados estão passando
- nenhuma entrega é considerada concluída com build quebrado
- nenhuma entrega é considerada concluída com testes falhando

### Regra de aceite
Um loop **não pode ser considerado concluído** se qualquer uma das condições abaixo ocorrer:

- build falhando
- testes falhando
- lint crítico quebrado, quando aplicável
- rota principal da etapa não funcionando
- regressão detectada

### Instrução explícita
Sempre que planejar ou executar um loop, deixe registrado de forma textual:

- quais validações devem ser executadas
- quais testes devem existir ou ser ajustados
- qual o comando de build
- qual o comando de testes
- que **somente com build e testes verdes o loop pode ser encerrado**

---

# O que eu quero que você produza

Quero um plano completo e rico em detalhes contendo:

1. **Visão arquitetural**
2. **Estrutura de pastas**
3. **Separação em camadas**
4. **Fluxo Jira → backend → MongoDB → dashboard**
5. **Modelagem das collections no MongoDB**
6. **Definição das rotas**
7. **Métricas que devem ser calculadas**
8. **Estrutura do dashboard**
9. **Plano incremental por loops**
10. **Estrutura obrigatória do ledger**
11. **Critérios de aceite por loop**
12. **Checklist de build e testes por loop**

---

# Diretrizes arquiteturais

## Arquitetura base
A solução deve ser um **monólito modular**, evitando acoplamento desnecessário entre:

- integração com Jira
- regras de negócio de sprint
- cálculo de métricas
- persistência
- rotas HTTP
- dashboard

## Stack
- Next.js
- TypeScript
- MongoDB
- React.js
- Route Handlers / backend interno no Next.js

## Separação esperada
Quero a arquitetura organizada em módulos e camadas, por exemplo:

- `app/` para páginas e rotas
- `modules/jira-sync`
- `modules/sprints`
- `modules/metrics`
- `modules/dashboard`
- `infra/mongodb`
- `shared`
- `ledger`

---

# Requisitos funcionais

## Rota manual de sincronização
Deve existir uma rota manual, por exemplo:

`POST /api/sync/sprint`

Essa rota deverá:

1. receber identificação da sprint
2. buscar dados no Jira
3. transformar os dados
4. calcular métricas
5. persistir snapshot da sprint
6. registrar a execução da sincronização
7. retornar resultado estruturado

## Dashboard
O dashboard deve consumir apenas o backend e apresentar uma visão:

- simples
- responsiva
- clara
- objetiva
- gerencial
- com poucos elementos e alta legibilidade

---

# Dados a serem extraídos do Jira

Estruture a extração para contemplar, no mínimo:

- boardId
- sprintId
- sprintName
- startDate
- endDate
- completeDate
- issueId
- issueKey
- summary
- issueType
- assignee
- reporter
- status atual
- createdAt
- updatedAt
- resolvedAt
- storyPoints
- changelog de status
- changelog de sprint
- changelog de assignee
- labels
- components
- epic
- flags para committed, delivered, addedDuringSprint e spillover

---

# Métricas obrigatórias

O sistema deve suportar cálculo e exposição de:

- velocidade por sprint
- velocidade por desenvolvedor
- tasks entregues por sprint
- story points entregues por sprint
- lead time
- cycle time
- throughput
- committed vs delivered
- spillover
- escopo adicionado durante a sprint
- visão consolidada da sprint
- visão gerencial por desenvolvedor com interpretação cuidadosa

---

# Boas práticas gerenciais obrigatórias

O plano deve deixar claro que:

- métricas individuais não devem ser usadas como ranking simplista
- velocidade por desenvolvedor deve ser usada apenas com contexto
- métricas devem apoiar diagnóstico, fluxo e previsibilidade
- o dashboard deve servir à gestão, não à punição
- o sistema deve favorecer clareza operacional e leitura executiva

---

# Exigência sobre build e testes em cada loop

Quero que isso fique **fortemente enfatizado** no plano:

## Regra central
**Cada loop só pode ser dado como concluído se o build e os testes estiverem passando.**

## Em cada etapa do loop
Para cada etapa interna, deve haver indicação de:

- implementação prevista
- impacto esperado
- validação necessária
- teste mínimo esperado
- evidência de que o build continua íntegro

## Ao final de cada loop
Deve haver um bloco explícito com:

- comandos de validação
- resultado esperado
- critério de aceite
- observação de bloqueio caso build ou testes falhem

Exemplo de checklist obrigatório por loop:

```txt
[ ] Código da etapa implementado
[ ] Build passando
[ ] Testes automatizados passando
[ ] Regressões principais verificadas
[ ] Ledger atualizado
[ ] Loop pronto para encerramento
```

Se o build ou os testes falharem, o loop deve permanecer **aberto** no ledger.

---

# Estrutura esperada para o ledger

Quero uma proposta de ledger com arquivos versionados, por exemplo:

- `ledger/project-ledger.md`
- `ledger/iterations/001-foundation.md`
- `ledger/iterations/002-jira-client.md`
- `ledger/iterations/003-sync-route.md`

Cada arquivo de iteração deve conter:

- nome da iteração
- objetivo
- escopo
- decisões tomadas
- pendências
- riscos
- status
- validações executadas
- resultado do build
- resultado dos testes
- próxima ação

## Regra do ledger
Nenhum loop pode ser fechado sem:

- ledger principal atualizado
- arquivo da iteração atualizado
- resultado do build registrado
- resultado dos testes registrado

---

# Formato de resposta esperado

Quero que sua resposta venha estruturada assim:

1. Visão arquitetural detalhada
2. Estrutura de pastas sugerida
3. Fluxo completo de sincronização
4. Modelagem MongoDB
5. Rotas do sistema
6. Métricas e regras de cálculo
7. Estrutura do dashboard
8. Plano incremental em loops
9. Ledger obrigatório
10. Critérios de aceite por loop
11. Checklist obrigatório de build e testes por loop
12. Riscos e boas práticas

---

# Orientação final de execução

Quero um plano **real**, **preenchido**, **incremental**, **disciplinado** e **rico em detalhes**, com foco em execução prática.

Não quero apenas sugestões genéricas.

Quero que o plano seja escrito de modo que uma implementação real possa ser conduzida diretamente a partir dele.

E reforço novamente a exigência principal:

## Exigência inegociável
**Para cada loop e para cada etapa, o build e os testes devem passar.**
**Se build ou testes falharem, a etapa não está concluída e o loop não pode ser encerrado.**

---

## Checklist de incrementos (execução)

Comandos de validação: `npm run build`, `npm run test`, `npm run lint`.

- [x] **01 — Fundação Next.js**: App Router, Tailwind (PostCSS), pastas `modules/*`, `infra/mongodb`, `shared`, `GET /api/health`, testes Vitest, build verde.
- [x] **02 — Infra MongoDB**: driver, helper de conexão, variáveis de ambiente, testes com mock ou memória.
- [x] **03 — Cliente Jira**: tipos de domínio, cliente HTTP configurável, sem chamadas reais nos testes unitários.
- [x] **04 — Rota de sync**: `POST /api/sync/sprint` com contrato inicial, persistência de snapshot e registro de execução.
- [ ] **05 — Modelagem e repositórios**: collections sprint/issues/métricas conforme plano.
- [ ] **06 — Métricas**: cálculos (velocidade, lead/cycle time, throughput, spillover, etc.).
- [ ] **07 — API do dashboard**: leitura consolidada a partir do MongoDB.
- [ ] **08 — Dashboard UI**: página gerencial responsiva consumindo apenas a API interna.