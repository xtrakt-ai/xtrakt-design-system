<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

export interface XShellNavItem {
  label: string
  to: string
  icon?: string
  /** Visually-hidden a11y description for icon-only collapsed state */
  ariaLabel?: string
}

export interface XShellBrand {
  name: string
  logoUrl?: string
}

export interface XShellUser {
  name?: string | null
  email?: string | null
  initials?: string | null
}

/**
 * Canonical xtrakt app shell — sidebar (collapsible) + topbar + content.
 *
 * Designed so every fluex satellite (ECM, Sign, Template, Tickets, Portal)
 * gets the same chrome: 240px expanded sidebar / 64px collapsed, 56px
 * topbar with breadcrumb slot + user menu, content scrolls under.
 *
 * Pure tokens — no hardcoded hex. Consumers in pt-BR or other locales pass
 * already-translated strings (the shell itself renders no app text apart
 * from the user-menu Logout label, which is overridable).
 *
 * Usage:
 *   <XShell :brand="{ name: 'fluex ECM' }" :nav="navItems" :user="user" @logout="onLogout">
 *     <template #breadcrumb><XBreadcrumb /></template>
 *     <router-view />
 *   </XShell>
 */
const props = withDefaults(
  defineProps<{
    brand: XShellBrand
    nav: XShellNavItem[]
    user?: XShellUser | null
    logoutLabel?: string
    initialCollapsed?: boolean
  }>(),
  { user: null, logoutLabel: 'Logout', initialCollapsed: false }
)

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'collapse-change', collapsed: boolean): void
}>()

const collapsed = ref(props.initialCollapsed)
const userMenuOpen = ref(false)

function toggleCollapsed() {
  collapsed.value = !collapsed.value
  emit('collapse-change', collapsed.value)
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function closeUserMenu() {
  userMenuOpen.value = false
}

function onLogout() {
  closeUserMenu()
  emit('logout')
}

const computedInitials = computed(() => {
  if (props.user?.initials) return props.user.initials
  const source = (props.user?.name || props.user?.email || '').trim()
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return source.substring(0, 2).toUpperCase()
})

const userPrimaryLine = computed(() => props.user?.name || props.user?.email || '')
const userSecondaryLine = computed(() =>
  props.user?.name && props.user?.email ? props.user.email : ''
)
</script>

<template>
  <div class="xt-shell" :class="{ 'xt-shell--collapsed': collapsed }">
    <aside class="xt-shell__sidebar" :aria-label="brand.name">
      <div class="xt-shell__brand">
        <img v-if="brand.logoUrl" :src="brand.logoUrl" :alt="brand.name + ' logo'" />
        <span v-else class="xt-shell__brand-mark" aria-hidden="true">{{ brand.name.charAt(0) }}</span>
        <span class="xt-shell__brand-name">{{ brand.name }}</span>
      </div>

      <nav class="xt-shell__nav">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :title="collapsed ? (item.ariaLabel ?? item.label) : undefined"
          class="xt-shell__nav-item"
          active-class="xt-shell__nav-item--active"
        >
          <span v-if="item.icon" class="xt-shell__nav-icon" v-html="item.icon" aria-hidden="true" />
          <span class="xt-shell__nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button
        type="button"
        class="xt-shell__collapse-btn"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!collapsed"
        @click="toggleCollapsed"
      >
        <span aria-hidden="true">{{ collapsed ? '›' : '‹' }}</span>
      </button>
    </aside>

    <div class="xt-shell__main">
      <header class="xt-shell__topbar">
        <div class="xt-shell__topbar-left">
          <slot name="breadcrumb" />
        </div>
        <div class="xt-shell__topbar-right">
          <slot name="topbar-actions" />
          <div v-if="user" class="xt-shell__user" v-click-outside="closeUserMenu">
            <button
              type="button"
              class="xt-shell__user-trigger"
              :aria-label="userPrimaryLine || 'Account menu'"
              :aria-expanded="userMenuOpen"
              @click="toggleUserMenu"
            >
              <span class="xt-shell__avatar" aria-hidden="true">{{ computedInitials }}</span>
            </button>
            <div v-if="userMenuOpen" class="xt-shell__user-menu" role="menu">
              <div class="xt-shell__user-menu-head">
                <span class="xt-shell__user-name">{{ userPrimaryLine }}</span>
                <span v-if="userSecondaryLine" class="xt-shell__user-email">{{ userSecondaryLine }}</span>
              </div>
              <button type="button" role="menuitem" class="xt-shell__user-menu-item" @click="onLogout">
                {{ logoutLabel }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="xt-shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
// Tiny self-contained click-outside directive. Keeping it inline so the
// component has zero new runtime deps for consumers.
import type { Directive } from 'vue'

const clickOutside: Directive<HTMLElement, () => void> = {
  beforeMount(el, binding) {
    ;(el as HTMLElement & { __xtCO__?: (e: Event) => void }).__xtCO__ = (e: Event) => {
      if (!el.contains(e.target as Node)) binding.value?.()
    }
    document.addEventListener('mousedown', (el as HTMLElement & { __xtCO__: (e: Event) => void }).__xtCO__)
  },
  unmounted(el) {
    const handler = (el as HTMLElement & { __xtCO__?: (e: Event) => void }).__xtCO__
    if (handler) document.removeEventListener('mousedown', handler)
  },
}

export default {
  directives: { 'click-outside': clickOutside },
}
</script>

<style scoped>
.xt-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: var(--xt-bg, #f7f9fc);
  color: var(--xt-fg, #0a2540);
  font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
  transition: grid-template-columns 0.18s ease;
}
.xt-shell--collapsed {
  grid-template-columns: 64px 1fr;
}

.xt-shell__sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  background: var(--xt-surface, #ffffff);
  border-right: 1px solid var(--xt-border, #e3e8ee);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xt-shell__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  height: 56px;
  flex: 0 0 auto;
}
.xt-shell__brand img,
.xt-shell__brand-mark {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border-radius: 6px;
}
.xt-shell__brand-mark {
  background: var(--xt-brand, #581cff);
  color: var(--xt-on-brand, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.xt-shell__brand-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.xt-shell--collapsed .xt-shell__brand-name { display: none; }

.xt-shell__nav {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.xt-shell__nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  color: var(--xt-fg-muted, #425466);
  text-decoration: none;
  font-size: 13.5px;
  transition: background 0.12s ease, color 0.12s ease;
}
.xt-shell__nav-item:hover {
  background: var(--xt-bg-hover, #f0f2f6);
  color: var(--xt-fg, #0a2540);
}
.xt-shell__nav-item--active {
  background: var(--xt-brand-soft, rgba(88, 28, 255, 0.08));
  color: var(--xt-brand, #581cff);
  font-weight: 500;
}
.xt-shell__nav-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.xt-shell--collapsed .xt-shell__nav-label { display: none; }
.xt-shell--collapsed .xt-shell__nav-item { justify-content: center; padding: 9px 0; }

.xt-shell__collapse-btn {
  margin: 8px;
  padding: 6px;
  border: 1px solid var(--xt-border, #e3e8ee);
  background: var(--xt-surface, #ffffff);
  color: var(--xt-fg-muted, #425466);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
.xt-shell__collapse-btn:hover {
  background: var(--xt-bg-hover, #f0f2f6);
}

.xt-shell__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.xt-shell__topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--xt-border, #e3e8ee);
  background: var(--xt-surface, #ffffff);
  position: sticky;
  top: 0;
  z-index: 10;
}
.xt-shell__topbar-left,
.xt-shell__topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.xt-shell__user {
  position: relative;
}
.xt-shell__user-trigger {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
}
.xt-shell__user-trigger:focus-visible {
  outline: 2px solid var(--xt-brand, #581cff);
  outline-offset: 2px;
}
.xt-shell__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--xt-brand, #581cff);
  color: var(--xt-on-brand, #ffffff);
  font-size: 12px;
  font-weight: 600;
}
.xt-shell__user-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 220px;
  background: var(--xt-surface, #ffffff);
  border: 1px solid var(--xt-border, #e3e8ee);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(10, 37, 64, 0.12);
  padding: 6px;
  z-index: 20;
}
.xt-shell__user-menu-head {
  padding: 10px 12px;
  border-bottom: 1px solid var(--xt-border-subtle, #f0f0f3);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.xt-shell__user-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--xt-fg, #0a2540);
}
.xt-shell__user-email {
  font-size: 12px;
  color: var(--xt-fg-muted, #697386);
}
.xt-shell__user-menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  border: none;
  background: transparent;
  color: var(--xt-fg, #0a2540);
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
}
.xt-shell__user-menu-item:hover {
  background: var(--xt-bg-hover, #f0f2f6);
}

.xt-shell__content {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 24px;
}

@media (max-width: 768px) {
  .xt-shell {
    grid-template-columns: 64px 1fr;
  }
  .xt-shell__brand-name,
  .xt-shell__nav-label {
    display: none;
  }
}
</style>
