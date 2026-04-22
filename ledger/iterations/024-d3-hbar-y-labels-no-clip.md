# Iteração 024 — Barras horizontais: nomes dentro do SVG

## Problema

- Na **Visão gráfica** (sprint), os nomes no eixo Y apareciam **cortados à esquerda** — o eixo D3 padrão (`axisLeft` com textos a x negativos) ficava fora do viewBox do SVG (x ≥ 0), pelo que o browser recortava o texto.

## Solução

- `D3HorizontalBarChart`: deixou de usar `axisLeft` para os nomes. Passou a:
  - calcular a **largura da coluna de rótulos** com base no comprimento máximo do texto (limitada entre 100–300 px);
  - desenhar **`<text>`** com `text-anchor: end` e `x = labelW - 4`, tudo com coordenadas **positivas**;
  - manter a área das barras a começar em `innerLeft` após essa coluna.
- `SprintVisualizations`: rótulo truncado de 22 → **28** caracteres para aproximar o nome exibido do nome completo (tooltip com nome completo mantém-se).

## Validações

- `npm run test`, `npm run lint`, `npm run build` — sucesso.
