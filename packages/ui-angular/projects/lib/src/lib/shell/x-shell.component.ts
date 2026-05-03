import { CommonModule } from '@angular/common'
import { Component, EventEmitter, HostListener, Input, Output, computed, signal } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { XShellBrand, XShellNavItem, XShellUser } from './shell-nav-item'

/**
 * Canonical xtrakt app shell (Angular). Mirrors the Vue equivalent in
 * `@xtrakt-ai/ui-vue` exactly — same 240px expanded / 64px collapsed
 * sidebar, same 56px topbar with breadcrumb slot + user menu, same
 * `--xt-*` design-token surface.
 *
 * Usage:
 *   <x-shell
 *     [brand]="{ name: 'fluex Platform' }"
 *     [nav]="navItems"
 *     [user]="{ name: 'Admin', email: 'admin@fluex.ai' }"
 *     (logout)="onLogout()">
 *
 *     <ng-container shellBreadcrumb>
 *       <x-breadcrumb [items]="crumbs" />
 *     </ng-container>
 *
 *     <router-outlet />
 *   </x-shell>
 */
@Component({
    selector: 'x-shell',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
        <div class="xt-shell" [class.xt-shell--collapsed]="collapsed()">
            <aside class="xt-shell__sidebar" [attr.aria-label]="brand.name">
                <div class="xt-shell__brand">
                    <img *ngIf="brand.logoUrl" [src]="brand.logoUrl" [alt]="brand.name + ' logo'" />
                    <span *ngIf="!brand.logoUrl" class="xt-shell__brand-mark" aria-hidden="true">
                        {{ brand.name.charAt(0) }}
                    </span>
                    <span class="xt-shell__brand-name">{{ brand.name }}</span>
                </div>

                <nav class="xt-shell__nav">
                    <a
                        *ngFor="let item of nav"
                        [routerLink]="item.to"
                        routerLinkActive="xt-shell__nav-item--active"
                        class="xt-shell__nav-item"
                        [attr.title]="collapsed() ? (item.ariaLabel || item.label) : null">
                        <span *ngIf="item.icon" class="xt-shell__nav-icon" [innerHTML]="item.icon" aria-hidden="true"></span>
                        <span class="xt-shell__nav-label">{{ item.label }}</span>
                    </a>
                </nav>

                <button
                    type="button"
                    class="xt-shell__collapse-btn"
                    [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
                    [attr.aria-expanded]="!collapsed()"
                    (click)="toggleCollapsed()">
                    <span aria-hidden="true">{{ collapsed() ? '›' : '‹' }}</span>
                </button>
            </aside>

            <div class="xt-shell__main">
                <header class="xt-shell__topbar">
                    <div class="xt-shell__topbar-left">
                        <ng-content select="[shellBreadcrumb]"></ng-content>
                    </div>
                    <div class="xt-shell__topbar-right">
                        <ng-content select="[shellTopbarActions]"></ng-content>
                        <div *ngIf="user" class="xt-shell__user">
                            <button
                                type="button"
                                class="xt-shell__user-trigger"
                                [attr.aria-label]="userPrimary() || 'Account menu'"
                                [attr.aria-expanded]="userMenuOpen()"
                                (click)="toggleUserMenu($event)">
                                <span class="xt-shell__avatar" aria-hidden="true">{{ computedInitials() }}</span>
                            </button>
                            <div *ngIf="userMenuOpen()" class="xt-shell__user-menu" role="menu">
                                <div class="xt-shell__user-menu-head">
                                    <span class="xt-shell__user-name">{{ userPrimary() }}</span>
                                    <span *ngIf="userSecondary()" class="xt-shell__user-email">{{ userSecondary() }}</span>
                                </div>
                                <button
                                    type="button"
                                    role="menuitem"
                                    class="xt-shell__user-menu-item"
                                    (click)="onLogoutClick()">
                                    {{ logoutLabel }}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main class="xt-shell__content">
                    <ng-content></ng-content>
                </main>
            </div>
        </div>
    `,
    styles: [`
        :host { display: block; }
        .xt-shell {
            display: grid;
            grid-template-columns: 240px 1fr;
            min-height: 100vh;
            background: var(--xt-bg, #f7f9fc);
            color: var(--xt-fg, #0a2540);
            font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
            transition: grid-template-columns 0.18s ease;
        }
        .xt-shell--collapsed { grid-template-columns: 64px 1fr; }

        .xt-shell__sidebar {
            position: sticky; top: 0; height: 100vh;
            background: var(--xt-surface, #fff);
            border-right: 1px solid var(--xt-border, #e3e8ee);
            display: flex; flex-direction: column; overflow: hidden;
        }
        .xt-shell__brand {
            display: flex; align-items: center; gap: 10px;
            padding: 18px 16px; height: 56px; flex: 0 0 auto;
        }
        .xt-shell__brand img,
        .xt-shell__brand-mark {
            width: 28px; height: 28px; flex: 0 0 auto; border-radius: 6px;
        }
        .xt-shell__brand-mark {
            background: var(--xt-brand, #581cff);
            color: var(--xt-on-brand, #fff);
            display: flex; align-items: center; justify-content: center; font-weight: 700;
        }
        .xt-shell__brand-name {
            font-weight: 600; font-size: 14px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .xt-shell--collapsed .xt-shell__brand-name { display: none; }

        .xt-shell__nav {
            flex: 1 1 auto; overflow-y: auto;
            padding: 8px; display: flex; flex-direction: column; gap: 2px;
        }
        .xt-shell__nav-item {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 12px; border-radius: 8px;
            color: var(--xt-fg-muted, #425466);
            text-decoration: none; font-size: 13.5px;
            transition: background 0.12s ease, color 0.12s ease;
        }
        .xt-shell__nav-item:hover {
            background: var(--xt-bg-hover, #f0f2f6);
            color: var(--xt-fg, #0a2540);
        }
        .xt-shell__nav-item--active {
            background: var(--xt-brand-soft, rgba(88, 28, 255, 0.08));
            color: var(--xt-brand, #581cff);
            font-weight: 500;
        }
        .xt-shell__nav-icon {
            width: 18px; height: 18px;
            display: inline-flex; align-items: center; justify-content: center;
            flex: 0 0 auto;
        }
        .xt-shell--collapsed .xt-shell__nav-label { display: none; }
        .xt-shell--collapsed .xt-shell__nav-item { justify-content: center; padding: 9px 0; }

        .xt-shell__collapse-btn {
            margin: 8px; padding: 6px;
            border: 1px solid var(--xt-border, #e3e8ee);
            background: var(--xt-surface, #fff);
            color: var(--xt-fg-muted, #425466);
            border-radius: 6px; cursor: pointer; font-size: 14px; line-height: 1;
        }
        .xt-shell__collapse-btn:hover { background: var(--xt-bg-hover, #f0f2f6); }

        .xt-shell__main { display: flex; flex-direction: column; min-width: 0; }
        .xt-shell__topbar {
            height: 56px; display: flex; align-items: center; justify-content: space-between;
            padding: 0 20px; border-bottom: 1px solid var(--xt-border, #e3e8ee);
            background: var(--xt-surface, #fff);
            position: sticky; top: 0; z-index: 10;
        }
        .xt-shell__topbar-left,
        .xt-shell__topbar-right { display: flex; align-items: center; gap: 12px; }

        .xt-shell__user { position: relative; }
        .xt-shell__user-trigger {
            border: none; background: transparent; padding: 0;
            cursor: pointer; border-radius: 50%;
        }
        .xt-shell__user-trigger:focus-visible {
            outline: 2px solid var(--xt-brand, #581cff); outline-offset: 2px;
        }
        .xt-shell__avatar {
            display: flex; align-items: center; justify-content: center;
            width: 32px; height: 32px; border-radius: 50%;
            background: var(--xt-brand, #581cff);
            color: var(--xt-on-brand, #fff);
            font-size: 12px; font-weight: 600;
        }
        .xt-shell__user-menu {
            position: absolute; top: calc(100% + 6px); right: 0;
            min-width: 220px;
            background: var(--xt-surface, #fff);
            border: 1px solid var(--xt-border, #e3e8ee);
            border-radius: 10px;
            box-shadow: 0 8px 24px rgba(10, 37, 64, 0.12);
            padding: 6px; z-index: 20;
        }
        .xt-shell__user-menu-head {
            padding: 10px 12px;
            border-bottom: 1px solid var(--xt-border-subtle, #f0f0f3);
            display: flex; flex-direction: column; gap: 2px;
        }
        .xt-shell__user-name {
            font-weight: 600; font-size: 13px; color: var(--xt-fg, #0a2540);
        }
        .xt-shell__user-email {
            font-size: 12px; color: var(--xt-fg-muted, #697386);
        }
        .xt-shell__user-menu-item {
            display: block; width: 100%; text-align: left;
            padding: 9px 12px; border: none; background: transparent;
            color: var(--xt-fg, #0a2540); font-size: 13px; cursor: pointer;
            border-radius: 6px;
        }
        .xt-shell__user-menu-item:hover { background: var(--xt-bg-hover, #f0f2f6); }

        .xt-shell__content { flex: 1 1 auto; overflow-y: auto; padding: 24px; }

        @media (max-width: 768px) {
            .xt-shell { grid-template-columns: 64px 1fr; }
            .xt-shell__brand-name,
            .xt-shell__nav-label { display: none; }
        }
    `]
})
export class XShellComponent {
    @Input({ required: true }) brand!: XShellBrand
    @Input({ required: true }) nav: XShellNavItem[] = []
    @Input() user: XShellUser | null = null
    @Input() logoutLabel = 'Logout'
    @Input() initialCollapsed = false

    @Output() logout = new EventEmitter<void>()
    @Output() collapseChange = new EventEmitter<boolean>()

    readonly collapsed = signal(false)
    readonly userMenuOpen = signal(false)

    readonly computedInitials = computed(() => {
        if (this.user?.initials) return this.user.initials
        const source = (this.user?.name || this.user?.email || '').trim()
        if (!source) return '?'
        const parts = source.split(/\s+/).filter(Boolean)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        return source.substring(0, 2).toUpperCase()
    })

    readonly userPrimary = computed(() => this.user?.name || this.user?.email || '')
    readonly userSecondary = computed(() =>
        this.user?.name && this.user?.email ? this.user.email : ''
    )

    ngOnInit(): void {
        this.collapsed.set(this.initialCollapsed)
    }

    toggleCollapsed(): void {
        this.collapsed.update(v => !v)
        this.collapseChange.emit(this.collapsed())
    }

    toggleUserMenu(event: Event): void {
        event.stopPropagation()
        this.userMenuOpen.update(v => !v)
    }

    onLogoutClick(): void {
        this.userMenuOpen.set(false)
        this.logout.emit()
    }

    /** Close the user menu on any click outside the trigger/menu. */
    @HostListener('document:mousedown', ['$event'])
    onDocClick(e: MouseEvent): void {
        if (!this.userMenuOpen()) return
        const target = e.target as HTMLElement
        if (!target.closest('.xt-shell__user')) {
            this.userMenuOpen.set(false)
        }
    }
}
