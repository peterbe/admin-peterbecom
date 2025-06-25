import { useLocalStorage } from "@mantine/hooks"

export function useDisplayType(id: string, defaultValue: string | number = "") {
  return useLocalStorage({
    key: `analytics:displaytype:${id}`,
    defaultValue: `${defaultValue}`,
  })
}
