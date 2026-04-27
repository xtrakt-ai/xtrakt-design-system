# @xtrakt-ai/ui-angular

Angular standalone UI primitives styled with `@xtrakt-ai/design-tokens`.

## Install

```
npm install @xtrakt-ai/design-tokens @xtrakt-ai/ui-angular
```

## Setup

```scss
// src/src/styles.scss
@import '@xtrakt-ai/design-tokens/tokens.css';
```

```html
<!-- App template root -->
<div class="xt-redesign">
  <router-outlet></router-outlet>
</div>
```

## Components

### `XBreadcrumbComponent`

Standalone — import directly:

```ts
import { XBreadcrumbComponent } from '@xtrakt-ai/ui-angular'

@Component({
  selector: 'menu',
  standalone: true,
  imports: [XBreadcrumbComponent],
  template: `<x-breadcrumb [items]="crumbs" />`,
})
export class MenuComponent {
  crumbs = [
    { label: 'Xtrakt', to: '/' },
    { label: 'Templates', to: '/templates' },
    { label: 'Edit' },
  ]
}
```

Props:

| Input | Type | Notes |
|---|---|---|
| `items` | `BreadcrumbItem[]` | `[{ label, to? }]`. Last item is rendered non-clickable. |

## Migration recipe

Each Angular FE that already declared its own breadcrumb in template HTML
swaps for the imported component:

```diff
- <div class="breadcrumbs">
-   <span>Xtrakt</span> <span>/</span>
-   <span class="active">{{ pageTitle }}</span>
- </div>
+ <x-breadcrumb [items]="crumbs" />
```

The CSS classes in the imported component (`.xt-breadcrumb`, `.sep`,
`.active`) are scoped to the component's view, so they don't collide with
existing global selectors.
