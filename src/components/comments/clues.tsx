import { Badge, Box, Group, Text } from "@mantine/core"
import type { Clues } from "./types"

export function DisplayClues({ clues }: { clues: Clues }) {
  if (!clues) return null
  if (
    Object.keys(clues.bad).length === 0 &&
    Object.keys(clues.good).length === 0
  ) {
    return null
  }

  return (
    <Box pl={54} mt={10}>
      <Group>
        <Text size="sm" fw={500}>
          Clues:
        </Text>
        {Object.entries(clues.good).map(([key, value]) => {
          return (
            <Badge
              key={`${key}${value}`}
              color="green"
              style={{ textTransform: "none" }}
            >
              {value}
            </Badge>
          )
        })}
        {Object.entries(clues.bad).map(([key, value]) => {
          return (
            <Badge
              key={`${key}${value}`}
              color="red"
              style={{ textTransform: "none" }}
            >
              {value}
            </Badge>
          )
        })}
      </Group>
    </Box>
  )
}
