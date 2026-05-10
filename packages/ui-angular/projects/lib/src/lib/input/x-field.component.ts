import { Component, computed, input } from '@angular/core'

let _xFieldId = 0

/**
 * Wraps an input with a label, helper text, and error message slot.
 * Designed to pair with x-input but accepts any focusable child via
 * `<ng-content>`. Wires up `for`/`id` and `aria-describedby` so screen
 * readers announce the helper + error correctly.
 *
 * Usage:
 *   <x-field label="Email" helper="We never share your email." [error]="form.errors?.email">
 *     <x-input formControlName="email" type="email"/>
 *   </x-field>
 *
 * The child input must have `id="{{ controlId }}"` set via the field's
 * exposed `controlId` template ref to wire the `<label for>` association.
 * For convenience, when the only child is an x-input the wrapper sets
 * the `for` attribute via DOM; otherwise the consumer is responsible.
 */
@Component({
  selector: 'x-field',
  standalone: true,
  template: `
    <div class="xt-field" [class.xt-field--has-error]="hasError()">
      @if (label()) {
        <label
          class="xt-field__label"
          [attr.for]="controlId()">
          {{ label() }}
          @if (required()) {
            <span class="xt-field__required" aria-hidden="true">*</span>
          }
        </label>
      }
      <div class="xt-field__control" [attr.id]="controlId() + '-wrap'">
        <ng-content />
      </div>
      @if (hasError()) {
        <p
          class="xt-field__error"
          role="alert"
          [attr.id]="controlId() + '-error'">
          {{ error() }}
        </p>
      } @else if (helper()) {
        <p
          class="xt-field__helper"
          [attr.id]="controlId() + '-helper'">
          {{ helper() }}
        </p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .xt-field { display: flex; flex-direction: column; gap: var(--xt-sp-1, 4px); }
    .xt-field__label {
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
      font-size: 13px; font-weight: 500;
      color: var(--ink, #0a2540);
    }
    .xt-field__required { color: var(--color-danger, #cd3d64); margin-left: 2px; }
    .xt-field__helper {
      margin: 0;
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
      font-size: 12px;
      color: var(--muted, #697386);
    }
    .xt-field__error {
      margin: 0;
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
      font-size: 12px;
      color: var(--color-danger, #cd3d64);
    }
    .xt-field--has-error .xt-field__control ::ng-deep .xt-input {
      border-color: var(--color-danger, #cd3d64);
    }
  `],
  imports: [],
})
export class XFieldComponent {
  readonly label = input<string | undefined>(undefined)
  readonly helper = input<string | undefined>(undefined)
  readonly error = input<string | undefined>(undefined)
  readonly required = input<boolean>(false)
  readonly forId = input<string | undefined>(undefined)

  readonly controlId = computed(() => this.forId() ?? `xt-field-${++_xFieldId}`)
  readonly hasError = computed(() => !!this.error())
}
