# Novas Métricas de Sprint no padrão Ralph Loop

Quero que você atue como **arquiteto de software, engenheiro full stack sênior e executor disciplinado**, seguindo rigorosamente o padrão **Ralph Loop** para evoluir a aplicação existente de métricas de sprint.

## Contexto

Já existe uma aplicação construída com a seguinte stack:

- **Next.js**

- **TypeScript**

- **MongoDB**

- **React.js**

- **Backend nas rotas do próprio Next.js**

- Dashboard web já existente

- Métricas atuais já implementadas para sprint, assignee, série histórica e resumo executivo

A aplicação já possui métricas como:

- velocityStoryPoints

- velocityIssues

- storyPointsDelivered

- issuesDelivered

- leadTimeDaysAvg

- cycleTimeDaysAvg

- leadTimeSampleCount

- cycleTimeSampleCount

- throughput

- committedCount

- deliveredCount

- spilloverCount

- scopeAddedDuringSprint

- byAssignee

- topIssueTypes

- topLabels

- topComponents

- topEpics

- comparação entre sprint atual e anterior por pessoa

- categorias por pessoa

## Objetivo

Quero evoluir o sistema para implementar **novas métricas que ainda não existem**, com foco gerencial, previsibilidade, estabilidade de sprint, fluxo, qualidade e leitura executiva.

A implementação deve seguir o padrão **Ralph Loop**, com loops pequenos, incrementais, verificáveis e com progresso persistido em ledger.

---

# Métricas novas a serem implementadas

Implemente, no mínimo, as seguintes métricas novas:

## 1. Previsibilidade e estabilidade da sprint

- `storyPointsCommitted`

- `storyPointsAddedDuringSprint`

- `storyPointsSpillover`

- `commitmentReliabilityIssues`

- `commitmentReliabilityStoryPoints`

- `scopeChangeRateIssues`

- `scopeChangeRateStoryPoints`

- `spilloverRateIssues`

- `spilloverRateStoryPoints`

- `plannedCompletionRate`

## 2. Métricas de fluxo mais profundas

- `leadTimeDaysMedian`

- `cycleTimeDaysMedian`

- `leadTimeDaysP85`

- `cycleTimeDaysP85`

- `agingDaysAvgOpenIssues`

- `agingDaysP85OpenIssues`

- `timeInStatus`

- `reviewTimeDaysAvg`

- `qaTimeDaysAvg`

- `blockedTimeDaysAvg`

- `flowEfficiency`

- `wipAverage`

- `wipPeak`

## 3. Métricas de qualidade

- `reopenCount`

- `reopenRate`

- `firstPassYield`

- `bugRate`

- `escapedDefects` (quando os dados disponíveis permitirem)

- `hotfixRate` (quando os dados disponíveis permitirem)

## 4. Métricas por assignee

Adicionar, por pessoa:

- `storyPointsCommitted`

- `storyPointsSpillover`

- `wipAverage`

- `wipPeak`

- `leadTimeDaysMedian`

- `cycleTimeDaysMedian`

- `reopenCount`

- `reopenRate`

- `plannedDeliveredCount`

- `unplannedDeliveredCount`

## 5. Métricas executivas derivadas

- `stabilityIndex`

- `deliveryMixByType`

- `velocityTrend`

- `throughputTrend`

- `predictabilityTrend`

---

# Regras obrigatórias de implementação

## 1. Manter a mesma stack

Não alterar a stack base do projeto. Toda a evolução deve respeitar:

- Next.js

- TypeScript

- MongoDB

- React.js

- Backend interno no Next.js

## 2. Manter a separação por camadas

A implementação deve respeitar a separação já existente entre:

- módulos de métricas

- domínio

- cálculo

- persistência

- rotas

- dashboard

- componentes de visualização

## 3. Implementar visualização com D3.js

Os novos gráficos devem ser implementados com **D3.js**.

Quero gráficos claros, modernos, objetivos e voltados à leitura gerencial.

Os gráficos devem priorizar:

- legibilidade

- clareza

- comparação entre sprints

- destaque de tendência

- baixa poluição visual

## 4. Não quebrar métricas existentes

Toda evolução deve preservar o comportamento das métricas já existentes, salvo quando uma refatoração for explicitamente necessária e segura.

---

# Exigência central do Ralph Loop

Quero que todo o trabalho seja executado no padrão **Ralph Loop**, com loops pequenos e critério de aceite rigoroso.

Cada loop deve:

- ter escopo pequeno e verificável

- produzir uma entrega funcional

- atualizar o ledger do projeto

- passar em build

- passar em testes

- passar em validação no browser

---

# Critério inegociável de aceite por loop

## Regra central

**Nenhum loop pode ser considerado concluído se build, testes e validação no browser não estiverem passando.**

Isso é obrigatório para **cada loop** e também para **cada etapa interna do loop**.

## Gates obrigatórios por loop

Cada loop só pode ser encerrado quando houver evidência de que:

- o código compila corretamente

- o build do projeto está passando

- os testes automatizados estão passando

- a funcionalidade foi validada no browser

- não houve regressão relevante nas telas existentes

- o ledger foi atualizado

## Validação obrigatória no browser

A validação não deve ser apenas técnica no backend.

Quero que em cada loop haja também validação no browser, incluindo:

- carregamento da página

- renderização correta do gráfico ou componente alterado

- ausência de erro de runtime no frontend

- comportamento visual coerente

- dados corretos sendo exibidos

Se houver mudança em gráfico, card, tabela, resumo ou drill-down, isso deve ser conferido no browser antes de fechar o loop.

---

# Ledger obrigatório

Quero que o projeto mantenha um ledger versionado no repositório, por exemplo:

- `ledger/project-ledger.md`

- `ledger/iterations/001-...md`

- `ledger/iterations/002-...md`

Cada loop deve atualizar o ledger com:

- nome do loop

- objetivo

- escopo executado

- arquivos alterados

- decisões tomadas

- riscos

- pendências

- validações executadas

- resultado do build

- resultado dos testes

- resultado da validação no browser

- status final do loop

- próxima ação

## Regra de fechamento

Se build, testes ou browser falharem, o loop deve permanecer **aberto** no ledger.

---

# O que eu quero que você produza

Quero que você crie um plano completo e incremental para implementar essas novas métricas, contendo:

1. análise das métricas atuais versus métricas faltantes

2. proposta de evolução de schema/types

3. plano de evolução dos cálculos de métricas

4. plano de evolução dos snapshots persistidos

5. plano de evolução das APIs

6. plano de evolução das telas

7. plano de evolução dos gráficos com D3.js

8. plano de testes

9. plano de validação no browser

10. plano de loops no padrão Ralph Loop

11. estrutura obrigatória do ledger

12. critérios de aceite por loop

---

# Requisitos específicos de implementação

## 1. Backend / domínio / métricas

Quero que você:

- identifique onde cada nova métrica deve viver

- proponha alterações em `types.ts`

- proponha alterações em `calculate-sprint-metrics.ts`

- proponha novos calculators quando fizer sentido

- proponha mudanças em persistência MongoDB

- proponha mudanças em agregações por assignee

- proponha ajustes na API para disponibilizar os novos dados

## 2. Frontend / dashboard

Quero que você:

- proponha quais métricas entram em card, tabela, tooltip e gráfico

- organize a leitura executiva por prioridade

- evite excesso de elementos visuais

- defina gráficos com D3.js apropriados para cada métrica

### Exemplos esperados de gráficos com D3.js

- linha para tendência de velocity e throughput

- barras para committed vs delivered

- barras empilhadas para delivery mix

- box/percentile style visualization para lead/cycle com mediana e P85

- heatmap ou distribuição temporal para time in status, se fizer sentido

- comparação por assignee com muito cuidado interpretativo

---

# Regras de qualidade gerencial

O plano deve deixar explícito que:

- métricas por pessoa não devem ser tratadas como ranking simplista

- story points por pessoa não devem ser usados como produtividade absoluta

- a leitura deve favorecer previsibilidade, fluxo, estabilidade e gargalos

- o dashboard deve servir à gestão, não à punição

- comparações individuais devem ser contextualizadas

---

# Estratégia de loops

Quero que você decomponha o trabalho em loops pequenos e objetivos.

Cada loop deve conter:

- objetivo

- escopo

- arquivos esperados de alteração

- implementação prevista

- testes a criar ou ajustar

- validação de browser obrigatória

- critérios de aceite

- atualização de ledger obrigatória

- riscos do loop

- definição explícita do que não entra nesse loop

---

# Estrutura sugerida dos loops

Quero que a decomposição siga algo próximo disso, refinando quando necessário:

## Loop 1 — Gap analysis e contrato das novas métricas

- mapear métricas atuais

- definir métricas novas

- atualizar types

- atualizar contratos internos

- criar casos de teste de contrato

## Loop 2 — Persistência e snapshots

- evoluir documentos persistidos

- ajustar schema/modelos

- garantir retrocompatibilidade

## Loop 3 — Cálculo de previsibilidade e estabilidade

- committed em pontos

- spillover em pontos

- taxas de commitment e scope change

- planned completion rate

## Loop 4 — Mediana, P85 e aging

- median lead/cycle

- P85 lead/cycle

- aging de issues abertas

## Loop 5 — Time in status, blocked/review/QA e flow efficiency

- mapear status

- calcular tempos por estágio

- calcular flow efficiency

## Loop 6 — WIP e métricas por assignee

- wip médio

- wip pico

- campos adicionais por pessoa

## Loop 7 — Reopen, first pass yield e qualidade

- reopen count/rate

- first pass yield

- bug rate

- hotfix/escaped defects se houver suporte

## Loop 8 — APIs e resumo executivo

- expor novos campos

- ajustar summary builders

- atualizar payloads do dashboard

## Loop 9 — Gráficos D3.js

- implementar visualizações novas

- refatorar componentes visuais quando necessário

- garantir responsividade

## Loop 10 — Hardening final

- testes adicionais

- validação cruzada

- revisão visual

- revisão de regressão

- fechamento do ledger

---

# Build, testes e browser: checklist obrigatório em todos os loops

Em cada loop, inclua explicitamente um bloco como este:

```txt

[ ] Escopo do loop implementado

[ ] Build passando

[ ] Testes automatizados passando

[ ] Browser validado manualmente

[ ] Sem erro de runtime no frontend

[ ] Sem regressão relevante nas telas existentes

[ ] Ledger atualizado

[ ] Loop pronto para encerramento