import { useToast, POSITION } from 'vue-toastification'

// Loosely-typed alias for the toast options bag — vue-toastification's own
// ToastOptions uses bare Function for callbacks and isn't re-exported cleanly
// across its 2.x line. Consumers pass plain object literals; downstream
// validation is the lib's responsibility.
type ToastOpts = Record<string, unknown>

/**
 * Standardized toast wrapper used across xtrakt FEs. Wraps vue-toastification
 * with the platform's defaults: success auto-dismisses in 5s, info in 4s,
 * error stays until the user closes it (and can carry a Retry action).
 *
 * Setup once at app entry:
 *
 *   import Toast from 'vue-toastification'
 *   import 'vue-toastification/dist/index.css'
 *   app.use(Toast, { position: 'top-right' })
 *
 * Then in any component:
 *
 *   const { success, error } = useNotifications()
 *   success('Saved!')
 *   error('Could not save', { retry: () => save() })
 */
export function useNotifications() {
  const toast = useToast()

  const baseOpts: ToastOpts = {
    position: POSITION.TOP_RIGHT,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    closeButton: 'button',
  }

  function success(message: string, opts: ToastOpts = {}) {
    toast.success(message, { ...baseOpts, timeout: 5000, ...opts } as never)
  }

  function info(message: string, opts: ToastOpts = {}) {
    toast.info(message, { ...baseOpts, timeout: 4000, ...opts } as never)
  }

  function warning(message: string, opts: ToastOpts = {}) {
    toast.warning(message, { ...baseOpts, timeout: 6000, ...opts } as never)
  }

  /**
   * Errors stay open until the user dismisses them. Pass `retry` to render a
   * click-to-retry toast that re-runs the failed mutation. If retry throws or
   * rejects, the toast re-emits with "(retry failed)".
   */
  function error(
    message: string,
    opts: ToastOpts & { retry?: () => Promise<void> | void } = {},
  ) {
    const { retry, ...rest } = opts
    if (!retry) {
      toast.error(message, { ...baseOpts, timeout: false, ...rest } as never)
      return
    }

    toast.error(`${message} — click to retry`, {
      ...baseOpts,
      timeout: false,
      ...rest,
      onClick: () => {
        try {
          const result = retry()
          if (result && typeof (result as Promise<void>).then === 'function') {
            ;(result as Promise<void>).catch(() => {
              error(`${message} (retry failed)`, opts)
            })
          }
        } catch {
          error(`${message} (retry failed)`, opts)
        }
      },
    } as never)
  }

  return { success, info, warning, error }
}
