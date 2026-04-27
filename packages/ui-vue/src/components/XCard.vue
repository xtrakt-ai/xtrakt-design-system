<script setup lang="ts">
withDefaults(defineProps<{
  /** Drops the shadow for a fully-flat surface. */
  flat?: boolean
  /** Renders the interactive `xt-tile` variant (hover lift, click cursor). */
  interactive?: boolean
}>(), {
  flat: false,
  interactive: false,
})
</script>

<template>
  <div :class="interactive ? 'xt-tile' : (flat ? 'xt-card xt-card--flat' : 'xt-card')">
    <slot />
  </div>
</template>
