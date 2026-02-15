## Diagnóstico Geral

O projeto está em um nível de complexidade **médio-alto (7.5/10)**: arquitetura modular boa (módulos `admin`, `rsvp`, `photos`, camada `core`, multi-tenant), mas com alguns pontos que aumentam custo de manutenção sem necessidade.

Os dois fatores que mais “incham” a complexidade hoje:
- **desalinhamento entre arquitetura planejada e implementação real** (factory tenant-aware vs repos singleton);
- **duplicação de lógica/UI** (fluxos de identificação, componentes base, estilos/padrões de card).

## Pontuação dos pontos para simplificar

Escala: **Complexidade atual** (1-5), **Impacto ao simplificar** (1-5), **Esforço** (1-5), **Prioridade** (resultado prático).

| Local | Complexidade | Impacto | Esforço | Prioridade |
|---|---:|---:|---:|---|
| `src/modules/admin/infrastructure/stores/*` + `src/core/factories/repositoryFactory.ts` | 5 | 5 | 3 | **P0** |
| `src/modules/photos/presentation/views/PhotoUploadView.vue` + `PhotoFeedView.vue` (identificação) | 4 | 5 | 2 | **P0** |
| `src/modules/rsvp/presentation/views/CheckinView.vue` (muitas responsabilidades) | 5 | 4 | 3 | **P1** |
| `src/components/common/BaseButton.vue`, `src/core/components/BaseButton.vue`, `src/modules/admin/presentation/components/common/BaseButton.vue` | 4 | 4 | 2 | **P1** |
| `src/core/factories/repositoryFactory.ts` (switch repetido) | 3 | 3 | 2 | **P1** |
| `src/modules/photos/infrastructure/composables/useVideoUpload.ts` (upload+gravação+stream num só) | 4 | 4 | 3 | **P1** |
| `src/views/HomePage.vue` + `src/views/ChaCasaNovaPage.vue` (CSS/card duplicado) | 3 | 3 | 2 | **P2** |
| `README.md` vs arquitetura atual (`docs/ARCHITECTURE_C4.md`, `package.json`) | 2 | 3 | 1 | **P2** |

## Evidências objetivas (código)

```5:8:src/modules/admin/infrastructure/stores/useGuestsStore.ts
import { guestRepository } from '../repositories';
...
guests.value = await guestRepository.getAll();
```

```38:46:src/core/factories/repositoryFactory.ts
export function createGuestRepository(): IGuestRepository {
  const tenant = useTenant()
  const cacheKey = `guest-${tenant.id}-${tenant.backend}`

  return getOrCreate(cacheKey, () => {
    switch (tenant.backend) {
      case 'supabase':
        return new GuestRepositorySupabase(tenant.id)
```

Aqui existe a arquitetura tenant-aware pronta, mas as stores ainda usam singleton direto.

```33:51:src/modules/photos/presentation/views/PhotoUploadView.vue
const getFullCode = () => {
  return 'RE' + guestCode.value.trim();
};

const { data, error } = await supabase
  .from('convidados')
  .select('codigo, nome')
  .ilike('codigo', getFullCode())
  .single();
```

```160:178:src/modules/photos/presentation/views/PhotoFeedView.vue
const getFullCode = () => {
  return 'RE' + guestCode.value.trim();
};

const { data, error } = await supabase
  .from('convidados')
  .select('codigo, nome')
  .ilike('codigo', getFullCode())
  .single();
```

Fluxo duplicado quase idêntico: ótimo candidato a composable único.

## Onde deixar mais “simplista” (direto ao ponto)

- **Tenant/repositórios (P0):** migrar stores para `createGuestRepository()`/`createContractRepository()` e eliminar singletons antigos.
- **Identificação de convidado (P0):** extrair `useGuestIdentify()` + helper `toGuestCode()` e remover repetição entre `PhotoUpload` e `PhotoFeed`.
- **Check-in (P1):** separar scanner QR em composable (`useQrScanner`) e reduzir responsabilidade da view.
- **Base UI (P1):** manter um único `BaseButton` em `core` e adaptar APIs dos usos.
- **Factory (P1):** reduzir `switch` repetido com mapa por backend.
- **Vídeo (P1):** dividir `useVideoUpload` em upload/validação e gravação/stream.
- **Páginas públicas (P2):** extrair layout/card compartilhado para evitar CSS duplicado.
- **Docs (P2):** atualizar `README.md` para refletir Vue 3.5 + Vite 7 + arquitetura modular atual.

Se quiser, eu já posso transformar isso em um **plano de refatoração em 3 fases** (rápida, segura e incremental) com PRs pequenos e ordem ideal de execução.