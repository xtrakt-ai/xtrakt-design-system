<script setup lang="ts">
defineProps<{
  /** Number of items currently selected. The bar slides in when count > 0. */
  count: number
  /** Singular label, e.g. "ticket". Defaults to "item". */
  noun?: string
  /** Plural label, e.g. "tickets". Defaults to `${noun}s`. */
  pluralNoun?: string
}>()

const emit = defineEmits<{ (e: 'clear'): void }>()
</script>

<template>
  <transition name="xt-bulk-bar">
    <div
      v-if="count > 0"
      class="xt-bulk-bar"
      role="region"
      aria-label="Bulk actions"
    >
      <div class="xt-bulk-bar__count">
        <strong>{{ count }}</strong>
        {{ count === 1
          ? (noun ?? 'item')
          : (pluralNoun ?? (noun ? noun + 's' : 'items'))
        }}
        selected
      </div>
      <div class="xt-bulk-bar__actions">
        <slot />
        <button
          type="button"
          class="xt-bulk-bar__clear"
          @click="emit('clear')"
          aria-label="Clear selection"
        >
          Clear
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.xt-bulk-bar {
  position: sticky;
  bottom: 16px;
  z-index: 20;
  margin: 16px auto 0;
  padding: 10px 16px;
  background: var(--xt-fg, #0a2540);
  color: var(--xt-fg-inverse, #fff);
  border-radius: var(--xt-r-card, 8px);
  box-shadow: var(--xt-shadow-md, 0 6px 18px rgba(50, 50, 93, .10), 0 2px 4px rgba(0, 0, 0, .05));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-family: var(--xt-font, system-ui, sans-serif);
  font-size: 13px;
  max-width: 720px;
}
.xt-bulk-bar__count strong {
  font-weight: 600;
  margin-right: 4px;
}
.xt-bulk-bar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.xt-bulk-bar__clear {
  background: transparent;
  color: var(--xt-fg-inverse, #fff);
  border: 1px solid rgba(255, 255, 255, .25);
  border-radius: var(--xt-r-ctrl, 4px);
  padding: 4px 12px;
  font: 500 12px var(--xt-font, system-ui, sans-serif);
  cursor: pointer;
  transition: background 150ms cubic-bezier(.2, .8, .2, 1);
}
.xt-bulk-bar__clear:hover { background: rgba(255, 255, 255, .12); }

/* Slot buttons inherit a slight visual upgrade so they read on dark bg.
 * Consumers may pass any button class — these styles only nudge defaults. */
.xt-bulk-bar__actions :slotted(button) {
  background: rgba(255, 255, 255, .1);
  color: var(--xt-fg-inverse, #fff);
  border: 1px solid rgba(255, 255, 255, .2);
  border-radius: var(--xt-r-ctrl, 4px);
  padding: 4px 12px;
  font: 500 12px var(--xt-font, system-ui, sans-serif);
  cursor: pointer;
  transition: background 150ms cubic-bezier(.2, .8, .2, 1);
}
.xt-bulk-bar__actions :slotted(button:hover) {
  background: rgba(255, 255, 255, .2);
}

.xt-bulk-bar-enter-active,
.xt-bulk-bar-leave-active {
  transition: opacity 200ms cubic-bezier(.2, .8, .2, 1),
              transform 200ms cubic-bezier(.2, .8, .2, 1);
}
.xt-bulk-bar-enter-from,
.xt-bulk-bar-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .xt-bulk-bar-enter-active,
  .xt-bulk-bar-leave-active { transition: none; }
}
</style>
