# Legacy: Multi-Tenancy (Tenant)

Estes arquivos implementam o sistema completo de **multi-tenancy** (white-label) do projeto.
Foram movidos para esta pasta em **2026-03-04** pois o recurso não é necessário na versão atual.

## Arquivos preservados

| Arquivo | Descrição |
|---------|-----------|
| `config/tenant.ts` | Interface `TenantConfig`, config padrão, funções `useTenant`, `hasFeature`, `getLimit` |
| `api/tenantService.ts` | Carregamento de tenant do Supabase (por slug, domínio, ID), cache, RLS |
| `providers/tenantResolver.ts` | Resolução de tenant por subdomain/path/query/domain |
| `utils/useTenantContext.ts` | Vue Provide/Inject para contexto de tenant em componentes |
| `ui/FeatureGate.vue` | Componente que habilita/desabilita UI baseado em feature flags |

## Como reativar

1. Restaurar arquivos para suas localizações originais:
   - `config/tenant.ts` → `src/shared/config/tenant.ts`
   - `api/tenantService.ts` → `src/shared/api/tenantService.ts`
   - `providers/tenantResolver.ts` → `src/app/providers/tenantResolver.ts`
   - `utils/useTenantContext.ts` → `src/shared/utils/useTenantContext.ts`
   - `ui/FeatureGate.vue` → `src/shared/ui/FeatureGate.vue`

2. Restaurar os barrel files (`index.ts`) removendo os exports comentados

3. Restaurar `repositoryFactory.ts` para usar `useTenant()` ao invés de `APP_TENANT_ID`

4. Restaurar `router.ts` com `featureGuard`

5. Restaurar `main.ts` com `initializeTenant()` e `applyTenantTheme()`

6. Restaurar `App.vue` com `provideTenant()`

## Banco de dados necessário

Para multi-tenancy funcionar precisa de:
- Tabela `tenants` no Supabase com campos: `id`, `slug`, `name`, `features`, `limits`, `theme`, `config`, `plan`, `is_active`, `custom_domain`
- RPC `set_current_tenant_id` para Row-Level Security
- Políticas RLS em todas as tabelas filtradas por `tenant_id`
