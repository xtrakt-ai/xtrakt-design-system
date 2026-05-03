# XShellComponent (Angular) — `@xtrakt-ai/ui-angular`

Canonical xtrakt app shell. Replaces the per-FE `MenuComponent` topbars
(platform-fe, workflow-fe, id-fe) that the May 3 audit (D-08) flagged
as fragmented across the suite.

**Layout contract**: 240px expanded sidebar / 64px collapsed, 56px topbar
with breadcrumb slot + user-menu, content scrolls underneath. All colors
+ spacing come from `--xt-*` tokens shipped by `@xtrakt-ai/design-tokens`.

## Wiring example (platform-fe)

```typescript
// src/app/menu/menu.component.ts (after refactor)
import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterOutlet } from '@angular/router'
import { TranslocoModule, TranslocoService } from '@jsverse/transloco'
import {
    XShellComponent,
    XBreadcrumbComponent,
    XShellNavItem,
} from '@xtrakt-ai/ui-angular'
import { AuthService } from '../services/auth.service'

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, RouterOutlet, TranslocoModule,
              XShellComponent, XBreadcrumbComponent],
    template: `
        <x-shell
            [brand]="{ name: 'fluex Platform' }"
            [nav]="nav"
            [user]="{
                name: auth.getUserNameFromToken(),
                email: auth.getUserEmail()
            }"
            [logoutLabel]="t('menu.logout')"
            (logout)="onLogout()">

            <ng-container shellBreadcrumb>
                <x-breadcrumb [items]="crumbs"/>
            </ng-container>

            <router-outlet/>
        </x-shell>
    `
})
export class MenuComponent {
    readonly auth = inject(AuthService)
    private readonly router = inject(Router)
    private readonly transloco = inject(TranslocoService)

    nav: XShellNavItem[] = [
        { label: 'Home', to: '/menu' },
        { label: 'Templates', to: '/templates' },
        { label: 'Playground', to: '/playground' },
        // ... rest of MENU_ITEMS array filtered by user journey
    ]

    crumbs = [{ label: 'Home', to: '/menu' }]

    t(key: string): string { return this.transloco.translate(key) }

    onLogout(): void {
        this.auth.serverLogout().subscribe(() => this.router.navigate(['/login']))
    }
}
```

The current `menu.component.ts/html/scss` (~1500 LOC of bespoke sidebar
+ topbar markup and styles) collapses to ~50 LOC of declarative shell
configuration.

## Migration checklist for an Angular FE

1. Bump `@xtrakt-ai/ui-angular` to `^1.1.0` in `package.json`.
2. `npm install` (GitHub Packages).
3. Add `XShellComponent` to the standalone imports of the layout
   component (typically `MenuComponent`).
4. Replace the entire template with the shell pattern above.
5. Move the existing `MENU_ITEMS` array into a `nav: XShellNavItem[]`
   getter. Translate labels via `transloco`.
6. Remove `menu.component.scss` (XShell brings its own styles).
7. Verify `--xt-brand`, `--xt-bg`, `--xt-fg`, `--xt-surface`, `--xt-border`
   are emitted globally (already true if `@xtrakt-ai/design-tokens` is
   imported in `styles.scss`).

## Inputs

- `brand: XShellBrand` (required) — `{ name, logoUrl? }`
- `nav: XShellNavItem[]` (required) — `[{ label, to, icon?, ariaLabel? }]`
- `user: XShellUser | null` — `{ name?, email?, initials? }`
- `logoutLabel: string` — defaults to "Logout"
- `initialCollapsed: boolean` — start with sidebar collapsed

## Outputs

- `(logout)` — user picked Logout in the avatar menu
- `(collapseChange)` — sidebar toggled (boolean = collapsed)

## Slot pattern

Angular doesn't have named slots like Vue, so the shell uses content
projection with attribute selectors:

- `[shellBreadcrumb]` — top-left of the topbar
- `[shellTopbarActions]` — top-right (left of user menu)
- default ng-content — page content (typically `<router-outlet/>`)
