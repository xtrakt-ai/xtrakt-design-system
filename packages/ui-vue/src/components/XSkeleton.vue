<script setup lang="ts">
type Variant = 'line' | 'card' | 'row' | 'avatar' | 'circle'

const props = withDefaults(defineProps<{
  /** Pre-shaped skeleton: `line` = single text line, `card` = block, `row` = table row, `avatar` = small circle, `circle` = arbitrary circle. */
  variant?: Variant
  /** Repeat the same skeleton N times — useful for `<XSkeleton variant="line" :count="3" />`. */
  count?: number
  /** Override width (CSS value). Defaults vary by variant. */
  width?: string
  /** Override height (CSS value). Defaults vary by variant. */
  height?: string
  /** Pause the shimmer (e.g. respect prefers-reduced-motion at the call site). */
  paused?: boolean
}>(), {
  variant: 'line',
  count: 1,
  paused: false,
})

const items = Array.from({ length: Math.max(1, props.count) }, (_, i) => i)

function styleFor(variant: Variant) {
  const base = {
    '--w': props.width ?? '',
    '--h': props.height ?? '',
  } as Record<string, string>
  return base
}
</script>

<template>
  <span
    v-for="i in items"
    :key="i"
    :class="['xt-skeleton', `xt-skeleton--${variant}`, { 'xt-skeleton--paused': paused }]"
    :style="styleFor(variant)"
    aria-hidden="true"
  />
</template>

<style scoped>
.xt-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--xt-surface-muted, #eef2f7) 0%,
    var(--xt-surface, #f6f9fc) 50%,
    var(--xt-surface-muted, #eef2f7) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--xt-r-ctrl, 4px);
  animation: xt-shimmer 1.4s ease-in-out infinite;
  width: var(--w, 100%);
  height: var(--h, 12px);
  margin: 6px 0;
}
.xt-skeleton--paused { animation-play-state: paused; }

.xt-skeleton--line   { height: var(--h, 12px); }
.xt-skeleton--card   { height: var(--h, 120px); border-radius: var(--xt-r-card, 8px); margin: 12px 0; }
.xt-skeleton--row    { height: var(--h, 38px); border-radius: var(--xt-r-ctrl, 4px); margin: 4px 0; }
.xt-skeleton--avatar { width: var(--w, 32px); height: var(--h, 32px); border-radius: 50%; }
.xt-skeleton--circle { border-radius: 50%; }

@keyframes xt-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .xt-skeleton { animation: none; opacity: 0.6; }
}
</style>
