# `<x-modal>` Primitive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a canonical `<x-modal>` primitive (native `<dialog>`-based) to `@xtrakt-ai/ui-angular` and migrate the `device-intelligence` modal in `xtrakt-platform-fe` to use it (XTRAK-112 / D-04).

**Architecture:** `XModalComponent` wraps a real `<dialog>` element; an `effect()` syncs a two-way `open` model to `showModal()`/`close()`; the native `close` event is the single source of truth for dismissal. Optional `title` chrome (header + × + `aria-labelledby`), optional `[x-modal-footer]` slot, `size` presets, `[dismissable]`. Focus-trap / Esc / backdrop / top-layer come free from `<dialog>`.

**Tech stack:** Angular 22 standalone components, signal `input()`/`model()`/`output()`/`viewChild()`/`effect()`; design tokens (`--surface-card`, `--border-subtle`, `--xt-r-card`, `--shadow-card`); Vitest (platform-fe) for the executable specs.

**Cross-repo reality (read first):**
- `@xtrakt-ai/ui-angular` **ships source** (its `build` is a no-op) and has **no test runner** and **zero in-repo specs** — the established convention is that consumers compile and validate the components. Therefore the **executable** x-modal spec lives in `xtrakt-platform-fe` (the only runner that compiles the source), importing `XModalComponent` from `@xtrakt-ai/ui-angular`.
- Publishing is **human-gated**: merging the design-system PR to `main` triggers the `publish-xtrakt-design-system` Cloud Build trigger; every consumer must then bump the pinned `@xtrakt-ai/ui-angular` version (the recurring version-skew risk — XTRAK-124/136/137/197). The agent must **not** publish/merge or finalize the version bump.
- **Local end-to-end verification without publishing:** because the lib ships source, mirror the new `x-modal` source into `xtrakt-platform-fe/src/node_modules/@xtrakt-ai/ui-angular/projects/lib/src/lib/modal/` and add its export to that mirror's `public-api.ts`. This mirror is **temporary and uncommitted** and is reverted at the end (Task 9). The committed dependency remains the published version.

**Branches:** design-system `feat/x-modal-primitive` (already created; spec + this plan committed there). platform-fe: create `feat/xtrak-112-x-modal-device-intelligence` off `origin/main` in Task 5.

---

### Task 1: Write the executable x-modal behavior spec in platform-fe (fails first)

**Files:**
- Create: `xtrakt-platform-fe/src/src/app/admin/x-modal.behavior.spec.ts`

Rationale for location: the design-system has no runner; this spec runs in platform-fe's Vitest against the compiled `@xtrakt-ai/ui-angular` source (the local mirror now, the published version after the bump). It is placed under `admin/` next to the first consumer (`device-intelligence`).

- [ ] **Step 1: Write the failing spec**

```ts
// xtrakt-platform-fe/src/src/app/admin/x-modal.behavior.spec.ts
// Executable spec for the @xtrakt-ai/ui-angular <x-modal> primitive.
// Lives in platform-fe because the design-system ships source with no test runner.
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { XModalComponent } from '@xtrakt-ai/ui-angular';

@Component({
  standalone: true,
  imports: [XModalComponent],
  template: `
    <x-modal [(open)]="open" [title]="title()" [dismissable]="dismissable()" size="sm" (closed)="closedCount = closedCount + 1">
      <p class="body-text">Body</p>
      <div x-modal-footer><button class="footer-btn">Close</button></div>
    </x-modal>
  `,
})
class HostComponent {
  open = signal(false);
  title = signal<string | undefined>(undefined);
  dismissable = signal(true);
  closedCount = 0;
}

function getDialog(fixture: any): HTMLDialogElement {
  return fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
}

// jsdom's <dialog> does not fully implement showModal/close top-layer semantics;
// stub them to toggle the `open` property and dispatch the native events so the
// component's effect + close-event handling can be asserted deterministically.
function stubDialog(dialog: HTMLDialogElement) {
  (dialog as any).showModal = function () { this.open = true; };
  (dialog as any).close = function () { this.open = false; this.dispatchEvent(new Event('close')); };
}

describe('x-modal primitive', () => {
  it('opens the native dialog when open() becomes true', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const dialog = getDialog(fixture);
    stubDialog(dialog);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    expect(dialog.open).toBe(true);
  });

  it('emits (closed) and resets open on native close (user dismiss)', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const dialog = getDialog(fixture);
    stubDialog(dialog);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    dialog.close(); // simulates Esc / × / overlay
    fixture.detectChanges();
    expect(fixture.componentInstance.closedCount).toBe(1);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('does NOT emit (closed) on programmatic close (consumer sets open=false)', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const dialog = getDialog(fixture);
    stubDialog(dialog);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    expect(fixture.componentInstance.closedCount).toBe(0);
  });

  it('renders a header with the title, a wired aria-labelledby, and a × button when dismissable', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.title.set('Device details');
    fixture.detectChanges();
    const dialog = getDialog(fixture);
    const heading = dialog.querySelector('h2') as HTMLElement;
    expect(heading.textContent).toContain('Device details');
    expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(dialog.querySelector('.xt-modal__close')).toBeTruthy();
  });

  it('prevents Esc and hides × when dismissable=false', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.title.set('Locked');
    fixture.componentInstance.dismissable.set(false);
    fixture.detectChanges();
    const dialog = getDialog(fixture);
    expect(dialog.querySelector('.xt-modal__close')).toBeNull();
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
  });

  it('projects body content and footer slot content', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const dialog = getDialog(fixture);
    expect(dialog.querySelector('.body-text')?.textContent).toContain('Body');
    expect(dialog.querySelector('[x-modal-footer] .footer-btn')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails (import cannot resolve `XModalComponent`)**

Run: `cd xtrakt-platform-fe/src && npx ng test --include="src/app/admin/x-modal.behavior.spec.ts"`
Expected: FAIL — `XModalComponent` is not exported by `@xtrakt-ai/ui-angular` (module resolution / undefined import). This is the red state.

Do **not** commit yet (the spec can't compile until the component exists + is mirrored). Commit happens in Task 4 once green.

---

### Task 2: Implement `XModalComponent` in the design-system

**Files:**
- Create: `xtrakt-design-system/packages/ui-angular/projects/lib/src/lib/modal/x-modal.component.ts`

(The design-system has no runner, so there is no red/green loop here — the executable proof is the platform-fe spec in Task 4. Keep the file self-contained.)

- [ ] **Step 1: Write the component**

```ts
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
```

- [ ] **Step 2: Sanity-check the file compiles in isolation (type-only)**

Run: `cd xtrakt-design-system && npx tsc --noEmit --skipLibCheck packages/ui-angular/projects/lib/src/lib/modal/x-modal.component.ts 2>&1 | head`
Expected: no errors originating from `x-modal.component.ts` itself (there may be "cannot find module @angular/core" if the design-system has no node_modules — that is expected and not a code error; the real compile happens in platform-fe in Task 4). If a genuine syntax/type error in the file appears, fix it.

---

### Task 3: Export `XModalComponent` from the design-system public API

**Files:**
- Modify: `xtrakt-design-system/packages/ui-angular/projects/lib/src/public-api.ts`

- [ ] **Step 1: Add the export**

Add this line after the existing card export (keep the D-04 grouping):

```ts
export * from './lib/modal/x-modal.component'
```

- [ ] **Step 2: Verify it's present**

Run: `grep -n "x-modal.component" xtrakt-design-system/packages/ui-angular/projects/lib/src/public-api.ts`
Expected: one line matching `export * from './lib/modal/x-modal.component'`.

---

### Task 4: Mirror into platform-fe node_modules and make the x-modal spec pass

**Files (temporary/uncommitted mirror — reverted in Task 9):**
- Create: `xtrakt-platform-fe/src/node_modules/@xtrakt-ai/ui-angular/projects/lib/src/lib/modal/x-modal.component.ts`
- Modify: `xtrakt-platform-fe/src/node_modules/@xtrakt-ai/ui-angular/projects/lib/src/public-api.ts`

- [ ] **Step 1: Mirror the component + export into the local package**

```bash
DS=/Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-design-system/packages/ui-angular/projects/lib/src
MIRROR=/Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-platform-fe/src/node_modules/@xtrakt-ai/ui-angular/projects/lib/src
mkdir -p "$MIRROR/lib/modal"
cp "$DS/lib/modal/x-modal.component.ts" "$MIRROR/lib/modal/x-modal.component.ts"
# add the export to the mirror's public-api if not already present
grep -q "x-modal.component" "$MIRROR/public-api.ts" || printf "\nexport * from './lib/modal/x-modal.component'\n" >> "$MIRROR/public-api.ts"
grep -c "x-modal" "$MIRROR/public-api.ts"
```
Expected: prints `1` (export present).

- [ ] **Step 2: Run the x-modal spec — now green**

Run: `cd xtrakt-platform-fe/src && npx ng test --include="src/app/admin/x-modal.behavior.spec.ts"`
Expected: PASS — all 6 tests green.

If a test env issue appears (e.g. `showModal is not a function` before the stub is applied): the spec stubs `showModal`/`close` after the first `detectChanges`, so ensure `detectChanges()` runs before `stubDialog`. If the component's `effect` calls `showModal` before the stub, adjust the test to set `open` only after stubbing (already the case). Fix any real assertion mismatch by correcting the component, not by weakening the test.

- [ ] **Step 3: Commit the spec (platform-fe) on a new branch**

```bash
cd /Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-platform-fe
git fetch origin main --quiet
git checkout -b feat/xtrak-112-x-modal-device-intelligence origin/main
git add src/src/app/admin/x-modal.behavior.spec.ts
git commit -m "test(XTRAK-112): x-modal primitive behavior spec (device-intelligence prep)"
```

- [ ] **Step 4: Commit the component + export (design-system)**

```bash
cd /Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-design-system
git add packages/ui-angular/projects/lib/src/lib/modal/x-modal.component.ts packages/ui-angular/projects/lib/src/public-api.ts
git commit -m "feat(x-modal): canonical <x-modal> primitive on native <dialog> (XTRAK-112 D-04)"
```

---

### Task 5: Write the device-intelligence integration spec (fails first)

**Files:**
- Create: `xtrakt-platform-fe/src/src/app/admin/device-intelligence.component.spec.ts`

- [ ] **Step 1: Write the failing integration spec**

```ts
// xtrakt-platform-fe/src/src/app/admin/device-intelligence.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '../../transloco-testing.module';
import { DeviceIntelligenceComponent } from './device-intelligence.component';

// NOTE: if `../../transloco-testing.module` does not exist in this repo, replace the
// import with the project's standard Transloco test harness (search an existing
// admin spec, e.g. `rg "TranslocoTestingModule|getTranslocoModule" src/app -l`).

describe('DeviceIntelligenceComponent modal', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [DeviceIntelligenceComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(DeviceIntelligenceComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders an <x-modal> that is closed when no device is selected', () => {
    const fixture = setup();
    const modal = fixture.nativeElement.querySelector('x-modal');
    expect(modal).toBeTruthy();
    // dialog present but not opened (no selectedDevice)
    const dialog = modal.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);
  });

  it('opens the modal when a device is selected and clears it via (closed)', () => {
    const fixture = setup();
    const comp = fixture.componentInstance as any;
    const dialog = fixture.nativeElement.querySelector('x-modal dialog') as HTMLDialogElement;
    (dialog as any).showModal = function () { this.open = true; };
    (dialog as any).close = function () { this.open = false; this.dispatchEvent(new Event('close')); };

    comp.selectedDevice = { visitorId: 'v1', firstSeen: new Date().toISOString(), lastSeen: new Date().toISOString(), loginCount: 1, failureCount: 0, lastIp: '1.2.3.4', lastCity: 'X', lastCountry: 'Y', lastBrowser: 'Chrome', risk: 'Low' };
    fixture.detectChanges();
    expect(dialog.open).toBe(true);

    dialog.close(); // user dismiss -> (closed) -> closeDetail()
    fixture.detectChanges();
    expect(comp.selectedDevice).toBeNull();
  });

  it('no longer references the removed modal-overlay / modal-card markup', () => {
    const fixture = setup();
    const html = fixture.nativeElement.innerHTML;
    expect(html).not.toContain('modal-overlay');
    expect(html).not.toContain('modal-card');
  });
});
```

- [ ] **Step 2: Run it and confirm failure**

Run: `cd xtrakt-platform-fe/src && npx ng test --include="src/app/admin/device-intelligence.component.spec.ts"`
Expected: FAIL — the template still uses `.modal-overlay`/`.modal-card` and no `<x-modal>` exists yet (assertions fail / `x-modal` not found). If the Transloco import path is wrong, fix it first (see the NOTE), then re-run to reach the real red state.

---

### Task 6: Migrate device-intelligence to `<x-modal>`

**Files:**
- Modify: `xtrakt-platform-fe/src/src/app/admin/device-intelligence.component.html` (lines 73–96 — the modal block)
- Modify: `xtrakt-platform-fe/src/src/app/admin/device-intelligence.component.ts` (imports)
- Modify: `xtrakt-platform-fe/src/src/app/admin/device-intelligence.component.scss` (lines 29–31 — dead surface rules)

- [ ] **Step 1: Replace the modal block in the HTML**

Replace the current block (the `<div class="modal-overlay" *ngIf="selectedDevice" (click)="closeDetail()"> … </div>` spanning lines 73–96) with:

```html
  <x-modal
    [open]="!!selectedDevice"
    (closed)="closeDetail()"
    [title]="t('admin.devices.detail_title')"
    size="sm"
  >
    @if (selectedDevice; as device) {
      <div class="modal-row"><span>{{ t('admin.devices.visitor_id') }}</span><span class="monospace">{{ device.visitorId }}</span></div>
      <div class="modal-row"><span>{{ t('admin.devices.first_seen') }}</span><span>{{ device.firstSeen | date:'medium':undefined:locale }}</span></div>
      <div class="modal-row"><span>{{ t('admin.devices.last_seen') }}</span><span>{{ device.lastSeen | date:'medium':undefined:locale }}</span></div>
      <div class="modal-row"><span>{{ t('admin.devices.total_logins') }}</span><span>{{ device.loginCount }}</span></div>
      <div class="modal-row"><span>{{ t('admin.devices.failures') }}</span><span>{{ device.failureCount }}</span></div>
      <div class="modal-row"><span>{{ t('admin.devices.last_ip') }}</span><span>{{ device.lastIp }}</span></div>
      <div class="modal-row"><span>{{ t('admin.devices.city') }}</span><span>{{ device.lastCity || '—' }}</span></div>
      <div class="modal-row"><span>{{ t('admin.devices.country') }}</span><span>{{ device.lastCountry || '—' }}</span></div>
      <div class="modal-row"><span>{{ t('admin.devices.browser') }}</span><span>{{ device.lastBrowser === 'Other' ? t('admin.devices.browser_other') : device.lastBrowser }}</span></div>
      <div class="modal-row"><span>{{ t('admin.devices.risk') }}</span><x-badge [variant]="riskBadgeVariant(device.risk)">{{ t('admin.devices.risk_value.' + device.risk.toLowerCase()) }}</x-badge></div>
      <div x-modal-footer>
        <x-button variant="secondary" (click)="closeDetail()">{{ 'common.close' | transloco }}</x-button>
      </div>
    }
  </x-modal>
</div>
```

Notes: `selectedDevice` stays the source of truth → one-way `[open]="!!selectedDevice"` + `(closed)="closeDetail()"`. The rows are guarded by `@if (selectedDevice; as device)` because `<x-modal>` (unlike the old `*ngIf` overlay) stays mounted, so the content must tolerate `selectedDevice === null` while closed. The title comes from the `title` input (the old `<h3 transloco>` is gone). The final `</div>` closes the component root (previously the overlay's parent).

- [ ] **Step 2: Update the component imports (TS)**

In `device-intelligence.component.ts`:
- Add `XModalComponent` to the `@xtrakt-ai/ui-angular` import and to the component `imports: [...]` array.
- Remove `XtTrapFocusDirective` — the import line `import { XtTrapFocusDirective } from '../shared/a11y/trap-focus.directive';` and its entry in `imports: [...]` (no longer used; `<x-modal>` handles focus trapping).

Example (adapt to the file's exact existing import line for ui-angular):
```ts
import { XButtonDirective, XButtonComponent, XBadgeComponent, XModalComponent } from '@xtrakt-ai/ui-angular';
// (delete) import { XtTrapFocusDirective } from '../shared/a11y/trap-focus.directive';

@Component({
  // ...
  imports: [
    XButtonDirective, XButtonComponent, /* …existing… */ XBadgeComponent, XModalComponent,
    // (delete) XtTrapFocusDirective,
  ],
})
```
Verify the actual current ui-angular import symbols first with:
`rg "@xtrakt-ai/ui-angular" src/src/app/admin/device-intelligence.component.ts` and keep every symbol already imported, only adding `XModalComponent` and removing `XtTrapFocusDirective`.

- [ ] **Step 3: Remove the dead modal-surface SCSS**

In `device-intelligence.component.scss`, delete these three rules (lines 29–31); **keep** `.modal-row` (line 32 — still used by the projected rows):

```scss
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.3); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-card { padding: 2rem; min-width: 380px; }
.modal-title { font-size: 1.1rem; font-weight: 700; color: var(--xt-fg); margin: 0 0 1.25rem; }
```

Replace them with a one-line note:
```scss
/* D-04: the device-detail modal now uses the canonical <x-modal> primitive; the overlay/card/title surface is provided by the primitive. */
```

- [ ] **Step 4: Run the integration spec — now green**

Run: `cd xtrakt-platform-fe/src && npx ng test --include="src/app/admin/device-intelligence.component.spec.ts"`
Expected: PASS — all three tests green.

- [ ] **Step 5: Commit the migration (platform-fe)**

```bash
cd /Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-platform-fe
git add src/src/app/admin/device-intelligence.component.html src/src/app/admin/device-intelligence.component.ts src/src/app/admin/device-intelligence.component.scss src/src/app/admin/device-intelligence.component.spec.ts
git commit -m "fix(XTRAK-112): migrate device-intelligence modal to <x-modal> (D-04)"
```

---

### Task 7: Full platform-fe verification (build + guards + suite)

**Files:** none (verification only)

- [ ] **Step 1: Run build, the full suite, and all design guards**

```bash
cd /Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-platform-fe/src
bash -c '
set -o pipefail
run(){ echo "== $1 =="; eval "$2" >/tmp/xm_$3.log 2>&1; echo "EXIT[$1]=$?"; }
run build "npm run build" build
run css "npm run lint:css" css
run tlegacy "npm run lint:tokens:legacy" tlegacy
run tneu "npm run lint:tokens:neu" tneu
run hex "npm run lint:hex-regression" hex
run rgba "npm run lint:rgba-regression" rgba
run spacing "npm run lint:spacing" spacing
run i18n "npm run lint:i18n-parity" i18n
run suite "npm test" suite
'
```
Expected: every `EXIT[...]=0`. The full Vitest suite passes (previous baseline 673, now +9 from the two new spec files → ~682). If `lint:tokens:legacy` flags anything, confirm the migration removed (not added) legacy tokens — the modal migration only deletes `--xt-fg` usage.

- [ ] **Step 2: Nothing to commit if clean** (verification task). If a guard required a fix, commit it with `fix(XTRAK-112): <what>` and re-run.

---

### Task 8: Authenticated live QA

**Files:** none (manual/automated browser verification)

- [ ] **Step 1: Bring up the stack**

```bash
cd /Users/carlossouza/Documents/GitHub/xtrakt
./dev.sh start xtrakt-sso-be xtrakt-platform-be
./dev-fe.sh start id-fe
```
Then start platform-fe via the preview tool (`preview_start` "platform-fe") so it serves the migration branch with the node_modules mirror in place. Wait for the bundle to compile.

- [ ] **Step 2: Log in and exercise the modal**

Log in at `http://localhost:4200` as `cflavio@xtrakt.ai` / `Admin@Xtrakt123`. Navigate to the device-intelligence route (`rg "device-intelligence" src/src/app/app.routes.ts` for the exact path). Verify, capturing a screenshot:
- Clicking a device row opens the modal (canonical bordered surface, title header + ×).
- The `×` button, the `Close` footer button, `Esc`, and an overlay (backdrop) click each close the modal and clear the detail.
- Focus is trapped inside the dialog while open (Tab cycles within it) and returns to the trigger on close.

Expected: all behaviors correct; screenshot shows the canonical modal. If the route has no device data locally, at minimum confirm the empty page renders and the `<x-modal>`/`<dialog>` is present and closed (via `preview_eval`), and note the data-gated live view.

- [ ] **Step 3: Tear down**

```bash
cd /Users/carlossouza/Documents/GitHub/xtrakt
./dev-fe.sh stop id-fe
./dev.sh stop xtrakt-sso-be xtrakt-platform-be
# stop the preview server via preview_stop
```

---

### Task 9: PRs, JIRA, and mirror cleanup

**Files:** none (git/PR/ticket + revert the temporary mirror)

- [ ] **Step 1: Revert the temporary node_modules mirror**

```bash
MIRROR=/Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-platform-fe/src/node_modules/@xtrakt-ai/ui-angular/projects/lib/src
rm -rf "$MIRROR/lib/modal"
# restore the mirror's public-api.ts (remove the appended x-modal export line)
cd /Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-platform-fe/src
git -C node_modules 2>/dev/null || true   # node_modules is not a git repo; edit the file directly:
sed -i '' "/x-modal.component/d" "$MIRROR/public-api.ts"
grep -c "x-modal" "$MIRROR/public-api.ts"  # expect 0
```
Rationale: node_modules is not committed; this keeps the local install matching the published package until the real version bump lands.

- [ ] **Step 2: Push both branches**

```bash
cd /Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-design-system && git push -u origin feat/x-modal-primitive
cd /Users/carlossouza/Documents/GitHub/xtrakt/xtrakt-platform-fe && git push -u origin feat/xtrak-112-x-modal-device-intelligence
```

- [ ] **Step 3: Open the design-system PR (NOT merged/published)**

`gh pr create --repo xtrakt-ai/xtrakt-design-system --base main --head feat/x-modal-primitive --title "feat(x-modal): canonical <x-modal> primitive (XTRAK-112 D-04)" --body "<summary + link to the design doc; note it ships source, validated by the platform-fe consumer spec; merging publishes a new @xtrakt-ai/ui-angular version>"`

- [ ] **Step 4: Open the platform-fe PR as DRAFT (blocked on publish)**

`gh pr create --draft --repo xtrakt-ai/xtrakt-platform-fe --base main --head feat/xtrak-112-x-modal-device-intelligence --title "fix(XTRAK-112): migrate device-intelligence modal to <x-modal> (D-04)" --body "<summary; DRAFT: depends on the design-system x-modal PR being merged+published; before un-drafting, bump @xtrakt-ai/ui-angular in src/package.json to the published version and run npm install to sync the lockfile>"`

Do **not** bump `@xtrakt-ai/ui-angular` in `package.json` yet (the version does not exist until publish). The migration code compiles locally against the mirror; CI stays red until the version is published + pinned, which is why the PR is a draft.

- [ ] **Step 5: Comment on XTRAK-112**

Add a `[CLAUDE]` comment summarizing: the `<x-modal>` primitive design + design-system PR (human-gated publish), the platform-fe draft migration PR (blocked on publish + version bump), verification (spec green, build/guards green, live QA), and that this is the final residual card-surface item (the device-intelligence modal). Note the modal is not counted as a `neu-card` card-surface but is closed out via the correct dialog primitive.

---

## Self-Review

- **Spec coverage:** API (Task 2) ✓; native-dialog mechanics + dismissal contract (Task 2 code + Task 1/5 tests) ✓; optional chrome/title/footer/dismissable (Task 2 + Task 1 tests) ✓; token styling (Task 2 styles) ✓; device-intelligence migration (Task 6) ✓; testing — executable in platform-fe per ships-source convention (Tasks 1,4,5,6) ✓; two-PR rollout + publish gate + local mirror (Tasks 4,9) ✓; risks (version skew human-gated, dialog test-env stubs, overlay-click structure) ✓.
- **Placeholder scan:** none — all steps have concrete code/commands. The two adaptation notes (Transloco harness path in Task 5; exact ui-angular import symbols in Task 6) instruct verifying the repo's real value with a given `rg` command rather than leaving a blank.
- **Type consistency:** `open`/`title`/`size`/`dismissable`/`closed`/`titleId`/`dlg`/`programmaticClose` and methods `onNativeClose`/`onCancel`/`onDialogClick`/`dismiss` are consistent between the component (Task 2) and the specs (Tasks 1, 5). The consumer uses one-way `[open]` + `(closed)`, which the two-way `model()` supports.
