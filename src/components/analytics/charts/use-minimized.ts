import { useLocalStorage } from "@mantine/hooks"

export function useMinimized(): [string[], (id: string) => void] {
  const [minimized, setMinimized] = useLocalStorage<string[]>({
    key: "analytics-minimized-charts",
    defaultValue: [],
    serialize: (value) => {
      return JSON.stringify(value)
    },
    deserialize: (localStorageValue) => {
      if (localStorageValue) return JSON.parse(localStorageValue)
      return []
    },
  })

  function toggleMinimized(id: string) {
    setMinimized((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      }
      return [...prev, id]
    })
  }

  return [minimized, toggleMinimized]
}
