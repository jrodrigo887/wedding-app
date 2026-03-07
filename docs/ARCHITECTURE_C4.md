# Documentação de Arquitetura C4 - Wedding Gift List Platform

> **Versão:** 1.0
> **Data:** 2026-02-04
> **Objetivo:** Documentação da arquitetura para servir de base para construção do banco de dados

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [C4 Model](#2-c4-model)
   - [Level 1: System Context](#21-level-1-system-context)
   - [Level 2: Container Diagram](#22-level-2-container-diagram)
   - [Level 3: Component Diagram](#23-level-3-component-diagram)
   - [Level 4: Code Level](#24-level-4-code-level)
3. [Domain-Driven Design](#3-domain-driven-design)
   - [Domínio Principal](#31-domínio-principal)
   - [Subdomínios](#32-subdomínios)
   - [Bounded Contexts](#33-bounded-contexts)
   - [Context Map](#34-context-map)
4. [Modelagem de Domínio](#4-modelagem-de-domínio)
   - [Entidades e Aggregates](#41-entidades-e-aggregates)
   - [Value Objects](#42-value-objects)
   - [Domain Events](#43-domain-events)
5. [Modelo de Dados (Database Schema)](#5-modelo-de-dados-database-schema)
6. [Glossário Ubiquitous Language](#6-glossário-ubiquitous-language)

---

## 1. Visão Geral do Sistema

### 1.1 Descrição

A **Wedding Gift List Platform** é uma plataforma multi-tenant para gestão de casamentos que oferece:

- **Gestão de Convidados**: Cadastro, confirmação de presença (RSVP) e check-in no evento
- **Galeria de Fotos**: Upload, moderação e compartilhamento de fotos/vídeos pelos convidados
- **Gestão de Contratos**: Controle de fornecedores e pagamentos
- **Dashboard Administrativo**: Estatísticas e controle geral do evento

### 1.2 Stakeholders

| Stakeholder         | Descrição               | Interesse                    |
| ------------------- | ----------------------- | ---------------------------- |
| **Noivos**          | Proprietários do evento | Gestão completa do casamento |
| **Convidados**      | Participantes do evento | RSVP, check-in, fotos        |
| **Fornecedores**    | Prestadores de serviço  | Contratos e pagamentos       |
| **Administradores** | Gestores da plataforma  | Multi-tenancy, configurações |

### 1.3 Características Multi-Tenant

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATFORM LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Tenant A   │  │  Tenant B   │  │  Tenant C   │   ...   │
│  │ (Casamento  │  │ (Casamento  │  │ (Casamento  │         │
│  │   João)     │  │   Maria)    │  │   Pedro)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

**Estratégias de Resolução de Tenant:**

- Subdomain: `joao-maria.weddingapp.com`
- Path: `weddingapp.com/joao-maria`
- Query Parameter: `weddingapp.com?tenant=joao-maria`
- Custom Domain: `casamentojoaomaria.com`

---

## 2. C4 Model

### 2.1 Level 1: System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM CONTEXT                              │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   Noivos    │
                              │  (Admin)    │
                              └──────┬──────┘
                                     │ Gerencia evento
                                     ▼
┌─────────────┐            ┌─────────────────────┐           ┌─────────────┐
│ Convidados  │◄──────────►│   Wedding Gift      │◄─────────►│ Fornecedores│
│             │  RSVP/     │   List Platform     │  Contratos │             │
│             │  Fotos     │                     │           │             │
└─────────────┘            └──────────┬──────────┘           └─────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
           ┌───────────────┐  ┌─────────────┐  ┌─────────────────┐
           │   Supabase    │  │   Google    │  │   Email API     │
           │  (Database/   │  │   Sheets    │  │  (Notificações) │
           │   Storage)    │  │  (Backup)   │  │                 │
           └───────────────┘  └─────────────┘  └─────────────────┘
```

#### Atores Externos

| Sistema Externo   | Propósito                                       | Protocolo           |
| ----------------- | ----------------------------------------------- | ------------------- |
| **Supabase**      | Banco de dados PostgreSQL + Storage de arquivos | REST/WebSocket      |
| **Google Sheets** | Backup de confirmações e check-ins              | HTTPS (Apps Script) |
| **Email API**     | Envio de QR Codes e notificações                | HTTPS               |

---

### 2.2 Level 2: Container Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONTAINER DIAGRAM                               │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │            Vue 3 SPA [Browser]          │
                    │                                         │
                    │  ┌───────────┐ ┌───────────┐           │
                    │  │  Router   │ │   Pinia   │           │
                    │  │(Vue Router)│ │  Stores   │           │
                    │  └───────────┘ └───────────┘           │
                    │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │         Domain Modules          │   │
                    │  │  ┌───────┐ ┌──────┐ ┌───────┐  │   │
                    │  │  │ Admin │ │ RSVP │ │ Photos│  │   │
                    │  │  └───────┘ └──────┘ └───────┘  │   │
                    │  └─────────────────────────────────┘   │
                    │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │           Core Layer            │   │
                    │  │  ┌────────┐ ┌────────┐         │   │
                    │  │  │ Tenant │ │Factories│         │   │
                    │  │  └────────┘ └────────┘         │   │
                    │  └─────────────────────────────────┘   │
                    └────────────────────┬────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
              ▼                          ▼                          ▼
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │    Supabase     │       │    Supabase     │       │   Google Apps   │
    │    Database     │       │    Storage      │       │     Script      │
    │   (PostgreSQL)  │       │  (S3-like)      │       │    (Webhook)    │
    └─────────────────┘       └─────────────────┘       └─────────────────┘
```

#### Containers

| Container              | Tecnologia                | Responsabilidade          |
| ---------------------- | ------------------------- | ------------------------- |
| **Vue 3 SPA**          | Vue 3 + TypeScript + Vite | Interface do usuário      |
| **Pinia Stores**       | Pinia                     | Gerenciamento de estado   |
| **Domain Modules**     | TypeScript                | Lógica de domínio         |
| **Supabase Database**  | PostgreSQL                | Persistência de dados     |
| **Supabase Storage**   | S3-compatible             | Armazenamento de arquivos |
| **Google Apps Script** | JavaScript                | Sincronização de backup   |

---

### 2.3 Level 3: Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              COMPONENT DIAGRAM                                 │
└───────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   MODULES                                        │
│                                                                                  │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────────┐  │
│  │     ADMIN MODULE       │  │      RSVP MODULE       │  │   PHOTOS MODULE  │  │
│  │                        │  │                        │  │                  │  │
│  │ ┌────────────────────┐ │  │ ┌────────────────────┐ │  │ ┌──────────────┐ │  │
│  │ │    Presentation    │ │  │ │    Presentation    │ │  │ │ Presentation │ │  │
│  │ │ ┌────────────────┐ │ │  │ │ ┌────────────────┐ │ │  │ │ ┌──────────┐ │ │  │
│  │ │ │  Views/Comps   │ │ │  │ │ │  Views/Comps   │ │ │  │ │ │Views/Comp│ │ │  │
│  │ │ └────────────────┘ │ │  │ │ └────────────────┘ │ │  │ │ └──────────┘ │ │  │
│  │ └────────────────────┘ │  │ └────────────────────┘ │  │ └──────────────┘ │  │
│  │                        │  │                        │  │                  │  │
│  │ ┌────────────────────┐ │  │ ┌────────────────────┐ │  │ ┌──────────────┐ │  │
│  │ │   Infrastructure   │ │  │ │   Infrastructure   │ │  │ │Infrastructure│ │  │
│  │ │ ┌────────────────┐ │ │  │ │ ┌────────────────┐ │ │  │ │ ┌──────────┐ │ │  │
│  │ │ │  Repositories  │ │ │  │ │ │  Repositories  │ │ │  │ │ │  Repos   │ │ │  │
│  │ │ │    Stores      │ │ │  │ │ │    Stores      │ │ │  │ │ │  Stores  │ │ │  │
│  │ │ └────────────────┘ │ │  │ │ │  Composables   │ │ │  │ │ │ Services │ │ │  │
│  │ └────────────────────┘ │  │ │ └────────────────┘ │ │  │ │ └──────────┘ │ │  │
│  │                        │  │ └────────────────────┘ │  │ └──────────────┘ │  │
│  │ ┌────────────────────┐ │  │                        │  │                  │  │
│  │ │      Domain       │ │  │ ┌────────────────────┐ │  │ ┌──────────────┐ │  │
│  │ │ ┌────────────────┐ │ │  │ │      Domain       │ │  │ │    Domain    │ │  │
│  │ │ │   Entities     │ │ │  │ │ ┌────────────────┐ │ │  │ │ ┌──────────┐ │ │  │
│  │ │ │  Interfaces    │ │ │  │ │ │   Entities     │ │ │  │ │ │ Entities │ │ │  │
│  │ │ └────────────────┘ │ │  │ │ │  Interfaces    │ │ │  │ │ │Interfaces│ │ │  │
│  │ └────────────────────┘ │  │ │ └────────────────┘ │ │  │ │ └──────────┘ │ │  │
│  │                        │  │ └────────────────────┘ │  │ └──────────────┘ │  │
│  └────────────────────────┘  └────────────────────────┘  └──────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                               CORE LAYER                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │    Tenant    │  │   Factories  │  │  Components  │  │    Types     │  │  │
│  │  │   Resolver   │  │   (Repos)    │  │  (Base UI)   │  │   (Common)   │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                              AUTH MODULE                                  │  │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                      │  │
│  │  │     Composables      │  │       Guards         │                      │  │
│  │  │     (useAuth)        │  │    (authGuard)       │                      │  │
│  │  └──────────────────────┘  └──────────────────────┘                      │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.4 Level 4: Code Level

#### Admin Module - Estrutura de Código

```
src/modules/admin/
├── domain/
│   ├── entities.ts          # Guest, Contract, Stats
│   └── interfaces.ts        # IGuestRepository, IContractRepository
├── infrastructure/
│   ├── repositories/
│   │   ├── GuestRepository.ts       # Interface adapter
│   │   ├── ContractRepository.ts    # Interface adapter
│   │   └── supabase/
│   │       ├── GuestRepository.ts   # Supabase implementation
│   │       └── ContractRepository.ts
│   └── stores/
│       ├── useGuestsStore.ts        # Pinia store
│       └── useContractsStore.ts
└── presentation/
    ├── components/
    │   ├── common/                   # BaseButton, BaseModal, etc.
    │   ├── guests/                   # GuestsTable, GuestsStats
    │   └── contracts/                # ContractForm, ContractsTable
    ├── layouts/
    │   └── AdminLayout.vue
    └── views/
        ├── DashboardView.vue
        ├── GuestsView.vue
        └── ContractsView.vue
```

---

## 3. Domain-Driven Design

### 3.1 Domínio Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CORE DOMAIN                                      │
│                                                                          │
│                    Wedding Event Management                              │
│                                                                          │
│   "Gerenciar todos os aspectos de um evento de casamento, incluindo     │
│    convidados, confirmações, check-in, galeria de fotos e contratos     │
│    com fornecedores."                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

O **domínio principal** é a **Gestão de Eventos de Casamento**, que orquestra todos os subdomínios.

---

### 3.2 Subdomínios

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SUBDOMAINS                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                    CORE SUBDOMAIN: Guest Management                     │   │
│   │                                                                          │   │
│   │  Responsabilidade: Gerenciar ciclo de vida completo do convidado        │   │
│   │  - Cadastro de convidados                                                │   │
│   │  - Confirmação de presença (RSVP)                                        │   │
│   │  - Check-in no evento                                                    │   │
│   │  - Estatísticas de participação                                          │   │
│   │                                                                          │   │
│   │  Complexidade: ALTA (regras de negócio críticas)                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│   ┌────────────────────────────────┐  ┌────────────────────────────────────┐   │
│   │  SUPPORTING SUBDOMAIN:         │  │  SUPPORTING SUBDOMAIN:             │   │
│   │  Photo Gallery                 │  │  Contract Management               │   │
│   │                                │  │                                    │   │
│   │  - Upload de fotos/vídeos      │  │  - Cadastro de fornecedores       │   │
│   │  - Moderação de conteúdo       │  │  - Controle de pagamentos          │   │
│   │  - Likes e comentários         │  │  - Relatórios financeiros          │   │
│   │  - Download em lote            │  │                                    │   │
│   │                                │  │  Complexidade: MÉDIA               │   │
│   │  Complexidade: MÉDIA           │  └────────────────────────────────────┘   │
│   └────────────────────────────────┘                                            │
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                    GENERIC SUBDOMAIN: Platform                          │   │
│   │                                                                          │   │
│   │  - Multi-tenancy                                                         │   │
│   │  - Autenticação/Autorização                                              │   │
│   │  - Temas e customização                                                  │   │
│   │  - Notificações                                                          │   │
│   │                                                                          │   │
│   │  Complexidade: BAIXA (infraestrutura padrão)                             │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Classificação dos Subdomínios

| Subdomínio                 | Tipo       | Complexidade | Descrição                                           |
| -------------------------- | ---------- | ------------ | --------------------------------------------------- |
| **Guest Management**       | Core       | Alta         | Diferencial competitivo - regras de RSVP e check-in |
| **Photo Gallery**          | Supporting | Média        | Agrega valor mas não é diferencial                  |
| **Contract Management**    | Supporting | Média        | Funcionalidade auxiliar                             |
| **Platform (Auth/Tenant)** | Generic    | Baixa        | Infraestrutura comum                                |

---

### 3.3 Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            BOUNDED CONTEXTS                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────────┐
  │                                                                            │
  │   ┌─────────────────────┐           ┌─────────────────────┐              │
  │   │   ADMIN CONTEXT     │           │    RSVP CONTEXT     │              │
  │   │                     │           │                     │              │
  │   │ • Guest (Full)      │◄────────►│ • RsvpGuest (View)  │              │
  │   │ • GuestStats        │  Shared   │ • RsvpStats         │              │
  │   │ • Contract          │  Kernel   │ • CheckinResponse   │              │
  │   │ • ContractStats     │           │                     │              │
  │   │                     │           │                     │              │
  │   │ Linguagem:          │           │ Linguagem:          │              │
  │   │ - Convidado         │           │ - Confirmação       │              │
  │   │ - Fornecedor        │           │ - Presença          │              │
  │   │ - Contrato          │           │ - Check-in          │              │
  │   └─────────────────────┘           └─────────────────────┘              │
  │            │                                   │                          │
  │            │                                   │                          │
  │            ▼                                   ▼                          │
  │   ┌─────────────────────┐           ┌─────────────────────┐              │
  │   │   PHOTOS CONTEXT    │           │    AUTH CONTEXT     │              │
  │   │                     │           │                     │              │
  │   │ • Photo             │           │ • User              │              │
  │   │ • PhotoLike         │           │ • Session           │              │
  │   │ • PhotoComment      │           │ • AuthState         │              │
  │   │ • PhotoStats        │           │                     │              │
  │   │                     │           │ Linguagem:          │              │
  │   │ Linguagem:          │           │ - Autenticação      │              │
  │   │ - Foto/Mídia        │           │ - Sessão            │              │
  │   │ - Aprovação         │           │ - Permissão         │              │
  │   │ - Comentário        │           └─────────────────────┘              │
  │   │ - Curtida           │                                                │
  │   └─────────────────────┘                                                │
  │                                                                            │
  └───────────────────────────────────────────────────────────────────────────┘
```

#### Detalhamento dos Bounded Contexts

| Bounded Context    | Responsabilidade                                | Entidades Principais                                |
| ------------------ | ----------------------------------------------- | --------------------------------------------------- |
| **Admin Context**  | Gestão administrativa de convidados e contratos | Guest, Contract, GuestStats, ContractStats          |
| **RSVP Context**   | Confirmação de presença e check-in público      | RsvpGuest, ConfirmPresenceResponse, CheckinResponse |
| **Photos Context** | Galeria de fotos e interações sociais           | Photo, PhotoLike, PhotoComment, PhotoStats          |
| **Auth Context**   | Autenticação e autorização                      | User, Session, AuthState                            |

---

### 3.4 Context Map

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               CONTEXT MAP                                        │
└─────────────────────────────────────────────────────────────────────────────────┘


                          ┌─────────────────────────────┐
                          │      ADMIN CONTEXT          │
                          │        (UPSTREAM)           │
                          │                             │
                          │    [Guest Aggregate]        │
                          │    [Contract Aggregate]     │
                          └──────────┬──────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    │ Customer/      │ Shared         │ Published
                    │ Supplier       │ Kernel         │ Language
                    │                │                │
                    ▼                ▼                ▼
        ┌───────────────────┐ ┌─────────────────┐ ┌───────────────────┐
        │   RSVP CONTEXT    │ │  AUTH CONTEXT   │ │  PHOTOS CONTEXT   │
        │   (DOWNSTREAM)    │ │  (DOWNSTREAM)   │ │   (DOWNSTREAM)    │
        │                   │ │                 │ │                   │
        │ [RsvpGuest View]  │ │ [User]          │ │ [Photo Aggregate] │
        │ [Checkin]         │ │ [Session]       │ │ [Like/Comment]    │
        └───────────────────┘ └─────────────────┘ └───────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                           RELATIONSHIP PATTERNS                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐         ┌─────────────────┐
  │  ADMIN CONTEXT  │────────►│  RSVP CONTEXT   │
  │                 │   SK    │                 │
  └─────────────────┘         └─────────────────┘
         │
         │ C/S
         ▼
  ┌─────────────────┐         ┌─────────────────┐
  │ PHOTOS CONTEXT  │◄────────│  AUTH CONTEXT   │
  │                 │   ACL   │                 │
  └─────────────────┘         └─────────────────┘

  LEGENDA:
  ─────────
  SK  = Shared Kernel (compartilham modelo de Guest/código)
  C/S = Customer/Supplier (Admin fornece dados, Photos consome)
  ACL = Anti-Corruption Layer (Auth traduz modelo de usuário)
  PL  = Published Language (interface pública entre contexts)
```

#### Padrões de Relacionamento

| Upstream | Downstream | Padrão                | Descrição                                                |
| -------- | ---------- | --------------------- | -------------------------------------------------------- |
| Admin    | RSVP       | **Shared Kernel**     | Compartilham o conceito de `Guest` e `codigo_convidado`  |
| Admin    | Photos     | **Customer/Supplier** | Photos consome dados de convidados para identificação    |
| Auth     | Admin      | **Conformist**        | Admin se adapta ao modelo de autenticação do Supabase    |
| Auth     | Photos     | **ACL**               | Photos traduz `codigo_convidado` para contexto de upload |

#### Shared Kernel: Guest Identity

```typescript
// Compartilhado entre Admin, RSVP e Photos
interface SharedGuestIdentity {
  codigo: string; // Identificador único do convidado
  nome: string; // Nome para exibição
}

// Admin Context - entidade completa
interface Guest extends SharedGuestIdentity {
  id: number;
  parceiro?: string;
  email?: string;
  telefone?: string;
  acompanhantes: number;
  confirmado: boolean;
  checkin: boolean;
  // ... campos administrativos
}

// RSVP Context - view pública
interface RsvpGuest extends SharedGuestIdentity {
  confirmado: boolean;
  data_confirmacao?: string;
}

// Photos Context - referência mínima
interface PhotoUploadIdentity extends SharedGuestIdentity {
  // apenas codigo e nome para identificar autor
}
```

---

## 4. Modelagem de Domínio

### 4.1 Entidades e Aggregates

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AGGREGATES E ENTIDADES                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN CONTEXT                                       │
│                                                                                  │
│   ┌────────────────────────────────────────┐                                    │
│   │         <<AGGREGATE ROOT>>             │                                    │
│   │              Guest                     │                                    │
│   │                                        │                                    │
│   │  - id: number (PK)                     │                                    │
│   │  - tenant_id: string (FK)              │                                    │
│   │  - codigo: string (UK)                 │                                    │
│   │  - nome: string                        │                                    │
│   │  - parceiro?: string                   │                                    │
│   │  - email?: string                      │                                    │
│   │  - telefone?: string                   │                                    │
│   │  - acompanhantes: number               │                                    │
│   │  - confirmado: boolean                 │                                    │
│   │  - data_confirmacao?: timestamp        │                                    │
│   │  - checkin: boolean                    │                                    │
│   │  - checkin?: boolean        │                                    │
│   │  - horario_entrada?: timestamp         │                                    │
│   │  - observacoes?: text                  │                                    │
│   │  - created_at: timestamp               │                                    │
│   │  - updated_at: timestamp               │                                    │
│   └────────────────────────────────────────┘                                    │
│                                                                                  │
│   ┌────────────────────────────────────────┐                                    │
│   │         <<AGGREGATE ROOT>>             │                                    │
│   │             Contract                   │                                    │
│   │                                        │                                    │
│   │  - id: number (PK)                     │                                    │
│   │  - tenant_id: string (FK)              │                                    │
│   │  - responsavel: string                 │                                    │
│   │  - empresa: string                     │                                    │
│   │  - contato?: string                    │                                    │
│   │  - valor: decimal                      │                                    │
│   │  - pago: decimal                       │                                    │
│   │  - created_at: timestamp               │                                    │
│   │  - updated_at: timestamp               │                                    │
│   └────────────────────────────────────────┘                                    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PHOTOS CONTEXT                                      │
│                                                                                  │
│   ┌────────────────────────────────────────┐                                    │
│   │         <<AGGREGATE ROOT>>             │                                    │
│   │               Photo                    │                                    │
│   │                                        │                                    │
│   │  - id: number (PK)                     │                                    │
│   │  - tenant_id: string (FK)              │                                    │
│   │  - codigo_convidado: string            │       ┌──────────────────────┐    │
│   │  - nome_convidado: string              │       │    <<ENTITY>>        │    │
│   │  - storage_path: string                │       │    PhotoLike         │    │
│   │  - thumbnail_path?: string             │       │                      │    │
│   │  - original_filename?: string          │◄──────│ - id: number (PK)    │    │
│   │  - file_size?: number                  │       │ - foto_id: number(FK)│    │
│   │  - mime_type?: string                  │       │ - codigo_convidado   │    │
│   │  - caption?: text                      │       │ - created_at         │    │
│   │  - aprovado: boolean                   │       └──────────────────────┘    │
│   │  - media_type: enum('photo','video')   │                                    │
│   │  - duration?: number (seconds)         │       ┌──────────────────────┐    │
│   │  - poster_path?: string                │       │    <<ENTITY>>        │    │
│   │  - created_at: timestamp               │       │   PhotoComment       │    │
│   │  - updated_at: timestamp               │       │                      │    │
│   │                                        │◄──────│ - id: number (PK)    │    │
│   │  Invariantes:                          │       │ - foto_id: number(FK)│    │
│   │  - duration <= 60 (para vídeos)        │       │ - codigo_convidado   │    │
│   │  - Max 20 fotos por convidado          │       │ - nome_convidado     │    │
│   │  - Max 5 vídeos por convidado          │       │ - texto: text        │    │
│   └────────────────────────────────────────┘       │ - created_at         │    │
│                                                     └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Value Objects

```typescript
// Value Object: GuestCode
class GuestCode {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.length < 3) {
      throw new Error('Código do convidado inválido');
    }
    this.value = value.toUpperCase();
  }

  equals(other: GuestCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Value Object: MediaType
type MediaType = 'photo' | 'video';

// Value Object: PresenceStatus
interface PresenceStatus {
  confirmado: boolean;
  data_confirmacao?: Date;
}

// Value Object: CheckinStatus
interface CheckinStatus {
  checkin: boolean;
  checkin?: boolean;
  horario_entrada?: Date;
}

// Value Object: PaymentStatus
interface PaymentStatus {
  valor: number;
  pago: number;
  restante: number; // computed: valor - pago
}

// Value Object: PhotoStats
interface PhotoStats {
  total: number;
  approved: number;
  pending: number;
  totalLikes: number;
  totalComments: number;
  totalPhotos: number; // apenas fotos
  totalVideos: number; // apenas vídeos
}

// Value Object: GuestStats
interface GuestStats {
  total: number;
  confirmed: number;
  pending: number; // total - confirmed
  checkedIn: number;
}
```

### 4.3 Domain Events

```typescript
// ===== GUEST EVENTS =====

interface GuestCreatedEvent {
  type: 'GUEST_CREATED';
  payload: {
    guestId: number;
    codigo: string;
    nome: string;
    tenant_id: string;
  };
  timestamp: Date;
}

interface PresenceConfirmedEvent {
  type: 'PRESENCE_CONFIRMED';
  payload: {
    guestId: number;
    codigo: string;
    data_confirmacao: Date;
  };
  timestamp: Date;
}

interface PresenceCancelledEvent {
  type: 'PRESENCE_CANCELLED';
  payload: {
    guestId: number;
    codigo: string;
  };
  timestamp: Date;
}

interface GuestCheckedInEvent {
  type: 'GUEST_CHECKED_IN';
  payload: {
    guestId: number;
    codigo: string;
    horario_entrada: Date;
  };
  timestamp: Date;
}

// ===== PHOTO EVENTS =====

interface PhotoUploadedEvent {
  type: 'PHOTO_UPLOADED';
  payload: {
    photoId: number;
    codigo_convidado: string;
    media_type: MediaType;
    storage_path: string;
  };
  timestamp: Date;
}

interface PhotoApprovedEvent {
  type: 'PHOTO_APPROVED';
  payload: {
    photoId: number;
  };
  timestamp: Date;
}

interface PhotoRejectedEvent {
  type: 'PHOTO_REJECTED';
  payload: {
    photoId: number;
  };
  timestamp: Date;
}

interface PhotoLikedEvent {
  type: 'PHOTO_LIKED';
  payload: {
    photoId: number;
    codigo_convidado: string;
  };
  timestamp: Date;
}

interface PhotoCommentAddedEvent {
  type: 'PHOTO_COMMENT_ADDED';
  payload: {
    photoId: number;
    commentId: number;
    codigo_convidado: string;
    texto: string;
  };
  timestamp: Date;
}

// ===== CONTRACT EVENTS =====

interface ContractCreatedEvent {
  type: 'CONTRACT_CREATED';
  payload: {
    contractId: number;
    empresa: string;
    valor: number;
  };
  timestamp: Date;
}

interface PaymentRegisteredEvent {
  type: 'PAYMENT_REGISTERED';
  payload: {
    contractId: number;
    valor_pago: number;
    total_pago: number;
  };
  timestamp: Date;
}
```

---

## 5. Modelo de Dados (Database Schema)

### 5.1 Diagrama ER

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ENTITY RELATIONSHIP DIAGRAM                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   TENANTS                                        │
│                                                                                  │
│  ┌─────────────────────────┐                                                    │
│  │       tenants           │                                                    │
│  │─────────────────────────│                                                    │
│  │ PK id: uuid             │                                                    │
│  │    name: varchar(100)   │                                                    │
│  │    slug: varchar(50) UK │                                                    │
│  │    config: jsonb        │                                                    │
│  │    features: jsonb      │                                                    │
│  │    created_at: timestamp│                                                    │
│  └─────────────────────────┘                                                    │
│              │                                                                   │
│              │ 1:N                                                               │
│              ▼                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  GUEST CONTEXT                                   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐            │
│  │                         convidados                               │            │
│  │─────────────────────────────────────────────────────────────────│            │
│  │ PK  id: serial                                                   │            │
│  │ FK  tenant_id: uuid                                              │            │
│  │ UK  codigo: varchar(20)                                          │            │
│  │     nome: varchar(100) NOT NULL                                  │            │
│  │     parceiro: varchar(100)                                       │            │
│  │     email: varchar(255)                                          │            │
│  │     telefone: varchar(20)                                        │            │
│  │     acompanhantes: integer DEFAULT 0                             │            │
│  │     confirmado: boolean DEFAULT false                            │            │
│  │     data_confirmacao: timestamp                                  │            │
│  │     checkin: boolean DEFAULT false                               │            │
│  │     checkin: boolean DEFAULT false                    │            │
│  │     horario_entrada: timestamp                                   │            │
│  │     observacoes: text                                            │            │
│  │     created_at: timestamp DEFAULT now()                          │            │
│  │     updated_at: timestamp DEFAULT now()                          │            │
│  │─────────────────────────────────────────────────────────────────│            │
│  │ IDX: (tenant_id, codigo)                                         │            │
│  │ IDX: (tenant_id, confirmado)                                     │            │
│  │ IDX: (tenant_id, checkin)                                        │            │
│  └─────────────────────────────────────────────────────────────────┘            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 PHOTOS CONTEXT                                   │
│                                                                                  │
│  ┌───────────────────────────────────────┐                                      │
│  │              fotos                    │                                      │
│  │───────────────────────────────────────│                                      │
│  │ PK id: serial                         │                                      │
│  │ FK tenant_id: uuid                    │                                      │
│  │    codigo_convidado: varchar(20)      │    ┌──────────────────────────┐     │
│  │    nome_convidado: varchar(100)       │    │      foto_likes          │     │
│  │    storage_path: varchar(500) NOT NULL│    │──────────────────────────│     │
│  │    thumbnail_path: varchar(500)       │    │ PK id: serial            │     │
│  │    original_filename: varchar(255)    │    │ FK foto_id: integer      │◄────┤
│  │    file_size: integer                 │    │    codigo_convidado      │     │
│  │    mime_type: varchar(50)             │    │    created_at: timestamp │     │
│  │    caption: text                      │    │──────────────────────────│     │
│  │    aprovado: boolean DEFAULT false    │    │ UK: (foto_id, codigo_    │     │
│  │    media_type: varchar(10) DEFAULT    │    │     convidado)           │     │
│  │                'photo'                │    └──────────────────────────┘     │
│  │    duration: integer                  │                                      │
│  │    poster_path: varchar(500)          │    ┌──────────────────────────┐     │
│  │    created_at: timestamp DEFAULT now()│    │    foto_comentarios      │     │
│  │    updated_at: timestamp DEFAULT now()│    │──────────────────────────│     │
│  │───────────────────────────────────────│    │ PK id: serial            │     │
│  │ CHECK: media_type IN ('photo','video')│    │ FK foto_id: integer      │◄────┤
│  │ CHECK: duration IS NULL OR            │    │    codigo_convidado      │     │
│  │        duration <= 60                 │    │    nome_convidado        │     │
│  │ IDX: (tenant_id, aprovado)            │    │    texto: text NOT NULL  │     │
│  │ IDX: (tenant_id, codigo_convidado)    │    │    created_at: timestamp │     │
│  │ IDX: (tenant_id, created_at DESC)     │    │──────────────────────────│     │
│  └───────────────────────────────────────┘    │ IDX: (foto_id, created_  │     │
│                                                │      at DESC)            │     │
│                                                └──────────────────────────┘     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               CONTRACT CONTEXT                                   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐            │
│  │                         contratos                                │            │
│  │─────────────────────────────────────────────────────────────────│            │
│  │ PK  id: serial                                                   │            │
│  │ FK  tenant_id: uuid                                              │            │
│  │     responsavel: varchar(100)                                    │            │
│  │     empresa: varchar(200)                                        │            │
│  │     contato: varchar(255)                                        │            │
│  │     valor: decimal(12,2) DEFAULT 0                               │            │
│  │     pago: decimal(12,2) DEFAULT 0                                │            │
│  │     created_at: timestamp DEFAULT now()                          │            │
│  │     updated_at: timestamp DEFAULT now()                          │            │
│  │─────────────────────────────────────────────────────────────────│            │
│  │ CHECK: pago <= valor                                             │            │
│  │ IDX: (tenant_id)                                                 │            │
│  └─────────────────────────────────────────────────────────────────┘            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                AUTH CONTEXT                                      │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐            │
│  │                    (Supabase Auth - Built-in)                    │            │
│  │                                                                  │            │
│  │  auth.users (Supabase managed)                                   │            │
│  │─────────────────────────────────────────────────────────────────│            │
│  │ PK  id: uuid                                                     │            │
│  │     email: varchar                                               │            │
│  │     encrypted_password: varchar                                  │            │
│  │     ...                                                          │            │
│  └─────────────────────────────────────────────────────────────────┘            │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐            │
│  │                      tenant_users                                │            │
│  │─────────────────────────────────────────────────────────────────│            │
│  │ PK  id: serial                                                   │            │
│  │ FK  tenant_id: uuid                                              │            │
│  │ FK  user_id: uuid (auth.users)                                   │            │
│  │     role: varchar(20) DEFAULT 'admin'                            │            │
│  │     created_at: timestamp                                        │            │
│  │─────────────────────────────────────────────────────────────────│            │
│  │ UK: (tenant_id, user_id)                                         │            │
│  │ CHECK: role IN ('owner', 'admin', 'viewer')                      │            │
│  └─────────────────────────────────────────────────────────────────┘            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 SQL DDL

```sql
-- =====================================================
-- WEDDING GIFT LIST PLATFORM - DATABASE SCHEMA
-- =====================================================
-- Baseado na análise C4 e modelagem de domínio
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TENANT CONTEXT (Multi-tenancy)
-- =====================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    config JSONB DEFAULT '{}',
    features JSONB DEFAULT '{
        "photos": true,
        "rsvp": true,
        "contracts": true,
        "checkin": true,
        "pix": false
    }',
    limits JSONB DEFAULT '{
        "maxGuests": 500,
        "maxPhotos": 1000,
        "maxAdmins": 5
    }',
    theme JSONB DEFAULT '{
        "primaryColor": "#4F46E5",
        "secondaryColor": "#10B981"
    }',
    wedding_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant users (admin access)
CREATE TABLE tenant_users (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,  -- Reference to auth.users
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uk_tenant_user UNIQUE (tenant_id, user_id),
    CONSTRAINT chk_role CHECK (role IN ('owner', 'admin', 'viewer'))
);

-- Index for tenant lookup
CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);

-- =====================================================
-- GUEST CONTEXT (Core Domain)
-- =====================================================

CREATE TABLE convidados (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identity (Shared Kernel)
    codigo VARCHAR(20) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    parceiro VARCHAR(100),

    -- Contact
    email VARCHAR(255),
    telefone VARCHAR(20),

    -- Event participation
    acompanhantes INTEGER DEFAULT 0 CHECK (acompanhantes >= 0),

    -- RSVP Status (Value Object: PresenceStatus)
    confirmado BOOLEAN DEFAULT FALSE,
    data_confirmacao TIMESTAMP WITH TIME ZONE,

    -- Check-in Status (Value Object: CheckinStatus)
    checkin BOOLEAN DEFAULT FALSE,
    checkin BOOLEAN DEFAULT FALSE,
    horario_entrada TIMESTAMP WITH TIME ZONE,

    -- Additional info
    observacoes TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT uk_tenant_codigo UNIQUE (tenant_id, codigo)
);

-- Indexes for common queries
CREATE INDEX idx_convidados_tenant ON convidados(tenant_id);
CREATE INDEX idx_convidados_confirmado ON convidados(tenant_id, confirmado);
CREATE INDEX idx_convidados_checkin ON convidados(tenant_id, checkin);
CREATE INDEX idx_convidados_codigo ON convidados(tenant_id, codigo);

-- =====================================================
-- PHOTOS CONTEXT (Supporting Domain)
-- =====================================================

-- Photo Aggregate Root
CREATE TABLE fotos (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Guest reference (Shared Kernel)
    codigo_convidado VARCHAR(20) NOT NULL,
    nome_convidado VARCHAR(100) NOT NULL,

    -- Storage
    storage_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    poster_path VARCHAR(500),  -- For videos
    original_filename VARCHAR(255),

    -- File metadata
    file_size INTEGER,
    mime_type VARCHAR(50),

    -- Media type
    media_type VARCHAR(10) DEFAULT 'photo',
    duration INTEGER,  -- Seconds, for videos only

    -- Content
    caption TEXT,

    -- Moderation
    aprovado BOOLEAN DEFAULT FALSE,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_media_type CHECK (media_type IN ('photo', 'video')),
    CONSTRAINT chk_video_duration CHECK (
        media_type != 'video' OR duration IS NULL OR duration <= 60
    )
);

-- Indexes for photos
CREATE INDEX idx_fotos_tenant ON fotos(tenant_id);
CREATE INDEX idx_fotos_aprovado ON fotos(tenant_id, aprovado);
CREATE INDEX idx_fotos_convidado ON fotos(tenant_id, codigo_convidado);
CREATE INDEX idx_fotos_created ON fotos(tenant_id, created_at DESC);
CREATE INDEX idx_fotos_media_type ON fotos(tenant_id, media_type);

-- Photo Likes (Entity within Photo Aggregate)
CREATE TABLE foto_likes (
    id SERIAL PRIMARY KEY,
    foto_id INTEGER NOT NULL REFERENCES fotos(id) ON DELETE CASCADE,
    codigo_convidado VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One like per guest per photo
    CONSTRAINT uk_foto_like UNIQUE (foto_id, codigo_convidado)
);

CREATE INDEX idx_foto_likes_foto ON foto_likes(foto_id);

-- Photo Comments (Entity within Photo Aggregate)
CREATE TABLE foto_comentarios (
    id SERIAL PRIMARY KEY,
    foto_id INTEGER NOT NULL REFERENCES fotos(id) ON DELETE CASCADE,
    codigo_convidado VARCHAR(20) NOT NULL,
    nome_convidado VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_texto_not_empty CHECK (LENGTH(TRIM(texto)) > 0)
);

CREATE INDEX idx_foto_comentarios_foto ON foto_comentarios(foto_id);
CREATE INDEX idx_foto_comentarios_created ON foto_comentarios(foto_id, created_at DESC);

-- =====================================================
-- CONTRACT CONTEXT (Supporting Domain)
-- =====================================================

CREATE TABLE contratos (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Vendor info
    responsavel VARCHAR(100),
    empresa VARCHAR(200),
    contato VARCHAR(255),

    -- Payment (Value Object: PaymentStatus)
    valor DECIMAL(12, 2) DEFAULT 0,
    pago DECIMAL(12, 2) DEFAULT 0,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_valor_positivo CHECK (valor >= 0),
    CONSTRAINT chk_pago_positivo CHECK (pago >= 0),
    CONSTRAINT chk_pago_menor_valor CHECK (pago <= valor)
);

CREATE INDEX idx_contratos_tenant ON contratos(tenant_id);

-- =====================================================
-- VIEWS (Computed/Aggregated Data)
-- =====================================================

-- Guest Statistics View
CREATE OR REPLACE VIEW vw_guest_stats AS
SELECT
    tenant_id,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE confirmado = TRUE) as confirmed,
    COUNT(*) FILTER (WHERE confirmado = FALSE) as pending,
    COUNT(*) FILTER (WHERE checkin = TRUE) as checked_in,
    SUM(acompanhantes) as total_companions
FROM convidados
GROUP BY tenant_id;

-- Photo Statistics View
CREATE OR REPLACE VIEW vw_photo_stats AS
SELECT
    f.tenant_id,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE f.aprovado = TRUE) as approved,
    COUNT(*) FILTER (WHERE f.aprovado = FALSE) as pending,
    COUNT(*) FILTER (WHERE f.media_type = 'photo') as total_photos,
    COUNT(*) FILTER (WHERE f.media_type = 'video') as total_videos,
    COALESCE(SUM(likes.count), 0) as total_likes,
    COALESCE(SUM(comments.count), 0) as total_comments
FROM fotos f
LEFT JOIN (
    SELECT foto_id, COUNT(*) as count
    FROM foto_likes
    GROUP BY foto_id
) likes ON f.id = likes.foto_id
LEFT JOIN (
    SELECT foto_id, COUNT(*) as count
    FROM foto_comentarios
    GROUP BY foto_id
) comments ON f.id = comments.foto_id
GROUP BY f.tenant_id;

-- Contract Statistics View
CREATE OR REPLACE VIEW vw_contract_stats AS
SELECT
    tenant_id,
    COUNT(*) as total_contracts,
    COALESCE(SUM(valor), 0) as total_valor,
    COALESCE(SUM(pago), 0) as total_pago,
    COALESCE(SUM(valor) - SUM(pago), 0) as total_restante
FROM contratos
GROUP BY tenant_id;

-- Guest Media Count View (for upload limits)
CREATE OR REPLACE VIEW vw_guest_media_count AS
SELECT
    tenant_id,
    codigo_convidado,
    COUNT(*) FILTER (WHERE media_type = 'photo') as photo_count,
    COUNT(*) FILTER (WHERE media_type = 'video') as video_count
FROM fotos
GROUP BY tenant_id, codigo_convidado;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_convidados_updated_at
    BEFORE UPDATE ON convidados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fotos_updated_at
    BEFORE UPDATE ON fotos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at
    BEFORE UPDATE ON contratos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-approve photos after wedding date
CREATE OR REPLACE FUNCTION auto_approve_photo()
RETURNS TRIGGER AS $$
DECLARE
    v_wedding_date DATE;
BEGIN
    SELECT wedding_date INTO v_wedding_date
    FROM tenants
    WHERE id = NEW.tenant_id;

    IF v_wedding_date IS NOT NULL AND CURRENT_DATE >= v_wedding_date THEN
        NEW.aprovado = TRUE;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_approve_photo_trigger
    BEFORE INSERT ON fotos
    FOR EACH ROW EXECUTE FUNCTION auto_approve_photo();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE convidados ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE foto_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE foto_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

-- Policies will be defined based on authentication context
-- Example policy for tenant isolation:
/*
CREATE POLICY tenant_isolation_policy ON convidados
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
*/

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Insert sample tenant
/*
INSERT INTO tenants (name, slug, wedding_date)
VALUES ('Casamento João & Maria', 'joao-maria', '2024-06-15');
*/
```

### 5.3 Relacionamentos e Cardinalidades

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         RELATIONSHIP CARDINALITIES                               │
└─────────────────────────────────────────────────────────────────────────────────┘

  tenants (1) ─────────────────────────────────────────────────────┐
      │                                                            │
      │ 1:N                                                        │ 1:N
      │                                                            │
      ▼                                                            ▼
  tenant_users (N)                                            convidados (N)
      │                                                            │
      │ N:1                                                        │ (via codigo)
      │                                                            │
      ▼                                                            │
  auth.users (1)                                                   │
                                                                   │
  tenants (1) ─────────────────────────────────────────────────────┤
      │                                                            │
      │ 1:N                                                        │
      ▼                                                            │
    fotos (N) ─────────────────────────────────────────────────────┘
      │                        (referência por codigo_convidado)
      │
      ├───── 1:N ─────► foto_likes (N)
      │
      └───── 1:N ─────► foto_comentarios (N)


  tenants (1) ─────────── 1:N ──────────► contratos (N)


  RESUMO DE CARDINALIDADES:
  ─────────────────────────
  • tenants → convidados:        1:N (um tenant, muitos convidados)
  • tenants → fotos:             1:N (um tenant, muitas fotos)
  • tenants → contratos:         1:N (um tenant, muitos contratos)
  • tenants → tenant_users:      1:N (um tenant, múltiplos admins)
  • fotos → foto_likes:          1:N (uma foto, muitos likes)
  • fotos → foto_comentarios:    1:N (uma foto, muitos comentários)
  • convidados ↔ fotos:          1:N (via codigo_convidado, soft reference)
```

---

## 6. Glossário Ubiquitous Language

| Termo                  | Contexto         | Definição                                              |
| ---------------------- | ---------------- | ------------------------------------------------------ |
| **Tenant**             | Platform         | Instância isolada de um casamento na plataforma        |
| **Convidado**          | Guest Management | Pessoa convidada para o evento                         |
| **Código**             | Shared Kernel    | Identificador único do convidado (ex: "JM001")         |
| **Parceiro**           | Guest            | Cônjuge/acompanhante principal do convidado            |
| **Acompanhantes**      | Guest            | Número de pessoas adicionais que virão com o convidado |
| **RSVP**               | RSVP Context     | Processo de confirmação de presença                    |
| **Confirmado**         | RSVP             | Status indicando que convidado confirmou presença      |
| **Check-in**           | RSVP Context     | Registro de entrada no evento                          |
| **Entrada Confirmada** | Check-in         | Verificação visual de que pessoa entrou no evento      |
| **Foto**               | Photos Context   | Imagem ou vídeo enviado por convidado                  |
| **Mídia**              | Photos Context   | Termo genérico para foto ou vídeo                      |
| **Aprovado**           | Photos Context   | Foto liberada para exibição pública                    |
| **Curtida**            | Photos Context   | Interação de "like" em uma foto                        |
| **Comentário**         | Photos Context   | Texto deixado em uma foto                              |
| **Contrato**           | Contract Context | Acordo com fornecedor do evento                        |
| **Fornecedor**         | Contract Context | Empresa que presta serviço para o casamento            |
| **Valor**              | Contract         | Custo total do contrato                                |
| **Pago**               | Contract         | Valor já quitado do contrato                           |
| **Restante**           | Contract         | Diferença entre valor e pago                           |

---

## Anexo A: Decisões de Arquitetura (ADRs)

### ADR-001: Multi-tenancy via Row-Level Security

**Decisão:** Usar RLS do PostgreSQL para isolamento de tenants.

**Contexto:** Necessidade de isolar dados entre diferentes casamentos na mesma base.

**Consequências:**

- (+) Isolamento garantido pelo banco
- (+) Simplifica código da aplicação
- (-) Requer configuração cuidadosa de políticas

### ADR-002: Shared Kernel para Guest Identity

**Decisão:** O conceito de `codigo_convidado` é compartilhado entre contextos.

**Contexto:** Fotos e RSVP precisam identificar o mesmo convidado.

**Consequências:**

- (+) Consistência na identificação
- (+) Permite relacionamentos sem FK hard
- (-) Acoplamento entre contexts

### ADR-003: Soft Reference para Fotos → Convidados

**Decisão:** Não usar FK entre fotos.codigo_convidado e convidados.codigo.

**Contexto:** Convidados podem ser deletados, mas fotos devem permanecer.

**Consequências:**

- (+) Flexibilidade na gestão de dados
- (+) Fotos independentes do ciclo de vida do convidado
- (-) Possível inconsistência de dados

---

> **Documento gerado para servir como base para construção do banco de dados.**
> **Versão:** 1.0 | **Data:** 2026-02-04
