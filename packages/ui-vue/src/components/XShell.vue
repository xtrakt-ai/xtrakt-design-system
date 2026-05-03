<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

export interface XShellNavItem {
  label: string
  /** Route the item navigates to. Optional for parent nodes that only group
   *  children — when omitted, clicking the item just toggles expansion. */
  to?: string
  icon?: string
  /** Visually-hidden a11y description for icon-only collapsed state */
  ariaLabel?: string
  /** Optional nested items. When present, renders an expandable group with a
   *  chevron and children indented. The shell renders up to 3 visual levels. */
  children?: XShellNavItem[]
  /** Initial expanded state for parent nodes. Defaults to false. The shell
   *  also auto-expands any branch whose descendant matches the current URL. */
  expanded?: boolean
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
 * Nav supports up to 3 levels of nesting via XShellNavItem.children. Group
 * nodes (no `to`) render as expand/collapse buttons; linkable parents keep
 * their RouterLink and expose the chevron as a separate stop-propagating
 * button so clicking the label still navigates. Branches whose descendant
 * matches the current router URL auto-expand on every navigation.
 *
 * Pure tokens — no hardcoded hex. Consumers in pt-BR or other locales pass
 * already-translated strings (the shell itself renders no app text apart
 * from the user-menu Logout label, which is overridable).
 *
 * Usage:
 *   <XShell :brand="{ name: 'fluex ECM' }" :nav="navItems" :user="user" @logout="onLogout">
 *     <template #breadcrumb><XBreadcrumb /></template>
 *     <template #topbar-actions><button>...</button></template>
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

const router = useRouter()
const collapsed = ref(props.initialCollapsed)
const userMenuOpen = ref(false)
/** Set of expanded path IDs. Path = dotted index trail like "3.2.1". */
const expanded = ref<Set<string>>(new Set())

function isExpanded(path: string): boolean {
  return expanded.value.has(path)
}

function toggleExpansion(path: string, event?: Event): void {
  event?.preventDefault()
  event?.stopPropagation()
  const next = new Set(expanded.value)
  if (next.has(path)) next.delete(path)
  else next.add(path)
  expanded.value = next
}

function urlMatchesRoute(url: string, route: string): boolean {
  const u = url.split('?')[0].split('#')[0]
  return u === route || u.startsWith(route + '/')
}

/** Apply each item.expanded === true into the path set on initial load. */
function applyInitialExpansion(items: XShellNavItem[]): void {
  const next = new Set(expanded.value)
  const visit = (list: XShellNavItem[], prefix: string) => {
    list.forEach((item, i) => {
      const path = prefix === '' ? `${i}` : `${prefix}.${i}`
      if (item.expanded) next.add(path)
      if (item.children?.length) visit(item.children, path)
    })
  }
  visit(items, '')
  expanded.value = next
}

/** Auto-expand every ancestor of the current router URL. */
function syncExpansionToUrl(): void {
  const url = router.currentRoute.value.fullPath
  const next = new Set(expanded.value)
  const visit = (list: XShellNavItem[], prefix: string): boolean => {
    let any = false
    list.forEach((item, i) => {
      const path = prefix === '' ? `${i}` : `${prefix}.${i}`
      const childMatched = item.children?.length ? visit(item.children, path) : false
      const selfMatched = !!item.to && urlMatchesRoute(url, item.to)
      if (childMatched || (selfMatched && item.children?.length)) {
        next.add(path)
        any = true
      }
      if (selfMatched) any = true
    })
    return any
  }
  visit(props.nav, '')
  expanded.value = next
}

onMounted(() => {
  applyInitialExpansion(props.nav)
  syncExpansionToUrl()
})

// Re-seed expansion + sync to URL whenever the nav array changes (locale
// load, async menu fetch). Also re-sync on every navigation.
watch(() => props.nav, (next) => {
  if (next?.length) {
    applyInitialExpansion(next)
    syncExpansionToUrl()
  }
})
watch(() => router.currentRoute.value.fullPath, () => syncExpansionToUrl())

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
        <template v-for="(item, i) in nav" :key="i">
          <NavNode :item="item" :depth="0" :path="String(i)" :collapsed="collapsed"
                   :is-expanded="isExpanded" :toggle="toggleExpansion" />
        </template>
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
import type { Directive, PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { RouterLink as RL } from 'vue-router'

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

/**
 * Internal recursive nav renderer. Cap at 3 visual levels (depth 0,1,2);
 * any deeper children get flattened under the depth-2 parent. Kept inline
 * because Vue 3 SFC <script setup> can't expose a recursive sub-component
 * to its own template without this wrapper.
 */
const NavNode = defineComponent({
  name: 'XShellNavNode',
  props: {
    item: { type: Object as PropType<{ label: string; to?: string; icon?: string; ariaLabel?: string; children?: any[] }>, required: true },
    depth: { type: Number, default: 0 },
    path: { type: String, required: true },
    collapsed: { type: Boolean, default: false },
    isExpanded: { type: Function as PropType<(p: string) => boolean>, required: true },
    toggle: { type: Function as PropType<(p: string, e?: Event) => void>, required: true },
  },
  setup(p) {
    return () => {
      const hasChildren = !!(p.item.children && p.item.children.length)
      const showChildren = hasChildren && p.isExpanded(p.path) && p.depth < 2
      const labelTitle = p.collapsed ? (p.item.ariaLabel ?? p.item.label) : undefined

      const linkContent = [
        p.item.icon ? h('span', { class: 'xt-shell__nav-icon', innerHTML: p.item.icon, 'aria-hidden': 'true' }) : null,
        h('span', { class: 'xt-shell__nav-label' }, p.item.label),
        hasChildren ? h('button', {
          type: 'button',
          class: ['xt-shell__nav-chevron', { 'xt-shell__nav-chevron--open': p.isExpanded(p.path) }],
          'aria-label': p.isExpanded(p.path) ? `Collapse ${p.item.label}` : `Expand ${p.item.label}`,
          'aria-expanded': p.isExpanded(p.path),
          onClick: (e: Event) => p.toggle(p.path, e),
        }, h('span', { 'aria-hidden': 'true' }, '▾')) : null,
      ]

      const rowChildren = p.item.to
        ? h(RL as any, {
            to: p.item.to,
            class: ['xt-shell__nav-item', { 'xt-shell__nav-item--has-children': hasChildren }],
            activeClass: 'xt-shell__nav-item--active',
            title: labelTitle,
          }, () => linkContent)
        : h('button', {
            type: 'button',
            class: ['xt-shell__nav-item', 'xt-shell__nav-item--group', { 'xt-shell__nav-item--has-children': hasChildren }],
            'aria-expanded': p.isExpanded(p.path),
            title: labelTitle,
            onClick: (e: Event) => p.toggle(p.path, e),
          }, [
            p.item.icon ? h('span', { class: 'xt-shell__nav-icon', innerHTML: p.item.icon, 'aria-hidden': 'true' }) : null,
            h('span', { class: 'xt-shell__nav-label' }, p.item.label),
            h('span', { class: ['xt-shell__nav-chevron', { 'xt-shell__nav-chevron--open': p.isExpanded(p.path) }], 'aria-hidden': 'true' }, '▾'),
          ])

      const row = h('div', {
        class: ['xt-shell__nav-row', { 'xt-shell__nav-row--child': p.depth > 0, 'xt-shell__nav-row--grandchild': p.depth > 1 }],
      }, rowChildren)

      const childrenBlock = showChildren
        ? h('div', {
            class: ['xt-shell__nav-children', `xt-shell__nav-children--depth-${p.depth}`],
          }, (p.item.children ?? []).map((child, j) => h(NavNode, {
            item: child, depth: p.depth + 1, path: `${p.path}.${j}`,
            collapsed: p.collapsed, isExpanded: p.isExpanded, toggle: p.toggle,
          })))
        : null

      return [row, childrenBlock]
    }
  },
})

export default {
  components: { NavNode },
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
.xt-shell--collapsed { grid-template-columns: 64px 1fr; }

.xt-shell__sidebar {
  position: sticky; top: 0; height: 100vh;
  background: var(--xt-surface, #ffffff);
  border-right: 1px solid var(--xt-border, #e3e8ee);
  display: flex; flex-direction: column; overflow: hidden;
}

.xt-shell__brand {
  display: flex; align-items: center; gap: 10px;
  padding: 18px 16px; height: 56px; flex: 0 0 auto;
}
.xt-shell__brand img,
.xt-shell__brand-mark {
  width: 28px; height: 28px; flex: 0 0 auto; border-radius: 6px;
}
.xt-shell__brand-mark {
  background: var(--xt-brand, #581cff);
  color: var(--xt-on-brand, #ffffff);
  display: flex; align-items: center; justify-content: center; font-weight: 700;
}
.xt-shell__brand-name {
  font-weight: 600; font-size: 14px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.xt-shell--collapsed .xt-shell__brand-name { display: none; }

.xt-shell__nav {
  flex: 1 1 auto; overflow-y: auto;
  padding: 8px; display: flex; flex-direction: column; gap: 2px;
}
.xt-shell__nav-row { display: block; }
.xt-shell__nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px;
  color: var(--xt-fg-muted, #425466);
  text-decoration: none; font-size: 13.5px;
  transition: background 0.12s ease, color 0.12s ease;
  width: 100%; box-sizing: border-box;
  background: transparent; border: none; cursor: pointer; text-align: left;
  font-family: inherit;
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
.xt-shell__nav-item--group {
  color: var(--xt-fg, #0a2540);
  font-weight: 500;
}
.xt-shell__nav-icon {
  width: 18px; height: 18px;
  display: inline-flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
}
.xt-shell__nav-label {
  flex: 1 1 auto; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.xt-shell__nav-chevron {
  flex: 0 0 auto;
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  background: transparent; border: none; padding: 0; cursor: pointer;
  color: inherit; opacity: 0.6;
  transition: transform 0.18s ease, opacity 0.12s ease;
  font-size: 11px; line-height: 1;
}
.xt-shell__nav-chevron:hover { opacity: 1; }
.xt-shell__nav-chevron--open { transform: rotate(180deg); opacity: 0.85; }

/* Indented children — each depth level adds a left padding + soft guide line. */
.xt-shell__nav-children { display: flex; flex-direction: column; gap: 2px; }
.xt-shell__nav-children--depth-0 .xt-shell__nav-row,
.xt-shell__nav-children--depth-1 .xt-shell__nav-row {
  padding-left: 12px;
  border-left: 1px solid var(--xt-border, #e3e8ee);
  margin-left: 14px;
}
.xt-shell__nav-row--child > .xt-shell__nav-item { font-size: 13px; }
.xt-shell__nav-row--grandchild > .xt-shell__nav-item { font-size: 12.5px; opacity: 0.92; }

.xt-shell--collapsed .xt-shell__nav-label,
.xt-shell--collapsed .xt-shell__nav-chevron,
.xt-shell--collapsed .xt-shell__nav-children { display: none; }
.xt-shell--collapsed .xt-shell__nav-item { justify-content: center; padding: 9px 0; }

.xt-shell__collapse-btn {
  margin: 8px; padding: 6px;
  border: 1px solid var(--xt-border, #e3e8ee);
  background: var(--xt-surface, #ffffff);
  color: var(--xt-fg-muted, #425466);
  border-radius: 6px; cursor: pointer; font-size: 14px; line-height: 1;
}
.xt-shell__collapse-btn:hover { background: var(--xt-bg-hover, #f0f2f6); }

.xt-shell__main { display: flex; flex-direction: column; min-width: 0; }
.xt-shell__topbar {
  height: 56px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--xt-border, #e3e8ee);
  background: var(--xt-surface, #ffffff);
  position: sticky; top: 0; z-index: 10;
}
.xt-shell__topbar-left,
.xt-shell__topbar-right { display: flex; align-items: center; gap: 12px; }

.xt-shell__user { position: relative; }
.xt-shell__user-trigger {
  border: none; background: transparent; padding: 0;
  cursor: pointer; border-radius: 50%;
}
.xt-shell__user-trigger:focus-visible {
  outline: 2px solid var(--xt-brand, #581cff); outline-offset: 2px;
}
.xt-shell__avatar {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--xt-brand, #581cff);
  color: var(--xt-on-brand, #ffffff);
  font-size: 12px; font-weight: 600;
}
.xt-shell__user-menu {
  position: absolute; top: calc(100% + 6px); right: 0;
  min-width: 220px;
  background: var(--xt-surface, #ffffff);
  border: 1px solid var(--xt-border, #e3e8ee);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(10, 37, 64, 0.12);
  padding: 6px; z-index: 20;
}
.xt-shell__user-menu-head {
  padding: 10px 12px;
  border-bottom: 1px solid var(--xt-border-subtle, #f0f0f3);
  display: flex; flex-direction: column; gap: 2px;
}
.xt-shell__user-name {
  font-weight: 600; font-size: 13px; color: var(--xt-fg, #0a2540);
}
.xt-shell__user-email {
  font-size: 12px; color: var(--xt-fg-muted, #697386);
}
.xt-shell__user-menu-item {
  display: block; width: 100%; text-align: left;
  padding: 9px 12px; border: none; background: transparent;
  color: var(--xt-fg, #0a2540); font-size: 13px; cursor: pointer;
  border-radius: 6px;
}
.xt-shell__user-menu-item:hover { background: var(--xt-bg-hover, #f0f2f6); }

.xt-shell__content {
  flex: 1 1 auto; overflow-y: auto; padding: 24px;
}

@media (max-width: 768px) {
  .xt-shell { grid-template-columns: 64px 1fr; }
  .xt-shell__brand-name,
  .xt-shell__nav-label { display: none; }
}
</style>
