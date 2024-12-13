import { useLocalStorage } from "@mantine/hooks"

export function useInterval(
  view: string,
  defaultValue = 7,
): [string, (value: string) => void] {
  const [intervalDays, setIntervalDays] = useLocalStorage({
    key: `analytics:interval:${view}`,
    defaultValue: `${defaultValue}`,
  })
  return [intervalDays ? intervalDays : `${defaultValue}`, setIntervalDays]
}
