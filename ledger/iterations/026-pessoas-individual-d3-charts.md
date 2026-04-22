# Iteração 026 — Gráficos por desenvolvedor (análise individual)

## Objetivo

- Ao **selecionar um desenvolvedor** em `/dashboard/pessoas`, mostrar **gráficos D3** com métricas úteis para diagnóstico de fluxo (não só números em cards).

## Implementação

- Novo componente `IndividualAssigneeCharts.tsx`:
  - **Barras horizontais**: story points por **tipo de issue** (top categorias do recorte).
  - **Colunas**: **Lead** e **Cycle** em dias (quando há amostras), com subtítulo com n de amostras.
  - **Colunas**: **Spillover** e **Escopo +** (contagens).
- Texto de contexto (“recorte atual”, leitura gerencial).
- Estados vazios: sem categorias; sem lead/cycle (caixa tracejada).
- `PessoasClient`: substitui a lista textual de categorias por esta secção de gráficos (a informação repete-se visualmente no gráfico de tipos).

## Validações

- `npm run build`, `npm run lint` — sucesso.
- Browser: `/dashboard/pessoas`, clicar num nome e confirmar secção “Métricas em gráfico”.
