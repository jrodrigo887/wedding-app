// App layer - ponto de entrada e providers
export { router } from './providers';
export {
  initializeTenant,
  configureTenantResolver,
  resolveTenant,
  getTenantUrl,
  isTenantDomain,
  type TenantResolutionStrategy,
  type TenantResolverConfig,
} from './providers';
