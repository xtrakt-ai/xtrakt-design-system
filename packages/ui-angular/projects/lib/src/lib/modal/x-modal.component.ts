// xtrakt-design-system/packages/ui-angular/projects/lib/src/lib/modal/x-modal.component.ts
import { Component, ElementRef, effect, input, model, output, viewChild } from '@angular/core'

let modalSeq = 0

/**
 * Canonical xtrakt modal dialog (Angular). Built on the native <dialog>
 * element, so focus-trap, focus restore, aria-modal, Esc-to-close and
 * top-layer backdrop are provided by the platform.
 *
 * Usage:
 *   <x-modal [(open)]="isOpen" [title]="'Details'" size="sm">
 *     <p>body</p>
 *     <div x-modal-footer><x-button (click)="isOpen = false">Close</x-button></div>
 *   </x-modal>
 *
 * `open` is two-way. On user dismiss (Esc / overlay-click / ×) the native
 * `close` event fires: the component emits (closed) and sets open=false.
 * Programmatic close (consumer sets open=false) does NOT emit (closed).
 */
@Component({
  selector: 'x-modal',
  standalone: true,
  template: `
    <dialog
      #dlg
      [class]="'xt-modal xt-modal--' + size()"
      [attr.aria-labelledby]="title() ? titleId : null"
      (close)="onNativeClose()"
      (cancel)="onCancel($event)"
      (click)="onDialogClick($event)"
    >
      <div class="xt-modal__surface">
        @if (title()) {
          <header class="xt-modal__header">
            <h2 class="xt-modal__title" [id]="titleId">{{ title() }}</h2>
            @if (dismissable()) {
              <button type="button" class="xt-modal__close" aria-label="Close" (click)="dismiss()">&times;</button>
            }
          </header>
        }
        <div class="xt-modal__body"><ng-content /></div>
        <div class="xt-modal__footer"><ng-content select="[x-modal-footer]" /></div>
      </div>
    </dialog>
  `,
  styles: [`
    :host { display: contents; }
    dialog.xt-modal {
      padding: 0;
      border: none;
      background: transparent;
      color: inherit;
      width: min(560px, calc(100vw - 2rem));
    }
    dialog.xt-modal--sm { width: min(380px, calc(100vw - 2rem)); }
    dialog.xt-modal--md { width: min(560px, calc(100vw - 2rem)); }
    dialog.xt-modal--lg { width: min(760px, calc(100vw - 2rem)); }
    dialog.xt-modal::backdrop { background: rgba(10, 37, 64, 0.45); }
    .xt-modal__surface {
      background: var(--surface-card, #fff);
      border: 1px solid var(--border-subtle, #e3e8ee);
      border-radius: var(--xt-r-card, 12px);
      box-shadow: var(--shadow-card, 0 8px 30px rgba(10, 37, 64, 0.18));
      padding: var(--xt-sp-6, 24px);
      max-height: calc(100dvh - 4rem);
      overflow: auto;
    }
    .xt-modal__header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 1rem; margin-bottom: 1rem;
    }
    .xt-modal__title { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .xt-modal__close {
      background: none; border: none; cursor: pointer;
      font-size: 1.5rem; line-height: 1; padding: 0 0.25rem;
      color: var(--text-muted, #6b7280);
    }
    .xt-modal__footer { margin-top: 1.25rem; display: flex; gap: 0.5rem; justify-content: flex-end; }
    .xt-modal__footer:empty { display: none; }
    @media (prefers-reduced-motion: no-preference) {
      dialog.xt-modal[open] { animation: xt-modal-in 150ms ease-out; }
      @keyframes xt-modal-in {
        from { opacity: 0; transform: translateY(4px) scale(0.98); }
        to { opacity: 1; transform: none; }
      }
    }
  `],
})
export class XModalComponent {
  readonly open = model<boolean>(false)
  readonly title = input<string>()
  readonly size = input<'sm' | 'md' | 'lg'>('md')
  readonly dismissable = input<boolean>(true)
  readonly closed = output<void>()

  readonly titleId = `xt-modal-title-${++modalSeq}`

  private readonly dlg = viewChild<ElementRef<HTMLDialogElement>>('dlg')
  private programmaticClose = false

  constructor() {
    effect(() => {
      const el = this.dlg()?.nativeElement
      if (!el) return
      if (this.open()) {
        if (!el.open) el.showModal()
      } else if (el.open) {
        this.programmaticClose = true
        el.close()
      }
    })
  }

  onNativeClose(): void {
    const wasProgrammatic = this.programmaticClose
    this.programmaticClose = false
    if (this.open()) this.open.set(false)
    if (!wasProgrammatic) this.closed.emit()
  }

  onCancel(event: Event): void {
    if (!this.dismissable()) event.preventDefault()
  }

  onDialogClick(event: MouseEvent): void {
    if (this.dismissable() && event.target === this.dlg()?.nativeElement) this.dismiss()
  }

  dismiss(): void {
    if (this.dismissable()) this.dlg()?.nativeElement.close()
  }
}
