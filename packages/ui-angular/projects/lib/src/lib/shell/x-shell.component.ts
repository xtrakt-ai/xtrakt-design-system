import { CommonModule } from '@angular/common'
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core'
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router'
import { filter } from 'rxjs/operators'
import { X_SHELL_ICON_NAMES, XShellBrand, XShellIconName, XShellNavItem, XShellUser } from './shell-nav-item'

const X_SHELL_ICON_PATHS: Record<XShellIconName, string> = {
    admin: 'M12 3l7 4v5c0 4.1-2.7 7.8-7 9-4.3-1.2-7-4.9-7-9V7l7-4zm0 3.2L8 8.5V12c0 2.7 1.5 5.1 4 6 2.5-.9 4-3.3 4-6V8.5l-4-2.3z',
    apiKeys: 'M7 14a5 5 0 1 1 4.5-2.8L21 20.7 19.7 22 17 19.3 15.3 21 14 19.7l1.7-1.7-2-2A5 5 0 0 1 7 14zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    billing: 'M4 6h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 4h16V8H4v2zm3 5h5v-2H7v2z',
    check: 'M9.2 16.6L4.9 12.3 3.5 13.7l5.7 5.7L21 7.6 19.6 6.2 9.2 16.6z',
    clock: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm1-10.4V6h-2v6.4l4.7 4.7 1.4-1.4-4.1-4.1z',
    dashboard: 'M3 13h8V3H3v10zm2-8h4v6H5V5zm8 16h8V11h-8v10zm2-8h4v6h-4v-6zM3 21h8v-6H3v6zm2-4h4v2H5v-2zm8-8h8V3h-8v6zm2-4h4v2h-4V5z',
    database: 'M12 3c5 0 9 1.6 9 3.5v11c0 1.9-4 3.5-9 3.5s-9-1.6-9-3.5v-11C3 4.6 7 3 12 3zm0 2c-4.1 0-6.6 1-7 1.5.4.5 2.9 1.5 7 1.5s6.6-1 7-1.5C18.6 6 16.1 5 12 5zm0 5c-2.8 0-5.3-.5-7-1.4V12c.4.5 2.9 1.5 7 1.5s6.6-1 7-1.5V8.6c-1.7.9-4.2 1.4-7 1.4zm0 5.5c-2.8 0-5.3-.5-7-1.4v3.4c.4.5 2.9 1.5 7 1.5s6.6-1 7-1.5v-3.4c-1.7.9-4.2 1.4-7 1.4z',
    developers: 'M8.7 16.3L4.4 12l4.3-4.3L7.3 6.3 1.6 12l5.7 5.7 1.4-1.4zm6.6 0l4.3-4.3-4.3-4.3 1.4-1.4 5.7 5.7-5.7 5.7-1.4-1.4zM11.2 20l-1.9-.6L12.8 4l1.9.6L11.2 20z',
    document: 'M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 2H6v16h12V9h-5V4zm1 0v3h3l-3-3z',
    ecm: 'M4 5h6l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 4v9h16V9H4z',
    edit: 'M4 17.3V21h3.7L18.6 10.1l-3.7-3.7L4 17.3zM20.7 8a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-1.4 1.4 3.7 3.7L20.7 8z',
    folder: 'M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6zm2 2v10h14V8H5z',
    home: 'M3 11l9-8 9 8-1.3 1.5L18 11v9h-5v-6h-2v6H6v-9l-1.7 1.5L3 11z',
    latency: 'M12 20a8 8 0 1 1 8-8h-2a6 6 0 1 0-6 6v2zm1-8.4V7h-2v5.4l4 4 1.4-1.4-3.4-3.4zm5.5 4.9l1.4-1.4 2.1 2.1-4.8 4.8-2.1-2.1 1.4-1.4.7.7 1.3-1.3-.7-.7z',
    memory: 'M7 3h10v3h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2v3H7v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V3zm2 2v14h6V5H9zm-4 3v8h2V8H5zm12 0v8h2V8h-2z',
    portal: 'M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3h6v2H9V9zm0 4h6v2H9v-2z',
    search: 'M10 18a8 8 0 1 1 5.3-2l4.4 4.3-1.4 1.4-4.3-4.4A8 8 0 0 1 10 18zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12z',
    settings: 'M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.6-1.5L14 2h-4l-.4 3a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5A8.8 8.8 0 0 0 4.5 12c0 .5 0 1 .1 1.5l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2.6 1.5l.4 3h4l.4-3a8 8 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z',
    sign: 'M16 3l5 5-11 11H5v-5L16 3zm0 2.8l-9 9V17h2.2l9-9L16 5.8zM4 21h16v2H4v-2z',
    templates: 'M4 4h7v7H4V4zm2 2v3h3V6H6zm7-2h7v7h-7V4zm2 2v3h3V6h-3zM4 13h7v7H4v-7zm2 2v3h3v-3H6zm7-2h7v7h-7v-7zm2 2v3h3v-3h-3z',
    tickets: 'M4 5h16v5a2 2 0 1 0 0 4v5H4v-5a2 2 0 1 0 0-4V5zm2 2v2.4a4 4 0 0 1 0 7.2V17h12v-.4a4 4 0 0 1 0-7.2V7H6z',
    transactions: 'M7 7h11l-2.3-2.3L17 3.3 21.7 8 17 12.7l-1.3-1.4L18 9H7V7zm10 10H6l2.3 2.3L7 20.7 2.3 16 7 11.3l1.3 1.4L6 15h11v2z',
    users: 'M8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 2c-3.3 0-6 1.7-6 3.8V19h12v-2.2C14 14.7 11.3 13 8 13zm8.5-1.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM16 13c2.8.1 5 1.6 5 3.5V19h-5v-2.2c0-1.4-.7-2.7-2-3.8.6-.1 1.2-.1 2-.1z',
    workflow: 'M5 5h5v5H5V5zm2 2v1h1V7H7zm7-2h5v5h-5V5zm2 2v1h1V7h-1zM5 14h5v5H5v-5zm2 2v1h1v-1H7zm7-2h5v5h-5v-5zm2 2v1h1v-1h-1zm-6-7h4v2h-4V9zm0 6h4v2h-4v-2z'
}

const X_SHELL_ICON_NAME_SET = new Set<string>(X_SHELL_ICON_NAMES)

/**
 * Canonical xtrakt app shell (Angular). Mirrors the Vue equivalent in
 * `@xtrakt-ai/ui-vue` exactly — same 240px expanded / 64px collapsed
 * sidebar, same 56px topbar with breadcrumb slot + user menu, same
 * `--xt-*` design-token surface.
 *
 * Nav supports up to 3 levels of nesting via `XShellNavItem.children`. Parent
 * nodes render as expandable groups with a chevron; clicking the label
 * (when the parent has its own `to` route) navigates while the chevron
 * toggles expansion. Branches whose descendant matches the current router
 * URL auto-expand on navigation so the user always sees their position.
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
                    <ng-container *ngFor="let item of nav; let i = index">
                        <ng-container *ngTemplateOutlet="navNode; context: { $implicit: item, depth: 0, path: i + '' }"></ng-container>
                    </ng-container>
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

        <!-- Recursive nav-node renderer. depth caps at 2 (3 visual levels: 0, 1, 2). -->
        <ng-template #navNode let-item let-depth="depth" let-path="path">
            <div
                class="xt-shell__nav-row"
                [class.xt-shell__nav-row--child]="depth > 0"
                [class.xt-shell__nav-row--grandchild]="depth > 1">

                <!-- Linkable item (has 'to') — renders as <a routerLink>. -->
                <a
                    *ngIf="item.to"
                    [routerLink]="item.to"
                    routerLinkActive="xt-shell__nav-item--active"
                    class="xt-shell__nav-item"
                    [class.xt-shell__nav-item--has-children]="!!(item.children && item.children.length)"
                    [attr.title]="collapsed() ? (item.ariaLabel || item.label) : null">
                    <span *ngIf="navIconPath(item) as iconPath" class="xt-shell__nav-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" focusable="false">
                            <path [attr.d]="iconPath"></path>
                        </svg>
                    </span>
                    <span class="xt-shell__nav-label">{{ item.label }}</span>
                    <button
                        *ngIf="item.children && item.children.length"
                        type="button"
                        class="xt-shell__nav-chevron"
                        [class.xt-shell__nav-chevron--open]="isExpanded(path)"
                        [attr.aria-label]="isExpanded(path) ? 'Collapse ' + item.label : 'Expand ' + item.label"
                        [attr.aria-expanded]="isExpanded(path)"
                        (click)="toggleExpansion(path, $event)">
                        <span aria-hidden="true">▾</span>
                    </button>
                </a>

                <!-- Group-only parent (no 'to') — renders as a button that toggles expansion. -->
                <button
                    *ngIf="!item.to && item.children && item.children.length"
                    type="button"
                    class="xt-shell__nav-item xt-shell__nav-item--group"
                    [class.xt-shell__nav-item--has-children]="true"
                    [attr.aria-expanded]="isExpanded(path)"
                    [attr.title]="collapsed() ? (item.ariaLabel || item.label) : null"
                    (click)="toggleExpansion(path, $event)">
                    <span *ngIf="navIconPath(item) as iconPath" class="xt-shell__nav-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" focusable="false">
                            <path [attr.d]="iconPath"></path>
                        </svg>
                    </span>
                    <span class="xt-shell__nav-label">{{ item.label }}</span>
                    <span class="xt-shell__nav-chevron" [class.xt-shell__nav-chevron--open]="isExpanded(path)" aria-hidden="true">▾</span>
                </button>
            </div>

            <!-- Children — only rendered when expanded and depth < 2 (cap at 3 visual levels). -->
            <div
                *ngIf="item.children && item.children.length && isExpanded(path) && depth < 2"
                class="xt-shell__nav-children"
                [class.xt-shell__nav-children--depth-0]="depth === 0"
                [class.xt-shell__nav-children--depth-1]="depth === 1">
                <ng-container *ngFor="let child of item.children; let j = index">
                    <ng-container
                        *ngTemplateOutlet="navNode; context: { $implicit: child, depth: depth + 1, path: path + '.' + j }"></ng-container>
                </ng-container>
            </div>
        </ng-template>
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
        .xt-shell__nav-row { display: block; }
        .xt-shell__nav-item {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 12px; border-radius: 8px;
            color: var(--xt-fg-muted, #425466);
            text-decoration: none; font-size: 13.5px;
            transition: background 0.12s ease, color 0.12s ease;
            width: 100%; box-sizing: border-box;
            background: transparent; border: none; cursor: pointer; text-align: left;
            font-family: inherit;
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
        .xt-shell__nav-item--group {
            color: var(--xt-fg, #0a2540);
            font-weight: 500;
        }
        .xt-shell__nav-icon {
            width: 18px; height: 18px;
            display: inline-flex; align-items: center; justify-content: center;
            flex: 0 0 auto;
        }
        .xt-shell__nav-icon svg {
            width: 18px; height: 18px;
            display: block;
            fill: currentColor;
        }
        .xt-shell__nav-label {
            flex: 1 1 auto; min-width: 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .xt-shell__nav-chevron {
            flex: 0 0 auto;
            display: inline-flex; align-items: center; justify-content: center;
            width: 18px; height: 18px;
            background: transparent; border: none; padding: 0; cursor: pointer;
            color: inherit; opacity: 0.6;
            transition: transform 0.18s ease, opacity 0.12s ease;
            font-size: 11px; line-height: 1;
        }
        .xt-shell__nav-chevron:hover { opacity: 1; }
        .xt-shell__nav-chevron--open { transform: rotate(180deg); opacity: 0.85; }

        /* Indented children. Each depth level adds 12px of left padding so the
           hierarchy is visible at a glance. The vertical guide line is a soft
           border on the left to anchor the eye through long sub-trees. */
        .xt-shell__nav-children { display: flex; flex-direction: column; gap: 2px; }
        .xt-shell__nav-children--depth-0 .xt-shell__nav-row {
            padding-left: 12px;
            border-left: 1px solid var(--xt-border, #e3e8ee);
            margin-left: 14px;
        }
        .xt-shell__nav-children--depth-1 .xt-shell__nav-row {
            padding-left: 12px;
            border-left: 1px solid var(--xt-border, #e3e8ee);
            margin-left: 14px;
        }
        .xt-shell__nav-row--child > .xt-shell__nav-item { font-size: 13px; }
        .xt-shell__nav-row--grandchild > .xt-shell__nav-item { font-size: 12.5px; opacity: 0.92; }

        .xt-shell--collapsed .xt-shell__nav-label,
        .xt-shell--collapsed .xt-shell__nav-chevron,
        .xt-shell--collapsed .xt-shell__nav-children { display: none; }
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
export class XShellComponent implements OnChanges {
    @Input({ required: true }) brand!: XShellBrand
    @Input({ required: true }) nav: XShellNavItem[] = []
    @Input() user: XShellUser | null = null
    @Input() logoutLabel = 'Logout'
    @Input() initialCollapsed = false

    @Output() logout = new EventEmitter<void>()
    @Output() collapseChange = new EventEmitter<boolean>()

    readonly collapsed = signal(false)
    readonly userMenuOpen = signal(false)
    /** Set of expanded path IDs. Path = dotted index trail like "3.2.1". */
    private readonly expanded = signal<Set<string>>(new Set())

    constructor(private router: Router) {
        // Auto-expand any branch whose descendant matches the current URL on every
        // navigation. The set is replaced (not mutated) so the signal triggers a
        // change-detection pass.
        this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe(() => this.syncExpansionToUrl())
    }

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
        this.applyInitialExpansion(this.nav)
        this.syncExpansionToUrl()
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Re-seed expansion state when the nav array changes (journey load completed).
        if (changes['nav'] && this.nav?.length) {
            this.applyInitialExpansion(this.nav)
            this.syncExpansionToUrl()
        }
    }

    isExpanded(path: string): boolean {
        return this.expanded().has(path)
    }

    navIconPath(item: XShellNavItem): string | null {
        const name = item.iconName || item.icon
        if (!name || !X_SHELL_ICON_NAME_SET.has(name)) return null
        return X_SHELL_ICON_PATHS[name as XShellIconName]
    }

    toggleExpansion(path: string, event?: Event): void {
        // Stop the chevron click from also navigating via the parent <a>.
        event?.preventDefault()
        event?.stopPropagation()
        const next = new Set(this.expanded())
        if (next.has(path)) next.delete(path)
        else next.add(path)
        this.expanded.set(next)
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

    /** Apply each item.expanded === true into the expanded path set on initial load. */
    private applyInitialExpansion(items: XShellNavItem[], pathPrefix = ''): void {
        const next = new Set(this.expanded())
        const visit = (list: XShellNavItem[], prefix: string) => {
            list.forEach((item, i) => {
                const path = prefix === '' ? `${i}` : `${prefix}.${i}`
                if (item.expanded) next.add(path)
                if (item.children?.length) visit(item.children, path)
            })
        }
        visit(items, pathPrefix)
        this.expanded.set(next)
    }

    /** Auto-expand every ancestor of the current router URL. */
    private syncExpansionToUrl(): void {
        const url = this.router.url
        const next = new Set(this.expanded())
        const visit = (list: XShellNavItem[], prefix: string): boolean => {
            let anyMatched = false
            list.forEach((item, i) => {
                const path = prefix === '' ? `${i}` : `${prefix}.${i}`
                const childMatched = item.children?.length
                    ? visit(item.children, path)
                    : false
                const selfMatched = !!item.to && this.urlMatchesRoute(url, item.to)
                if (childMatched || (selfMatched && item.children?.length)) {
                    next.add(path)
                    anyMatched = true
                }
                if (selfMatched) anyMatched = true
            })
            return anyMatched
        }
        visit(this.nav, '')
        this.expanded.set(next)
    }

    private urlMatchesRoute(url: string, route: string): boolean {
        const u = url.split('?')[0].split('#')[0]
        return u === route || u.startsWith(route + '/')
    }
}
