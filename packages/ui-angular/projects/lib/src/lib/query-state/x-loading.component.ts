import { Component, input } from '@angular/core'

/**
 * Loading-state placeholder for lists, panels, and pages. Used as the
 * `@if (loading)` branch of a query-state machine alongside x-empty
 * (no results) and x-alert (error). Matches the in-flight visual that
 * 22+ platform-fe components reimplement today (D-06 / N3-03).
 *
 * Usage:
 *   @if (loading) { <x-loading [label]="'Loading templates…'"/> }
 *   @else if (error) { <x-alert ...> }
 *   @else if (items.length === 0) { <x-empty ...> }
 *   @else { <list /> }
 */
@Component({
  selector: 'x-loading',
  standalone: true,
  template: `
    <div class="xt-loading" role="status" aria-live="polite">
      <div class="xt-loading__spinner" aria-hidden="true"></div>
      @if (label()) {
        <span class="xt-loading__label">{{ label() }}</span>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .xt-loading {
      display: flex; align-items: center; justify-content: center;
      gap: var(--xt-sp-3, 12px);
      padding: var(--xt-sp-6, 24px);
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
      font-size: 14px;
      color: var(--muted, #697386);
    }
    .xt-loading__spinner {
      width: 18px; height: 18px;
      border: 2px solid var(--line, #e3e8ee);
      border-top-color: var(--brand-primary, #581cff);
      border-radius: 50%;
      animation: xt-loading-spin 0.8s linear infinite;
    }
    @keyframes xt-loading-spin { to { transform: rotate(360deg); } }
  `],
})
export class XLoadingComponent {
  readonly label = input<string | undefined>(undefined)
}
