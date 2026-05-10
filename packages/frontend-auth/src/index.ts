export const XTRAKT_SESSION_HINT_COOKIE = 'xtrakt_session_present'
export const XTRAKT_CSRF_COOKIE = 'xtrakt_csrf'
export const XTRAKT_CSRF_HEADER = 'X-Xtrakt-CSRF'

const LEGACY_AUTH_STORAGE_KEYS = [
  'access_token',
  'auth_token',
  'id_token',
  'platform_token',
  'refresh_token',
  'sso_token',
  'token',
  'xtrakt_auth_token',
]

export interface BrowserStorageLike {
  removeItem(key: string): void
}

export interface CookieAuthOptions {
  csrfCookieName?: string
  csrfHeaderName?: string
  sessionHintCookieName?: string
}

export function readCookie(name: string, cookie = globalThis.document?.cookie ?? ''): string | null {
  const prefix = `${encodeURIComponent(name)}=`
  const value = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  return value ? decodeURIComponent(value.slice(prefix.length)) : null
}

export function hasSessionHint(options: CookieAuthOptions = {}): boolean {
  return readCookie(options.sessionHintCookieName ?? XTRAKT_SESSION_HINT_COOKIE) === '1'
}

export function readCsrfToken(options: CookieAuthOptions = {}): string | null {
  return readCookie(options.csrfCookieName ?? XTRAKT_CSRF_COOKIE)
}

export function clearLegacyAuthStorage(
  storages: BrowserStorageLike[] = [globalThis.sessionStorage, globalThis.localStorage].filter(Boolean),
  extraKeys: string[] = [],
): void {
  for (const storage of storages) {
    for (const key of [...LEGACY_AUTH_STORAGE_KEYS, ...extraKeys]) {
      storage.removeItem(key)
    }
  }
}

export function createCredentialedFetchInit(
  init: RequestInit = {},
  options: CookieAuthOptions = {},
): RequestInit {
  const csrfToken = readCsrfToken(options)
  const headers = new Headers(init.headers)

  if (csrfToken) {
    headers.set(options.csrfHeaderName ?? XTRAKT_CSRF_HEADER, csrfToken)
  }

  return {
    ...init,
    credentials: init.credentials ?? 'include',
    headers,
  }
}

export function createApiUrl(baseUrl: string, path: string): string {
  return new URL(path.replace(/^\/+/, ''), ensureTrailingSlash(baseUrl)).toString()
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`
}
