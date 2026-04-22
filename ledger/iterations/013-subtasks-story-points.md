# Iteração 013 — Story points de subtasks nas métricas

## Objetivo

- Incluir story points de **subtasks** nos cálculos gerenciais (velocidade, pontos entregues por pessoa e agregações de metadados), sem dupla contagem quando a subtask já existe no recorte da sprint.

## Escopo executado

- `loadSprintFromJira` passa a:
  - solicitar `subtasks` nos campos da sprint;
  - identificar subtasks que não vieram como issues independentes;
  - consultar Jira Search (`/rest/api/3/search`) em lotes para obter story points das subtasks faltantes;
  - somar apenas subtasks entregues e anexar no snapshot via `subtaskStoryPoints`.
- `JiraIssueSnapshot` ganhou campo opcional `subtaskStoryPoints`.
- `calculateSprintMetrics` passa a usar `storyPoints + subtaskStoryPoints`.
- `summarizeDeliveredMetadata` passa a agregar pontos considerando subtasks.
- Testes ajustados para cobrir o novo comportamento.

## Decisões tomadas

- Evitar dupla contagem: subtasks já presentes na lista da sprint não são somadas no campo herdado do pai.
- Considerar apenas subtasks entregues no somatório herdado para manter coerência com métricas de entrega.

## Pendências

- Avaliar se a mesma regra deve ser exposta explicitamente na UI (tooltip/nota de metodologia).

## Riscos

- Dependência da disponibilidade/performance do endpoint de busca Jira ao carregar subtasks faltantes.

## Status

- Concluída.

## Validações executadas

- `npm run test`
- `npm run lint`
- `npm run build`
- Teste funcional no Browser em `/` e `/dashboard` com fluxo “Ver métricas”.

## Resultado do build

- Aprovado.

## Resultado dos testes

- Aprovado.

## Próxima ação

- Opcional: detalhar no dashboard quando os pontos incluem subtasks herdadas.
