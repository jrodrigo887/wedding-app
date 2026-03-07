# Plano de Migração para Feature Slice Design (FSD)
## Plataforma de Casamento - Vue 3 + TypeScript

**Versão:** 1.0
**Data:** 2026-02-13
**Status:** Aguardando aprovação

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Definição das Layers FSD](#2-definição-das-layers-fsd)
3. [Identificação de Entidades](#3-identificação-de-entidades)
4. [Identificação de Features](#4-identificação-de-features)
5. [Identificação de Widgets](#5-identificação-de-widgets)
6. [Mapeamento Completo de Arquivos](#6-mapeamento-completo-de-arquivos)
7. [Estrutura Final FSD](#7-estrutura-final-fsd)
8. [Regras de Dependência](#8-regras-de-dependência)
9. [Contratos de API Pública](#9-contratos-de-api-pública)
10. [Fases da Migração](#10-fases-da-migração)
11. [Decisões e Justificativas](#11-decisões-e-justificativas)

---

## 1. Visão Geral

### Arquitetura Atual (DDD Modular)
```
src/
├── modules/           # Módulos DDD (admin, auth, rsvp, photos)
│   └── {module}/
│       ├── domain/          # Entidades + Interfaces
│       ├── infrastructure/  # Stores, Repos, Services
│       └── presentation/    # Views, Components, Layouts
├── core/              # Infraestrutura compartilhada
├── components/        # Componentes legados (duplicados)
├── services/          # Clientes API (Supabase, Axios)
├── views/             # Páginas públicas soltas
├── config/            # Configuração tenant
└── router/            # Vue Router
```

### Arquitetura Alvo (FSD)
```
src/
├── app/       # Inicialização, providers, router, estilos globais
├── pages/     # Composições de rota (1 page = 1 rota)
├── widgets/   # Blocos compostos complexos de UI
├── features/  # Slices de feature (1 slice = 1 ação do usuário)
├── entities/  # Entidades de negócio (dados + representação UI)
└── shared/    # Utilitários, UI kit, API client, config
```

### Decisões do Usuário
- **Migração gradual** (módulo por módulo, app funcionando durante toda a migração)
- **Layers padrão sem processes** (app → pages → widgets → features → entities → shared)
- **core/ distribuído** entre app/ e shared/ (FSD puro)
- **Documento primeiro**, implementação após aprovação

---

## 2. Definição das Layers FSD

### Hierarquia (fluxo de dependência bottom-up)

```
┌──────────────────────────────────────────────────────────────┐
│  app/           CAMADA DE APLICAÇÃO                          │
│  ────────────────────────────────────────────────────────── │
│  - Bootstrap da aplicação (main.ts, App.vue)                │
│  - Providers globais (Router, Pinia, Theme)                 │
│  - Inicialização do Tenant                                  │
│  - Estilos globais e CSS                                    │
│  - Guards de autenticação (authGuard)                       │
│                                                              │
│  O QUE MIGRA PRA CÁ:                                        │
│  • src/main.ts → app/index.ts                                │
│  • src/App.vue → app/App.vue                                 │
│  • src/router/index.ts → app/providers/router.ts             │
│  • src/core/tenant/tenantResolver.ts → app/providers/tenant  │
│  • src/assets/styles → app/styles                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  pages/         CAMADA DE PÁGINAS                            │
│  ────────────────────────────────────────────────────────── │
│  - Composições no nível de rota (1 page = 1 rota)           │
│  - Orquestra widgets + features para rotas específicas       │
│  - SEM lógica de negócio, apenas composição                  │
│                                                              │
│  PÁGINAS DO PROJETO:                                         │
│  • HomePage (/)                                              │
│  • RsvpPage (/confirmar-presenca)                            │
│  • CheckinPage (/checkin)                                    │
│  • PhotoFeedPage (/fotos)                                    │
│  • PhotoUploadPage (/fotos/enviar)                           │
│  • AdminDashboardPage (/admin)                               │
│  • AdminGuestsPage (/admin/convidados)                       │
│  • AdminContractsPage (/admin/contratos)                     │
│  • AdminPhotosPage (/admin/fotos)                            │
│  • LoginPage (/login)                                        │
│  • ChaCasaNovaPage (/cha-de-casa-nova)                       │
│  • FeatureNotAvailablePage (/feature-not-available)           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  widgets/       CAMADA DE WIDGETS                            │
│  ────────────────────────────────────────────────────────── │
│  - Blocos UI complexos que combinam múltiplas features       │
│  - Componentes compostos com contexto de negócio             │
│  - Reutilizáveis entre múltiplas páginas                     │
│  - Podem usar features e entities                            │
│                                                              │
│  WIDGETS DO PROJETO:                                         │
│  • AdminLayout (sidebar + header + navigation)               │
│  • PhotoFeed (grid + interações)                             │
│  • GuestDashboard (stats + tabela + ações)                   │
│  • ContractDashboard (stats + tabela + form)                 │
│  • CheckinDashboard (stats + lista)                          │
│  • PhotoModerationPanel (interface admin de aprovação)        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  features/      CAMADA DE FEATURES                           │
│  ────────────────────────────────────────────────────────── │
│  - Slices centrados no usuário (1 slice = 1 ação)            │
│  - Contém lógica de negócio e operações de domínio           │
│  - Cada feature é isolada e independente                     │
│  - Features podem usar entities, mas NÃO outras features     │
│                                                              │
│  ESTRUTURA DE CADA FEATURE:                                  │
│  feature/                                                    │
│  ├── ui/        # Componentes UI específicos da feature      │
│  ├── model/     # Lógica de negócio, stores, composables     │
│  ├── api/       # Chamadas API, repositórios                 │
│  └── index.ts   # API Pública                                │
│                                                              │
│  FEATURES DO PROJETO:                                        │
│  • guest-management (CRUD convidados)                        │
│  • rsvp-confirmation (confirmar presença)                    │
│  • guest-checkin (QR scan, check-in)                         │
│  • photo-upload (upload foto/vídeo)                          │
│  • photo-moderation (aprovar/rejeitar fotos)                 │
│  • photo-interactions (curtir, comentar)                     │
│  • contract-management (CRUD contratos)                      │
│  • auth-login (autenticação)                                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  entities/      CAMADA DE ENTIDADES                          │
│  ────────────────────────────────────────────────────────── │
│  - Objetos de domínio (business entities)                    │
│  - Modelos de dados + representação UI de entidade única     │
│  - Interações API no nível da entidade                       │
│  - SEM dependências entre entidades                          │
│                                                              │
│  ESTRUTURA DE CADA ENTIDADE:                                 │
│  entity/                                                     │
│  ├── ui/        # Componentes de exibição (Card, Row)        │
│  ├── model/     # Tipos, schemas                             │
│  ├── api/       # Chamadas API básicas                       │
│  └── index.ts   # API Pública                                │
│                                                              │
│  ENTIDADES DO PROJETO:                                       │
│  • guest (Guest + GuestCard, GuestRow)                       │
│  • contract (Contract + ContractRow)                         │
│  • photo (Photo + PhotoCard, VideoCard)                      │
│  • comment (Comment + CommentItem)                           │
│  • user (User/Session)                                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  shared/        CAMADA COMPARTILHADA                         │
│  ────────────────────────────────────────────────────────── │
│  - Código genérico reutilizável SEM lógica de negócio        │
│  - UI kit (BaseButton, BaseInput, BaseModal)                 │
│  - Utils (formatação, validação)                             │
│  - API client (Supabase, Axios)                              │
│  - Config (environment, constantes)                          │
│                                                              │
│  ESTRUTURA:                                                  │
│  shared/                                                     │
│  ├── ui/        # Componentes genéricos (Button, Input...)   │
│  ├── lib/       # Integrações third-party (supabase)         │
│  ├── api/       # Setup base do API client                   │
│  ├── config/    # Configuração, constantes                   │
│  ├── types/     # Tipos TypeScript globais                   │
│  └── utils/     # Funções utilitárias puras                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Identificação de Entidades

### guest
| Aspecto | Detalhes |
|---------|----------|
| **Propósito** | Representa um convidado do casamento em todos os contextos |
| **Model** | `Guest`, `GuestStats`, `RsvpGuest` (unificados) |
| **UI** | `GuestDetails.vue`, `GuestCard.vue` (novo, se necessário) |
| **Origem** | `modules/admin/domain/entities.ts` + `modules/rsvp/domain/entities.ts` |

### contract
| Aspecto | Detalhes |
|---------|----------|
| **Propósito** | Representa contratos de fornecedores |
| **Model** | `Contract`, `ContractForm`, `ContractStats` |
| **UI** | `ContractRow.vue` (extraído da tabela, se necessário) |
| **Origem** | `modules/admin/domain/entities.ts` |

### photo
| Aspecto | Detalhes |
|---------|----------|
| **Propósito** | Representa mídia enviada (fotos/vídeos) |
| **Model** | `Photo`, `MediaType`, `PhotoStats`, `PhotoUploadData` |
| **UI** | `PhotoCard.vue`, `VideoCard.vue`, `MediaCard.vue` |
| **Origem** | `modules/photos/domain/entities.ts` + componentes de apresentação |

### comment
| Aspecto | Detalhes |
|---------|----------|
| **Propósito** | Comentários em fotos |
| **Model** | `PhotoComment`, `PhotoCommentForm` |
| **UI** | `CommentItem.vue` |
| **Origem** | `modules/photos/domain/entities.ts` |

### user
| Aspecto | Detalhes |
|---------|----------|
| **Propósito** | Autenticação e sessão do usuário |
| **Model** | `User`, `Session`, `AuthState` |
| **Origem** | `modules/auth/types/index.ts` |

---

## 4. Identificação de Features

### guest-management
> **User Story:** "Como admin, quero gerenciar a lista de convidados"

| Segmento | Arquivos |
|----------|----------|
| **ui/** | `GuestsTable.vue`, `GuestsStats.vue`, `CheckinsList.vue` |
| **model/** | `useGuestsStore.ts` |
| **api/** | `guestRepository.ts` (interface), `supabaseGuestRepository.ts` |
| **Origem** | `modules/admin/presentation/components/guests/*` + `modules/admin/infrastructure/*` |

### rsvp-confirmation
> **User Story:** "Como convidado, quero confirmar minha presença"

| Segmento | Arquivos |
|----------|----------|
| **ui/** | `CodeInput.vue`, `GuestDetails.vue`, `RsvpCard.vue`, `RsvpModal.vue`, `QRCodeDisplay.vue` |
| **model/** | `useRsvpStore.ts` |
| **api/** | `rsvpRepository.ts`, `supabaseRsvpRepository.ts`, `qrcodeService.ts` |
| **Origem** | `modules/rsvp/presentation/components/rsvp/*` + `modules/rsvp/infrastructure/*` + `services/qrcode.service.ts` |

### guest-checkin
> **User Story:** "Como admin, quero fazer check-in dos convidados no evento"

| Segmento | Arquivos |
|----------|----------|
| **ui/** | `QRScanner.vue`, `PinAuth.vue`, `CheckinStats.vue` |
| **model/** | `useAuthPin.ts` |
| **api/** | `checkinApi.ts` (wrapper sobre rsvpRepository) |
| **Origem** | `modules/rsvp/presentation/components/checkin/*` + `modules/rsvp/infrastructure/composables/useAuthPin.ts` |

### photo-upload
> **User Story:** "Como convidado, quero enviar fotos/vídeos"

| Segmento | Arquivos |
|----------|----------|
| **ui/** | `MediaUploader.vue`, `PhotoUploader.vue`, `VideoUploader.vue`, `VideoRecorder.vue`, `UploadProgress.vue` |
| **model/** | `usePhotoUpload.ts`, `useVideoUpload.ts` |
| **api/** | `imageCompressor.ts`, `videoCompressor.ts`, `storageService.ts` |
| **Origem** | `modules/photos/presentation/components/*` + `modules/photos/infrastructure/composables/*` + `modules/photos/infrastructure/services/*` |

### photo-moderation
> **User Story:** "Como admin, quero aprovar/rejeitar fotos"

| Segmento | Arquivos |
|----------|----------|
| **ui/** | `PhotoModeration.vue` |
| **model/** | `useModerationActions.ts` (extraído do usePhotosStore) |
| **Origem** | `modules/photos/presentation/components/PhotoModeration.vue` + lógica de aprovação do `usePhotosStore` |

### photo-interactions
> **User Story:** "Como convidado, quero curtir e comentar nas fotos"

| Segmento | Arquivos |
|----------|----------|
| **ui/** | `LikeButton.vue`, `CommentSection.vue`, `PhotoModal.vue` |
| **model/** | `useInteractions.ts` (extraído), `usePhotoRealtime.ts` |
| **Origem** | `modules/photos/presentation/components/*` + `modules/photos/infrastructure/composables/usePhotoRealtime.ts` |

### contract-management
> **User Story:** "Como admin, quero gerenciar contratos de fornecedores"

| Segmento | Arquivos |
|----------|----------|
| **ui/** | `ContractsTable.vue`, `ContractsStats.vue`, `ContractForm.vue` |
| **model/** | `useContractsStore.ts` |
| **api/** | `contractRepository.ts`, `supabaseContractRepository.ts` |
| **Origem** | `modules/admin/presentation/components/contracts/*` + `modules/admin/infrastructure/*` |

### auth-login
> **User Story:** "Como admin, quero fazer login no painel"

| Segmento | Arquivos |
|----------|----------|
| **model/** | `useAuth.ts` |
| **Origem** | `modules/auth/composables/useAuth.ts` |

---

## 5. Identificação de Widgets

| Widget | Composição | Usado em |
|--------|------------|----------|
| **admin-layout** | Sidebar + Header + router-view | Todas as páginas admin |
| **photo-feed** | PhotoCard + LikeButton + CommentSection + PhotoModal | PhotoFeedPage |
| **guest-dashboard** | GuestsStats + GuestsTable + CheckinsList | AdminGuestsPage, AdminDashboardPage |
| **contract-dashboard** | ContractsStats + ContractsTable + ContractForm | AdminContractsPage |
| **checkin-dashboard** | QRScanner + PinAuth + CheckinStats | CheckinPage |
| **photo-moderation-panel** | PhotoModeration + PhotoCard | AdminPhotosPage |

---

## 6. Mapeamento Completo de Arquivos

### APP LAYER
```
src/main.ts                              → src/app/index.ts
src/App.vue                              → src/app/App.vue
src/router/index.ts                      → src/app/providers/router.ts
src/modules/auth/guards/authGuard.ts     → src/app/providers/router.ts (merge)
src/core/tenant/tenantResolver.ts        → src/app/providers/tenant.ts
src/assets/styles/global.css             → src/app/styles/global.css
src/assets/*                             → src/app/assets/*
```

### PAGES LAYER
```
src/views/HomePage.vue                                     → src/pages/home/ui/HomePage.vue
src/views/ChaCasaNovaPage.vue                              → src/pages/cha-casa-nova/ui/ChaCasaNovaPage.vue
src/views/FeatureNotAvailablePage.vue                      → src/pages/feature-not-available/ui/FeatureNotAvailablePage.vue
src/modules/auth/views/LoginPage.vue                       → src/pages/login/ui/LoginPage.vue
src/modules/rsvp/presentation/views/RsvpView.vue           → src/pages/rsvp/ui/RsvpPage.vue
src/modules/rsvp/presentation/views/CheckinView.vue        → src/pages/checkin/ui/CheckinPage.vue
src/modules/photos/presentation/views/PhotoFeedView.vue    → src/pages/photo-feed/ui/PhotoFeedPage.vue
src/modules/photos/presentation/views/PhotoUploadView.vue  → src/pages/photo-upload/ui/PhotoUploadPage.vue
src/modules/photos/presentation/views/AdminPhotosView.vue  → src/pages/admin-photos/ui/AdminPhotosPage.vue
src/modules/admin/presentation/views/DashboardView.vue     → src/pages/admin-dashboard/ui/AdminDashboardPage.vue
src/modules/admin/presentation/views/GuestsView.vue        → src/pages/admin-guests/ui/AdminGuestsPage.vue
src/modules/admin/presentation/views/ContractsView.vue     → src/pages/admin-contracts/ui/AdminContractsPage.vue
```

### WIDGETS LAYER
```
src/modules/admin/presentation/layouts/AdminLayout.vue     → src/widgets/admin-layout/ui/AdminLayout.vue
src/modules/photos/presentation/components/PhotoFeed.vue   → src/widgets/photo-feed/ui/PhotoFeed.vue
(NOVO)                                                     → src/widgets/guest-dashboard/ui/GuestDashboard.vue
(NOVO)                                                     → src/widgets/contract-dashboard/ui/ContractDashboard.vue
(NOVO)                                                     → src/widgets/checkin-dashboard/ui/CheckinDashboard.vue
```

### FEATURES LAYER

**guest-management/**
```
modules/admin/presentation/components/guests/GuestsTable.vue      → features/guest-management/ui/GuestsTable.vue
modules/admin/presentation/components/guests/GuestsStats.vue      → features/guest-management/ui/GuestsStats.vue
modules/admin/presentation/components/guests/CheckinsList.vue     → features/guest-management/ui/CheckinsList.vue
modules/admin/infrastructure/stores/useGuestsStore.ts             → features/guest-management/model/useGuestsStore.ts
modules/admin/infrastructure/repositories/supabase/GuestRepository.ts → features/guest-management/api/supabaseGuestRepository.ts
```

**rsvp-confirmation/**
```
modules/rsvp/presentation/components/rsvp/CodeInput.vue           → features/rsvp-confirmation/ui/CodeInput.vue
modules/rsvp/presentation/components/rsvp/GuestDetails.vue        → features/rsvp-confirmation/ui/GuestDetails.vue
modules/rsvp/presentation/components/rsvp/QRCodeDisplay.vue       → features/rsvp-confirmation/ui/QRCodeDisplay.vue
modules/rsvp/presentation/components/common/RsvpCard.vue          → features/rsvp-confirmation/ui/RsvpCard.vue
modules/rsvp/presentation/components/common/RsvpModal.vue         → features/rsvp-confirmation/ui/RsvpModal.vue
modules/rsvp/infrastructure/stores/useRsvpStore.ts                → features/rsvp-confirmation/model/useRsvpStore.ts
modules/rsvp/infrastructure/repositories/supabase/RsvpRepository.ts → features/rsvp-confirmation/api/supabaseRsvpRepository.ts
services/qrcode.service.ts                                        → features/rsvp-confirmation/api/qrcodeService.ts
```

**guest-checkin/**
```
modules/rsvp/presentation/components/checkin/QRScanner.vue        → features/guest-checkin/ui/QRScanner.vue
modules/rsvp/presentation/components/checkin/PinAuth.vue          → features/guest-checkin/ui/PinAuth.vue
modules/rsvp/presentation/components/checkin/CheckinStats.vue     → features/guest-checkin/ui/CheckinStats.vue
modules/rsvp/infrastructure/composables/useAuthPin.ts             → features/guest-checkin/model/useAuthPin.ts
(NOVO)                                                            → features/guest-checkin/api/checkinApi.ts
```

**photo-upload/**
```
modules/photos/presentation/components/MediaUploader.vue          → features/photo-upload/ui/MediaUploader.vue
modules/photos/presentation/components/PhotoUploader.vue          → features/photo-upload/ui/PhotoUploader.vue
modules/photos/presentation/components/VideoUploader.vue          → features/photo-upload/ui/VideoUploader.vue
modules/photos/presentation/components/VideoRecorder.vue          → features/photo-upload/ui/VideoRecorder.vue
modules/photos/presentation/components/UploadProgress.vue         → features/photo-upload/ui/UploadProgress.vue
modules/photos/infrastructure/composables/usePhotoUpload.ts       → features/photo-upload/model/usePhotoUpload.ts
modules/photos/infrastructure/composables/useVideoUpload.ts       → features/photo-upload/model/useVideoUpload.ts
modules/photos/infrastructure/services/imageCompressor.ts         → features/photo-upload/api/imageCompressor.ts
modules/photos/infrastructure/services/videoCompressor.ts         → features/photo-upload/api/videoCompressor.ts
modules/photos/infrastructure/services/storageService.ts          → features/photo-upload/api/storageService.ts
```

**photo-moderation/**
```
modules/photos/presentation/components/PhotoModeration.vue        → features/photo-moderation/ui/PhotoModeration.vue
(EXTRAÍDO do usePhotosStore)                                      → features/photo-moderation/model/useModerationActions.ts
```

**photo-interactions/**
```
modules/photos/presentation/components/LikeButton.vue             → features/photo-interactions/ui/LikeButton.vue
modules/photos/presentation/components/CommentSection.vue         → features/photo-interactions/ui/CommentSection.vue
modules/photos/presentation/components/PhotoModal.vue             → features/photo-interactions/ui/PhotoModal.vue
modules/photos/infrastructure/composables/usePhotoRealtime.ts     → features/photo-interactions/model/usePhotoRealtime.ts
(EXTRAÍDO do usePhotosStore)                                      → features/photo-interactions/model/useInteractions.ts
```

**contract-management/**
```
modules/admin/presentation/components/contracts/ContractsTable.vue   → features/contract-management/ui/ContractsTable.vue
modules/admin/presentation/components/contracts/ContractsStats.vue   → features/contract-management/ui/ContractsStats.vue
modules/admin/presentation/components/contracts/ContractForm.vue     → features/contract-management/ui/ContractForm.vue
modules/admin/infrastructure/stores/useContractsStore.ts             → features/contract-management/model/useContractsStore.ts
modules/admin/infrastructure/repositories/supabase/ContractRepository.ts → features/contract-management/api/supabaseContractRepository.ts
```

**auth-login/**
```
modules/auth/composables/useAuth.ts                               → features/auth-login/model/useAuth.ts
```

### ENTITIES LAYER

**guest/**
```
modules/admin/domain/entities.ts (Guest, GuestStats)              → entities/guest/model/types.ts
modules/rsvp/domain/entities.ts (RsvpGuest → unificar)            → entities/guest/model/types.ts
modules/admin/domain/interfaces.ts (IGuestRepository)             → entities/guest/model/types.ts
```

**contract/**
```
modules/admin/domain/entities.ts (Contract, ContractStats)        → entities/contract/model/types.ts
modules/admin/domain/interfaces.ts (IContractRepository)          → entities/contract/model/types.ts
```

**photo/**
```
modules/photos/domain/entities.ts (Photo, MediaType, etc.)        → entities/photo/model/types.ts
modules/photos/domain/interfaces.ts (IPhotoRepository)            → entities/photo/model/types.ts
modules/photos/presentation/components/PhotoCard.vue              → entities/photo/ui/PhotoCard.vue
modules/photos/presentation/components/VideoCard.vue              → entities/photo/ui/VideoCard.vue
modules/photos/presentation/components/MediaCard.vue              → entities/photo/ui/MediaCard.vue
```

**comment/**
```
modules/photos/domain/entities.ts (PhotoComment, PhotoCommentForm) → entities/comment/model/types.ts
modules/photos/presentation/components/CommentItem.vue             → entities/comment/ui/CommentItem.vue
```

**user/**
```
modules/auth/types/index.ts                                        → entities/user/model/types.ts
```

### SHARED LAYER

**shared/ui/** (UI Kit genérico)
```
core/components/BaseButton.vue           → shared/ui/BaseButton.vue
core/components/BaseInput.vue            → shared/ui/BaseInput.vue
core/components/BaseModal.vue            → shared/ui/BaseModal.vue
core/components/LoadingSpinner.vue       → shared/ui/LoadingSpinner.vue
core/components/ProgressBar.vue          → shared/ui/ProgressBar.vue
core/components/StatsCard.vue            → shared/ui/StatsCard.vue
core/components/FeatureGate.vue          → shared/ui/FeatureGate.vue
components/common/NotificationContainer.vue → shared/ui/NotificationContainer.vue
components/pix/PixModal.vue              → shared/ui/PixModal.vue
```

**shared/lib/** (Integrações third-party)
```
services/supabase.ts                     → shared/lib/supabase.ts
```

**shared/api/** (Utilitários API)
```
services/api.service.ts                  → shared/api/apiService.ts
services/tenantService.ts                → shared/api/tenantService.ts
core/factories/repositoryFactory.ts      → shared/api/repositoryFactory.ts
```

**shared/config/** (Configuração)
```
config/tenant.ts                         → shared/config/tenant.ts
```

**shared/types/** (Tipos globais)
```
core/types/*                             → shared/types/
```

**shared/utils/** (Utilitários)
```
core/composables/useNotification.ts      → shared/utils/useNotification.ts
core/composables/useTenantContext.ts      → shared/utils/useTenantContext.ts
core/composables/useTheme.ts             → shared/utils/useTheme.ts
```

### ARQUIVOS A DELETAR (Legacy/Duplicados)
```
src/components/common/BaseButton.vue          ← Duplicata de core/components
src/components/common/BaseInput.vue           ← Duplicata
src/components/common/LoadingSpinner.vue      ← Duplicata
modules/admin/presentation/components/common/BaseButton.vue  ← Duplicata
modules/admin/presentation/components/common/BaseModal.vue   ← Duplicata
modules/admin/presentation/components/common/ProgressBar.vue ← Duplicata
modules/admin/presentation/components/common/StatsCard.vue   ← Duplicata
Todos os index.ts barrel exports em modules/*                ← FSD tem suas próprias APIs
```

---

## 7. Estrutura Final FSD

```
src/
├── app/
│   ├── index.ts                          # Entry point (from main.ts)
│   ├── App.vue                           # Root component
│   ├── providers/
│   │   ├── router.ts                     # Router + authGuard + featureGuard
│   │   ├── store.ts                      # Pinia setup
│   │   └── tenant.ts                     # Tenant initialization
│   ├── styles/
│   │   └── global.css                    # Global styles
│   └── assets/                           # Static assets
│
├── pages/
│   ├── home/
│   │   ├── ui/HomePage.vue
│   │   └── index.ts
│   ├── rsvp/
│   │   ├── ui/RsvpPage.vue
│   │   └── index.ts
│   ├── checkin/
│   │   ├── ui/CheckinPage.vue
│   │   └── index.ts
│   ├── photo-feed/
│   │   ├── ui/PhotoFeedPage.vue
│   │   └── index.ts
│   ├── photo-upload/
│   │   ├── ui/PhotoUploadPage.vue
│   │   └── index.ts
│   ├── admin-dashboard/
│   │   ├── ui/AdminDashboardPage.vue
│   │   └── index.ts
│   ├── admin-guests/
│   │   ├── ui/AdminGuestsPage.vue
│   │   └── index.ts
│   ├── admin-contracts/
│   │   ├── ui/AdminContractsPage.vue
│   │   └── index.ts
│   ├── admin-photos/
│   │   ├── ui/AdminPhotosPage.vue
│   │   └── index.ts
│   ├── login/
│   │   ├── ui/LoginPage.vue
│   │   └── index.ts
│   ├── cha-casa-nova/
│   │   ├── ui/ChaCasaNovaPage.vue
│   │   └── index.ts
│   └── feature-not-available/
│       ├── ui/FeatureNotAvailablePage.vue
│       └── index.ts
│
├── widgets/
│   ├── admin-layout/
│   │   ├── ui/AdminLayout.vue
│   │   └── index.ts
│   ├── photo-feed/
│   │   ├── ui/PhotoFeed.vue
│   │   └── index.ts
│   ├── guest-dashboard/
│   │   ├── ui/GuestDashboard.vue
│   │   └── index.ts
│   ├── contract-dashboard/
│   │   ├── ui/ContractDashboard.vue
│   │   └── index.ts
│   ├── checkin-dashboard/
│   │   ├── ui/CheckinDashboard.vue
│   │   └── index.ts
│   └── photo-moderation-panel/
│       ├── ui/PhotoModerationPanel.vue
│       └── index.ts
│
├── features/
│   ├── guest-management/
│   │   ├── ui/
│   │   │   ├── GuestsTable.vue
│   │   │   ├── GuestsStats.vue
│   │   │   └── CheckinsList.vue
│   │   ├── model/
│   │   │   └── useGuestsStore.ts
│   │   ├── api/
│   │   │   └── supabaseGuestRepository.ts
│   │   └── index.ts
│   ├── rsvp-confirmation/
│   │   ├── ui/
│   │   │   ├── CodeInput.vue
│   │   │   ├── GuestDetails.vue
│   │   │   ├── RsvpCard.vue
│   │   │   ├── RsvpModal.vue
│   │   │   └── QRCodeDisplay.vue
│   │   ├── model/
│   │   │   └── useRsvpStore.ts
│   │   ├── api/
│   │   │   ├── supabaseRsvpRepository.ts
│   │   │   └── qrcodeService.ts
│   │   └── index.ts
│   ├── guest-checkin/
│   │   ├── ui/
│   │   │   ├── QRScanner.vue
│   │   │   ├── PinAuth.vue
│   │   │   └── CheckinStats.vue
│   │   ├── model/
│   │   │   └── useAuthPin.ts
│   │   ├── api/
│   │   │   └── checkinApi.ts
│   │   └── index.ts
│   ├── photo-upload/
│   │   ├── ui/
│   │   │   ├── MediaUploader.vue
│   │   │   ├── PhotoUploader.vue
│   │   │   ├── VideoUploader.vue
│   │   │   ├── VideoRecorder.vue
│   │   │   └── UploadProgress.vue
│   │   ├── model/
│   │   │   ├── usePhotoUpload.ts
│   │   │   └── useVideoUpload.ts
│   │   ├── api/
│   │   │   ├── imageCompressor.ts
│   │   │   ├── videoCompressor.ts
│   │   │   └── storageService.ts
│   │   └── index.ts
│   ├── photo-moderation/
│   │   ├── ui/
│   │   │   └── PhotoModeration.vue
│   │   ├── model/
│   │   │   └── useModerationActions.ts
│   │   └── index.ts
│   ├── photo-interactions/
│   │   ├── ui/
│   │   │   ├── LikeButton.vue
│   │   │   ├── CommentSection.vue
│   │   │   └── PhotoModal.vue
│   │   ├── model/
│   │   │   ├── useInteractions.ts
│   │   │   └── usePhotoRealtime.ts
│   │   └── index.ts
│   ├── contract-management/
│   │   ├── ui/
│   │   │   ├── ContractsTable.vue
│   │   │   ├── ContractsStats.vue
│   │   │   └── ContractForm.vue
│   │   ├── model/
│   │   │   └── useContractsStore.ts
│   │   ├── api/
│   │   │   └── supabaseContractRepository.ts
│   │   └── index.ts
│   └── auth-login/
│       ├── model/
│       │   └── useAuth.ts
│       └── index.ts
│
├── entities/
│   ├── guest/
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── index.ts
│   ├── contract/
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── index.ts
│   ├── photo/
│   │   ├── ui/
│   │   │   ├── PhotoCard.vue
│   │   │   ├── VideoCard.vue
│   │   │   └── MediaCard.vue
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── index.ts
│   ├── comment/
│   │   ├── ui/
│   │   │   └── CommentItem.vue
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── index.ts
│   └── user/
│       ├── model/
│       │   └── types.ts
│       └── index.ts
│
└── shared/
    ├── ui/
    │   ├── BaseButton.vue
    │   ├── BaseInput.vue
    │   ├── BaseModal.vue
    │   ├── LoadingSpinner.vue
    │   ├── ProgressBar.vue
    │   ├── StatsCard.vue
    │   ├── FeatureGate.vue
    │   ├── NotificationContainer.vue
    │   ├── PixModal.vue
    │   └── index.ts
    ├── lib/
    │   └── supabase.ts
    ├── api/
    │   ├── apiService.ts
    │   ├── tenantService.ts
    │   ├── repositoryFactory.ts
    │   └── index.ts
    ├── config/
    │   ├── tenant.ts
    │   └── index.ts
    ├── types/
    │   └── index.ts
    └── utils/
        ├── useNotification.ts
        ├── useTenantContext.ts
        ├── useTheme.ts
        └── index.ts
```

---

## 8. Regras de Dependência

### Fluxo de Importação (Bottom-Up)

```
app/      → Pode importar: pages, widgets, features, entities, shared
pages/    → Pode importar: widgets, features, entities, shared
widgets/  → Pode importar: features, entities, shared
features/ → Pode importar: entities, shared (NÃO outras features)
entities/ → Pode importar: shared (NÃO outras entities, NÃO features)
shared/   → Pode importar: NADA (autocontido)
```

### Importações PROIBIDAS

```
shared/   importando de → app, pages, widgets, features, entities
entities/ importando de → features, widgets, pages, app
features/ importando de → OUTRAS features, widgets, pages, app
widgets/  importando de → pages, app
pages/    importando de → app
```

### Exemplos

```typescript
// VÁLIDO
// pages/admin-guests/ui/AdminGuestsPage.vue
import { GuestDashboard } from '@/widgets/guest-dashboard'
import { useGuestsStore } from '@/features/guest-management'
import { Guest } from '@/entities/guest'
import { BaseButton } from '@/shared/ui'

// VÁLIDO
// features/guest-management/ui/GuestsTable.vue
import { Guest } from '@/entities/guest'
import { BaseButton } from '@/shared/ui'

// INVÁLIDO
// features/guest-management/model/useGuestsStore.ts
import { useRsvpStore } from '@/features/rsvp-confirmation'  // Features NÃO importam features!

// INVÁLIDO
// entities/guest/model/types.ts
import { useNotification } from '@/features/notification'  // Entities NÃO importam features!
```

### Comunicação entre Features (quando necessário)

```typescript
// Opção 1: Extrair para Entity (preferível)
// Ambas features importam da mesma entity
import { photoRepository } from '@/entities/photo'

// Opção 2: Extrair para Shared
import { apiClient } from '@/shared/api'

// Opção 3: EventBus (avançado, apenas se necessário)
import { eventBus } from '@/shared/utils/eventBus'
eventBus.emit('photo:approved', photoId)
```

---

## 9. Contratos de API Pública

Cada slice exporta APENAS o necessário via `index.ts`:

```typescript
// features/guest-management/index.ts
export { default as GuestsTable } from './ui/GuestsTable.vue'
export { default as GuestsStats } from './ui/GuestsStats.vue'
export { default as CheckinsList } from './ui/CheckinsList.vue'
export { useGuestsStore } from './model/useGuestsStore'

// entities/photo/index.ts
export { default as PhotoCard } from './ui/PhotoCard.vue'
export { default as VideoCard } from './ui/VideoCard.vue'
export { default as MediaCard } from './ui/MediaCard.vue'
export type { Photo, MediaType, PhotoStats, PhotoUploadData } from './model/types'

// shared/ui/index.ts
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseInput } from './BaseInput.vue'
export { default as BaseModal } from './BaseModal.vue'
export { default as LoadingSpinner } from './LoadingSpinner.vue'
export { default as ProgressBar } from './ProgressBar.vue'
export { default as StatsCard } from './StatsCard.vue'
export { default as FeatureGate } from './FeatureGate.vue'

// pages/admin-guests/index.ts
export { default as AdminGuestsPage } from './ui/AdminGuestsPage.vue'
```

**REGRA IMPORTANTE:** Sempre importar da API pública (index.ts), nunca do arquivo interno:
```typescript
// CORRETO
import { GuestsTable } from '@/features/guest-management'

// ERRADO
import GuestsTable from '@/features/guest-management/ui/GuestsTable.vue'
```

---

## 10. Fases da Migração

### Fase 0: Preparação
> **Objetivo:** Preparar estrutura FSD sem quebrar o código existente

**Tarefas:**
1. Criar estrutura de diretórios FSD (vazios)
2. Atualizar `tsconfig.json` com path aliases
3. Atualizar `vite.config.ts` com aliases
4. Documentar plano de migração (este documento)

**Risco:** Baixo | **Entregável:** Estrutura vazia criada

---

### Fase 1: Shared Layer
> **Objetivo:** Migrar código genérico sem lógica de negócio

**Tarefas:**
1. **UI Kit:** Mover `core/components/*` → `shared/ui/`
2. **Supabase:** Mover `services/supabase.ts` → `shared/lib/supabase.ts`
3. **API:** Mover `services/api.service.ts` → `shared/api/apiService.ts`
4. **Factories:** Mover `core/factories/repositoryFactory.ts` → `shared/api/`
5. **Config:** Mover `config/tenant.ts` → `shared/config/tenant.ts`
6. **Types:** Mover `core/types/*` → `shared/types/`
7. **Utils:** Mover composables core → `shared/utils/`
8. **Deletar duplicatas** em `src/components/common/` e `modules/admin/presentation/components/common/`
9. **Atualizar imports** em todo o codebase

**Risco:** Baixo | **Validação:** `npm run build` sem erros

---

### Fase 2: Entities Layer
> **Objetivo:** Extrair modelos de domínio e UI de entidade

**Tarefas:**
1. **guest:** Unificar `Guest` + `RsvpGuest` em `entities/guest/model/types.ts`
2. **contract:** Mover `Contract`, `ContractStats` → `entities/contract/model/types.ts`
3. **photo:** Mover `Photo`, `MediaType`, etc. + `PhotoCard.vue`, `VideoCard.vue`, `MediaCard.vue`
4. **comment:** Mover `PhotoComment` + `CommentItem.vue`
5. **user:** Mover tipos de auth → `entities/user/model/types.ts`
6. Criar `index.ts` público para cada entidade
7. Atualizar imports

**Risco:** Médio (deve unificar Guest + RsvpGuest sem quebrar) | **Validação:** `npm run build`

---

### Fase 3: Features Layer (MAIOR FASE)
> **Objetivo:** Extrair feature slices com lógica de negócio

**Ordem de migração (menos dependências primeiro):**

1. **auth-login** — `useAuth.ts` apenas
2. **contract-management** — Components + Store + Repository
3. **guest-management** — Components + Store + Repository
4. **rsvp-confirmation** — Components + Store + Repository + QR service
5. **guest-checkin** — Components + `useAuthPin` + checkin API
6. **photo-upload** — Components + Composables + Services (compressor, storage)
7. **photo-interactions** — Components + `usePhotoRealtime` + lógica de like/comment extraída
8. **photo-moderation** — Component + lógica de aprovação extraída

**Decisão crítica:** O `usePhotosStore` atual será DIVIDIDO entre:
- `entities/photo/` → CRUD básico
- `features/photo-interactions/model/` → Lógica de like/comment
- `features/photo-moderation/model/` → Lógica de aprovação

**Risco:** Alto (contém stores e lógica de negócio) | **Validação:** Cada feature testada após migração

---

### Fase 4: Widgets Layer
> **Objetivo:** Criar widgets compostos que combinam features

**Tarefas:**
1. Mover `AdminLayout.vue` → `widgets/admin-layout/`
2. Mover `PhotoFeed.vue` → `widgets/photo-feed/`
3. **CRIAR** `GuestDashboard.vue` (compõe GuestsStats + GuestsTable + CheckinsList)
4. **CRIAR** `ContractDashboard.vue` (compõe ContractsStats + ContractsTable + ContractForm)
5. **CRIAR** `CheckinDashboard.vue` (compõe QRScanner + PinAuth + CheckinStats)

**Risco:** Baixo (composição, sem lógica nova) | **Validação:** Widgets renderizam corretamente

---

### Fase 5: Pages Layer
> **Objetivo:** Converter views em composições de página

**Tarefas:**
1. Mover todas as views para `pages/{slug}/ui/{Name}Page.vue`
2. Criar `index.ts` público para cada página
3. Atualizar router com novos imports
4. Simplificar páginas para serem apenas composições de widgets/features

**Risco:** Baixo | **Validação:** Todas as rotas funcionam

---

### Fase 6: App Layer
> **Objetivo:** Organizar inicialização da aplicação

**Tarefas:**
1. Mover `main.ts` → `app/index.ts`
2. Mover `App.vue` → `app/App.vue`
3. Mover `router/index.ts` → `app/providers/router.ts`
4. Mover `core/tenant/tenantResolver.ts` → `app/providers/tenant.ts`
5. Mover assets e estilos
6. Atualizar `index.html` para referenciar `app/index.ts`

**Risco:** Baixo | **Validação:** App inicia corretamente

---

### Fase 7: Cleanup
> **Objetivo:** Remover estrutura antiga, finalizar migração

**Tarefas:**
1. Deletar `src/modules/`, `src/core/`, `src/components/`, `src/services/`, `src/views/`, `src/config/`
2. Atualizar documentação
3. Build final de produção
4. Teste de regressão completo

**Risco:** Baixo | **Validação:** `npm run build` + teste manual completo

---

## 11. Decisões e Justificativas

### Por que dividir o usePhotosStore?
O store atual (`usePhotosStore`) mistura responsabilidades:
- Operações CRUD → Deve ficar na **entity photo** ou no **feature** que a usa
- Like/comment → Deve ficar no **feature photo-interactions**
- Approval → Deve ficar no **feature photo-moderation**

**No FSD, cada feature tem sua própria lógica isolada.** Stores monolíticos violam o princípio de isolamento.

### Por que criar widgets quando features existem?
Widgets são **composições de UI** que combinam múltiplas features/entities em um bloco reutilizável:
- `GuestDashboard` combina `GuestsStats` + `GuestsTable` + `CheckinsList`
- Evita duplicação entre páginas
- Páginas ficam mais limpas (apenas composição)

### Por que mover core/ para app/ e shared/?
O `core/` atual mistura:
- **Inicialização** (tenant resolver) → `app/providers/` (é lógica de bootstrap)
- **Utilitários genéricos** (notification, theme) → `shared/utils/` (sem lógica de negócio)
- **Componentes genéricos** (BaseButton) → `shared/ui/` (UI kit)

O FSD exige separação clara entre camadas.

### Por que não usar layer processes?
Decisão do usuário. A layer processes é para workflows complexos cross-feature (ex: checkout flow com carrinho + pagamento + notificação). O projeto atual não tem essa necessidade.

### Fronteira Entity vs Feature
- **Entity:** Representação de um objeto de domínio (ex: `PhotoCard` exibe uma foto)
- **Feature:** Ação do usuário (ex: `PhotoUpload` permite enviar fotos)

**Regra:** Se é um "o que" → entity. Se é um "fazer algo" → feature.

---

## Timeline Estimada

| Fase | Duração | Risco |
|------|---------|-------|
| Fase 0: Preparação | 1 dia | Baixo |
| Fase 1: Shared Layer | 2-3 dias | Baixo |
| Fase 2: Entities Layer | 2-3 dias | Médio |
| Fase 3: Features Layer | 5-7 dias | Alto |
| Fase 4: Widgets Layer | 2-3 dias | Baixo |
| Fase 5: Pages Layer | 1-2 dias | Baixo |
| Fase 6: App Layer | 1 dia | Baixo |
| Fase 7: Cleanup | 1-2 dias | Baixo |
| **Total** | **~15-22 dias** | |
