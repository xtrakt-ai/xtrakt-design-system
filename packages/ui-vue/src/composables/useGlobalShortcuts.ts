import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Each binding is a "trigger string → handler" pair. Trigger format:
 *
 *   "/"            single key
 *   "Escape"       named key (any KeyboardEvent.key value)
 *   "mod+k"        Cmd on macOS, Ctrl elsewhere — normalized via mod
 *   "shift+/"      modifier+key (alt, ctrl, shift, meta supported)
 *
 * Handlers receive the KeyboardEvent. Return `false` to skip the default
 * preventDefault — by default we preventDefault on a match so the browser
 * doesn't quick-find on `/`. The handler is also skipped automatically when
 * focus is in a text input / textarea / contenteditable, unless the binding
 * uses a modifier (Cmd+K should still work in an input).
 */
export type ShortcutBindings = Record<string, (event: KeyboardEvent) => void | false>

export interface UseGlobalShortcutsOptions {
  /** When true, fire bindings even if focus is inside an editable element.
   *  Default: false (single-key bindings should not steal typing focus). */
  fireInsideInputs?: boolean
}

interface ParsedBinding {
  raw: string
  alt: boolean
  ctrl: boolean
  meta: boolean
  shift: boolean
  hasMod: boolean
  key: string
  handler: (event: KeyboardEvent) => void | false
}

const MODS = new Set(['alt', 'ctrl', 'meta', 'shift', 'mod'])

function parseBinding(raw: string, handler: (event: KeyboardEvent) => void | false): ParsedBinding {
  const parts = raw.toLowerCase().split('+').map(s => s.trim()).filter(Boolean)
  let alt = false, ctrl = false, meta = false, shift = false, hasMod = false
  let key = ''

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform)

  for (const part of parts) {
    if (MODS.has(part)) {
      hasMod = true
      if (part === 'alt') alt = true
      else if (part === 'ctrl') ctrl = true
      else if (part === 'meta') meta = true
      else if (part === 'shift') shift = true
      else if (part === 'mod') { if (isMac) meta = true; else ctrl = true }
    } else {
      key = part
    }
  }
  return { raw, alt, ctrl, meta, shift, hasMod, key, handler }
}

function matches(binding: ParsedBinding, event: KeyboardEvent): boolean {
  if (binding.alt !== event.altKey) return false
  if (binding.ctrl !== event.ctrlKey) return false
  if (binding.meta !== event.metaKey) return false
  if (binding.shift !== event.shiftKey) return false
  return event.key.toLowerCase() === binding.key
}

function isEditableTarget(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null
  if (!target) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

/**
 * Vue composable for declarative global keyboard shortcuts. Auto-installs on
 * mount, auto-cleans on unmount, scoped to the component instance.
 *
 * Usage:
 *
 *   const searchInput = ref<HTMLInputElement | null>(null)
 *   useGlobalShortcuts({
 *     '/': () => searchInput.value?.focus(),
 *     'Escape': () => { search.value = '' },
 *     'mod+k': () => openCommandPalette(),
 *   })
 */
export function useGlobalShortcuts(
  bindings: ShortcutBindings,
  options: UseGlobalShortcutsOptions = {},
): void {
  const parsed: ParsedBinding[] = Object.entries(bindings).map(
    ([raw, handler]) => parseBinding(raw, handler),
  )

  function onKeyDown(event: KeyboardEvent) {
    for (const binding of parsed) {
      if (!matches(binding, event)) continue
      // Single-key bindings (no modifier) skip if focus is in an editable
      // element. Modifier bindings (Cmd+K, etc.) still fire — they're
      // explicit enough not to clash with typing.
      if (!options.fireInsideInputs && !binding.hasMod && isEditableTarget(event)) continue
      const result = binding.handler(event)
      if (result !== false) event.preventDefault()
      return
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
}
