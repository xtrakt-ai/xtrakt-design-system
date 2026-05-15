# `@xtrakt-ai/design-tokens` — Phase 2 migration runbook (D-03)

## What this document is

This is the operational runbook for finishing **D-03** from the R7 design
audit (2026-05-15). The decision: **stop vendoring, depend on the npm
package**. Phase 1 (this commit) prepared the ground; Phase 2 deletes the
mirrors once the new canonical version is live on GitHub Packages.

## Phase 1 — done in this commit

1. The dark-mode block (`:root[data-theme="dark"]`) and the post-2.2.0
   extension tokens (`--xt-brand-light`, `--xt-warning-bg/-border/-border-strong/
   -text/-text-strong`) were promoted from the platform-fe vendored mirror back
   into canonical `packages/design-tokens/src/tokens.css`.
2. `packages/design-tokens/package.json` bumped from `2.2.0` to `2.3.0`.
3. The 4 consumer FEs now declare `"@xtrakt-ai/design-tokens": "^2.3.0"`:
   - `xtrakt-platform-fe/src/package.json` (added — was transitive via ui-angular)
   - `xtrakt-id-fe/src/package.json` (added — wasn't depending on it at all)
   - `xtrakt-template-fe/package.json` (bumped from `^2.2.0`)
   - `xtrakt-tickets-fe/package.json` (bumped from `^2.2.0`)
4. Each vendored mirror now carries a "DEPRECATED MIRROR — D-03" header
   pointing at this runbook. The mirrors stay live so the dev server keeps
   booting before publish.

## Phase 2 — to run after `2.3.0` is published

### Step 1 — publish 2.3.0 to GitHub Packages

The publish workflow at `.github/workflows/publish.yml` auto-detects changes
under `packages/design-tokens/**` on push to `main` and publishes if the
version isn't already on the registry. So:

```bash
cd xtrakt-design-system
git add packages/design-tokens
git commit -m "design-tokens: 2.3.0 — promote dark mode + brand-light + warning banner"
git push origin main
```

Watch the **Publish package** workflow in the Actions tab. Confirm
`@xtrakt-ai/design-tokens@2.3.0` appears at
https://github.com/orgs/xtrakt-ai/packages.

### Step 2 — pull the new version into each FE

Per FE (run from the package.json directory):

```bash
npm install --legacy-peer-deps     # platform-fe & id-fe
# or
npm install                        # template-fe & tickets-fe
```

This rewrites `package-lock.json` to pin `@xtrakt-ai/design-tokens@2.3.0`.
Verify:

```bash
node -p "require('./node_modules/@xtrakt-ai/design-tokens/package.json').version"
# → 2.3.0
```

### Step 3 — switch each FE's import to the npm path

The mirror is currently imported from a relative path like
`@import "./styles/design-tokens.css"` (or `@import "/src/styles/design-tokens.css"`
in Vue Vite). Replace with:

```scss
@import "@xtrakt-ai/design-tokens/tokens.css";
```

Concrete locations (one import each):

| FE             | Import file                          | Current line                                   |
| -------------- | ------------------------------------ | ---------------------------------------------- |
| platform-fe    | `src/src/styles.scss`                | `@import "./styles/design-tokens.css";`        |
| id-fe          | `src/src/styles.scss`                | `@import "./styles/design-tokens.css";`        |
| template-fe    | `src/styles.scss` (or main.ts/css)   | check `grep -rn 'design-tokens' src`           |
| tickets-fe     | `src/styles.scss` (or main.ts/css)   | check `grep -rn 'design-tokens' src`           |

### Step 4 — delete the mirror

```bash
rm xtrakt-platform-fe/src/src/styles/design-tokens.css
rm xtrakt-id-fe/src/src/styles/design-tokens.css
rm xtrakt-template-fe/src/styles/design-tokens.css
rm xtrakt-tickets-fe/src/styles/design-tokens.css
```

### Step 5 — verify in each FE preview

Spin up the dev server (`npm start` for Angular, `npm run dev` for Vue) and
sanity-check:
- The theme palette is unchanged (purple primary, paper backgrounds light by default).
- Dark mode toggles correctly (visit `/company/personalization` in platform-fe
  and switch to "Escuro" — the whole tree should re-render dark).
- The platform-fe `template-list` engine-icon for `engine=google` still
  shows the mid-tone purple (`--xt-brand-light = #a78bfa`).
- The platform-fe `plan-upgrade` warm-amber banner still renders correctly
  (`--xt-warning-bg`, `--xt-warning-border`, `--xt-warning-text`).

### Step 6 — clean up the legacy `public/fonts/` copies (optional)

Before this migration, each FE shipped a copy of the Geist + Instrument Serif
WOFF2s under `public/fonts/` so the relative `url('/fonts/*.woff2')` paths
in the mirror resolved at serve time. With the npm import, the bundler
resolves `url('./fonts/geist-variable.woff2')` against
`node_modules/@xtrakt-ai/design-tokens/fonts/` and copies the WOFF2s into
the build output automatically.

The `public/fonts/` copies become dead weight. Safe to delete them in a
follow-up commit once Step 5 verifies the bundler-resolved fonts load
correctly in production builds.

## What if I need to roll back?

The mirrors are still on disk — restore the original `@import "./styles/design-tokens.css"`
import in `styles.scss`, undo the `package.json` bump, and the FE is back to
2.2.0 + vendored extensions.

## Why this matters

Before D-03 there were 4 vendored copies (529 + 510 + 482 + 482 lines) that
had drifted: only platform-fe had the brand-light + warning-banner extension
tokens, the dark-mode block lived in two slightly different forms across
platform-fe and id-fe, and template-fe + tickets-fe were already pinning the
npm package PLUS shipping a redundant local copy. That's 4+1 sources of
truth for the same color palette, with dark mode making each divergence
visually wrong on at least one theme. This migration collapses everything
back to one source.
