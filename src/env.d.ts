/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_SCRIPT_URL: string;
  readonly VITE_USE_GOOGLE_SHEETS: string;
  readonly VITE_INFINITYPAY_HANDLE: string;
  readonly VITE_INFINITYPAY_REDIRECT_URL: string;
  readonly VITE_INFINITYPAY_WEBHOOK_URL: string;
  readonly VITE_INFINITYPAY_LINK_NA_BIO: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_EMAIL_API_URL: string;
  readonly VITE_CHECKIN_PIN: string;
  readonly VITE_BASE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
