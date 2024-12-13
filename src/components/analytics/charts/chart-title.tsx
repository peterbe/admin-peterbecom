import { Anchor, Title } from "@mantine/core"

export function ChartTitle({ id, text }: { id: string; text: string }) {
  return (
    <Title order={3}>
      <Anchor fz="lg" fw={700} href={`#${id}`}>
        {text}
      </Anchor>
    </Title>
  )
}
