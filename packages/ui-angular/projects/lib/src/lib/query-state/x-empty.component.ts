import { Component, input } from '@angular/core'

/**
 * Empty-state placeholder for lists / panels with no results. Pairs with
 * x-loading and x-alert as the third branch of a query-state machine.
 * Optional action slot (`<ng-content>`) for a "create first" or "clear
 * filters" CTA.
 *
 * Usage:
 *   <x-empty title="No templates yet" message="Create your first template to get started.">
 *     <x-button (click)="newTemplate()">New template</x-button>
 *   </x-empty>
 */
@Component({
  selector: 'x-empty',
  standalone: true,
  template: `
    <div class="xt-empty">
      @if (icon()) {
        <span class="xt-empty__icon" aria-hidden="true">{{ icon() }}</span>
      }
      @if (title()) {
        <h3 class="xt-empty__title">{{ title() }}</h3>
      }
      @if (message()) {
        <p class="xt-empty__message">{{ message() }}</p>
      }
      <div class="xt-empty__actions"><ng-content /></div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .xt-empty {
      display: flex; flex-direction: column; align-items: center; gap: var(--xt-sp-2, 8px);
      padding: var(--xt-sp-7, 32px) var(--xt-sp-5, 20px);
      text-align: center;
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
    }
    .xt-empty__icon {
      font-size: 28px; line-height: 1;
      color: var(--muted, #697386);
      margin-bottom: var(--xt-sp-2, 8px);
    }
    .xt-empty__title {
      margin: 0;
      font-size: 15px; font-weight: 600;
      color: var(--ink, #0a2540);
    }
    .xt-empty__message {
      margin: 0;
      font-size: 13px;
      color: var(--muted, #697386);
      max-width: 360px;
    }
    .xt-empty__actions { margin-top: var(--xt-sp-3, 12px); display: flex; gap: var(--xt-sp-2, 8px); }
    .xt-empty__actions:empty { display: none; }
  `],
})
export class XEmptyComponent {
  readonly title = input<string | undefined>(undefined)
  readonly message = input<string | undefined>(undefined)
  readonly icon = input<string | undefined>(undefined)
}
