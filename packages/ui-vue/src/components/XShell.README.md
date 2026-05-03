# XShell (Vue) — `@xtrakt-ai/ui-vue`

Canonical xtrakt app shell. Replaces the per-FE `MainLayout.vue` /
`App.vue` topbar implementations that the May 3 audit (D-08) flagged as
fragmented across portal-fe / ecm-fe / sign-fe / template-fe / tickets-fe.

**Layout contract**: 240px expanded sidebar / 64px collapsed, 56px topbar
with breadcrumb slot + user-menu, content scrolls underneath. All colors
+ spacing come from `--xt-*` tokens shipped by `@xtrakt-ai/design-tokens`.

## Wiring example (ecm-fe)

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { XShell, XBreadcrumb, type XShellNavItem } from '@xtrakt-ai/ui-vue'
import { useAuth } from '@/composables/useAuth' // existing
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const { t } = useI18n()

const isPublic = computed(() => route.meta.public === true)

const nav = computed<XShellNavItem[]>(() => [
  { label: t('menu.browse'), to: '/ecm/browse' },
  { label: t('menu.search'), to: '/ecm/search' },
])

const user = ref({ name: auth.getUserName(), email: auth.getUserEmail() })

const crumbs = computed(() => [
  { label: 'ECM', to: '/ecm/browse' },
  { label: route.meta.crumb || '' },
])

function onLogout() {
  auth.logout().then(() => router.push('/login'))
}
</script>

<template>
  <RouterView v-if="isPublic" />
  <XShell
    v-else
    :brand="{ name: 'fluex ECM' }"
    :nav="nav"
    :user="user"
    :logout-label="$t('menu.logout')"
    @logout="onLogout">
    <template #breadcrumb>
      <XBreadcrumb :items="crumbs" />
    </template>
    <RouterView />
  </XShell>
</template>
```

That's the entire `App.vue` for an ECM-style FE — the previous 35-line
inline topbar definition collapses to a `<XShell>` invocation.

## Migration checklist for a satellite FE

1. Bump `@xtrakt-ai/ui-vue` to `^1.5.0` in `package.json`.
2. `npm install` (the package is on GitHub Packages — see existing
   `.npmrc` setup in the repo).
3. Replace the inline header + nav in `App.vue` (or `MainLayout.vue`)
   with `<XShell>` per the example above.
4. Delete the old `.topbar` / `.app--admin` styles — `XShell` brings its
   own scoped styles.
5. Verify `--xt-brand`, `--xt-bg`, `--xt-fg`, `--xt-surface`, `--xt-border`
   are emitted by the FE's `tokens.css` import (they are if
   `@xtrakt-ai/design-tokens@^2.0.0` is installed).

## Slots

- default — page content (typically `<RouterView />`)
- `#breadcrumb` — top-left slot for `<XBreadcrumb>` or any breadcrumb
- `#topbar-actions` — top-right area for buttons left of the user menu

## Events

- `@logout` — fires when the user picks "Logout" in the avatar menu
- `@collapse-change(collapsed: boolean)` — fires when sidebar toggles
