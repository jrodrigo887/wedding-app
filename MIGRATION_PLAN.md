# Plano de Migração — FSD Completo

> **Projeto:** Wedding Gift List
> **Versão do documento:** 1.0
> **Data:** 2026-02-19
> **Branch de trabalho:** `developer`

---

## Contexto

O projeto está em **migração gradual de DDD modular para Feature-Sliced Design (FSD)**. As fases 0–2 foram concluídas e 8 features foram criadas na fase 3. No entanto, a migração é incompleta: `src/modules/` ainda está ativo e sendo referenciado pelas features recém-criadas.

### Estado Atual — Snapshot

```
src/
├── app/           ← Camada FSD 1  — VAZIA
├── pages/         ← Camada FSD 2  — VAZIA
├── widgets/       ← Camada FSD 3  — VAZIO
├── features/      ← Camada FSD 4  — 8 features (com violações de import)
├── entities/      ← Camada FSD 5  — existe, com problemas
├── shared/        ← Camada FSD 6  — existe, com 1 violação crítica
│
├── modules/       ← DDD modular   — AINDA ATIVO (102 arquivos)
├── views/         ← Fora do FSD   — 3 páginas (HomePage, ChaCasaNova, FeatureNotAvailable)
├── core/          ← Redundante    — re-exporta @shared/ui, pode ser deletado
└── services/      ← Fora do FSD   — qrcode.service, api.service, tenantService
```

---

## Violações Identificadas

### Prioridade 1 — Crítica (bloqueia testes)

| # | Arquivo | Violação | Impacto |
|---|---------|----------|---------|
| V1 | `shared/api/repositoryFactory.ts` | `shared` importa de `modules/*/infrastructure` | Impossível mockar repositórios em testes |
| V2 | `features/photo-interactions/model/usePhotoRealtime.ts` | Feature importa de outra feature (`@/features/photo-upload`) | Impossível isolar `photo-interactions` em testes |
| V3 | `features/photo-upload/model/usePhotoUpload.ts` | Feature importa de `@/modules/photos/infrastructure/stores` | Store legado bloqueia testes unitários |
| V4 | `features/photo-upload/model/useVideoUpload.ts` | Feature importa de `@/modules/photos/infrastructure/stores` | Idem V3 |
| V5 | `features/photo-interactions/model/usePhotoRealtime.ts` | Feature importa de `@/modules/photos/infrastructure/stores` | Idem V3 |
| V6 | `features/rsvp-confirmation/api/supabaseRsvpRepository.ts` | Feature importa interface de `@/modules/rsvp/domain/interfaces` | Acoplamento a module domain |

### Prioridade 2 — Estrutural (bloqueia escalabilidade)

| # | Problema | Localização | Correção |
|---|----------|-------------|----------|
| S1 | Tipos duplicados: `Photo`, `Guest`, `Contract` existem em `entities/` e em `modules/*/domain/` | `src/entities/` vs `src/modules/` | Remover duplicatas dos modules |
| S2 | UI dentro de entities: `PhotoCard`, `VideoCard`, `MediaCard`, `CommentItem` | `entities/photo/ui/`, `entities/comment/ui/` | Auditar — se tiverem lógica de negócio, mover para features |
| S3 | `pages/` e `widgets/` vazios — router importa direto de `modules/` | `src/router/index.ts` | Criar pages e widgets reais |
| S4 | `modules/auth/index.ts` re-exporta `@/features/auth-login` | `src/modules/auth/index.ts` | Module não deve importar feature |
| S5 | Repositórios concretos expostos no public API das features | `features/*/index.ts` | Expor apenas interfaces e composables |

### Prioridade 3 — Limpeza (dívida técnica)

| # | Problema | Ação |
|---|----------|------|
| L1 | `src/core/` apenas re-exporta `@shared/ui` | Deletar `src/core/` inteiramente |
| L2 | `src/services/` duplica o que já está em `shared/` e `features/` | Deletar `src/services/` após verificar referências |
| L3 | `eslint.config.js` linha 28 tem bug com comma operator | Corrigir sintaxe do `pluginVue.configs` |
| L4 | Regras `no-restricted-imports` comentadas no ESLint | Remover comentários — substituídas por `eslint-plugin-boundaries` |
| L5 | `src/modules/` não tem alias dedicado no tsconfig | Adicionar `@modules/*` para consistência durante a transição |

---

## Regras de Convivência Durante a Migração

> Enquanto `src/modules/` ainda existir, estas regras devem ser seguidas por todo o time:

1. **FREEZE de modules:** nenhum arquivo novo entra em `src/modules/`. Todo código novo vai para FSD.
2. **Features não referenciam modules diretamente** — qualquer dependência de module precisa ser tratada como dívida técnica a resolver.
3. **O router não ganha novas rotas de modules** — novas rotas nascem em `src/pages/`.
4. **Toda feature nova nasce com `__tests__/`** — mesmo que vazio, o diretório sinaliza intenção.

---

## Fases de Migração

---

### FASE A — Estabilizar Fundamentos
> **Objetivo:** eliminar violações críticas que bloqueiam testes
> **Pré-condição:** nenhuma
> **Resultado esperado:** features isoláveis, base pronta para vitest

---

#### A1 — Mover `storageService` para `shared/`

**Problema:** `features/photo-interactions` importa `storageService` de `@/features/photo-upload`, violando o princípio de isolamento entre features.

**Ação:**
```
MOVER: src/features/photo-upload/api/storageService.ts
  → src/shared/api/storageService.ts

ATUALIZAR imports em:
  - src/features/photo-upload/api/downloadService.ts
  - src/features/photo-upload/model/usePhotoUpload.ts
  - src/features/photo-upload/model/useVideoUpload.ts
  - src/features/photo-upload/index.ts  (re-exportar de shared)
  - src/features/photo-interactions/model/usePhotoRealtime.ts
  - src/modules/photos/infrastructure/services/ (se ainda referenciado)
```

**Destino correto:** `storageService` é uma abstração de infraestrutura sem conhecimento de domínio — pertence a `shared/api/`.

---

#### A2 — Migrar `usePhotosStore` para fora de `modules/`

**Problema:** três features dependem de `@/modules/photos/infrastructure/stores/usePhotosStore`, tornando impossível testar essas features sem o módulo legado.

**Opção A (recomendada) — Feature dedicada de estado:**
```
CRIAR: src/features/photo-state/
├── model/
│   └── usePhotosStore.ts   ← cópia direta do module, sem alterações
└── index.ts

ATUALIZAR imports em:
  - features/photo-upload/model/usePhotoUpload.ts
  - features/photo-upload/model/useVideoUpload.ts
  - features/photo-upload/ui/*.vue
  - features/photo-interactions/model/usePhotoRealtime.ts
  - features/photo-interactions/ui/PhotoModal.vue
  - features/photo-moderation/ui/PhotoModeration.vue
```

**Opção B** — Mover store para `features/photo-upload/model/` diretamente se for usada exclusivamente por upload. *(Não recomendada: store é usada por 3 features diferentes)*

---

#### A3 — Mover interfaces de domínio para `entities/`

**Problema:** `features/rsvp-confirmation/api/supabaseRsvpRepository.ts` importa `IRsvpRepository` de `@/modules/rsvp/domain/interfaces`.

**Ação:**
```
CRIAR/MOVER: interfaces de repositório para entities

  src/modules/rsvp/domain/interfaces.ts      → src/entities/rsvp/ (criar entidade) ou
                                              → src/entities/guest/model/interfaces.ts
  src/modules/photos/domain/interfaces.ts    → src/entities/photo/model/interfaces.ts
  src/modules/admin/domain/interfaces.ts     → src/entities/guest/model/interfaces.ts
                                               src/entities/contract/model/interfaces.ts

ATUALIZAR imports em:
  - features/rsvp-confirmation/api/supabaseRsvpRepository.ts
  - features/contract-management/api/supabaseContractRepository.ts
  - features/guest-management/api/supabaseGuestRepository.ts
  - shared/api/repositoryFactory.ts
```

---

#### A4 — Mover `repositoryFactory` para `app/providers/`

**Problema:** `shared/api/repositoryFactory.ts` importa implementações concretas de repositórios de `modules/*/infrastructure`, violando a regra de que `shared` não pode importar de camadas superiores.

**Ação:**
```
CRIAR: src/app/providers/
├── repositoryFactory.ts  ← mover de shared/api/
└── index.ts

ATUALIZAR imports em qualquer arquivo que use repositoryFactory
REMOVER: shared/api/repositoryFactory.ts
ATUALIZAR: shared/api/index.ts (remover re-export)
```

> `app/` é a única camada que pode conhecer e instanciar infraestrutura concreta — é o composition root da aplicação.

---

#### A5 — Corrigir bug no `eslint.config.js`

**Problema:** linha 28 usa o comma operator do JavaScript, que resulta em `pluginVue.configs[boundaries]` (undefined) em vez de `pluginVue.configs['flat/recommended']`.

```javascript
// ATUAL (bugado):
...pluginVue.configs[('flat/recommended', boundaries)],

// CORRETO:
...pluginVue.configs['flat/recommended'],
```

**Impacto:** as regras do Vue podem não estar sendo aplicadas corretamente. Verificar após a correção se novos erros aparecem.

---

### FASE B — Completar a Migração dos Modules
> **Objetivo:** esvaziar `src/modules/` migrando views para `pages/` e widgets para `widgets/`
> **Pré-condição:** Fase A completa
> **Resultado esperado:** router não importa mais de `src/modules/`

---

#### B1 — Criar `widgets/` com blocos reutilizáveis

Widgets são composições de features que aparecem em mais de uma página.

```
CRIAR: src/widgets/

photo-gallery/               ← PhotoFeed + PhotoModal + filtros
├── ui/PhotoGallery.vue      ← orquestra features/photo-interactions e entities/photo/ui
└── index.ts

admin-panel/                 ← layout + navegação do admin
├── ui/AdminLayout.vue       ← mover de modules/admin/presentation/layouts/
└── index.ts

moderation-panel/            ← lista de mídia pendente + ações em lote
├── ui/ModerationPanel.vue   ← orquestra features/photo-moderation
└── index.ts

rsvp-panel/                  ← formulário de confirmação + QR
├── ui/RsvpPanel.vue         ← orquestra features/rsvp-confirmation
└── index.ts

checkin-panel/               ← PIN + QR scanner + stats
├── ui/CheckinPanel.vue      ← orquestra features/guest-checkin
└── index.ts
```

---

#### B2 — Criar `pages/` com composições por rota

```
CRIAR: src/pages/

home/
├── ui/HomePage.vue          ← mover de src/views/HomePage.vue
└── index.ts

cha-casa-nova/
├── ui/ChaCasaNovaPage.vue   ← mover de src/views/ChaCasaNovaPage.vue
└── index.ts

photo-feed/
├── ui/PhotoFeedPage.vue     ← substitui modules/photos/presentation/views/PhotoFeedView.vue
└── index.ts                    usa widgets/photo-gallery

photo-upload/
├── ui/PhotoUploadPage.vue   ← substitui modules/photos/presentation/views/PhotoUploadView.vue
└── index.ts                    usa features/photo-upload

admin/
├── ui/
│   ├── DashboardPage.vue    ← substitui modules/admin/presentation/views/DashboardView.vue
│   ├── GuestsPage.vue       ← substitui modules/admin/presentation/views/GuestsView.vue
│   ├── ContractsPage.vue    ← substitui modules/admin/presentation/views/ContractsView.vue
│   └── AdminPhotosPage.vue  ← substitui modules/photos/presentation/views/AdminPhotosView.vue
└── index.ts

rsvp/
├── ui/RsvpPage.vue          ← substitui modules/rsvp/presentation/views/RsvpView.vue
└── index.ts

checkin/
├── ui/CheckinPage.vue       ← substitui modules/rsvp/presentation/views/CheckinView.vue
└── index.ts

auth/
├── ui/LoginPage.vue         ← mover de modules/auth/views/LoginPage.vue
├── model/authGuard.ts       ← mover de modules/auth/guards/authGuard.ts
└── index.ts
```

---

#### B3 — Atualizar o router para importar de `pages/`

```typescript
// src/router/index.ts — DEPOIS da Fase B

// REMOVER imports de modules:
// import { LoginPage, authGuard } from '@/modules/auth';
// import { AdminLayout, DashboardView, ... } from '@/modules/admin';
// import { RsvpView, CheckinView } from '@/modules/rsvp';
// import { PhotoFeedView, ... } from '@/modules/photos';

// ADICIONAR imports de pages:
import { LoginPage, authGuard } from '@/pages/auth';
import { AdminLayout } from '@/widgets/admin-panel';
import { DashboardPage, GuestsPage, ContractsPage, AdminPhotosPage } from '@/pages/admin';
import { RsvpPage } from '@/pages/rsvp';
import { CheckinPage } from '@/pages/checkin';
import { PhotoFeedPage, PhotoUploadPage } from '@/pages/photo-feed';
```

---

#### B4 — Deletar `src/modules/` após migração completa

Verificação antes de deletar:
```bash
# Nenhum resultado = seguro deletar
grep -r "from '@/modules" src/ --include="*.ts" --include="*.vue"
grep -r "from \"@/modules" src/ --include="*.ts" --include="*.vue"
```

Deletar na ordem:
1. `src/modules/photos/` (maior, mais referenciado — migrar por último)
2. `src/modules/admin/`
3. `src/modules/rsvp/`
4. `src/modules/auth/`

---

### FASE C — Ativar Enforcement e Escrever Testes
> **Objetivo:** garantir que violações não regridam; cobertura inicial de testes
> **Pré-condição:** Fases A e B completas, `src/modules/` deletado
> **Resultado esperado:** lint detecta violações de layer; primeiros testes passando

---

#### C1 — Limpar dívida técnica restante

```
DELETAR: src/core/           (re-exporta apenas @shared/ui — zero valor)
DELETAR: src/services/       (verificar referências antes)
DELETAR: src/views/          (após mover para pages/)
AUDITAR: entities/photo/ui/ e entities/comment/ui/
  → Se componentes têm lógica de negócio: mover para feature correspondente
  → Se são puramente presentacionais: manter em entities
```

---

#### C2 — Ativar regras de boundaries no ESLint

Após deletar `src/modules/`, as regras já configuradas em `eslint.config.js` passam a funcionar sem falsos positivos:

```javascript
// eslint.config.js — já configurado, será ativo após remoção de modules/
{
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { type: 'app',      pattern: 'src/app/**' },
      { type: 'pages',    pattern: 'src/pages/**' },
      { type: 'widgets',  pattern: 'src/widgets/**' },
      { type: 'features', pattern: 'src/features/**' },
      { type: 'entities', pattern: 'src/entities/**' },
      { type: 'shared',   pattern: 'src/shared/**' },
    ]
  },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'app',      allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
        { from: 'pages',    allow: ['widgets', 'features', 'entities', 'shared'] },
        { from: 'widgets',  allow: ['features', 'entities', 'shared'] },
        { from: 'features', allow: ['entities', 'shared'] },  // ← cross-feature bloqueado
        { from: 'entities', allow: ['shared'] },
        { from: 'shared',   allow: [] },                      // ← shared não sobe
      ]
    }]
  }
}
```

> **Nota:** as regras `no-restricted-imports` comentadas no arquivo atual (`linhas 122–182`) foram corretamente substituídas pelo `eslint-plugin-boundaries`. Podem ser removidas definitivamente.

---

#### C3 — Instalar e configurar Vitest

```bash
npm install -D vitest @vue/test-utils @testing-library/vue jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/features/**', 'src/entities/**', 'src/shared/**'],
      thresholds: { lines: 0 },  // aumentar 10% por sprint
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
    },
  },
});
```

```typescript
// src/test/setup.ts
import { config } from '@vue/test-utils';
import { createPinia } from 'pinia';

config.global.plugins = [createPinia()];
```

---

#### C4 — Estrutura de testes por feature

Cada feature deve ter a pasta `__tests__/` com no mínimo:

```
features/photo-upload/
└── __tests__/
    ├── imageCompressor.spec.ts    ← unit: função pura, sem mocks
    ├── usePhotoUpload.spec.ts     ← unit: mock store + storageService
    ├── PhotoUploader.spec.ts      ← component: renderiza, emite eventos
    └── storageService.spec.ts     ← integration: mock supabase client

features/photo-interactions/
└── __tests__/
    ├── usePhotoRealtime.spec.ts   ← unit: mock supabase channel
    ├── LikeButton.spec.ts         ← component: toggle, disabled state
    └── PhotoModal.spec.ts         ← component: open/close, download

features/rsvp-confirmation/
└── __tests__/
    ├── useRsvpStore.spec.ts       ← unit: mock repository
    └── CodeInput.spec.ts          ← component: input mask, emit

features/guest-management/
└── __tests__/
    ├── useGuestsStore.spec.ts
    └── GuestsTable.spec.ts

features/auth-login/
└── __tests__/
    └── useAuth.spec.ts            ← unit: mock supabase auth
```

**Padrão de mock para stores Pinia:**
```typescript
// Exemplo: features/photo-upload/__tests__/usePhotoUpload.spec.ts
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePhotoUpload } from '../model/usePhotoUpload';

vi.mock('@shared/api/storageService', () => ({
  storageService: {
    upload: vi.fn().mockResolvedValue({ path: 'test/photo.jpg' }),
    getPublicUrl: vi.fn().mockReturnValue('https://cdn.test/photo.jpg'),
    deleteFile: vi.fn().mockResolvedValue(true),
  },
}));

describe('usePhotoUpload', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('deve fazer upload e atualizar o estado', async () => {
    const { uploadPhoto, uploading, progress } = usePhotoUpload();
    expect(uploading.value).toBe(false);
    // ... assertions
  });
});
```

---

### FASE D — Pipeline CI/CD
> **Objetivo:** garantia automatizada de qualidade a cada push
> **Pré-condição:** Fase C completa (lint ativo + testes passando)
> **Resultado esperado:** PR bloqueado se type-check, lint ou testes falharem

---

#### D1 — Atualizar `package.json` com scripts de teste

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "ci": "npm run type-check && npm run lint && npm run test"
  }
}
```

---

#### D2 — GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [master, developer]
  pull_request:
    branches: [master]

jobs:
  quality:
    name: Quality Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type Check
        run: npm run type-check

      - name: Lint (includes FSD boundaries)
        run: npm run lint

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

---

#### D3 — Progressão do threshold de coverage

| Sprint | Threshold mínimo | Foco |
|--------|-----------------|------|
| 1 | 0% (instalar) | shared/utils, entities |
| 2 | 20% | features/photo-upload, features/auth-login |
| 3 | 40% | features/photo-interactions, features/rsvp-confirmation |
| 4 | 60% | features/guest-management, features/contract-management |
| 5 | 80% | coverage total + component tests |

---

## Estrutura Final Alvo

```
src/
├── app/
│   ├── providers/
│   │   ├── repositoryFactory.ts    ← composition root de infraestrutura
│   │   ├── router.ts
│   │   ├── tenantResolver.ts
│   │   └── index.ts
│   ├── assets/
│   │   ├── styles/global.css
│   │   └── (imagens)
│   ├── App.vue
│   ├── main.ts
│   └── index.ts
│
├── pages/
│   ├── home/
│   ├── auth/
│   ├── photo-feed/
│   ├── photo-upload/
│   ├── admin/
│   ├── rsvp/
│   ├── checkin/
│   └── cha-casa-nova/
│
├── widgets/
│   ├── photo-gallery/
│   ├── admin-panel/
│   ├── moderation-panel/
│   ├── rsvp-panel/
│   └── checkin-panel/
│
├── features/
│   ├── auth-login/
│   ├── contract-management/
│   ├── guest-checkin/
│   ├── guest-management/
│   ├── photo-interactions/
│   ├── photo-moderation/
│   ├── photo-state/            ← NEW: store de fotos isolado
│   ├── photo-upload/
│   └── rsvp-confirmation/
│
├── entities/
│   ├── comment/                ← types + interface + (UI puramente presentacional)
│   ├── contract/
│   ├── guest/
│   ├── photo/
│   └── user/
│
├── shared/
│   ├── api/
│   │   ├── storageService.ts   ← MOVIDO de features/photo-upload
│   │   └── apiService.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── ui/                     ← design system base (9 componentes)
│   ├── types/
│   └── utils/
│
└── router/
    └── index.ts                ← importa apenas de pages/ e widgets/
```

---

## Checklist de Execução

### Fase A — Fundamentos

- [ ] A1: Mover `storageService` para `shared/api/storageService.ts`
- [ ] A1: Atualizar todos os imports de `storageService`
- [ ] A2: Criar feature `photo-state/` com `usePhotosStore`
- [ ] A2: Atualizar imports do store em todas as features
- [ ] A3: Mover interfaces de repositório para `entities/*/model/interfaces.ts`
- [ ] A3: Atualizar imports das interfaces
- [ ] A4: Criar `app/providers/repositoryFactory.ts`
- [ ] A4: Remover `repositoryFactory` de `shared/api/`
- [ ] A5: Corrigir bug de sintaxe no `eslint.config.js` linha 28
- [ ] A5: Rodar `npm run lint` e confirmar 0 erros

### Fase B — Migração de Views

- [x] B1: Criar `widgets/photo-gallery/`
- [x] B1: Criar `widgets/admin-panel/`
- [x] B1: Criar `widgets/moderation-panel/`
- [x] B1: Criar `widgets/rsvp-panel/`
- [x] B1: Criar `widgets/checkin-panel/`
- [x] B2: Criar todas as pages com componentes migrados
- [x] B3: Atualizar router para importar de `pages/` e `widgets/`
- [ ] B4: Verificar zero referências a `@/modules` com grep
- [ ] B4: Deletar `src/modules/` (fotos → admin → rsvp → auth)

### Fase C — Enforcement e Testes

- [x] C1: Deletar `src/core/`
- [x] C1: Deletar `src/services/` (verificar referências antes)
- [x] C1: Deletar `src/views/` (após migrar para pages/)
- [x] C1: Remover comentários de `no-restricted-imports` do eslint.config.js
- [ ] C2: Confirmar que `boundaries/element-types` está sem falsos positivos
- [x] C3: Instalar vitest + @vue/test-utils
- [x] C3: Criar `vitest.config.ts`
- [x] C3: Criar `src/test/setup.ts`
- [x] C4: Escrever testes para `shared/utils/` (baseline)
- [ ] C4: Escrever testes para `entities/*/model/` (factory functions)
- [x] C4: Escrever testes unitários para features prioritárias
- [x] C4: Confirmar `npm run test` passando

### Fase D — CI/CD

- [ ] D1: Adicionar scripts de teste no `package.json`
- [ ] D2: Criar `.github/workflows/ci.yml`
- [ ] D2: Confirmar primeiro run do CI verde
- [ ] D3: Definir threshold de coverage do sprint atual

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Quebra de funcionalidade ao mover store | Média | Alto | Testar manualmente cada feature após A2 antes de commitar |
| Imports circulares após mover interfaces | Baixa | Médio | Rodar `vue-tsc --noEmit` após cada etapa da Fase A |
| ESLint reportar 100+ erros ao ativar boundaries | Alta | Baixo | Ativar boundaries apenas após Fase B — antes há falsos positivos legítimos |
| Testes difíceis de isolar por acoplamento residual | Média | Médio | Completar Fase A antes de escrever qualquer teste |

---

## Referências

- [Feature-Sliced Design — documentação oficial](https://feature-sliced.design)
- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)
- [Vitest — Getting Started](https://vitest.dev/guide/)
- [Vue Test Utils v2](https://test-utils.vuejs.org/)
- `src/views/analise.md` — análise arquitetural anterior do projeto
