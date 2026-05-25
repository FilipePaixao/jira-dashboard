# Guia do Dashboard Jira — como ler e usar a interface

Este guia é pensado para **quem usa o painel no dia a dia**: gestão de produto, engenharia, Scrum Masters e qualquer pessoa que precise **entender o que cada número e cada gráfico está a dizer**, sem precisar de ser programador.

No final há um **apêndice breve** só para quem precisa de instalar ou desenvolver o sistema localmente.

---

## O que é este dashboard, em uma frase

É uma **vitrine única** dos dados da vossa sprint que já foram sincronizados a partir do Jira: quanto foi entregue, em quanto tempo, com que estabilidade de plano e onde o trabalho “demora mais”. Os dados vêm do histórico das issues no Jira; **atualizar** é escolher a sprint e carregar em **Sincronizar agora**.

---

## Como navegar no painel (fluxo típico)

1. Entras em **Dashboard**.
2. Vês a lista **Sprints no repositório** — são as sprints que já foram sincronizadas pelo menos uma vez.
3. Podes **filtrar** por período ou por ID de sprint e clicar em **Aplicar filtros**.
4. Na zona **Velocidade ao longo do tempo** vês a linha de tendência dos pontos entregues (serve para comparar sprints ao longo do tempo).
5. Na tabela, escolhes uma linha e clicas **Ver métricas** para abrir o **detalhe dessa sprint**.
6. No detalhe aparecem: **resumo em texto**, **cards com números**, separadores **Painel** / **Guia de métricas**, e mais abaixo os **gráficos**.
7. Em cada número ou gráfico podes usar **?** ou **Saiba mais** para abrir uma explicação no ecrã.

---

## Glossário — palavras que aparecem no ecrã


| Termo no dashboard               | O que significa em linguagem simples                                                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story points (pts)**           | Estimativa de esforço relativo do trabalho (não são horas). Serve para comparar “peso” das issues entre si.                                              |
| **Issue**                        | Um cartão de trabalho no Jira (história, tarefa, bug, etc.).                                                                                             |
| **Velocidade**                   | Quantos pontos o time **efetivamente entregou** na sprint (ou média ao longo de várias sprints). Ajuda a planear “quanto cabe” na próxima iteração.      |
| **Throughput**                   | Quantas issues foram **concluídas** no período. É “quantidade de itens”, não pontos.                                                                     |
| **Committed**                    | Issues que estavam no compromisso inicial da sprint (planeadas desde o início).                                                                          |
| **Entregues**                    | Issues que ficaram **feitas** dentro da sprint.                                                                                                          |
| **Spillover**                    | Issues que **não terminaram** e passaram para outra sprint (ou ficaram por fechar).                                                                      |
| **Escopo adicionado / Escopo +** | Issues **entradas ou acrescentadas depois** do arranque da sprint — mudanças de plano a meio do período.                                                 |
| **Lead time**                    | Tempo total desde o pedido existir (issue criada) até estar **resolvida**. Inclui esperas na fila e antes de alguém pegar no trabalho.                   |
| **Cycle time**                   | Tempo desde o trabalho **começar de facto** (primeira mudança relevante de estado no histórico) até à **resolução**. Mede o fluxo de execução.           |
| **Média**                        | Valor “típico” se somarmos tudo e dividirmos; pode ser puxado para cima por poucos casos muito lentos.                                                   |
| **Mediana**                      | Valor do meio: metade das issues demora menos, metade demora mais. Costuma ser mais estável que a média.                                                 |
| **P85**                          | “Percentil 85”: num conjunto de tempos, **85% das issues** terminaram até esse valor; os 15% mais lentos ficam acima. Ajuda a ver a **cauda** do atraso. |
| **WIP (Work In Progress)**       | Quantas issues estão **em progresso ao mesmo tempo**. Muitas em paralelo tendem a aumentar o tempo de cada uma.                                          |
| **WIP P85**                      | Um patamar alto de simultaneidade que se repete — não é só um pico isolado.                                                                              |
| **Eficiência de fluxo**          | Parte do tempo em que o item **está realmente a avançar** frente ao tempo total nas etapas (esperas contam contra).                                      |
| **First pass yield**             | Percentagem de entregas que **não voltaram atrás** no fluxo depois de marcadas como feitas (menos reaberturas = mais “certo à primeira”).                |
| **Bug rate**                     | Parte das entregas que são bugs (por tipo de issue), para ver pressão corretiva vs novidades.                                                            |
| **Changelog / histórico**        | Registo de mudanças de estado da issue no Jira; é usado para tempos de ciclo e tempo por coluna.                                                         |


---

## Tour pela interface — cada imagem explicada

Abaixo segue **uma explicação por captura de ecrã**: o que estás a ver, como ler, e os termos que importam.

---

### Imagem 1 — Vista inicial do dashboard

Visão geral do dashboard

**O que é esta zona**

É o **topo da página**: título, texto introdutório, bloco **Sincronizar do Jira** e o início dos filtros da lista de sprints.

**Para que serve**

- **Sincronizar do Jira**: puxa dados frescos da sprint que está **selecionada na tabela** (mais abaixo na mesma página). O campo **Nome (opcional)** só altera o nome mostrado localmente, não muda o ID da sprint no Jira.
- Logo abaixo (na sequência da página) estão os **filtros** para não precisares de ver todas as sprints de uma vez — por exemplo só as últimas 30 dias ou só IDs que contenham certos números.

**Como usar sem erro**

1. Primeiro escolhe uma sprint na **tabela** (clica **Ver métricas** ou seleciona a linha).
2. Depois, se quiseres dados novos do Jira, usa **Sincronizar agora**.

**Termos que podes ver aqui**

- **ID Agile / Sprint ID**: identificador numérico da sprint no Jira — é o que liga o botão de sincronização à sprint certa.

---

### Imagem 2 — Velocidade ao longo do tempo e tabela de sprints

Série de velocidade e tabela de sprints

**O que é esta zona**

- **Velocidade ao longo do tempo**: gráfico de **linha** com story points entregues por sprint, na ordem em que as sprints foram sincronizadas no sistema.
- **Tabela**: cada linha é uma sprint guardada no repositório, com nome, ID, data da última sincronização, pontos e botão **Ver métricas**.

**Como ler o gráfico de linha**

- O eixo vertical são **pontos entregues**; o horizontal são **sprints** (rótulos curtos dos nomes).
- **Subida ou descida** da linha sugere mais ou menos capacidade entregue entre períodos — mas **sempre** combina com contexto: equipa diferente, feriados, bugs urgentes ou mudança de escopo podem explicar picos.

**O botão “Saiba mais”** ao lado do título do gráfico abre texto sobre o que é tendência de velocidade e o que **não** deve ser inferido de um único ponto.

**Termos**

- **Sincronizado**: momento em que os dados foram guardados neste dashboard — não é necessariamente o fim da sprint no calendário.

---

### Imagem 3 — Resumo executivo e metadados das entregues

Resumo e dados das entregues

**O que é esta zona**

Quando abres uma sprint com **Ver métricas**, aparece primeiro um **texto de resumo** (caixa verde, quando existe) e uma área **Dados das entregues** com tabelas por categorias, labels, componentes e épicos.

**Como ler**

- O **resumo executivo** junta num parágrafo: quantas issues foram entregues, compromisso vs entrega, spillover, escopo novo, tempos médios e alguns índices de qualidade. É a leitura “para alguém com 30 segundos”.
- **Categorias / Labels / Componentes / Épicos**: mostram **onde foi parar o esforço** em pontos e em número de issues. Uma mesma issue pode contar em mais do que uma linha se tiver várias etiquetas — por isso os números são por dimensão, não um único total duplicável linha a linha.

**Termos**

- **Issues no snapshot**: quantas issues entraram no “recorte” analisado dessa sincronização.

---

### Imagem 4 — Separador Painel e primeiros cards de indicadores

Cards de KPI no separador Painel

**O que é esta zona**

É o separador **Painel** dentro de **Indicadores**, com **cards** (caixas) numéricos: story points, issues, velocidade, throughput, tempos médios, committed, entregues, spillover e escopo adicionado.

**Como usar**

- Cada card tem um **?** que abre uma janela com explicação específica daquele número.
- Os primeiros cards respondem a “**quanto entregámos**?” e “**em quanto tempo em média**?” (lead e cycle).
- Os seguintes respondem a “**o plano manteve-se**?” (committed vs entregues), “**o que ficou para trás**?” (spillover) e “**entrou trabalho a meio da sprint**?” (escopo adicionado).

**Lead vs Cycle (lembrete rápido)**

- **Lead alto** com **cycle mais baixo**: muito tempo à espera antes de começar — filas, priorização, dependências.
- **Ambos altos**: gargalo durante a execução (revisões, testes, bloqueios).

---

### Imagem 5 — Mais cards e início dos gráficos (pontos por pessoa)

Cartões avançados e gráfico pontos por pessoa

**O que é esta zona**

Continuação dos cards (métricas avançadas como taxa de conclusão planeada, estabilidade, first pass yield, WIP, tendências, etc.) e o arranque da secção **Visão gráfica**, tipicamente com **Pontos por pessoa**.

**Como ler “Pontos por pessoa”**

- Barras horizontais: cada barra é uma pessoa e o comprimento são **story points** das entregas atribuídas a essa pessoa na sprint.
- **Uso saudável**: perceber distribuição de carga e se há concentração excessiva em poucas pessoas.
- **Uso a evitar**: ranking tipo “quem é melhor” — story points não medem valor individual nem produtividade isolada.

**Termos nos cards**

- **Taxa de conclusão planeada**: dos pontos que tinham sido planeados, que parte efetivamente entregue.
- **Índice de estabilidade**: número sintético (0 a 1); valores mais altos costumam indicar sprint menos “abalada” por spillover e mudanças de escopo (sempre no contexto da vossa fórmula).
- **Tempo em review**: média de dias em revisão nas issues que passaram por essa etapa.
- **Aging médio issues abertas**: há quanto tempo em média as issues ainda abertas existem — alerta de acúmulo.

---

### Imagem 6 — Donut, comparativo de fluxo e Lead × Cycle

Donut, comparativo de fluxo e tempos

**O que é cada gráfico**

1. **Distribuição de pontos (donut)**
  Partes do círculo = percentagem dos **pontos entregues** por pessoa. O centro costuma reforçar que é sobre pontos, não sobre número de issues.
2. **Comparativo de fluxo (colunas)**
  Quatro barras: **Committed**, **Entregues**, **Spillover**, **Escopo +**. Ajuda a conversa de retrospectiva: “prometemos X, entregámos Y, quanto ficou para a próxima sprint e quanto entrou a meio?”  
   O próprio painel avisa que estas contagens **podem sobrepor-se em conceito** — ou seja, são leituras gerenciais, não um puzzle matemático onde todas as peças somam um único total óbvio sem definição.
3. **Tempo médio (dias) — Lead × Cycle**
  Duas barras lado a lado com médias em dias. Se a barra de **Lead** for muito maior que **Cycle**, grande parte do atraso está **antes** do trabalho “andar” (fila, priorização).

---

### Imagem 7 — Escopo em pontos e Lead & Cycle com μ, mediana e P85

Escopo, lead/cycle detalhado

**Gráfico “Escopo (story points)”**

- Três barras: **Planejado**, **Escopo +**, **Spill** (spillover em pontos).
- Texto no cartão explica a lógica: planejado sem flag de “adicionada na sprint”; escopo + e spill conforme **flags** do modelo de dados.

**Gráfico “Lead & cycle (dias)”**

- Até seis barras: para **Lead** e **Cycle**, aparecem **μ** (média), **med** (mediana) e **P85**.
- **Interpretação prática**:
  - Se **média** e **mediana** estão próximas, o tempo é relativamente uniforme.
  - Se **média** está muito acima da **mediana**, há **outliers** — poucas issues muito lentas a puxar a média para cima.
  - Se **P85** é muito alto, uma fatia relevante do trabalho demora **bem mais** que o “normal” — vale investigar essas issues.

**Termos**

- **μ** é apenas símbolo de **média** (costuma ler-se “mu”).

---

### Imagem 8 — Tempo por “coluna” e mix por tipo de issue

Tempo por estado e mix por tipo

**“Tempo médio por coluna (dias)”**

- Barras horizontais por **estado do fluxo de trabalho** (ex.: Backlog, Em progresso, Code review), calculado a partir do **histórico de mudanças de estado** no Jira.
- **Importante**: não é o mesmo que “colunas do quadro Kanban desenhadas à mão”. Estados podem existir no workflow e nem sempre aparecem como coluna visual — o gráfico segue **estados e tempo registados no histórico**.
- O texto também explica que pode somar tempo **no histórico completo** da issue até resolução ou sincronização, não só “dentro desta sprint”, conforme a definição implementada no produto.

**“Mix de entregas por tipo”**

- Donut com proporção de **story points** por **tipo de issue** (História, Tarefa, Bug, …).
- Ajuda a ver equilíbrio entre **novas funcionalidades**, **correções** e **melhorias técnicas**.

---

## Outros elementos úteis no mesmo ecrã

- **Separador “Guia de métricas”**: texto estático que lista métricas e gráficos **mesmo sem** sprint carregada; quando há sprint, complementa o Painel.
- **Explain modal (? / Saiba mais)**: explicações longas numa janela centrada — útil para partilhar ecrã em revisões.

---

## Boas práticas — ler números com juízo

- Comparar **várias sprints**, não julgar uma sprint isolada sem contexto.
- Cruzar **entrega** (pontos/issues) com **tempo** (lead/cycle) e **estabilidade** (escopo/spillover).
- Usar gráficos por pessoa para **distribuição e risco de sobrecarga**, não para ranking de performance individual.

---

## Checklist — só para usar o dashboard no dia a dia

- Escolher sprint na lista e abrir **Ver métricas**
- Ler o **resumo executivo** (se existir)
- Percorrer os **cards** com ajuda do **?**
- Descer aos **gráficos** e usar **Saiba mais** onde houver dúvida
- Se os dados estiverem desatualizados, **Sincronizar agora** com a sprint certa selecionada

---

## Apêndice A — Instalação e ambiente (equipa técnica)

### Pré-requisitos

Node.js 20+, npm, MongoDB acessível, credenciais Jira (URL, e-mail e API token).

### Variáveis em `.env.local`

```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=dash_jira

JIRA_BASE_URL=https://seu-dominio.atlassian.net
JIRA_EMAIL=seu-email@empresa.com
JIRA_API_TOKEN=seu_token

AUTH_SECRET=um_segredo_forte
NEXTAUTH_URL=http://localhost:3000
```

### Comandos

```bash
npm install
npm run dev
```

App local: `http://localhost:3000`

Validação típica de projeto: `npm run lint`, `npm run test`, `npm run build`. Opcional: `npm run validate:jira` para checks de paridade com dados Jira.

### Fluxo técnico resumido

Sincronização manual escolhe sprint → backend lê Jira → calcula métricas → grava em MongoDB → o dashboard lê só pela API interna.

---

## Apêndice B — Referências para aprofundar conceitos

- Atlassian — Control Chart (lead/cycle): [https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-control-chart](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-control-chart)  
- Atlassian — Velocity Chart: [https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-velocity-chart/](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-velocity-chart/)  
- Atlassian — métricas Kanban (lead, cycle, WIP, throughput): [https://www.atlassian.com/agile/project-management/kanban-metrics](https://www.atlassian.com/agile/project-management/kanban-metrics)  
- Atlassian — limites de WIP: [https://www.atlassian.com/en/agile/kanban/wip-limits](https://www.atlassian.com/en/agile/kanban/wip-limits)

Estas ligações ajudam a rever **definições** industriais; os números no vosso dashboard seguem as regras implementadas na aplicação e podem diferir em detalhe das ferramentas nativas do Jira.