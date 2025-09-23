import { Kbd, Text } from "@mantine/core"

export function KeyboardTip() {
  return (
    <Text size="sm" ta="right">
      <b>Tip!</b> Use <Kbd>⌘</Kbd>-<Kbd>Enter</Kbd> to run the query when focus
      is inside textarea
    </Text>
  )
}
