import { useLocalStorage } from "@mantine/hooks"

export function useRows(
  view: string,
  defaultValue = 7,
): [string, (value: string) => void] {
  const [intervalDays, setIntervalDays] = useLocalStorage({
    key: `analytics:rows:${view}`,
    defaultValue: `${defaultValue}`,
  })
  return [intervalDays ? intervalDays : `${defaultValue}`, setIntervalDays]
}
