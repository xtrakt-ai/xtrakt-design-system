import { Component, computed, input } from '@angular/core'

export type XAlertVariant = 'error' | 'warning' | 'info' | 'success'

/**
 * Alert / banner component. Used as the error branch of a query-state
 * machine alongside x-loading and x-empty, and as a standalone notice
 * banner on form pages. Accepts an action slot (`<ng-content>`) for a
 * retry / dismiss button.
 *
 * Usage:
 *   <x-alert variant="error" title="Couldn't load templates" message="Network failed.">
 *     <x-button variant="ghost" size="sm" (click)="retry()">Try again</x-button>
 *   </x-alert>
 */
@Component({
  selector: 'x-alert',
  standalone: true,
  template: `
    <div [class]="cls()" [attr.role]="role()" aria-live="polite">
      <div class="xt-alert__body">
        @if (title()) {
          <strong class="xt-alert__title">{{ title() }}</strong>
        }
        @if (message()) {
          <p class="xt-alert__message">{{ message() }}</p>
        }
      </div>
      <div class="xt-alert__actions"><ng-content /></div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .xt-alert {
      display: flex; align-items: flex-start; gap: var(--xt-sp-3, 12px);
      padding: var(--xt-sp-3, 12px) var(--xt-sp-4, 16px);
      border-radius: var(--xt-r-card, 8px);
      border: 1px solid transparent;
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
      font-size: 13px;
    }
    .xt-alert__body { flex: 1 1 auto; min-width: 0; }
    .xt-alert__title { display: block; font-weight: 600; margin-bottom: 2px; }
    .xt-alert__message { margin: 0; }
    .xt-alert__actions { display: flex; gap: var(--xt-sp-2, 8px); flex-shrink: 0; }
    .xt-alert__actions:empty { display: none; }

    .xt-alert--error {
      background: var(--color-danger-soft, #ffe0e6);
      color: var(--color-danger, #cd3d64);
      border-color: var(--color-danger, #cd3d64);
    }
    .xt-alert--warning {
      background: var(--color-warning-soft, #fff3d4);
      color: var(--color-warning, #b76e00);
      border-color: var(--color-warning, #b76e00);
    }
    .xt-alert--info {
      background: var(--color-info-soft, #d4e8ff);
      color: var(--color-info, #0c7eb6);
      border-color: var(--color-info, #0c7eb6);
    }
    .xt-alert--success {
      background: var(--color-success-soft, #d4f7e2);
      color: var(--color-success, #0e7c3a);
      border-color: var(--color-success, #0e7c3a);
    }
  `],
})
export class XAlertComponent {
  readonly variant = input<XAlertVariant>('error')
  readonly title = input<string | undefined>(undefined)
  readonly message = input<string | undefined>(undefined)

  readonly cls = computed(() => `xt-alert xt-alert--${this.variant()}`)
  readonly role = computed(() =>
    this.variant() === 'error' || this.variant() === 'warning' ? 'alert' : 'status',
  )
}
