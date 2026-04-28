import { computed, type ComputedRef } from 'vue'

/**
 * Caller-supplied resolver: returns the current user's role(s) and explicit
 * permission strings. May return null while auth is unresolved (e.g. during
 * cookie hydration before /me responds). When null, every check returns false.
 *
 * `roles` is plural to support FEs that grant multiple roles per user; pass
 * a single string and the composable will treat it as a one-element array.
 */
export interface AuthResolver {
  (): {
    roles?: string | string[] | null
    permissions?: readonly string[] | null
  } | null
}

export interface UseCanOptions {
  /**
   * Map a permission string to the roles that imply it. Lets FEs define
   * `can('ticket.bulk-close')` without round-tripping the BE for an explicit
   * grant. Optional — if omitted, only explicit permission strings match.
   *
   *   roleGrants: { admin: ['*'], agent: ['ticket.create', 'ticket.bulk-close'] }
   *
   * `'*'` is a wildcard meaning "any permission". Use sparingly.
   */
  roleGrants?: Record<string, readonly string[]>
}

/**
 * Permission/role checker for Vue 3 FEs. Auth shape varies across the xtrakt
 * monorepo (some FEs expose role from a login response, others rely on cookie
 * hydration via /me, others have nothing yet). Rather than couple ui-vue to
 * any one auth model, the composable accepts a resolver from the caller.
 *
 * Usage in a tickets-fe component:
 *
 *   import { useCan } from '@xtrakt-ai/ui-vue'
 *   import { useAuth } from '@/composables/useAuth'
 *
 *   const { user } = useAuth()
 *   const { can, hasRole } = useCan(
 *     () => user.value ? { roles: user.value.role } : null,
 *     { roleGrants: { admin: ['*'], agent: ['ticket.bulk-close'] } }
 *   )
 *
 *   <button v-if="can('ticket.bulk-close')">Close selected</button>
 *   <RouterLink v-if="hasRole('admin')" to="/settings">Settings</RouterLink>
 *
 * Returns plain functions (not computed) so callers can invoke them inside
 * v-if without triggering re-render churn. The resolver is wrapped in a
 * computed under the hood so reactive role changes still propagate.
 */
export function useCan(resolver: AuthResolver, options: UseCanOptions = {}) {
  const grants = options.roleGrants ?? {}

  // Wrap the resolver in a computed so role/permission changes trigger
  // re-evaluation of can()/hasRole() call sites. Caller's resolver is
  // expected to read reactive state (refs, etc.) — the computed picks
  // up those deps automatically.
  const auth: ComputedRef<{ roles: string[]; permissions: readonly string[] }> = computed(() => {
    const resolved = resolver()
    if (!resolved) return { roles: [], permissions: [] }
    const rolesRaw = resolved.roles
    const roles: string[] = rolesRaw == null
      ? []
      : Array.isArray(rolesRaw)
        ? rolesRaw.filter(r => typeof r === 'string' && r.length > 0)
        : (typeof rolesRaw === 'string' && rolesRaw.length > 0 ? [rolesRaw] : [])
    const permissions = resolved.permissions ?? []
    return { roles, permissions }
  })

  function hasRole(role: string): boolean {
    return auth.value.roles.includes(role)
  }

  function hasAnyRole(...roles: readonly string[]): boolean {
    return roles.some(r => auth.value.roles.includes(r))
  }

  function can(permission: string): boolean {
    if (!permission) return false
    const { roles, permissions } = auth.value
    if (permissions.includes(permission)) return true
    for (const role of roles) {
      const granted = grants[role]
      if (!granted) continue
      if (granted.includes('*') || granted.includes(permission)) return true
    }
    return false
  }

  /** Authenticated = any role or any explicit permission resolved. */
  const isAuthenticated = computed(
    () => auth.value.roles.length > 0 || auth.value.permissions.length > 0,
  )

  return { can, hasRole, hasAnyRole, isAuthenticated }
}
