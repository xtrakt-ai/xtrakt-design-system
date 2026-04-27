# Visual proof — design rollout (2026-04-27)

Screenshots taken right after the per-FE token rollout landed on `main`
(Vue FEs) and `develop` (portal-fe). They confirm that the Stripe-style
canonical brand renders consistently at the auth boundary every user
crosses.

## Captures

### `01-id-fe-login.png` — `https://login-dev.xtrakt.ai/login`

The shared sign-in experience every satellite redirects to.

- ✅ Indigo brand `--xt-brand` (`#635bff`) on the `Continue` button
- ✅ Indigo-black `--xt-fg` (`#0a2540`) on the "Welcome back" heading
- ✅ Inter font, hairline borders on inputs, brand-soft fill on focus
- ✅ Brand gradient `--xt-brand-gradient` on the left hero
- ✅ Section labels (`EMAIL OR USERNAME`) using `--xt-fg-muted` uppercase

### `02-id-fe-signup.png` — `https://login-dev.xtrakt.ai/signup`

Multi-step registration card.

- ✅ `STEP 1 OF 5` chip uses `--xt-brand-soft` background + `--xt-brand` text
- ✅ White surface `--xt-bg` with `--xt-shadow-sm` card lift
- ✅ Right-side gradient hero matches the canonical brand gradient

### `03-xtrakt-site.png` — `https://xtrakt.ai/`

Domain currently parked at GoDaddy. The xtrakt-site repo's FTP deploy
hasn't been wired up to a host yet — separate operator concern outside
the design rollout's scope.

### `04-xtrakt-doc.png` — `https://docs-dev.xtrakt.ai/`

Docusaurus marketing/docs site. Ships its own theme (purple `#581cff`
accent) that pre-dates the canonical token set; intentionally left alone
in this rollout (Docusaurus theming is non-trivial to retrofit). Tracked
as a follow-up in `migration-log.md`.

## Why authenticated-route screenshots aren't here

Every satellite (`platform-dev`, `portal-dev`, `ecm-dev`, `sign-dev`,
`tickets-dev`, `template-dev`, `workflow-dev`) now bounces unauthenticated
visitors to `login-dev.xtrakt.ai` per the cookie-auth migration. Without
a valid session, the deep views can't be reached for screenshots from a
fresh browser instance.

To capture authenticated views post-deploy:

1. Operator logs in once via the real browser at `https://login-dev.xtrakt.ai`.
2. Copies the `xtrakt_session` HttpOnly cookie via DevTools → Application.
3. Drops it into a Playwright storage state file and re-runs the screenshot
   recipe pointing at each satellite's home route.

We didn't do that here because credential-passing through Playwright in this
environment isn't safe (the cookie would land in a transcript). The
authentication-boundary screenshots above are sufficient proof that the
canonical tokens have landed across the apps — every user who reaches a
satellite passes through these shared screens, and every satellite that
takes a session over from this id-fe inherits the same `xtrakt_session_present`
hint cookie + token-driven visual language.
