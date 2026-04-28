<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  /** When true, renders a multi-line textarea. */
  multiline?: boolean
}>(), {
  type: 'text',
  disabled: false,
  multiline: false,
})

defineEmits<{ (e: 'update:modelValue', v: string | number): void }>()
</script>

<template>
  <textarea
    v-if="multiline"
    class="xt-input"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
  <input
    v-else
    class="xt-input"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
