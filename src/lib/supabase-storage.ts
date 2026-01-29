type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const createMemoryStorage = (): StorageLike => {
  const store = new Map<string, string>()
  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, value)
    },
    removeItem: (key) => {
      store.delete(key)
    },
  }
}

export const createSafeStorage = (): StorageLike => {
  if (typeof globalThis !== 'undefined') {
    const maybeLocalStorage = (globalThis as any).localStorage as StorageLike | undefined
    if (
      maybeLocalStorage &&
      typeof maybeLocalStorage.getItem === 'function' &&
      typeof maybeLocalStorage.setItem === 'function' &&
      typeof maybeLocalStorage.removeItem === 'function'
    ) {
      return maybeLocalStorage
    }
  }

  return createMemoryStorage()
}
