import { Button, Card, SimpleGrid } from "@mantine/core"
import { useContext } from "react"

import { ChartTitle } from "./chart-title"
import { MinimizeContext } from "./minimize-context"

export function ChartContainer({
  children,
  id,
  title,
}: {
  children: React.ReactNode
  id: string
  title: string
}) {
  const { minimized, toggleMinimized } = useContext(MinimizeContext)
  return (
    <Card withBorder shadow="md" padding="lg" mt={10} mb={40} id={id}>
      <SimpleGrid cols={2}>
        <ChartTitle id={id} text={title} />
        <div style={{ textAlign: "right" }}>
          <Button
            variant="transparent"
            size="xs"
            title={minimized.includes(id) ? "expand" : "minimize"}
            onClick={() => {
              toggleMinimized(id)
            }}
          >
            {minimized.includes(id) ? "+" : "-"}
          </Button>
        </div>
      </SimpleGrid>

      {!minimized.includes(id) && children}
    </Card>
  )
}
