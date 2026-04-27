<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

interface BreadcrumbItem {
  label: string
  to?: string
}

/**
 * Canonical xtrakt breadcrumb. Modeled on the Portal pattern but driven by
 * the shared --xt-* tokens so every FE renders the same way.
 *
 * Usage:
 *   <XBreadcrumb :items="[{label:'Tickets',to:'/tickets'},{label:ticket.subject}]" />
 *
 * Or omit items to derive from the current route name:
 *   <XBreadcrumb root-label="Portal" />
 */
const props = defineProps<{
  items?: BreadcrumbItem[]
  rootLabel?: string
}>()

const route = useRoute()

const computedItems = computed<BreadcrumbItem[]>(() => {
  if (props.items?.length) return props.items
  const root: BreadcrumbItem = { label: props.rootLabel ?? 'Home', to: '/' }
  const name = (route.name as string) || ''
  if (!name || name.toLowerCase() === 'home' || name.toLowerCase() === 'dashboard') {
    return [root]
  }
  // CamelCase → "Camel Case"
  const friendly = name.replace(/([A-Z])/g, ' $1').trim()
  return [root, { label: friendly }]
})
</script>

<template>
  <nav class="xt-breadcrumb" aria-label="Breadcrumb">
    <ol>
      <template v-for="(item, index) in computedItems" :key="index">
        <li :class="{ active: index === computedItems.length - 1 }">
          <RouterLink
            v-if="item.to && index < computedItems.length - 1"
            :to="item.to"
          >
            {{ item.label }}
          </RouterLink>
          <span v-else>{{ item.label }}</span>
        </li>
        <li v-if="index < computedItems.length - 1" class="sep" aria-hidden="true">/</li>
      </template>
    </ol>
  </nav>
</template>

<style scoped>
.xt-breadcrumb {
  font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
  font-size: 12px;
  color: var(--xt-fg-muted, #425466);
}
.xt-breadcrumb ol {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.xt-breadcrumb li.active {
  color: var(--xt-fg, #0a2540);
  font-weight: 500;
}
.xt-breadcrumb a {
  color: var(--xt-fg-muted, #425466);
  text-decoration: none;
  transition: color 150ms cubic-bezier(.2, .8, .2, 1);
}
.xt-breadcrumb a:hover {
  color: var(--xt-brand, #635bff);
}
.xt-breadcrumb .sep {
  color: var(--xt-fg-subtle, #8792a2);
}
</style>
