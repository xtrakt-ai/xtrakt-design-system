/**
 * Optimistic UI helper. Apply the visible change immediately, fire the API
 * call, and roll back the change if the request fails.
 *
 * Usage — ticket reply with a temp message:
 *
 *   const { withOptimistic } = useOptimistic()
 *
 *   const tempMsg = { id: -1, text, pending: true }
 *
 *   try {
 *     const saved = await withOptimistic({
 *       apply:    () => messages.value.push(tempMsg),
 *       rollback: () => {
 *         const i = messages.value.indexOf(tempMsg)
 *         if (i !== -1) messages.value.splice(i, 1)
 *       },
 *       request:  () => api.post('/tickets/' + id + '/messages', { text }),
 *     })
 *     tempMsg.id = saved.id
 *     tempMsg.pending = false
 *   } catch (err) {
 *     notify.error('Failed to send', { retry: () => /* re-run *\/ })
 *   }
 *
 * The composable is intentionally thin — three callbacks, no state. All mutation
 * lives in the caller's reactive sources, so existing patterns (refs, reactive
 * objects, pinia stores) just work.
 */

export interface OptimisticOptions<T> {
  /** Run synchronously BEFORE the request fires. Mutate caller state here. */
  apply: () => void
  /** Run synchronously if the request rejects. Undo the mutation. */
  rollback: () => void
  /** The actual API call. Its resolved value is returned to the caller. */
  request: () => Promise<T>
}

export function useOptimistic() {
  async function withOptimistic<T>(opts: OptimisticOptions<T>): Promise<T> {
    opts.apply()
    try {
      return await opts.request()
    } catch (err) {
      opts.rollback()
      throw err
    }
  }

  return { withOptimistic }
}
