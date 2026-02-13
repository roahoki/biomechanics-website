type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const ensureServerLocalStorage = () => {
  if (typeof globalThis === 'undefined') return

  const maybeLocalStorage = (globalThis as any).localStorage as StorageLike | undefined
  const hasValidApi =
    maybeLocalStorage &&
    typeof maybeLocalStorage.getItem === 'function' &&
    typeof maybeLocalStorage.setItem === 'function' &&
    typeof maybeLocalStorage.removeItem === 'function'

  if (hasValidApi) return

  const store = new Map<string, string>()
  ;(globalThis as any).localStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  } satisfies StorageLike
}

ensureServerLocalStorage()
