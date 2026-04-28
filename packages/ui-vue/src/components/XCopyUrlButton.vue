<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  /** URL to copy. Defaults to the current page URL. */
  url?: string
  /** Visible label next to the icon. Pass empty string for icon-only. */
  label?: string
  /** Confirmation text shown briefly after the copy succeeds. */
  copiedLabel?: string
  /** Style variant — matches the design-tokens button family. */
  variant?: 'ghost' | 'secondary'
}>(), {
  label: 'Copy link',
  copiedLabel: 'Copied!',
  variant: 'ghost',
})

const emit = defineEmits<{
  (e: 'copied', url: string): void
  (e: 'error', err: unknown): void
}>()

const copied = ref(false)

async function copy() {
  const target = props.url ?? window.location.href
  try {
    await navigator.clipboard.writeText(target)
    copied.value = true
    emit('copied', target)
    setTimeout(() => { copied.value = false }, 1800)
  } catch (err) {
    emit('error', err)
  }
}
</script>

<template>
  <button
    type="button"
    :class="['xt-btn', `xt-btn--${variant}`, 'xt-btn--sm']"
    :title="copied ? copiedLabel : (url ?? 'Copy URL')"
    @click="copy"
  >
    <svg
      v-if="!copied"
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
    <svg
      v-else
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span v-if="label">{{ copied ? copiedLabel : label }}</span>
  </button>
</template>

<!-- Buttons inherit .xt-btn styling from @xtrakt-ai/design-tokens. The wrapping
     element with class `xt-redesign` must be present somewhere up the tree. -->
