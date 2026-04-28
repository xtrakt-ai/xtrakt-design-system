# @xtrakt-ai/design-tokens

Canonical CSS design tokens for xTrakt frontends.

## Preferred Tokens

New screens should use the canonical names below instead of creating local
aliases such as `--neu-accent`, `--xt-primary`, `--brand-primary`, or
`--accent`.

- `--color-primary`, `--color-primary-hover`, `--color-primary-soft`
- `--surface-page`, `--surface-card`, `--surface-muted`, `--surface-selected`
- `--text-primary`, `--text-muted`, `--text-subtle`, `--text-inverse`
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`
- `--shadow-card`, `--shadow-card-hover`, `--shadow-elevated`
- `--border-subtle`, `--border-strong`, `--focus-ring`

The older `--xt-*` variables remain the implementation layer. Legacy aliases
are intentionally mapped to the canonical tokens so apps can migrate without a
large visual rewrite.

Canonical CSS design tokens for xtrakt. Stripe-style "technical authority" —
white surfaces, hairline borders, indigo brand `#635bff`, flat shadows.

## Install

```
npm install @xtrakt-ai/design-tokens
```

## Use

```css
/* In your entry CSS (style.css, styles.scss, etc.) */
@import '@xtrakt-ai/design-tokens/tokens.css';
```

Then opt routes / layout shells into the redesign by adding the `xt-redesign`
class to a wrapping element (App.vue root, MainLayout, etc.):

```html
<template>
  <div class="app xt-redesign">
    <router-view />
  </div>
</template>
```

That class scopes the canonical button / card / table / breadcrumb primitives
shipped inside `tokens.css`. Without it, only the `--xt-*` CSS variables
apply (your existing components automatically pick up the brand palette).

## Token reference (abbreviated)

| Group | Vars |
|---|---|
| Surfaces | `--xt-bg`, `--xt-surface`, `--xt-surface-muted` |
| Borders | `--xt-border`, `--xt-border-strong` |
| Foreground | `--xt-fg`, `--xt-fg-muted`, `--xt-fg-subtle`, `--xt-fg-inverse` |
| Brand | `--xt-brand`, `--xt-brand-hover`, `--xt-brand-soft`, `--xt-accent`, `--xt-brand-gradient` |
| Semantic | `--xt-success`, `--xt-warning`, `--xt-danger`, `--xt-info` (each plus `-soft`) |
| Radius | `--xt-r-ctrl` (4px), `--xt-r-card` (8px), `--xt-r-modal` (12px), `--xt-r-pill` |
| Sizing | `--xt-ctrl-h-{sm,base,lg}` |
| Spacing | `--xt-sp-{1..10}` (4–40px on a 4px baseline) |
| Shadows | `--xt-shadow-{sm,md,lg}` |
| Focus | `--xt-focus-ring` |
| Typography | `--xt-font`, `--xt-font-mono` |
| Motion | `--xt-ease`, `--xt-dur-{fast,base}` |

## Component primitives bundled in `tokens.css`

Activated under `.xt-redesign`:

- `.xt-btn` (variants `--primary`, `--secondary`, `--ghost`, `--danger`,
  sizes `--sm`, `--lg`, `--icon`)
- `.xt-input` (text inputs + textarea modifier)
- `.xt-card`, `.xt-card--flat`
- `.xt-tile` (interactive raised card with hover lift)
- `.xt-badge` (variants `--success`, `--warning`, `--danger`, `--info`,
  `--muted`)
- `.xt-table`
- `.xt-hero` (gradient banner)
- `.xt-icon-box`, `.xt-section-label`, `.xt-divider`

## Versioning policy

- **Major bump** when a `--xt-*` variable is renamed or removed.
- **Minor bump** when new variables / primitives are added.
- **Patch** for value tweaks (cosmetic).

Each FE pins to a major version range so cosmetic patches roll without code
changes. See the migration log in `docs/migration-log.md` at the monorepo
root.
