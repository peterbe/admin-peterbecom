import { Code, HoverCard, Text } from "@mantine/core"

import type { QueryResultRowValue } from "../types"

const POSSIBLY_URLS = new Set(["url"])

export function Value({
  value,
  column,
}: {
  value: QueryResultRowValue
  column: string
}) {
  if (value === null) {
    return "null"
  }
  if (
    ["data", "meta"].includes(column) &&
    typeof value === "string" &&
    value.startsWith("{") &&
    value.endsWith("}")
  ) {
    const asString = value
    if (asString.length > 50) {
      return (
        <HoverCard width={680} shadow="md">
          <HoverCard.Target>
            <Text span>{asString}...</Text>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Code block>{JSON.stringify(JSON.parse(value), null, 2)}</Code>
          </HoverCard.Dropdown>
        </HoverCard>
      )
    }

    return asString
  }
  if (typeof value === "number" && Number.isInteger(value) && column !== "id") {
    return value.toLocaleString()
  }

  if (POSSIBLY_URLS.has(column) && value && isValidURL(`${value}`)) {
    return (
      <a href={value.toString()} target="_blank" rel="noopener noreferrer">
        {value.toString()}
      </a>
    )
  }
  return value.toString()
}

function isValidURL(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch (_) {
    return false
  }
}
