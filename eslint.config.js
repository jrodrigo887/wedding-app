import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ── Ignores ────────────────────────────────────────────────
  {
    ignores: [
      'dist/',
      'node_modules/',
      'api/',
      'google-apps-script/',
      '*.config.js',
      '*.config.ts',
      'resize-preview.js',
    ],
  },

  // ── Base JS recommended ────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript recommended ─────────────────────────────────
  ...tseslint.configs.recommended,

  // ── Vue 3 recommended (inclui essential + strongly-recommended) ──
  ...pluginVue.configs['flat/recommended'],

  // ── Vue + TypeScript parser ────────────────────────────────
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // ── Desativa no-undef para TS/Vue (TypeScript já cobre isso) ──
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      'no-undef': 'off',
    },
  },

  // ── Regras customizadas ────────────────────────────────────
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      // ── TypeScript ──────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',

      // ── Vue ─────────────────────────────────────────────────
      'vue/multi-word-component-names': 'off',
      'vue/define-macros-order': [
        'error',
        { order: ['defineProps', 'defineEmits', 'defineSlots'] },
      ],
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/no-v-html': 'warn',

      // ── JS geral ───────────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'smart'],
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-duplicate-imports': 'error',
    },
  },

  {
    files: ['src/shared/ui/**/*.vue'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['src/shared/**/*.{js,jsx,ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/app/**', '@/pages/**', '@/widgets/**', '@/features/**', '@/entities/**'],
        },
      ],
    },
  },
  {
    files: ['src/entities/**/*.{js,jsx,ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/app/**', '@/pages/**', '@/widgets/**', '@/features/**'],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{js,jsx,ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/app/**', '@/pages/**', '@/widgets/**'],
        },
      ],
    },
  },
  {
    files: ['src/widgets/**/*.{js,jsx,ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/app/**', '@/pages/**'],
        },
      ],
    },
  },
  {
    files: ['src/pages/**/*.{js,jsx,ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/app/**'],
        },
      ],
    },
  },

  // ── Prettier (desativa regras de formatação que conflitam) ──
  prettierConfig
);
