# D-04 — Compatibility-alias boundary (policy)

The primitive-token migration (D-04) removed every app-level use of the
legacy alias variables. What remains of those aliases is a small,
intentional compatibility layer. This document is the authoritative
statement of where that layer is allowed to live, so future code does not
reintroduce legacy fallback patterns.

## The legacy aliases

These six variables are **compatibility-only**. New code must never read
them (`var(--alias)`) or define them:

| Alias | Canonical replacement |
|---|---|
| `--brand-primary` | `--color-primary` |
| `--brand-primary-deep` | `--color-primary-hover` |
| `--brand-primary-soft` | `--color-primary-soft` |
| `--xt-primary` | `--color-primary` |
| `--accent` | `--color-primary` |
| `--neu-accent` | `--color-primary` |

`--brand-primary{,-deep,-soft}` are the internal *primitives* the palette
is built from; the other three are historical names mapped onto them.
App code targets the semantic layer (`--color-primary`,
`--surface-*`, `--text-*`, …) listed in the README.

## Approved alias sources

The aliases may be **defined or written** only in these places:

| Source | Repo | Why it is allowed |
|---|---|---|
| `packages/design-tokens/src/tokens.css` | xtrakt-design-system | Canonical definition: declares the primitives and maps every legacy alias onto them, so stale consumers keep rendering correctly. |
| `src/style.css` | Vite/Vue frontends (xtrakt-portal-fe, xtrakt-sign-fe, xtrakt-ecm-fe, xtrakt-tickets-fe, xtrakt-template-fe) | App entry stylesheet that vendors/bridges the token layer (local mirrors, not npm installs). |
| `src/app/services/tenant-branding.service.ts` | xtrakt-platform-fe | Runtime tenant theming writes the `--brand-primary*` primitives on `:root`; the semantic tokens cascade from them. This is the *only* approved write path outside CSS. |

Everything else — component styles, templates, inline styles, TS — is
**app level** and must use canonical tokens only.

> Historical note: `src/styles/design-tokens.css` appears in older copies
> of the checker's allowlist but no longer exists in any repo. Repos
> should drop it from their allowlist when they next touch the checker
> (xtrakt-platform-fe already has). Do not recreate a file at that path.

## Enforcement

Three guards back this policy:

1. **Per-repo checker** — `scripts/check-legacy-token-usage.mjs`
   (`npm run lint:tokens:legacy`). Zero-dependency; fails on any
   `var(--alias` read or `--alias:` definition outside the approved
   sources above. Each consumer repo carries a copy whose `allowedFiles`
   set must list **only the approved sources that actually exist in that
   repo** — a broader allowlist silently masks regressions.
2. **Stylelint config** — `stylelint-config-no-legacy-tokens.json`
   (shipped by this package) blocks `var(--alias…)` in declaration
   values for consumers that extend it.
3. **Design-system CI** — `cloudbuild.yaml` runs the checker before
   building/publishing the packages, so an alias leaking into
   `packages/*` outside `tokens.css` fails the build.

## Changing the boundary

The default answer to "can I add a file to the allowlist?" is **no —
migrate the code to canonical tokens instead**. If a genuinely new token
source is needed (e.g. another runtime branding writer), the change must
update this document and the relevant checker allowlist in the same PR.

## Rollback

Individual token migrations can be reverted if they break theming, but
the guard and this policy boundary stay intact — revert the migration,
not the enforcement.
