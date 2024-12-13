import { useLocalStorage } from "@mantine/hooks"

export function useURLFilter(
  view: string,
  defaultValue = "",
): [string, (value: string) => void] {
  const [value, setValue] = useLocalStorage({
    key: `analytics:filter:${view}`,
    defaultValue,
  })
  return [value, setValue]
}
