import { useLocalStorage } from "@mantine/hooks"

export type ByBotChoices = "both" | "bot" | "human"

export function useByBot(
  view: string,
  defaultValue: ByBotChoices = "both",
): [ByBotChoices, (value: ByBotChoices) => void] {
  const [byBot, setByBot] = useLocalStorage<ByBotChoices>({
    key: `analytics:by-bot:${view}`,
    defaultValue,
  })
  return [byBot ? byBot : defaultValue, setByBot]
}
