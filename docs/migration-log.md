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

## Phase 2 — Per-FE adoption

Status: `M` mirrored, `P` package + mirror, `D` mirror deleted.

| FE | tokens | ui-* | Commit | Branch | Notes |
|---|---|---|---|---|---|
| xtrakt-ecm-fe | D | D | `89bad1a` | main | Existing .npmrc + npm install Dockerfile. |
| xtrakt-sign-fe | D | D | `813359d` | main | Dockerfile npm ci → npm install. |
| xtrakt-portal-fe | D | D | `4ad825c` | develop | Dockerfile npm ci → npm install. |
| xtrakt-workflow-fe | D | n/a | `283174a` | main | Tokens only (no breadcrumb scope). |
| xtrakt-platform-fe | M | n/a | — | main | Needs Cloud Build _NODE_AUTH_TOKEN substitution. |
| xtrakt-id-fe | M | n/a | — | main | Needs Cloud Build _NODE_AUTH_TOKEN substitution. |
| xtrakt-template-fe | M | M | — | main | Needs .npmrc + Dockerfile ARG. |
| xtrakt-tickets-fe | M | M | — | main | Needs .npmrc + Dockerfile ARG. |

### Pendência operacional para os 4 FEs em estado `M`

Cada um precisa:

1. Criar `.npmrc` no diretório do `package.json`:
   ```
   @xtrakt-ai:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
   always-auth=true
   ```

2. Atualizar Dockerfile pra receber e usar o token:
   ```dockerfile
   ARG NODE_AUTH_TOKEN
   COPY package*.json .npmrc ./
   RUN NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN npm install --no-audit --no-fund
   ```

3. Atualizar `cloudbuild.yaml` (FEs que migraram pra Cloud Build:
   id-fe, platform-fe) pra passar o token como build-arg via
   `--build-arg=NODE_AUTH_TOKEN=$$NODE_AUTH_TOKEN` numa step com
   `secretEnv: [NODE_AUTH_TOKEN]` apontando pro secret
   `xtrakt-json-git-packages-token` no Secret Manager. Para
   tickets-fe / template-fe (sem cloudbuild.yaml), o Cloud Build
   trigger substitution `_NODE_AUTH_TOKEN` cumpre o mesmo papel —
   ver [audit v2 MEDIUM #11](docs/security/...) para o padrão.

4. Aplicar a recipe Phase 2 (swap import + delete mirror).

Sem o passo 3 corretamente provisionado, o build do FE falha em
`npm install` quando tenta resolver o registro privado.
