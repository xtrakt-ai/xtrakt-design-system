# D-02 — Hex literal migration plan

The May 3 audit flagged **489 hex literals** in xtrakt-portal-fe alone
that bypass the canonical design tokens shipped by
`@xtrakt-ai/design-tokens`. A 2026-05-03 recount (excluding hex inside
`var(--xt-*, #fallback)` defaults and SCSS comments) puts the real
"true bypass" surface at:

| Repo | True bypasses | Inflated count from audit |
|---|---|---|
| xtrakt-portal-fe   | 458 | 489 |
| xtrakt-platform-fe | 164 | 269 |
| xtrakt-tickets-fe  |  74 |  90 |
| xtrakt-id-fe       |  70 |  93 |
| xtrakt-workflow-fe |  32 |  32 |
| xtrakt-template-fe |  28 |  50 |
| xtrakt-design-system |  25 |  63 |
| xtrakt-sign-fe     |  13 |  21 |
| xtrakt-ecm-fe      |   7 |  17 |
| **Total**          | **871** | **1124** |

The `var(--xt-*, #fallback)` pattern is **legitimate and not a bypass** —
it renders the token color when the design-tokens stylesheet is loaded
and falls back to the hex when it isn't (e.g. during the brief
critical-CSS window before the tokens import resolves).

## Adoption plan

This is a multi-day refactor across 9 repos. Suggested rollout:

### Phase 1 — Lock the rule (this commit)

1. Ship `stylelint-config-no-hex.json` in `@xtrakt-ai/design-tokens`
   so every consumer can import it.
2. Add to each FE's `package.json` devDependencies:
   ```
   "stylelint": "^16.0.0",
   "stylelint-config-no-hex": "file:../xtrakt-design-system/packages/design-tokens"
   ```
   (Or after publish: `"@xtrakt-ai/design-tokens": "^2.0.0"` + a tiny
   `.stylelintrc.json` that extends `@xtrakt-ai/design-tokens/stylelint-config-no-hex`.)
3. Add to each FE's `package.json` scripts:
   ```
   "lint:css": "stylelint 'src/**/*.{css,scss,vue}'",
   "lint:css:fix": "stylelint 'src/**/*.{css,scss,vue}' --fix"
   ```
4. Add a `pre-commit` hook (lefthook / husky) that runs `lint:css`
   on staged files.

This **prevents new hex literals from landing** even before the existing
ones are cleaned up.

### Phase 2 — Burn-down per FE (one PR per FE)

For each FE, in priority order (smallest first to validate the pattern):

1. `xtrakt-ecm-fe` (7 bypasses) — quick win, validates the migration
2. `xtrakt-sign-fe` (13)
3. `xtrakt-design-system` (25 — these are mostly inside the tokens
   package itself; review whether they're definitions or stragglers)
4. `xtrakt-template-fe` (28)
5. `xtrakt-workflow-fe` (32)
6. `xtrakt-id-fe` (70) — high-visibility (login screen)
7. `xtrakt-tickets-fe` (74)
8. `xtrakt-platform-fe` (164)
9. `xtrakt-portal-fe` (458) — the long pole

### Phase 3 — Promote to error (after each FE passes)

When a repo's `lint:css` is green:

1. Bump the rule severity from `warning` to `error` in that repo's
   `.stylelintrc.json` so the lint break is now blocking.
2. Wire `lint:css` into the Cloud Build step before the docker build,
   so a regression fails the deploy.

## Migration recipe per file

For each `#xxxxxx` found:

1. Look up the closest token in `@xtrakt-ai/design-tokens`'s
   `tokens.css` (`--xt-brand`, `--xt-fg`, `--xt-bg`, `--xt-surface`,
   `--xt-border`, `--xt-success`, `--xt-warning`, `--xt-danger`, etc.).
2. Replace with `var(--xt-<token>)` — NO fallback hex unless this
   value renders before the tokens stylesheet loads (rare; typically
   only the `<body>` background and the loading splash).
3. If no token matches, propose a new token in design-tokens FIRST
   (don't invent a one-off variable in the consumer FE).
