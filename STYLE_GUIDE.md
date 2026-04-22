# Guia de Estilos Visuais — Sauvvi Partners Dashboard

> Documento de referência para replicar a identidade visual e os padrões de design do sistema.

---

## 1. Stack de Tecnologia

| Ferramenta | Versão |
|---|---|
| CSS Framework | Tailwind CSS v3.3.2 |
| Build | Vite + PostCSS + Autoprefixer |
| Tema | React Context customizado (light/dark) |
| Animações | Keyframes customizados via Tailwind config |

---

## 2. Identidade da Marca

**Logo:**
- Arquivo: `/public/sauvvi-logo.png` (512×512px)
- Conceito: Cruz branca + "S" sobre fundo vermelho
- Tamanhos: `h-9 w-9` (pequeno), `h-10 w-10` (médio), `h-11 w-11` (grande)
- Ring decorativo: `ring-1 ring-black/[0.06] dark:ring-white/10`

**Cor da marca:** `#EE2E24` (vermelho Sauvvi) — use a classe `sauvvi` no Tailwind

---

## 3. Paleta de Cores

### Cores da Marca

```
Sauvvi Red (principal):   #EE2E24
Sauvvi Red (hover):       #d42820
Sauvvi Red (dark mode):   #ff4d4a
```

### Tema Claro (padrão)

```
Background:               #FFFFFF
Surface (cards, sidebar): #F2F2F7
Text:                     #000000
Text secundário:          #666666
Primary:                  #c8110e
Border / Divisor:         #E5E5EA
```

### Tema Escuro

```
Background:               #121212
Surface:                  #1E1E1E
Text:                     #FFFFFF
Text secundário:          #AAAAAA
Primary:                  #ff4d4a
Border / Divisor:         #333333
```

### Cores Semânticas (status)

| Estado | Cor | Classes Tailwind |
|---|---|---|
| Sucesso | Emerald/Verde | `emerald-400` → `emerald-700` |
| Pendente / Aviso | Âmbar/Amarelo | `amber-50` → `amber-900` |
| Erro / Perigo | Vermelho | `red-50` → `red-600`, `#ef4444` |
| Confirmado / Info | Teal/Ciano | `teal-400` → `teal-700` |

---

## 4. Tipografia

### Fontes

| Uso | Família | Estilo |
|---|---|---|
| Marca / Headings | **Space Grotesk** | Geométrica moderna |
| UI / Texto geral | **Plus Jakarta Sans** | Sans-serif clean |
| Fallback | system-ui, sans-serif | — |

> Importe ambas as fontes do Google Fonts ou via `@fontsource`.

### Tamanhos

```
xs:   12px  →  text-xs
sm:   14px  →  text-sm
md:   16px  →  text-base
lg:   20px  →  text-lg
xl:   24px  →  text-xl
xxl:  32px  →  text-3xl / text-[2rem]
hero: ~34px →  text-[2.125rem]  (font-brand, linha 1.15)
```

### Pesos

```
Regular:  400  →  font-normal
Medium:   500  →  font-medium
Semibold: 600  →  font-semibold
Bold:     700  →  font-bold
```

### Padrões recorrentes

```jsx
// Label / badge uppercase
className="text-xs font-semibold uppercase tracking-wide"

// Heading de seção
className="font-brand text-lg font-semibold tracking-tight"

// Heading hero (login/onboarding)
className="font-brand text-[2.125rem] font-semibold leading-[1.15] tracking-tight"

// Texto de corpo
className="text-sm text-text/80"

// Texto secundário
className="text-xs text-text/50"
```

---

## 5. Espaçamento

### Escala de tokens

```
xs:   4px   →  p-1  / gap-1
sm:   8px   →  p-2  / gap-2
md:   16px  →  p-4  / gap-4
lg:   24px  →  p-6  / gap-6
xl:   32px  →  p-8  / gap-8
xxl:  48px  →  p-12 / gap-12
```

### Padrões de padding por contexto

```
Seção de página:   p-5 sm:p-8 lg:p-10
Card interno:      p-4 sm:p-6
Header/toolbar:    px-4 py-3
Lista de itens:    gap-3 a gap-4
Grid de cards:     gap-6 a gap-8
```

---

## 6. Border Radius

```
sm:   4px     →  rounded
md:   8px     →  rounded-lg
lg:   16px    →  rounded-2xl
xl:   24px    →  rounded-3xl
pill: 9999px  →  rounded-full
```

### Usos típicos

| Componente | Radius |
|---|---|
| Botões principais | `rounded-full` ou `rounded-2xl` |
| Cards / containers | `rounded-2xl` |
| Inputs | `rounded-xl` |
| Badges / pills | `rounded-full` ou `rounded-xl` |
| Modais / drawers | `rounded-2xl` |
| Avatares | `rounded-[1.35rem]` |

---

## 7. Sombras

```
Padrão:       shadow-sm, shadow-md, shadow-lg
Botão brand:  shadow-[0_4px_14px_-2px_rgba(238,46,36,0.45),0_2px_6px_-2px_rgba(0,0,0,0.08)]
Glassmorphism: shadow-[0_32px_100px_-32px_rgba(16,185,129,0.22)]
Drawer:       shadow-2xl
Inset:        shadow-inner
```

---

## 8. Bordas

```
Hairline claro:  border border-secondary-light/90      →  ~E5E5EA com 90% opacidade
Hairline escuro: border border-secondary-dark/80       →  ~333333 com 80% opacidade
Accent:          border-primary (vermelho Sauvvi)
Transparentes:   border-white/55, border-black/[0.03]
Ativo (input):   border-b-2 border-sauvvi
```

---

## 9. Glassmorphism / Backdrop

```
Leve:    bg-white/95 backdrop-blur-sm           →  4px blur
Médio:   bg-white/90 backdrop-blur-md           →  12px blur
Forte:   bg-white/[0.88] backdrop-blur-2xl      →  40px blur
Modal:   bg-black/45 backdrop-blur-[2px]
```

---

## 10. Gradientes e Fundos

### Mesh gradient (login / onboarding)

```css
background-image:
  radial-gradient(at 40% 20%, rgba(238,46,36,0.10) 0px, transparent 52%),
  radial-gradient(at 85% 10%, rgba(180,90,90,0.07) 0px, transparent 48%),
  radial-gradient(at  0% 55%, rgba(238,46,36,0.06) 0px, transparent 55%),
  radial-gradient(at 100% 80%, rgba(238,46,36,0.04) 0px, transparent 45%);
```

### Gradiente de seção

```jsx
className="bg-gradient-to-b from-surface-light via-surface-light to-secondary-light/40"
```

### Shimmer (botão / loading)

```jsx
className="bg-gradient-to-r from-transparent via-white/22 to-transparent"
```

---

## 11. Componentes — Padrões

### Botão primário

```jsx
className="inline-flex items-center justify-center gap-2
           rounded-full bg-sauvvi px-6 py-3 text-sm font-semibold text-white
           shadow-[0_4px_14px_-2px_rgba(238,46,36,0.45)]
           transition hover:bg-[#d42820] hover:shadow
           active:scale-[0.99]
           disabled:cursor-not-allowed disabled:opacity-50
           focus-visible:outline focus-visible:outline-2
           focus-visible:outline-offset-2 focus-visible:outline-sauvvi"
```

### Input / Campo de texto

```jsx
// Estilo minimalista com sublinhado
className="w-full border-0 border-b-2 border-slate-200 bg-transparent pb-2.5
           text-sm outline-none ring-0 transition-colors
           placeholder:text-text/40
           focus-within:border-sauvvi
           focus-visible:outline-none"

// Estilo com borda completa
className="w-full rounded-xl border border-secondary-light/90
           bg-surface-light/50 py-2.5 pl-10 pr-4
           text-sm placeholder:text-text/40
           focus:border-sauvvi focus:outline-none focus:ring-0"
```

### Card / Container

```jsx
// Claro
className="rounded-2xl border border-slate-200/90 bg-white/95
           backdrop-blur-sm shadow-sm p-4 sm:p-6"

// Escuro
className="dark:bg-[#1a1a1a]/95 dark:border-secondary-dark"
```

### Badge de status

```jsx
// Sucesso
className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1
           text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"

// Pendente
className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1
           text-xs font-semibold text-amber-800 ring-1 ring-amber-200"

// Erro
className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1
           text-xs font-semibold text-red-700 ring-1 ring-red-200"

// Brand (primário)
className="inline-flex items-center rounded-full bg-primary/[0.07] px-2.5 py-1
           text-xs font-semibold text-primary"
```

### Tabela

```jsx
// Header
className="bg-gradient-to-b from-surface-light/90 to-surface-light/40"

// Linha com hover
className="group border-b border-secondary-light/70 transition-colors
           hover:bg-surface-light/70"

// Célula
className="px-4 py-3 text-sm"
```

### Sidebar / Navegação

```
Largura expandida:  260px
Largura colapsada:  72px (4.5rem)
Item ativo:         bg-primary/10 text-primary dark:bg-primary-dark/15
Item hover:         hover:bg-surface-light hover:text-text
Transição:          transition-[width] com cubic-bezier(0.22, 1, 0.36, 1)
```

---

## 12. Animações e Transições

### Easing padrão

```
cubic-bezier(0.22, 1, 0.36, 1)  →  ease-out suave/premium
```

### Micro-interações essenciais

| Animação | Duração | Uso |
|---|---|---|
| `fade-up` (entrada) | 0.65s | Aparecimento de elementos |
| `scale + opacity` (pop-in) | 0.45s | Modais, confirmações |
| `shake` (erro) | 0.55s | Validação negativa |
| `pulse` (loading) | 1.4s ∞ | Estados de carregamento |
| `shimmer-sweep` | 1.8s ∞ | Loading skeleton / shimmer |
| `theme-veil` | 0.88s | Troca de tema |

### Transições globais

```jsx
// Qualquer elemento interativo
className="transition-colors duration-200"
className="transition duration-300"
className="transition-all duration-200 ease-out"
```

### Keyframe fade-up (referência)

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* usage: animation: fade-up 0.65s cubic-bezier(0.22,1,0.36,1) both */
```

---

## 13. Dark Mode

**Implementação:** classe `dark` no `<html>` + prefixo `dark:` no Tailwind.

**Armazenamento:** `localStorage.sauvvi-theme` → `'light'` | `'dark'` | `'system'`

**Padrão de uso:**

```jsx
className="bg-white dark:bg-[#1E1E1E]
           text-black dark:text-white
           border-slate-200 dark:border-[#333333]"
```

---

## 14. Responsividade

Mobile-first. Breakpoints padrão do Tailwind:

| Prefixo | Largura |
|---|---|
| (base) | < 640px |
| `sm:` | ≥ 640px |
| `md:` | ≥ 768px |
| `lg:` | ≥ 1024px |
| `xl:` | ≥ 1280px |

**Padrões comuns:**

```jsx
className="flex flex-col lg:flex-row"
className="p-5 sm:p-8 lg:p-10"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="hidden md:block"    // somente desktop
className="flex md:hidden"     // somente mobile
className="w-full lg:w-[min(100%,420px)]"
```

---

## 15. Acessibilidade

```jsx
// Focus visível em todos os interativos
className="focus-visible:outline focus-visible:outline-2
           focus-visible:outline-offset-2 focus-visible:outline-sauvvi"

// Estados desabilitados
className="disabled:opacity-50 disabled:cursor-not-allowed"

// Ícones decorativos
<svg aria-hidden="true" ... />

// Roles semânticos
role="status" | role="alert" | role="dialog" | role="navigation"
```

---

## 16. Tailwind Config — Resumo dos Tokens Personalizados

```js
// tailwind.config.js (reconstrução dos tokens essenciais)
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sauvvi: '#EE2E24',
        primary: {
          DEFAULT: '#c8110e',
          dark: '#ff4d4a',
        },
        background: {
          light: '#FFFFFF',
          dark: '#121212',
        },
        surface: {
          light: '#F2F2F7',
          dark: '#1E1E1E',
        },
        text: {
          DEFAULT: '#000000',
          dark: '#FFFFFF',
        },
        secondary: {
          light: '#E5E5EA',
          dark: '#333333',
        },
      },
      fontFamily: {
        brand: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans:  ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
}
```

---

## 17. Filosofia de Design — Resumo

| Princípio | Descrição |
|---|---|
| **Moderno e Limpo** | Layouts espaçosos com profundidade sutil |
| **Brand-Centric** | Vermelho `#EE2E24` como acento principal em todo o sistema |
| **Motion-Rich** | Microinterações suaves e expansivas para feedback de qualidade |
| **Dark Native** | Tema escuro pensado desde o início, não adaptado |
| **Premium** | Glassmorphism, gradientes mesh e transições sofisticadas |
| **Acessível** | WCAG-compliant, gerenciamento de foco consistente |
| **Mobile-First** | Escala naturalmente de 320px até desktops grandes |

---

*Gerado automaticamente a partir da análise do código-fonte do Sauvvi Partners Dashboard.*
