# `<x-modal>` design-system primitive — design

**Date:** 2026-07-05
**Driver:** XTRAK-112 (D-04) — the `device-intelligence` `neu-card modal-card` is the last unmigrated card there, but it is a **dialog**, not a content card. `<x-card>` is the wrong primitive (no dialog semantics, focus-trap, or backdrop). This spec adds a canonical `<x-modal>` primitive so the modal migrates correctly.
**Repos:** `xtrakt-design-system` (`@xtrakt-ai/ui-angular`) — the primitive; `xtrakt-platform-fe` — the first consumer.

## Scope (agreed)

Build **one well-designed core primitive** on the native `<dialog>` element, migrate **only** `device-intelligence` in this first cut, and leave broader consolidation as a documented follow-up. platform-fe currently has ~15 modal/dialog implementations across three mechanisms (native `<dialog>`+`showModal()`, `.modal-overlay`+`xtTrapFocus`, ad-hoc `.modal-backdrop`/`.confirm-modal`); `<x-modal>` gives them a single target to migrate to later — but this spec does **not** migrate them.

Non-goals (explicit): no confirm/alert convenience variants, no multi-step/wizard support, no programmatic service API (`ModalService.open(...)`), no stacking-manager for nested modals. YAGNI — add later if a real consumer needs them.

## API — `XModalComponent`

Standalone component, mirrors the `x-card`/`x-button` conventions (signal `input()`/`model()`/`output()`).

```
selector: 'x-modal'

Inputs
  open        model<boolean>(false)        two-way; drives the native dialog
  title       input<string>()              optional header title (auto aria-labelledby)
  size        input<'sm' | 'md' | 'lg'>('md')   max-width preset (sm 380 / md 560 / lg 760 px)
  dismissable input<boolean>(true)         Esc / overlay-click / × enabled

Output
  closed      output<void>()               fires on user-dismiss (Esc / overlay-click / ×)

Content projection
  <ng-content/>                            the body
  <ng-content select="[x-modal-footer]"/>  optional action row (rendered in a footer region)
```

Consumer usage:

```html
<x-modal [(open)]="detailOpen" [title]="t('...')" size="sm">
  <p>body content…</p>
  <div x-modal-footer>
    <x-button variant="secondary" (click)="detailOpen = false">Close</x-button>
  </div>
</x-modal>
```

## Behavior (mechanics)

- **Native `<dialog>`.** The component template renders a real `<dialog>`. An `effect()` syncs `open()` → `showModal()` / `close()` on transitions only.
- **Single source of truth for dismissal = the native `close` event.** When the dialog closes (Esc, `×`, overlay-click, or programmatic), the handler emits `(closed)` and calls `open.set(false)`. This keeps two-way consumers in sync; one-way consumers reset their own source state in `(closed)`. Reacting to the native `close` event (not to the `effect`) is what avoids the "stale `[open]` input immediately reopens the modal" trap.
- **Free from `<dialog>`+`showModal()`:** focus trap, focus restore on close, `aria-modal="true"`, top-layer stacking above all page content, and Esc-to-close. **No `xtTrapFocus` needed.**
- **Overlay-click close:** a `click` whose `event.target` is the `<dialog>` element itself (the `::backdrop` region, not the inner surface) closes it — only when `dismissable()`. Implemented by giving the `<dialog>` zero padding and putting the visible surface in an inner wrapper, so backdrop clicks land on the dialog element and content clicks land on the wrapper.
- **`dismissable = false`:** the `cancel` event is `preventDefault`-ed (blocks Esc), overlay-click is ignored, and the `×` button is not rendered — for flows that must not be dismissed accidentally.
- **`title` set:** renders a `<header>` with an `<h2 [id]>` wired to the dialog via `aria-labelledby`, plus a `×` close button (when `dismissable`). Omitted → bare surface; the consumer projects its own header.

## Styling (design tokens)

- Inner surface reuses the canonical card tokens: `background: var(--surface-card)`, `border: 1px solid var(--border-subtle)`, `border-radius: var(--xt-r-card)`, `box-shadow: var(--shadow-card)`, `padding: var(--xt-sp-6, 24px)`. Each token has a hard-coded fallback (the lib ships source; consumers may not define every var) — consistent with `x-card`.
- Backdrop: `dialog::backdrop { background: rgba(10, 37, 64, 0.45) }`.
- Sizing: `width: min(<size>, calc(100vw - 2rem))`; `max-height: calc(100dvh - 4rem)` with `overflow: auto` on the body region so long content scrolls inside the modal.
- `@media (prefers-reduced-motion: no-preference)` gates the open transition (subtle fade/scale); reduced-motion users get an instant open.
- No raw hex outside the documented token fallbacks (the design-system's own conventions).

## Files / units (isolation)

- **`packages/ui-angular/projects/lib/src/lib/modal/x-modal.component.ts`** — the primitive. One self-contained file: template (`<dialog>` + optional header + body + footer), styles, and the `effect()`/close-event logic. Understandable and testable without touching consumers.
- **`packages/ui-angular/projects/lib/src/lib/modal/x-modal.component.spec.ts`** — unit spec.
- **`packages/ui-angular/projects/lib/src/public-api.ts`** — add `export * from './lib/modal/x-modal.component'`.
- **Consumer:** `xtrakt-platform-fe/src/src/app/admin/device-intelligence.component.{html,ts,scss}`.

## Testing

**Design-system unit spec (`x-modal.component.spec.ts`):**
1. `open` false→true calls `showModal()`; true→false calls `close()`.
2. Native `close` event → emits `(closed)` once and sets `open()` to `false`.
3. `dismissable=false` → `cancel` event is prevented (Esc does not close); no `×` rendered.
4. `title` set → a header with the title text and an `id` referenced by the dialog's `aria-labelledby`; `×` present when dismissable.
5. Footer projection: `[x-modal-footer]` content renders in the footer region; default content renders in the body.
6. Overlay behavior can be asserted via a synthetic click with `target === dialog` closing it when dismissable.

(Note: JSDOM/happy-dom under the design-system's test runner may not implement `HTMLDialogElement.showModal()`; the spec stubs `showModal`/`close` on the element where needed and asserts calls + the `open` attribute, rather than real top-layer behavior.)

**Consumer (`device-intelligence`):** update its existing spec to the new markup (assert the `<x-modal>` renders and the detail rows project; assert `(closed)` calls `closeDetail()`); plus authenticated live QA (local stack) — open a device row, confirm the modal opens, and Esc / overlay-click / `×` each close it and clear `selectedDevice`.

## Rollout — two PRs, publish gate explicit

The design-system **ships source** (its `build` script is a no-op: "ui-angular ships source"). Consumers compile it. Publishing a new `@xtrakt-ai/ui-angular` version happens on merge to `xtrakt-design-system` main via the `publish-xtrakt-design-system` Cloud Build trigger, and every consumer must then bump the pinned version. This is the recurring shared-package version-skew risk (XTRAK-124 / 136 / 137 / 197) and is **human-coordinated**.

1. **design-system PR** (`feat/x-modal-primitive`) — adds `XModalComponent` + spec + public-API export + this design doc. **Not merged, not published by the agent.**
2. **platform-fe PR** — migrates `device-intelligence` and bumps `@xtrakt-ai/ui-angular` to the newly published version. **Depends on #1 being published**, so it is opened as **draft/blocked** and only finalized after a human merges #1 and the new version is published.

**Local end-to-end verification without publishing:** because ui-angular ships source, mirror the new `x-modal` source into platform-fe's local `node_modules/@xtrakt-ai/ui-angular/projects/lib/src/lib/modal/` (temporary, uncommitted) and add the export to the local `node_modules` `public-api.ts`, then build + live-QA `device-intelligence`. Revert the `node_modules` mirror afterward; the committed dependency remains the published version.

## Risks & mitigations

- **Version skew** (primary): mitigated by the human-gated publish + the draft platform-fe PR; do not bump consumers until the version is actually published.
- **`<dialog>` test-env gaps**: mitigated by stubbing `showModal`/`close` in specs.
- **Overlay-click false positives** (clicks inside content bubbling to the dialog): mitigated by the zero-padding-dialog + inner-surface-wrapper structure so `event.target === dialog` is true only for genuine backdrop clicks.
- **Broader modal fragmentation** stays out of scope; the primitive is designed to be their future target but no other modal is touched here.
