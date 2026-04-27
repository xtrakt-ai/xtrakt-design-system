# @xtrakt-ai/ui-vue

Vue 3 UI primitives styled with `@xtrakt-ai/design-tokens`. Drop-in replacement
for the per-FE `XBreadcrumb.vue` mirror that landed in the design rollout.

## Install

```
npm install @xtrakt-ai/design-tokens @xtrakt-ai/ui-vue
```

## Setup

```ts
// src/style.css
@import '@xtrakt-ai/design-tokens/tokens.css';
```

```vue
<!-- App.vue or MainLayout.vue -->
<template>
  <div class="app xt-redesign">
    <router-view />
  </div>
</template>
```

## Components

```ts
import { XBreadcrumb, XButton, XInput, XCard, XBadge } from '@xtrakt-ai/ui-vue'
```

### `<XBreadcrumb>`

```vue
<XBreadcrumb
  :items="[{ label: 'Tickets', to: '/tickets' }, { label: ticket.subject }]"
/>
```

Props:

| Prop | Type | Notes |
|---|---|---|
| `items` | `{ label: string; to?: string }[]` | When omitted, derives from `route.name`. |
| `rootLabel` | `string` | First crumb when items aren't provided. Default `'Home'`. |

### `<XButton>`

```vue
<XButton variant="primary" @click="save">Save</XButton>
<XButton variant="secondary" size="sm">Cancel</XButton>
<XButton variant="danger">Delete</XButton>
```

Props: `variant` (`primary` | `secondary` | `ghost` | `danger`), `size`
(`sm` | `base` | `lg` | `icon`), `disabled`, native `type`.

### `<XInput>`

```vue
<XInput v-model="email" type="email" placeholder="you@xtrakt.ai" />
<XInput v-model="notes" multiline placeholder="Notes…" />
```

### `<XCard>`

```vue
<XCard>
  <h3>Plain card</h3>
</XCard>

<XCard interactive @click="openDetail">
  <h3>Hover lifts</h3>
</XCard>

<XCard flat>
  <h3>No shadow</h3>
</XCard>
```

### `<XBadge>`

```vue
<XBadge variant="success">Active</XBadge>
<XBadge variant="warning">Pending</XBadge>
<XBadge variant="danger">Failed</XBadge>
```

## Migrating from per-FE mirrors

Each Vue FE that consumed the mirrored breadcrumb deletes its local copy:

```diff
- import XBreadcrumb from '@/components/XBreadcrumb.vue'
+ import { XBreadcrumb } from '@xtrakt-ai/ui-vue'
```

The component's public API (props `items`, `rootLabel`) is identical to the
mirrored copy.
