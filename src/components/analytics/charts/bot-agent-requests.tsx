import { Box, Grid, Table, Text } from "@mantine/core"
import { useState } from "react"
import type { QueryResultRow } from "../types"
import { DisplayError, DisplayWarning } from "./alerts"
import { ChartContainer } from "./container"
import { createdRange } from "./created-range"
import { IntervalOptions } from "./interval-options"
import { Loading } from "./loading"
import { RowsOptions } from "./rows-options"
import { useInterval } from "./use-interval"
import { type QueryOptions, useSQLQuery } from "./use-query"
import { useRows } from "./use-rows"

const sqlQueryStatusCode = ({ limit = 200, days = 30, back = 0 } = {}) => `
SELECT meta->>'botAgent' AS agent, status_code, COUNT(*) as count
FROM requestlog
WHERE
    ${createdRange(days, back)}
    AND (meta->'isbot')::BOOLEAN
    AND (meta->>'botAgent') IS NOT NULL
GROUP BY meta->>'botAgent', status_code
ORDER BY 3 DESC
LIMIT ${Number(limit)}
`
const sqlQuery = ({
  limit = 200,
  days = 30,
  back = 0,
  groupBy = "meta->>'botAgent'",
} = {}) => `
SELECT meta->>'botAgent' AS agent, count(${groupBy}) as count
FROM requestlog
WHERE
    ${createdRange(days, back)}
    AND (meta->'isbot')::BOOLEAN
    AND (meta->>'botAgent') IS NOT NULL
GROUP BY ${groupBy}
ORDER BY 2 DESC
LIMIT ${Number(limit)}
`

const ID = "bot-agent-requests"

export function BotAgentRequests() {
  return (
    <ChartContainer id={ID} title="Bot Agent Requests">
      <Inner />
    </ChartContainer>
  )
}
function Inner() {
  const useQuery = (sql: string, options?: QueryOptions) =>
    useSQLQuery(sql, { prefix: ID, ...options })

  const [intervalDays, setIntervalDays] = useInterval(ID)
  const [rows, setRows] = useRows(ID, 10)
  const current = useQuery(
    sqlQuery({ limit: Number(rows), days: Number(intervalDays) }),
  )

  const statusCodes = useQuery(
    sqlQueryStatusCode({
      limit: 300,
      days: Number(intervalDays),
    }),
  )
  console.log(statusCodes.data?.rows)

  const past = useQuery(
    sqlQuery({
      limit: Number(rows),
      days: Number(intervalDays) * 2,
      back: Number(intervalDays),
    }),
  )

  return (
    <>
      <Box pos="relative" mt={25} mb={50}>
        <Loading visible={current.isLoading || past.isLoading} />

        {current.data && past.data && statusCodes.data && (
          <AgentsTable
            rows={current.data.rows}
            previous={past.data.rows}
            statusCodes={statusCodes.data.rows}
          />
        )}
      </Box>
      <Grid>
        <Grid.Col span={4}>
          <IntervalOptions value={intervalDays} onChange={setIntervalDays} />
        </Grid.Col>
        <Grid.Col span={4}>
          <RowsOptions value={rows} onChange={setRows} range={[10, 25, 100]} />
        </Grid.Col>
      </Grid>

      <DisplayError error={current.error || past.error} />
    </>
  )
}

function AgentsTable({
  rows,
  previous,
  statusCodes,
}: {
  rows: QueryResultRow[]
  previous: QueryResultRow[]
  statusCodes: QueryResultRow[]
}) {
  const codes: Record<string, Record<string, number>> = {}
  for (const row of statusCodes) {
    const agent = row.agent as string
    const status_code = String(row.status_code)
    if (!(agent in codes)) {
      codes[agent] = {}
    }
    codes[agent][status_code] = row.count as number
  }

  type Sorts = "percent" | "count" | "agent"
  const [sortBy, setSortBy] = useState<Sorts>("percent")
  const [sortReverse, setSortReverse] = useState(false)
  const hash = new Map<string, number>(
    previous.map((row) => {
      return [row.agent as string, row.count as number]
    }),
  )
  const combined = rows
    .map((row) => {
      const count = row.count as number
      const previous = hash.get(row.agent as string) || 0
      const delta = count - previous
      const percent = (100 * delta) / count
      return { agent: row.agent as string, count, previous, delta, percent }
    })
    .sort(
      (a, b) =>
        (sortReverse ? -1 : 1) *
        (sortBy === "agent"
          ? a.agent.localeCompare(b.agent)
          : b[sortBy] - a[sortBy]),
    )

  const numberFormat = new Intl.NumberFormat("en-US")

  function changeSort(sort: Sorts) {
    if (sort === sortBy) {
      setSortReverse((prev) => !prev)
    } else {
      setSortBy(sort)
      setSortReverse(false)
    }
  }

  if (rows.length === 0) {
    return (
      <DisplayWarning warning="No data points">
        There are no data points left to display. ({rows.length} rows)
      </DisplayWarning>
    )
  }

  return (
    <Table mb={30}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th onClick={() => changeSort("agent")}>Bot Agent</Table.Th>
          <Table.Th>Status codes</Table.Th>
          <Table.Th
            style={{ textAlign: "right" }}
            onClick={() => changeSort("count")}
          >
            Count
          </Table.Th>
          <Table.Th
            style={{ textAlign: "right" }}
            onClick={() => changeSort("percent")}
          >
            Increase
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {combined.map((row) => {
          return (
            <Table.Tr key={row.agent}>
              <Table.Td>{row.agent}</Table.Td>
              <Table.Td>
                <StatusCodes codes={codes[row.agent]} />
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {numberFormat.format(row.count)}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <span style={{ color: row.delta > 0 ? "green" : "red" }}>
                  {row.percent.toFixed(0)}%
                </span>
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}

function StatusCodes({ codes }: { codes: Record<string, number> | undefined }) {
  if (!codes) return null

  const total = Object.values(codes).reduce((a, b) => a + b, 0)
  const flat = Object.entries(codes).sort((a, b) => b[1] - a[1])
  const parts: string[] = []
  for (const [code, count] of flat.slice(0, 3)) {
    parts.push(`${((100 * count) / total).toFixed(0)}% ${code}`)
  }
  return (
    <Text size="xs">
      {parts.map((part) => (
        <Text span key={part} style={{ marginRight: 15 }}>
          {part}
        </Text>
      ))}
    </Text>
  )
}
