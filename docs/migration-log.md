# Migration log

Per-FE adoption of `@xtrakt-ai/design-tokens` and the ui-* packages. Status
is tracked here so we can drop the per-FE mirrored copies once everyone is
on the published package.

## Phase 0 — Mirror landed (2026-04-27)

| FE | Mirror commit | Branch |
|---|---|---|
| xtrakt-ecm-fe | `a26000e` | main |
| xtrakt-sign-fe | `dfc8471` | main |
| xtrakt-template-fe | `0b7be7a` | main |
| xtrakt-tickets-fe | `4af8dea` | main |
| xtrakt-portal-fe | `c20fa2d` | develop |
| xtrakt-platform-fe | already canonical | main |
| xtrakt-id-fe | already canonical | main |
| xtrakt-workflow-fe | `a779bad` | main |

Source-of-truth file: `xtrakt-platform-fe/src/src/styles/design-tokens.css`.
Each FE keeps `src/styles/design-tokens.css` (Vue) or
`src/src/styles/design-tokens.css` (Angular) plus a local
`src/components/XBreadcrumb.vue` (Vue only).

## Phase 1 — Package published (TODO operator)

Operator steps:

1. `gh repo create xtrakt-ai/xtrakt-design-system --public --source . --push`
2. From the repo root: `git tag vdesign-tokens@1.0.0 && git push --tags`
3. Confirm the publish workflow succeeded; the package shows up at
   `https://github.com/xtrakt-ai/packages` with version 1.0.0.
4. Repeat tagging for `vui-vue@1.0.0` and `vui-angular@1.0.0`.

## Phase 2 — Per-FE adoption (TODO)

Status: `M` mirrored, `P` package, `D` mirror deleted.

| FE | tokens | ui-* | Notes |
|---|---|---|---|
| xtrakt-platform-fe | M | n/a | Reference implementation; switch to package without breadcrumb refactor. |
| xtrakt-id-fe | M | n/a | Auth-only; tokens import only. |
| xtrakt-workflow-fe | M | n/a | Tokens import only. |
| xtrakt-portal-fe | M | M (XBreadcrumb available, AppHeader uses inline) | Branch `develop`. |
| xtrakt-ecm-fe | M | M | App.vue topbar wired. |
| xtrakt-sign-fe | M | M | App.vue topbar wired. |
| xtrakt-template-fe | M | M | App.vue topbar wired. |
| xtrakt-tickets-fe | M | M | MainLayout wired. |

When an FE flips to `P`, that PR should:
1. `npm install --save @xtrakt-ai/design-tokens@^1 @xtrakt-ai/ui-vue@^1`
   (or `ui-angular`).
2. Replace `@import './styles/design-tokens.css'` with
   `@import '@xtrakt-ai/design-tokens/tokens.css'`.
3. Update component imports per the recipes in each package README.
4. Delete the mirrored files (`src/styles/design-tokens.css`,
   `src/components/XBreadcrumb.vue`).
5. Add a row entry below transitioning M → P → D.
