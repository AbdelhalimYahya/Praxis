export function useLocalStorage<T>(key: string, defaultValue: T) {
  const value = ref<T>(defaultValue)

  if (import.meta.client) {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) value.value = JSON.parse(raw) as T
    } catch {
      // corrupted or inaccessible storage — keep default
    }
  }

  function set(next: T) {
    value.value = next
    if (import.meta.client) {
      window.localStorage.setItem(key, JSON.stringify(next))
    }
  }

  watch(value, (next: T) => set(next), { deep: true })

  return { value, set }
}
