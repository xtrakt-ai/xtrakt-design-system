import { Component, computed, input } from '@angular/core'

export type XBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted'

/**
 * Canonical xtrakt badge (Angular). Mirrors the Vue equivalent in
 * `@xtrakt-ai/ui-vue`. Inline status pill — `muted` is the safe
 * default that doesn't claim a semantic meaning.
 *
 * Usage:
 *   <x-badge variant="success">Active</x-badge>
 *   <x-badge variant="warning">Pending</x-badge>
 */
@Component({
  selector: 'x-badge',
  standalone: true,
  template: `<span [class]="cls()"><ng-content /></span>`,
  styles: [`
    :host { display: inline-flex; }
    .xt-badge {
      display: inline-flex; align-items: center;
      padding: 2px var(--xt-sp-2, 8px);
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
      font-size: 12px; font-weight: 500;
      border-radius: var(--xt-r-pill, 999px);
      line-height: 1.4;
    }
    .xt-badge--success { background: var(--color-success-soft, #d4f7e2); color: var(--color-success, #0e7c3a); }
    .xt-badge--warning { background: var(--color-warning-soft, #fff3d4); color: var(--color-warning, #b76e00); }
    .xt-badge--danger  { background: var(--color-danger-soft, #ffe0e6);  color: var(--color-danger, #cd3d64); }
    .xt-badge--info    { background: var(--color-info-soft, #d4e8ff);    color: var(--color-info, #0c7eb6); }
    .xt-badge--muted   {
      background: var(--paper-soft, #f7f9fc);
      color: var(--muted, #697386);
      border: 1px solid var(--line, #e3e8ee);
    }
  `],
})
export class XBadgeComponent {
  readonly variant = input<XBadgeVariant>('muted')
  readonly cls = computed(() => `xt-badge xt-badge--${this.variant()}`)
}
