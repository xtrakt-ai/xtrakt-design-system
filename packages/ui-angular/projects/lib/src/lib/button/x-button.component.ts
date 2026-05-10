import { Component, EventEmitter, Input, Output, computed, input } from '@angular/core'

export type XButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type XButtonSize = 'sm' | 'base' | 'lg' | 'icon'

/**
 * Canonical xtrakt button (Angular). Mirrors the Vue equivalent in
 * `@xtrakt-ai/ui-vue`. Driven by canonical tokens shipped in
 * `@xtrakt-ai/design-tokens` with sensible inline fallbacks so the
 * component is usable even if the consumer hasn't imported tokens.css.
 *
 * Usage:
 *   <x-button variant="primary" (click)="save()">Save</x-button>
 *   <x-button variant="ghost" size="sm" [disabled]="busy">Cancel</x-button>
 */
@Component({
  selector: 'x-button',
  standalone: true,
  template: `
    <button
      [class]="cls()"
      [attr.type]="type()"
      [disabled]="disabled()"
      (click)="onClick($event)">
      <ng-content />
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }
    button {
      display: inline-flex; align-items: center; justify-content: center;
      gap: var(--xt-sp-2, 8px);
      height: var(--xt-ctrl-h, 40px);
      padding: 0 var(--xt-sp-4, 16px);
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
      font-size: 14px; font-weight: 500;
      border: 1px solid transparent;
      border-radius: var(--xt-r-ctrl, 8px);
      cursor: pointer;
      transition: background 150ms, color 150ms, border-color 150ms, box-shadow 150ms;
    }
    button:focus-visible {
      outline: none;
      box-shadow: var(--xt-focus-ring, 0 0 0 3px rgba(88, 28, 255, 0.3));
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .xt-btn--primary {
      background: var(--color-primary, #581cff);
      color: var(--text-inverse, #fff);
    }
    .xt-btn--primary:hover:not(:disabled) {
      background: var(--color-primary-hover, #4318cc);
    }
    .xt-btn--secondary {
      background: var(--surface-card, #fff);
      color: var(--text-primary, #0a2540);
      border-color: var(--border-subtle, #e3e8ee);
    }
    .xt-btn--secondary:hover:not(:disabled) {
      background: var(--surface-muted, #f7f9fc);
    }
    .xt-btn--ghost {
      background: transparent;
      color: var(--text-muted, #697386);
    }
    .xt-btn--ghost:hover:not(:disabled) {
      background: var(--surface-muted, #f7f9fc);
      color: var(--text-primary, #0a2540);
    }
    .xt-btn--danger {
      background: var(--color-danger, #cd3d64);
      color: var(--text-inverse, #fff);
    }
    .xt-btn--danger:hover:not(:disabled) {
      background: var(--color-danger-hover, #b03555);
    }
    .xt-btn--sm { height: var(--xt-ctrl-h-sm, 32px); padding: 0 var(--xt-sp-3, 12px); font-size: 13px; }
    .xt-btn--lg { height: var(--xt-ctrl-h-lg, 48px); padding: 0 var(--xt-sp-5, 20px); font-size: 15px; }
    .xt-btn--icon { width: var(--xt-ctrl-h, 40px); padding: 0; }
  `],
})
export class XButtonComponent {
  readonly variant = input<XButtonVariant>('primary')
  readonly size = input<XButtonSize>('base')
  readonly disabled = input<boolean>(false)
  readonly type = input<'button' | 'submit' | 'reset'>('button')

  @Output() readonly click = new EventEmitter<MouseEvent>()

  readonly cls = computed(() => {
    const parts = ['xt-btn', `xt-btn--${this.variant()}`]
    if (this.size() !== 'base') parts.push(`xt-btn--${this.size()}`)
    return parts.join(' ')
  })

  onClick(ev: MouseEvent): void {
    this.click.emit(ev)
  }
}
