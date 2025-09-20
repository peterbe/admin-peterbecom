import { Container, Kbd, Text } from "@mantine/core"

export function KeyboardTip() {
  return (
    <Container mb={20}>
      <Text size="sm" ta="right">
        Use <Kbd>⌘</Kbd>-<Kbd>Enter</Kbd> to run the query when focus is inside
        textarea
      </Text>
    </Container>
  )
}
