# xtrakt-design-system

Single source of truth for the xtrakt visual language. Replaces the per-FE
mirrored copies of `design-tokens.css` and `XBreadcrumb.vue` that landed in
the design-standardization rollout.

## Packages

| Package | What it ships | Consumers |
|---|---|---|
| `@xtrakt-ai/design-tokens` | `tokens.css`, optional Tailwind preset, SCSS mixins | every FE |
| `@xtrakt-ai/ui-vue` | XBreadcrumb, XButton, XInput, XCard, XBadge | Vue FEs (portal, ecm, sign, tickets, template) |
| `@xtrakt-ai/ui-angular` | Breadcrumb, Button, Card components + module | Angular FEs (platform, id, workflow) |

All three publish to GitHub Packages (`npm.pkg.github.com/xtrakt-ai`).

## Migration plan (per FE)

Each FE currently ships:
- `src/styles/design-tokens.css` — replace with `import '@xtrakt-ai/design-tokens/tokens.css'`
- `src/components/XBreadcrumb.vue` (Vue) or inline breadcrumb (Angular) — replace
  with package imports

The mirrored copies stay valid until each FE migrates; the package preserves
the same CSS variable names (`--xt-*`) and the same component public API
(props `items`, `rootLabel`).

### Example — ECM-fe (Vue)

Before:
```ts
// src/style.css
@import './styles/design-tokens.css';
// src/App.vue
import XBreadcrumb from '@/components/XBreadcrumb.vue'
```

After:
```ts
// package.json
"dependencies": {
  "@xtrakt-ai/design-tokens": "^1.0.0",
  "@xtrakt-ai/ui-vue": "^1.0.0"
}
// src/style.css
@import '@xtrakt-ai/design-tokens/tokens.css';
// src/App.vue
import { XBreadcrumb } from '@xtrakt-ai/ui-vue'
```

Then delete `src/styles/design-tokens.css` and `src/components/XBreadcrumb.vue`.

### Example — Workflow-fe (Angular)

Before:
```scss
// src/src/styles.scss
@import './styles/design-tokens.css';
```

After:
```scss
// src/src/styles.scss
@import '@xtrakt-ai/design-tokens/tokens.css';
```

```ts
// app.module.ts
import { XtraktUiAngularModule } from '@xtrakt-ai/ui-angular'
@NgModule({ imports: [XtraktUiAngularModule] })
```

Then delete `src/src/styles/design-tokens.css`.

## Operator setup before first publish

1. Create the GitHub repository `xtrakt-ai/xtrakt-design-system`:
   ```
   gh repo create xtrakt-ai/xtrakt-design-system --public --source . --push
   ```

2. Provision the GitHub Packages registry. The org-level
   `GIT_PACKAGES_USER` / `GIT_PACKAGES_TOKEN` already used by every BE for
   private NuGet feeds covers npm packages too.

3. The publish workflow (`.github/workflows/publish.yml`) runs on tag pushes
   in the form `v<package>@<version>` (e.g. `vdesign-tokens@1.0.0`).

4. After the initial publish, each FE bumps its `package.json` and follows
   the migration recipe above. The mirrored copies can be deleted in the
   same commit.

## Why a monorepo

Three small packages with one canonical token file and a shared release
cadence beats three separate repos with three separate bumps. npm
`workspaces` resolves the cross-package dev dependency (ui-vue / ui-angular
both consume design-tokens) without `npm link` gymnastics.

## Versioning

- `@xtrakt-ai/design-tokens` is the lower-level dependency; it should rev
  rarely (any breaking name change is a major bump).
- `@xtrakt-ai/ui-*` peer-depend on design-tokens. Bump them more often as
  components evolve.
- Breaking changes ship behind a major bump; the per-FE PRs that adopt the
  new major are tracked in `docs/migration-log.md`.
