import { shallowRef, computed } from 'vue'

/**
 * Reactive multi-select helper for list views. Caller passes a `keyFn` that
 * extracts a stable, comparable id from each item; the composable tracks the
 * Set of selected keys and exposes the typical helpers a bulk-action UI needs.
 *
 * Usage:
 *
 *   const { selectedKeys, isSelected, toggle, selectAll, clear, count, allSelected }
 *     = useSelection<Ticket>(t => t.ticketId)
 *
 *   <input type="checkbox" :checked="allSelected(tickets)"
 *          @change="e => (e.target as HTMLInputElement).checked
 *            ? selectAll(tickets)
 *            : clear()" />
 *
 *   <input type="checkbox" :checked="isSelected(t)" @change="toggle(t)" />
 *
 *   <XBulkActionBar :count="count">
 *     <button @click="bulkDelete([...selectedKeys])">Delete</button>
 *   </XBulkActionBar>
 */
export function useSelection<T, K = string | number>(keyFn: (item: T) => K) {
  // shallowRef to avoid Vue's deep unwrap mangling K through UnwrapRefSimple.
  // We replace the Set whole on every change anyway, so deep reactivity is
  // unnecessary and would break the K typing.
  const selectedKeys = shallowRef<Set<K>>(new Set<K>())

  function isSelected(item: T): boolean {
    return selectedKeys.value.has(keyFn(item))
  }

  function toggle(item: T): void {
    const k = keyFn(item)
    const next = new Set(selectedKeys.value)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    selectedKeys.value = next
  }

  function selectAll(items: readonly T[]): void {
    selectedKeys.value = new Set(items.map(keyFn))
  }

  function clear(): void {
    selectedKeys.value = new Set()
  }

  function allSelected(items: readonly T[]): boolean {
    if (items.length === 0) return false
    for (const item of items) {
      if (!selectedKeys.value.has(keyFn(item))) return false
    }
    return true
  }

  const count = computed(() => selectedKeys.value.size)

  return {
    selectedKeys,
    isSelected,
    toggle,
    selectAll,
    clear,
    allSelected,
    count,
  }
}
