import { Box, SegmentedControl } from "@mantine/core"
import type { ByBotChoices } from "./use-by-bot"

export function ByBotOptions({
  value,
  onChange,
}: {
  value: ByBotChoices
  onChange: (value: ByBotChoices) => void
  range?: number[]
}) {
  // const days = range
  const options: { label: string; value: ByBotChoices }[] = [
    { label: "Both", value: "both" },
    { label: "Bot", value: "bot" },
    { label: "Human", value: "human" },
  ]
  return (
    <Box>
      <SegmentedControl
        value={value}
        onChange={onChange}
        withItemsBorders={false}
        transitionDuration={300}
        transitionTimingFunction="linear"
        data={options}
      />
    </Box>
  )
}
