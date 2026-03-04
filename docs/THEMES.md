# Sistema de Temas

Este documento explica como funciona o sistema de temas e como criar novos temas para a aplicação white-label.

---

## Arquitetura

```
src/themes/
├── base.css          # Variáveis CSS base (todas as propriedades customizáveis)
├── index.ts          # Registro de temas disponíveis
├── default/
│   └── theme.css     # Tema "Romântico" (padrão)
├── elegant/
│   └── theme.css     # Tema "Elegante"
└── modern/
    └── theme.css     # Tema "Moderno"
```

---

## Temas Disponíveis

### Default (Romântico)
- **Cores**: Rosa antigo (#8B5A5A) + Dourado (#D4A574)
- **Fontes**: Playfair Display + Lato
- **Estilo**: Clássico, elegante, romântico

### Elegant
- **Cores**: Azul marinho (#1a365d) + Dourado (#c9a227)
- **Fontes**: Cormorant Garamond + Montserrat
- **Estilo**: Sofisticado, formal

### Modern
- **Cores**: Verde (#059669) + Roxo (#6366f1)
- **Fontes**: Inter
- **Estilo**: Minimalista, clean, contemporâneo

---

## Criando um Novo Tema

### 1. Criar pasta do tema

```bash
mkdir src/themes/meu-tema
```

### 2. Criar arquivo CSS

Crie `src/themes/meu-tema/theme.css`:

```css
/* Meu Tema - Descrição breve */

:root {
  /* === Cores Principais (OBRIGATÓRIO) === */
  --tenant-primary: #COR_PRIMARIA;
  --tenant-primary-hover: #COR_PRIMARIA_ESCURA;
  --tenant-primary-light: #COR_PRIMARIA_CLARA;

  --tenant-secondary: #COR_SECUNDARIA;
  --tenant-secondary-hover: #COR_SECUNDARIA_ESCURA;
  --tenant-secondary-light: #COR_SECUNDARIA_CLARA;

  /* === Backgrounds === */
  --tenant-background: #FUNDO_PRINCIPAL;
  --tenant-background-secondary: #FUNDO_SECUNDARIO;
  --tenant-background-card: #FFFFFF;

  /* === Textos === */
  --tenant-text: #COR_TEXTO;
  --tenant-text-secondary: #COR_TEXTO_SECUNDARIO;
  --tenant-text-muted: #COR_TEXTO_MUTED;

  /* === Bordas === */
  --tenant-border: #COR_BORDA;
  --tenant-border-light: #COR_BORDA_CLARA;

  /* === Tipografia (OPCIONAL) === */
  --tenant-font-heading: 'Nome da Fonte', serif;
  --tenant-font-body: 'Nome da Fonte', sans-serif;

  /* === Layout (OPCIONAL) === */
  --tenant-radius: 8px;
  --tenant-radius-lg: 12px;
}
```

### 3. Registrar o tema

Edite `src/themes/index.ts`:

```typescript
export const AVAILABLE_THEMES = ['default', 'elegant', 'modern', 'meu-tema'] as const

export const THEMES: Record<ThemeName, ThemeInfo> = {
  // ... temas existentes
  'meu-tema': {
    id: 'meu-tema',
    name: 'Nome do Tema',
    description: 'Descrição breve do tema',
    preview: {
      primary: '#COR_PRIMARIA',
      secondary: '#COR_SECUNDARIA',
      background: '#COR_FUNDO',
    },
  },
}
```

---

## Variáveis CSS Disponíveis

### Cores

| Variável | Descrição |
|----------|-----------|
| `--tenant-primary` | Cor principal (botões, links, destaques) |
| `--tenant-primary-hover` | Cor principal no hover |
| `--tenant-primary-light` | Versão clara da cor principal |
| `--tenant-secondary` | Cor secundária (acentos) |
| `--tenant-secondary-hover` | Cor secundária no hover |
| `--tenant-secondary-light` | Versão clara da cor secundária |

### Backgrounds

| Variável | Descrição |
|----------|-----------|
| `--tenant-background` | Fundo principal da página |
| `--tenant-background-secondary` | Fundo de seções alternadas |
| `--tenant-background-card` | Fundo de cards e modais |

### Textos

| Variável | Descrição |
|----------|-----------|
| `--tenant-text` | Texto principal |
| `--tenant-text-secondary` | Texto secundário |
| `--tenant-text-muted` | Texto desabilitado/muted |
| `--tenant-text-inverse` | Texto sobre fundo escuro |

### Estados

| Variável | Descrição |
|----------|-----------|
| `--tenant-success` | Cor de sucesso |
| `--tenant-warning` | Cor de aviso |
| `--tenant-error` | Cor de erro |
| `--tenant-info` | Cor informativa |

### Tipografia

| Variável | Descrição |
|----------|-----------|
| `--tenant-font-heading` | Fonte para títulos |
| `--tenant-font-body` | Fonte para corpo de texto |

### Layout

| Variável | Descrição |
|----------|-----------|
| `--tenant-radius` | Border radius padrão |
| `--tenant-radius-sm` | Border radius pequeno |
| `--tenant-radius-lg` | Border radius grande |
| `--tenant-spacing` | Unidade de espaçamento base |

---

## Usando o Sistema de Temas

### No código Vue

```typescript
import { useTheme } from '@shared/utils'

const { loadTheme, applyTenantTheme, toggleDarkMode } = useTheme()

// Carregar tema predefinido
await loadTheme('elegant')

// Aplicar tema do tenant (usa config do tenant)
applyTenantTheme()

// Alternar modo escuro
toggleDarkMode()
```

### No CSS

```css
.meu-componente {
  background-color: var(--background-card);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.botao-primario {
  background-color: var(--primary-color);
  color: var(--text-inverse);
}

.botao-primario:hover {
  background-color: var(--primary-hover);
}
```

---

## Dark Mode

O sistema suporta dark mode automaticamente. Para adicionar suporte ao seu tema:

```css
/* No seu theme.css */
[data-theme="dark"] {
  --tenant-background: #1A1A1A;
  --tenant-background-secondary: #2D2D2D;
  --tenant-background-card: #3D3D3D;

  --tenant-text: #F5F5F5;
  --tenant-text-secondary: #CCCCCC;
  --tenant-text-muted: #999999;

  --tenant-border: #4D4D4D;
  --tenant-border-light: #3D3D3D;
}
```

---

## Boas Práticas

1. **Contraste**: Garanta contraste adequado entre texto e fundo (WCAG AA mínimo)
2. **Consistência**: Use a mesma paleta de cores em todo o tema
3. **Hover states**: Sempre defina cores de hover mais escuras que a base
4. **Fontes**: Use Google Fonts e importe no `index.html`
5. **Teste**: Verifique o tema em diferentes resoluções e no dark mode

---

## Fontes Recomendadas

### Títulos (Serif)
- Playfair Display
- Cormorant Garamond
- Libre Baskerville
- Merriweather

### Títulos (Sans-serif)
- Inter
- Poppins
- Montserrat
- Raleway

### Corpo
- Lato
- Open Sans
- Roboto
- Source Sans Pro

---

## Troubleshooting

### Tema não aplica

1. Verifique se o tema está registrado em `src/themes/index.ts`
2. Verifique se o arquivo CSS existe em `src/themes/nome-tema/theme.css`
3. Limpe o cache do navegador

### Cores não mudam

1. Verifique se está usando as variáveis corretas (`--tenant-*` no tema, `--primary-color` etc. nos componentes)
2. Verifique se `base.css` está sendo importado antes dos temas

### Fontes não carregam

1. Adicione o import do Google Fonts no `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=SuaFonte:wght@400;600;700&display=swap" rel="stylesheet">
   ```
