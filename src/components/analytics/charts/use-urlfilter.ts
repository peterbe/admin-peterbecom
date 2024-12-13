import { useLocalStorage } from "@mantine/hooks"

export function useURLFilter(
  view: string,
  defaultValue = "",
): [string, (value: string) => void] {
  const [filter, setFilter] = useLocalStorage({
    key: `analytics:urlfilter:${view}`,
    defaultValue: `${defaultValue}`,
  })
  return [filter ? filter : `${defaultValue}`, setFilter]
}
