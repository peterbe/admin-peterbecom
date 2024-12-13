import { Table, Text } from "@mantine/core"
import { memo } from "react"

import { Link } from "react-router"
import type { QueryResultRow } from "../types"
import { Value } from "./value"

export const Rows = memo(function Rows({ data }: { data: QueryResultRow[] }) {
  if (data.length === 0) {
    return <Text>No rows to show.</Text>
  }

  const first = data[0]
  const keys = Object.keys(first)
  const prefix = keys.join("")

  let chartable = false
  let firstIsString: null | boolean = null
  for (const key of keys) {
    if (firstIsString === null) {
      firstIsString = typeof first[key] === "string"
    } else if (firstIsString) {
      if (typeof first[key] === "number") {
        chartable = true
        break
      }
    }
  }

  return (
    <div>
      {chartable && (
        <div>
          Turn into{" "}
          <Link to={`?${new URLSearchParams({ chart: "bar" })}`}>
            bar chart
          </Link>
          ,{" "}
          <Link to={`?${new URLSearchParams({ chart: "line" })}`}>
            line chart
          </Link>
          ,{" "}
          <Link to={`?${new URLSearchParams({ chart: "pie" })}`}>
            pie chart
          </Link>
        </div>
      )}
      <Table highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th> </Table.Th>
            {keys.map((key) => (
              <Table.Th key={key}>{key}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows don't have a predictable ID
            <Table.Tr key={`${prefix}${i}`} id={`r${i + 1}`}>
              <Table.Td>
                <a href={`#r${i + 1}`}>{i + 1}</a>
              </Table.Td>
              {keys.map((key, j) => {
                const value = row[key]
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: rows don't have a predictable ID
                  <Table.Td key={`${key}${j}`}>
                    <Text size="xs">
                      <Value value={value} column={key} />
                    </Text>
                  </Table.Td>
                )
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  )
})
