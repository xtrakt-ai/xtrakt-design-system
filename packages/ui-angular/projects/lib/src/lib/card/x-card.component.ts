import { Component, computed, input } from '@angular/core'

/**
 * Canonical xtrakt card (Angular). Mirrors the Vue equivalent in
 * `@xtrakt-ai/ui-vue`. `interactive` switches to the `xt-tile` style
 * with hover lift and click cursor — used by selectable surfaces like
 * model picker tiles.
 *
 * Usage:
 *   <x-card><h3>Title</h3><p>Body</p></x-card>
 *   <x-card [flat]="true">Borderless surface</x-card>
 *   <x-card [flush]="true"><table>…</table></x-card>   // edge-to-edge, no padding
 *   <x-card [interactive]="true" (click)="select()">Hoverable tile</x-card>
 *
 * `flush` removes the inner padding and clips overflow — for surfaces whose
 * content goes edge-to-edge (data tables, image tiles) and should be bounded
 * by the card's rounded corners. Composes with `flat`.
 */
@Component({
  selector: 'x-card',
  standalone: true,
  template: `
    <div [class]="cls()">
      <ng-content />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .xt-card {
      background: var(--surface-card, #fff);
      border: 1px solid var(--border-subtle, #e3e8ee);
      border-radius: var(--xt-r-card, 12px);
      padding: var(--xt-sp-4, 16px) var(--xt-sp-5, 20px);
      box-shadow: var(--shadow-card, 0 1px 3px rgba(50, 50, 93, .08), 0 1px 2px rgba(0, 0, 0, .04));
    }
    .xt-card--flat { box-shadow: none; }
    .xt-card--flush { padding: 0; overflow: hidden; }
    .xt-tile {
      background: var(--surface-card, #fff);
      border: 1px solid var(--border-subtle, #e3e8ee);
      border-radius: var(--xt-r-card, 12px);
      padding: var(--xt-sp-4, 16px);
      cursor: pointer;
      transition: box-shadow 150ms, transform 150ms, border-color 150ms;
    }
    .xt-tile:hover {
      border-color: var(--color-primary, #581cff);
      box-shadow: 0 4px 12px rgba(10, 37, 64, 0.08);
      transform: translateY(-1px);
    }
  `],
})
export class XCardComponent {
  readonly flat = input<boolean>(false)
  readonly flush = input<boolean>(false)
  readonly interactive = input<boolean>(false)

  readonly cls = computed(() => {
    if (this.interactive()) return 'xt-tile'
    const c = ['xt-card']
    if (this.flat()) c.push('xt-card--flat')
    if (this.flush()) c.push('xt-card--flush')
    return c.join(' ')
  })
}
