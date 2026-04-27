<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'base' | 'lg' | 'icon'

const props = withDefaults(defineProps<{
  variant?: Variant
  size?: Size
  /** Disables the button. */
  disabled?: boolean
  /** Native button type — keep default 'button' so it doesn't accidentally submit forms. */
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'base',
  disabled: false,
  type: 'button',
})

defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

const cls = `xt-btn xt-btn--${props.variant}` +
  (props.size !== 'base' ? ` xt-btn--${props.size}` : '')
</script>

<template>
  <button
    :class="cls"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<!-- Styling lives in @xtrakt-ai/design-tokens (.xt-btn family). The wrapping
     element with class `xt-redesign` must be present somewhere up the tree. -->
