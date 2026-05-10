import { Directive, computed, input } from '@angular/core'
import type { XButtonVariant, XButtonSize } from './x-button.component'

/**
 * Directive form of XButton. Apply to a native `<button>` element when you
 * need passthrough of router/aria/form attributes that the wrapper component
 * `<x-button>` cannot expose:
 *
 *   <button xButton variant="primary" routerLink="/foo">Open</button>
 *   <button xButton variant="ghost" type="submit" formControlName="apply">…</button>
 *   <button xButton variant="danger" [attr.aria-label]="'Remove ' + name">×</button>
 *
 * The wrapper component remains useful for simple cases. Use this directive
 * when:
 *   - the button needs `routerLink`, `routerLinkActive`, or any other
 *     directive that only attaches to a real DOM element
 *   - you want to set `aria-label`, `type="submit"`, `formControlName`,
 *     additional CSS classes, or any custom attribute
 *
 * **Styling requirement:** the consumer must import the sidecar stylesheet
 * once at app startup so the `xt-btn[…]` selectors resolve. Add to your
 * global SCSS / CSS:
 *
 *   @import "@xtrakt-ai/ui-angular/projects/lib/src/lib/button/x-button.directive.css";
 *
 * (or copy the CSS into your design-tokens mirror if your FE vendors a local
 * copy of the tokens). The wrapper component does not need this import — its
 * styles are component-scoped.
 *
 * @see XButtonComponent for the wrapper alternative.
 */
@Directive({
  selector: 'button[xButton], a[xButton]',
  standalone: true,
  host: {
    '[attr.data-x-button]': '""',
    '[attr.data-x-button-variant]': 'variant()',
    '[attr.data-x-button-size]': 'size()',
  },
})
export class XButtonDirective {
  readonly variant = input<XButtonVariant>('primary', { alias: 'xButton' })
  // The `xButton` alias on `variant` lets `<button xButton="primary">` work
  // as an alternative to `<button xButton variant="primary">`. The shorter
  // form is more ergonomic when there are no other inputs.
  readonly size = input<XButtonSize>('base')
}
