import {
  Component,
  EventEmitter,
  Output,
  forwardRef,
  input,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

export type XInputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'

/**
 * Canonical xtrakt input (Angular). Mirrors the Vue equivalent in
 * `@xtrakt-ai/ui-vue`. Implements ControlValueAccessor so it works with
 * both Reactive Forms (`[formControl]`/`formControlName`) and Template
 * Forms (`[(ngModel)]`).
 *
 * Usage:
 *   <x-input [(ngModel)]="email" type="email" placeholder="you@example.com"/>
 *   <x-input formControlName="name" placeholder="Full name"/>
 *   <x-input [multiline]="true" formControlName="notes"/>
 */
@Component({
  selector: 'x-input',
  standalone: true,
  template: `
    @if (multiline()) {
      <textarea
        class="xt-input"
        [value]="value"
        [placeholder]="placeholder() ?? ''"
        [disabled]="disabled"
        (input)="onInput(($any($event.target)).value)"
        (blur)="onTouched()">
      </textarea>
    } @else {
      <input
        class="xt-input"
        [type]="type()"
        [value]="value"
        [placeholder]="placeholder() ?? ''"
        [disabled]="disabled"
        (input)="onInput(($any($event.target)).value)"
        (blur)="onTouched()"/>
    }
  `,
  styles: [`
    :host { display: block; }
    .xt-input {
      width: 100%;
      height: var(--xt-ctrl-h, 40px);
      padding: 0 var(--xt-sp-3, 12px);
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
      font-size: 14px;
      color: var(--ink, #0a2540);
      background: var(--surface, #fff);
      border: 1px solid var(--line, #e3e8ee);
      border-radius: var(--xt-r-ctrl, 8px);
      outline: none;
      transition: border-color 150ms, box-shadow 150ms;
    }
    .xt-input:focus {
      border-color: var(--brand-primary, #581cff);
      box-shadow: var(--xt-focus-ring, 0 0 0 3px rgba(88, 28, 255, 0.3));
    }
    .xt-input::placeholder { color: var(--muted-soft, #b8c0cc); }
    .xt-input:disabled { opacity: 0.6; cursor: not-allowed; background: var(--paper-soft, #f7f9fc); }
    textarea.xt-input {
      height: auto;
      padding: var(--xt-sp-2, 8px) var(--xt-sp-3, 12px);
      resize: vertical;
      min-height: 80px;
      font: inherit;
    }
  `],
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => XInputComponent),
      multi: true,
    },
  ],
})
export class XInputComponent implements ControlValueAccessor {
  readonly type = input<XInputType>('text')
  readonly placeholder = input<string | undefined>(undefined)
  readonly multiline = input<boolean>(false)

  @Output() readonly valueChange = new EventEmitter<string>()

  value = ''
  disabled = false

  // ControlValueAccessor wiring — set by FormsModule when bound via
  // [(ngModel)] / formControlName. Calls flow through onInput().
  private _onChange: (v: string) => void = () => {}
  onTouched: () => void = () => {}

  writeValue(v: string | number | null | undefined): void {
    this.value = v == null ? '' : String(v)
  }

  registerOnChange(fn: (v: string) => void): void {
    this._onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  onInput(v: string): void {
    this.value = v
    this._onChange(v)
    this.valueChange.emit(v)
  }
}
