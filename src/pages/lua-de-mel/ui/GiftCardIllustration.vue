<template>
  <div class="illustration" :style="{ background: theme.gradient }">
    <svg
      class="deco-svg"
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      :aria-hidden="true"
    >
      <defs>
        <linearGradient :id="`grad-${item.id}`" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="theme.gradStart" stop-opacity="1" />
          <stop offset="100%" :stop-color="theme.gradEnd" stop-opacity="1" />
        </linearGradient>
      </defs>

      <!-- Background fill -->
      <rect width="200" height="140" :fill="`url(#grad-${item.id})`" />

      <!-- Large blobs de fundo -->
      <ellipse
        v-for="(b, i) in blobs"
        :key="`b${i}`"
        :cx="b.cx" :cy="b.cy" :rx="b.rx" :ry="b.ry"
        :fill="b.light ? theme.lightBlob : theme.darkBlob"
        :opacity="b.opacity"
      />

      <!-- Pontos espalhados -->
      <circle
        v-for="(d, i) in dots"
        :key="`d${i}`"
        :cx="d.cx" :cy="d.cy" :r="d.r"
        fill="white"
        :opacity="d.opacity"
      />

      <!-- Estrelinhas ✦ -->
      <text
        v-for="(s, i) in stars"
        :key="`s${i}`"
        :x="s.x" :y="s.y"
        :font-size="s.size"
        fill="white"
        :opacity="s.opacity"
        font-family="sans-serif"
        text-anchor="middle"
      >✦</text>

      <!-- Tag de humor no canto inferior -->
      <g>
        <rect
          :x="tagX" y="118" :width="tagWidth" height="15"
          rx="7.5"
          fill="rgba(0,0,0,0.22)"
        />
        <text
          :x="tagX + tagWidth / 2" y="129"
          font-size="7"
          fill="white"
          opacity="0.95"
          font-family="sans-serif"
          text-anchor="middle"
        >{{ funTag }}</text>
      </g>
    </svg>

    <!-- Emoji principal (overlay HTML para consistência cross-browser) -->
    <div class="emoji-layer">{{ item.emoji }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GiftItem, GiftCategory } from '@features/lua-de-mel/model/giftItems';

const props = defineProps<{ item: GiftItem }>();

// ─── Paletas por categoria ────────────────────────────────────────────────────
interface Theme {
  gradient: string;
  gradStart: string;
  gradEnd: string;
  lightBlob: string;
  darkBlob: string;
}

const THEMES: Record<GiftCategory, Theme> = {
  viagem: {
    gradient: 'linear-gradient(135deg, #38bdf8, #0369a1)',
    gradStart: '#38bdf8', gradEnd: '#0369a1',
    lightBlob: 'rgba(186,230,253,0.55)', darkBlob: 'rgba(3,105,161,0.45)',
  },
  hotel: {
    gradient: 'linear-gradient(135deg, #fcd34d, #92400e)',
    gradStart: '#fcd34d', gradEnd: '#92400e',
    lightBlob: 'rgba(253,230,138,0.55)', darkBlob: 'rgba(146,64,14,0.45)',
  },
  folga: {
    gradient: 'linear-gradient(135deg, #4ade80, #15803d)',
    gradStart: '#4ade80', gradEnd: '#15803d',
    lightBlob: 'rgba(134,239,172,0.55)', darkBlob: 'rgba(21,128,61,0.45)',
  },
  gastronomia: {
    gradient: 'linear-gradient(135deg, #f87171, #991b1b)',
    gradStart: '#f87171', gradEnd: '#991b1b',
    lightBlob: 'rgba(252,165,165,0.55)', darkBlob: 'rgba(153,27,27,0.45)',
  },
  relaxar: {
    gradient: 'linear-gradient(135deg, #a78bfa, #4c1d95)',
    gradStart: '#a78bfa', gradEnd: '#4c1d95',
    lightBlob: 'rgba(196,181,253,0.55)', darkBlob: 'rgba(76,29,149,0.45)',
  },
  'memória': {
    gradient: 'linear-gradient(135deg, #fb7185, #881337)',
    gradStart: '#fb7185', gradEnd: '#881337',
    lightBlob: 'rgba(253,164,175,0.55)', darkBlob: 'rgba(136,19,55,0.45)',
  },
};

const theme = computed(() => THEMES[props.item.category]);

// ─── Tags de humor por item ───────────────────────────────────────────────────
const FUN_TAGS: Record<number, string> = {
  1:  '50% do sonho ✂️',
  2:  '⭐ 5 estrelas, claro',
  3:  'filtro solar incluso',
  4:  'atenção: afunda',
  5:  'ele queria strogonoff',
  6:  'status: desentortado',
  7:  'a 2ª não é inclusa',
  8:  'sorria pra câmera',
  9:  'silêncio... dormindo',
  10: 'Z  Z  Z  Z  Z',
  11: '4h da manhã 😵',
  12: '📶 sinal crítico',
  13: 'vela 1 de muitas',
  14: 'com o coração 💛',
};

const funTag = computed(() => FUN_TAGS[props.item.id] ?? '');
const tagWidth = computed(() => Math.min(funTag.value.length * 4.5 + 12, 180));
const tagX = computed(() => (200 - tagWidth.value) / 2);

// ─── Gerador determinístico baseado no ID ────────────────────────────────────
function lcg(seed: number) {
  let s = seed | 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223 | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

// Blobs grandes de fundo
const blobs = computed(() => {
  const rnd = lcg(props.item.id * 7);
  return [
    { cx: rnd() * 120 + 20, cy: rnd() * 80 + 10,  rx: rnd() * 55 + 55, ry: rnd() * 45 + 45, opacity: 0.28 + rnd() * 0.15, light: true },
    { cx: rnd() * 130 + 40, cy: rnd() * 90 + 20,  rx: rnd() * 45 + 40, ry: rnd() * 35 + 35, opacity: 0.22 + rnd() * 0.13, light: false },
    { cx: rnd() * 160 + 10, cy: rnd() * 100 + 15, rx: rnd() * 30 + 25, ry: rnd() * 25 + 20, opacity: 0.15 + rnd() * 0.1,  light: true },
  ];
});

// Pontos pequenos
const dots = computed(() => {
  const rnd = lcg(props.item.id * 13 + 42);
  return Array.from({ length: 11 }, () => ({
    cx: rnd() * 190 + 5,
    cy: rnd() * 130 + 5,
    r: rnd() * 3.5 + 1.2,
    opacity: 0.25 + rnd() * 0.5,
  }));
});

// Estrelinhas ✦
const stars = computed(() => {
  const rnd = lcg(props.item.id * 19 + 77);
  return Array.from({ length: 6 }, () => ({
    x: rnd() * 180 + 10,
    y: rnd() * 115 + 8,
    size: rnd() * 9 + 7,
    opacity: 0.35 + rnd() * 0.45,
  }));
});
</script>

<style scoped>
.illustration {
  position: relative;
  width: 100%;
  aspect-ratio: 10 / 7;
  border-radius: 14px 14px 0 0;
  overflow: hidden;
}

.deco-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.emoji-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  /* Sombra suave para destacar sobre o fundo colorido */
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
  /* Empurra levemente para cima, deixando espaço para a tag */
  padding-bottom: 14px;
}
</style>
