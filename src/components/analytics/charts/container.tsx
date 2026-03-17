import { Button, Card, SimpleGrid } from "@mantine/core"
import { useContext } from "react"

import { ChartTitle } from "./chart-title"
import { MinimizeContext } from "./minimize-context"
import { RefreshContainerContext } from "./refresh-context"

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
  const { setRefresh } = useContext(RefreshContainerContext)

  const isMinimized = minimized.includes(id) || minimized.length === 0
  return (
    <Card withBorder shadow="md" padding="lg" mt={10} mb={40} id={id}>
      <SimpleGrid cols={2}>
        <ChartTitle id={id} text={title} />
        <div style={{ textAlign: "right" }}>
          {!isMinimized && (
            <Button
              variant="transparent"
              title="Refresh"
              onClick={() => {
                setRefresh(id)
                setTimeout(() => {
                  setRefresh("")
                }, 1000)
              }}
            >
              🔄
            </Button>
          )}
          <Button
            variant="transparent"
            size="xs"
            title={isMinimized ? "expand" : "minimize"}
            onClick={() => {
              toggleMinimized(id)
            }}
          >
            {isMinimized ? "+" : "-"}
          </Button>
        </div>
      </SimpleGrid>

      {!isMinimized && children}
    </Card>
  )
}
