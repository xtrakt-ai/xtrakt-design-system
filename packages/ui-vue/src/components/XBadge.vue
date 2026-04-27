<script setup lang="ts">
type Variant = 'success' | 'warning' | 'danger' | 'info' | 'muted'

withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'muted' })
</script>

<template>
  <span :class="`xt-badge xt-badge--${variant}`">
    <slot />
  </span>
</template>
