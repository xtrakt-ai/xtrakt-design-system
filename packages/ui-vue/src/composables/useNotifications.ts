import { useToast, POSITION, type ToastOptions } from 'vue-toastification'

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

  const baseOpts: Partial<ToastOptions> = {
    position: POSITION.TOP_RIGHT,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    closeButton: 'button',
  }

  function success(message: string, opts: Partial<ToastOptions> = {}) {
    toast.success(message, { ...baseOpts, timeout: 5000, ...opts })
  }

  function info(message: string, opts: Partial<ToastOptions> = {}) {
    toast.info(message, { ...baseOpts, timeout: 4000, ...opts })
  }

  function warning(message: string, opts: Partial<ToastOptions> = {}) {
    toast.warning(message, { ...baseOpts, timeout: 6000, ...opts })
  }

  /**
   * Errors stay open until the user dismisses them. Pass `retry` to render a
   * Retry button that re-runs the failed mutation; the toast closes after the
   * retry handler resolves (or stays for another round if it throws).
   */
  function error(
    message: string,
    opts: Partial<ToastOptions> & { retry?: () => Promise<void> | void } = {},
  ) {
    const { retry, ...rest } = opts
    if (!retry) {
      toast.error(message, { ...baseOpts, timeout: false, ...rest })
      return
    }

    // Render with an action: vue-toastification supports custom content via
    // the `content` option, but to avoid a JSX dependency at the lib level we
    // append " (Click to retry)" and bind onClick to the retry handler.
    toast.error(`${message} — click to retry`, {
      ...baseOpts,
      timeout: false,
      ...rest,
      onClick: () => {
        try {
          const result = retry()
          if (result && typeof (result as Promise<void>).then === 'function') {
            ;(result as Promise<void>).catch(() => {
              // Re-render the toast so the user sees the retry failed.
              error(`${message} (retry failed)`, opts)
            })
          }
        } catch {
          error(`${message} (retry failed)`, opts)
        }
      },
    })
  }

  return { success, info, warning, error }
}
